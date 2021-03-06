<?php
class Billing_Controller_BatchJobMonitionItem extends Tinebase_Controller_Record_Abstract
{
		
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;

	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_backend = new Billing_Backend_BatchJobMonitionItem();
		$this->_modelName = 'Billing_Model_BatchJobMonitionItem';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_config = isset(Tinebase_Core::getConfig()->somembers) ? Tinebase_Core::getConfig()->somembers : new Zend_Config(array());
	}

	private static $_instance = NULL;

	/**
	 * the singleton pattern
	 *
	 * @return SoBilling_Controller_SoEvent
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}

	public function getEmptyBatchJobMonitionItem(){
		$emptyOrder = new Billing_Model_BatchJobMonitionItem(null,true);
		return $emptyOrder;
	}
	
	public function getByBatchJobMonitionId($batchJobMonitionId){
		return $this->_backend->getMultipleByProperty($batchJobMonitionId, 'batch_monition_id');
	}
	
	public function getLastOpenItem(Tinebase_Record_RecordSet $batchJobMonitionItems){
		if($batchJobMonitionItems->getCount()==0){
			throw new Billing_Exception_OpenItem('Recordset does not contain any monition open items and therefore no related order.');
		}
		
		$batchJobMonitionItems->sort('open_item_id', 'DESC');
		
		$record = $batchJobMonitionItems->getFirstRecord();
		$openItem = $record->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
		
		return $openItem;
	}
	
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    	//$_record->__set('job_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('billing_batch_job_nr'));
    }
    
    protected function _inspectUpdate(Tinebase_Record_Interface $_record)
    {
    	//$_record->__set('modified_datetime', new Zend_Date());
    }
	
	
    /**
     * get attender BatchJobMonitionItems
     *
     * @param string $_sort
     * @param string $_dir
     * @return Tinebase_Record_RecordSet of subtype Billing_Model_AttenderBatchJobMonitionItem
     * 
     * @todo    use getAll from generic controller
     */
    public function getAllBatchJobMonitionItems($_sort = 'name', $_dir = 'ASC')
    {
        $result = $this->_backend->getAll($_sort, $_dir);
        return $result;    
    }
    
    public function getBatchJobMonitionItemsAsSimpleArray(){
    	$rows = $this->getAllBatchJobMonitionItems();
    	if($rows){
    		$aResult = array();
	    	$rows->translate();
	    	
	    	foreach($rows as $row){
	    		$aResult[] = array(
	    			$row->getId(),
	    			$row->__get('name')
	    		);
	    	}
	    	return $aResult;
    	}
    	// return empty arra
    	return array();
    }
}
?>