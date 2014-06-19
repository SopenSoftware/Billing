<?php
/**
 * 
 * Controller Article
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Article extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_Article();
        $this->_modelName = 'Billing_Model_Article';
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        $this->_doContainerACLChecks = FALSE;
        $this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
    }
    
    private static $_instance = NULL;
    
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    	// check whether the article nr is set? -> then do not overwrite: maybe from export...
    	if(!$_record->__get('article_nr')){
    		$_record->__set('article_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('article_nr'));
    	}
    	
    	if(!$_record->__get('price2_vat_id')){
    		$vat0 = Billing_Controller_Vat::getInstance()->getByName(0);
    		$_record->__set('price2_vat_id', $vat0->getId());
    	}
    }
    
    
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
    
    public function createArticleWithPriceGroupPrices($articleRecord, array $prices){
    	$articleRecord = $this->create($articleRecord);
    	$articleId = $articleRecord->getId();
    	$spController = Billing_Controller_SellPrice::getInstance();
    	// expecting:
		//    	'id' => pricegroup_id
		//    	'netto' => price_netto
		//    	'brutto' => $recordData['VK2EXKL'];
    	foreach($prices as $priceGroupInfo){
    		$sellPrice = new Billing_Model_SellPrice();
    		$sellPrice->__set('article_id', $articleId);
    		$sellPrice->__set('price_group_id', $priceGroupInfo['id']);
    		$sellPrice->__set('price_netto', $priceGroupInfo['netto']);
    		$sellPrice->__set('price_brutto', $priceGroupInfo['brutto']);
    		
    		$spController->create($sellPrice);
    	}
    	return $articleRecord;
    }
    
    /**
     * Get empty record
     * @return Billing_Model_Article
     */
    public function getEmptyArticle(){
     	$emptyBrevet = new Billing_Model_Article(null,true);
     	return $emptyArticle;
    }
    
    /**
     * 
     * Retrieve article by article_nr
     * @param string $articleNumber
     */
    public function getByArticleNumber($articleNumber){
    	return $this->_backend->getByArticleNumber($articleNumber);
    }
    
	/**
     * 
     * Retrieve article by article_nr
     * @param string $articleNumber
     */
    public function getByArticleExtNumber($articleExtNumber){
    	return $this->_backend->getByArticleExtNumber($articleExtNumber);
    }
    
    /**
     * 
     * Get all article numbers e.g. for fast validation in quickorder processing
     * @return array	Array with article numbers
     */
    public function getArticleNumbers(){
    	$resultSet = $this->_backend->getArticleNumbers();
    	foreach($resultSet as $result){
    		if($result['article_nr']){
    			$aResult[] = $result['article_nr'];
    		}
    	}
    	return $aResult;
    }
}
?>