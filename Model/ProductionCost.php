<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_ProductionCost extends Tinebase_Record_Abstract
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
    	'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'receipt_position_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supply_receipt_position_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	  	'creditor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'ek_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'ek_nominal'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'ek_progress'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'category'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)    );
    protected $_dateFields = array(
    // modlog
    );
}