<?php
class Billing_Backend_AccountSystem extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_account_system';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_AccountSystem';

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
    	$sumDebit = (float) $record->__get('sum_debit');
    	$sumCredit = (float) $record->__get('sum_credit');
    	if($sumCredit>=$sumDebit){
    		$record->__set('credit_saldo', (float)$record->__get('begin_credit_saldo')  - (float)$record->__get('begin_debit_saldo')+ $sumCredit-$sumDebit);
    	}else{
    		$record->__set('debit_saldo',  (float)$record->__get('begin_debit_saldo') - (float)$record->__get('begin_credit_saldo') + $sumDebit-$sumCredit);
    	}
    	
        if($record->__get('vat_account_id')){
    		$this->appendForeignRecordToRecord($record, 'vat_account_id', 'vat_account_id', 'id', new Billing_Backend_AccountSystem());
    	}
     	if($record->__get('account_class_id')){
    		$this->appendForeignRecordToRecord($record, 'account_class_id', 'account_class_id', 'id', new Billing_Backend_AccountClass());
    	}
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
    
    public function getSums(Tinebase_Model_Filter_FilterGroup $_filter, $fromExDate = null, $untilExDate = null, array $accountIds = null, &$select){
    	
    	$select = $this->_db->select();
		$subselect = $this->_getSelect('*', false, $fromExDate, $untilExDate, $accountIds );
		/*if($fromExDate){
			$_filter->addFilter($_filter->createFilter('booking_date', 'afterOrAt',$fromExDate->toString('yyyy-MM-dd')));
		}
		if($untilExDate){
			$_filter->addFilter($_filter->createFilter('booking_date', 'beforeOrAt',$untilExDate->toString('yyyy-MM-dd')));
		}*/
		$this->_addFilter($subselect, $_filter);
		
        $select->from($subselect, array(
			'debit_total' => 'SUM(sum_debit)',
			'credit_total' => 'SUM(sum_credit)'
		));
		
		
		$result = $this->_db->fetchAll($select);
		
		return $result[0];
    }
    
    /**
     * get the basic select object to fetch records from the database
     *  
     * @param array|string|Zend_Db_Expr $_cols columns to get, * per default
     * @param boolean $_getDeleted get deleted records (if modlog is active)
     * @return Zend_Db_Select
     */
    protected function _getSelect($_cols = '*', $_getDeleted = FALSE, $fromDate = null, $untilDate = null, array $accountSystemIds = null)
    {
        if (is_array($_cols) && isset($_cols['count'])) {
            $cols = array(
                'count'                => 'COUNT(*)'
            );
            
        } else {
            $cols = (array) $_cols;
        }
       
        $select = parent::_getSelect($_cols, $_getDeleted);
       
    	$strAddFrom = '';
    	if(!is_null($fromDate)){
    		$fromDate = new Zend_Date($fromDate);
    		$strAddFrom = " AND ab.booking_date >= '". $fromDate->toString('yyyy-MM-dd')."'";
    		
    	}
    	
    	$strAddUntil = '';
    	if(!is_null($untilDate)){
    		$untilDate = new Zend_Date($untilDate);
    		$strAddUntil = " AND ab.booking_date <= '". $untilDate->toString('yyyy-MM-dd')."'";
    	}
    	
    	$strAccountSystems = '';
    	if(is_array($accountSystemIds) && count($accountSystemIds)>0){
    		$strAccountSystems = " AND ab.account_system_id IN (". org\sopen\app\util\arrays\ArrayHelper::explodeQuoted($accountSystemIds).") ";    		
    	}
    	
        $select->joinLeft(array('ab' => $this->_tablePrefix . 'bill_account_booking'),
          '('.$this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('ab.account_system_id').
          $strAddFrom.$strAddUntil.$strAccountSystems.')',
        array());
        
        
        
        $select->columns(array(
        	'sum_debit'                  	=> 'SUM(ab.debit_value)',
            'sum_credit'                  	=> 'SUM(ab.credit_value)'
        ));
        
        $select->group(array($this->_tableName . '.id','ab.account_system_id'));
        
        //echo $select->assemble();
        
        return $select;
    }   
    
    protected function _getCountSelect($_cols = '*', $_getDeleted = FALSE, $_filter, $fromDate = null, $untilDate = null)
    {
    	$select = $this->_db->select();
		
		$subselect = parent::_getSelect(array('id', 'type'), FALSE);
        
    	$strAddFrom = '';
    	if(!is_null($fromDate)){
    		$fromDate = new Zend_Date($fromDate);
    		$strAddFrom = ' AND ab.booking_date >= '. $fromDate->toString('yyyy-mm-dd').' ';
    	}
    	
    	$strAddUntil = '';
    	if(!is_null($untilDate)){
    		$untilDate = new Zend_Date($untilDate);
    		$strAddUntil = ' AND ab.booking_date <= '. $untilDate->toString('yyyy-mm-dd');
    	}
    	
        $subselect->joinLeft(array('ab' => $this->_tablePrefix . 'bill_account_booking'),
          $this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('ab.account_system_id').
           $strAddFrom.$strAddUntil,
        array());        

        $this->_addFilter($subselect, $_filter);
        
        $subselect->group(array($this->_tableName .'.id','ab.account_system_id'));
        
        $select->from($subselect, array(
			'count' => 'COUNT(*)'
		));
		
        return $select;
    }    

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
    
    
}
?>