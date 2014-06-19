<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_PaymentDebitReturnCreated extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $payment;
    
    public function __construct($payment)
    {
        $this->payment = $payment;
    }
}


?>