<?php
class Billing_Backend_DebitorAccount extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_debitor_account';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_DebitorAccount';

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
  /*      if($record->__get('order_id')){
    		$this->appendForeignRecordToRecord($record, 'order_id', 'order_id', 'id', new Billing_Backend_Order());
        }*/
        if($record->__get('receipt_id')){
    		$this->appendForeignRecordToRecord($record, 'receipt_id', 'receipt_id', 'id', new Billing_Backend_Receipt());
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
    	if($record->__get('booking_id')){
    		$this->appendForeignRecordToRecord($record, 'booking_id', 'booking_id', 'id', new Billing_Backend_Booking());
    	}
		if($record->__get('payment_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_id', 'payment_id', 'id', new Billing_Backend_Payment());
        }  
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }     
    
 	public function getSums(Tinebase_Model_Filter_FilterGroup $_filter){
    	
    	$select = $this->_db->select();
		$subselect = $this->_getSelect();
		$this->_addFilter($subselect, $_filter);
		
		
        $select->from($subselect, array(
			'total_netto' => 'SUM(s_brutto)',
			'total_brutto' => 'SUM(h_brutto)'
		));
		
		
		$result = $this->_db->fetchAll($select);
		
		$retVal = $result[0];
		if(!$retVal['total_netto']){
			$retVal['total_netto'] = 0;
		}
 		if(!$retVal['total_brutto']){
			$retVal['total_brutto'] = 0;
		}
		$retVal['sum'] = $retVal['total_brutto'] - $retVal['total_netto'];
		return $retVal;
		
    }
}
?>