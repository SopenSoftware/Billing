<?php
/**
 *
 * Controller OpenItem
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_OpenItem extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_OpenItem();
		$this->_modelName = 'Billing_Model_OpenItem';
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
	 * @return Billing_Model_OpenItem
	 */
	public function getEmptyOpenItem(){
		$emptyBrevet = new Billing_Model_OpenItem(null,true);
		return $emptyOpenItem;
	}
	
	public function getSums($filter){
		return $this->_backend->getSums($filter);	
	}
	
	public function getCount($filter){
		return $this->_backend->searchCount($filter);	
	}
	
	public function getSummation($aFilter){
		if(is_array($aFilter)){
			$filter = new Billing_Model_OpenItemFilter(array(), 'AND');
			$filter->setFromArrayInUsersTimezone($aFilter);
		}else{
			$filter = $aFilter;
		}
		
		$total = $this->getSums($filter);
		
		return array(
			'total_netto' => $total['global_netto'],
			'total_brutto' => $total['global_brutto'],
			'open_sum' => $total['global_open'],
			'payed_sum' => $total['global_payed'],
			'totalcount' => $total['count']
		);
		
	}
	
	
	/**
	 *
	 * Enter description here ...
	 * @param unknown_type $receiptId
	 */
	public function getByReceiptId($receiptId){
		return $this->_backend->getByProperty($receiptId, 'receipt_id');
	}
	
	public function getByDebitorAndAmount($debitorId, $amount){
		try{
			return $this->_backend->getByPropertySet(
				array(
					'debitor_id' => $debitorId,
					'open_sum' => abs((float) $amount)
				),
				false,
				false
			);
		}catch(Exception $e){
			return new Tinebase_Record_RecordSet('Billing_Model_OpenItem', array());
		}
	}
	
	public function getByDebitor($debitorId){
		try{
			return $this->_backend->getByPropertySet(
				array(
					'debitor_id' => $debitorId
				),
				false,
				false
			);
		}catch(Exception $e){
			return new Tinebase_Record_RecordSet('Billing_Model_OpenItem', array());
		}
		
	}
		
	public function getByPaymentId($paymentId){
		try{
			return $this->_backend->getByPropertySet(
				array(
					'payment_id' => $paymentId
				),
				false,
				false
			);
		}catch(Exception $e){
			return new Tinebase_Record_RecordSet('Billing_Model_OpenItem', array());
		}
		
	}

	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	protected function _inspectCreate(Tinebase_Record_Interface $_record)
	{
		$order = $_record->getForeignRecord('order_id', Billing_Controller_Order::getInstance());

		$_record->__set('erp_context_id', $order->__get('erp_context_id'));

		$_record->__set('op_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('op_nr'));
	}
	
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	protected function _inspectUpdate(Tinebase_Record_Interface $_record)
	{
		//$receipt = $_record->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
		if(!$_record->getForeignIdBreakNull('payment_method_id')){
        		$_record->__set('payment_method_id', 'BANKTRANSFER');
        	}
		
	}

	public function onPaymentDebitReturnCreated($payment){
		// this payment coming in is the return payment 
		//-> therefore the base payment has to be fetched (cancelled payment)
		// 
		$basePayment = $payment->getReturnDebitBasePayment();
		
		$ops = $this->getByPaymentId($basePayment->getId());
		if(count($ops)>0){
			// getAmount(false) -> do not include debit return fee
			$amount = $payment->getAmount(false);
			
			foreach($ops as $openItem){
				$openItem->__set('payment_method_id', 'BANKTRANSFER');
				$this->unpayOpenItem($openItem, $amount, $payment);
				$amount -= abs($openItem->__get('open_sum'));
			}
		}
		
	}
	
	public function onBillableReceiptCreated($receipt){
		$receipt->flatten();
		$openItem = new Billing_Model_OpenItem(null,true);
		//$order = Billing_Controller_Order::getInstance()->get($receipt->__get('order_id'));
		$order = $receipt->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
		$debitorId = $order->getForeignId('debitor_id');
		$openItem->__set('order_id',$receipt->__get('order_id'));
		$openItem->__set('receipt_id', $receipt->getId());
		$openItem->__set('debitor_id', $debitorId);
		$openItem->__set('payment_method_id', $receipt->getForeignId('payment_method_id'));
		$rNr = $receipt->__get('invoice_nr');
		$rDate = $receipt->__get('invoice_date');
		
		$openItem->__set('is_cancellation',$receipt->__get('is_cancellation'));
		$openItem->__set('is_cancelled',$receipt->__get('is_cancelled'));
		
		if($receipt->__get('is_cancellation')){
			$openItem->__set('state','DONE');
		}
		
		if($receipt->isCredit()){
			$rNr = $receipt->__get('credit_nr');
			$rDate = $receipt->__get('credit_date');
			$openItem->__set('type', 'CREDIT');
		}else{
			$openItem->__set('type', 'DEBIT');
		}
		$openItem->__set('receipt_nr', $rNr);
		$openItem->__set('receipt_date', $rDate);
		$openItem->__set('total_netto', 0);
		$openItem->__set('total_brutto', 0);
		// TODO: check this -->
			// $openItem->__set('open_sum', $receipt->__get('total_brutto'));
			// changed to:
			$openItem->__set('open_sum', $receipt->__get('open_sum'));
		// <--
		
		$openItem->__set('payed_sum', $receipt->__get('payed_sum'));
		$openItem->__set('erp_context_id', $receipt->__get('erp_context_id'));
		$openItem->__set('usage', $receipt->__get('usage'));
			
		if($receipt->isDonation()){
			$openItem->__set('donation_id', $receipt->getForeignId('donation_id'));
		}
		
		$this->create($openItem);
	}
	
	public function onOpenItemPayed(Billing_Model_Payment $payment){

	}

	public function exportFibu($filter){
			
	}

	public function unpayOpenItem($openItem, $amount, $payment){
		$receipt = $openItem->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
		
		$totalBrutto = ((float)$openItem->__get('total_brutto'));
		$openSum = min($amount, $totalBrutto);
		$payedSum = max($totalBrutto-$amount, 0);
		
		if(abs($openSum) < abs($totalBrutto)){
			$openItem->__set('state', 'PARTLYOPEN');
			$receipt->__set('payment_state', 'PARTLYPAYED');
		}else{
			$openItem->__set('state', 'OPEN');
			$receipt->__set('payment_state', 'TOBEPAYED');
		}
		
		$openItem->__set('open_sum', $openSum);
		$openItem->__set('payed_sum', $payedSum);
		$receipt->__set('open_sum', $openSum);
		$receipt->__set('payed_sum', $payedSum);
		
		$receipt = Billing_Controller_Receipt::getInstance()->update($receipt);
		$this->update($openItem);
		
		Tinebase_Event::fireEvent(new Billing_Events_OpenItemUnpayed($payment, $openItem));
	}

	public function payOpenItem($openItemId, $payment, $amount = 0){
		$openItem = $this->get($openItemId);
		$receipt = $openItem->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
		
		$pAmount = abs((float)$payment->__get('amount'));
		
		if($amount == 0){
			$amount = $pAmount;
		}
		
		$payedSum = abs((float)$openItem->__get('payed_sum'));
		$openSum = abs((float)$openItem->__get('open_sum'));
		
		if($amount < $openSum){
			$openItem->__set('state', 'PARTLYOPEN');
			$receipt->__set('payment_state', 'PARTLYPAYED');
		}else{
			$openItem->__set('state', 'DONE');
			$receipt->__set('payment_state', 'PAYED');
		}
		
		$openSum 	-= min($amount, $openSum);
		$payedSum 	+= min($amount, $openSum);
		
		$openItem->__set('open_sum', $openSum);
		$openItem->__set('payed_sum', $payedSum);
		$receipt->__set('open_sum', $openSum);
		$receipt->__set('payed_sum', $payedSum);
		
		// payment is optional: as open item can be nulled with contra receipt (bill <-->credit)
		if($payment){
			$paymentId = $payment->getId();
			$openItem->__set('payment_id', $paymentId);
		}else{
			$payment = Billing_Controller_Payment::getInstance()->getEmptyPayment();
		}
		
		$receipt = Billing_Controller_Receipt::getInstance()->update($receipt);
		$this->update($openItem);
		
		Tinebase_Event::fireEvent(new Billing_Events_OpenItemPayed($payment, $openItem));
		
	}

	public function payOpenItems($data, $paymentRecord, $donationData){
		try{
			if(!is_array($data)){
				$data = Zend_Json::decode($data);
			}
				
			if(!is_array($paymentRecord)){
				$paymentRecord = Zend_Json::decode($paymentRecord);
			}
			
			if(!is_array($donationData)){
				$donationData = Zend_Json::decode($donationData);
			}
			
			$payment = Billing_Controller_Payment::getInstance()->getEmptyPayment();
			
			if(array_key_exists('id', $paymentRecord)){
				unset($paymentRecord['id']);
			}
			$payment->setFromArray($paymentRecord);
			$paymentAmount = $payment->__get('amount');
			$donationAmount = $donationData['donation_amount'];
			
			if(count($data)>0){
				if($donationAmount>0){
					$paymentAmount -= min($donationAmount, $paymentAmount);
					$payment->__set('amount', $paymentAmount);
				}
				
				$payment = Billing_Controller_Payment::getInstance()->create($payment);
				$paymentId = $payment->getId();
				
				foreach($data as $item){
					$this->payOpenItem($item['id'], $payment, $item['amount']);
					$paymentAmount -= $item['amount'];
				}
			}
			
			// if donation should be made
			if(is_array($donationData)&& array_key_exists('donation_amount',$donationData)){
				
				if($donationAmount>0){
					
					$payment2 = clone $payment;
					$payment2->__set('id', null);
					
					$payment2->__set('amount', $donationAmount);
					$payment2->__set('erp_context_id', 'DONATOR');
					$payment2 = Billing_Controller_Payment::getInstance()->create($payment2);

					$paymentDebitor = $payment2->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
					$contactId = $paymentDebitor->getForeignId('contact_id');
					
					$campaignId = $donationData['campaign'];
					
					$usage = 'Spende Adress-Nr: '.$paymentDebitor->__get('debitor_nr');
					$date = $payment->__get('payment_date');
					
					$donation = Donator_Controller_FundMaster::getInstance()->donateByContactId($contactId, $donationAmount, $campaignId, $date, $usage, $payment2);
				}
			}
			
			return array(
				'success' => true,
				'payment' => $payment->toArray()
			);
				
		}catch(Exception $e){
			return array(
				'success' => false,
				'payment' => null,
				'errorInfo' => $e->getTrace(),
				'errorMessage' => $e->getMessage()
			);
		}
	}

	public function getPayableOpenItems($memberNr, $contactNr, $amount){
		// start transaction
	    $db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		$tId = $tm->startTransaction($db);
		
		try{

			if($memberNr){
				$member = Membership_Controller_SoMember::getInstance()->getSoMemberByMemberNr($memberNr);
				$contactNr = $member->getForeignId('contact_id');
			}
				
			$debitor = Billing_Controller_Debitor::getInstance()->getByContactOrCreate($contactNr);
				
			$debitorId = $debitor->getId();
			$filters[] = array(
	    		'field' => 'debitor_id',
	    		'operator' => 'AND',
	    		'value' => array(array(
					'field' => 'id',
					'operator' => 'equals',
					'value' => $debitorId
			))
			);

			$filters[] = array(
	    		'field' => 'state',
	    		'operator' => 'equals',
	    		'value' => 'OPEN'
	    		);
	    			
	    		$filters[] = array(
	    		'field' => 'type',
	    		'operator' => 'equals',
	    		'value' => 'DEBIT'
	    		);
	    			
	    		$filter = new Billing_Model_OpenItemFilter($filters, 'AND');
	    			
	    		$openItems =  $this->search(
	    		$filter,
	    		new Tinebase_Model_Pagination(array('sort' => 'receipt_date', 'dir' => 'ASC'))
	    		);
	    			
	    		$payableAmount = 0;
	    		if($amount>0){
	    			$payableAmount = $amount;
	    		}
	    		$resultArray = array();
	    			
	    		foreach($openItems as $openItem){
	    			$value = (float) $openItem->__get('open_sum');

					$aOpenItem = $openItem->toArray();
    				$aOpenItem['proprosal_payment_amount'] = 0;
    				$aOpenItem['payment_amount'] = $value;
    				
    				
	    			if($value <= $payableAmount){
	    				$aOpenItem['proprosal_payment_amount'] = $value;
	    			}
	    			$resultArray[] = $aOpenItem;
	    			$payableAmount -= $value;
	    		}
	    		
	    		$tm->commitTransaction($tId);
	    			
	    		return array(
				'success' => true,
				'debitor' => $debitor->toArray(true),
				'result' => $resultArray
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

	public function directDebit($paymentTypeKeys, $filters){
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		try{
			require_once 'Payment/DTA.php';

			if(!is_array($filters)){
				$filters = Zend_Json::decode($filters);
			}

			if(!is_array($paymentTypeKeys)){
				$paymentTypeKeys = Zend_Json::decode($paymentTypeKeys);
			}
			$filters[] = array(
	    			'field' => 'banking_exp_date',
	    			'operator' => 'isnull',
	    			'value' => ''
	    			);
	    				
	    			$rawFilters = $filters;

	    			$paymentTypeCount = count($paymentTypeKeys);

	    			$filters[] = array(
	    			'field' => 'payment_method_id',
	    			'operator' => 'equals',
	    			'value' => $paymentTypeKeys[1]
	    			);

	    			$filter1 = new Billing_Model_OpenItemFilter($filters, 'AND');

	    			$filter = new Tinebase_Model_Filter_FilterGroup(array(), 'OR');
	    			$filter->addFilterGroup($filter1);


	    			if($paymentTypeCount>1){
	    				unset($paymentTypeKeys[1]);
	    				foreach($paymentTypeKeys as $paymentTypeKey){
	    					$newFilters = $rawFilters;
	    					$newFilters[] = array(
		    			'field' => 'payment_method_id',
		    			'operator' => 'equals',
		    			'value' => $paymentTypeKey
	    					);
	    					$pFilterGroup = new Billing_Model_OpenItemFilter($newFilters, 'AND');
	    					$filter->addFilterGroup($pFilterGroup);
	    				}
	    			}
	    				
	    			// start transaction
	    			$tId = $tm->startTransaction($db);
	    				
	    			// count membership matching filters
	    			$openItemIds =  $this->search(
	    				$filter,
	    				new Tinebase_Model_Pagination(array('sort' => 'due_date', 'dir' => 'ASC')),
	    				false,
	    				true
	    			);

	    			$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';

	    			$mandators = \Tinebase_Config::getInstance()->getConfig('mandators', NULL, TRUE)->value;
	    			$mandator = $mandators[1]['bankdata'];
	    			$hash = md5(serialize($mandator).microtime());
	    			$dtaFile = new DTA(DTA_DEBIT);
	    			$dtaFile->setAccountFileSender(
	    			array(
			        "name"           => $mandator['account_holder'],
			        "bank_code"      => $mandator['bank_code'],
			        "account_number" => $mandator['account_number'],
	    			)
	    			);


	    			// 		create DTA file
	    			foreach($openItemIds as $openItemId){
	    				
	    				$openItem = $this->get($openItemId);

	    				// value
	    				$val = (float) $openItem->__get('open_sum');
						$usage = $openItem->__get('usage');
						$u = explode(',',$usage);
						$u1 = $u2 = '';
						if(count($u)>0){
							$u1 = $u[0];
							$u2 = $u[1];
						}else{
							$u1 = $usage;
						}
	    				if($val>0){
	    					$debitor = $openItem->getForeignRecordBreakNull('debitor_id', Billing_Controller_Debitor::getInstance());
	    					if(!$debitor){
	    						continue;
	    					}
	    					$contact = $debitor->getForeignRecordBreakNull('contact_id', Addressbook_Controller_Contact::getInstance());
	    					if(!$contact){
	    						continue;
	    					}
	    					$receipt = $openItem->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
	    					$dtaFile->addExchange(
	    					array(
					        "name"          	=> $contact->__get('bank_account_name'),
				        	"bank_code"      	=> $contact->__get('bank_code'),
				        	"account_number" 	=> $contact->__get('bank_account_number')
	    					),
	    					(string)$val,                 // Amount of money.
	    					array(                  // Description of the transaction ("Verwendungszweck").
					        $u1,
					        $u2
					        )
					        );
	    				}

	    				$openItem->__set('banking_exp_date', new Zend_Date());
	    				$this->update($openItem);
	    			}

	    			$dtaFile->saveFile($tempFilePath.'DTAUS0'.$hash);
	    			$meta = $dtaFile->getMetaData();

	    			$date	= strftime("%d.%m.%y", $meta["date"]);
	    			$execDate	=strftime("%d.%m.%y", $meta["exec_date"]);
	    			$count	=$meta["count"];
	    			$sumEUR	= $meta["sum_amounts"];
	    			$sumKto	=$meta["sum_accounts"];
	    			$sumBankCodes	= $meta["sum_bankcodes"];

	    			$sender	=$mandator['account_holder'];
	    			$senderBank	= $mandator['bank'];
	    			$senderBankCode	= $mandator['bank_code'];
	    			$senderAccount	=$mandator['account_number'];

	    			$handoutContent = "Datenträger-Begleitzettel
	Erstellungsdatum: $date 
	Ausführungsdatum: $execDate
	Anzahl der Lastschriften: $count
	Summe der Beträge in EUR: $sumEUR
	Kontrollsumme Kontonummern: $sumKto
	Kontrollsumme Bankleitzahlen: $sumBankCodes
	Auftraggeber: $sender
	Beauftragtes Bankinstitut: $senderBank
	Bankleitzahl: $senderBankCode
	Kontonummer: $senderAccount";

	    			$zip = new ZipArchive();
	    			$filename = "$tempFilePath/DTAUS0-$ogNr.zip";

	    			if ($zip->open($filename, ZIPARCHIVE::CREATE)!==TRUE) {
	    				exit("cannot open <$filename>\n");
	    			}

	    			$zip->addFromString("begleitzettel.txt", $handoutContent);
	    			$zip->addFile($tempFilePath.'DTAUS0'.$hash, 'DTAUS0');
	    			$zip->close();

	    			header("Content-type: application/zip;\n");
	    			header("Content-Transfer-Encoding: binary");
	    			$len = filesize($filename);
	    			header("Content-Length: $len;\n");
	    			$outname="DTAUS0-$ogNr.zip";
	    			header("Content-Disposition: attachment; filename=\"$outname\";\n\n");

	    			readfile($filename);

	    			unlink($filename);
	    				
	    			$tm->commitTransaction($tId);
		}catch(Exception $e){
			$tm->rollback($tId);
		}
	}
}
?>