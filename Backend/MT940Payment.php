<?php
class Billing_Backend_MT940Payment extends Tinebase_Backend_Sql_Abstract
{
	/**
	 * Table name without prefix
	 *
	 * @var string
	 */
	protected $_tableName = 'bill_mt940_payment';

	/**
	 * Model name
	 *
	 * @var string
	 */
	protected $_modelName = 'Billing_Model_MT940Payment';

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
		if($record->__get('op_id')){
			$this->appendForeignRecordToRecord($record, 'op_id', 'op_id', 'id', new Billing_Backend_OpenItem());
		}
		if($record->__get('account_system_id')){
			$this->appendForeignRecordToRecord($record, 'account_system_id', 'account_system_id', 'id', new Billing_Backend_AccountSystem());
		}
		if($record->__get('account_system_id_haben')){
			$this->appendForeignRecordToRecord($record, 'account_system_id_haben', 'account_system_id_haben', 'id', new Billing_Backend_AccountSystem());
		}
		if($record->__get('return_debit_base_payment_id')){
			$this->appendForeignRecordToRecord($record, 'return_debit_base_payment_id', 'return_debit_base_payment_id', 'id', new Billing_Backend_Payment());
		}
	}

	public function get($id, $_getDeleted = FALSE){
		$record = parent::get($id, $_getDeleted);
		$this->appendDependentRecords($record);
		return $record;
	}
}
?>