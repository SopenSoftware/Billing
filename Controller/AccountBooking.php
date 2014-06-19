<?php
/**
 * 
 * Controller AccountBooking
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_AccountBooking extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_AccountBooking();
        $this->_modelName = 'Billing_Model_AccountBooking';
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        $this->_doContainerACLChecks = FALSE;
        $this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
    }
    
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return SoEventManager_Controller_SoEvent
     */
    public static function getInstance()
    {
        if (self::$_instance === NULL) {
            self::$_instance = new self();
        }
        
        return self::$_instance;
    }
    
    /**
     * Get empty record
     * @return Billing_Model_AccountBooking
     */
    public function getEmptyAccountBooking(){
     	$emptyAccountBooking = new Billing_Model_AccountBooking(null,true);
     	return $emptyAccountBooking;
    }
    
    public function getByBookingId($bookingId){
    	return $this->_backend->getMultipleByProperty($bookingId, 'booking_id');
    }
    
	protected function _afterUpdate($oldRecord, $newRecord){

		if($oldRecord->__get('booking_date') !== $newRecord->__get('booking_date')){

			$booking = $newRecord->getForeignRecord('booking_id', Billing_Controller_Booking::getInstance());
			$bookingDate = new Zend_Date($booking->__get('booking_date'));
			$abookingDate = new Zend_Date($newRecord->__get('booking_date'));
			
			if(!$bookingDate->equals($abookingDate)){
				
				$booking->__set('booking_date', $newRecord->__get('booking_date'));
				Billing_Controller_Booking::getInstance()->update($booking);
			}
		}
	}
    
    public function multiCreateAccountBookings($bookingId, $data){
    	if(!is_array($data)){
    		$data = Zend_Json::decode($data);
    	}
    	
    	$booking = Billing_Controller_Booking::getInstance()->get($bookingId);
    	$credits = $data['credits'];
    	$debits = $data['debits'];

    	$val = $val2 = 0;
    	foreach($credits as $credit){
    		$cval = (float)$credit['value'];
    		if($credit['kto'] && $credit['value']!=0){
	    		$accountBooking = $this->getEmptyAccountBooking();
	    		$accountBooking->__set('account_system_id', $credit['kto']);
    			if(array_key_exists('debitor', $credit) && $credit['debitor']){
	    			$accountBooking->__set('debitor_id', $credit['debitor']);
	    		}
	    		$accountBooking->__set('booking_id', $bookingId);
	    		$accountBooking->__set('value', (float)$credit['value']);
	    		$accountBooking->__set('booking_date', $booking->__get('booking_date'));
	    		$accountBooking->__set('type', 'CREDIT');
	    		$this->create($accountBooking);
	    		$val += $cval;	
    		}
    		
    	}
    	
    	foreach($debits as $debit){
    		$dVal = (float)$credit['value'];
    		if($debit['kto'] && $debit['value']!=0){
	    		$accountBooking = $this->getEmptyAccountBooking();
	    		$accountBooking->__set('account_system_id', $debit['kto']);
	    		if(array_key_exists('debitor', $debit) && $debit['debitor']){
	    			$accountBooking->__set('debitor_id', $debit['debitor']);
	    		}
	    		$accountBooking->__set('booking_id', $bookingId);
	    		$accountBooking->__set('value', (float)$debit['value']);
	    		$accountBooking->__set('booking_date', $booking->__get('booking_date'));
	    		$accountBooking->__set('type', 'DEBIT');
	    		$this->create($accountBooking);
	    	}
	    	
	    	$val2 += $dVal;
    	}
    	if($val>0){
    		
    		$add = $booking->__get('value');
    		$booking->__set('value',$val + (float)$add);
    		Billing_Controller_Booking::getInstance()->update($booking);
    		
    	}
    	
    }
    
	protected function _inspectCreate($_record)
    {
    	switch($_record->__get('type')){
    		case 'DEBIT':
    			
    			$_record->__set('debit_value', $_record->__get('value'));
    			break;
    		case 'CREDIT':
    			
    			$_record->__set('credit_value', $_record->__get('value'));
    			break;
    	}
		
    }
    
	protected function _inspectUpdate($_record)
    {
    	switch($_record->__get('type')){
    		case 'DEBIT':
    			
    			$_record->__set('debit_value', $_record->__get('value'));
				$_record->__set('credit_value', 0);
    						
    			break;
    		case 'CREDIT':
    			$_record->__set('debit_value', 0);
    			$_record->__set('credit_value', $_record->__get('value'));
    			break;
    	}
    }
    
	protected function _afterDelete(array $_ids) {
        return $_ids;
    }
    
    public function getInvalidBookingIds(){
    	return $this->_backend->getInvalidBookingIds();
    }
    
	public function getAccountBookingsByType($bookingId, $accountBookingType){
		return $this->_backend->getByPropertySet(array('booking_id' => $bookingId, 'type' => $accountBookingType), false, false);
	}
   
}
?>