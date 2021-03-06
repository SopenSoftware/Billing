<?php
class Billing_Backend_SupplyOrderPosition extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_supply_receipt_position';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_SupplyOrderPosition';

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
        if($record->__get('supply_receipt_id')){
    		$this->appendForeignRecordToRecord($record, 'supply_receipt_id', 'supply_receipt_id', 'id', new Billing_Backend_SupplyReceipt());
        }
        if($record->__get('article_id')){
    		$this->appendForeignRecordToRecord($record, 'article_id', 'article_id', 'id', new Billing_Backend_Article());
        }    	
        if($record->__get('vat_id')){
    		$this->appendForeignRecordToRecord($record, 'vat_id', 'vat_id', 'id', new Billing_Backend_Vat());
        }
        if($record->__get('unit_id')){
    		$this->appendForeignRecordToRecord($record, 'unit_id', 'unit_id', 'id', new Billing_Backend_ArticleUnit());
        } 
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
    
    public function getBySupplyReceiptId($receiptId){
    	$recordSet =  $this->getMultipleByProperty($receiptId,'supply_receipt_id');
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
    	return $recordSet;
    }
    
}
?>