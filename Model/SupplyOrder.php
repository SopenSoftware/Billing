<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_SupplyOrder extends Tinebase_Record_Abstract
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
    	'creditor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'job_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'account_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => 0),
	    'supply_order_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supplier_order_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        // modlog
       	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// tags, notes etc.
    	'tags'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'notes'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        //'relations'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'customfields'          => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => array())
     );
    protected $_dateFields = array(
     	// modlog
     	'creation_time',
        'last_modified_time',
        'deleted_time'
        //
    );
    
        
	public function setFromArray(array $_data)
	{
		if(empty($_data['job_id']) || $_data['job_id']==""){
			unset($_data['job_id']);
		}
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['job_id']) || $_data['job_id']==""){
			unset($_data['job_id']);
		}		
	}   
}