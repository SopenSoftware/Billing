<?php 
/**
 * 
 * OpenItemPayed event
 * @author hhartl
 *
 */
class Billing_Events_SetAccountsBankTransferDetected extends Tinebase_Event_Abstract
{
	/**
	 * 
	 * Payment given by Billing_Controller_Payment
	 * @var Billing_Model_Payment
	 */
    private $payment = null;
    /**
	 * 
	 * Payment given by Billing_Controller_Debitor
	 * @var Billing_Model_Debitor
	 */
    private $debitor = null;
    
    
    public function __construct($payment = null, $debitor = null)
    {
        $this->payment = $payment;
        $this->debitor = $debitor;
    }
    
    public static function createFromDebitor(Billing_Model_Debitor $debitor){
    	return new self(null, $debitor);
    }
    
	public static function createFromPayment(Billing_Model_Payment $payment){
    	return new self($payment, null);
    }
    
    public function getDebitor(){
    	
    	if($this->debitor instanceof Billing_Model_Debitor){
    		return $this->debitor;
    	}
    	
    	if(! $this->payment instanceof Billing_Model_Payment){
    		throw new Exception('Object no instance of Billing_Model_Payment'); 
    	}
    	
    	return $this->payment->getDebitor();
    }
    
    public function getBankAccount(){
    	$basePayment = null;
    	
    	if($this->payment->hasReturnDebitBasePayment()){
    		$basePayment = $this->payment->getReturnDebitBasePayment();
    	}
    	
    	if(!$basePayment){
    		throw new Exception('No base payment found, therefore no bank account detectable');
    	}
    	
    	
    	$batchJobDta = $basePayment->getBatchJobDta();
    	if(!$batchJobDta){
    		throw new Exception('No dta job referenced, therefore no bank account detectable');
    	}
    	return Billing_Api_BankAccount::getFromBatchJobDta($batchJobDta);
    }
}


?>