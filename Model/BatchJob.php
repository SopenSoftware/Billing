<?php

/**
 * class to hold BatchJob data
 *
 * @package     Billing
 */
class Billing_Model_BatchJob extends Tinebase_Record_Abstract
{
	const STATE_TOBEPROCESSED = 'TOBEPROCESSED';
	const STATE_RUNNING = 'RUNNING';
	const STATE_PROCESSED = 'PROCESSED';
	const STATE_ABANDONED = 'ABANDONED';
	const STATE_USERCANCELLED = 'USERCANCELLED';
	
	const CATEGORY_DTAEXPORT = 'DTAEXPORT';
	const CATEGORY_MONITION = 'MONITION';
	const CATEGORY_PAYMENT = 'PAYMENT';
	const CATEGORY_MANUALEXPORT = 'MANUALEXPORT';
	const CATEGORY_PREDEFINEDEXPORT = 'PREDEFINEDEXPORT';
	const CATEGORY_PRINT = 'PRINT';
	
	// new category added: 2012-11-04 -> setup needed as enum set changed
	const CATEGORY_DUETASKS = 'DUETASKS';
	
	const TYPE_SCHEDULER = 'SCHEDULER';
	const TYPE_RUNTIME = 'RUNTIME';
	
	const RESULT_STATE_UNDEFINED = 'UNDEFINED';
	const RESULT_STATE_OK = 'OK';
	const RESULT_STATE_PARTLYERROR = 'PARTLYERROR';
	const RESULT_STATE_ERROR = 'ERROR';
	
	private $totalActionCount = 0;
	
    /**
     * key in $_validators/$_properties array for the filed which
     * represents the identifier
     *
     * @var string
     */
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Billing';
    
    /**
     * list of zend validator
     *
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     *
     */
    protected $_validators = array(
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
       	'account_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_name1'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_name2'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_category'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_data'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_state'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'job_result_state'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'on_error'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'process_info'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'error_info'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'ok_count'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'skip_count'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'error_count'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'create_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'schedule_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'start_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'end_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'process_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'task_count'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'tasks_done'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'modified_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'is_approved'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'approved_by_user'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'approved_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    'create_datetime',
    'schedule_datetime',
    'start_datetime',
    'end_datetime',
    'modified_datetime',
    'approved_datetime'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['create_datetime']) || $_data['create_datetime']=="" || $_data['create_datetime']==0){
			unset($_data['create_datetime']);
		}	
		if(empty($_data['schedule_datetime']) || $_data['schedule_datetime']=="" || $_data['schedule_datetime']==0){
			unset($_data['schedule_datetime']);
		}			
		if(empty($_data['start_datetime']) || $_data['start_datetime']=="" || $_data['start_datetime']==0){
			$_data['start_datetime'] = null;
			unset($_data['start_datetime']);
		}
		if(empty($_data['end_datetime']) || $_data['end_datetime']=="" || $_data['end_datetime']==0){
			$_data['end_datetime'] = null;
			unset($_data['end_datetime']);
		}
		if(empty($_data['approved_datetime']) || $_data['approved_datetime']=="" || $_data['approved_datetime']==0){
			$_data['approved_datetime'] = null;
			unset($_data['approved_datetime']);
		}
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
	if(empty($_data['create_datetime']) || $_data['create_datetime']=="" || $_data['create_datetime']==0){
			unset($_data['create_datetime']);
		}	
		if(empty($_data['schedule_datetime']) || $_data['schedule_datetime']=="" || $_data['schedule_datetime']==0){
			unset($_data['schedule_datetime']);
		}			
		if(empty($_data['start_datetime']) || $_data['start_datetime']=="" || $_data['start_datetime']==0){
			$_data['start_datetime'] = null;
			unset($_data['start_datetime']);
		}
		if(empty($_data['end_datetime']) || $_data['end_datetime']=="" || $_data['end_datetime']==0){
			$_data['end_datetime'] = null;
			unset($_data['end_datetime']);
		}
		if(empty($_data['approved_datetime']) || $_data['approved_datetime']=="" || $_data['approved_datetime']==0){
			$_data['approved_datetime'] = null;
			unset($_data['approved_datetime']);
		}
	}
    
    public static function createRuntimeBatchJob($accountId, $category, $name1 = null, $name2 = null, $data = null){
    	$job = new self();
    	$job->__set('job_name1', $name1);
    	$job->__set('job_name2', $name2);
    	
    	$job->__set('job_category', $category);
    	$job->__set('job_category', $category);
    	$job->__set('account_id', $accountId);
    	$job->__set('job_type', self::TYPE_RUNTIME);
    	$job->setData($data);
    	$job->setDefaultData();
    	return $job;
    }
    
    public static function createSchedulerBatchJob($accountId, $category, $name1 = null, $name2 = null, $data = null){
    	$job = new self();
    	$job->__set('job_name1', $name1);
    	$job->__set('job_name2', $name2);
    	
    	$job->__set('job_category', $category);
    	$job->__set('account_id', $accountId);
    	$job->__set('job_type', self::TYPE_SCHEDULER);
    	$job->setData($data);
    	$job->setDefaultData();
    	return $job;
    }
    
    private function setDefaultData(){
    	$this->__set('create_datetime', new Zend_Date());
    	$this->__set('error_count', 0);
    	$this->__set('ok_count', 0);
    	
    	$this->__set('job_state', self::STATE_TOBEPROCESSED);
    	$this->__set('job_result_state', self::RESULT_STATE_UNDEFINED);
    }
    
    public function approve($accountId){
    	$this->__set('is_approved',1);
    	$this->__set('approved_by_user',$accountId);
    	$this->__set('approved_datetime',new Zend_Date());
    }
    
    public function setData($data = null){
    	if(is_null($data)){
    		$data = array();
    	}
    	$this->__set('job_data', Zend_Json::encode($data));
    }
    
    /**
     * 
     * Enter description here ...
     * @return array
     */
    public function getData(){
    	return Zend_Json::decode($this->__get('job_data'));
    }
    
    public function start(){
    	$this->__set('start_datetime', new Zend_Date());
    	$this->__set('job_state', self::STATE_RUNNING);
    }
    
    public function schedule( Zend_Date $date){
    	$this->_set('schedule_datetime', $date);
    }
    
    public function finish(){
    	$this->__set('end_datetime', new Zend_Date());
    	$this->__set('job_state', self::STATE_PROCESSED);
    }
    
    public function abandon(){
    	$this->__set('job_state', self::STATE_ABANDONED);
    }
    
    public function cancel(){
    	$this->__set('job_state', self::STATE_USERCANCELLED);
    }
    
    public function setResultOk(){
    	$this->__set('job_result_state', self::RESULT_STATE_OK);
    }
    
    public function setResultPartlyError(){
    	$this->__set('job_result_state', self::RESULT_STATE_PARTLYERROR);
    }
    
	public function setResultError(){
    	$this->__set('job_result_state', self::RESULT_STATE_ERROR);
    }
    
    public function setTotalActionCount($total){
    	$this->totalActionCount = $total;
    }
    
    public function getTotalActionCount(){
    	return $this->totalActionCount;
    }
    
    public function getRatio(){
    	if($this->getTotalActionCount()>0){
    		return $this->getCurrentCount()/$this->getTotalActionCount();
    	}
    	return 0;
    }
    
    public function getCurrentCount(){
    	return $this->__get('ok_count') + $this->__get('error_count');
    }
}