<?php
/**
 *
 * Controller Receipt
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Receipt extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_Receipt();
		$this->_modelName = 'Billing_Model_Receipt';
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
	
	private function prepareFilter($filter){
		$decodedFilter = is_array($_filter) || strlen($_filter) == 40 ? $_filter : Zend_Json::decode($_filter);
        
        if (is_array($decodedFilter)) {
            $filter = new Billing_Model_ReceiptFilter(array());
            $filter->setFromArrayInUsersTimezone($decodedFilter);
        } else if (!empty($decodedFilter) && strlen($decodedFilter) == 40) {
            $filter = Tinebase_PersistentFilter::getFilterById($decodedFilter);
        } else if (!($filter instanceof Tinebase_Model_Filter_FilterGroup)) {
            // filter is empty
            $filter = new Billing_Model_ReceiptFilter(array());
        }
        return $filter;
	}
	
	public function getSums($filter){
		return $this->_backend->getSums($filter);	
	}
	
	public function getCount($filter){
		return $this->_backend->searchCount($filter);	
	}
	
	public function getSummation(array $aFilter){
		$filter = new Billing_Model_ReceiptFilter(array(), 'AND');
        $filter->setFromArrayInUsersTimezone($aFilter);
		
		//$countFilter = $filter;

		$total = $this->getSums($filter);
		//$countTotal = $this->getCount($filter);
		
		return array(
			'total_netto' => $total['global_netto'],
			'total_brutto' => $total['global_brutto'],
			'totalcount' => $total['count']
		);
		
	}
	
    /**
     * 
     * Invoice getter - same as $this->get but with type check on invoice
     * @param unknown_type $invoiceId
     */
	public function getInvoice($invoiceId){
		$receipt = $this->get($invoiceId);
		if( $receipt->__get('type') !== Billing_Model_Receipt::TYPE_INVOICE ){
			throw new Exception('Associated receipt type ' . $receipt->__get('type') . ' is invalid. Should be ' . Billing_Model_Receipt::TYPE_INVOICE);
		}
		return $receipt;
	}
	
	public function getReceiptsForDebitor(Billing_Model_Debitor $debitor){
		
		return $this->_backend->getMultipleByProperty($debitor->getId(),'debitor_id');
	}
	
	public function onPaymentAmountChanged($payment){
		if($payment->__get('open_item_id')){
        	$openItem = $payment->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
        	$openItem->pay($payment);
        	
        	
        } 
	}
	
	public function onPaymentCreated($payment){
		
	}
	
    protected function inspectDeleteRecord(Tinebase_Record_Interface $_record){
    	$rpController = Billing_Controller_ReceiptPosition::getInstance();
    	$oiController = Billing_Controller_OpenItem::getInstance();
    	
    	$receiptPositions = $rpController->getByReceiptId($receiptId);
    	foreach($receiptPositions as $receiptPosition){
    		$rpController->_deleteRecord($receiptPosition);
    	}
    	
    	try{
    		$openItem = $oiController->getByReceiptId($_record->getId());
    		$oiController->_deleteRecord($openItem);
    	}catch(Exception $e){
    		//silently fail:ok
    		//echo $e->__toString();
    	}
    	
    }
    
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::create()
	 */
	public function create(Tinebase_Record_Interface $_record){
		// if no explicit payment method given:
	 	// inherit payment method from order, or get default
		$order = $_record->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
		
		if(!$_record->__get('payment_method_id')){
			$paymentMethodId = 
				Billing_Controller_PaymentMethod::getInstance()
					->getPaymentMethodFromRecordOrDefault($order, 'payment_method_id')
					->getId();
			$_record->__set('payment_method_id', $paymentMethodId);
		}	
		$record = parent::create($_record);
	 	/*$type = $_record->__get('type');
	 	
		switch($type){
			case Billing_Model_Receipt::TYPE_INVOICE:
			case Billing_Model_Receipt::TYPE_CREDIT:
				$receipt = $this->get($record->getId());
				
				Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptCreated($receipt));
				
			break;
		}*/
		return $record;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    		$orderId = $_record->getForeignId('order_id');
    		$order = Billing_Controller_Order::getInstance()->get($orderId);
    		$debitor = $order->__get('debitor_id');
    		$aContact = $debitor->__get('contact_id');
    		$contactId = $aContact['id'];
			$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
    		
			$_record->__set('erp_context_id', $order->__get('erp_context_id'));
		
    		$params = array(
    			'contact' => $contact,
    			'debitor' => $debitor,
    			'order' => $order
    		);
    		
    		// calculates numbers according to receipt type -> defined in number_base
    		$type = $_record->__get('type');
			switch($type){
				case Billing_Model_Receipt::TYPE_CALCULATION:
						$_record->__set('calc_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('calc_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_BID:
						$_record->__set('bid_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('bid_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_CONFIRM:
						$_record->__set('confirm_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('confirm_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_SHIPPING:
						$_record->__set('ship_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('ship_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_INVOICE:
						$_record->__set('invoice_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('invoice_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_CREDIT:
						$_record->__set('credit_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('invoice_nr', null, $params));
						// TODO HH: make configurable -> some orgas might use own number area for credit
						// others: the same for invoice and credit
						//$_record->__set('credit_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('credit_nr', null, $params));
					break;
				case Billing_Model_Receipt::TYPE_MONITION:
						$_record->__set('monition_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('monition_nr', null, $params));
					break;
					
			}
    }
    
	public function onBillableReceiptCreated($receipt){
		if(!$receipt->isCancellation()){
			$receipt->__set('open_sum', $receipt->__get('total_brutto'));
			$receipt->__set('payed_sum', $receipt->__get('payed_sum'));
		
			$receipt = $this->update($receipt);
		}
	}

    
 /**
     * inspect update of one record
     * 
     * @param   Tinebase_Record_Interface $_record      the update record
     * @param   Tinebase_Record_Interface $_oldRecord   the current persistent record
     * @return  void
     */
    protected function _inspectUpdate($_record, $_oldRecord)
    {
       	if($_record->__get('order_id')){
        	$order = $_record->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
        	if($order->__get('payment_state') != $_record->__get('payment_state')){
        		$order->__set('payment_state', $_record->__get('payment_state'));
        		Billing_Controller_Order::getInstance()->update($order);
        	}
        } 
        $openItem = null;
        if($_record->__get('payment_state')=='PAYED'){
        	try{
	        	$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($_record->getId());
	        	if($openItem->__get('state') != 'DONE'){
	        		$openItem->__set('state', 'DONE');
	        		$openItem->__set('open_sum',0);
	        		$openItem->__set('payed_sum', $_record->__get('total_brutto'));
	        		$openItem->__set('payment_method_id', $_record->getForeignId('payment_method_id'));
	        		
	        	}
        	}catch(Exception $e){
        		// silent failure, as open item might not exist already
        	}
        }
        
        if($_record->isCancelled()){
			if(is_null($openItem)){
				$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($_record->getId());
			}
        	$openItem->__set('is_cancelled',true);
        	$reversionReceiptId = $_record->getForeignId('reversion_record_id');
        	try{
        		$reversionOpenItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($reversionReceiptId);
        		$openItem->__set('open_sum', $openItem->__get('total_brutto') + $reversionOpenItem->__get('total_brutto'));
        		$openItem->__set('payed_sum', (-1)*$reversionOpenItem->__get('payed_sum'));
        		$openItem->__set('reversion_record_id', $reversionOpenItem->getId());
        	}catch(Exception $e){
        		//failure OK: open item for reversion record might not already exist
        		// will be set in on of the next update calls, as soon, the open item exists. 
        	}
        }
        if(!$_record->getForeignIdBreakNull('payment_method_id')){
        	$_record->__set('payment_method_id', 'BANKTRANSFER');
        }
        if($openItem){
        	if(!$openItem->getForeignIdBreakNull('payment_method_id')){
        		$openItem->__set('payment_method_id', 'BANKTRANSFER');
        	}
        	Billing_Controller_OpenItem::getInstance()->update($openItem);
        }
    }
    
    /**
     * 
     * Get a receiptId by property
     * @param string $property
     * @param string $value
     */
    public function getIdByProperty($property, $value){
    	$record = $this->_backend->getByProperty($value, $property);
    	return $record->getId();
    }
    
	/**
	 * Get empty record
	 * @return Billing_Model_Receipt
	 */
	public function getEmptyReceipt(){
		$emptyReceipt = new Billing_Model_Receipt(null,true);
		return $emptyReceipt;
	}

	/**
	 * 
	 * Get the receipts positions by receiptId
	 * @param integer $receiptId
	 */
	public function getOrderPositions($receiptId){
		$backend = new Billing_Backend_ReceiptPosition();
		
		return $backend->getByReceiptId($receiptId);
	}
	
	public function getMonitionPositions($receiptId){
		return Billing_Controller_OpenItemMonition::getInstance()->getByReceiptId($receiptId);
	}
	
	public function getCalculationVariants($receiptId){
		$productionCostController = Billing_Controller_ProductionCost::getInstance();
		$aVariantSum = array();
		$positions = $this->getOrderPositions($receiptId)->toArray();
		$aVariantSum['I']['variant'] = 'I';
		$aVariantSum['I']['ek_total'] = 0;
		$aVariantSum['I']['total_netto'] = 0;
		$aVariantSum['I']['profit'] = 0;
		$aVariantSum['I']['has_delivery'] = false;
		
		
		$aVarTypeMap = array();
		
		foreach($positions as $pos){
			$variants = $productionCostController->getByOrderPositionId($pos['id'])->toArray();
			if(count($variants)==0){
				$it = new ArrayIterator($aVariantSum);
				foreach($it as $var){
					$var['ek_total'] += 0;
					$var['total_netto'] += $pos['total_netto'];
					$var['profit'] += ($var['total_netto']-$var['ek_total']);
				}
			}
			foreach($variants as $var){
				if(!array_key_exists($var['category'], $aVariantSum)){
					$aVariantSum[$var['category']] = array(
						'variant' => $var['category'],
						'ek_total' => 0,
						'total_netto' => 0,
						'profit' => 0,
						'has_delivery' => false
					);
				}
				if($var['type']=='DELIVERY'){
					$aVariantSum[$var['category']]['has_delivery'] = true;
				}
				$aVariantSum[$var['category']]['ek_total'] += ((int)$pos['amount']*(float)$var['ek_netto']);
				$aVariantSum[$var['category']]['total_netto'] += $pos['total_netto'];
				$aVariantSum[$var['category']]['profit'] += ($aVariantSum[$var['category']]['total_netto']-$aVariantSum[$var['category']]['ek_total']);
			}
		}
		$result = array();
		foreach($aVariantSum as $aVariant){
			$result[] = $aVariant;
		}
		return array(
			'totalcount' => count($result),
			'success' => true,
			'results' => $result
		);
	}
	
	public function getReceiptSumValues($receiptId){
		$positions = $this->getOrderPositions($receiptId)->toArray();
		$aPositions = array();
		foreach($positions as $pos){
			$aPositions[] = array(
					'nr' => $pos['position_nr'],
					'amount' => $pos['amount'],
					'unit' => $pos['unit_id']['name'],
					'article_nr' => $pos['article_id']['id'],
					'article_name' => $pos['name'],
					'article_desc' => $pos['description'],
					'unit_price_netto' => $pos['price_netto'],
					'unit_price_brutto' => $pos['price_brutto'],
					'price_netto' => $pos['total_netto'],
					'price_brutto' => $pos['total_brutto'],
					'disc_percent' => $pos['discount_percentage'],
					'disc_total' => $pos['discount_total'],
					'vat' => $pos['vat_id']['value'],
					'vat_index' => $pos['vat_id']['name'],
					'vat_credit_account' => $pos['vat_id']['credit_account']
				);
		}
		$aVatPos = array();
		$aVatTotal = array('sum' => array( 'netto' => 0, 'vat' => 0, 'brutto' => 0));
		$sumNetto = 0;
		$sumBrutto = 0;
		
		foreach($aPositions as $pos){
			if(!array_key_exists($pos['vat_index'],$aVatPos)){
				$aVatPos[$pos['vat_index']] = array('sum' => array('netto'=>0,'vat'=>0,'brutto'=>0));
			}
			$priceNetto = $pos['price_netto'];
			$priceBrutto = $pos['price_brutto'];
			$vat = $priceBrutto - $priceNetto;
			
			$aVatPos[$pos['vat_index']]['sum']['netto'] += $priceNetto;
			$aVatPos[$pos['vat_index']]['sum']['vat'] += $vat;
			$aVatPos[$pos['vat_index']]['sum']['brutto'] += $priceBrutto;
			$aVatPos[$pos['vat_index']]['sum']['vatindex'] = $pos['vat_index'];
			$aVatPos[$pos['vat_index']]['sum']['vatcreditaccount'] = $pos['vat_credit_account'];
		}
		
		foreach($aVatPos as $vatPos){
			$aVatTotal['sum']['netto'] += $vatPos['sum']['netto'];
			$aVatTotal['sum']['vat'] += $vatPos['sum']['vat'];
			$aVatTotal['sum']['brutto'] += $vatPos['sum']['brutto'];
		}
		
		return array(
			'vat_sums' => $aVatPos,
			'total' => $aVatTotal
		);
	}
}
?>