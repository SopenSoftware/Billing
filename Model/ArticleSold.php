<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_ArticleSold extends Tinebase_Record_Abstract
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
        'unit_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    //'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'description'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_weight'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    
    
    	'min_price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'min_price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'max_price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'max_price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'price2_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'price2_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total1_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total1_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total2_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total2_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    
    	'article_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_group_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'article_series_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_ext_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_stock_article'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'stock_amount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'stock_amount_min'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    
    	'simple_article'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'add_calculation'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
        'date1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'date2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    	
    
    );
    protected $_dateFields = array(
    // modlog
    );
    
  
}