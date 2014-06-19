<?php
class Billing_Backend_SepaMandate extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_sepa_mandate';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_SepaMandate';
    
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
    protected $_modlogActive = true;
    
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
    	if($record->__get('bank_id')){
    		$this->appendForeignRecordToRecord($record, 'bank_id', 'bank_id', 'id', new Billing_Backend_Bank());
    	}
    	if($record->__get('bank_account_id')){
    		$this->appendForeignRecordToRecord($record, 'bank_account_id', 'bank_account_id', 'id', new Billing_Backend_BankAccount());
    	}	
    	if($record->__get('sepa_creditor_id')){
    		$this->appendForeignRecordToRecord($record, 'sepa_creditor_id', 'sepa_creditor_id', 'id', new Billing_Backend_SepaCreditor());
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
    
     protected function _getCountSelect($_cols = '*', $_getDeleted = FALSE, $_filter)
    {
    	$select = parent::_getSelect();
		
    	$this->_addFilter($select, $_filter);
    	
		$select->columns(array(
			'count' => 'COUNT(*)'
		));
		
		return $select;
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
        
        $select->joinLeft(array('bact' => $this->_tablePrefix . 'bill_bank_account'),
			$this->_db->quoteIdentifier('bank_account_id') . ' = ' . $this->_db->quoteIdentifier('bact.id'),
			array()
		);
        
        $select->joinLeft(array('ba' => $this->_tablePrefix . 'bill_bank'),
			$this->_db->quoteIdentifier('bact.bank_id') . ' = ' . $this->_db->quoteIdentifier('ba.id'),
			array()
		);      
        
        $select->columns(array(
			'bank_id' => 'ba.id',
        	'iban' => 'bact.iban',
        	'contact_id' => 'bact.contact_id',
			'bic' => 'ba.bic',
        	'account_name' => 'bact.name',
	        'bank_code' => 'ba.code',
	        'bank_name' => 'ba.name',
	        'bank_country_code' => 'ba.country_code',
	        'bank_postal_code' => 'ba.postal_code',
	        'bank_location' => 'ba.location'
        ));
		
        return $select;
    } 
}
?>