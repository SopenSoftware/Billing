<?php

/**
 * class to hold BatchJobDtaItem data
 *
 * @package     Billing
 */
class Billing_Model_BatchJobDtaItem extends Tinebase_Record_Abstract
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
       	'batch_dta_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'open_item_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'payment_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'erp_context_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'skip'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_datetimeFields = array(
    // modlog
    );
    
   
}