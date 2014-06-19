<?php
/**
 *
 * Controller Order
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Order extends Tinebase_Controller_Record_Abstract
{
	const PROCESS_CONFIRMATION = 'confirm';
	const PROCESS_DELIVERY = 'delivery';
	const PROCESS_BILLING = 'billing';
	//	const PARAMS_TEMPLATE = {'
	//		orderId: null,
	//		process: {
	//			confirm:{
	//				active: false
	//			},
	//			delivery:{
	//				active: false
	//			},
	//			billing: {
	//				active: false
	//			}
	//		}
	//	';
	/**
	 * config of orders
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
		$this->_backend = new Billing_Backend_Order();
		$this->_modelName = 'Billing_Model_Order';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_opController = Billing_Controller_OrderPosition::getInstance();
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
		$_record->__set('order_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('order_nr'));
		if(!$_record->__get('payment_method_id')){
			$_record->__set('payment_method_id', Billing_Controller_PaymentMethod::getInstance()->getDefaultPaymentMethod()->getId());
		}
	}

	/**
	 * Get empty record
	 * @return Billing_Model_Order
	 */
	public function getEmptyOrder(){
		$emptyOrder = new Billing_Model_Order(null,true);
		return $emptyOrder;
	}

	public function requestOrderForContact($contactId){
		$debitor = Billing_Controller_Debitor::getInstance()->getByContactOrCreate($contactId);
		return $this->createOrderForDebitor($debitor);
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $orderId
	 * @param unknown_type $receiptId
	 */
	public function orderReceipt($orderId, $receiptId){
		$order = $this->get($orderId);
		$rcptController = Billing_Controller_Receipt::getInstance();
		$orderPosController = Billing_Controller_OrderPosition::getInstance();
		$receipt = $rcptController->get($receiptId);
		
		$positions = $rcptController->getOrderPositions($receiptId);
		
		foreach($positions as $pos){
			$pos->__set('order_id', $orderId);
			$orderPosController->update($pos);
		}
		
		
		//if($receipt->isBid()){
			//$confirm = Billing_Model_Receipt::createConfirmation();
			$params['data'] = array();
			$params['data']['order_positions'] = $positions;
			$this->confirmOrder($orderId, $params);
		//}
		
		//$positions = $rcptController->getOrderPositions($receiptId);
		
		//$orderPosController->addReceiptPositions($receipt, $positions);
		
		/*foreach($positions as $pos){
			$position = clone $pos;
			$pos->__set('id',null);
			$pos->__set('order_id', $orderId);
			$orderPosController->create($pos);
		}*/
		
		$order = $this->get($orderId);
		return array(
    		'success' => true,
    		'result' => $order->toArray()
		);
		 
	}

	/**
	 * 
	 * Create monition to an order
	 * @param unknown_type $orderId
	 * @param unknown_type $invoiceId
	 */
	public function createMonition($orderId, $invoiceId){
		$rcptController = Billing_Controller_Receipt::getInstance();
		// load invoice (same as get with type check on invoice)
		$invoice = $rcptController->getInvoice($invoiceId);
		$positions = $rcptController->getOrderPositions($invoice->getId());
		 
		$monition = Billing_Model_Receipt::createMonition();
		$monition->__set('order_id',$orderId);
		$monition->__set('monition_fee',0);
		$monition->__set('invoice_nr', $invoice->__get('invoice_nr'));
		$rcptController->create($monition);
		 
		$rPosController = Billing_Controller_ReceiptPosition::getInstance();
		$rPosController->addOrderPositions($monition, $positions);
		 
		$monition = $rcptController->get($monition->getId());
		return array(
    		'success' => true,
    		'result' => $monition->toArray()
		);
	}

	/**
	 * 
	 * Process the order according to given params, including delivery, billing and confirmation
	 * @param unknown_type $orderId
	 * @param unknown_type $params
	 * @throws Exception
	 */
	public function processOrder($orderId, $params){
		if(array_key_exists('process', $params)){
			$processSteps = $params['process'];
		}else{
			throw new Exception('Wrong params!');
		}

		$order = $this->get($orderId);
		$hasShipping = false;
		$hasBilling = false;
		$aShipping = array();
		$aBilling = array();
		foreach($processSteps as $step => $methodParams){
			switch($step){
				case self::PROCESS_CONFIRMATION:
					if($methodParams['active']){
						$order->setConfirmed(new Zend_Date(strftime('%Y-%m-%d')));
						$this->confirmOrder($orderId, $methodParams);
					}
					break;

				case self::PROCESS_DELIVERY:
					if($methodParams['active']){
						$order->setDelivered();
						$hasShipping = true;
						$shipping = $this->deliverOrder($orderId, $methodParams);
						$aShipping = $shipping->toArray();
					}
					break;

				case self::PROCESS_BILLING:
					if($methodParams['active']){
						$order->setBilled();
						$hasBilling = true;
						$billing = $this->billOrder($orderId, $methodParams);
						$aBilling = $billing->toArray();
					}
					break;
			}
		}
		$order->flatten();
		// ->ommitt modlog for order, as update would cause
		// id conflict in timemachine modlog
		$this->_ommitModLog = true;
		$this->update($order);
		$order = $this->get($orderId);
		return array(
    		'success' => true,
    		'result' => $order->toArray(),
			'receipts' => array(
				'shipping' => array(
					'has_shipping' => $hasShipping,
					'data' => $aShipping
				),
				'invoice' => array(
					'has_invoice' => $hasBilling,
					'data' => $aBilling
				)
			)
		);
	}

	/**
	 * 
	 * Return the positions belonging to an order
	 * @param unknown_type $orderId
	 */
	public function getOrderPositions($orderId){
		return $this->_opController->getPositionsByOrderId($orderId);
	}

	/**
	 * 
	 * Attach receipt to order
	 * @param unknown_type $receipt
	 * @param unknown_type $orderId
	 * @param unknown_type $params
	 */
	private function attachReceipt($receipt, $orderId, $params){
		$receipt->__set('order_id',$orderId);
		$receipt = Billing_Controller_Receipt::getInstance()->create($receipt);
		// add actual order positions to receipt (are getting referenced in bill_receipt_position)
		if(!array_key_exists('order_positions', $params['data']) && !is_array($params['data']['order_positions'])){
			$orderPositions = $this->getOrderPositions($orderId);
		}else{
			$orderPositions = $params['data']['order_positions'];
		}
		
		$this->_opController->addReceiptPositions($receipt, $orderPositions );
		
		if($receipt->isInvoice()||$receipt->isCredit()){
			Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptCreated(Billing_Controller_Receipt::getInstance()->get($receipt->getId())));
		}
		
		return $receipt;
	}

	/**
	 * 
	 * Trigger the order confirmation process
	 * @param int $orderId
	 * @param array $params
	 * @return bool	true|false success yes|no
	 */
	public function confirmOrder($orderId, $params){
		$receipt =  Billing_Model_Receipt::createConfirmation();
		if(array_key_exists('data', $params)){
			$receipt->setFromArray($params['data']);
		}
		if(array_key_exists('additionalTemplateData', $params)){
			$receipt->setAdditionalData($params['additionalTemplateData']);
		}
		$receipt->__set('order_confirm_date', new Zend_Date(strftime('%Y-%m-%d')));
		return $this->attachReceipt($receipt, $orderId, $params);
	}

	/**
	 * 
	 * Trigger the order delivery process
	 * @param int $orderId
	 * @param array $params
	 * @return bool	true|false success yes|no
	 */
	public function deliverOrder($orderId, $params){
		$receipt =  Billing_Model_Receipt::createShipping();
		if(array_key_exists('data', $params)){
			$receipt->setFromArray($params['data']);
		}
		if(array_key_exists('additionalTemplateData', $params)){
			$receipt->setAdditionalData($params['additionalTemplateData']);
		}
		$receipt->__set('shipping_date', new Zend_Date(strftime('%Y-%m-%d')));
		return $this->attachReceipt($receipt, $orderId, $params);
	}

	/**
	 * 
	 * Trigger the order billing process
	 * @param int $orderId
	 * @param array $params
	 * @return bool	true|false success yes|no
	 */
	public function billOrder($orderId, $params){
		if(!array_key_exists('receipt_type', $params['data'])){
			$receiptType = Billing_Model_Receipt::TYPE_INVOICE;
		}else{
			$receiptType = $params['data']['receipt_type'];
		}
		
		
		$receipt =  Billing_Model_Receipt::create($receiptType);
		// set base data of receipt
		if(array_key_exists('data', $params)){
			$receipt->setFromArray($params['data']);
		}
		// if there is additional data given, in order to be injected into template
		if(array_key_exists('additionalTemplateData', $params)){
			$receipt->setAdditionalData($params['additionalTemplateData']);
		}
		// set invoice date
		switch($receiptType){
			
			case Billing_Model_Receipt::TYPE_INVOICE:
					if(array_key_exists('invoice_date', $params['data'])){
						// set given daten for invoice date
						$receipt->__set('invoice_date', new Zend_Date($params['data']['invoice_date']));
					}else{
						// set current date for invoice date
						$receipt->__set('invoice_date', new Zend_Date());
					}
				break;
				
			case Billing_Model_Receipt::TYPE_CREDIT:
				if(array_key_exists('credit_date', $params['data'])){
					// set given daten for invoice date
					$receipt->__set('credit_date', new Zend_Date($params['data']['invoice_date']));
				}else{
					// set current date for invoice date
					$receipt->__set('credit_date', new Zend_Date());
				}
				break;
		}
		
		
		// set due date
		// 1) grab due_in_days from payment method
		// 2) add to invoice_date
		
		// shitty name chosen for paymentmethod of receipt -> payment_type
		// hack around it
		if(array_key_exists('payment_method_id', $params['data'])){
			$receipt->__set('payment_method_id', $params['data']['payment_method_id']);
		}
		$dueDate = new Zend_Date();
		$paymentMethod = $receipt->getForeignRecordBreakNull('payment_method_id', Billing_Controller_PaymentMethod::getInstance());
		if($paymentMethod instanceof Billing_Model_PaymentMethod){
			$dueInDays = $paymentMethod->__get('due_in_days');
			if($dueInDays>0){
				$dueDate->add($dueInDays, Zend_Date::DAY);
			}
		}
		$receipt->__set('due_date', $dueDate);
		
		// finally attach receipt to order
		return $this->attachReceipt($receipt, $orderId, $params);
	}

	public function getOrdersByDebitorId($debitorId, $erpContextId = 'ERP', $idsOnly = false){
		$filterGroup = new Tinebase_Model_Filter_FilterGroup(array(),'AND');
		$filter = new Tinebase_Model_Filter_Id('debitor_id','equals',$debitorId);
		$filterGroup->addFilter($filter);
		if($erpContextId){
			$filter = new Tinebase_Model_Filter_Text('erp_context_id','equals',$erpContextId);
			$filterGroup->addFilter($filter);
		}
	
		return $this->search($filterGroup, null, false, $idsOnly);
	}
	
	public function getReceiptsByOrderId($orderId, $type = null, $sortInfo = null){
		$rController = Billing_Controller_Receipt::getInstance();
		$filterGroup = new Tinebase_Model_Filter_FilterGroup(array(),'AND');
		$filter = new Tinebase_Model_Filter_Id('order_id','equals',$orderId);
		$filterGroup->addFilter($filter);
		if($type){
			$filter = new Tinebase_Model_Filter_Text('type','equals',$type);
			$filterGroup->addFilter($filter);
		}
		return $rController->search($filterGroup);
	}
	
	/**
	 * 
	 * Completely reverse an invoice by creating a credit receipt
	 * @param string $receiptId
	 */
	public function reverseInvoice($receiptId, $orderPositionData){
		\org\sopen\dev\DebugLogger::openLogFileOverwrite(CSopen::instance()->getCustomerPath().'/conf/logs/revinvoice.log');
		if(!is_array($orderPositionData)){
			$orderPositionData = Zend_Json::decode($orderPositionData);
		}
		$rController = Billing_Controller_Receipt::getInstance();
		$receipt = $rController->get($receiptId);
		
		if($receipt->__get('receipt_state') !== 'VALID'){
			throw new Billing_Exception_Receipt('Receipt cannot be reverted twice');
		}
		
		$order = $receipt->getForeignRecord('order_id', $this);
		$rpController = Billing_Controller_ReceiptPosition::getInstance();
		$opController = Billing_Controller_OrderPosition::getInstance();
		$receiptPositions = $rpController->getByReceiptId($receiptId);
		
		$creditReceipt = Billing_Model_Receipt::createCredit();
		$creditReceipt->__set('order_id', $order->getId());
		$creditReceipt->__set('invoice_nr', $receipt->__get('invoice_nr'));
		$creditReceipt->__set('credit_date', $receipt->__get('invoice_date'));
		$creditReceipt->__set('invoice_date', $receipt->__get('invoice_date'));
		
		// take same payment method for credit receipt
		$creditReceipt->__set('payment_method_id', $receipt->getForeignId('payment_method_id'));
		
		$creditReceipt->__set('is_cancellation', true);
		$receipt->__set('is_cancelled', true);
		
		\org\sopen\dev\DebugLogger::log('RECHNUNG '. print_r($receipt,true));
		
		
		$creditReceipt = $rController->create($creditReceipt);
		
		$creditReceipt = $rController->get($creditReceipt->getId());
		$countPos = count($receiptPositions);
		$creditPositions = array();
		$opCount = count($orderPositionData);
		$aOrderPosData = null;
		if(is_array($orderPositionData)){
			$aOrderPosData = org\sopen\app\util\arrays\ArrayHelper::getIndexedWithPropertyFromList($orderPositionData, 'id');
		}
		
		$partReverse = false;
		
		foreach($receiptPositions as $invoicePosition){
			//print_r($invoicePosition);
			
			if(	
				is_array($aOrderPosData) &&
				$opCount>0 && 
				(!array_key_exists($invoicePosition->getId(), $aOrderPosData) ||
				!($aOrderPosData[$invoicePosition->getId()]['invert_amount'])
				)
			){
				$partReverse = true;
				continue;
			}
			$creditPosition = clone $invoicePosition;
			$creditPosition->__set('id', null);
			$creditPosition->__set('position_nr', ++$countPos);
			$creditPosition->__set('name', $creditPosition->__get('name') . ' -STORNO');
			if(
				is_array($aOrderPosData) &&
				array_key_exists($invoicePosition->getId(), $aOrderPosData) &&
				$aOrderPosData[$invoicePosition->getId()]['invert_amount']
			){
				$creditPosition->__set('amount', $aOrderPosData[$invoicePosition->getId()]['invert_amount']);
			}
			$opController->invert($creditPosition);
			$creditPosition->flatten();
			$creditPositions[] = $opController->create($creditPosition);
		}
		$rpController->addOrderPositions($creditReceipt, $creditPositions);
		
		$creditReceipt = Billing_Controller_Receipt::getInstance()->get($creditReceipt->getId());
		
		
		
		/*
		 
		<value>REVERTED</value>
		<value>PARTLYREVERTED</value>
		<value>ISREVERSION</value>
		<value>ISPARTREVERSION</value>
		 
		 */
		
		$receipt->__set('receipt_state', 'REVERTED');
		$creditReceipt->__set('receipt_state', 'ISREVERSION');
		$receipt->__set('revision_receipt_id', $creditReceipt->getId());
		$creditReceipt->__set('revision_receipt_id', $receipt->getId());
		//$creditReceipt->__set('payment_state', 'PAYED');
		$creditReceipt->__set('open_sum', (-1) * (float) $receipt->__get('open_sum'));
		//$creditReceipt->__set('payed_sum',$creditReceipt->__get('total_brutto'));
		
		$creditReceipt->payTotal();
		if($partReverse){
			$receipt->__set('payment_state','PARTLYPAYED');
			$receipt->__set('receipt_state', 'PARTLYREVERTED');
			$creditReceipt->__set('receipt_state', 'ISPARTREVERSION');
			$receipt->payValue($creditReceipt->__get('total_brutto'));
		}else{
			try{
				$receipt->payTotal();
			}catch(Exception $e){
				// @todo: silent failure: check OK
			}
		}
		
		$creditReceipt->__set('donation_id', $receipt->getForeignId('donation_id'));
		$creditReceipt->__set('reversion_record_id', $receipt->getId());
		$creditReceipt->__set('revision_receipt_id', $receipt->getId());
		
		$receipt->__set('reversion_record_id', $creditReceipt->getId());
		$receipt->__set('revision_receipt_id', $creditReceipt->getId());
		
		$receipt = $rController->update($receipt);
		
		$tags = $receipt->__get('tags');
		if($tags){
			$creditReceipt->__set('tags', $tags->toArray());
		}
		
		$creditReceipt = $rController->update($creditReceipt);
		
		\org\sopen\dev\DebugLogger::log('RECHNUNG_update '. print_r($receipt,true));
		\org\sopen\dev\DebugLogger::log('GUTSCHRIFT '. print_r($creditReceipt,true));
		
		Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptCreated($creditReceipt));
		
		Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptReverted($receipt, $creditReceipt));
		\org\sopen\dev\DebugLogger::close();
		return $creditReceipt;
	}

	/**
	 *
	 * Create quick order
	 * -> creates order including receipts (invoice, and optional shipping doc)
	 * @param 	array 	$data
	 * @return	array	result
	 */
	public function createQuickOrder( $data ){
		$contactId = $data['contactId'];
		$paymentState = $data['paymentState'];
		$paymentConditions = $data['paymentConditions'];
		$paymentMethodId = $data['paymentMethodId'];
		$withShippingDoc = $data['withShippingDoc'];
		$positions = $data['positions'];
		$contactPersonId = $data['contactPersonId'];
		$addPercentage = $data['addPercentage'];
		$tag = $data['tag'];
		

		// get needed controllers
		$receiptController = Billing_Controller_Receipt::getInstance();
		$articleController = Billing_Controller_Article::getInstance();
		 
		$debitor = Billing_Controller_Debitor::getInstance()->getByContactOrCreate($contactId);
		// create order
		$order = $this->getEmptyOrder();
		$order->__set('payment_state', $paymentState);
		$order->__set('debitor_id', $debitor->getId());
		$order->__set('price_group_id', $debitor->__get('price_group_id'));
		
		if($tag){
			$aOrderTags = $order->__get('tags');
			$aOrderTags[] = $tag;
			$order->__set('tags',$aOrderTags);
		}
		if(array_key_exists('erpContextId', $data)){
			$order->__set('erp_context_id', $data['erpContextId']);
		}
		$order->flatten();
		$order = $this->create($order);

		$this->addOrderPositions($order->getId(),$positions, $debitor);
		$billingData = array(
			'payment_method_id' => $paymentMethodId,
			'payment_conditions' => $paymentConditions,
			'add_percentage' => $addPercentage
		);
		
		if($tag){
			$billingData['tags'] = array($tag);
		}
		
		$withBilling = true;
		$confirmation = false;
		if(array_key_exists('confirmation', $data) && $data['confirmation']==1){
			$withBilling = false;
			$confirmation = true;
		}
		
		if(array_key_exists('templateId',$data)){
			$billingData['template_id'] = $data['templateId'];
		}
		
		// additional data: by now, only contactperson id will be put into
		$additionalData = array();
		if($contactPersonId){
			$additionalData['contactPersonId'] = $contactPersonId;
		}
		
		$params = array(
			'process' => array(
				'billing' => array(
					'active' => $withBilling,
					'data' => $billingData,
					'additionalTemplateData' => $additionalData
		),
				'delivery' => array(
					'active' => $withShippingDoc,
					'additionalTemplateData' => $additionalData
		),
				self::PROCESS_CONFIRMATION => array(
					'active' => $confirmation,
					'additionalTemplateData' => $additionalData
		)
		)
		);

		$this->processOrder($order->getId(), $params);

		$invoices = $this->getReceiptsByOrderId($order->getId(),'INVOICE');
		$shippings = $this->getReceiptsByOrderId($order->getId(),'SHIPPING');
		$confirmations = $this->getReceiptsByOrderId($order->getId(),'CONFIRM');

		return array(
			'order_nr' => $order->__get('order_nr'),
			'invoices' => $invoices->toArray(),
			'shippings' =>$shippings->toArray(),
			'confirmations' =>$confirmations->toArray()
		);
	}

	/**
	 * 
	 * create order for given debitor, optional positions (get created if existent)
	 * @param unknown_type $debitorId
	 * @param array $positions
	 */
	public function createOrderForDebitor($debitorId, array $positions = null, $context = null){

		$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
		 
		$order = $this->getEmptyOrder();
		$order->__set('debitor_id', $debitor->getId());
		$order->__set('price_group_id', $debitor->__get('price_group_id')->getId());
		if(!is_null($context)){
			$order->__set('erp_context_id', $context);
		}
		return $this->create($order);
	}

	/**
	 * 
	 * add positions to order
	 * @param unknown_type $orderId
	 * @param unknown_type $positions
	 * @param unknown_type $debitor
	 */
	public function addOrderPositions($orderId, $positions, $debitor){
		$orderPositionController = Billing_Controller_OrderPosition::getInstance();
		$articleController = Billing_Controller_Article::getInstance();
		
		// create order positions
		$posCount = 0;
		foreach($positions as $position){
			++$posCount;
			$articleId = $position['article_id'];
			if($articleId){
				$article = $articleController->get($articleId);
				$orderPos = $orderPositionController->getPositionFromArticle($article, $debitor, $position);
			}else{
				$order = $this->get($orderId);
				$order->flatten();
				$orderPos = new Billing_Model_OrderPosition(null,true);
				$orderPos->__set('price_group_id', $order->__get('price_group_id'));
				$unitId = Billing_Controller_ArticleUnit::getInstance()->get(1);
				$vatId = Billing_Controller_Vat::getInstance()->get(1);
				$vat2Id = Billing_Controller_Vat::getInstance()->getByName(0);
				
				$orderPos->__set('amount',$position['amount']);
				$orderPos->__set('unit_id',$unitId);
				$orderPos->__set('vat_id',$vatId);
				$orderPos->__set('price2_vat_id',$vat2Id);
				$orderPos->__set('name',$position['name']);
				if(array_key_exists('additionalData', $position)){
					$orderPos->setAdditionalData($position['additionalData']);
				}
			}
			$orderPos->__set('position_nr', $posCount);
			$orderPos->__set('price_brutto', $position['price_brutto']);
			$orderPos->__set('price_netto', $position['price_netto']);
			$orderPos->__set('total_brutto', $position['total_brutto']);
			$orderPos->__set('total_netto', $position['total_netto']);
			
			//$orderPos->__set('price2_brutto', ($position['price2_brutto']?$position['price2_brutto'],0));
			
			$orderPos->__set('price2_brutto', ($position['price2_brutto']?$position['price2_brutto']:0));
			$orderPos->__set('price2_brutto', ($position['price2_netto']?$position['price2_netto']:0));
			$orderPos->__set('price2_brutto', ($position['total2_brutto']?$position['total2_brutto']:0));
			$orderPos->__set('price2_brutto', ($position['total2_netto']?$position['total2_netto']:0));
			$orderPos->__set('price2_brutto', ($position['total1_brutto']?$position['total1_brutto']:0));
			$orderPos->__set('price2_brutto', ($position['total1_netto']?$position['total1_netto']:0));
			
			$orderPos->__set('order_id',$orderId);
			$orderPositionController->create($orderPos);
		}	
	}
	
	public function createReceipt($data, $transaction = null){
		// TODO: Use specific Exceptions
		if(!array_key_exists('receipt', $data)){
			throw new Exception('Missing param receipt');
		}
		 
		$aPReceipt = $data['receipt'];
		 
		if(!array_key_exists('type', $aPReceipt)){
			throw new Exception('Missing param type');
		}
		 
		$type = $aPReceipt['type'];
		 
		if(!Billing_Model_Receipt::isValidType($type)){
			throw new Exception('Illegal/unknown receipt type');
		}
		 
		$orderId = $aPReceipt['orderId'];
		 
		$receiptController = Billing_Controller_Receipt::getInstance();

		$receipt = $receiptController->getEmptyReceipt();
		$shippingDoc = null;
		$receipt->__set('order_id',$orderId);
		$receipt->__set('type', $type);

		if(array_key_exists('receiptData', $aPReceipt)){
			$receiptData = $aPReceipt['receiptData'];
			foreach($receiptData as $key => $value){
				$receipt->__set($key, $value);
			}
		}
		
		$receipt = $receiptController->create($receipt);

		if(array_key_exists('positions',$aPReceipt)){
			$positions = $aPReceipt['positions'];
			$receiptPositionController = Billing_Controller_OrderPosition::getInstance();
			 
			$posCount = 0;
			foreach($positions as $posData){
				$receiptPosition = $receiptPositionController->getEmptyOrderPosition();
				$receiptPosition->__set('receipt_id', $receipt->getId());
				$receiptPosition->__set('position_nr', ++$posCount);

				foreach($posData['positionData'] as $key => $value){
					if($key == 'price_group_id'){
						if(is_array($value)){
							$value = $value['id'];
						}elseif(is_object($value)){
							$value = $value->getId();
						}
					}
					$receiptPosition->__set($key,$value);
				}
				if(array_key_exists('additionalData', $posData)){
					$receiptPosition->setAdditionalData($posData['additionalData']);
				}
				$receiptPositionController->create($receiptPosition);
			}
		}
		
		return $receipt->getId();
	}

	public function getRegistryData(){
		$result = array(
            'results'     => array(
    			'PROCESS_CONFIRMATION' => self::PROCESS_CONFIRMATION,
    			'PROCESS_DELIVERY' => self::PROCESS_DELIVERY,
    			'PROCESS_BILLING' => self::PROCESS_BILLING
		),
            'totalcount'  => 0
		);
		return $result;
	}

	/**
	 * 
	 * Export to DATEV
	 * @param string $filters Json encoded filters
	 */
	public function exportFibu($filters){
		set_time_limit(0);
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		$tId = $tm->startTransaction($db);
		try{
			$filters = Zend_Json::decode($filters);
			$checkFilter = new Billing_Model_OpenItemFilter($filters, 'AND');
			$pagination = array('sort' => 'op_nr', 'dir' => 'ASC');
			$oIController = Billing_Controller_OpenItem::getInstance();
			$debController = Billing_Controller_Debitor::getInstance();
			
			$rController = Billing_Controller_Receipt::getInstance();
			$oController = Billing_Controller_Order::getInstance();
			$oPController = Billing_Controller_OrderPosition::getInstance();
			$aController = Billing_Controller_Article::getInstance();
			$cController = 
				Addressbook_Controller_Contact::getInstance()->
					_setRightChecks(false)->
					_setContainerACLChecks(false);

			// if filter contains fibu_exp_date-filter -> force reexport!
			if(!$checkFilter->isFilterSet('fibu_exp_date')){
				$fibuFilter = array(
					'field' => 'fibu_exp_date',
					'operator' => 'isnull',
					'value' => ''
				);
				$filters[] = $fibuFilter;
			}			
			
			$filter = new Billing_Model_OpenItemFilter($filters, 'AND');
			
			$openItemIds =  $oIController->search($filter,new Tinebase_Model_Pagination($pagination),false,true);

			/*
			 *
					- Rechnungsnummer (redundant für alle Positionen)
					
					- Rechnungsdatum (redundant für alle Positionen)
					
					- Datum Fälligkeit (redundant für alle Positionen)
					
					- Debitorennummer (redundant für alle Positionen)
					
					- Betrag netto
					
					- MWST
					
					- Betrag brutto
					
					- Artikelnummer
					
					- Artikelbezeichnung
					
					- Erlöskonto (aus Artikelstamm gemäß MWST = 0 oder > 0)
		 	*
		 	
Umsatz (mit Soll/Haben-Kz)	Konto	Gegenkonto (ohne BU-Schl�ssel)	Belegdatum	Belegfeld 1	Buchungstext	Kennzeichen			D_Opos
299,22						1000200	440000							12.01.2012	101			Rechnung101		Forderungsart "1"	D_Opos

		 	
		 	
		 	*
		 	*/
			$csvArray = array(
    		'Umsatz (mit Soll/Haben-Kz)',
    		'Konto',
    		'Gegenkonto (ohne BU-Schlüssel)',
			'Belegdatum',
	    	'Belegfeld',
			'Buchungstext',
			'Kennzeichen',
			'D_Opos'
	    	);
	    	/*
	    	 * 
	    	 * 
	    	  	- Debitorennummer

				- Vorname
				
				- Name
				
				- Anrede
				
				- Titel
				
				- Firma 1
				
				- Firma 2
				
				- Zusatz
				
				- Straße
				
				- PLZ
				
				- Ort
				
				- Land
				
Kontonummer	Unternehmen			Anrede	Titel		Vorname	Name1	Adressattyp	UST ID	Stra�e	Postfach	Postleitzahl	Ort	Land	Bankleitzahl 1	Bankbez. 1	Bank-Kontonummer 1	Bank-L�nderkennz. 1	IBAN-Nr. 1	SWIFT-Code 1	Bankleitzahl 2	Bankbez. 2	Bank-Kontonummer2	Bank-L�nderkennz. 2	IBAN-Nr. 2	SWIFT-Code 2
5841100		Acuarios Jandia Sotavento Beach Club B.Lehmann				Lehmann & Buschmann	2	DE111667148	Wefelen 27		35627	Costa-Calma/Fuerte.	Spanien	70050000	Bayern LB M�nchen	2034343	DE	DE14700500000002034343	BYLADEMM						
5841200							Herr	Prof. Dr.	Hansi	Gustavo	1	DE111667148	Wefelen 29		52134	Herzogenrath		39050000	Sparkasse Aachen	47176987									
				
				
				
				
				
				
	    	 */
	    	$debsArray = array(
    		'Kontonummer',
	    	'Unternehmen',
    		'Anrede',
    		'Titel',
    		'Vorname',
    		'Name1',
			'Adressattyp', // 2= Firma, 1= Person
	    	'UST ID',
			'Straße',
	    	'Postfach',
	    	'Postleitzahl',
	    	'Ort',
	    	'Land',
	    	//Bankleitzahl 1	Bankbez. 1	Bank-Kontonummer 1	Bank-L�nderkennz. 1	IBAN-Nr. 1	SWIFT-Code 1
	    	'Bankleitzahl 1',
	    	'Bankbez. 1',
	    	'Bank-Kontonummer 1',
	    	'Bank-Länderkennz. 1',
	    	'IBAN-Nr. 1',
	    	'SWIFT-Code 1',
	    	'Bankbez. 2',
	    	'Bank-Kontonummer 2',
	    	'Bank-Länderkennz. 2',
	    	'IBAN-Nr. 2',
	    	'SWIFT-Code 2'
	    	);
	    	 
	    	$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
	    	$itemsFilename = $tempFilePath.strftime('%Y%m%d%H%M%S').'items_temp.csv';
	    	$debsFilename = $tempFilePath.strftime('%Y%m%d%H%M%S').'debs_temp.csv';
	    	$zipFilename = $tempFilePath.strftime('%Y%m%d%H%M%S').'archive_temp.csv';
	    	
	    	if(file_exists($itemsFilename)){
	    		unlink($itemsFilename);
	    	}
	    	$itemsFileHandle = fopen($itemsFilename, 'w');
	    	//$filePointer, $dataArray, $delimiter=',', $enclosure='"', $escapeEnclosure='"'
	    	Tinebase_Export_Csv::fputcsvEncoding('ISO-8859-1//TRANSLIT', $itemsFileHandle, $csvArray, chr(9), '"', '');
	    	
	    	if(file_exists($debsFilename)){
	    		unlink($debsFilename);
	    	}
	    	
	    	
	    	$debsFileHandle = fopen($debsFilename, 'w');
	    	Tinebase_Export_Csv::fputcsvEncoding('ISO-8859-1//TRANSLIT', $debsFileHandle, $debsArray, chr(9), '"', '');

	    	$zeroVat = Billing_Controller_Vat::getInstance()->getByName('0');
	    	$creditorZeroAccount = $zeroVat->__get('credit_account');
	    	$fibuExpDate = new Zend_Date(strftime('%Y-%m-%d'));
	    	$adType = 1;

	    	foreach ($openItemIds as $openItemId) {
	    		$oI = Billing_Controller_OpenItem::getInstance()->get($openItemId);
	    		$oI->flatten();
	    		$receiptId = $oI->__get('receipt_id');
	    		$receipt = $rController->get($receiptId);
	    		if(!$receipt->__get('fibu_exp_date')){
	    			$receipt->__set('fibu_exp_date', $fibuExpDate);
	    			$receipt->flatten();
	    			//print_r($receipt);
	    			$rController->update($receipt);
	    		}
	    		$oI->__set('fibu_exp_date', $fibuExpDate);
	    		$oIController->update($oI);
	    		$positions = $rController->getOrderPositions($receiptId);
	    		//$sums = $rController->getReceiptSumValues($receiptId);
	    		$orderId = $receipt->__get('order_id');
	    			
	    		$order = $oController->get($orderId);
	    		$debitor = $order->__get('debitor_id');
	    		$debitorNr = $debitor->__get('debitor_nr');
	    		$contact = $debitor->getForeignRecord('contact_id', $cController);
	    		$debitor->flatten();
	    		$contactId = $debitor->__get('contact_id');
	    		
	    		$name = $contact->__get('n_fileas');
	    		$receiptNr = $oI->__get('receipt_nr');

	    		$adType = 1;
	    		if($contact->__get('org_name') && $contact->getLetterDrawee()->isCompany()){
		    		$adType = 2;
		    	}
	    		
	    		
	    		$dueDate = $receipt->__get('due_date');
	    		
	    		if(!$debitor->__get('fibu_exp_date')){
		    		$drawee = $contact->getInvoiceDrawee();
		    		$postal = $drawee->getPostalAddress();
		    		$pf = '';
		    		$street = '';
		    		if(strpos($postal->getStreet(), 'Post')){
		    			$pf = $postal->getStreet();
		    		}else{
		    			$street = $postal->getStreet();
		    		}
		    		// export debitor
		    		$debsArray = array(
		    			$debitorNr,
		    			$contact->__get('org_name'),
		    			$drawee->getSalutationText(),
		    			$drawee->getTitle(),
		    			$contact->__get('n_given'),
		    			$contact->__get('n_family'),
		    			$adType,
		    			$debitor->__get('ust_id'),
		    			$street,
		    			$pf,
		    			$postal->getPostalCode(),
		    			$postal->getLocation(),
		    			$postal->getCountryCode('DE'),
		    			$contact->__get('bank_code'),
		    			$contact->__get('bank_name'),
		    			$contact->__get('bank_account_number'),
		    			(trim($contact->__get('bank_code'))?$postal->getCountryCode():''),
		    			'','', // iban swift bank1 empty
		    			'','','','','','' // bank2 empty
	    			);
	    			Tinebase_Export_Csv::fputcsvEncoding('ISO-8859-1//TRANSLIT', $debsFileHandle, $debsArray, chr(9), '"', '');
	    			$debitor->__set('fibu_exp_date', new Zend_Date());
	    			$debController->update($debitor);
	    		}
	    		
	    		
//	    		$values = array();
//	    		$values[] = array(
//				'value' => $sums['total']['sum']['netto'],
//				'credit_account' => $creditorZeroAccount
//	    		);
//	    			
//	    		foreach($sums['vat_sums'] as $vatSum){
//	    			$values[] = array(
//					'value' =>  $vatSum['sum']['netto'],
//					'credit_account' =>  $vatSum['sum']['vatcreditaccount']
//	    			);
//	    		}
//Umsatz (mit Soll/Haben-Kz)	Konto	Gegenkonto (ohne BU-Schl�ssel)	Belegdatum	Belegfeld 1	Buchungstext	Kennzeichen			D_Opos
//299,22						1000200	440000							12.01.2012	101			Rechnung101		Forderungsart "1"	D_Opos
	    		
	    		$receiptText = '';
	    		if($receipt->__get('type')==Billing_Model_Receipt::TYPE_INVOICE){
	    			$receiptText = 'Rechnung';
	    			$receiptDate = $receipt->__get('invoice_date');
	    			$receiptNr = $receipt->__get('invoice_nr');
	    		}else{
	    			$receiptText = 'Gutschrift';
	    			$receiptDate = $receipt->__get('credit_date');
	    			$receiptNr = $receipt->__get('credit_nr');
	    		}
	    		
	    		$bookingText = $receiptText.$receiptNr;
	    		
	    		/*if($oI->__get('usage')){
	    			$bookingText = $oI->__get('usage');
	    		}*/
	    		
	    		$paymentMethodId = $receipt->getForeignId('payment_method_id');
	    		$mapPaymentMethod = array(
	    			'PREPAYMENT' => 1,
	    			'BANKTRANSFER' => 2,
	    			'DEBIT' => 3,
	    			'CASH' => 4,
	    			'CREDITCARD' => 5,
	    			'PAYPAL' => 6,
	    			'IMMEDIATETRANSFER' => 7
	    		);
	    		$intPaymentMethod = $mapPaymentMethod[$paymentMethodId];
	    		foreach($positions as $position){
					$brutto = $position->__get('total_brutto');
					//$vatSum = $oPController->getVatSum($position);
	    			//$article = $position->getForeignRecord('article_id', $aController);
	    			//$articleName = $article->__get('name');
	    			//$articleNr = $article->__get('article_nr');
	    			$revAccount = $oPController->getRevenueAccountAccordingToVat($position).'00';
	    			$csvArray = array(
		    			number_format($brutto,2,',','.'),
		    			$debitorNr,
		    			$revAccount,
		    			\org\sopen\app\util\format\Date::format($receiptDate),
		    			$receiptNr,
		    			$bookingText,
		    			'Forderungsart '.$intPaymentMethod,
		    			'D_Opos'
	    			);
	    			Tinebase_Export_Csv::fputcsvEncoding('ISO-8859-1//TRANSLIT', $itemsFileHandle, $csvArray, chr(9), '"', '');
	    		}
	    	}
	    	
	    	fclose($itemsFileHandle);
	    	fclose($debsFileHandle);
	    	
	    	// -> generate zip archive containing Debitoren.csv and Forderungen.csv
	    	$zip = new ZipArchive();
			$zipFile = $zipFilename.".zip";
	    	if ($zip->open($zipFile, ZIPARCHIVE::CREATE)!==TRUE) {
		    	exit("cannot open <$zipFile>\n");
			}
			
			$zip->addFile($debsFilename, 'Debitoren.csv');
			$zip->addFile($itemsFilename, 'Forderungen.csv');
			
			$zip->close();
	    	$tm->commitTransaction($tId);

		}catch(Exception $e){
			$tm->rollback($tId);
			echo $e->__toString();
			exit;
		}
		 
		header("Content-type: application/zip;\n"); 
		header("Content-Transfer-Encoding: binary");
		$len = filesize($zipFile);
		header("Content-Length: $len;\n");

		header("Content-Disposition: attachment; filename=\"DATEV.zip\";\n\n");
		readfile($zipFile);
		
		unlink($zipFile);
		unlink($debsFilename);
		unlink($itemsFilename);
	}
}
?>