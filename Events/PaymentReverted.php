<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_PaymentReverted extends Tinebase_Event_Abstract
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
	 * @var Billing_Model_Payment
	 */
    public $reversePayment;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $openItem;
    
    public function __construct($payment, $reversePayment)
    {
        $this->payment = $payment;
        $this->reversePayment = $reversePayment;
    }
}


?>