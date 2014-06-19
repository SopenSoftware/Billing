<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_AccountBooking extends Tinebase_Record_Abstract
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
    	'account_system_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'booking_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'receipt_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'termination_date'              => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'status'   				=> array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'value'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'credit_value'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'debit_value'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false)
    );
    protected $_dateFields = array(
    // modlog
    );
    
     public function setFromArray(array $_data)
	{
		if(empty($_data['termination_date']) || $_data['termination_date']==""){
			unset($_data['termination_date']);
		}
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['termination_date']) || $_data['termination_date']==""){
			unset($_data['termination_date']);
		}
			
	}    
	
	public function getContraBookings(){
		$bookingId = $this->getForeignId('booking_id');
		$type = $this->__get('type');
		$aTypes = array(
			'DEBIT' => 'CREDIT',
			'CREDIT' => 'DEBIT'
		);
		return Billing_Controller_AccountBooking::getInstance()->getAccountBookingsByType( $bookingId, $aTypes[$type] );
	}
}