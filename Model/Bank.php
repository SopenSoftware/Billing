<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_Bank extends Tinebase_Record_Abstract
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
   		'country_code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'att'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'name'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'postal_code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'location'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'short_name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'pan'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bic'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'validate'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'record_number'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'change_sign'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'follow_code'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    	
    );
	
}