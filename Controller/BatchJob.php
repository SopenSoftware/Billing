<?php
class Billing_Controller_BatchJob extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_BatchJob();
		$this->_modelName = 'Billing_Model_BatchJob';
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

	public function getEmptyBatchJob(){
		$emptyOrder = new Billing_Model_BatchJob(null,true);
		return $emptyOrder;
	}
	
	public function createRuntimeBatchJob( $category, $name1, $name2, $data ){
		$job = Billing_Model_BatchJob::createRuntimeBatchJob( $this->_currentAccount->getId(), $category, $name1, $name2, $data );
		return $this->create($job);
	}
	
	public function createSchedulerBatchJob( $category, $name1, $name2, $data ){
		$job = Billing_Model_BatchJob::createSchedulerBatchJob(  $this->_currentAccount->getId(),$category, $name1, $name2, $data );
		return $this->create($job);
	}
	
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    	$_record->__set('job_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('billing_batch_job_nr'));
    }
    
    protected function _inspectUpdate(Tinebase_Record_Interface $_record)
    {
    	$_record->__set('modified_datetime', new Zend_Date());
    }
	
	
    /**
     * get attender BatchJobs
     *
     * @param string $_sort
     * @param string $_dir
     * @return Tinebase_Record_RecordSet of subtype Billing_Model_AttenderBatchJob
     * 
     * @todo    use getAll from generic controller
     */
    public function getAllBatchJobs($_sort = 'name', $_dir = 'ASC')
    {
        $result = $this->_backend->getAll($_sort, $_dir);
        return $result;    
    }
    
    public function getBatchJobsAsSimpleArray(){
    	$rows = $this->getAllBatchJobs();
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