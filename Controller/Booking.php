<?php
/**
 *
 * Controller Booking
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Booking extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_Booking();
		$this->_modelName = 'Billing_Model_Booking';
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
	 * @return Billing_Model_Booking
	 */
	public function getEmptyBooking(){
		$emptyBooking = new Billing_Model_Booking(null,true);
		return $emptyBooking;
	}

	protected function _inspectCreate($_record)
	{
		if(!$_record->__get('booking_nr')){
			$_record->__set('booking_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('booking_nr'));
		}
		$receipt = $_record->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
		$order = $_record->getForeignRecordBreakNull('order_id', Billing_Controller_Order::getInstance());
		if($order){
			$_record->__set('erp_context_id', $order->__get('erp_context_id'));
		}
		
		if($_record->__get('booking_date')){
			if(!$_record->__get('booking_receipt_date')){
				$_record->__set('booking_receipt_date', $_record->__get('booking_date'));
			}
		}

	}
	
	protected function _inspectUpdate($_record)
	{
		if($_record->__get('booking_date')){
			if(!$_record->__get('booking_receipt_date')){
				$_record->__set('booking_receipt_date', $_record->__get('booking_date'));
			}
		}
	}
	
	protected function _afterUpdate($oldRecord, $newRecord){
		if($oldRecord->__get('booking_date') !=  $newRecord->__get('booking_date')){
			$newRecord->updateAccountBookings();
		}
	}

	public function onBillableReceiptCreated($receipt){

		$booking = $this->bookBillableReceipt($receipt);
		$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($receipt->getId());

		Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptBooked($receipt, $openItem, $booking));
		return $booking;
	}
	 
	public function renewBookingForBillableReceipt($receiptId){

		
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		// start transaction
		$tId = $tm->startTransaction($db);
		
		$receipt = Billing_Controller_Receipt::getInstance()->get($receiptId);
		$booking = $receipt->getForeignRecordBreakNull('booking_id', Billing_Controller_Booking::getInstance());
		
		try{
			if($booking){

				$booking->cleanup();
				
				$booking->__set('booking_date', $receipt->getBillableReceiptDate());
				$booking->__set('booking_text', $receipt->getBookingText());
				$booking->__set('erp_context_id', $receipt->__get('erp_context_id'));
				$booking->__set('booking_receipt_nr', $receipt->getBookingReceiptNumber());
				$booking->__set('receipt_unique_nr', $receipt->getBookingReceiptNumber());
				$booking->__set('receipt_id', $receipt->getId());
		
				$booking->__set('is_cancelled', $receipt->__get('is_cancelled'));
				$booking->__set('is_cancellation', $receipt->__get('is_cancellation'));
		
				$value = abs($receipt->__get('total_brutto'));
		
				$fordKto = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DEBITOR);
		
				$bookingData = $receipt->getBookingData($fordKto);
		
				if($receipt->isDonation()){
					$booking->__set('donation_id', $receipt->getForeignId('donation_id'));
				}
				// reset value: otherwise values would get added and added on each correction
				$booking->__set('value',0);
				$booking = Billing_Controller_Booking::getInstance()->update($booking);
				Billing_Controller_AccountBooking::getInstance()->multiCreateAccountBookings($booking->getId(), $bookingData);
				
				
			
			}else{
				
				// otherwise do booking:
				$booking = $this->onBillableReceiptCreated($receipt);
				
				/*return array(
						'state' => 'failure',
						'result' => null,
						'userMessage' => 'Es konnte keine Buchung zur Erneuerung gefunden werden',
						'errorInfo' => array()
				);*/
			}
			
			$tm->commitTransaction($tId);
			
			return array(
				'state' => 'success',
				'result' => array('bookingId' => $booking->getId())
			);
		}catch(Exception $e){
			
			$tm->rollBack($tId);
			
			return array(
				'state' => 'failure',
				'result' => null,
				'userMessage' => 'Der Vorgang konnte nicht durchgeführt werden',
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
				)
			);
		}
		
	}
	 
	public function bookBillableReceipt($receipt, $renew = false){

		$receipt = Billing_Controller_Receipt::getInstance()->get($receipt->getId());

		$booking = new Billing_Model_Booking(null, true);

		$booking->__set('booking_date', $receipt->getBillableReceiptDate());
		$booking->__set('booking_text', $receipt->getBookingText());
		$booking->__set('erp_context_id', $receipt->__get('erp_context_id'));
		$booking->__set('booking_receipt_nr', $receipt->getBookingReceiptNumber());
		$booking->__set('receipt_unique_nr', $receipt->getBookingReceiptNumber());
		$booking->__set('receipt_id', $receipt->getId());

		$booking->__set('is_cancelled', $receipt->__get('is_cancelled'));
		$booking->__set('is_cancellation', $receipt->__get('is_cancellation'));

		$value = abs($receipt->__get('total_brutto'));

		$fordKto = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DEBITOR);

		$bookingData = $receipt->getBookingData($fordKto);

		if($receipt->isDonation()){
			$booking->__set('donation_id', $receipt->getForeignId('donation_id'));
		}
		$booking = Billing_Controller_Booking::getInstance()->create($booking);
		Billing_Controller_AccountBooking::getInstance()->multiCreateAccountBookings($booking->getId(), $bookingData);
		return $booking;

	}
	 
	public function onBillableReceiptReverted($revertedReceipt, $reversionReceipt){


	}

	
	protected function _inspectDelete(array $_ids) {
        $delIds = array();
		foreach($_ids as $bId){
			$abookings = Billing_Controller_AccountBooking::getInstance()->getByBookingId($bId);
			foreach($abookings as $abooking){
				$delIds[] = $abooking->getId();
			}
		}
		if(count($delIds)>0){
			Billing_Controller_AccountBooking::getInstance()->delete($delIds);
		}
		return $_ids;
    }
	 
	public function onPaymentCreated($payment){
		if(!$payment->isBookingAllowed()){
			return;
		}
		$cKto = $payment->getForeignId('account_system_id_haben');
		$dKto = $payment->getForeignId('account_system_id');
		// multi create bookings
		if($dKto && $cKto){
			$booking = new Billing_Model_Booking(null, true);
			$booking->__set('booking_date', new Zend_Date($payment->__get('payment_date')));
			$booking->__set('booking_text', $payment->__get('usage'));
			$booking->__set('erp_context_id', $payment->__get('erp_context_id'));
			$booking->__set('receipt_unique_nr', ' ');
			$booking->__set('receipt_id', $payment->getForeignId('receipt_id'));
				
			$booking->__set('donation_id', $payment->getForeignId('donation_id'));
				
			$booking->__set('is_cancelled', $payment->__get('is_cancelled'));
			$booking->__set('is_cancellation', $payment->__get('is_cancellation'));
				
				
			$value = abs($payment->__get('amount'));
			$creditValue = $value;
			$debitValue = $value;
				
			$credits = array(
			array( 'kto' => $cKto, 'value' => $value, 'debitor' => $payment->getForeignIdBreakNull('debitor_id'))
			);

			if($payment->__get('is_return_debit')){
				$debitReturnFee = abs($payment->__get('return_inquiry_fee'));
				$debitReturnFeeAccount = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DTA_RETURN_FEE);
				$debitValue -= $debitReturnFee;
				$debits = array(
				array( 'kto' => $dKto, 'value' => $debitValue, 'debitor' => $payment->getForeignIdBreakNull('debitor_id'))
				);
				$debits[] = array( 'kto' => $debitReturnFeeAccount,  'value' => $debitReturnFee, 'debitor' => $payment->getForeignIdBreakNull('debitor_id'));
			}else{
				$debits = array(
				array( 'kto' => $dKto, 'value' => $value, 'debitor' => $payment->getForeignIdBreakNull('debitor_id'))
				);
			}
				
				
			$data = array(
				'credits' => $credits,
				'debits' => $debits
			);
				
			$booking = Billing_Controller_Booking::getInstance()->create($booking);
			Billing_Controller_AccountBooking::getInstance()->multiCreateAccountBookings($booking->getId(), $data);
			Tinebase_Event::fireEvent(new Billing_Events_PaymentBooked($payment, $booking));
		}
	}

	public function reverseBooking($bookingId){
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		// start transaction
		$tId = $tm->startTransaction($db);

		try{

			$booking = $this->get($bookingId);
			$booking->flatten();
			$aBooking = $booking->toArray();
			unset ($aBooking['id']);
			unset ($aBooking['booking_nr']);
				
			$newBooking = $this->getEmptyBooking();
			$newBooking->setFromArray($aBooking);
			$newBooking->__set('booking_text','STORNO # '.$booking->__get('booking_nr').' '.$booking->__get('booking_text'));
			$newBooking->__set('booking_receipt_nr',$booking->__get('booking_receipt_nr'). ' STORNO');
				
			$newBooking = $this->create($newBooking);
				
			$accountBookings = Billing_Controller_AccountBooking::getInstance()->getByBookingId($booking->getId());
			foreach( $accountBookings as $accountBooking ){
				$accountBooking->flatten();
				$aAccountBooking = $accountBooking->toArray();
				unset($aAccountBooking['id']);
				$newAccountBooking = Billing_Controller_AccountBooking::getInstance()->getEmptyAccountBooking();
				$newAccountBooking->setFromArray($aAccountBooking);
				$type = $accountBooking->__get('type');
				$newAccountBooking->__set('booking_id', $newBooking->getId());
				switch($type){
					case 'DEBIT':
						$newAccountBooking->__set('type', 'CREDIT');
						$newAccountBooking->__set('credit_value',$newAccountBooking->__get('debit_value'));
						$newAccountBooking->__set('debit_value',0);

						break;
					case 'CREDIT':
						$newAccountBooking->__set('type', 'DEBIT');
						$newAccountBooking->__set('debit_value',$newAccountBooking->__get('credit_value'));
						$newAccountBooking->__set('credit_value',0);

						break;
				}
				Billing_Controller_AccountBooking::getInstance()->create($newAccountBooking);
			}
				
			$tm->commitTransaction($tId);
			return $newBooking;
		}catch(Exception $e){
			echo $e->__toString();
			$tm->rollback($tId);
		}

	}

	public function improveBookingsValid(){

		set_time_limit(0);
		try{

			$aInvalidBookingIds = Billing_Controller_AccountBooking::getInstance()->getInvalidBookingIds();
				
			if(count($aInvalidBookingIds)>0){
				foreach($aInvalidBookingIds as $bookingId){
					$booking = $this->get($bookingId);
					$booking->__set('valid',0);
					$this->update($booking);
				}
			}
				

			return array(
				'state' => 'success',
				'result' => array(
					'count' => count($aInvalidBookingIds)
			)
			);

		}catch(Exception $e){

			return array(
				'state' => 'failure',
				'result' => null,
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
			)
			);
		}
	}
	
}
?>