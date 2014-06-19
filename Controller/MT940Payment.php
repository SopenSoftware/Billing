<?php
/**
 *
 * Controller MT940Payment
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2012)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_MT940Payment extends Tinebase_Controller_Record_Abstract
{
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;

	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_backend = new Billing_Backend_MT940Payment();
		$this->_modelName = 'Billing_Model_MT940Payment';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
	}

	private static $_instance = NULL;

	/**
	 * the singleton pattern
	 *
	 * @return SoEventManager_Controller_SoEvent
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}

	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	protected function _inspectCreate(Tinebase_Record_Interface $_record)
	{
		//$_record->__set('job_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('job_nr'));
	}

	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	protected function _inspectUpdate(Tinebase_Record_Interface $_record)
	{
		$debitor = $_record->getForeignRecordBreakNull('debitor_id', Billing_Controller_Debitor::getInstance());
		
		if($_record->__get('is_return_debit') && $_record->__get('state') != 'GREEN'){
			if($_record->getForeignId('debitor_id')){
				
				$debitorId = $_record->getForeignId('debitor_id');
				$amount = $_record->__get('payment_amount');
				$returnDebitFee = $_record->__get('return_inquiry_fee');
				
				try{
					$toReturnPayment = Billing_Controller_Payment::getInstance()->getDebitToReturn(
						$debitorId,
						$amount,
						$returnDebitFee,
			            'DEBIT'
			        );
			        $returnPaymentId = $toReturnPayment->getId();
	
			        if($returnPaymentId && $debitorId && ($toReturnPayment->__get('is_cancelled') == false)){
			        	$_record->__set('state', 'GREEN');
			        	$_record->__set('return_debit_base_payment_id', $returnPaymentId);
			        }
			        
			        
			        return;
			            		 
				}catch(Exception $e){
					$returnPaymentId = null;
				}
			}
		}
		
		if($_record->__get('is_return_debit')){
			return;
		}
		
		if($debitor && $_record->__get('state') != 'GREEN'){
			$_record->__set('state', 'ORANGE');
		}

		
			
		$op = $_record->getForeignRecordBreakNull('op_id', Billing_Controller_OpenItem::getInstance());



		if($op){
			$_record->__set('state', 'GREEN');
		}else{
			if($debitor){
				$openItems = Billing_Controller_OpenItem::getInstance()->getByDebitor($debitor->getId());
				$openItem = $openItems->getFirstRecord();
				if($openItem){
					$openItemId = $openItem->getId();
		
					$opAmount = $openItem->__get('open_sum');
		
					if(abs($amount)>abs($opAmount)){
						$overpay = abs($amount) - abs($opAmount);
					}
		
					if($overpay==0){
						$_record->__set('state', 'GREEN');
					}
					
				
				}else{
					if($_record->__get('overpay') == 'DONATION'){
						$_record->__set('state', 'GREEN');
					}
				}
			}
			
			// means there are multiple assigned within GUI
			if($_record->hasMultipleOpenItems()){
				$_record->__set('state', 'GREEN');
			}
		}
		 
		//$_record->__set('job_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('job_nr'));
	}

	/**
	 * Get empty record
	 * @return Billing_Model_MT940Payment
	 */
	public function getEmptyMT940Payment(){
		$emptyMT940Payment = new Billing_Model_MT940Payment(null,true);
		return $emptyMT940Payment;
	}

	public function bookSelected($ids){
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		$tId = $tm->startTransaction($db);
		
		try{
		
			if(!is_array($ids)){
				$ids = Zend_Json::decode($ids);
			}
			
			$books = array();
			$bookedIds = array();
			
			foreach($ids as $id){
				$payment = $this->get($id);
				if($payment->__get('state') == 'GREEN' || $payment->__get('state') == 'ORANGE'){
					$books[] = $payment;
					$bookedIds[] = $id;
				}
			}
			
			$this->bookPayments($books);
		
			$this->delete($bookedIds);
			
		//	print_r($bookedIds);
//			throw new Exception('deacivated for test');
			
			
			$tm->commitTransaction($tId);
	    			
	    		return array(
				'success' => true,
				'result' => $ids
	    		);
			
	    		
		}catch(Exception $e){
			
			$tm->rollback($tId);
			
			return array(
				'success' => false,
				'debitor' => null, 
				'result' => null,
				'errorInfo' => $e->getTrace(),
				'errorMessage' => $e->getMessage()
			);
		}
	}
	
	public function bookGreen(){
		set_time_limit(0);
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		$tId = $tm->startTransaction($db);
		
		try{
		
			$filters = array();
			$filters[] = array(
				'field' => 'state',
				'operator' => 'equals',
				'value' => 'GREEN'
			);
			$filter = new Billing_Model_MT940PaymentFilter($filters,'AND');
			$paging = new Tinebase_Model_Pagination();

			$payments = $this->search($filter, $paging);

			$ids = $payments->getArrayOfIds();
			
			$this->bookPayments($payments);
		
			$this->delete($ids);
			
			
			$tm->commitTransaction($tId);
	    			
	    		return array(
				'success' => true,
				'result' => $ids
	    		);
			
	    		
		}catch(Exception $e){
			
			$tm->rollback($tId);
			
			return array(
				'success' => false,
				'debitor' => null, 
				'result' => null,
				'errorInfo' => $e->getTrace(),
				'errorMessage' => $e->getMessage()
			);
		}

	}

	public function bookOrange(){
		set_time_limit(0);
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		$tId = $tm->startTransaction($db);
		
		try{
			$filters = array();
			$filters[] = array(
				'field' => 'state',
				'operator' => 'not',
				'value' => 'RED'
			);
			$filter = new Billing_Model_MT940PaymentFilter($filters,'AND');
			$paging = new Tinebase_Model_Pagination();

			$payments = $this->search($filter, $paging);

				$ids = $payments->getArrayOfIds();
			
			$this->bookPayments($payments);
		
			$this->delete($ids);
			
			
			$tm->commitTransaction($tId);
	    			
	    		return array(
				'success' => true,
				'result' => $ids
	    		);
			
	    		
		}catch(Exception $e){
			
			$tm->rollback($tId);
			
			return array(
				'success' => false,
				'debitor' => null, 
				'result' => null,
				'errorInfo' => $e->getTrace(),
				'errorMessage' => $e->getMessage()
			);
		}
	}

	public function bookPayments($payments){
		
		//throw new Zend_Exception('Temporarily disabled');
		
		foreach($payments as $payment){
			if($payment->hasAdditionalItem('donation')){
				$donationData = $payment->getAdditionalItem('donation');
			}else{
				$donationData = null;
			}
			if($payment->hasMultipleOpenItems()){
				$additionalData = $payment->getAdditionalData();
				
				if($payment->hasAdditionalItem('openItems')){
					
					$data = $payment->getAdditionalItem('openItems');
					$donationData = $payment->getAdditionalItem('donation');
					$payment->flatten();
					
					$paymentRecord = $payment->toArray(); 
					$paymentRecord['amount'] = $paymentRecord['payment_amount'];
					Billing_Controller_OpenItem::getInstance()->payOpenItems($data, $paymentRecord, $donationData);
					
				}
				
			}else{
				
				$pExtract = clone $payment;
				$pExtract->flatten();
				
				$paymentRecord = $pExtract->toArray(); 
				
				
				
				$paymentO = Billing_Controller_Payment::getInstance()->getEmptyPayment();
				if(array_key_exists('id', $paymentRecord)){
					unset($paymentRecord['id']);
				}
				$paymentO->setFromArray($paymentRecord);
				$paymentO->__set('amount', $payment->__get('payment_amount'));
				
				$openItem = $payment->getForeignRecordBreakNull('op_id',Billing_Controller_OpenItem::getInstance());
				if($openItem){
					
					if($payment->__get('overpay') == 'DONATION' && !$payment->__get('is_return_debit') && $donationData){
						$opAmount = abs((float)$openItem->__get('open_sum'));
						$pAmount = abs((float)$payment->__get('payment_amount'));
						if($pAmount>$opAmount){
							$donationAmount = $pAmount-$opAmount;
							$payment2 = clone $paymentO;
							$payment2->__set('id', null);
					
							$payment2->__set('amount', $donationAmount);
							$payment2->__set('erp_context_id', 'DONATOR');
							$payment2 = Billing_Controller_Payment::getInstance()->create($payment2);
		
							$paymentDebitor = $payment2->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
							$contactId = $paymentDebitor->getForeignId('contact_id');
							if($donationData){
								$campaignId = $donationData['campaign'];	
							}else{
								$campaign = Donator_Controller_Campaign::getInstance()->getDefaultCampaign();
								$campaignId = $campaign->getId();
							}
							
							
							$usage = 'Spende Adress-Nr: '.$paymentDebitor->__get('debitor_nr');
							$date = $payment->__get('payment_date');
							
							$donation = Donator_Controller_FundMaster::getInstance()->donateByContactId($contactId, $donationAmount, $campaignId, $date, $usage, $payment2);
							
							$paymentO->__set('amount', $pAmount - $donationAmount);
						}
						
					}
				// in case of overpay
				
					if($paymentO->__get('amount')!=0){
						$paymentO = Billing_Controller_Payment::getInstance()->create($paymentO);
						Billing_Controller_OpenItem::getInstance()->payOpenItem($openItem->getId(), $paymentO, abs((float)$openItem->__get('open_sum')));
					}
					
					
					
					
				}else{
					
					
					// can be donation or prepay of member fee
					
					if($payment->__get('is_return_debit')){
						$paymentO = Billing_Controller_Payment::getInstance()->create($paymentO);
					// prepay member fee
					}elseif($payment->__get('overpay') == 'PREPAYMEMBERFEE'){
						// do nothing else, payment is stored with context membership
						// so balance is positive
						$paymentO->__set('erp_context_id','MEMBERSHIP');
						$paymentO = Billing_Controller_Payment::getInstance()->create($paymentO);
					
					}else{
						// donation
						$paymentO->__set('erp_context_id','DONATOR');
						//$paymentO = Billing_Controller_Payment::getInstance()->create($paymentO);
							
							
						$donationData = $payment->getAdditionalItem('donation');
						$donationAmount = abs((float)$payment->__get('payment_amount'));
						$payment2 = clone $paymentO;
						$payment2->__set('id', null);
					
						$payment2->__set('amount', $donationAmount);
						$payment2->__set('erp_context_id', 'DONATOR');
						$payment2 = Billing_Controller_Payment::getInstance()->create($payment2);
	
						$paymentDebitor = $payment2->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
						$contactId = $paymentDebitor->getForeignId('contact_id');
						if($donationData){
								$campaignId = $donationData['campaign'];	
							}else{
								$campaign = Donator_Controller_Campaign::getInstance()->getDefaultCampaign();
								$campaignId = $campaign->getId();
							}
						
						$usage = 'Spende Adress-Nr: '.$paymentDebitor->__get('debitor_nr');
						$date = $payment->__get('payment_date');
						
						$donation = Donator_Controller_FundMaster::getInstance()->donateByContactId($contactId, $donationAmount, $campaignId, $date, $usage, $payment2);
					}
				}
				
				
			
		
				
			}
			
		}
		
	}

	public function clearBookings(){
		$ids = $this->_backend->getAll('id','ASC', true);
		$this->delete($ids);
	}
	
	public function getCountPayments(){
		$ids = $this->_backend->getAll('id','ASC', true);
		return count($ids);
	}
}
?>