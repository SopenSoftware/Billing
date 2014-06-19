<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_Receipt extends Tinebase_Record_Abstract
{
	const TYPE_CALCULATION = 'CALCULATION';
	const TYPE_BID = 'BID';
	const TYPE_CONFIRM = 'CONFIRM';
	const TYPE_PARTSHIP = 'PARTSHIP';
	const TYPE_SHIPPING = 'SHIPPING';
    const TYPE_PARTINVOICE = 'PARTINVOICE';
	const TYPE_INVOICE = 'INVOICE';
	const TYPE_CREDIT = 'CREDIT';
	const TYPE_MONITION = 'MONITION';
	
	// type used for filtering
	//-> get invoices and credits in one list
	const TYPE_INVOICE_AND_CREDIT = 'INVOICE_AND_CREDIT';
		
	
	protected static $allowedTypes = array(
		self::TYPE_CALCULATION => true,
		self::TYPE_BID => true,
		self::TYPE_CONFIRM => true,
		self::TYPE_PARTSHIP => true,
		self::TYPE_SHIPPING => true,
		self::TYPE_PARTINVOICE => true,
		self::TYPE_INVOICE => true,
		self::TYPE_CREDIT => true,
		self::TYPE_MONITION => true
	);
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $type
	 * @throws Exception
	 */
	public static function create($type){
		if(!self::isValidType($type)){
			throw new Exception('Invalid receipt type given');
		}
		$obj = new self();
		$obj->__set('type', $type);
		return $obj;
	}
	/**
	 * 
	 * Enter description here ...
	 */
	public static function createBid(){
		return self::create(self::TYPE_BID);
	}
	/**
	 * 
	 * Enter description here ...
	 */
	public static function createConfirmation(){
		return self::create(self::TYPE_CONFIRM);
	}
	/**
	 * 
	 * Enter description here ...
	 */
	public static function createShipping(){
		return self::create(self::TYPE_SHIPPING);
	}
	/**
	 * 
	 * Enter description here ...
	 */
	public static function createInvoice(){
		return self::create(self::TYPE_INVOICE);
	}
	
	public static function createCredit(){
		return self::create(self::TYPE_CREDIT);
	}
	
	public static function createMonition(){
		return self::create(self::TYPE_MONITION);
	}
	
	public function isInvoice(){
		return $this->__get('type') == self::TYPE_INVOICE;
	}
	
	public function isCredit(){
		return $this->__get('type') == self::TYPE_CREDIT;
	}
	
	public function isMonition(){
		return $this->__get('type') == self::TYPE_MONITION;
	}
	
	
	public function isCancelled(){
    	return $this->__get('is_cancelled') == 1;
    }
    
	public function isCancellation(){
    	return $this->__get('is_cancellation') == 1;
    }
	
    /**
     * key in $_validators/$_properties array for the filed which
     * represents the identifier
     *
     * @var string
     */
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Billing';
    
    /**
     * 
     * Check whether a type is allowed/known
     * @param string $type
     */
    public static function isValidType( $type ){
    	return array_key_exists( $type, self::$allowedTypes );
    }
    
    /**
     * list of zend validator
     *
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     *
     */
    protected $_validators = array(
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'erp_context_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'order_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'revision_receipt_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'payment_method_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'calc_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'bid_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'confirm_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'part_ship_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'ship_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'part_invoice_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'invoice_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'credit_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'monition_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_fee'		 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_level'		 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'discount_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'bid_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'bid_shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'confirm_shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_in_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_confirm_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'invoice_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'credit_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'fibu_exp_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'due_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'upper_textblock'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'lower_textblock'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'shipping_conditions'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_conditions'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'payment_type'	  		=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
        // modlog
       	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// tags, notes etc.
    	'tags'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'notes'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        //'relations'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'customfields'          => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => array()),
    	'preview_template_id'  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'template_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'print_date'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_netto'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_brutto'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_weight'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'open_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payed_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'pos_count'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'additional_template_data'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'payment_state'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'receipt_state'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'add_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),

    	'booking_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
   		'donation_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'reversion_record_id'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_cancelled'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_cancellation'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_member'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'period'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'fee_group_id'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'bank_account_usage_id'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true)
	    
    );
    protected $_dateFields = array(
        // modlog
     	'creation_time',
        'last_modified_time',
        'deleted_time',
        //
	    'bid_date',
	    'bid_shipping_date',
	    'confirm_shipping_date',
	    'order_in_date',
	    'order_confirm_date',
	    'shipping_date',
	    'invoice_date',
	    'fibu_exp_date',
	    'due_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['calc_nr']) || $_data['calc_nr']==""){
			unset($_data['calc_nr']);
		}
		if(empty($_data['bid_nr']) || $_data['bid_nr']==""){
			unset($_data['bid_nr']);
		}
		if(empty($_data['confirm_nr']) || $_data['confirm_nr']==""){
			unset($_data['confirm_nr']);
		}
		if(empty($_data['part_ship_nr']) || $_data['part_ship_nr']==""){
			unset($_data['part_ship_nr']);
		}		
		if(empty($_data['ship_nr']) || $_data['ship_nr']==""){
			unset($_data['ship_nr']);
		}				
		
		if(empty($_data['part_invoice_nr']) || $_data['part_invoice_nr']==""){
			unset($_data['part_invoice_nr']);
		}				
		
		if(empty($_data['invoice_nr']) || $_data['invoice_nr']==""){
			$_data['invoice_nr'] = null;
		}		

		if(empty($_data['bid_date']) || $_data['bid_date']==""){
			unset($_data['bid_date']);
		}
		
		if(empty($_data['bid_shipping_date']) || $_data['bid_shipping_date']==""){
			unset($_data['bid_shipping_date']);
		}
		
		if(empty($_data['shipping_date']) || $_data['shipping_date']==""){
			unset($_data['shipping_date']);
		}
		
				
		if(empty($_data['confirm_shipping_date']) || $_data['confirm_shipping_date']==""){
			unset($_data['confirm_shipping_date']);
		}
		if(empty($_data['order_in_date']) || $_data['order_in_date']==""){
			unset($_data['order_in_date']);
		}
		if(empty($_data['invoice_date']) || $_data['invoice_date']==""){
			unset($_data['invoice_date']);
		}
		if(empty($_data['valid_to_date']) || $_data['valid_to_date']==""){
			unset($_data['valid_to_date']);
		}
		if(empty($_data['print_date']) || $_data['print_date']==""){
			$_data['print_date'] = null;
		}
		if(empty($_data['due_date']) || $_data['due_date']==""){
			$_data['due_date'] = null;
		}
		if(empty($_data['discount_total']) || $_data['discount_total']==""){
			$_data['discount_total']=0;
		}	

		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['calc_nr']) || $_data['calc_nr']==""){
			unset($_data['calc_nr']);
		}
		if(empty($_data['bid_nr']) || $_data['bid_nr']==""){
			unset($_data['bid_nr']);
		}
		if(empty($_data['confirm_nr']) || $_data['confirm_nr']==""){
			unset($_data['confirm_nr']);
		}
		if(empty($_data['part_ship_nr']) || $_data['part_ship_nr']==""){
			unset($_data['part_ship_nr']);
		}		
		if(empty($_data['ship_nr']) || $_data['ship_nr']==""){
			unset($_data['ship_nr']);
		}		
		
		if(empty($_data['part_invoice_nr']) || $_data['part_invoice_nr']==""){
			unset($_data['part_invoice_nr']);
		}
						
		if(empty($_data['invoice_nr']) || $_data['invoice_nr']==""){
			unset($_data['invoice_nr']);
		}	

		if(empty($_data['bid_date']) || $_data['bid_date']==""){
			unset($_data['bid_date']);
		}
		
		if(empty($_data['shipping_date']) || $_data['shipping_date']==""){
			unset($_data['shipping_date']);
		}
		
			
		if(empty($_data['confirm_shipping_date']) || $_data['confirm_shipping_date']==""){
			unset($_data['confirm_shipping_date']);
		}
		if(empty($_data['order_in_date']) || $_data['order_in_date']==""){
			unset($_data['order_in_date']);
		}
		if(empty($_data['bid_shipping_date']) || $_data['bid_shipping_date']==""){
			unset($_data['bid_shipping_date']);
		}
		
		if(empty($_data['invoice_date']) || $_data['invoice_date']==""){
			unset($_data['invoice_date']);
		}
		if(empty($_data['fibu_exp_date']) || $_data['fibu_exp_date']==""){
			unset($_data['fibu_exp_date']);
		}
		if(empty($_data['print_date']) || $_data['print_date']==""){
			$_data['print_date'] = null;
		}
		if(empty($_data['due_date']) || $_data['due_date']==""){
			$_data['due_date'] = null;
		}
		if(empty($_data['discount_total']) || $_data['discount_total']==""){
			$_data['discount_total']=0;
		}	
	}
	
	public function hasAdditionalItem($key){
		$arr = $this->getAdditionalData();
		
		if(is_array($arr) && array_key_exists($key, $arr)){
			return true;
		}
		return false;
	}
	
	public function getAdditionalItem($key){
		if(!$this->hasAdditionalItem($key)){
			return null;
		}
		$arr = $this->getAdditionalData();
		return $arr[$key];
	}
	
    /**
     * 
     * Set array of additional data json encoded
     * @param array $data
     */
    public function setAdditionalData(array $data){
    	$this->__set('additional_template_data', Zend_Json::encode($data));
    }
    
    /**
     * 
     * Get Additional data as array (json decoded)
     * @return	array
     */
    public function getAdditionalData(){
    	return Zend_Json::decode($this->__get('additional_template_data'));
    }
    
    public function copyAdditionalDataTo(Billing_Model_Receipt $toReceipt){
    	$toReceipt->setAdditionalData($this->getAdditionalData());
    }
    
    public function syncOpenItem(Billing_Model_OpenItem $openItem){
    	$this->__set('payment_state', Billing_Model_OpenItem::$convertState($openItem->__get('payment_state')));
    	$this->__set('open_sum', $openItem->__get('open_sum'));
        $this->__set('payed_sum', $openItem->__get('payed_sum'));
    }
    
   
    
    public function getDebitor(){
    	$order = $this->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
    	return $order->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
    }
    
    public function getContact(){
    	$debitor = $this->getDebitor();
    	return $debitor->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
    }
    
    public function getBookingData($fibuKto){
    	$orderPositions = Billing_Controller_ReceiptPosition::getInstance()->getByReceiptId($this->getId());
    	$order = $this->getForeignRecord('order_id', Billing_Controller_Order::getInstance());
    	$debitorId = $order->getForeignId('debitor_id');
    	
    	$totalBrutto = abs((float)$this->__get('total_brutto'));
    	
    	$articleKtos = array();
    	foreach($orderPositions as $orderPosition){
    		$article = $orderPosition->getForeignRecordBreakNull('article_id', Billing_Controller_Article::getInstance());
    		$kto = $article->getForeignId('rev_account_vat_in');
    		$value = abs((float)$orderPosition->__get('total_brutto'));
    		
    		if($article->createsDonation()){
    			$donAmount = abs($orderPosition->__get('amount')) * $article->__get('donation_amount');
    			$campaignId = $article->getForeignId('donation_campaign_id');
    			$value -= $donAmount;
    			$campaign = Donator_Controller_Campaign::getInstance()->get($campaignId);
    			$dErloesKto = $campaign->getForeignId('erp_proceed_account_id'); 
    			$articleKtos[] = array( 'kto' => $dErloesKto, 'value' => $donAmount, 'debitor' => $debitorId);
    		}
    		
    		$articleKtos[] = array( 'kto' => $kto, 'value' => $value, 'debitor' => $debitorId);
    	}
    	
    	if($this->isInvoice()){
    		return array(
				'credits' => $articleKtos,
				'debits' => array(
					array( 'kto' => $fibuKto,  'value' => $totalBrutto, 'debitor' => $debitorId)
				)
			);
    	}else{
    		return array(
				'debits' => $articleKtos,
				'credits' => array(
					array( 'kto' => $fibuKto,  'value' => $totalBrutto, 'debitor' => $debitorId)
				)
			);
    	}
     	
    }
    
    public function reducePaymentValue($value){
    	
    }
    
    public function payValue($value){
		if($this->isPayed()){
	    	throw new Billing_Exception_Receipt('Receipt is already payed');
		}
    	$this->__set('payed_sum', $this->__get('payed_sum') + $value);
    	$this->__set('open_sum', $this->__get('open_sum') - $value);
    	$payed = $this->__get('payed_sum');
    	$total = $this->__get('total_brutto');
    	
    	if($payed == $total){
    		$this->__set('payment_state', 'PAYED');
    		
    		
    	}else if($payed < $total){
    		$this->__set('payment_state', 'PARTLYPAYED');
    	}
    }
    
    public function payTotal(){
    	$this->payValue($this->__get('total_brutto'));
    }
    
	public function unpay(){
    	
    }
    
    public function isPayed(){
    	return $this->__get('payment_state')=='PAYED';
    }
    
	public function getDonation(){
    	try{
    		if(!class_exists('Donator_Model_Donation') || !$this->__get('donation_id')){
    			return null;
    		}
    		return $this->getForeignRecordBreakNull('donation_id', Donator_Controller_Donation::getInstance());
    	}catch(Exception $e){
    		return null;
    	}
    }
    
    public function isDonation(){
    	try{
    		if(!class_exists('Donator_Model_Donation') || !$this->__get('donation_id')){
    			return false;
    		}
    		return true;
    	}catch(Exception $e){
    		return false;
    	}
    }
    
    
    /**
     * 
     * get donation_amount sums collected by campaigns
     */
    public function getCreateDonationData(){
    	try{
    		if(!class_exists('Donator_Model_Donation')){
    			return null;
    		}
    		
    		$hasDon = false;
    		$aResult = array();
    		
    		$receiptPositions = Billing_Controller_ReceiptPosition::getInstance()->getPositionsByReceiptId($this->getId());
    		foreach($receiptPositions as $rp){
    			$article = $rp->getForeignRecordBreakNull('article_id', Billing_Controller_Article::getInstance());
    			if($article && $article->createsDonation()){
    				$donationAmount = $article->__get('donation_amount') * $rp->__get('amount');
    				$campaign = $article->getForeignRecordBreakNull('donation_campaign_id', Donator_Controller_Campaign::getInstance());
    				if(($donationAmount != 0) && $campaign){
    					$hasDon = true;
    					if(!array_key_exists($campaign->getId(), $aResult)){
    						$aResult[$campaign->getId()] = $donationAmount;
    					}else{
    						$aResult[$campaign->getId()] += $donationAmount;
    					}
    				}
    			}
    		}
    		if(!$hasDon){
    			return null;
    		}
    		return $aResult;
    		
    	}catch(Exception $e){
    		return null;
    	}
    }
    
    public function getBillableReceiptDate(){
    	if($this->isInvoice()){
    		return new Zend_Date($this->__get('invoice_date'));
    	}
    	
    	if($this->isCredit()){
    		return new Zend_Date($this->__get('credit_date'));
    	}
    	
    	throw new Billing_Exception_Receipt('Receipt is no billable receipt (credit oder invoice). Therefore no billable receipt date is available.');
    }
    
    public function getBookingReceiptNumber(){
    	if($this->isDonation()){
    		$donation = $this->getDonation();
    		return '#S'.$donation->__get('donation_nr');
    	}elseif($this->isInvoice()){
    		return '#R'.$this->__get('invoice_nr');
    	}elseif($this->isCredit()){
    		return '#G'.$this->__get('credit_nr');
    	}
    }
    
    public function getBookingText(){
    	$add = '';
    	if($this->isCancelled()){
    		$add = '-STORNIERT-';
    	}elseif($this->isCancellation()){
    		$add = '-IST STORNO-';
    	}
    	
    	if($this->isDonation()){
    		$donation = $this->getDonation();
    		return $add.'Sollstellung Spende '.$donation->__get('donation_nr') . ' ' . $this->__get('usage');
    	}elseif($this->isInvoice()){
    		return $add.'Sollstellung Rechnung '.$this->__get('invoice_nr'). ' ' . $this->__get('usage');
    	}elseif($this->isCredit()){
    		return $add.'Habenstellung Gutschrift '.$this->__get('credit_nr'). ' ' . $this->__get('usage');
    	}
    }
    
    public function getReceiptText(){
    	if($this->isDonation()){
    		$donation = $this->getDonation();
    		return 'S'.$donation->__get('donation_nr');
    	}elseif($this->isInvoice()){
    		return 'R'.$this->__get('invoice_nr');
    	}elseif($this->isCredit()){
    		return 'G'.$this->__get('credit_nr');
    	}
    }
    
    public function getPositions(){
		if(!$this->isMonition()){
	    	return Billing_Controller_Receipt::getInstance()->getOrderPositions($this->getId());
		}else{
			return Billing_Controller_OpenItemMonition::getInstance()->getByReceiptId($this->getId());
		}
	}
	
	public function getMonitionPositions($receiptId){
		return Billing_Controller_OpenItemMonition::getInstance()->getByReceiptId($receiptId);
	}
	
	public function calculateDueDate(){
		$dueDate = new Zend_Date();
		$paymentMethod = $this->getForeignRecordBreakNull('payment_method_id', Billing_Controller_PaymentMethod::getInstance());
		if($paymentMethod instanceof Billing_Model_PaymentMethod){
			$dueInDays = $paymentMethod->__get('due_in_days');
			if($dueInDays>0){
				$dueDate->add($dueInDays, Zend_Date::DAY);
			}
		}
		$this->__set('due_date', $dueDate);
	}
    
    
}





