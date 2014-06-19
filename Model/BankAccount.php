<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_BankAccount extends Tinebase_Record_Abstract
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
    public function getNumber(){
    	return $this->__get('number');
    }
    public function getName(){
    	return $this->__get('name');
    }
	public function getBankCode(){
    	return $this->__get('bank_code');
    }
	public function getBank(){
    	return $this->__get('bank_name');
    }
    public function getIBAN(){
    	return $this->__get('iban');
    }
	public function getBIC(){
    	return $this->__get('bic');
    }
    protected $_validators = array(
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'contact_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bic'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'iban'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'number'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'name'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_code'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'last_validated'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'valid'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	/*
    	 * @todo: remove from setup.xml
    	 * 
    	 * 'has_sepa_mandate'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_mandate_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_mandate_from'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_mandate_until'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_last_usage_date'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),*/
    
    	'is_iban_improved'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    
    public function addUsageAll(){
    	try{
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getByContextAndPurpose('ALL', 'ALLPURPOSES', $this->getId());
		$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageAll();
    	}catch(Exception $e){
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getEmptyBankAccountUsage(null,true);
    		$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageAll();
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->create($usage);
    	}
    	return $usage;
    }
    
    public function addUsageMembership(Membership_Model_SoMember $obj){
    	try{
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getByContextAndPurpose('MEMBERSHIP', 'APPRECORDONLY', $this->getId(), $obj->getId());
    		$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageMembership($obj);
    	}catch(Exception $e){
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getEmptyBankAccountUsage(null,true);
    		$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageMembership($obj);
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->create($usage);
    	}
    	return $usage;
    }
    
    public function addUsageRegularDonation(Donator_Model_RegularDonation $obj){
    	try{
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getByContextAndPurpose('DONATOR', 'APPRECORDONLY', $this->getId(), $obj->getId());
			$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageRegularDonation($obj);
    	}catch(Exception $e){
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->getEmptyBankAccountUsage(null,true);
    		$usage->__set('bank_account_id', $this->getId());
    		$usage->setUsageRegularDonation($obj);
    		$usage = Billing_Controller_BankAccountUsage::getInstance()->create($usage);
    	}
    	return $usage;
    }
    
    public function toText(){
    	return
    		'IBAN: '.$this->__get('iban')."\n".
    		'BIC : '.$this->__get('bic')."\n".
    		'#   : '.$this->__get('number')."\n".
    		'Name: '.$this->__get('name')."\n";
    }
	
}