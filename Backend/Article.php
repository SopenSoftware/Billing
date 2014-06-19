<?php
/**
 * 
 * Enter description here ...
 * @author hhartl
 *
 */
class Billing_Backend_Article extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_article';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_Article';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    /**
     * (non-PHPdoc)
     * @see Tinebase_Backend_Sql_Abstract::search()
     */
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
            $recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
    	return $recordSet;
    }
    
    /**
     * 
     * Embed foreign records
     * @param Tinebase_Model_Record $record
     */
    protected function appendDependentRecords($record){
        if($record->__get('vat_id')){
    		$this->appendForeignRecordToRecord($record, 'vat_id', 'vat_id', 'id', new Billing_Backend_Vat());
        }
    	 if($record->__get('price2_vat_id')){
    		$this->appendForeignRecordToRecord($record, 'price2_vat_id', 'price2_vat_id', 'id', new Billing_Backend_Vat());
        }
        if($record->__get('article_group_id')){
    		$this->appendForeignRecordToRecord($record, 'article_group_id', 'article_group_id', 'id', new Billing_Backend_ArticleGroup());
        }
     if($record->__get('article_series_id')){
    		$this->appendForeignRecordToRecord($record, 'article_series_id', 'article_series_id', 'id', new Billing_Backend_ArticleSeries());
        }
        if($record->__get('article_unit_id')){
    		$this->appendForeignRecordToRecord($record, 'article_unit_id', 'article_unit_id', 'id', new Billing_Backend_ArticleUnit());
        } 
        
        // -> Problem: VDST-Version does not know fibu accounts yet!!!
        // therefore deactivate this
        /*if($record->__get('rev_account_vat_in')){
    		$this->appendForeignRecordToRecord($record, 'rev_account_vat_in', 'rev_account_vat_in', 'id', new Billing_Backend_AccountSystem());
        } 
        
        if($record->__get('rev_account_vat_ex')){
    		$this->appendForeignRecordToRecord($record, 'rev_account_vat_ex', 'rev_account_vat_ex', 'id', new Billing_Backend_AccountSystem());
        } */
        if($record->__get('rev_account_price2_vat_in')){
    		$this->appendForeignRecordToRecord($record, 'rev_account_price2_vat_in', 'rev_account_price2_vat_in', 'id', new Billing_Backend_AccountSystem());
        } 
        if($record->__get('rev_account_price2_vat_ex')){
    		$this->appendForeignRecordToRecord($record, 'rev_account_price2_vat_ex', 'rev_account_price2_vat_ex', 'id', new Billing_Backend_AccountSystem());
        } 
        
        if($record->__get('donation_campaign_id')){
    		$this->appendForeignRecordToRecord($record, 'donation_campaign_id', 'donation_campaign_id', 'id', new Donator_Backend_Campaign());
        }
        
        $pgPrices = $this->getPricesForPriceGroups($record);
        $pgp = array();
        
        foreach($pgPrices as $id => $p){
        	$price = array(
        		'pricegroup' => $p['name'],
        		'price_netto' => number_format($p['price_netto'],2,',','.'),
        		'price_brutto' => number_format($p['price_brutto'],2,',','.')
        	
        	);
        	$pgp[] = $price;
        }
        $record->prices = array(
        	'debitors' => $this->getPricesForDebitors($record),
        	'pricegroups'=> $pgPrices,
        	'pgp' => $pgp,
        	'creditors'  => $this->getPricesForCreditors($record),
        	'simple' => array(
       			'vat_id' => $record->__get('vat_id'),
        		'price2_vat_id' => $record->__get('price2_vat_id'),
        		'price_netto' => $record->__get('price_netto'),
        		'price2_netto' => $record->__get('price2_netto'),
        		'price_brutto' => $record->__get('price_brutto'),
        		'price2_brutto' => $record->__get('price2_brutto')
        	)
        );
    }
    
    /**
     * (non-PHPdoc)
     * @see Tinebase_Backend_Sql_Abstract::get()
     */
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
    
    /**
     * 
     * Get the article by it's number
     * @param string $articleNumber
     */
    public function getByArticleNumber($articleNumber){
        $record = $this->getByProperty($articleNumber, 'article_nr');
    	if($record){
    		$this->appendDependentRecords($record);
    	}
    	return $record;
    }
    
	/**
     * 
     * Get the article by it's number
     * @param string $articleNumber
     */
    public function getByArticleExtNumber($articleNumber){
        $record = $this->getByProperty($articleNumber, 'article_ext_nr');
    	if($record){
    		$this->appendDependentRecords($record);
    	}
    	return $record;
    }
    
    /**
     * 
     * Get the debitor specific (sell) prices
     * @param Tinebase_Model_Record $record
     * @return array
     */
    public function getPricesForDebitors($record){
    	$articleId = $record->__get('id');
    	$articleCustomerBackend = new Billing_Backend_ArticleCustomer();
		
    	$customerPrices = $articleCustomerBackend->getByArticleId($articleId);
    	$result = array();
    	foreach($customerPrices as $customerPrice){
    		$result[$customerPrice->__get('debitor_id')->__get('id')] = array(
    			'price_netto' => $customerPrice->__get('price_netto'),
    			'price_brutto' => $customerPrice->__get('price_brutto'),
    			'price2_netto' => 0,
    			'price2_brutto' => 0,
    			'price2_vat_id' => Billing_Controller_Vat::getInstance()->getByName('0'),
    			
    			'vat_id' => $record->__get('vat_id')
    		);
    	}
    	return $result;
    }
    
    /**
     * 
     * Get the creditor (buy) prices
     * @param unknown_type $record
     */
    public function getPricesForCreditors($record){
    	$articleId = $record->__get('id');
    	$articleSellPriceBackend = new Billing_Backend_ArticleSupplier();
		
    	$supplierPrices = $articleSellPriceBackend->getByArticleId($articleId);
    	
    	
    	$result = array();
    	foreach($supplierPrices as $supplierPrice){
    		$result[$supplierPrice->__get('creditor_id')->__get('id')] = array(
    			'price_netto' => $supplierPrice->__get('price'),
    			'price_brutto' => 0,
    			'vat_id' => $record->__get('vat_id'),
    			'price2_netto' => 0,
    			'price2_brutto' => 0,
    			'price2_vat_id' => Billing_Controller_Vat::getInstance()->getByName('0')
    		);
    	}
    	return $result;
    }
    
    /**
     * 
     * Get prices according to price groups
     * @param Tinebase_Model_Record $record
     */
    public function getPricesForPriceGroups($record){
    	$articleId = $record->__get('id');
    	$sellPriceBackend = new Billing_Backend_SellPrice();
    	$prices = $sellPriceBackend->getByArticleId($articleId);
    	$result = array();
    	foreach($prices as $price){
    		$result[$price->__get('price_group_id')->__get('id')] = array(
    			'name' => $price->__get('price_group_id')->__get('name'),
    			'price_netto' => $price->__get('price_netto'),
    			'price_brutto' => $price->__get('price_brutto'),
    			'price2_netto' => 0,
    			'price2_brutto' => 0,
    			'price2_vat_id' => Billing_Controller_Vat::getInstance()->getByName('0')
    		);
    	}
    	return $result;
    }
    
    /**
     * 
     * Get the article numbers of all existing articles
     */
    public function getArticleNumbers(){
    	$select = $this->_getSelect('article_nr', $_getDeleted);
        $stmt = $this->_db->query($select);
        $resultSet = $this->_rawDataToRecordSet($stmt->fetchAll());
        
        return $resultSet;
    }
    
       /**
     * Gets total count and sum of duration of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return array with count + sum
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
    {        
        $select = $this->_getSelect(array('count' => 'COUNT(*)'));
        $this->_addFilter($select, $_filter);
        
        // fetch complete row here
        $result = $this->_db->fetchRow($select);
        return $result;        
    } 
    
    /**
     * get the basic select object to fetch records from the database
     *  
     * @param array|string|Zend_Db_Expr $_cols columns to get, * per default
     * @param boolean $_getDeleted get deleted records (if modlog is active)
     * @return Zend_Db_Select
     */
    protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {
    	$select = $this->_db->select();    
    	$countOnly = false;
    	if (is_array($_cols) && isset($_cols['count'])) {
            $cols = array(
                'count'                => 'COUNT(*)'
            );
            $countOnly = true;
        } else {
            $cols = (array)$_cols;
        }
    	$select->from(array($this->_tableName => $this->_tablePrefix . $this->_tableName), $cols);
    	//$select = parent::_getSelect($_cols, $_getDeleted);
        if(!$countOnly){
	        $select->joinLeft(array('as' => $this->_tablePrefix . 'bill_article_supply'),
	          $this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('as.article_id'),
	        array());        
	        
	        $select->columns(array(
	         	'stock_amount_total'                  => 'SUM(as.amount)'
	        ));
	        $select->group(array($this->_tableName . '.id'));
        }
        if (!$_getDeleted && $this->_modlogActive) {
            // don't fetch deleted objects
            $select->where($this->_db->quoteIdentifier($this->_tableName . '.is_deleted') . ' = 0');                        
        }        
        
        $rights = Tinebase_Core::getUser()->getRights('Billing');
        if(in_array(Billing_Acl_Rights::POS_VIEW_RESTRICTED, $rights)){
        	$select->where($this->_db->quoteIdentifier($this->_tableName . '.pos_permitted') . ' = 1');
        }
        return $select;
    } 
}
?>