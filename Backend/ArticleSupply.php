<?php
class Billing_Backend_ArticleSupply extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_article_supply';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_ArticleSupply';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
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
    
    protected function appendDependentRecords($record){
        if($record->__get('article_id')){
        	$article = Billing_Controller_Article::getInstance()->get($record->__get('article_id'));
    		$record->__set('article_id',$article);
    		//$this->appendForeignRecordToRecord($record, 'article_id', 'article_id', 'id', new Billing_Backend_Article());
    	}
        if($record->__get('stock_location_id')){
    		$this->appendForeignRecordToRecord($record, 'stock_location_id', 'stock_location_id', 'id', new Billing_Backend_StockLocation());
    	}
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
}
?>