<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_ArticleSeries extends Tinebase_Record_Abstract
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
    	'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'description'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'begin_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'end_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    'begin_date',
    'end_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['begin_date']) || $_data['begin_date']==""){
			unset($_data['begin_date']);
		}
		if(empty($_data['end_date']) || $_data['end_date']==""){
			unset($_data['end_date']);
		}
		

		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['begin_date']) || $_data['begin_date']==""){
			unset($_data['begin_date']);
		}
		if(empty($_data['end_date']) || $_data['end_date']==""){
			unset($_data['end_date']);
		}
		
	}
}