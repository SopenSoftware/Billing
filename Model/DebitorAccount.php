<?php

/**
 * class to hold DebitorAccount data
 *
 * @package     Billing
 */
class Billing_Model_DebitorAccount extends Tinebase_Record_Abstract
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
//    	'order_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
//	    'op_nr'						=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'receipt_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'debitor_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
//	    'receipt_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
//	    'receipt_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'item_type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'usage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'create_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'value_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    's_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'h_brutto'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'payment_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),

    	'booking_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    
    	// @todo: integrate erp_context_id for app/context filtering
    	// context: application context for further, app specific filtering
    	'erp_context_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// the source object generating this entry: e.g. donation record or further from other apps
    	'object_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'donation_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	
    	'reversion_record_id'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'is_cancelled'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
		'is_cancellation'	=> array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'created_datetime'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
    // modlog
    'create_date',
    'value_date'
    );
    
    protected $_dateTimeFields = array(
    	'created_datetime'
    );
    
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
}