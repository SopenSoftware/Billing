<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_SepaMandate extends Tinebase_Record_Abstract
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
    	'bank_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'sepa_creditor_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'mandate_ident'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'mandate_state'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'signature_date'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'last_usage_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_single'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_last'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_valid'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
   		'iban'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_name'			 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bic'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_name'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_country_code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_postal_code'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'bank_location'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'comment'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    
	public function setFromArray(array $_data){
		if(empty($_data['signature_date']) || $_data['signature_date']==""){
			$_data['signature_date'] = null;
		}
		if(empty($_data['last_usage_date']) || $_data['last_usage_date']==""){
			unset($_data['last_usage_date']);
		}

		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
			
		if(empty($_data['signature_date']) || $_data['signature_date']==""){
			$_data['signature_date'] = null;
		}
		if(empty($_data['last_usage_date']) || $_data['last_usage_date']==""){
			unset($_data['last_usage_date']);
		}
			
	}
	
	public function isValidMandate($checkSignatureDate = null){
		if(is_null($checkSignatureDate)){
			$checkSignatureDate = new Zend_Date();
		}
		
		if(!$this->__get('signature_date')){
			return false;
		}
		
		if($this->__get('mandate_state') != 'CONFIRMED'){
			return false;
		}
		
		if($this->__get('is_valid')!=1){
			return false;
		}
		
		$signatureDate = new Zend_Date($this->__get('signature_date'));
	
		if($checkSignatureDate->isEarlier($signatureDate)){
			return false;
		}
		
		return true;
	}
	
	public function getMandateIdent(){
		return $this->__get('mandate_ident');
	}
	
	public function getSignatureDate(){
		return new Zend_Date($this->__get('signature_date'));
	}
	
	public function getSignatureDateISO(){
		return $this->getSignatureDate()->toString('yyyy-MM-dd');
	}
	
	public function markLastUsage(Zend_Date $lastUsageDate = null){
		if(is_null($lastUsageDate)){
			$lastUsageDate = new Zend_Date();
		}
		$this->__set('last_usage_date', $lastUsageDate);
		
		Billing_Controller_SepaMandate::getInstance()->update($this);
	}
	
	public function isFirst(){
		return !($this->__get('last_usage_date'));
	}
	
	public function isRecurrent(){
		return !$this->isFirst();
	}
	
	public function isLast(){
		return (bool) $this->__get('is_last');
	}
	
	
	
}