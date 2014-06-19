<?php
class Billing_Controller_BatchJobMonition extends Tinebase_Controller_Record_Abstract
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

	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_backend = new Billing_Backend_BatchJobMonition();
		$this->_modelName = 'Billing_Model_BatchJobMonition';
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

		$filter = new Billing_Model_BatchJobMonitionFilter($filters, 'AND');

		// count membership matching filters
		$batchJobMonitionIds =  $this->search(
			$filter,
			new Tinebase_Model_Pagination(array('sort' => 'id', 'dir' => 'ASC')),
			false,
			true
		);
		
		$this->_delete($batchJobMonitionIds);
		
	}
	
	protected function _inspectDelete($_ids){
		foreach($_ids as $id){
			$items = Billing_Controller_BatchJobMonitionItem::getInstance()->getByBatchJobMonitionId($id);
			foreach($items as $item){
				 Billing_Controller_BatchJobMonitionItem::getInstance()->delete((array) $item->getId());
			}
		}
	}
	
	public function printMonitionExportPrepare($jobId, $filteredList, $filteredListData, $monitionProtocol = false, array $batchJobMonitionIds = null){
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

			//require_once 'Payment/Monition.php';

			$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';

			if($monitionProtocol){
				$outputFileName = $tempFilePath . 'Protokoll-Mahnung-'.$job->getId().'.pdf';
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
				
				$filter = new Billing_Model_BatchJobMonitionFilter($filters, 'AND');
	
				// count membership matching filters
				$batchJobMonitionIds =  $this->search(
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
			$count = 0; //count($batchJobMonitionIds);
			$subSums = array();
			
			foreach($batchJobMonitionIds as $batchJobDataId){
				$batchJobData = $this->get($batchJobDataId);
				
				// keep out item which are diffed
				if((!$filteredList  && ($batchJobData->__get('monition_lock')==1))){
					continue;
				}
				$count++;
				
				$batchJobDataItems = Billing_Controller_BatchJobMonitionItem::getInstance()->getByBatchJobMonitionId($batchJobData->getId());
				$contact = $batchJobData->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
				
				$strOP = '';

				foreach($batchJobDataItems as $item){
				
					// Kontext / Fällig am / Beleg / Betrag
					$openItem = $item->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
				
					/*if($openItem->__get('state') != 'OPEN'){
								
						// tried to include open item which was already done!!!
						// break the job
						$this->cleanupJob($jobId);
						
						// break job!
						throw new Billing_Exception_OpenItem('Open item '.$openItem->__get('op_nr').' is already finished.');
					}*/
					
					$receipt = $openItem->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
					$contactNr = $batchJobData->getForeignId('contact_id');
					
					$receiptNr = $receipt->__get('invoice_nr');
					
					if($receipt->getAdditionalItem('MNR')){
						$contactNr = $receipt->getAdditionalItem('MNR');
					}
					
					$dueDate = $openItem->__get('due_date');
					$erpContext = $contexts[$receipt->__get('erp_context_id')];
					$sum = $openItem->__get('open_sum');
					$context = $receipt->__get('erp_context_id');
					$strOP .=
					$receiptNr."<text:tab/><text:tab/>".
					$contactNr."<text:tab/><text:tab/>".
					$erpContext. "<text:tab/><text:tab/>".
					\org\sopen\app\util\format\Date::format($dueDate)."<text:tab/><text:tab/>".
					$openItem->__get('due_days')."<text:tab/><text:tab/>".
					$openItem->getNextMonitionStage()."<text:tab/><text:tab/>".
					number_format($sum,2,',','.')."<text:line-break/>";
					
					if(!array_key_exists($context, $subSums)){
						$subSums[$context] =array(
							'context' => $erpContext,
							'method' => '',
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
				//$this->extractUsageFromMonitionItems( $batchJobDataItems, &$usage, $contexts);
				
				$strUsage = implode('<text:line-break/>',$usage);
				
				
				/*
				 ##MNR##
				 ##LASTNAME##
				 ##FORENAME##
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
    			'USAGE' => $strUsage,
    			'OPENITEMS' => $strOP,
				'OPEN' => number_format($batchJobData->__get('open_sum'),2,',','.'),
				'SALDO' => number_format($batchJobData->__get('total_saldation'),2,',','.'),
    			'TOTAL' => number_format($batchJobData->__get('total_sum'),2,',','.')
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
			$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_MONITION_PREPARE);

			Billing_Controller_PrintJobRecordData::getInstance()->export(
				$fullData,
				$templateId,
    			'Vorbereitungsliste-'.$job->getId().'.pdf', 
				true,
				$outputFileName
			);

			if(!$monitionProtocol){
				if(!$filteredList){
					Billing_Api_BatchJobManager::getInstance()->jobAddData('preparePDF', $outputFileName);
					Billing_Api_BatchJobManager::getInstance()->jobAddData('preparePDFDownloadFilename',  'Vorbereitungsliste-'.$job->getId().'.pdf');
				}else{
					Billing_Api_BatchJobManager::getInstance()->jobAddData('filteredPreparePDF', $outputFileName);
					Billing_Api_BatchJobManager::getInstance()->jobAddData('filteredPreparePDFDownloadFilename',  'Gefilterte-Vorbereitungsliste-'.$job->getId().'.pdf');
				}
			}else{
				Billing_Api_BatchJobManager::getInstance()->jobAddData('protocolPDF', $outputFileName);
				Billing_Api_BatchJobManager::getInstance()->jobAddData('protocolPDFDownloadFilename',  'Protokoll-Monition-'.$job->getId().'.pdf');
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
	
	public function downloadMonition($jobId){
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
		$data = $job->getData();
		$exportFileName = $data['MONITION'];
		$downloadFileName = $data['MonitionDownloadFilename'];
		//$contentType = $data['preparePDFContentType'];

		header("Pragma: public");
		header("Cache-Control: max-age=0");
		header('Content-Disposition: attachment; filename=' . $downloadFileName);
		header("Content-Description: zip File");
		header("Content-type: application/zip");
		readfile($exportFileName);
	}
	
	public function runMonitionExport($jobId, $dueDate){
		set_time_limit(0);
		error_reporting(E_ALL);
		
		$job = Billing_Api_BatchJobManager::getInstance()->loadBatchJob($jobId);
			Billing_Api_BatchJobManager::getInstance()->startBatchJob();
			
	
		
		try{
			
			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();

			$tId = $tm->startTransaction($db);

			set_time_limit(0);
			$data = $job->getData();
			$filters = $data['filters'];

			$pagination = new Tinebase_Model_Pagination();

			$contexts = array(
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

			$filter = new Billing_Model_BatchJobMonitionFilter($filters, 'AND');

			// count membership matching filters
			$batchJobMonitionIds =  $this->search(
				$filter,
				new Tinebase_Model_Pagination(array('sort' => 'n_family', 'dir' => 'ASC')),
				false,
				true
			);

			$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';

			$hash = md5(microtime());
			
		    $protocolBatchJobMonitionIds = array();
		    $bufferMonitionIds = array();
		    
		    foreach($batchJobMonitionIds as $batchJobMonitionId){
		       	$batchJobMonition = $this->get($batchJobMonitionId);
		       	
		     	// keep out items which are locked
				if($batchJobMonition->__get('monition_lock')){
					continue;
				}
		       	
		       	$usage = array();
	        	$contactNr = $batchJobMonition->getForeignId('contact_id');
	        	
	        	$batchJobMonitionItems = Billing_Controller_BatchJobMonitionItem::getInstance()->getByBatchJobMonitionId($batchJobMonitionId);

	        	// get last open item (grab last order, for relating monition to)
	        	$lastOpenItem = Billing_Controller_BatchJobMonitionItem::getInstance()->getLastOpenItem($batchJobMonitionItems);
	        	$orderId = $lastOpenItem->getForeignId('order_id');
	        		
	        	$lastReceipt = $lastOpenItem->getReceipt();
	        	
		        $monition = Billing_Model_Receipt::createMonition();
		        $monition->__set('order_id', $orderId);
		        $lastReceipt->copyAdditionalDataTo($monition);
		        $monition = Billing_Controller_Receipt::getInstance()->create($monition);
		        
		        $bufferMonitionIds[] = $monition->getId();
		        $overallMonitionStage = 0;
		        
		        foreach($batchJobMonitionItems as $batchJobMonitionItem){
		       		
		       		$openItem = $batchJobMonitionItem->getForeignRecord('open_item_id', Billing_Controller_OpenItem::getInstance());
		       		$openItem->manifestNextMonitionStage();
		       		$monitionStage = $openItem->__get('monition_stage');
		       		$overallMonitionStage = max($overallMonitionStage, $monitionStage);
		       		$openItemMonition = Billing_Model_OpenItemMonition::createFromBatchJobMonitionItem($monition, $batchJobMonitionItem);
		       		$openItemMonition = Billing_Controller_OpenItemMonition::getInstance()->create($openItemMonition);
		       		
		       		Billing_Controller_OpenItem::getInstance()->update($openItem);
				}
				
				$monition->__set('monition_level', $overallMonitionStage);
				if(Billing_Custom_Template::isToPrint($monition, Billing_Controller_Print::TYPE_MONITION, $templateId)){
					$monition->__set('template_id', $templateId);
				}
				
				Billing_Controller_Receipt::getInstance()->update($monition);
		       	
		       	$batchJobMonition->__set('action_state', 'DONE');
		       	$batchJobMonition->__set('process_datetime', Zend_Date::now());
		       	$batchJobMonition->__set('processed_by_user', Tinebase_Core::get(Tinebase_Core::USER)->getId());
		       	
		       	$this->update($batchJobMonition);
		       	
		       	$protocolBatchJobMonitionIds[] = $batchJobMonitionId;
		        
		    }
		    
		    $printController = Billing_Controller_Print::getInstance();
		    $printController->printReceipts($bufferMonitionIds, false,  null, false, false, false);
		    $storage = $printController->getPrintJobStorage();
		    
		    $tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
		    
		    $filename = $tempFilePath.md5(microtime()).'.pdf';
		    $storage->copyOut("//out/result/merge/pdf/final", $filename);
		    $storage->close();
		    
			Billing_Api_BatchJobManager::getInstance()->jobAddData('MONITION', $filename);
			Billing_Api_BatchJobManager::getInstance()->jobAddData('MonitionDownloadFilename',  'Monition-'.$job->__get('job_nr').'.pdf');

    		$tm->commitTransaction($tId);

		    //Billing_Api_BatchJobManager::getInstance()->finish();
		    $this->printMonitionExportPrepare($jobId, false, null, true, $protocolBatchJobMonitionIds);
		    
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

	public function prepareMonitionExport(Billing_Model_BatchJob $job){
		error_reporting(E_ALL);
		set_time_limit(0);
		
		\org\sopen\dev\DebugLogger::openLogFileOverwrite(CSopen::instance()->getCustomerPath().'/conf/logs/mon.log');
		
		//throw new Exception(CSopen::instance()->getCustomerPath().'/conf/logs/mon.log');
		try{

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

			//require_once 'Payment/Monition.php';

			if(!is_array($filters)){
				$filters = Zend_Json::decode($filters);
			}

			/*if(!is_array($paymentTypeKeys)){
				$paymentTypeKeys = Zend_Json::decode($paymentTypeKeys);
			}

			$paymentTypeKeys = array(
				1 => 'DEBIT',
				2 => 'DEBIT_GM'
			);*/

			$monitionStage1Days = (int) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::MONITION_STAGE1);
			
			
			// get all open items (for debit)
			// grouped by debitors
			$filters[] = array(
	    		'field' => 'due_days',
	    		'operator' => 'greater',
	    		'value' => $monitionStage1Days
    		);
    		 
	    /*		$filters[] = array(
	    		'field' => 'type',
	    		'operator' => 'notin',
	    		'value' => $paymentTypeKeys
    		);*/
    		
    		$filters[] = array(
	    		'field' => 'state',
	    		'operator' => 'not',
	    		'value' => 'DONE'
    		);

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
    		//$rawFilters = $filters;
    		//$paymentTypeCount = count($paymentTypeKeys);

    		/*$filters[] = array(
    		'field' => 'payment_method_id',
    		'operator' => 'equals',
    		'value' => $paymentTypeKeys[1]
    		);*/
    		
    		//print_r($filters);

    		$filter = new Billing_Model_OpenItemFilter($filters, 'AND');
    		

    		// count membership matching filters
    		$openItemIds =  Billing_Controller_OpenItem::getInstance()->search(
	    		$filter,
	    		new Tinebase_Model_Pagination(array('sort' => 'id', 'dir' => 'ASC')),
	    		false,
	    		true
    		);
    		 
    		
    		//print_r($openItemIds);
    		
    		
    		
    		$debitorOpenItemIds = array();
    		 
    		foreach($openItemIds as $openItemId){
    			$openItem = Billing_Controller_OpenItem::getInstance()->get($openItemId);
    			$debitorId = $openItem->getForeignId('debitor_id');
    			if(!array_key_exists($debitorId, $debitorOpenItemIds)){
    				$debitorOpenItemIds[$debitorId] = array();
    			}
    			$debitorOpenItemIds[$debitorId][] = $openItemId;
    		}
    		 
    		foreach($debitorOpenItemIds as $debitorId => $debitorOpenItems){

    			$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
    			$contact = $debitor->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
    			$aSaldation = Billing_Controller_DebitorAccount::getInstance()->getSummationByDebitorId($debitorId, $contextFilters);
    			$saldation = $aSaldation['sum'];
    			
    			$batchJobMonition = new Billing_Model_BatchJobMonition(null,true);
    			$batchJobMonition->setFromArray(array(
    			'job_id' 				=> $job->getId(),
    			'contact_id'       		=> $contact->getId(),  
				'debitor_id'        	=> $debitor->getId(),   
				'monition_stage' 		=> 1,
				'total_sum'    			=> 0,
				'open_sum'              => 0, 
				'total_saldation'      	=> 0,
				'count_pos'             => 0,
				'monition_lock'         => $debitor->__get('is_monition_locked'),
				'skip'                  => false,
				'action_text'           => '',
				'action_data'           => null,
				'action_type'           => 'DRYRUN',
				'action_state'          => 'OPEN',
				'error_info'            => $errorInfo,
				'created_datetime'      => Zend_Date::now(), 
				'valid_datetime'        => Zend_Date::now(),
				'to_process_datetime'   => Zend_Date::now(),
				'process_datetime'      => Zend_Date::now(),
				'usage'                 => ''
				));

				$batchJobMonition = $this->create($batchJobMonition);
				$batchJobMonitionId = $batchJobMonition->getId();

				$posCount = count($debitorOpenItems);
				$totalSum = 0;
				$totalBruttoSum = 0;
				$usages = array();
				$maxMonitionStage = 1;
				
				foreach($debitorOpenItems as $openItemId){

					$openItem = Billing_Controller_OpenItem::getInstance()->get($openItemId);
					$sum = (float)$openItem->__get('open_sum');
					$totalBrutto = (float)$openItem->__get('total_brutto');
					$batchJobMonitionItem = new Billing_Model_BatchJobMonitionItem(null,true);
					$batchJobMonitionItem->setFromArray(array(
						'batch_monition_id' 		=> $batchJobMonitionId,
						'open_item_id'		=> $openItem->getId(),
						'erp_context_id' 	=> $openItem->__get('erp_context_id'),
						'open_sum' 			=> $sum,
						'total_sum' 		=> $totalBrutto,
						'monition_stage' 	=> $openItem->getNextMonitionStage(),
						'due_days' 			=> $openItem->__get('due_days'),
						'skip' 				=> false,
						'usage' 			=> $openItem->__get('usage')
					));

					$usages[] = $openItem->__get('usage');
					$totalSum += $sum;
					$totalBruttoSum += $totalBrutto;
					$maxMonitionStage = max($maxMonitionStage, $openItem->getNextMonitionStage());
					Billing_Controller_BatchJobMonitionItem::getInstance()->create($batchJobMonitionItem);

				}
					
				$usage = implode(' ', $usages);
				$batchJobMonition->__set('usage', $usage);
				$batchJobMonition->__set('open_sum', $totalSum);
				$batchJobMonition->__set('total_sum', $totalBruttoSum );
				$batchJobMonition->__set('total_saldation', $saldation);
				$batchJobMonition->__set('monition_stage', $maxMonitionStage);
				$batchJobMonition->__set('count_pos', $posCount);
				$this->update($batchJobMonition);

    		}
    		Billing_Api_BatchJobManager::getInstance()->finish();

    		$tm->commitTransaction($tId);
\org\sopen\dev\DebugLogger::close();
    		return array(
				'state' => 'success',
				'result' => null	
    		);

		}catch(Exception $e){
			// $e->__toString();
			$tm->rollback($tId);
			Billing_Api_BatchJobManager::getInstance()->finishError($e->__toString());
			
			\org\sopen\dev\DebugLogger::log( $e->__toString);
			\org\sopen\dev\DebugLogger::close();
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

	public function initCollection(){
		$this->collection = new Tinebase_Record_RecordSet('Billing_Model_BatchJobMonition');
	}

	public function getEmptyBatchJobMonition(){
		$emptyOrder = new Billing_Model_BatchJobMonition(null,true);
		return $emptyOrder;
	}

	public function setBunchCreate($bunchCreate){
		$this->bunchCreate = $bunchCreate;
	}

	public function isBunchCreate(){
		return $this->bunchCreate;
	}

	public function add(Billing_Model_BatchJobMonition $record){
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
		$actionHistory = $this->getEmptyBatchJobMonition();
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