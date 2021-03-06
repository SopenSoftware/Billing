<?php
class Billing_Backend_AccountBookingTemplate extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_booking_template_account';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_AccountBookingTemplate';

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
        if($record->__get('account_system_id')){
    		$this->appendForeignRecordToRecord($record, 'account_system_id', 'account_system_id', 'id', new Billing_Backend_AccountSystem());
    	}
    	if($record->__get('booking_template_id')){
    		$this->appendForeignRecordToRecord($record, 'booking_template_id', 'booking_template_id', 'id', new Billing_Backend_BookingTemplate());
    	}
    	
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
}
?>