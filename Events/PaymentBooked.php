<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_PaymentBooked extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $payment;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Booking
	 */
    public $booking;
    
    public function __construct($payment, $booking)
    {
        $this->payment = $payment;
        $this->booking = $booking;
    }
}


?>