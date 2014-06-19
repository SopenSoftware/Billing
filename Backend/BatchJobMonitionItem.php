<?php
class Billing_Backend_BatchJobMonitionItem extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_batch_monition_item';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_BatchJobMonitionItem';

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
    	if($record->__get('batch_monition_id')){
    		$this->appendForeignRecordToRecord($record, 'batch_monition_id', 'batch_monition_id', 'id', new Billing_Backend_BatchJobMonition());
        }
    	if($record->__get('open_item_id')){
    		$this->appendForeignRecordToRecord($record, 'open_item_id', 'open_item_id', 'id', new Billing_Backend_OpenItem());
        }
        /*
    	if($record->__get('payment_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_id', 'payment_id', 'id', new Billing_Backend_Payment());
        }*/
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
}
?>