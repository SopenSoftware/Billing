<?php
/**
 * 
 * Controller OrderTemplatePosition
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_OrderTemplatePosition extends Tinebase_Controller_Record_Abstract
{
    /**
     * config of courses
     *
     * @var Zend_Config
     */
    protected $_config = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    private function __construct() {
        $this->_applicationName = 'Billing';
        $this->_backend = new Billing_Backend_OrderTemplatePosition();
        $this->_modelName = 'Billing_Model_OrderTemplatePosition';
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        $this->_doContainerACLChecks = FALSE;
        $this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
    }
    
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return SoEventManager_Controller_SoEvent
     */
    public static function getInstance()
    {
        if (self::$_instance === NULL) {
            self::$_instance = new self();
        }
        
        return self::$_instance;
    }
    
    /**
     * Get empty record
     * @return Billing_Model_OrderTemplatePosition
     */
    public function getEmptyOrderTemplatePosition(){
     	$emptyOrderTemplatePosition = new Billing_Model_OrderTemplatePosition(null,true);
     	return $emptyOrderTemplatePosition;
    }
    
    /**
     * 
     * Create new receipt position based on an article object
     * @param {Billing_Model_Article} $article
     */
    public function getPositionFromArticle($article, $debitor, $amount){
    	$article = Billing_Controller_Article::getInstance()->get($article->getId());
    	
    	$articleId = $article->__get('id');
    	$priceGroupId = $debitor->__get('price_group_id');
    	
    	$receiptPosition = $this->getEmptyOrderTemplatePosition();
		// add data to receipt position
		$receiptPosition->__set('article_id', $articleId);
		$receiptPosition->__set('price_group_id', $priceGroupId);
		$receiptPosition->__set('vat_id', $article->__get('vat_id'));
		$receiptPosition->__set('name', $article->__get('name'));
		$receiptPosition->__set('description', $article->__get('description'));
		
		$debPrice = $article->getPriceForDebitor($debitor);
		$priceNetto = $debPrice['price_netto'];
		
		$receiptPosition->__set('price_netto', $priceNetto);
		$receiptPosition->__set('amount', $amount);
		$receiptPosition->__set('unit_id', $article->__get('article_unit_id')->id);
		
		// calculate the position
		$this->calculate($receiptPosition);
		
		$receiptPosition->__set('vat_id', $article->__get('vat_id')->id);
		
		return $receiptPosition;
    }
    
    public function calculate($receiptPosition){
    	$this->validate($receiptPosition);
    	$vatValue = $receiptPosition->__get('vat_id')->value + 1;
    	$priceNetto = $receiptPosition->__get('price_netto');
    	$amount = $receiptPosition->__get('amount');
    	
    	$factor = $receiptPosition->__get('factor');
    	
    	$weight = $receiptPosition->__get('weight');
    	$discountPercentage = $receiptPosition->__get('discount_percentage');
    	
    	if(!$weight){
    		$weight = 0;
    	}
    	if(!$discountPercentage){
    		$discountPercentage = 0;
    	}
    	
    	$discountPercentage = ($discountPercentage/100);
    	
    	$totalWeight = $weight * $amount * $factor;
    	
    	$totalNetto = $priceNetto * $amount * $factor;
    	
    	$discountTotal = $totalNetto * $discountPercentage;
    	$totalNetto -= $discountTotal;
    	
    	$totalBrutto = $totalNetto * $vatValue;
    	
    	$receiptPosition->__set('weight',$weight);
    	$receiptPosition->__set('discount_percentage',$discountPercentage);
    	$receiptPosition->__set('discount_total',$discountTotal);
    	
    	$receiptPosition->__set('total_netto',$totalNetto);
    	$receiptPosition->__set('total_brutto',$totalBrutto);
    	$receiptPosition->__set('total_weight',$totalWeight);
    }
    
    public function validate($receiptPosition){
    	$valid = false;
    	
    	$vat = $receiptPosition->__get('vat_id');
    	if(($vat instanceof Billing_Model_Vat)){
    		if( is_numeric($vatValue = $vat->__get('value')) ){
    			$valid = true;
    		}
    	}
    	
    	$priceNetto = $receiptPosition->__get('price_netto');
    	if(!is_numeric($priceNetto)){
    		$valid = false;
    	}
    	
    	$amount = $receiptPosition->__get('amount');
	    if(!is_numeric($amount)){
	    		$valid = false;
	    }
	    
	    if(!$valid){
	    	throw new Billing_Exception_OrderTemplatePosition('OrderTemplate position is invalid');
	    }
    }
    
    public function getByOrderTemplateId($orderTemplateId){
    	return $this->_backend->getByOrderTemplateId($orderTemplateId);
    }
}
?>