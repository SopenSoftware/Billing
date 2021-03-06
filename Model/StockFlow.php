<?php

/**
 * class to hold StockFlow data
 *
 * @package     Billing
 */
class Billing_Model_StockFlow extends Tinebase_Record_Abstract
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
    	'article_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'creditor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'stock_location_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'direction'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'booking_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'reason'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    'booking_date'
    );
    
        
    public function setFromArray(array $_data)
	{
		if(empty($_data['creditor_id']) || $_data['creditor_id']==""){
			unset($_data['creditor_id']);
		}
		if(empty($_data['debitor_id']) || $_data['debitor_id']==""){
			unset($_data['debitor_id']);
		}
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['creditor_id']) || $_data['creditor_id']==""){
			unset($_data['creditor_id']);
		}
		if(empty($_data['debitor_id']) || $_data['debitor_id']==""){
			unset($_data['debitor_id']);
		}	
	}  
}