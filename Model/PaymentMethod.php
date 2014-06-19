<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_PaymentMethod extends Tinebase_Record_Abstract
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
    	'sort_order'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'invoice_template_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'processor_class'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'text1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'text2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_default'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'due_in_days'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
}