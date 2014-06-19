<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_AccountBookingTemplate extends Tinebase_Record_Abstract
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
    	'booking_template_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'input_value'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'multiply'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'has_customer'   				=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'has_supplier'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
     );
    protected $_dateFields = array(
    );
    
  
}