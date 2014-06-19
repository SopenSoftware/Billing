<?php
class Billing_Backend_ArticleSold extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_receipt_position';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_ArticleSold';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
 	public function __construct ($_dbAdapter = NULL, $_modelName = NULL, $_tableName = NULL, $_tablePrefix = NULL, $_modlogActive = NULL, $_useSubselectForCount = NULL)
    {
    	parent::__construct($_dbAdapter, $_modelName, $_tableName, $_tablePrefix, $_modlogActive, $_useSubselectForCount);
    	$this->opBackend = new Billing_Backend_OrderPosition();
    }
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
       	$_filter->addFilter(new Billing_Model_ASInvoiceCreditFilter('combi_type', 'in', array('INVOICE','CREDIT')));
    	
       	$recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
        return $recordSet;
       
    }
    
    public function getDebitorIds(Tinebase_Model_Filter_FilterGroup $_filter){
    	$_filter->addFilter(new Billing_Model_ASInvoiceCreditFilter('combi_type', 'in', array('INVOICE','CREDIT')));
    	
    	$select = parent::_getSelect($_cols, $_getDeleted)->distinct();
        
        $select->joinLeft(array('op' => $this->_tablePrefix . 'bill_order_position'),
          $this->_db->quoteIdentifier('op.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName.'.order_position_id'),
        array());
        
        $select->joinLeft(array('sa' => $this->_tablePrefix . 'bill_article'),
			$this->_db->quoteIdentifier('op.article_id') . ' = ' . $this->_db->quoteIdentifier('sa.id'),
        array()); 

        $select->joinLeft(array('order' => $this->_tablePrefix . 'bill_order'),
          $this->_db->quoteIdentifier('order.id') . ' = ' . $this->_db->quoteIdentifier('op.order_id'),
        array());

        $select->columns(array(
        	'debitor_id' => 'order.debitor_id',
           	
        ));
        
        $this->_addFilter($select, $_filter);
        
        // get records
        $stmt = $this->_db->query($select);
        $rows = (array)$stmt->fetchAll(Zend_Db::FETCH_ASSOC);
        
        $result = array();
        foreach ($rows as $row) {
        	if($row['debitor_id']){
            	$result[] = $row['debitor_id'];
        	}
        }
       	return $result;
    }
    
    /**
     * 
     * Embed foreign records
     * @param Tinebase_Model_Record $record
     */
    protected function appendDependentRecords($record){

        if($record->__get('article_group_id')){
    		$this->appendForeignRecordToRecord($record, 'article_group_id', 'article_group_id', 'id', new Billing_Backend_ArticleGroup());
        }
     	if($record->__get('article_series_id')){
    		$this->appendForeignRecordToRecord($record, 'article_series_id', 'article_series_id', 'id', new Billing_Backend_ArticleSeries());
        }
        if($record->__get('unit_id')){
    		$this->appendForeignRecordToRecord($record, 'unit_id', 'unit_id', 'id', new Billing_Backend_ArticleUnit());
        } 
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
        $select = parent::_getSelect($_cols, $_getDeleted);
        
        $select->joinLeft(array('op' => $this->_tablePrefix . 'bill_order_position'),
          $this->_db->quoteIdentifier('op.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName.'.order_position_id'),
        array());
        
        $select->joinLeft(array('sa' => $this->_tablePrefix . 'bill_article'),
			$this->_db->quoteIdentifier('op.article_id') . ' = ' . $this->_db->quoteIdentifier('sa.id'),
        array()); 

        $select->joinLeft(array('order' => $this->_tablePrefix . 'bill_order'),
          $this->_db->quoteIdentifier('order.id') . ' = ' . $this->_db->quoteIdentifier('op.order_id'),
        array());
        
        $select->joinLeft(array('receipt' => $this->_tablePrefix . 'bill_receipt'),
          $this->_db->quoteIdentifier('receipt.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName.'.receipt_id'),
        array());
        

        $select->columns(array(
        	'article_id' => 'sa.id',
        	'unit_id' => 'sa.article_unit_id',
        	'article_nr' => 'sa.article_nr',
        	'article_group_id' => 'sa.article_group_id',
        	'article_series_id' => 'sa.article_series_id',
        	'article_ext_nr' => 'sa.article_ext_nr',
        	'name' => 'sa.name',
        	//'debitor_id' => 'order.debitor_id',
        	'description' => 'sa.description',
        	'price_netto'           => 'op.price_netto',
        	'price_brutto'           => 'op.price_brutto',
       		'min_price_netto'           => 'MIN(op.price_netto)',
        	'min_price_brutto'           => 'MIN(op.price_brutto)',
        	'max_price_netto'           => 'MAX(op.price_netto)',
        	'max_price_brutto'           => 'MAX(op.price_brutto)',
        	'amount' 				=> 'SUM(op.amount)',
         	'total_netto'           => 'SUM(op.total_netto)',
           	'total_brutto'          => 'SUM(op.total_brutto)',
        	'total1_netto'          => 'SUM(op.total1_netto)',
           	'total1_brutto'         => 'SUM(op.total1_brutto)',
       		'total2_netto'          => 'SUM(op.total2_netto)',
           	'total2_brutto'         => 'SUM(op.total2_brutto)',
        	'date1'					=> 'MIN(receipt.invoice_date)',
           	'date2'					=> 'MAX(receipt.invoice_date)'
           	
        ));
      	$select->group(array('sa.id'));

      	return $select;
    } 
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
    {   
        $_filter->addFilter(new Billing_Model_ASInvoiceCreditFilter('combi_type', 'in', array('INVOICE','CREDIT')));
    	
    	if ($this->_useSubselectForCount) {
            // use normal search query as subselect to get count -> select count(*) from (select [...]) as count
            $select = $this->_getSelect('*', $_getDeleted);
            
        
            $this->_addFilter($select, $_filter);
            $countSelect = $this->_db->select()->from($select, array('count' => 'COUNT(*)', '*' => '*'));
            //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $countSelect->__toString());
            
            $result = $this->_db->fetchOne($countSelect);
        } else {
            $select = $this->_getSelect(array('count' => 'COUNT(*)', '*' => '*'));
            $this->_addFilter($select, $_filter);

            //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $select->__toString());

            $result = $this->_db->fetchOne($select);
        }
        
        return $result;        
    }    
}
?>