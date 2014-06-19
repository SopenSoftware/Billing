<?php
class Billing_Backend_OpenItemMonition extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_open_item_monition';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_OpenItemMonition';

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
        if($record->__get('open_item_id')){
    		$this->appendForeignRecordToRecord($record, 'open_item_id', 'open_item_id', 'id', new Billing_Backend_OpenItem());
        }
     	if($record->__get('monition_receipt_id')){
    		$this->appendForeignRecordToRecord($record, 'monition_receipt_id', 'monition_receipt_id', 'id', new Billing_Backend_Receipt());
        }
        if($record->__get('debitor_id')){
    		$this->appendForeignRecordToRecord($record, 'debitor_id', 'debitor_id', 'id', new Billing_Backend_Debitor());
    		$debitor = $record->__get('debitor_id');
    		try{
    			if(is_object($debitor)){
    				$contactId = $debitor->__get('contact_id');
    			}else{
    				$contactId = $debitor->contact_id;
    			}
    			$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
    			if(is_object($debitor)){
    				$debitor->__set('contact_id',$contact->toArray());
    			}else{
    				$debitor->contact_id = $contact->toArray();
    			}
    		}catch(Exception $e){
    		}
			$record->__set('debitor_id',$debitor);
        }
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
 
	
    /**
     * get the basic select object to fetch records from the database
     *  
     * @param array|string|Zend_Db_Expr $_cols columns to get, * per default
     * @param boolean $_getDeleted get deleted records (if modlog is active)
     * @return Zend_Db_Select
     */
   /*protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {
        
    	$_cols = array_merge((array) $_cols, array(
    		'op.total_sum'
    	));
    	
    	$select = parent::_getSelect($_cols, $_getDeleted);
        
       
		$select->joinLeft(array('op' => $this->_tablePrefix . 'bill_open_item'),
			$this->_db->quoteIdentifier($this->_tableName . '.open_item_id') . ' = ' . $this->_db->quoteIdentifier('op.id'),
        array());    
        
        $select->columns(array(
         	//'total_netto'                  => 'SUM(op.total_netto)',
           	//'total_brutto'                  => 'SUM(op.total_brutto)',
           	'due_days'					=> 'DATEDIFF('.$this->_db->quote($this->getDueDate()->toString('yyyy-MM-dd')).',bill_open_item_monition.due_date)',
           	
			'payment_date' 				=> 'pay.payment_date',
           	'receipt_due_date'                  => 'rc.due_date',
           	'total_netto'                  => 'rc.total_netto',
           	'total_brutto'                  => 'rc.total_brutto',
        	'usage' => 'rc.usage',
			'period' => 'rc.period',
			'is_member' => 'rc.is_member',
			'fee_group_id' => 'rc.fee_group_id'
        )); 
        
        
        //$select->group(array('rp.receipt_id'));

        return $select;
    } */
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
   /* public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
    {   
        if ($this->_useSubselectForCount) {
            // use normal search query as subselect to get count -> select count(*) from (select [...]) as count
            $select = $this->_getSelect($_cols, $_getDeleted);
            $this->_addFilter($select, $_filter);
            $countSelect = $this->_db->select()->from($select, array('count' => 'COUNT(*)'));
            //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $countSelect->__toString());
            
            $result = $this->_db->fetchOne($countSelect);
        } else {
            $select = $this->_getSelect(array('count' => 'COUNT(*)'));
            $this->_addFilter($select, $_filter);
            //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $select->__toString());

            $result = $this->_db->fetchOne($select);
        }
        
        return $result;        
    }    */
}
?>