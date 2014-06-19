<?php

/**
 * class to hold MT940 data
 *
 * @package     Billing
 */
class Billing_Model_MT940Payment extends Tinebase_Record_Abstract
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
    	'erp_context_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'op_nr'						=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'op_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
   		'return_debit_base_payment_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'due_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'op_amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'state'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage_payment'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'overpay'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_system_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'account_system_id_haben'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'overpay_amount'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'multiple_ops'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'additional_data'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
	    'is_return_debit'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'print_inquiry'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'return_inquiry_fee'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'set_accounts_banktransfer'          => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    
    	
    );
    protected $_dateFields = array(
    // modlog
    'due_date',
    'payment_date',
    'inquiry_print_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['due_date']) || $_data['due_date']==""){
			unset($_data['due_date']);
		}
		
		if(empty($_data['payment_date']) || $_data['payment_date']==""){
			unset($_data['payment_date']);
		}
		
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['due_date']) || $_data['due_date']==""){
			unset($_data['due_date']);
		}
		
		if(empty($_data['payment_date']) || $_data['payment_date']==""){
			unset($_data['payment_date']);
		}
	}
	
	public function hasMultipleOpenItems(){
		return $this->__get('multiple_ops') == 1;
	}
	
	public function hasAdditionalItem($key){
		$arr = $this->getAdditionalData();
		
		if(is_array($arr) && array_key_exists($key, $arr)){
			return true;
		}
		return false;
	}
	
	public function getAdditionalItem($key){
		if(!$this->hasAdditionalItem($key)){
			return null;
		}
		$arr = $this->getAdditionalData();
		return $arr[$key];
	}
	
    /**
     * 
     * Set array of additional data json encoded
     * @param array $data
     */
    public function setAdditionalData(array $data){
    	$this->__set('additional_data', Zend_Json::encode($data));
    }
    
    /**
     * 
     * Get Additional data as array (json decoded)
     * @return	array
     */
    public function getAdditionalData(){
    	return Zend_Json::decode($this->__get('additional_data'));
    }
}