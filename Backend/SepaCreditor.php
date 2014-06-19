<?php
class Billing_Backend_SepaCreditor extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_sepa_creditor';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_SepaCreditor';
    
    /**
     * 
     * Identifier (differs here: contact_id is primary and foreign key)
     * @var string
     */
    protected $_identifier = 'id';

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
     * Append dependent records as contact or price_group
     * @param Tinebase_Record_Interface $record
     */
    protected function appendDependentRecords($record){
        if($record->__get('contact_id')){
    		$this->appendForeignRecordToRecord($record, 'contact_id', 'contact_id', 'id', Addressbook_Backend_Factory::factory(Addressbook_Backend_Factory::SQL));
    	}
    	if($record->__get('bank_account_id')){
    		$this->appendForeignRecordToRecord($record, 'bank_account_id', 'bank_account_id', 'id', new Billing_Backend_BankAccount());
    	}
        	
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
     * Get bank_account record by contact_id
     * 
     * @param int $contactId
     * @return	Tinebase_Model_BankAccount	The bank_account record
     */
    public function getByContactId($contactId){
    	$obj = $this->getByProperty($contactId, 'contact_id');
    	return $this->get($obj->getId());
    }
}
?>