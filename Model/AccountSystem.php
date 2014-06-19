<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_AccountSystem extends Tinebase_Record_Abstract
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
    	'account_class_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'vat_account_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'number'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'last_termination_date'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_type'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'credit_saldo'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'debit_saldo'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sum_debit'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sum_credit'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'begin_credit_saldo'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'begin_debit_saldo'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'is_bank_account'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_default_bank_account'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
}