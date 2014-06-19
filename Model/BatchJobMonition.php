<?php

/**
 * class to hold BatchJobMonition data
 *
 * @package     Billing
 */
class Billing_Model_BatchJobMonition extends Tinebase_Record_Abstract implements Billing_Api_BatchJob_Interface_Processable
{
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
      	'job_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'contact_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_receipt_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_stage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'open_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'total_saldation'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'count_pos'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_lock'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'skip'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'action_text'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'action_data'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'action_state'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'error_info'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'valid_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'to_process_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'process_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_by_user'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'processed_by_user'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'n_family'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'org_name'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'adr_one_postalcode'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'adr_one_locality'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'adr_one_street'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'allow_booking'          => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_datetimeFields = array(
    // modlog
    'created_datetime',
    'valid_datetime',
    'to_process_datetime',
    'process_datetime'
    );
    
    public function getTotalSum(){
    	return (float) $this->__get('total_sum');
    }
    
    public function setBatchJob(Billing_Model_BatchJob $job){
    	$this->__set('job_id', $job->getId());
    }
    
    public function getActionState(){
    	return $this->__get('action_state');
    }
    
}