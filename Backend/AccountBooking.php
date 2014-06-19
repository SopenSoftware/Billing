<?php
class Billing_Backend_AccountBooking extends Tinebase_Backend_Sql_Abstract
{
	/**
	 * Table name without prefix
	 *
	 * @var string
	 */
	protected $_tableName = 'bill_account_booking';

	/**
	 * Model name
	 *
	 * @var string
	 */
	protected $_modelName = 'Billing_Model_AccountBooking';

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
		if($record->__get('booking_id')){
			$this->appendForeignRecordToRecord($record, 'booking_id', 'booking_id', 'id', new Billing_Backend_Booking());
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
	protected function _getValidationSelect($_cols = '*', $_getDeleted = FALSE)
	{

		$select = $this->_db->select();

		$subselect = parent::_getSelect($_cols, $_getDeleted);

		$subselect->joinLeft(array('bk' => $this->_tablePrefix . 'bill_booking'),
		$this->_db->quoteIdentifier('booking_id') . ' = ' . $this->_db->quoteIdentifier('bk.id'),
		array());

		$subselect->columns(array(
        	'total_credit' 			=> 'ABS(SUM(credit_value))',
         	'total_debit'           => 'ABS(SUM(debit_value))'
        ));

        $subselect->group(array('bk.id'));

        $select->from($subselect, array(
        	'booking_id' =>  'booking_id',
        	'atotal_credit' => 'total_credit' ,
        	'atotal_debit' => 'total_debit'
       	));

        $select->where('total_credit != total_debit');

        return $select;
	}

	public function getInvalidBookingIds(){
			
		$stmt = $this->_db->query($this->_getValidationSelect());
			
		$rows = (array)$stmt->fetchAll(Zend_Db::FETCH_ASSOC);

		$result = array();
		foreach ($rows as $row) {
			$result[] = $row['booking_id'];
		}

		return $result;
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
        
        $select->joinLeft(array('bk' => $this->_tablePrefix . 'bill_booking'),
			$this->_db->quoteIdentifier('booking_id') . ' = ' . $this->_db->quoteIdentifier('bk.id'),
			array()
		);      
        
        $select->columns(array(
			'booking_date' => 'bill_account_booking.booking_date',
        	'erp_context_id' => 'bk.erp_context_id',
			'b_booking_date' => 'bk.booking_date'
			
        ));
		
        return $select;
    } 
}
?>