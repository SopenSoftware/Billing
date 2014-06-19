<?php
/**
 * 
 * Controller StockFlow
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_StockFlow extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_StockFlow();
        $this->_modelName = 'Billing_Model_StockFlow';
        $this->_articleSupplyController = Billing_Controller_ArticleSupply::getInstance();
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
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	protected function _inspectCreate(Tinebase_Record_Interface $_record)
	{
		$stockLocationId = $_record->__get('stock_location_id');
		$articleId = $_record->__get('article_id');
		try{
			$articleSupply = $this->_articleSupplyController->getByStockLocationArticle($stockLocationId, $articleId);
		}catch(Exception $e){
			$articleSupply = $this->_articleSupplyController->getEmptyArticleSupply();
			$articleSupply->__set('stock_location_id', $stockLocationId);
			$articleSupply->__set('article_id', $articleId);
			$articleSupply->__set('amount', 0);
			$this->_articleSupplyController->create($articleSupply);
		}
		
		$stockAmount = (float)$articleSupply->__get('amount');
		$articleSupply->__set('amount', $stockAmount + $this->calculateStockAmountChange($_record));
		$this->_articleSupplyController->update($articleSupply);
	}
	
	private function calculateStockAmountChange($record){
		if($record->__get('direction') == 'IN'){
			$amount = (float)$record->__get('amount');
		}else{
			$amount = (float)$record->__get('amount') * (-1);
		}
		return $amount;
	}
	
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectUpdate()
	 */
	protected function _inspectUpdate(Tinebase_Record_Interface $_record)
	{
	
	}
    
    /**
     * Get empty record
     * @return Billing_Model_StockFlow
     */
    public function getEmptyStockFlow(){
     	$emptyBrevet = new Billing_Model_StockFlow(null,true);
     	return $emptyStockFlow;
    }
}
?>