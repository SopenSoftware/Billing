<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_SepaCreditor extends Tinebase_Record_Abstract
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
    	'contact_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_account_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_creditor_ident'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'creditor_name'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    
    public function getBankAccount(){
    	return $this->getForeignRecord('bank_account_id', Billing_Controller_BankAccount::getInstance());
    }
	
 	public function getName(){
    	return $this->__get('creditor_name');
    }
    
    public function getSepaCreditorIdent(){
    	return $this->__get('sepa_creditor_ident');
    }
    
    public function getIBAN(){
    	return $this->getBankAccount()->getIBAN();
    }
    
    public function getBIC(){
    	return $this->getBankAccount()->getBIC();
    }
}