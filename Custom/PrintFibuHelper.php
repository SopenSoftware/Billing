<?php 
class Billing_Custom_PrintFibuHelper{
	public static function accountBookingsToExternalArray(array $ids, &$debSum, &$credSum){
		$result = array();
		
		foreach($ids as $id){
			$ab = Billing_Controller_AccountBooking::getInstance()->get($id);
			$result[] = self::accountBookingToExternalArray($ab, &$debSum, &$credSum);
		}
		
		return $result;
	}
	
	public static function accountBookingToExternalArray(Billing_Model_AccountBooking $accountBooking, &$debSum, &$credSum){
		
		$booking = $accountBooking->getForeignRecord('booking_id', Billing_Controller_Booking::getInstance());
		//$accountSystem = $accountSystem->getForeignRecord('account_system_id', Billing_Controller_Booking::getInstance());
		$debitorNr = '';
		$debitor = $accountBooking->getForeignRecordBreakNull('debitor_id', Billing_Controller_Debitor::getInstance());
		if($debitor){
			$debitorNr = $debitor->__get('debitor_nr');
		}
		
		$contraBookings = $accountBooking->getContraBookings();

		$aContraText = array();
		
		foreach($contraBookings as $contraBooking){
			$accountSystem = $contraBooking->getForeignRecord('account_system_id', Billing_Controller_AccountSystem::getInstance());
			$accountSystemNr = $accountSystem->__get('number') . ' (' . number_format($contraBooking->__get('value'),2,',','.') . ') ';
			$aContraText[] = $accountSystemNr;
		}
		
		$strContraText = implode(',',$aContraText);
		
		$debSum += ($accountBooking->__get('debit_value')?$accountBooking->__get('debit_value'):0);
		$credSum += (float)($accountBooking->__get('credit_value')?$accountBooking->__get('credit_value'):0);
		$bDate = new Zend_Date($accountBooking->__get('booking_date'));
		
		$result = array(
			'bnr' => $booking->__get('booking_nr'),
			'receipt_nr' => $booking->__get('booking_receipt_nr'),
			'usage' => $booking->__get('booking_text'),
			'debitor_nr' => $debitorNr,
			'contra_account' => $strContraText,
			'date' => $bDate->toString('dd.MM.yyyy'),
			'deb_value' => $accountBooking->__get('debit_value'),
			'deb_value_f' => ($accountBooking->__get('debit_value')!=0?number_format($accountBooking->__get('debit_value'),2,',','.'):''),
			'cred_value' => $accountBooking->__get('credit_value'),
			'cred_value_f' =>($accountBooking->__get('credit_value')!=0?number_format($accountBooking->__get('credit_value'),2,',','.'):'')
		);
		
		return $result;
	}
}
