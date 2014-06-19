<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_BookingTemplate extends Tinebase_Record_Abstract
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
    	'booking_template_nr'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'key'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'event_name'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_text'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'erp_context_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'booking_type'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'has_vat'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_auto_possible'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    	
    );
    protected $_dateFields = array(
 
    );
}