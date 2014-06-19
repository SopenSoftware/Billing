<?php 
/**
 * 
 * Class for exporting
 * 
 * @author hhartl
 *
 */
class Billing_Controller_PrintDebitReturnInquiry extends Tinebase_Controller_Abstract{
	
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;
	private $filters = null;
	private $aFilters = array();

	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_currentAccount = Tinebase_Core::getUser();
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
	
	public function printDocs(){
		// print payments which are debit returns and have flag print inquiry
		$resultData = array();
		
		$filters = array(
			array(
				'field' => 'is_return_debit',
				'operator' => 'equals',
				'value' => '1'
			),
			array(
				'field' => 'print_inquiry',
				'operator' => 'equals',
				'value' => '1'
			),
			array(
				'field' => 'inquiry_print_date',
				'operator' => 'isnull',
				'value' => ''
			)
		
		);
		
		$objFilter = new Billing_Model_PaymentFilter($filters, 'AND');
		
		$paymentIds = Billing_Controller_Payment::getInstance()->search(
			$objFilter,
			null,
			null,
			true
		);
			
		foreach($paymentIds as $paymentId){
			$payment = Billing_Controller_Payment::getInstance()->get($paymentId);
			
			// get base payment
			$basePayment = $payment->getForeignRecordBreakNull('return_debit_base_payment_id', Billing_Controller_Payment::getInstance());
			if($basePayment){
				$batchJobDta = $basePayment->getForeignRecordBreakNull('batch_job_dta_id', Billing_Controller_BatchJobDta::getInstance());
				if($batchJobDta){
					$bankAccount = Billing_Api_BankAccount::getFromBatchJobDta($batchJobDta);
					
					$debitor = $payment->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
					
					$contact = $debitor->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
					
					$data = array();
					$dummyTextBlocks = null;
						
					$data = array_merge($data, Addressbook_Custom_Template::getContactData(
						array(
							'contact' => $contact,
							'user' => Tinebase_Core::get(Tinebase_Core::USER),
							'userContact' => Addressbook_Controller_Contact::getInstance()->getContactByUserId(Tinebase_Core::get(Tinebase_Core::USER)->getId())
						), 
						$dummyTextBlocks
					));
					$data = array_merge(
						$data,
						array(
							'bank_name' => $bankAccount->getBank(),
							'account_name' => $bankAccount->getName(),
							'account_nr' => $bankAccount->getNumber(),
							'bank_code' => $bankAccount->getBankCode()
						)
					);
					$resultData[$contact->__get('n_fileas')] = $data;
					$payment->__set('inquiry_print_date', new Zend_Date());
					Billing_Controller_Payment::getInstance()->update($payment);
					
					
				}
			}
		}
		
		$outputFileName = 'Ruecklastschrift-Nachforschung-'.strftime('%d-%m-%Y %H-%M-%S').'.pdf';
		$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_DEBIT_RETURN_INQUIRY);
		
		ksort($resultData);
		
		Billing_Controller_PrintJobRecordData::getInstance()->export($resultData, $templateId, $outputFileName);
		
	}
		
}
?>