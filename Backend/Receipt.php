<?php
class Billing_Backend_Receipt extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_receipt';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_Receipt';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = true;
    
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
    	Tinebase_User::getInstance()->resolveUsers($record, 'created_by');
    	Tinebase_User::getInstance()->resolveUsers($record, 'last_modified_by');
    	//Tinebase_User::getInstance()->resolveMultipleUsers($_records, 'account_id', true);
    	if($record->__get('order_id')){
    		$this->appendForeignRecordToRecord($record, 'order_id', 'order_id', 'id', new Billing_Backend_Order());
        	$order = $record->__get('order_id');
    		try{
    			if($order instanceof Billing_Model_Order){
    				$debitorId = $order->__get('debitor_id');
    			}else{
    				$debitorId = $order->debitor_id;
    			}
    			$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
    			if($order instanceof Billing_Model_Order){
    				$order->__set('debitor_id',$debitor->toArray());
    			}else{
    				$order->debitor_id = $debitor->toArray();
    			}
    		}catch(Exception $e){
    		}
			$record->__set('order_id',$order);
        }
    	if($record->__get('booking_id')){
    		$this->appendForeignRecordToRecord($record, 'booking_id', 'booking_id', 'id', new Billing_Backend_Booking());
    	}
        if($record->__get('payment_method_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_method_id', 'payment_method_id', 'id', new Billing_Backend_PaymentMethod());
        }  
        if($record->__get('fee_group_id')){
    		$this->appendForeignRecordToRecord($record, 'fee_group_id', 'fee_group_id', 'id', new Membership_Backend_FeeGroup());
    	} 
//        $rBackend = new Billing_Backend_ReceiptPosition();
//        $receiptPositions = $rBackend->getByReceiptId($record->getId());
//        $sumNetto = 0;
//        $sumBrutto = 0;
//        $count = 0;
//        $totalWeight = 0;
//        foreach($receiptPositions as $pos){
//        	$netto = $pos->__get('total_netto');
//        	$brutto = $pos->__get('total_brutto');
//        	$weight = $pos->__get('total_weight');
//        	$sumNetto += $netto;
//        	$sumBrutto += $brutto;
//        	$totalWeight += $weight;
//        	$count++;
//        }
//        $record->__set('total_netto', $sumNetto);
//        $record->__set('total_brutto', $sumBrutto);
//        $record->__set('pos_count', $count);
//        $record->__set('total_weight', $totalWeight);
        
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
    
    /**
     * Gets total count of search with $_filter
     * 
     * @param Tinebase_Model_Filter_FilterGroup $_filter
     * @return int
     */
    public function searchCount(Tinebase_Model_Filter_FilterGroup $_filter, $_getDeleted= false)
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
    }   
    
    public function getSums(Tinebase_Model_Filter_FilterGroup $_filter){
    	
    	$select = $this->_db->select();
		$subselect = $this->_getSelect();
		$this->_addFilter($subselect, $_filter);
		
		
        $select->from($subselect, array(
			'global_netto' => 'SUM(total_netto)',
			'global_brutto' => 'SUM(total_brutto)',
        	'count' 		=> 'COUNT(id)'
		));
		
		
		$result = $this->_db->fetchAll($select);
		
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
		/*	$select = $this->_db->select();
		
		$subselect = parent::_getSelect(array('id', 'type'), FALSE);
        
        $subselect->joinLeft(array('rp' => $this->_tablePrefix . 'bill_receipt_position'),
          $this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('rp.receipt_id'),
        array());        

        $this->_addFilter($subselect, $_filter);
        
        $subselect->group(array('rp.receipt_id'));
        
        $select->from($subselect, array(
			'count' => 'COUNT(*)'
		));
		
        return $select;*/
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
        
        /*$select->joinLeft(array('rp' => $this->_tablePrefix . 'bill_receipt_position'),
          $this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('rp.receipt_id'),
        array());        
        
        $select->joinLeft(array('order' => $this->_tablePrefix . 'bill_order'),
          $this->_db->quoteIdentifier('order.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName . '.order_id'),
        array());
        
        $select->joinLeft(array('debitor_id' => $this->_tablePrefix . 'bill_order'),
          $this->_db->quoteIdentifier('order.id') . ' = ' . $this->_db->quoteIdentifier($this->_tableName . '.order_id'),
        array());
        */
        
        $select->columns(array(
         	//'total_netto'                  	=> 'SUM(op.total_netto)',
           	//'total_brutto'                  => 'SUM(op.total_brutto)',
           // 'pos_count'                  	=> 'COUNT(rp.id)'//,
        	//'total_weight'                  => 'COUNT(op.total_weight)'
        ));
        
        //$select->group(array('rp.receipt_id'));
        
        return $select;
    }    
}
?>