<?php
class Billing_Controller_BatchJobDta extends Tinebase_Controller_Record_Abstract
{

	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;

	protected $bunchCreate = false;

	protected $collection = null;

	protected $ommitTracks = false;

	protected $sepaProcessing = false;
	
	protected $sepaFiles = array();
	
	protected $paymentSum = 0;
	
	protected $countTransactions = 0;
	
	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_backend = new Billing_Backend_BatchJobDta();
		$this->_modelName = 'Billing_Model_BatchJobDta';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_config = isset(Tinebase_Core::getConfig()->somembers) ? Tinebase_Core::getConfig()->somembers : new Zend_Config(array());

		$this->initCollection();
	}

	private static $_instance = NULL;

	/**
	 * the singleton pattern
	 *
	 * @return SoBilling_Controller_SoEvent
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new self();
			
			require_once ('worg/wsf/ClassLoader.php');
			WsfClassLoader::init(CSopen::instance()->getLibPath().'wsflib/',"");
			libxml_use_internal_errors(false);
			
		}

		return self::$_instance;
	}

	public function setOmmitTracks(){
		$this->ommitTracks = true;
		return $this;
	}

	public function unsetOmmitTracks(){
		$this->ommitTracks = false;
		return $this;
	}

	public function cleanupJob($jobId){
		
		$filters = array();
		
		$filters[] = array(
    		'field' => 'job_id',
    		'operator' => 'equals',
    		'value' => $jobId
		);

		$filter = new Billing_Model_BatchJobDtaFilter($filters, 'AND');

		// count membership matching filters
		$batchJobDtaIds =  $this->search(
			$filter,
			new Tinebase_Model_Pagination(array('sort' => 'id', 'dir' => 'ASC')),
			false,
			true
		);
		
		$this->_delete($batchJobDtaIds);
		
	}
	
	protected function _inspectDelete($_ids){
		foreach($_ids as $id){
			$items = Billing_Controller_BatchJobDtaItem::getInstance()->getByBatchJobDtaId($id);
			foreach($items as $item){
				 Billing_Controller_BatchJobDtaItem::getInstance()->delete((array) $item->getId());
			}
		}
	}
	
	public function printDtaExportPrepare($jobId, $filteredList, $filteredListData, $dtaProtocol = false, array $batchJobDtaIds = null){
		set_time_limit(0);
		ignore_user_abort(true);
		
		error_reporting(E_ALL);
		try{
			$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
			Billing_Api_BatchJobManager::getInstance()->startBatchJob();
			
			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();

			$tId = $tm->startTransaction($db);

			$data = $job->getData();

			$pagination = new Tinebase_Model_Pagination();

			//require_once 'Payment/DTA.php';

			$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';

			if($dtaProtocol){
				$outputFileName = $tempFilePath . 'Protokoll-SEPA-'.$job->getId().'.pdf';
			}else{
				// get all open items (for debit)
				// grouped by debitors
				$filters[] = array(
		    		'field' => 'job_id',
		    		'operator' => 'equals',
		    		'value' => $job->getId()
				);
	
				$sort = array('sort' => 'n_family', 'dir' => 'ASC');
				
				if($filteredList){
					if(!is_array($filteredListData)){
						$filteredListData = Zend_Json::decode($filteredListData);
					}
					
					$additionalFilters = $filteredListData['filter'];
					
					if(count($additionalFilters)>0){
						$filters = array_merge($filters, $additionalFilters);
					}	
					
					$sort = array('sort' => $filteredListData['sort']['field'], 'dir' => $filteredListData['sort']['direction']);
				}
				
				$filter = new Billing_Model_BatchJobDtaFilter($filters, 'AND');
	
				// count membership matching filters
				$batchJobDtaIds =  $this->search(
					$filter,
					new Tinebase_Model_Pagination($sort),
					false,
					true
				);
			
				$outputFileName = $tempFilePath . 'Vorbereitungsliste-'.$job->getId().'.pdf';				
			}
			
			$contexts = array(
				'MEMBERSHIP' => 'Beitrag',
				'DONATOR' => 'Spende',
				'ERP' => 'allg.'
			);
			
			$data = array();
			$total = 0;
			$count = 0; //count($batchJobDtaIds);
			$subSums = array();
			
			foreach($batchJobDtaIds as $batchJobDataId){
				$batchJobData = $this->get($batchJobDataId);
				
				// keep out item which are diffed
				//if(!$filteredList &&($batchJobData->__get('bank_valid')!='YES' || abs((float)$batchJobData->__get('diff_saldation'))>0.005)|| abs((float)$batchJobData->__get('total_sum')==0)){
				if(!$filteredList &&($batchJobData->__get('bank_valid')!='YES' ||  abs((float)$batchJobData->__get('total_sum')==0))){	
				continue;
				}
				$count++;
				
				$batchJobDataItems = Billing_Controller_BatchJobDtaItem::getInstance()->getByBatchJobDtaId($batchJobData->getId());
				$contact = $batchJobData->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
				//$bankAccount = Billing_Api_BankAccount::getFromBatchJobDta($batchJobData);
$bankAccount = $batchJobData->getForeignRecordBreakNull('bank_account_id', Billing_Controller_BankAccount::getInstance());
				$strOP = '';
				if(!$bankAccount){
					continue;
				}
				foreach($batchJobDataItems as $item){
				
					// Kontext / Fällig am / Beleg / Betrag
					$openItem = $item->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
					
					$receipt = $openItem->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
					
					$paymentMethod = $receipt->getForeignRecordBreakNull('payment_method_id', Billing_Controller_PaymentMethod::getInstance());
					if(!$paymentMethod){
						$paymentMethodId = 'NOVALUE';
						$strPaymentMethod = '...keine Auswahl...';
					}else{
						$paymentMethodId = $paymentMethod->getId();
						$strPaymentMethod = $paymentMethod->__get('name');
					}
					/*if($openItem->__get('state') != 'OPEN'){
								
						// tried to include open item which was already done!!!
						// break the job
						$this->cleanupJob($jobId);
						
						// break job!
						throw new Billing_Exception_OpenItem('Open item '.$openItem->__get('op_nr').' is already finished.');
					}*/
					
					
					$receiptNr = $receipt->__get('invoice_nr');
					
					if($receipt->getAdditionalItem('MNR')){
						$receiptNr = $receipt->getAdditionalItem('MNR');
					}
					
					$dueDate = $receipt->__get('due_date');
					$erpContext = $contexts[$receipt->__get('erp_context_id')];
					$sum = $item->__get('total_sum');
					$context = $receipt->__get('erp_context_id');
					$strOP .=
					$erpContext. "<text:tab/><text:tab/>".
					\org\sopen\app\util\format\Date::format($dueDate)."<text:tab/><text:tab/>".
					$receiptNr."<text:tab/><text:tab/>".
					number_format($sum,2,',','.')."<text:line-break/>";
					
					if(!array_key_exists($context, $subSums)){
						$subSums[$context] =array(
							'context' => $erpContext,
							'method' => $strPaymentMethod,
							'count' => 0,
							'sum' => 0
						);
					}
					
					
					$subSums[$context]['sum'] += $sum;
					$subSums[$context]['count']++;
					
				}
				
				$usage = array();
	        	$contactNr = $batchJobData->getForeignId('contact_id');
		        $usage[] = 'Adr.Nr '.$contactNr;
				$this->extractUsageFromDtaItems( $batchJobDataItems, $usage, $contexts);
				
				$strUsage = implode('<text:line-break/>',$usage);
				
				$arr = array(
					'YES' => 1,
					'NO' => 0,
					'UNKNOWN' => 0
				);
				$sepaDate = null;
				if($batchJobData->__get('sepa_signature_date')){
					$sepaDate = \org\sopen\app\util\format\Date::format($batchJobData->__get('sepa_signature_date'));
				}
				
				/*
				 ##MNR##
				 ##LASTNAME##
				 ##FORENAME##
				 ##BANKVALID##
				 ##ACC##
				 ##BCODE##
				 ##HOLDER##
				 ##BANK##
				 ##OPENITEMS##
				 ##AMOUNT##

				 */
				$data[] = array(
    			'MNR' => $contact->getId(),
    			'FORENAME' => $contact->__get('n_given'),
    			'LASTNAME' => $contact->__get('n_family'),
				'FORENAME_PARTNER' => $contact->__get('partner_forename'),
    			'LASTNAME_PARTNER' => $contact->__get('partner_lastname'),
    			'COMPANY' => $contact->__get('org_name') . ($contact->__get('company2')?' ' . $contact->__get('company2'):''),
    			'BANKVALID' => $arr[$batchJobData->__get('bank_valid')],
    			'SEPA' => $sepaDate,
				'IBAN' => \worg\wsf\util\format\IBAN::formatQuadruple($bankAccount->getIBAN()),
				'BIC' => $bankAccount->getBIC(),
    			'ACC' => $bankAccount->getNumber(),
    			'BCODE' => $bankAccount->getBankCode(),
    			'HOLDER' => $bankAccount->getName(),
    			'BANK' => $bankAccount->getBank(),
				'USAGE' => $strUsage,
    			'OPENITEMS' => $strOP,
				'DIFF' => number_format($batchJobData->__get('diff_saldation'),2,',','.'),
				'SALDO' => number_format($batchJobData->__get('total_saldation'),2,',','.'),
    			'AMOUNT' => number_format($batchJobData->__get('total_sum'),2,',','.')
				);
				$total += $batchJobData->__get('total_sum');
			}

			$dynTable = array();
				
			foreach($subSums as $context => $subItem){
					$dynTable[] = array(
						'headers' => array(),
						'rows' => array(array(
						'text' => $subItem['context'],
						'dcount' => $subItem['count'],
						'dsum' => number_format($subItem['sum'],2,',','.')
						))
					);
			}
			
			$fullData = array(array(
				'REPEATABLE_DYN_TABLE' => $dynTable,
    			'POS_TABLE' => $data,
    			'total' => number_format($total,2,',','.'),
    			'count' => $count
			));

			$outputFileName = $tempFilePath . md5(serialize($job).'preparePDF'.microtime()).'.pdf';
			$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_DTA_DEBIT_PREPARE);

			Billing_Controller_PrintJobRecordData::getInstance()->export(
				$fullData,
				$templateId,
    			'Vorbereitungsliste-'.$job->getId().'.pdf', 
				true,
				$outputFileName
			);

			if(!$dtaProtocol){
				if(!$filteredList){
					Billing_Api_BatchJobManager::getInstance()->jobAddData('preparePDF', $outputFileName);
					Billing_Api_BatchJobManager::getInstance()->jobAddData('preparePDFDownloadFilename',  'Vorbereitungsliste-'.$job->getId().'.pdf');
				}else{
					Billing_Api_BatchJobManager::getInstance()->jobAddData('filteredPreparePDF', $outputFileName);
					Billing_Api_BatchJobManager::getInstance()->jobAddData('filteredPreparePDFDownloadFilename',  'Gefilterte-Vorbereitungsliste-'.$job->getId().'.pdf');
				}
			}else{
				Billing_Api_BatchJobManager::getInstance()->jobAddData('protocolPDF', $outputFileName);
				Billing_Api_BatchJobManager::getInstance()->jobAddData('protocolPDFDownloadFilename',  'Protokoll-SEPA-'.$job->getId().'.pdf');
			}
			

			$tm->commitTransaction($tId);

			Billing_Api_BatchJobManager::getInstance()->finish();
			
			return array(
				'state' => 'success',
				'result' => null	
			);

		}catch(Exception $e){
			echo $e->__toString();
			$tm->rollback($tId);
			Billing_Api_BatchJobManager::getInstance()->finishError($e->__toString());
			return array(
				'state' => 'failure',
				'result' => null,
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
			)
			);
		}
	}

	public function downloadPreparePDF($jobId, $filteredList = false){
		
		if(is_string($filteredList)){
			$filteredList = Zend_Json::decode($filteredList);
		}
		
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		$data = $job->getData();
	
		if(!$filteredList){
			$exportFileName = $data['preparePDF'];
			$downloadFileName = $data['preparePDFDownloadFilename'];
		}else{
			$exportFileName = $data['filteredPreparePDF'];
			$downloadFileName = $data['filteredPreparePDFDownloadFilename'];
		}
		//$contentType = $data['preparePDFContentType'];
		
		header("Pragma: public");
		header("Cache-Control: max-age=0");
		header('Content-Disposition: attachment; filename=' . $downloadFileName);
		header("Content-Description: pdf File");
		header("Content-type: application/pdf");
		readfile($exportFileName);
	}
	
	public function downloadProtocolPDF($jobId){
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		$data = $job->getData();
		$exportFileName = $data['protocolPDF'];
		$downloadFileName = $data['protocolPDFDownloadFilename'];
		
		header("Pragma: public");
		header("Cache-Control: max-age=0");
		header('Content-Disposition: attachment; filename=' . $downloadFileName);
		header("Content-Description: pdf File");
		header("Content-type: application/pdf");
		readfile($exportFileName);
	}
	
	public function downloadDTA($jobId){
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		$data = $job->getData();
		$exportFileName = $data['DTA'];
		$downloadFileName = $data['DTADownloadFilename'];
		//$contentType = $data['preparePDFContentType'];

		header("Pragma: public");
		header("Cache-Control: max-age=0");
		header('Content-Disposition: attachment; filename=' . $downloadFileName);
		header("Content-Description: zip File");
		header("Content-type: application/zip");
		readfile($exportFileName);
	}
	
	public function extractUsageFromDtaItems( $batchJobDtaItems, &$usage, $contexts, &$aReceiptIds ){
	
		$aReceiptIds = array();
		
		foreach($batchJobDtaItems as $batchJobDtaItem){

			$openItem = $batchJobDtaItem->getForeignRecordBreakNull('open_item_id', Billing_Controller_OpenItem::getInstance());
			if(is_null($openItem)){
				continue;
			}
			$receipt = $openItem->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
			$context = $contexts[$openItem->__get('erp_context_id')];
			$debitor = $openItem->getForeignRecordBreakNull('debitor_id', Billing_Controller_Debitor::getInstance());
			$contactNr = $debitor->getForeignId('contact_id');
			$aReceiptIds[] = $receipt->getId();
			
			if($receipt->hasAdditionalItem('MNR')){
				$contactNr = $receipt->getAdditionalItem('MNR');
				$year = $receipt->getAdditionalItem('FEE_YEAR');
			}
			
			if($receipt->isDonation()){
				$year = '';
			}
			
			if($openItem->__get('erp_context_id') == 'DONATOR'){
				$contactNr = '';
				$year = '';
				$rawUsage =  number_format($batchJobDtaItem->__get('total_sum'),2) . " $context";
			}else{
				$rawUsage =  number_format($batchJobDtaItem->__get('total_sum'),2) . " $contactNr $year $context";
			}
			$usage[] = $rawUsage;
		}
	}

	private function createNewSepa(&$creditor){
		$this->openSepaContainer();
		$sepa = \worg\wsf\sepa\app\PaymentSEPA::createDebitTransferCore();
		$sepa->setSchemaFiles(
			array(realpath(CSopen::instance()->getLibPath().'wsflib/worg/wsf/sepa/schema/pain.008.002.02.xsd') )
		);
		
		// get sepa creditor
		$sepaCreditors = Billing_Controller_SepaCreditor::getInstance()->getAll();
	    $sepaCreditor = $sepaCreditors->getFirstRecord();
		
		$creditor = \worg\wsf\sepa\app\Creditor::create()
			->setIBAN($sepaCreditor->getIBAN())
			->setBIC($sepaCreditor->getBIC())
			->setName(\worg\wsf\util\format\Umlaut::convert($sepaCreditor->getName()))
			->setSEPAIdent($sepaCreditor->getSepaCreditorIdent());
			
		$sepa->getGroupHeader()
			->setMessageId(\worg\wsf\sepa\app\PaymentSEPA::getIdProvider()->getNewGroupHeaderMessageId())
			->setCreationDateTime(strftime("%Y-%m-%dT%H:%M:%S"))
			->setPartyIdentificationName(\worg\wsf\util\format\Umlaut::convert($creditor->getName()));
		
		return $sepa;
	}
	
	private function openSepaContainer(){
		$this->sepaProcessing = true;
	}
	
	private function hasOpenSepaContainer(){
		return $this->sepaProcessing;
	}
	
	private function closeSepaContainer($filename){
		$this->sepaProcessing = false;
		$this->sepaFiles[] = $filename;
		$this->paymentSum = 0;
		$this->countTransactions = 0;
	}
	
	private function getFileCount(){
		return count($this->sepaFiles);
	}
	
	private function addSepaTransaction(
		&$sepa, 
		$batchJobDta, 
		$bankAccount, 
		$creditor, 
		$dueDate,
		$paymentAmount, 
		$endToEndId,
		$usage 
	){
		
		$this->paymentSum += $paymentAmount;
		$this->countTransactions++;
		
		$objDueDate = new Zend_Date($dueDate);
		$strDate = $objDueDate->toString("yyyy-MM-dd");
		
		$sepaMandate = $batchJobDta->getSepaMandate();
	      	
      	$debitor = \worg\wsf\sepa\app\Debitor::create()
			->setIBAN($bankAccount->getIBAN())
			->setBIC($bankAccount->getBIC())
			->setName(\worg\wsf\util\format\Umlaut::convert($bankAccount->getName()));
			//->setDifferingName('Sepplheinz '.$i);
		
		$pm = $sepa->getPaymentTransactions();
		
		if($sepaMandate->isFirst()){
			$pmTr = $pm->newFirstPayment($creditor, $debitor, $strDate);
		}else{
			$pmTr = $pm->newRecurrentPayment($creditor, $debitor, $strDate);
		}
		
		$pmTr->setMandateId($sepaMandate->getMandateIdent())
		->setMandateDateOfSignature($sepaMandate->getSignatureDateISO())
		->setEndToEndId($endToEndId)
		->setAmount($paymentAmount)
		->setUsage(\worg\wsf\util\format\Umlaut::convert($usage))
		->commit();
			
		$sepaMandate->markLastUsage($objDueDate);
		
	}
	
	public function finishSepaTransactionBlock( &$sepa, $filename ){
		$sepa->getGroupHeader()
			->setNumberOfTransactions($this->countTransactions)
			->setControlSum($this->paymentSum);
			
		$sepa->saveFile($filename);
		
		$this->closeSepaContainer($filename);
		
		$sepa->clearDocument();
		
		unset($sepa);
	}
	
	public function runBookingQueue($jobId, $dueDate){
		set_time_limit(0);

		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		Billing_Api_BatchJobManager::getInstance()->startBatchJob();
			

		try{
			//$dueDate = '2014-03-11';
			$dueDate = new Zend_Date($dueDate);
			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();

			$tId = $tm->startTransaction($db);

			$data = $job->getData();
			$pagination = new Tinebase_Model_Pagination();

			$filters = array();
					
			// get all open items (for debit)
			// grouped by debitors
			$filters[] = array(
	    		'field' => 'job_id',
	    		'operator' => 'equals',
	    		'value' => $job->getId()
			);

			$filters[] = array(
	    		'field' => 'action_state',
	    		'operator' => 'equals',
	    		'value' => 'EXPORTED'
			);
			
			$filter = new Billing_Model_BatchJobDtaFilter($filters, 'AND');

			// count membership matching filters
			$batchJobDtaIds =  $this->search(
				$filter,
				new Tinebase_Model_Pagination(array('sort' => 'n_family', 'dir' => 'ASC')),
				false,
				true
			);
			foreach($batchJobDtaIds as $batchJobDtaId){
		       	$batchJobDta = $this->get($batchJobDtaId);
				// keep out item which are diffed
				if($batchJobDta->__get('bank_valid')!='YES' || abs((float)$batchJobDta->__get('total_sum'))==0){
					continue;
				}
		       	
		       	//$bankAccount = Billing_Api_BankAccount::getFromBatchJobDta($batchJobDta);
		       	$bankAccount = $batchJobDta->getBankAccount();
		       	if(is_null($bankAccount)){
		       		continue;
		       	}
		       	$batchJobDtaItems = Billing_Controller_BatchJobDtaItem::getInstance()->getByBatchJobDtaId($batchJobDtaId);

		       	$usage = array();
	        	$contactNr = $batchJobDta->getForeignId('contact_id');
		        $usage[] = 'Adr.Nr '.$contactNr;
		        	
		        $payment = Billing_Model_Payment::createDebitFromDta(
		        	$batchJobDtaId,
		        	$batchJobDta->getForeignId('debitor_id'), 
		        	new Zend_Date($dueDate),
		        	$batchJobDta->__get('total_sum'), 
		        	'DEBIT', 
		        	'ERP' 
		        );
		        
		      	$this->extractUsageFromDtaItems( $batchJobDtaItems, $usage, $contexts, $aReceiptIds);
				
		      	$paymentAmount = $batchJobDta->getTotalSum();
		      	$sumOfPayment += $paymentAmount;
		      	
		      	if(is_array($usage)){
					$usage = join(' ',$usage);
				}

				// booking: LS-Verrechnung AN Forderungen
		        $soll = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DTA_SETTLE);
		        $haben = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DEBITOR);
		        
		        $payment->setCreditAccount($haben);
		        $payment->setDebitAccount($soll);
		        $countPos = count($batchJobDtaItems);
		        $payment->setUsage('LS-Einzug Anz.Pos: '.$countPos.' Summe:'.number_format($batchJobDta->__get('total_sum'),2).' '.$usage);

		        $payment = Billing_Controller_Payment::getInstance()->create($payment);
		        
		       	foreach($batchJobDtaItems as $batchJobDtaItem){
		       		
		       		$openItem = $batchJobDtaItem->getForeignRecordBreakNull('open_item_id', Billing_Controller_OpenItem::getInstance());
		       		if($openItem){
			       		$openItem->__set('banking_exp_date', new Zend_Date($dueDate));
			       		
			       		Billing_Controller_OpenItem::getInstance()->payOpenItem(
			       			$openItem->getId(),
			       			$payment,
			       			$openItem->__get('open_sum')			       			
			       		);
		       		}
				}
		       	
		       	$batchJobDta->__set('action_state', 'DONE');
		       	$batchJobDta->__set('process_datetime', Zend_Date::now());
		       	$batchJobDta->__set('processed_by_user', Tinebase_Core::get(Tinebase_Core::USER)->getId());
		       	
		       	$this->update($batchJobDta);
		       	
			}
			
			Billing_Api_BatchJobManager::getInstance()->finish();
			
			$tm->commitTransaction($tId);
			
		}catch(Exception $e){
			$tm->rollback($tId);
			Billing_Api_BatchJobManager::getInstance()->finishError($e->__toString());
			return array(
				'state' => 'failure',
				'result' => null,
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
			)
			);
		}
	}
	
	public function runDebitDtaExport($jobId, $dueDate){
		set_time_limit(0);
		error_reporting(E_ALL);
		
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		Billing_Api_BatchJobManager::getInstance()->startBatchJob();
			
	
		try{
			//$dueDate = '2014-02-17';
			$dueDate = new Zend_Date($dueDate);
			// init wsf lib
			
			\worg\wsf\util\xml\XmlSerializer::setIgnoreEmptyTags(true);
			\worg\wsf\util\objects\Binding::getForXmlFile(CSopen::instance()->getLibPath().'wsflib/worg/wsf/sepa/binding/', 'debit-binding.xml');
			
			$sepa = $this->createNewSepa($creditor);

			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();

			$tId = $tm->startTransaction($db);

			$data = $job->getData();
			$filters = $data['filters'];

			$pagination = new Tinebase_Model_Pagination();

			$contexts = array(
				'EVENTMANAGER' => 'Veranst.',
				'MEMBERSHIP' => 'Beitrag',
				'DONATOR' => 'Spende',
				'ERP' => 'allg.'
			);
			
			// get all open items (for debit)
			// grouped by debitors
			$filters[] = array(
	    		'field' => 'job_id',
	    		'operator' => 'equals',
	    		'value' => $job->getId()
			);

			$filter = new Billing_Model_BatchJobDtaFilter($filters, 'AND');

			// count membership matching filters
			$batchJobDtaIds =  $this->search(
				$filter,
				new Tinebase_Model_Pagination(array('sort' => 'n_family', 'dir' => 'ASC')),
				false,
				true
			);

			$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';

			$hash = md5(microtime());
			
		     $protocolBatchJobDtaIds = array();
		     $sumOfPayment = 0;
		     $countTransactions = 0;
		     foreach($batchJobDtaIds as $batchJobDtaId){
		       	$batchJobDta = $this->get($batchJobDtaId);
		       	
		     	// keep out item which are diffed
				if($batchJobDta->__get('bank_valid')!='YES' || abs((float)$batchJobDta->__get('total_sum'))==0){
					continue;
				}
		       	
		       	//$bankAccount = Billing_Api_BankAccount::getFromBatchJobDta($batchJobDta);
		       	$bankAccount = $batchJobDta->getBankAccount();
		       	if(is_null($bankAccount)){
		       		continue;
		       	}
		       	
		       	$batchJobDtaItems = Billing_Controller_BatchJobDtaItem::getInstance()->getByBatchJobDtaId($batchJobDtaId);

		       	$usage = array();
	        	$contactNr = $batchJobDta->getForeignId('contact_id');
		        $usage[] = 'Adr.Nr '.$contactNr;
		        	
		        $payment = Billing_Model_Payment::createDebitFromDta(
		        	$batchJobDtaId,
		        	$batchJobDta->getForeignId('debitor_id'), 
		        	new Zend_Date($batchJobDta->__get('created_datetime')),
		        	$batchJobDta->__get('total_sum'), 
		        	'DEBIT', 
		        	'ERP' 
		        );
		        
		      	$this->extractUsageFromDtaItems( $batchJobDtaItems, $usage, $contexts, $aReceiptIds);
				
		      	$paymentAmount = $batchJobDta->getTotalSum();
		      	$sumOfPayment += $paymentAmount;
		      	
		      	if(is_array($usage)){
					$usage = join(' ',$usage);
				}
				
		      	$endToEndId = $contactNr.'-'.join('-', $aReceiptIds);
		      	
				$this->addSepaTransaction(
					$sepa, 
					$batchJobDta, 
					$bankAccount, 
					$creditor, 
					$dueDate,
					$paymentAmount,
					$endToEndId, 
					$usage
				);
					
		       if($this->countTransactions % 1000 == 0){
		       		$filename = $tempFilePath."SEPA-DD-".$job->__get('job_nr')."-".($this->getFileCount()+1).".xml";
		       		$this->finishSepaTransactionBlock( $sepa, $filename );
		       		
		       		$sepa = $this->createNewSepa($creditor);
		       }
		       
	           	$protocolBatchJobDtaIds[] = $batchJobDtaId;
		       	
		        $batchJobDta->__set('action_state', 'EXPORTED');
		       	$batchJobDta->__set('process_datetime', Zend_Date::now());
		       	$batchJobDta->__set('processed_by_user', Tinebase_Core::get(Tinebase_Core::USER)->getId());
		       	
		       	$this->update($batchJobDta);
		        	 
		    }
		    
		    if($this->hasOpenSepaContainer()){
		    	$filename = $tempFilePath."SEPA-DD-".$job->__get('job_nr')."-".($this->getFileCount()+1).".xml";
		    	$this->finishSepaTransactionBlock( $sepa, $filename );
		    }
			
		    if($this->getFileCount()>1){
		   		$zip = new ZipArchive();
		   		
			    $zipFilename = $tempFilePath."SEPA-DD-".$job->__get('job_nr').".zip";
	
	    		if ($zip->open($zipFilename, ZIPARCHIVE::CREATE)!==TRUE) {
	    			throw new SPExcpetion("cannot open <$filename> for zip");
	    		}
		   		
		   		$lCount = 0;
				foreach($this->sepaFiles as $file){
					$zip->addFile($file, 'SEPA-DD-'.$job->__get('job_nr').'-'.(++$lCount).".xml");
				}
				$zip->close();
				
				$jobFileName = $zipFilename;
				$downloadExt = '.zip';
    		}else{
    			$downloadExt = '.xml';
    			$jobFileName = $this->sepaFiles[0];
    		}
			
			Billing_Api_BatchJobManager::getInstance()->jobAddData('DTA', $jobFileName);
			Billing_Api_BatchJobManager::getInstance()->jobAddData('DTADownloadFilename',  'SEPA-DD-'.$job->__get('job_nr').$downloadExt);

			//$tm->rollback($tId);
    		
			$tm->commitTransaction($tId);

		    //Billing_Api_BatchJobManager::getInstance()->finish();
		    $this->printDtaExportPrepare($jobId, false, null, true, $protocolBatchJobDtaIds);
		    
		    return array(
				'state' => 'success',
				'result' => null	
		    );
			//        $outputFileName = $tempFilePath . md5(serialize($job).'preparePDF'.microtime()).'.pdf';
		}catch(Exception $e){
			echo $e->__toString();
			$tm->rollback($tId);
			Billing_Api_BatchJobManager::getInstance()->finishError($e->__toString());
			return array(
				'state' => 'failure',
				'result' => null,
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
			)
			);
		}

	}

	public function prepareDebitDtaExport(Billing_Model_BatchJob $job){
		error_reporting(E_ALL);
		set_time_limit(0);
		try{
			$dueDate = new Zend_Date();
			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();

			$tId = $tm->startTransaction($db);

			$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($job->getId());
			//			Billing_Api_BatchJobManager::getInstance()->startBatchJob();
			$data = $job->getData();
			$filters = $data['filters'];
			$aContexts = $data['contexts'];
			if(!is_array($aContexts)){
				$aContexts = Zend_Json::decode($aContexts);
			}
			$pagination = new Tinebase_Model_Pagination();

			//require_once 'Payment/DTA.php';

			if(!is_array($filters)){
				$filters = Zend_Json::decode($filters);
			}

			// get all open items (for debit)
			// grouped by debitors
			/*$filters[] = array(
    		'field' => 'banking_exp_date',
    		'operator' => 'isnull',
    		'value' => ''
    		);*/
    		 
    		$filters[] = array(
    		'field' => 'state',
    		'operator' => 'not',
    		'value' => 'DONE'
    		);
    		
    		$filters[] = array(
    		'field' => 'type',
    		'operator' => 'equals',
    		'value' => 'DEBIT'
    		);
    		
    		$filters[] = array(
    		'field' => 'is_cancelled',
    		'operator' => 'equals',
    		'value' => 0 
    		);
    		
    		$filters[] = array(
    		'field' => 'is_cancellation',
    		'operator' => 'equals',
    		'value' => 0 
    		);
    		
    		//$contextFilters = array('ERP');
    		$contextFilters = array();
    		
    		foreach($aContexts as $context => $flag){
    			if($flag){
    				$contextFilters[] = $context;
    			}
    		}
    		
    		$filters[] = array(
    			'field' => 'erp_context_id',
		    	'operator' => 'in',
		    	'value' => $contextFilters
    		);

    		$rawFilters = $filters;
    		$paymentTypeCount = count($paymentTypeKeys);

    		
    		$filter = new Billing_Model_OpenItemFilter($filters, 'AND');
    		// due date: means date of execution of debit -> necessary for determination of sepa mandates
    		// Telefonat: Rudat, hhartl 14.05.2014
    		// "wenn im Filter angegeben, dann verwenden, ansonsten Tagesdatum" 
    		if($filter->isFilterSet("due_date")){
    			$dueDate = new Zend_Date($filter->getFilter("due_date")->getValue());
    		}
    		// count membership matching filters
    		$openItemIds =  Billing_Controller_OpenItem::getInstance()->search(
	    		$filter,
	    		new Tinebase_Model_Pagination(array('sort' => 'id', 'dir' => 'ASC')),
	    		false,
	    		true
    		);
 //ob_start();


    		$debitorOpenItemIds = array();
  $limit = 0;
  //echo "global count: ".count($openItemIds);
    		foreach($openItemIds as $openItemId){
    			/*if($limit++ > 250){
    				break;
    			}*/
    			$openItem = Billing_Controller_OpenItem::getInstance()->get($openItemId);
    			$debitorId = $openItem->getForeignId('debitor_id');
    			if(!array_key_exists($debitorId, $debitorOpenItemIds)){
    				$debitorOpenItemIds[$debitorId] = array();
    			}
    			$debitorOpenItemIds[$debitorId][] = $openItemId;
    		}
    		
    		$addFilters = array();
			$addFilters[] = array(
				'field' => 'membership_type',
				'operator' => 'notin',
				'value' => array(
					'MEMBER_EX',
					'MEMBER_GESCHENK',
					'SCHENKER'
				)
			);
    		
    		foreach($debitorOpenItemIds as $debitorId => $debitorOpenItems){
    			$debitor = null;
    			$contact = null;
    			$contactId = null;
    			$isError = false;
				try{
	    			$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
	    			$contactId = $debitor->getForeignId('contact_id');
	    			$contact = $debitor->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
	    			
	    			$valid = 'UNKNOWN';
	    			
	    			$activeMembershipIds = Membership_Controller_SoMember::getInstance()->getActiveMembershipsByContactId(
						$contact->getId(),
						$dueDate,
						$addFilters
					);
					
					$mandate = null;
					$count = count($activeMembershipIds);
					if(count($activeMembershipIds)==1){
						$membership = Membership_Controller_SoMember::getInstance()->getSoMember($activeMembershipIds[0]);
						if($membership->allowsSepaDirectDebit($dueDate)){
							//echo "has::";
							$hasMandate = true;
							$mandate = $membership->getForeignRecordBreakNull('sepa_mandate_id', Billing_Controller_SepaMandate::getInstance());
							$valid = 'YES';
						}
						$bankAccount = $membership->getForeignRecordBreakNull('bank_account_id', Billing_Controller_BankAccount::getInstance());
					}elseif(count($activeMembershipIds)==0){
						$regularDonations = Donator_Controller_RegularDonation::getInstance()->getByContactId($contact->getId());
						foreach($regularDonations as $regDon){
							if($regDon->allowsSepaDirectDebit()){
								$mandate = $regDon->getForeignRecordBreakNull('sepa_mandate_id', Billing_Controller_SepaMandate::getInstance());
								$valid = 'YES';
								//echo "has::";
								break;
							}
						}
					}
					$bankAccountName = '';
					$bankName = '';
					//echo "adr $contactId - count: $count\r\n";
	    			if(is_null($mandate)){
	    				$bankAccount = null;
	    				$valid = 'NO';
	    				$sepaMandateId = null;
	    				$bankAccountId = null;
						$receipt = $openItem->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
	    				$text = 'Kein gültiges Sepa-Mandat';
	    				if($receipt->getForeignId('payment_method_id')!='DEBIT'){
	    					continue;
	    				}
	    			}else{
	    				$text = 'Sepa-Lastschrift';
	    				$bankAccountId = $mandate->getForeignIdBreakNull('bank_account_id');
	    				$sepaMandateId = $mandate->getId();
	    			}
	    			$errorInfo = '';
					
	    			// REMARK[HH, 2013-08-23]: now set saldation contexts chosen by checkbox in start dialog:
	    			// fixes quickhack hardcoded array('MEMBERSHIP','DONATOR')
	    			//
					$aSaldation = Billing_Controller_DebitorAccount::getInstance()->getSummationByDebitorId($debitorId, $contextFilters );
	    			$saldation = $aSaldation['sum'];
	    			$actionState = 'OPEN';
				}catch(Exception $e){
					$isError = true;
					$valid = "NO";
					$text = "Fehler - Debitor $debitorId kann nicht verarbeitet werden.";
					$em = "";
					if(is_null($debitor)){
						$em .= "Debitor konnte nicht geladen werden ". $debitorId . " ";
					}
					
					if(is_null($contact) || is_null($contactId)){
						$em .= "Kontakt konnte nicht geladen werden. Debitor.Nr.:" . $debitorId;
					}
					$errorInfo = "Fehler: " . $em . " <br/>\r\n Original-Meldung: " . $e->__toString();
					$bankAccountId = null;
					$mandate = null;
					$actionState = 'ERROR';
					$bankAccountName = "";
					$bankName = "";
					$sepaMandateId = null;	
					$contactId = $debitorId;				
				}
    			$batchJobDta = new Billing_Model_BatchJobDta(null,true);
    			$batchJobDta->setFromArray(array(
    			'job_id' 				 => $job->getId(),
    			'contact_id'       		 => $contactId,  
				'debitor_id'        	 => $debitorId, 
    			'bank_account_id'		 => $bankAccountId,
				'bank_account_usage_id'  => 1,
    			'sepa_mandate_id'		 => $sepaMandateId,
				'bank_valid'         	 => $valid,
				'bank_account_number'    => 0,
				'bank_code'              => 0, 
				'bank_account_name'      => $bankAccountName,
				'bank_name'              => $bankName,
				'total_sum'              => 0,
    			'total_saldation'        => $saldation,
    			'diff_saldation'         => 0,
				'count_pos'              => 0,
				'skip'                   => !is_null($mandate),
				'action_text'            => $text,
				'action_data'            => null,
				'action_type'            => 'DRYRUN',
				'action_state'           => $actionState,
				'error_info'             => $errorInfo,
				'created_datetime'       => Zend_Date::now(), 
				'valid_datetime'         => Zend_Date::now(),
				'to_process_datetime'    => Zend_Date::now(),
				'process_datetime'       => Zend_Date::now(),
				'usage'                  => ''
				));

				$batchJobDta = $this->create($batchJobDta);
				if(!$isError){
					$batchJobDtaId = $batchJobDta->getId();
	
					$posCount = count($debitorOpenItems);
					$totalSum = 0;
					$usages = array();
	
					foreach($debitorOpenItems as $openItemId){
	
						$openItem = Billing_Controller_OpenItem::getInstance()->get($openItemId);
						$sum = (float)$openItem->__get('open_sum');
						
						$batchJobDtaItem = new Billing_Model_BatchJobDtaItem(null,true);
						$batchJobDtaItem->setFromArray(array(
							'batch_dta_id' 		=> $batchJobDtaId,
							'open_item_id'		=> $openItem->getId(),
							'erp_context_id' 	=> $openItem->__get('erp_context_id'),
							'total_sum' 		=> $sum,
							'skip' 				=> false,
							'usage' 			=> $openItem->__get('usage')
						));
	
						$usages[] = $openItem->__get('usage');
						$totalSum += $sum;
	
						Billing_Controller_BatchJobDtaItem::getInstance()->create($batchJobDtaItem);
	
					}
						
					$usage = implode(' ', $usages);
					$batchJobDta->__set('usage', $usage);
					$batchJobDta->__set('total_sum', $totalSum);
					$batchJobDta->__set('diff_saldation', $totalSum + $saldation);
					if($totalSum + $saldation != 0){
						$batchJobDta->__set('action_text', $batchJobDta->__get('action_text'). ' Differenz überprüfen');
					}
					$batchJobDta->__set('count_pos', $posCount);
					$this->update($batchJobDta);
				}

    		}
    		 //$log = ob_get_clean();
    		//Billing_Api_BatchJobManager::getInstance()->finishError($log);
    		Billing_Api_BatchJobManager::getInstance()->finish();

    		$tm->commitTransaction($tId);

    		return array(
				'state' => 'success',
				'result' => null	
    		);

		}catch(Exception $e){
			echo $e->__toString();
			$tm->rollback($tId);
			Billing_Api_BatchJobManager::getInstance()->finishError($e->__toString());
			return array(
				'state' => 'failure',
				'result' => null,
				'errorInfo' => array(
					'message' => $e->getMessage(),
					'trace' => $e->getTrace()
			)
			);
		}
		 

	}

	public function rundDebitDtaExport(){

	}


	public function initCollection(){
		$this->collection = new Tinebase_Record_RecordSet('Billing_Model_BatchJobDta');
	}

	public function getEmptyBatchJobDta(){
		$emptyOrder = new Billing_Model_BatchJobDta(null,true);
		return $emptyOrder;
	}

	public function setBunchCreate($bunchCreate){
		$this->bunchCreate = $bunchCreate;
	}

	public function isBunchCreate(){
		return $this->bunchCreate;
	}

	public function add(Billing_Model_BatchJobDta $record){
		$this->collection[] = $record;
		if(count($this->collection)>100){
			$this->createRecords();
		}
	}

	public function cleanup(){
		$this->initCollection();
	}

	public function createRecords(){
		if(count($this->collection)==0){
			return null;
		}
		$result = $this->_backend->createPrepared($this->collection);
		$this->cleanup();
		return $result;
	}

	public function getByJobAndActionId($jobId, $actionId, $singleResult=true){
		return $this->_backend->getByPropertyset(
		array(
				'job_id' => $jobId,
				'action_id' => $actionId
		),
		false,
		$singleResult // strategy first
		);
	}

	public function logErrorAction($actionId, Billing_Model_SoMember $member, array $data = array()){
		if($this->ommitTracks){
			return;
		}
		$data['action_state'] = 'ERROR';
		return $this->logAction($actionId, $member, $data);
	}

	/**
	 *
	 * Enter description here ...
	 * @param unknown_type $actionId
	 * @param Billing_Model_SoMember $member
	 * @param array $data
	 */
	public function logAction($actionId, Billing_Model_SoMember $member, array $data = null){
		if($this->ommitTracks){
			return;
		}
		$action = Billing_Controller_Action::getInstance()->get($actionId);
		$actionHistory = $this->getEmptyBatchJobDta();
		$actionHistory->setFromArray(array(
				'member_id' => $member->getId(),
				'association_id' => $member->getForeignId('association_id'),
				'parent_member_id' => $member->getForeignId('parent_member_id'),
				'child_member_id' => null,
				'action_id' => $actionId,
				'action_category' => $action->__get('category'),
				'action_type' => 'AUTO',
				'action_state' => 'DONE',
				'created_datetime' => new Zend_Date(),
				'valid_datetime' => Billing_Controller_SoMember::getInstance()->getDueDate(),
				'to_process_datetime' => new Zend_Date(),
				'process_datetime' => new Zend_Date(),
				'created_by_user' => Tinebase_Core::get(Tinebase_Core::USER)->getId(),
				'processed_by_user' => Tinebase_Core::get(Tinebase_Core::USER)->getId()
		));

		if(!is_null($data)){
			$actionHistory->setFromArray($data);
		}

		if(Billing_Api_JobManager::getInstance()->hasJob()){
			Billing_Api_JobManager::getInstance()->completeTask($actionHistory);
		}
		if($this->isBunchCreate()){
			$this->add($actionHistory);
		}else{
			$actionHistory = $this->create($actionHistory);
		}
		return $actionHistory;
	}
}
?>