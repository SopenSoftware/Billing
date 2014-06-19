<?php
class Billing_Backend_SupplyReceipt extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_supply_receipt';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_SupplyReceipt';

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
    	if($record->__get('supply_order_id')){
    		$this->appendForeignRecordToRecord($record, 'supply_order_id', 'supply_order_id', 'id', new Billing_Backend_SupplyOrder());
        	$supply_order = $record->__get('supply_order_id');
    		try{
    			if(is_object($supply_order)){
    				$creditorId = $supply_order->__get('creditor_id');
    			}else{
    				$creditorId = $supply_order->creditor_id;
    			}
    			$creditor = Billing_Controller_Creditor::getInstance()->get($creditorId);
    			if(is_object($creditor)){
    				$supply_order->__set('creditor_id',$creditor->toArray());
    			}else{
    				$supply_order->creditor_id = $creditor->toArray();
    			}
    		}catch(Exception $e){
    		}
			$record->__set('supply_order_id',$supply_order);
        }
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
}
?>