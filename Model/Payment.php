<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_Payment extends Tinebase_Record_Abstract
{
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
    
    public function __construct($_data = NULL, $_bypassFilters = false, $_convertDates = true){
    	parent::__construct($_data, $_bypassFilters, $_convertDate);
    	// set default value for allow automatic booking
    	$this->allowBooking();
    }
    
 	public static function createDebitFromDta($batchJobDtaId, $debitorId, $date, $amount, $paymentMethod=null, $erpContextId = 'ERP' ){

    	$obj = self::createDebit($debitorId, $date, $amount, $paymentMethod, $erpContextId);
    	$obj->__set('batch_job_dta_id', $batchJobDtaId);
    	return $obj;
    	
    }
    
    public static function createDebit($debitorId, $date, $amount, $paymentMethod=null, $erpContextId = 'ERP' ){

    	return self::create('DEBIT', $debitorId, $date, $amount, $paymentMethod, $erpContextId);
    
    }
    
    public static function create($type, $debitorId, $date, $amount, $paymentMethod=null, $erpContextId = 'ERP'){
    	if(is_null($paymentMethod)){
    		$paymentMethod = Billing_Controller_PaymentMethod::getInstance()->getDefaultPaymentMethod();
    	}
    	
    	if($paymentMethod instanceof Billing_Model_PaymentMethod){
    		$paymentMethod = $paymentMethod->getId();
    	}
    	
    	$obj = new self();
    	$obj->__set('debitor_id', $debitorId);
    	$obj->__set('amount', $amount);
    	$obj->__set('payment_date', $date);
    	$obj->__set('type', $type);
    	$obj->__set('payment_method_id', $paymentMethod);
    	
    	return $obj;
    }
    
    public function setDebitAccount( $debitAccountId){
    	if($debitAccountId instanceof Billing_Model_AccountSystem){
    		$id = $debitAccountId->getId();
    	}
    	$this->__set('account_system_id', $debitAccountId);
    	return $this;
    }
    
	public function setCreditAccount( $creditAccountId){
    	if($creditAccountId instanceof Billing_Model_AccountSystem){
    		$id = $creditAccountId->getId();
    	}
    	$this->__set('account_system_id_haben', $creditAccountId);
    	return $this;
    }
    
    public function setUsage($usage){
    	$this->__set('usage', $usage);
    	return $this;
    }
    
    public function addUsage($usage){
    	$this->__set('usage', $this->__get('usage'), $usage);
    	return $this;
    }
    
    public function allowBooking(){
    	$this->__set('allow_booking', 1);
    	return $this;
    }
    
	public function prohibitBooking(){
    	$this->__set('allow_booking', 0);
    	return $this;
    }
    
    public function isBookingAllowed(){
    	return $this->__get('allow_booking') == 1;
    }
    
    public function isReturnDebit(){
    	return $this->__get('is_return_debit') == 1;
    }
    
    public function hasReturnDebitBasePayment(){
    	return !is_null($this->getForeignRecordBreakNull('return_debit_base_payment_id', Billing_Controller_Payment::getInstance()));
    }
    
    public function getReturnDebitBasePayment(){
    	return $this->getForeignRecordBreakNull('return_debit_base_payment_id', Billing_Controller_Payment::getInstance());
    }
    
    public function getAmount($includingDebitReturnFee = true){
    	if(!$includingDebitReturnFee && $this->isReturnDebit()){
    		return (float) $this->__get('amount') - (float) $this->__get('return_inquiry_fee');
    	}else{
    		return (float) $this->__get('amount');
    	}
    }
    
    public function hasSetAccountsBankTransfer(){
    	return $this->__get('set_accounts_banktransfer') == 1;
    }
    
    public function getDebitor(){
    	return $this->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
    }
    
    public function getBatchJobDta(){
    	// if has return base payment -> get dta job of base payment
    	if($this->hasReturnDebitBasePayment()){
    		$payment = $this->getReturnDebitBasePayment();
    		$dta = $payment->getForeignRecordBreakNull('batch_job_dta_id', Billing_Controller_BatchJobDta::getInstance());
    		if($dta){
    			return $dta;
    		}
    	}
    	
    	return $this->getForeignRecordBreakNull('batch_job_dta_id', Billing_Controller_BatchJobDta::getInstance());
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
        'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'receipt_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'open_item_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'batch_job_dta_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
   	    'return_debit_base_payment_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'payment_method_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'usage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_system_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_system_id_haben'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'booking_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_booking_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'type'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// the source object generating this entry: e.g. donation record or further from other apps
    	// should be a generic mechanism because the receipt or open item 
    	// is exactly the same case
    	'object_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'donation_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'reversion_record_id'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_cancelled'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_cancellation'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'allow_booking'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'is_return_debit'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'print_inquiry'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'inquiry_print_date'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'return_inquiry_fee'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'set_accounts_banktransfer'          => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    
    );
    protected $_dateTimeFields = array(
    // modlog
//	'payment_date',
    'creation_time',
    'last_modified_time',
    'deleted_time'
    );
    
    public function swapAccounts(){
    	$debAcc = $this->__get('account_system_id');
    	$credAcc = $this->__get('account_system_id_haben');
    	
    	$this->__set('account_system_id_haben', $debAcc);
    	$this->__set('account_system_id', $credAcc);
    	
    }
	
    public function setFromArray(array $_data)
	{
		if(empty($_data['open_item_id']) || $_data['open_item_id']==""){
			unset($_data['open_item_id']);
		}
		if(empty($_data['order_id']) || $_data['order_id']==""){
			unset($_data['order_id']);
		}
		if(empty($_data['receipt_id']) || $_data['receipt_id']==""){
			unset($_data['receipt_id']);
		}
		
		if(empty($_data['booking_id']) || $_data['booking_id']==""){
			unset($_data['booking_id']);
		}
		
		if(empty($_data['account_booking_id']) || $_data['account_booking_id']==""){
			unset($_data['account_booking_id']);
		}
		
		if(empty($_data['inquiry_print_date']) || $_data['inquiry_print_date']==""){
			$_data['inquiry_print_date'] = null;
		}
		
		if(empty($_data['return_debit_base_payment_id']) || $_data['return_debit_base_payment_id']==""){
			unset($_data['return_debit_base_payment_id']);
		}
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['open_item_id']) || $_data['open_item_id']==""){
				unset($_data['open_item_id']);
		}
		if(empty($_data['order_id']) || $_data['order_id']==""){
			unset($_data['order_id']);
		}
		if(empty($_data['receipt_id']) || $_data['receipt_id']==""){
			unset($_data['receipt_id']);
		}
	
			if(empty($_data['booking_id']) || $_data['booking_id']==""){
			unset($_data['booking_id']);
		}
		
		if(empty($_data['account_booking_id']) || $_data['account_booking_id']==""){
			unset($_data['account_booking_id']);
		}
		if(empty($_data['inquiry_print_date']) || $_data['inquiry_print_date']==""){
			$_data['inquiry_print_date'] = null;
		}
		if(empty($_data['return_debit_base_payment_id']) || $_data['return_debit_base_payment_id']==""){
			unset($_data['return_debit_base_payment_id']);
		}
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
}