<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_BillableReceiptCreated extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Receipt
	 */
    public $receipt;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $openItem;
    
    public function __construct($receipt)
    {
        $this->receipt = $receipt;
    }
}


?>