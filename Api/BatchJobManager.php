<?php
class Billing_Api_BatchJobManager{
	protected $jobController = null;
	protected $applicationName = 'Billing';
	protected $modelName = null;
	protected $currentAccount = null;
	protected $jobs = array();
	protected $job = null;
	
	protected $updateInterval = 20; // 100/20 = 5 every 5% step will trigger a job update
	
	private function __construct() {
		$this->jobController = Billing_Controller_BatchJob::getInstance();
		
		$this->modelName = 'Billing_Model_BatchJob';
		$this->currentAccount = Tinebase_Core::getUser();
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
	
	private function isNonCountAction(Billing_Api_BatchJob_Interface_Processable $task){
		return false;
	}
	
	public function hasBatchJob(){
		return !is_null($this->job);
	}
	
	public function getBatchJobId(){
		if($this->job){
			return $this->job->getId();
		}else{
			return null;	
		}
	}
	
	public function requestRuntimeBatchJob($category, $name1=null, $name2=null, $data = null){
		return $this->createRuntimeBatchJob($category, $name1, $name2, $data);
	}
	
	public function requestSchedulerBatchJob($category, $name1=null, $name2=null, $data = null){
		return $this->createSchedulerBatchJob($category, $name1, $name2, $data);
	}	
	
	/**
	 * 
	 * Enter description here ...
	 * @param array $config
	 */
	public function createRuntimeBatchJob($category, $name1=null, $name2=null, $data = null){
		$this->job = $this->jobController->createRuntimeBatchJob($category, $name1, $name2, $data);
		return $this->job;	
	}
	
	public function loadBatchJob($jobId){
		$this->job = $this->jobController->get($jobId);
		return $this->job;
	}
	
	public function approveBatchJob($jobId){
		try{
			$this->job = $this->jobController->get($jobId);
			$this->doApproval();
			
			return $this->job;
		}catch(Exception $e){
			$this->finishError(
				$e->getMessage().' '.
				$e->getFile(). ' '.
				$e->getLine(). ' '.
				$e->getTraceAsString()
			);
			return $this->job;
		}
	}
	
	public function runBatchJob($jobId, $name1=null, $name2=null, $data = null){
		try{
			$this->job = $this->jobController->get($jobId);
			if(!$this->job->__get('job_name1')){
				$this->job->__set('job_name1', $name1);
			}
			if(!$this->job->__get('job_name2')){
				$this->job->__set('job_name2', $name2);
			}
			$this->startBatchJob();
			$data = $this->job->getData();
			$category = $this->job->__get('job_category');
			
			Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' BatchJobManager: run job (data: '.print_r($this->job, true).')');
			
			switch($category){
				case 'DTAEXPORT':
				case 'MONITION':
					$class = $data['class'];
					$method = $data['method'];
					$filters = $data['filters'];
					
					$class::getInstance()->{$method}($this->job);
					return $this->job;
					
					break;
					

			}
			Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' BatchJobManager: no job category found');
			throw new Exception('No BatchJob Category found');
		}catch(Exception $e){
			$this->finishError(
				$e->getMessage().' '.
				$e->getFile(). ' '.
				$e->getLine(). ' '.
				$e->getTraceAsString()
			);
			return $this->job;
		}
	}
	
	public function createSchedulerBatchJob($category, $name1=null, $name2=null, $data = null){
		$this->job = $this->jobController->createSchedulerBatchJob($category, $name1, $name2, $data);
		return $this->job;
	}
	
	public function startBatchJob(){
		$this->job->start();
		$this->job = $this->jobController->update($this->job);
		return $this->job;
	}
	/**
	 * 
	 * Enter description here ...
	 */
	public function doApproval(){
		$this->job->approve($this->currentAccount->getId());
		$this->job = $this->jobController->update($this->job);
		return $this->job;
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $taskCount
	 */
	public function setTaskCount($taskCount){
		$this->job->__set('task_count', $taskCount);
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $tasksPart
	 */
	public function setUpdateInterval($tasksPart){
		$this->updateInterval = $tasksPart;
	}
	
	public function getUpdateInterval(){
		return $this->updateInterval;
	}
	
	public function getTaskCount(){
		return $this->job->__get('task_count');
	}
	
	public function getDoneTaskCount(){
		return $this->job->__get('tasks_done');
	}
	
	public function notifyTaskDone( $tasks = 1 ){
		$this->job->__set('tasks_done', $this->job->__get('tasks_done') + $tasks );
		$this->updatePercentage();
		$this->checkTriggerUpdate();
	}
	
	public function notifyTaskDoneOk( $tasks = 1 ){
		$this->job->__set('tasks_done', $this->job->__get('tasks_done') + $tasks );
		$this->countOk();
		$this->updatePercentage();
		$this->checkTriggerUpdate();
	}
	
	public function notifyTaskDoneError( $tasks = 1 ){
		$this->job->__set('tasks_done', $this->job->__get('tasks_done') + $tasks );
		$this->countError();
		$this->updatePercentage();
		$this->checkTriggerUpdate();
	}
	
	public function notifyTaskSkip( $tasks = 1 ){
		$this->job->__set('tasks_done', $this->job->__get('tasks_done') + $tasks );
		$this->countSkip();
		$this->updatePercentage();
		$this->checkTriggerUpdate();
	}
	
	public function getTaskCalculationPart(){
		return floor($this->getTaskCount()/$this->getUpdateInterval());
	}
	
	public function mustUpdate(){
		if($this->getTaskCalculationPart() == 0){
			return false;
		}
		return $this->getTaskCount % $this->getTaskCalculationPart() == 0;
	}
	
	public function checkTriggerUpdate(){
		if($this->mustUpdate()){
			$this->job = $this->jobController->update($this->job);
		}
	}
	
	public function updatePercentage(){
		$this->job->__set('process_percentage', floor(($this->getDoneTaskCount()/$this->getTaskCount())*100));
	}
		
	public function completeTask( Billing_Api_BatchJob_Interface_Processable $task){
		$task->setBatchJob($this->job);
		if($task->getActionState == 'ERROR'){
			$this->job->setResultError();
			if(!$this->isNonCountAction($task)){
				$this->countError();
			}
		}else{
			$this->job->setResultOk();
			if(!$this->isNonCountAction($task)){
				$this->countOk();
			}
		}
		$this->notifyTaskDone();
		$this->jobController->update($this->job);
	}
	
	public function countOk($count=1){
		$this->job->__set('ok_count', $this->job->__get('ok_count')+$count);
	}
	
	public function countError($count=1){
		$this->job->__set('error_count', $this->job->__get('error_count')+$count);
	}
	
	public function countSkip($count=1){
		$this->job->__set('skip_count', $this->job->__get('skip_count')+$count);
	}
	
	public function finish(){
		$this->job->finish();
		if($this->job->__get('error_count')==0){
			$this->job->setResultOk();
		}else{
			$this->job->setResultError();
		}
		$this->job->__set('process_percentage',100);
		$this->job = $this->jobController->update($this->job);
		//$this->job = null;
	}
	
	public function finishError($errorInfo){
		$this->job->finish();
		$this->job->setResultError();
		$this->job->__set('error_info', $errorInfo);
		$this->job = $this->jobController->update($this->job);
		//$this->job = null;
	}
	public function cancel(){
		
	}
	
	public function updateAddBatchJob($name1 = '', $name2 = ''){
		$this->job->__set('job_name1', $this->job->__get('job_name1') . $name1);
		$this->job->__set('job_name2', $this->job->__get('job_name2') . $name2);
		$this->job = $this->jobController->update($this->job);
	}
	
	public function updateBatchJobFromArray(array $jobData){
		$this->job->setFromArray($jobData);
		$this->job = $this->jobController->update($this->job);
	}
	
	public function jobAddData($key, $value){
		$data = $this->job->getData();
		$data[$key] = $value;
		$this->job->setData($data);
		$this->job = $this->jobController->update($this->job);
	}
	
	public function update(){
		$this->job = $this->jobController->update($this->job);
	}
}