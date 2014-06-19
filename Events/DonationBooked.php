<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_DonationBooked extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $donation;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Booking
	 */
    public $booking;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $openItem;
    
    public function __construct($donation, $booking)
    {
        $this->donation = $donation;
        $this->booking = $booking;
    }
}


?>