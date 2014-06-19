<?php
/**
 * 
 * Controller DebitorAccount
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_DebitorAccount extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_DebitorAccount();
        $this->_modelName = 'Billing_Model_DebitorAccount';
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
     * Get empty record
     * @return Billing_Model_DebitorAccount
     */
    public function getEmptyDebitorAccount(){
     	$emptyDebitorAccount = new Billing_Model_DebitorAccount(null,true);
     	return $emptyDebitorAccount;
    }
    
    /**
     * (non-PHPdoc)
     * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
     */
    protected function _inspectCreate(Tinebase_Record_Interface $_record){
    	$_record->__set('created_datetime', Zend_Date::now());
    }
    
	/**
     * (non-PHPdoc)
     * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
     */
    protected function _inspectUpdate(Tinebase_Record_Interface $_record){
    	if(!$_record->__get('created_datetime')){
    		$_record->__set('created_datetime', Zend_Date::now());
    	}
    }
    
    public function getByReceiptId($receiptId){
    	$this->_backend->getByProperty($receiptId, 'receipt_id');
    }
    
 	public function getByPaymentId($paymentId){
    	$this->_backend->getByProperty($paymentId, 'payment_id');
    }
    
	public function getSums($filter){
		return $this->_backend->getSums($filter);	
	}
	
	public function getCount($filter){
		return $this->_backend->searchCount($filter);	
	}
	
	public function getSummationByDebitorId($debitorId, $context = null){
		
		$aFilter = array();
		
		if(!is_array($context)){
			$context = (array) $context;
		}
		
		$aFilter[] = array(
			'field'=> 'debitor_id',
			'operator' => 'AND',
			'value' => array(array(
				'field' => 'id',
				'operator' => 'equals',
				'value' => $debitorId
		)));
		
		if(!is_null($context)){
			$aFilter[] = array(
				'field'=> 'erp_context_id',
				'operator' => 'in',
				'value' => $context
			);
		}
		$filter = new Billing_Model_DebitorAccountFilter(
			$aFilter, 
			'AND'
		);
		
		$total = $this->getSums($filter);
        //$sum = $total['total_brutto'] - $total['total_netto'];
        //$total['sum'] = $sum;
       // throw new Exception('values:'.print_r($total,true));
        return $total;
	}
	
	public function getSummation(array $aFilter){
		$filter = new Billing_Model_DebitorAccountFilter(array(), 'AND');
        $filter->setFromArrayInUsersTimezone($aFilter);
		
		

		$total = $this->getSums($filter);
		$countTotal = $this->getCount($filter);
		
		return array(
			'total' => $total['total_brutto'] - $total['total_netto'],
			'total_netto' => $total['total_netto'],
			'total_brutto' => $total['total_brutto'],
			'totalcount' => $countTotal
		);
		
	}
	
	public function onDonationBooked( $donation, $booking, $receipt = null, $openItem = null, $context = 'DONATOR' ){
		$fundMaster = $donation->getForeignRecordBreakNull('fundmaster_id', Donator_Controller_FundMaster::getInstance());
		$contact = $fundMaster->getForeignRecordBreakNull('contact_id', Addressbook_Controller_Contact::getInstance());
		$debitor = Billing_Controller_Debitor::getInstance()->getByContactOrCreate($contact->getId());
		$debitorId = $debitor->getId();		
		
		$debitorAccount = new Billing_Model_DebitorAccount(null,true);
        $debitorAccount->__set('debitor_id', $debitorId);

        if($receipt){
        	$debitorAccount->__set('receipt_id', $receipt->getId());
        }
		if($openItem){
        	$debitorAccount->__set('open_item_id', $openItem->getId());
        }
        
	 $value = abs((float)$donation->__get('donation_amount'));
		$debitorAccount->__set('item_type', 'DEBIT');
		if($donation->__get('is_cancellation')){
			$debitorAccount->__set('item_type', 'CREDIT');
	 		  $debitorAccount->__set('h_brutto', $value);
		}else{
	        $debitorAccount->__set('s_brutto', $value);
		}
        
        $prefix = '';
        if($donation->__get('is_cancellation')){
        	 $debitorAccount->__set('item_type', 'CREDIT');
        	 $prefix = 'STORNO ';
        }
        
        $debitorAccount->__set('is_cancelled', $donation->__get('is_cancelled'));
		$debitorAccount->__set('is_cancellation', $donation->__get('is_cancellation'));
		
        
        $debitorAccount->__set('usage', $prefix.$donation->__get('donation_usage').' Sollstellung Spende: Sp.nr '. $donation->__get('donation_nr') .' Adress-Nr '. $contact->getId());
        
       
        $debitorAccount->__set('debitor_id', $debitorId);
        $debitorAccount->__set('erp_context_id', $context);
        
        $debitorAccount->__set('object_id', $donation->getId());
        $debitorAccount->__set('donation_id', $donation->getId());
        
        $date = new Zend_Date($donation->__get('donation_date'));
      	//$date = $date->toString('yyyy-MM-dd');
        $debitorAccount->__set('create_date', $date);
        $debitorAccount->__set('value_date', $date);
        $debitorAccount->__set('debitor_id', $debitorId);
        
        Billing_Controller_DebitorAccount::getInstance()->create($debitorAccount);
	}
	
	
	public function onBillableReceiptReverted($receipt, $creditReceipt){
		try{
			$debAccount = Billing_Controller_DebitorAccount::getInstance()->getByReceiptId($receipt->getId());
			if($debAccount){
			
				$debAccount->__set('is_cancelled', true);
				$credDebAccount = Billing_Controller_DebitorAccount::getInstance()->getByReceiptId($creditReceipt->getId());
				if($credAccount){
					$credDebAccount->__set('is_cancellation', true);
					$debAccount->__set('reversion_record_id', $credDebAccount->getId());
					$credDebAccount->__set('reversion_record_id', $debAccount->getId());
					
					$this->update($credDebAccount);
				}
				$this->update($debAccount);
			}
			
		}catch(Exception $e){
			
		}
		
	}
	public function onBillableReceiptBooked($receipt, $openItem, $booking){
		
		if($receipt->isCredit()||$receipt->isInvoice()){
			// suchen und neu oder update -> debitor account
			$receipt = Billing_Controller_Receipt::getInstance()->get($receipt->getId());
			
			
			$totalBrutto = $receipt->__get('total_brutto');
			try{
				$debitorAccount = Billing_Controller_DebitorAccount::getInstance()->getByReceiptId($receipt->getId());
				
				if(!$debitorAccount){
					throw new Exception('');
				}
				$debitorAccount->__set('s_brutto', $totalBrutto);
				Billing_Controller_DebitorAccount::getInstance()->update($debitorAccount);
			
			}catch(Exception $e){
				
				$debitorAccount = Billing_Controller_DebitorAccount::getInstance()->getEmptyDebitorAccount();
				$order = $receipt->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
				$debitorAccount->__set('receipt_id', $receipt->getId());
				$debitorAccount->__set('debitor_id', $order->getForeignId('debitor_id'));
				$debitorAccount->__set('erp_context_id', $receipt->__get('erp_context_id'));
				$debitorAccount->__set('usage', $receipt->__get('usage'));
				$debitorAccount->__set('booking_id', $booking->getId());
				//$debitorAccount->__set('open_item_id', $openItem->getId());
				$debitorAccount->__set('is_cancelled', $receipt->__get('is_cancelled'));
				$debitorAccount->__set('is_cancellation', $receipt->__get('is_cancellation'));
				
				if($receipt->isInvoice()){
					$debitorAccount->__set('item_type', 'DEBIT');
					$debitorAccount->__set('create_date', new Zend_Date($receipt->__get('invoice_date')));
					$debitorAccount->__set('value_date', new Zend_Date($receipt->__get('invoice_date')));
					$debitorAccount->__set('s_brutto', $totalBrutto);
				}
				if($receipt->isCredit()){
					$debitorAccount->__set('item_type', 'CREDIT');
					$debitorAccount->__set('create_date', new Zend_Date($receipt->__get('credit_date')));
					$debitorAccount->__set('value_date', new Zend_Date($receipt->__get('credit_date')));
					$debitorAccount->__set('h_brutto', $totalBrutto *(-1));
				}
				
				$this->create($debitorAccount);
				
			}
		}
	}
	
	public function onPaymentDonationDetected($payment){
		try{
			
			$da = $this->getByPaymentId($payment);
			$donationId = $payment->getForeignId($payment);
			if($donationId && is_null($da->getForeignIdBreakNull('donation_id'))){
				$da->__set('donation_id', $donationId);
				$this->update($da);
			}
			
		}catch(Exception $e){
			throw new Billing_Exception_DebitorAccountNotFound('DebitorAccount not found for payment '.$payment->getId(), 0, $e);
		}
	}
	
	public function onPaymentBooked($payment, $booking){
		
		if($payment->__get('debitor_id')){
        	$debitorAccount = Billing_Controller_DebitorAccount::getInstance()->getEmptyDebitorAccount();
			$debitor = $payment->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
			$debitorAccount->__set('debitor_id', $debitor->getId());
			
			$debitorAccount->__set('create_date', new Zend_Date($payment->__get('payment_date')));
			$debitorAccount->__set('value_date', new Zend_Date($payment->__get('payment_date')));
			
			$debitorAccount->__set('usage', $payment->__get('usage'));
			$debitorAccount->__set('erp_context_id', $payment->__get('erp_context_id'));
			$debitorAccount->__set('payment_id', $payment->__get('id'));
			$debitorAccount->__set('booking_id', $booking->getId());
			$debitorAccount->__set('receipt_id', $payment->getForeignId('receipt_id'));
//			$debitorAccount->__set('open_item_id', $payment->getForeignId('open_item_id'));
			$debitorAccount->__set('donation_id', $payment->getForeignId('donation_id'));
			
			// other object: like donation for example (not a clean approach)
			$debitorAccount->__set('object_id', $payment->getForeignId('object_id'));
			$debitorAccount->__set('donation_id', $payment->getForeignId('donation_id'));
			
			$debitorAccount->__set('is_cancelled', $payment->__get('is_cancelled'));
			$debitorAccount->__set('is_cancellation', $payment->__get('is_cancellation'));
			
			//$cKto = $payment->getForeignId('account_system_id_haben');
			//$dKto = $payment->getForeignId('account_system_id');
			
			switch($payment->__get('type')){
				case 'DEBIT':
					$debitorAccount->__set('item_type', 'DEBIT');
					$debitorAccount->__set('h_brutto', abs($payment->getAmount(false)));
					break;
				case 'CREDIT':
					$debitorAccount->__set('item_type', 'CREDIT');
					$debitorAccount->__set('s_brutto', abs($payment->getAmount(false)));
					break;
			}
			
			
			
			if($payment->__get('payment_type')=='PAYMENT'){
				$debitorAccount->__set('item_type','PAYMENT');
			}else{
				$debitorAccount->__set('item_type','DISAGIO');
			}
			Billing_Controller_DebitorAccount::getInstance()->create($debitorAccount);
			
			
			
        }
    	
        /*
    	if($payment->__get('receipt_id')){
        	$receipt = $payment->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
        	
        	$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($receipt->getId());
        	Billing_Controller_OpenItem::getInstance()->payOpenItem($openItem->getId(), $payment);
        	
        	$totalBrutto = $receipt->__get('total_brutto');
        	$amount = $payment->__get('amount');
        	if($payment->__get('amount') == $totalBrutto){
        		$receipt->__set('payment_state', 'PAYED');
        	}elseif($payment->__get('amount') == 0){
        		$receipt->__set('payment_state', 'TOBEPAYED');
        	}elseif($payment->__get('amount') < $totalBrutto){
        		$receipt->__set('payment_state', 'PARTLYPAYED');
        	}
        	$receipt = Billing_Controller_Receipt::getInstance()->update($receipt);
        }*/
		
	}
    

}
?>