<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_BillableReceiptBooked extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Receipt
	 */
    public $receipt;
    public $openItem;
    public $booking;
    
    
    public function __construct($receipt, $openItem, $booking)
    {
        $this->receipt = $receipt;
        $this->openItem = $openItem;
        $this->booking = $booking;
    }
}


?>