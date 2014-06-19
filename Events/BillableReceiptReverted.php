<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_BillableReceiptReverted extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Receipt
	 */
    public $revertedReceipt;
    public $reversionReceipt;
    
    public function __construct($revertedReceipt, $reversionReceipt)
    {
        $this->revertedReceipt = $revertedReceipt;
        $this->reversionReceipt = $reversionReceipt;
    }
}


?>