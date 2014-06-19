<?php
class Billing_Backend_ArticleSupplier extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_article_supplier';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_ArticleSupplier';

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
        if($record->__get('creditor_id')){
        	$creditor = Billing_Controller_Creditor::getInstance()->get($record->__get('creditor_id'));
    		$record->__set('creditor_id',$creditor);
//        	$creditor = Billing_Controller_Creditor::getInstance()->get($record->__get('creditor_id'));
//    		$record->__set('creditor_id',$creditor);
//    		$this->appendForeignRecordToRecord($record, 'creditor_id', 'creditor_id', 'id', new Billing_Backend_Creditor());
//    		$creditor = $record->__get('creditor_id');
//    		try{
//    			if(is_object($creditor)){
//    				$contactId = $creditor->__get('contact_id');
//    			}else{
//    				$contactId = $creditor->contact_id;
//    			}
//    			$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
//    			if(is_object($creditor)){
//    				$creditor->__set('contact_id',$contact->toArray());
//    			}else{
//    				$creditor->contact_id = $contact->toArray();
//    			}
//    		}catch(Exception $e){
//    		}
//			$record->__set('creditor_id',$creditor);
        }
        if($record->__get('article_id')){
    		$this->appendForeignRecordToRecord($record, 'article_id', 'article_id', 'id', new Billing_Backend_Article());
    		//$record->__set('article_id',$article);
        }
    }
    
    public function get($id, $_getDeleted = FALSE, $getDependent = false){
    	$record = parent::get($id, $_getDeleted);
    	if($getDependent){
    		$this->appendDependentRecords($record);
    	}
    	return $record;
    }
    
    public function getByArticleId($articleId){
    	$recordSet = $this->getMultipleByProperty($articleId, 'article_id');
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