<?php
class Billing_Backend_AccountClass extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_account_class';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_AccountClass';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
        return parent::search($_filter,$_pagination,$_onlyIds);
    	/*if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
    	return $recordSet;*/
    }
    
    public function get($id, $_getDeleted = FALSE){
    	return parent::get($id, $_getDeleted);
    }
}
?>