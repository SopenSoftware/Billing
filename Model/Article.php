<?php

/**
 * class to hold Article data
 *
 * @package     Billing
 */
class Billing_Model_Article extends Tinebase_Record_Abstract
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
    	'article_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_group_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'article_series_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'vat_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => false),
	    'article_unit_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'article_ext_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'name'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'description'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'comment'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'image'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'weight'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'dimensions'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'is_stock_article'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'stock_amount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'stock_amount_min'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'rev_account_vat_in'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'rev_account_vat_ex'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'locked'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'hidden'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'pos_permitted'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'simple_article'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'creates_donation'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'add_calculation'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'price_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'price2_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'price_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'price2_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'donation_amount'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'donation_campaign_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'ek1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'ek2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'price2_vat_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'rev_account_price2_vat_in'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    'rev_account_price2_vat_ex'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
	    
    	// embed article prices for pricegroups, debitors
    	'prices'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['weight']) || $_data['weight']==""){
			unset($_data['weight']);
		}
		if(empty($_data['article_series_id']) || $_data['article_series_id']==""){
			unset($_data['article_series_id']);
		}
		if(empty($_data['stock_amount_total']) || $_data['stock_amount_total']==""){
			unset($_data['stock_amount_total']);
		}
		if(empty($_data['stock_amount_min']) || $_data['stock_amount_min']==""){
			unset($_data['stock_amount_min']);
		}
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['article_series_id']) || $_data['article_series_id']==""){
			unset($_data['article_series_id']);
		}
		if(empty($_data['weight']) || $_data['weight']==""){
			unset($_data['weight']);
		}
		if(empty($_data['stock_amount_total']) || $_data['stock_amount_total']==""){
			unset($_data['stock_amount_total']);
		}
		if(empty($_data['stock_amount_min']) || $_data['stock_amount_min']==""){
			unset($_data['stock_amount_min']);
		}		
	}
	
	public function isSimpleArticle(){
		return (bool)$this->__get('simple_article')===true;
	}
	public function hasAddition(){
		return (bool)$this->__get('add_calculation')===true;
	}
	
	/**
     * 
     * checks wheter creates_donation flag is set
     * 
     */
    public function createsDonation(){
   	 	try{
   	 		
    		if(!class_exists('Donator_Model_Donation') || !$this->__get('creates_donation')){
    			return false;
    		}
    		return true;
    	}catch(Exception $e){
    		//echo $e->__toString();
    		return false;
    	}
    }
	
	public function getPriceForDebitor($debitor){
		try{
			$priceGroupId = $debitor->__get('price_group_id');
			if(is_object($priceGroupId)){
				$priceGroupId = $priceGroupId->id;
			}
			$priceGroupId = (int) $priceGroupId;
			
			$debitorId = $debitor->__get('id');
			
			if($this->isSimpleArticle()){
				return $this->getSimplePrice();
			}
			
			try{
				$price = $this->getPriceByDebitorId($debitorId);
			}catch(Billing_Exception_Article $e){
				$price = $this->getPriceByPriceGroupId($priceGroupId);
			}
			return $price;
		}catch(Exception $e){
			echo $e->__toString();
			//throw new Billing_Exception_Article('Price for debitor with id: '. $debitorId . ' could not be retrieved. Exception: ' . $e->__toString());
		}
				
	}
	
	public function getSimplePrice(){
		$prices = $this->getPrices();
		return $prices['simple'];
	}
	
	public function getPriceByPriceGroupId($priceGroupId){
		if($this->isSimpleArticle()){
				return $this->getSimplePrice();
			}
		$prices = $this->getPrices();
		if($prices && array_key_exists($priceGroupId, $prices['pricegroups'])){
			return $prices['pricegroups'][$priceGroupId];
		}
		throw new Billing_Exception_Article('Price for article with id: '. $this->id.' and price_group_id: ' . $priceGroupId . ' not found.');
	}
	
	public function getPriceByDebitorId($debitorId){
		if($this->isSimpleArticle()){
				return $this->getSimplePrice();
			}
		$prices = $this->getPrices();
		if($prices && array_key_exists($debitorId, $prices['debitors'])){
			return $prices['debitors'][$debitorId];
		}
		throw new Billing_Exception_Article('Price for article with id: '. $this->id.' and debitor_id: ' . $debitorId . ' not found.');
	}
	
	public function getPrices(){
		if(isset($this->prices)){
			return $this->prices;
		}
		return null;
	}
}