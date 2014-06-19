<?php

/**
 * class to hold OpenItem data
 *
 * @package     Billing
 */
class Billing_Model_OpenItem extends Tinebase_Record_Abstract
{
	public static $convertState = array(
    	'DONE' => 'PAYED',
    	'PARTLYOPEN' => 'PARTLYPAYED',
    	'OPEN' => 'TOBEPAYED',
    );
    
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
        'order_id'              => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'op_nr'					=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'receipt_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'monition_receipt_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'debitor_id'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	// optional reference to payment
    	'payment_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
		
    	'payment_method_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'receipt_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'receipt_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'due_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'fibu_exp_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_netto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'total_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'open_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payed_sum'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// context: application context for further, app specific filtering
    	'context'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'banking_exp_date'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'state'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'usage'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	'booking_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'donation_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'reversion_record_id'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_cancelled'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_cancellation'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'payment_date'                => array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_member'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'period'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'due_days' =>  array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'fee_group_id'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'monition_stage'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'last_monition_date'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true)
    
    );
    protected $_dateFields = array(
    // modlog
    'receipt_date',
	'payment_date',
    //'due_date',
    'fibu_exp_date',
    'banking_exp_date',
    'last_monition_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['fibu_exp_date']) || $_data['fibu_exp_date']==""){
			unset($_data['fibu_exp_date']);
		}
		
			if(empty($_data['banking_exp_date']) || $_data['banking_exp_date']==""){
			unset($_data['banking_exp_date']);
		}

		
		if(empty($_data['last_monition_date']) || $_data['last_monition_date']==""){
			unset($_data['last_monition_date']);
		}
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
		if(empty($_data['fibu_exp_date']) || $_data['fibu_exp_date']==""){
			unset($_data['fibu_exp_date']);
		}
		
			if(empty($_data['banking_exp_date']) || $_data['banking_exp_date']==""){
			unset($_data['banking_exp_date']);
		}
		
		if(empty($_data['last_monition_date']) || $_data['last_monition_date']==""){
			unset($_data['last_monition_date']);
		}
	}
	
	public function pay($payment){
		$totalBrutto = $this->__get('open_sum');
        if($payment->__get('amount') == $totalBrutto){
        	$this->__set('payment_state', 'PAYED');
        	$this->__set('open_sum', 0);
        	$this->__set('payed_sum', $totalBrutto);
        }elseif($payment->__get('amount') == 0){
        	$this->__set('payment_state', 'TOBEPAYED');
        }elseif($payment->__get('amount') < $totalBrutto){
        	$this->__set('payment_state', 'PARTLYPAYED');
        	$this->__set('open_sum', $totalBrutto-($payment->__get('amount')));
        	$this->__set('payed_sum', $payment->__get('amount'));
        }
        Billing_Controller_OpenItem::getInstance()->update($this);
        Tinebase_Event::fireEvent(new Billing_Events_OpenItemPayed($payment, $this));
        
	}
	
	public function getDonation(){
    	try{
    		if(!class_exists('Donator_Model_Donation') || !$this->__get('donation_id')){
    			return null;
    		}
    		return $this->getForeignRecordBreakNull('donation_id', Donator_Controller_Donation::getInstance());
    	}catch(Exception $e){
    		return null;
    	}
    }
    
    public function getCurrentMonitionStage(){
    	return (int) $this->__get('monition_stage');
    }
    
    public function manifestNextMonitionStage(){
    	$this->__set('monition_stage', (string) $this->getNextMonitionStage());
    }
    
    public function getNextMonitionStage(){
    	$monitionStage1Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE1);
		$monitionStage2Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE2);
		$monitionStage3Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE3);
		
		$dueDays = (int) $this->__get('due_days');
		$monitionStage = ($this->__get('monition_stage')?(int)$this->__get('monition_stage'):0);
		
		if($monitionStage3Days<$dueDays){
			return min($monitionStage+1,3);
		}
    	if($monitionStage2Days<$dueDays){
			return min($monitionStage+1,2);
		}
    	if($monitionStage1Days<$dueDays){
    		return min($monitionStage+1,1);
		}
		return 0;
    }
    
    public function getReceipt(){
    	return $this->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
    }
}