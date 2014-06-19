<?php
class Billing_Backend_OpenItem extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_open_item';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_OpenItem';

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
        if($record->__get('order_id')){
    		$this->appendForeignRecordToRecord($record, 'order_id', 'order_id', 'id', new Billing_Backend_Order());
        }
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
        if($record->__get('payment_method_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_method_id', 'payment_method_id', 'id', new Billing_Backend_PaymentMethod());
        }  
		if($record->__get('payment_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_id', 'payment_id', 'id', new Billing_Backend_Payment());
        }  
		if($record->__get('fee_group_id')){
    		$this->appendForeignRecordToRecord($record, 'fee_group_id', 'fee_group_id', 'id', new Membership_Backend_FeeGroup());
    	} 
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
    
	/*public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter, $_getDeleted= false)
    {   
    	if ($this->_useSubselectForCount) {
            // use normal search query as subselect to get count -> select count(*) from (select [...]) as count
            $select = $this->_getCountSelect($_cols, $_getDeleted, $_filter);
            $countSelect = $this->_db->select()->from($select, array('count' => 'COUNT(*)'));
            
            $result = $this->_db->fetchOne($countSelect);
        } else {
            $select = $this->_getCountSelect(array('count' => 'COUNT(*)'), $_getDeleted, $_filter);
            //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . $select->__toString());

            $result = $this->_db->fetchOne($select);
        }
        
        return $result;        
    }   */
    
    public function getSums(Tinebase_Model_Filter_FilterGroup $_filter){
    	
		//$aF = $_filter->toArray();
		//print_r($aF);
    	$select = $this->_db->select();
		$subselect = $this->_getSelect();
		$this->_addFilter($subselect, $_filter);
				
        $select->from($subselect, array(
			'global_netto' => 'SUM(total_netto)',
			'global_brutto' => 'SUM(total_brutto)',
			'global_open' => 'SUM(open_sum)',
			'global_payed' => 'SUM(payed_sum)',
        	'count' 		=> 'COUNT(id)'
		));
		
		//echo $select->assemble();
		$result = $this->_db->fetchAll($select);
		//print_r($result);
		return $result[0];
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
        
        $select->joinLeft(array('rc' => $this->_tablePrefix . 'bill_receipt'),
			$this->_db->quoteIdentifier($this->_tableName . '.receipt_id') . ' = ' . $this->_db->quoteIdentifier('rc.id'),
        array());        
        
        
        /*$select->joinLeft(array('rp' => $this->_tablePrefix . 'bill_receipt_position'),
			$this->_db->quoteIdentifier($this->_tableName . '.receipt_id') . ' = ' . $this->_db->quoteIdentifier('rp.receipt_id'),
        array());        
        
        $select->joinLeft(array('op' => $this->_tablePrefix . 'bill_order_position'),
          $this->_db->quoteIdentifier('op.id') . ' = ' . $this->_db->quoteIdentifier('rp.order_position_id'),
        array());*/
		
		$select->joinLeft(array('pay' => $this->_tablePrefix . 'bill_payment'),
			$this->_db->quoteIdentifier($this->_tableName . '.payment_id') . ' = ' . $this->_db->quoteIdentifier('pay.id'),
        array());    
        
        $select->columns(array(
         	//'total_netto'                  => 'SUM(op.total_netto)',
           	//'total_brutto'                  => 'SUM(op.total_brutto)',
           	'due_days'					=> 'DATEDIFF('.$this->_db->quote($this->getDueDate()->toString('yyyy-MM-dd')).',rc.due_date)+0',
           	
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
    } 
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter)
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
    }    
}
?>