<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_Booking extends Tinebase_Record_Abstract
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
    	'receipt_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_nr'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_receipt_nr'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'receipt_unique_nr'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_receipt_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'booking_text'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'erp_context_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'object_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'donation_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'value'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'valid'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'reversion_record_id'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_cancelled'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_cancellation'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true)
    	
    );
    protected $_dateFields = array(
    // modlog
    'booking_receipt_date'
    );
    
     public function setFromArray(array $_data)
	{
		if(empty($_data['receipt_id']) || $_data['receipt_id']==""){
			unset($_data['receipt_id']);
		}
	if(empty($_data['booking_receipt_date']) || $_data['booking_receipt_date']==""){
			unset($_data['booking_receipt_date']);
		}
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['receipt_id']) || $_data['receipt_id']==""){
			unset($_data['receipt_id']);
		}
	if(empty($_data['booking_receipt_date']) || $_data['booking_receipt_date']==""){
			unset($_data['booking_receipt_date']);
		}
			
	}    
	/**
	 * 
	 * Enter description here ...
	 * @throws Exception
	 */
	public function cleanup(){
		$accountBookings = Billing_Controller_AccountBooking::getInstance()->getByBookingId($this->getId());
		
		foreach($accountBookings as $accountBooking){
			Billing_Controller_AccountBooking::getInstance()->delete(array($accountBooking->getId()));
		}
	}
	
	public function updateAccountBookings(){
		$accountBookings = Billing_Controller_AccountBooking::getInstance()->getByBookingId($this->getId());
		
		foreach($accountBookings as $accountBooking){
			$accountBooking->__set('booking_date', $this->__get('booking_date'));
			Billing_Controller_AccountBooking::getInstance()->update( $accountBooking );
		}
	}
	
	
}