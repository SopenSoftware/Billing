<?php
class Billing_Backend_ReceiptPosition extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_receipt_position';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_ReceiptPosition';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    public function __construct ($_dbAdapter = NULL, $_modelName = NULL, $_tableName = NULL, $_tablePrefix = NULL, $_modlogActive = NULL, $_useSubselectForCount = NULL)
    {
    	parent::__construct($_dbAdapter, $_modelName, $_tableName, $_tablePrefix, $_modlogActive, $_useSubselectForCount);
    	$this->opBackend = new Billing_Backend_OrderPosition();
    }
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
        $recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	$resultRecordSet = new Tinebase_Record_RecordSet('Billing_Model_OrderPosition');
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$resultRecordSet->addRecord($this->loadOrderPosition($record));			
    		}
    	}
    	return $resultRecordSet;
    }
    
    protected function loadOrderPosition($record){
      	// extract potential overrides
    	$amount = $record->__get('amount');
    	$totalWeight = $record->__get('total_weight');
    	$positionNr = $record->__get('position_nr');
    	$orderPositionId = $record->__get('order_position_id');
    	// REMARK:
    	// setting amount etc here in the linked receipt_position
    	// makes sense for part delivery or part billing!!
    	// -> TODO: adapt sums, if this get used!
    	$orderPosition = $this->opBackend->get($orderPositionId);
    	if($amount){
    		$orderPosition->__set('amount',$amount);
    	}
    	if($totalWeight){
    		$orderPosition->__set('total_weight',$totalWeight);
    	}
        if($positionNr){
    		$orderPosition->__set('position_nr',$positionNr);
    	}
    	
    	return $orderPosition;
    }
    
    public function get($id, $_getDeleted = FALSE, $regular = true){
    	$record = parent::get($id, $_getDeleted);
    	if(!$regular){
    		return $this->loadOrderPosition($record);
    	}
    	return $record;
    }
    
    public function getByReceiptId($receiptId){
    	$recordSet =  $this->getMultipleByProperty($receiptId,'receipt_id',false,'position_nr');
    	$resultRecordSet = new Tinebase_Record_RecordSet('Billing_Model_OrderPosition');
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$resultRecordSet->addRecord($this->loadOrderPosition($record));			
    		}
    	}
    	return $resultRecordSet;
    }
}
?>