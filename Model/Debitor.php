<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_Debitor extends Tinebase_Record_Abstract
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
    
    public function getContact(){
    	return $this->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
    }
    
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
        'contact_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'price_group_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
        'debitor_group_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
        'debitor_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'vat_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'fibu_exp_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_order_locked'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_lock_comment'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_lock_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_monition_locked'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'monition_lock_comment'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'monition_lock_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'ust_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    	'fibu_exp_date',
    	'order_lock_date',
    	'monition_lock_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['fibu_exp_date']) || $_data['fibu_exp_date']==""){
			$_data['fibu_exp_date'] = null;
		}
		
		if(empty($_data['order_lock_date']) || $_data['order_lock_date']==""){
			$_data['order_lock_date'] = null;
		}
		
		if(empty($_data['monition_lock_date']) || $_data['monition_lock_date']==""){
			$_data['monition_lock_date'] = null;
		}
		
		parent::setFromArray($_data);
	}
	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['fibu_exp_date']) || $_data['fibu_exp_date']==""){
			$_data['fibu_exp_date'] = null;
		}
		if(empty($_data['order_lock_date']) || $_data['order_lock_date']==""){
			$_data['order_lock_date'] = null;
		}
		
		if(empty($_data['monition_lock_date']) || $_data['monition_lock_date']==""){
			$_data['monition_lock_date'] = null;
		}
	}
}