<?php
class Billing_Backend_OrderTemplatePosition extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_order_template_position';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_OrderTemplatePosition';

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
        if($record->__get('order_template_id')){
    		$this->appendForeignRecordToRecord($record, 'order_template_id', 'order_template_id', 'id', new Billing_Backend_OrderTemplate());
        }
        if($record->__get('article_id')){
        	$article = Billing_Controller_Article::getInstance()->get($record->__get('article_id'));
    		$record->__set('article_id',$article);
        }    	
        if($record->__get('vat_id')){
    		$this->appendForeignRecordToRecord($record, 'vat_id', 'vat_id', 'id', new Billing_Backend_Vat());
        }
        if($record->__get('price_group_id')){
    		$this->appendForeignRecordToRecord($record, 'price_group_id', 'price_group_id', 'id', new Billing_Backend_PriceGroup());
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
    
    public function getByOrderTemplateId($orderTemplateId){
    	$recordSet =  $this->getMultipleByProperty($orderTemplateId,'order_template_id', false, 'position_nr');
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