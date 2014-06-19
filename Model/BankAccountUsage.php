<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_BankAccountUsage extends Tinebase_Record_Abstract
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
    	'bank_account_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'contact_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'context_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage_type'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_mandate_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'membership_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'regular_donation_id'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage_from'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage_until'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_blocked'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'block_reason'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    
    public function setUsageMembership(Membership_Model_SoMember $obj){
    	$this->__set('context_id', 'MEMBERSHIP');
    	$this->__set('membership_id', $obj->getId());
    	$this->__set('usage_type', 'APPRECORDONLY');
    }
    
	public function setUsageRegularDonation(Donator_Model_RegularDonation $obj){
    	$this->__set('context_id', 'DONATOR');
    	$this->__set('regular_donation_id', $obj->getId());
    	$this->__set('usage_type', 'APPRECORDONLY');
    }
    
    public function setUsageAll(){
    	$this->__set('usage_type', 'ALLPURPOSE');
    	$this->__set('context_id', 'ALL');
    }
    
    public function setSepaMandate(Billing_Model_SepaMandate $mand){
    	$this->__set('sepa_mandate_id', $mand->getId());
    }
	
}