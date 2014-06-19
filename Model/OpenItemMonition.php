<?php

/**
 * class to hold OpenItemMonition data
 *
 * @package     Billing
 */
class Billing_Model_OpenItemMonition extends Tinebase_Record_Abstract
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
    	'erp_context_id'        => array(Zend_Filter_Input::ALLOW_EMPTY => true),
       	'monition_receipt_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'open_item_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'debitor_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'due_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'monition_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'open_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'due_days'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_stage'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    'due_date',
	'monition_date'
    );
    
    public static function createFromBatchJobMonitionItem(Billing_Model_Receipt $monitionReceipt, Billing_Model_BatchJobMonitionItem $batchJobMonitionItem){
    	$fromRecord = clone $batchJobMonitionItem;
    	$fromRecord->flatten();
    	$openItem = $fromRecord->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
    	$obj = new self();
    	$obj->__set('erp_context_id', $fromRecord->__get('erp_context_id'));
    	$obj->__set('monition_receipt_id', $monitionReceipt->getId());
    	$obj->__set('open_item_id', $openItem->getId());
    	$obj->__set('debitor_id', $openItem->getForeignId('debitor_id'));
    	$obj->__set('due_date', $openItem->__get('due_date'));
    	$obj->__set('monition_date', new Zend_Date());
    	$obj->__set('open_sum', $fromRecord->__get('open_sum'));
    	$obj->__set('total_sum', $fromRecord->__get('total_sum'));
    	$obj->__set('due_days', $fromRecord->__get('due_days'));
    	$obj->__set('monition_stage', $fromRecord->__get('monition_stage'));
    	return $obj;
    }
    
    public function getMonitionStage(){
    	$monitionStage1Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE1);
		$monitionStage2Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE2);
		$monitionStage3Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE3);
		
		$dueDays = $this->__get('due_days');
		
		if($monitionStage3Days<$dueDays){
			return 3;
		}
    	if($monitionStage2Days<$dueDays){
			return 2;
		}
    	if($monitionStage1Days<$dueDays){
    		return 1;
		}
		return 0;
    }
}