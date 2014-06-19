<?php
class Billing_Backend_BatchJobMonition extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_batch_monition';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_BatchJobMonition';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
    	// no ids searchable
    	// check if needed anywhere and modify if so
        $recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	if( !$_onlyIds && ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
    	return $recordSet;
    }
    
    /**
     * Append contacts by foreign key (record embedding)
     * 
     * @param Tinebase_Record_Abstract $record
     * @return void
     */
    protected function appendDependentRecords($record){
    	Tinebase_User::getInstance()->resolveUsers($record, 'created_by_user');
    	Tinebase_User::getInstance()->resolveUsers($record, 'processed_by_user');
     	if($record->__get('job_id')){
    		$this->appendForeignRecordToRecord($record, 'job_id', 'job_id', 'id', new Billing_Backend_BatchJob());
        }
    	if($record->__get('contact_id')){
    		$this->appendForeignRecordToRecord($record, 'contact_id', 'contact_id', 'id', Addressbook_Backend_Factory::factory(Addressbook_Backend_Factory::SQL));
        }
    	if($record->__get('debitor_id')){
    		$this->appendForeignRecordToRecord($record, 'debitor_id', 'debitor_id', 'id', new Billing_Backend_Debitor());
        }
    }
    /**
     * Get Billing record by id (with embedded dependent contacts)
     * 
     * @param int $id
     */
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }    
    
	public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
    {        
        $select = $this->_getSelect(array('count' => 'COUNT(*)'));
        $this->_addFilter($select, $_filter);
        
        // fetch complete row here
        $result = $this->_db->fetchRow($select);
        return $result;        
    } 
    
	protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {     
        $select = $this->_db->select();    
        
        if (is_array($_cols) && isset($_cols['count'])) {
            $cols = array(
            	'count'         => 'COUNT(*)',
            	'count_op'		=> 'SUM(count_pos)',
                'total_sum'     => 'SUM(total_sum)'
            );
            
        }else{
        	$cols = array_merge((array)$_cols,
        	array('diff_saldation'         => 'ROUND(ABS(diff_saldation),2)'));
			
			$cols = array_merge(
                (array)$_cols, 
                array(
                	'n_family' => 'co.n_family',
                	'org_name' => 'co.org_name',
                	'adr_one_postalcode'    	=> 'co.adr_one_postalcode',
                	'adr_one_street'  => 'co.adr_one_street',
                	'adr_one_locality'  => 'co.adr_one_locality'
                )
            );
        }

        $select->from(array($this->_tableName => $this->_tablePrefix . $this->_tableName), $cols);
        
        $select->joinLeft(array('co' => $this->_tablePrefix . 'addressbook'),
        	$this->_db->quoteIdentifier('co.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName . '.contact_id'),
        array()); 
		
        return $select; 
    }
}
?>