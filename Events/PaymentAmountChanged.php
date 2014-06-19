<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_PaymentAmountChanged extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $oldPayment;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $newPayment;
    
    /**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    public $openItem;
    
    public function __construct($oldPayment, $newPayment)
    {
        $this->oldPayment = $oldPayment;
        $this->newPayment = $newPayment;
    }
}


?>