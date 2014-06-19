<?php
/**
 * 
 * Controller Payment
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Payment extends Tinebase_Controller_Record_Abstract
{
    /**
     * config of courses
     *
     * @var Zend_Config
     */
    protected $_config = NULL;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    private function __construct() {
        $this->_applicationName = 'Billing';
        $this->_backend = new Billing_Backend_Payment();
        $this->_modelName = 'Billing_Model_Payment';
        $this->_currentAccount = Tinebase_Core::getUser();
        $this->_purgeRecords = FALSE;
        $this->_doContainerACLChecks = FALSE;
        $this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
    }
    
    private static $_instance = NULL;
    
    /**
     * the singleton pattern
     *
     * @return SoEventManager_Controller_SoEvent
     */
    public static function getInstance()
    {
        if (self::$_instance === NULL) {
            self::$_instance = new self();
        }
        
        return self::$_instance;
    }
    
    /**
     * Get empty record
     * @return Billing_Model_Payment
     */
    public function getEmptyPayment(){
     	$emptyPayment = new Billing_Model_Payment(null,true);
     	return $emptyPayment;
    }
    
    /**
     * inspect create of one record
     * 
     * @param   Tinebase_Record_Interface $_record      the update record
     * @param   Tinebase_Record_Interface $_oldRecord   the current persistent record
     * @return  void
     */
    protected function _inspectCreate($_record, $_oldRecord)
    {
    	$_record->__set('payment_date', new Zend_Date($_record->__get('payment_date')));
    	
    	$order = $_record->getForeignRecordBreakNull('order_id', Billing_Controller_Order::getInstance());
    	
    	if(!$_record->__get('erp_context_id') && $order){
    		$_record->__set('erp_context_id', $order->__get('erp_context_id'));
    	}    	   	
        
    	$this->handleReturnDebit($_record);
    }
    /**
     * (non-PHPdoc)
     * @see Tinebase_Controller_Record_Abstract::_afterCreate()
     */
    protected function _afterCreate($_record){

    	Tinebase_Event::fireEvent(new Billing_Events_PaymentCreated($_record));
    	// only fire event, if there is a bank account to be retrieved from dta job
    	if($_record->hasSetAccountsBankTransfer() && $_record->getBatchJobDta()){
    		Tinebase_Event::fireEvent( Billing_Events_SetAccountsBankTransferDetected::createFromPayment($_record));
    	}
    	
    }
    
    /**
     * inspect update of one record
     * 
     * @param   Tinebase_Record_Interface $_record      the update record
     * @param   Tinebase_Record_Interface $_oldRecord   the current persistent record
     * @return  void
     */
    protected function _inspectUpdate($_record, $_oldRecord)
    {
    
    }
    /**
     * (non-PHPdoc)
     * @see Tinebase_Controller_Record_Abstract::_afterUpdate()
     */
 	protected function _afterUpdate($_oldRecord, $_record){
 		
 		if($_oldRecord->__get('amount') != $_record->__get('amount')){
 			//Tinebase_Event::fireEvent(new Billing_Events_PaymentAmountChanged($_oldRecord, $_record));
 		}
 		
 		if($_oldRecord->getForeignId('donation_id') != $_record->getForeignId('donation_id') ){
 			//Tinebase_Event::fireEvent(new Billing_Events_PaymentDonationDetected($_record));
 		}
 		// only fire event, if there is a bank account to be retrieved from dta job 			
 		if(!$_oldRecord->hasSetAccountsBankTransfer() && $_record->hasSetAccountsBankTransfer() && $_record->getBatchJobDta()){
			Tinebase_Event::fireEvent( Billing_Events_SetAccountsBankTransferDetected::createFromPayment($_record));
		}
 		
    }
    
    protected function handleReturnDebit($record){
    	if($record->__get('is_return_debit')){
    		$record->__set('is_cancellation',true);
    		
    		$basePayment = $record->getForeignRecordBreakNull('return_debit_base_payment_id', $this);
    		if($basePayment){
    			$basePayment->__set('is_cancelled', true);
    			$record->__set('usage', 'Rücklastschrift/STORNO #'.$basePayment->__get('id').' ' . $basePayment->__get('usage'));
    			$basePayment->__set('reversion_record_id', $basePayment->getId());
    			$record->__set('reversion_record_id',$basePayment->getId());
    			$this->update($basePayment);
    		}
    		
    		
    	}
    }
    
    public function getDebitToReturn(
    	$debitorId,
    	$amount,
    	$returnDebitFee = 0,
    	$paymentMethodId = 'DEBIT')
    {
       		    	return $this->_backend->getByPropertySet(array(
            		'debitor_id'  => $debitorId,
            		'amount' => $amount - $returnDebitFee,
            		'payment_method_id' => $paymentMethodId
            	));	
    }

    /**
     * 
     * Reverse a payment
     * @event Billing_Events_PaymentReverted
     * @param integer $paymentId
     */
    public function reversePayment($paymentId){
    	$currentPayment = $this->get($paymentId);
    	$currentPayment->__set('is_cancelled',true);
    	
    	$payment = clone $currentPayment;
    	$payment->__set('id', null);
    	$payment->__set('is_cancellation',true);
    	
    	$payment->swapAccounts();
    	
   		switch($payment->__get('type')){
			case 'CREDIT':
				$payment->__set('type', 'DEBIT');
				break;
			case 'DEBIT':
				$payment->__set('type', 'CREDIT');
				break;
		}
		$payment->__set('payment_date', $currentPayment->__get('payment_date'));
		$payment->__set('usage', 'STORNO #'.$currentPayment->__get('id').' ' . $currentPayment->__get('usage'));
		
		$payment->__set('reversion_record_id', $currentPayment->getId());
		$currentPayment->__set('reversion_record_id', $payment->getId());
		
		$payment =  $this->create($payment);
		$currentPayment = $this->update($currentPayment);
		
		Tinebase_Event::fireEvent(new Billing_Events_PaymentReverted($currentPayment, $payment));
		
		return $payment;
    	
    	//$debitorAccount = Billing_Controller_DebitorAccount::getInstance()->getByPaymentId($paymentId);
    	
    }
    
    public function printReturnInquiry(){
    	Billing_Controller_PrintDebitReturnInquiry::getInstance()->printDocs();
    }
    
/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $_files
	 * @param unknown_type $_options
	 */
	public function importMT940Files($_files, $_options = array()){
	    // extend execution time and close session
        Tinebase_Core::setExecutionLifeTime(7200); // 2 hours
        //Zend_Session::writeClose(true);
        
        // TODO importer is da TD importer
        $importer = null;
        // import files
        $result = array(
            'results'           => array(),
            'totalcount'        => 0,
            'failcount'         => 0,
            'duplicatecount'    => 0,
            'status'            => 'success'
        );
        foreach ($_files as $file) {
            $importResult = Billing_Import_MT940::import($file['path']);
            $result['results']           = array();
            $result['totalcount']       += $importResult['totalcount'];
            $result['failcount']        += $importResult['failcount'];
            $result['duplicatecount']   += $importResult['duplicatecount'];
        }
        
        
        $result['totalcount']      = Billing_Controller_MT940Payment::getInstance()->getCountPayments();
        
        $result['status']= $importResult['status'];
        //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($result, true));
        
        return $importResult;
	}
}
?>