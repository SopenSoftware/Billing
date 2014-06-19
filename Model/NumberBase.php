<?php

/**
 * class to hold NumberBase data
 *
 * @package     Billing
 */
class Billing_Model_NumberBase extends Tinebase_Record_Abstract
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
    	'key'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'description'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'formula'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'number1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'number2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'number3'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'text1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'text2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
}