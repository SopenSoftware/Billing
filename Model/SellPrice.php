<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_SellPrice extends Tinebase_Record_Abstract
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
        'price_group_id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => false),
    	'article_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
}