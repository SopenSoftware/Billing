<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_OrderPosition extends Tinebase_Record_Abstract
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
    	'order_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_group_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'unit_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'vat_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'position_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'factor'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'weight'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'description'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'comment'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_weight'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'optional'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'additional_data' 			=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'price2_vat_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'price2_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
     	'price2_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total1_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total1_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total2_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total2_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'add_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
    
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
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['article_id']) || $_data['article_id']==""){
			unset($_data['article_id']);
		}
		if(empty($_data['order_id']) || $_data['order_id']==""){
			unset($_data['order_id']);
		}
		if(empty($_data['weight']) || $_data['weight']==""){
			$_data['weight'] = 0;
		}
		if(empty($_data['total_weight']) || $_data['total_weight']==""){
			$_data['total_weight'] = 0;
		}
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['article_id']) || $_data['article_id']==""){
			unset($_data['article_id']);
		}
		if(empty($_data['order_id']) || $_data['order_id']==""){
			unset($_data['order_id']);
		}
		if(empty($_data['total_weight']) || $_data['total_weight']==""){
			$_data['total_weight'] = 0;
		}
		if(empty($_data['weight']) || $_data['weight']==""){
			$_data['weight'] = 0;
		}
	}
    
}