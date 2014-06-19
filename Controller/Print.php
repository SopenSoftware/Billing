<?php
use org\sopen\app\api\filesystem\storage\StorageException;

class Billing_Controller_Print extends Tinebase_Controller_Abstract{
	const TYPE_TEST = 'test';
	const PROCESS_TEST = 'test';

	const TYPE_RECEIPT = 'receipt';
	const TYPE_CALCULATION = 'calculation';
	const TYPE_BID = 'bid';
	const TYPE_CONFIRM = 'confirm';
	const TYPE_SHIPPING = 'shipping';
	const TYPE_INVOICE = 'invoice';
	const TYPE_CREDIT = 'credit';
	const TYPE_MONITION = 'monition';

	const TYPE_QUERY = 'query';
	const TYPE_OFFER = 'offer';
	const TYPE_ORDER = 'order';
	const TYPE_INCINVOICE = 'incinvoice';

	const PROCESS_RECEIPT = 'receipt';
	const PROCESS_RECEIPTS = 'receipts';

	const PROCESS_RECEIPT_PREVIEW = 'receipt_preview';

	const PROCESS_SUPPLY_RECEIPT = 'supply_receipt';

	const PROCESS_SUPPLY_RECEIPT_PREVIEW = 'supply_receipt_preview';
	
	const OUTPUT_TYPE_DOWNLOAD = 'DOWNLOAD';
	const OUTPUT_TYPE_PAGE = 'PAGE';
	

	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;
	private $pdfServer = null;
	private $printJobStorage = null;
	private $map = array();
	private $sortedMap = array();
	private $count = 0;
	private $preview = false;
	private $copyWatermarkFile = null;
	private $previewWatermarkFile = null;
	private $output = true;
	private $templateId = null;
	private $outputType = null;
	private $useSorting = false;
	private $types = array();
	private $copy = false;
	private $withCopy = false;
	
	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_receiptController = Billing_Controller_Receipt::getInstance();
		$this->_supplyReceiptController = Billing_Controller_SupplyReceipt::getInstance();
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_doContainerACLChecks = FALSE;
		$this->setOutputType();
	}

	private static $_instance = NULL;

	public function setOutputType($outputType = self::OUTPUT_TYPE_PAGE){
		$this->outputType = $outputType;
	}
	public function setPreview($preview){
		$this->preview = $preview;
	}

	public function setCopy($copy){
		$this->copy = $copy;
	}
	
	public function setWithCopy($copy){
		$this->withCopy = $copy;
	}
	
	public function setUserOptions($userOptions){
		$this->userOptions = $userOptions;
	}
	
	public function setUseSorting($useSorting){
		$this->useSorting = $useSorting;
	}
	
	public function isSortingUsed(){
		return $this->useSorting;
	}
	
	public function setTypes($types){
		$this->types = $types;
	}
	
	public function setFilters($filters){
		$this->filters = Zend_Json::decode($filters);
		$this->hasUserFilter = false;
		foreach($this->filters as $filter){
			if($filter['field'] == 'created_by'){
				$this->hasUserFilter = true;
			}
		}
	}

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
	
	private function createFilters(){
		$filters = new Billing_Model_ReceiptFilter($this->filters, 'AND');
		if($this->userOptions=='ONLYMINE'){
			if($filters->isFilterSet('created_by')){
				$filters->removeFilter('created_by');
			}
			if($filters->isFilterSet('last_modified_by')){
				$filters->removeFilter('last_modified_by');
			}
			$userFilter = new Tinebase_Model_Filter_User('created_by','equals', Tinebase_Core::getUser()->getId());
			$filters->addFilter($userFilter);
		}else{
			if($this->userOptions == 'ALLUSERS'){
				if($filters->isFilterSet('created_by')){
					$filters->removeFilter('created_by');
				}
				if($filters->isFilterSet('last_modified_by')){
					$filters->removeFilter('last_modified_by');
				}
			}
		}
		return $filters;
	}
	
	public function getPrintJobStorage(){
		return $this->printJobStorage;
	}

	public function printTest(){
		$this->runTransaction(self::PROCESS_TEST);
	}

	public function printReceiptByTypeNumber($number, $type){
		switch($type){
			case 'CALCULATION':
				$property = 'calc_nr';
				break;
			case 'BID':
				$property = 'bid_nr';
				break;
			case 'CONFIRM':
				$property = 'confirm_nr';
				break;
			case 'SHIPPING':
				$property = 'ship_nr';
				break;
			case 'INVOICE':
				$property = 'invoice_nr';
				break;
			case 'CREDIT':
				$property = 'credit_nr';
				break;
			case 'MONITION':
				$property = 'monition_nr';
				break;
		}
		$this->receiptId = $this->_receiptController->getIdByProperty($property, $number);
		$this->runTransaction(self::PROCESS_RECEIPT);
	}

	public function printReceipts($receiptIds, $output = true, $templateId = null, $preview=false, $copy=false, $withCopy = false){
		$this->output = $output;
		$this->setPreview($preview);
		$this->setCopy($copy);
		$this->setWithCopy($withCopy);
		
		$this->templateId = $templateId;
		if(is_string($receiptIds)){
			$receiptIds = Zend_Json::decode($receiptIds);
		}
		$this->receiptIds = $receiptIds;
		$this->runTransaction(self::PROCESS_RECEIPTS);
	}

	public function printReceiptsByUser($preview){
		$this->setPreview($preview);
		$filter = new Tinebase_Model_Filter_Date('print_date','isnull');
		$userFilter = new Tinebase_Model_Filter_User('created_by','equals', Tinebase_Core::getUser()->getId());
		$filterGroup = new Tinebase_Model_Filter_FilterGroup(array(),'AND');
		$filterGroup->addFilter($filter);
		$filterGroup->addFilter($userFilter);

		// -> get ids only
		$this->receiptIds = $this->_receiptController->search($filterGroup, null, false, TRUE);

		$this->runTransaction(self::PROCESS_RECEIPTS);
	}
	
	public function printAddressLabelsByFilter($outputType, $filters, $userOptions, $types, $sort){
		$sortField = 'creation_time';
		$sortDir = 'ASC';
		$sort = Zend_Json::decode($sort);
		$this->setUseSorting(true);
		
		if(is_array($sort) && array_key_exists('field', $sort) && array_key_exists('order', $sort)){
			if(in_array($sort['field'], array('creation_time','order_nr'))){
				$sortField = $sort['field'];
			}
			if(in_array($sort['order'], array('ASC','DESC'))){
				$sortDir = $sort['order'];
			}
		}
		$this->setTypes(Zend_Json::decode($types));
		$this->setOutputType($outputType);
		$this->setPreview($preview);
		$this->setFilters($filters);
		$this->setUserOptions($userOptions);
		
		$filters = $this->createFilters();
		$paging = new Tinebase_Model_Pagination(
			array( 'sort' => $sortField, 'dir' => $sortDir)
		);
		
		// -> get ids only
		$receipts = $this->_receiptController->search($filters, $paging);
		
		$orderIds = $receipts->__getFlattened('order_id');
		
		$orders = Billing_Controller_Order::getInstance()->getMultiple($orderIds);
		
		$debitorIds = $orders->__getFlattened('debitor_id');
		
		$debitorController = Billing_Controller_Debitor::getInstance();
		$contactIds = array();
		foreach($debitorIds as $debitorId){
			$contactIds[] = $debitorController->getContactIdForDebitorId($debitorId);
		}
		
		// print adress labels for given contact ids
		Addressbook_Controller_Contact::getInstance()->printAddressLabelsForContactIds(
			$contactIds, 
			Addressbook_Model_Contact::INVOICE_ADDRESS, 	// print invoice address
			array('DE')   // suppress country DE @TODO: make configurable
		);
		
	}
	
	public function printReceiptsByFilter($preview = false, $outputType, $filters, $userOptions, $types, $sort, $additionalOptions){
		$additionalOptions = Zend_Json::decode($additionalOptions);

		if($additionalOptions['addressLabels']==true){
			$this->printAddressLabelsByFilter($outputType, $filters, $userOptions, $types, $sort);
			return;
		}
		
		$sortField = 'creation_time';
		$sortDir = 'ASC';
		$sort = Zend_Json::decode($sort);
		$this->setUseSorting(true);
		
		if(is_array($sort) && array_key_exists('field', $sort) && array_key_exists('order', $sort)){
			if(in_array($sort['field'], array('creation_time','order_nr'))){
				$sortField = $sort['field'];
			}
			if(in_array($sort['order'], array('ASC','DESC'))){
				$sortDir = $sort['order'];
			}
		}
		$this->setTypes(Zend_Json::decode($types));
		$this->setOutputType($outputType);
		$this->setPreview($preview);
		$this->setFilters($filters);
		$this->setUserOptions($userOptions);
		
		
		if($additionalOptions['preview']== true){
			$this->setPreview(true);
		}
		if($additionalOptions['copy']== true){
			$this->setCopy(true);
		}
		
		
		
		$filters = $this->createFilters();
		
		$firstGroup = new Tinebase_Model_Filter_FilterGroup(array(),'AND');
		$firstGroup->addFilterGroup($filters);
		
		if(!$this->preview && !$this->copy){
			// only print receipts with empty print date!
			$firstGroup->addFilter(new Tinebase_Model_Filter_Date('print_date','isnull'));
		}
		$typesGroup = new Tinebase_Model_Filter_FilterGroup(array(),'OR');
		
		$inoviceFilter = null;
		$shippingFilter = null;
		
		if($this->types['invoice'] == true){
			$invoiceFilter = new Tinebase_Model_Filter_Text('type','equals', Billing_Model_Receipt::TYPE_INVOICE);
		}
		
		if($this->types['credit'] == true){
			$invoiceFilter = new Tinebase_Model_Filter_Text('type','equals', Billing_Model_Receipt::TYPE_CREDIT);
		}
		
		if($this->types['shipping'] == true){
			$shippingFilter = new Tinebase_Model_Filter_Text('type','equals', Billing_Model_Receipt::TYPE_SHIPPING);
		}
		
		if(!$invoiceFilter && !$shippingFilter){
			$invoiceFilter = new Tinebase_Model_Filter_Text('type','equals', Billing_Model_Receipt::TYPE_INVOICE);
		}
		if($invoiceFilter){
			$typesGroup->addFilter($invoiceFilter);
		}
		
		if($shippingFilter){
			$typesGroup->addFilter($shippingFilter);
		}
		
		$firstGroup->addFilterGroup($typesGroup);

		$paging = new Tinebase_Model_Pagination(
			array( 'sort' => $sortField, 'dir' => $sortDir)
		);
		
		// -> get ids only
		$this->receiptIds = $this->_receiptController->search($firstGroup, $paging, false, TRUE);

		$this->runTransaction(self::PROCESS_RECEIPTS);
	}

	public function printReceipt($receiptId){
		if(array_key_exists('preview',$_REQUEST)){
			$this->setPreview((bool)$_REQUEST['preview']);
		}
		if(array_key_exists('copy',$_REQUEST)){
			$this->setCopy((bool)$_REQUEST['copy']);
		}
		$this->receiptId = $receiptId;
		$this->runTransaction(self::PROCESS_RECEIPT);
	}

	public function getReceiptPreview($receiptId){
		$this->receiptId = $receiptId;
		$this->runTransaction(self::PROCESS_RECEIPT_PREVIEW);
	}

	public function printSupplyReceipt($receiptId){
		$this->receiptId = $receiptId;
		$this->runTransaction(self::PROCESS_SUPPLY_RECEIPT);
	}

	public function getSupplyReceiptPreview($receiptId){
		$this->receiptId = $receiptId;
		$this->runTransaction(self::PROCESS_SUPPLY_RECEIPT_PREVIEW);
	}

	private function matchReceiptType($type){
		switch($type){
			case 'CALCULATION':
				return Billing_Controller_Print::TYPE_CALCULATION;
			case 'BID':
				return Billing_Controller_Print::TYPE_BID;
			case 'CONFIRM':
				return Billing_Controller_Print::TYPE_CONFIRM;
			case 'SHIPPING':
				return Billing_Controller_Print::TYPE_SHIPPING;
			case 'INVOICE':
				return Billing_Controller_Print::TYPE_INVOICE;
			case 'CREDIT':
				return Billing_Controller_Print::TYPE_CREDIT;
			case 'MONITION':
				return Billing_Controller_Print::TYPE_MONITION;
			case 'SPQUERY':
				return Billing_Controller_Print::TYPE_QUERY;
			case 'SPOFFER':
				return Billing_Controller_Print::TYPE_OFFER;
			case 'SPORDER':
				return Billing_Controller_Print::TYPE_ORDER;
			case 'SPINVOICE':
				return Billing_Controller_Print::TYPE_INCINVOICE;
		}
	}
	private function getData($type,$data, &$replaceTextBlocks){
		switch($type){
			case 'CALCULATION':
				return Billing_Custom_Template::getCalculationData(
				$data,
				&$replaceTextBlocks
				);

			case 'BID':
				return Billing_Custom_Template::getBidData(
				$data,
				&$replaceTextBlocks
				);
			case 'CONFIRM':
				return Billing_Custom_Template::getABData(
				$data,
				&$replaceTextBlocks
				);
			case 'SHIPPING':
				return Billing_Custom_Template::getShippingData(
				$data,
				&$replaceTextBlocks
				);
			case 'INVOICE':
				return Billing_Custom_Template::getInvoiceData(
				$data,
				&$replaceTextBlocks
				);
			case 'CREDIT':
				return Billing_Custom_Template::getInvoiceData(
				$data,
				&$replaceTextBlocks
				);
			case 'MONITION':
				return Billing_Custom_Template::getMonitionData(
				$data,
				&$replaceTextBlocks
				);
			case 'SPQUERY':
				return Billing_Custom_Template::getQueryData(
				$data,
				&$replaceTextBlocks
				);
			case 'SPOFFER':
				return Billing_Custom_Template::getOfferData(
				$data,
				&$replaceTextBlocks
				);
			case 'SPORDER':
				return Billing_Custom_Template::getOrderData(
				$data,
				&$replaceTextBlocks
				);
			case 'SPINVOICE':
				return Billing_Custom_Template::getIncInvoiceData(
				$data,
				&$replaceTextBlocks
				);
		}

	}

	private function createReceipts(){
		foreach($this->receiptIds as $receiptId){
			$this->receiptId = $receiptId;
			$this->createReceipt();
		}
	}

	private function createReceipt(){
		try{
			$receipt = $this->_receiptController->get($this->receiptId);
			
			
			//$receiptPositions = $this->_receiptController->getOrderPositions($this->receiptId)->toArray();
			$receiptPositions = $receipt->getPositions()->toArray();
			if(!$receipt->isMonition()){
				$receiptSumValues = $this->_receiptController->getReceiptSumValues($this->receiptId);
			}else{
				$receiptSumValues = array();
			}

			$orderId = $receipt->__get('order_id');
			$order = Billing_Controller_Order::getInstance()->get($orderId);

			$contact = $order->__get('debitor_id')->__get('contact_id');
			$contactId = $contact['id'];
			$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);

			$receiptId = $receipt->id;
			$this->map[$contactId][] = $receiptId;
			$this->sortedMap[] = array($contactId => $receiptId);
			
			$this->count += 1;
			$templateId = $this->templateId;
			if(!Billing_Custom_Template::isToPrint($receipt, $this->matchReceiptType($receipt->__get('type')), &$templateId)){
				--$this->count;
			}
			
			// get data for template from custom template
			$replaceTextBlocks = $this->templateController->getTextBlocks($templateId);
			$user =  $receipt->__get('created_by');
			$userContact =  Addressbook_Controller_Contact::getInstance()->getContactByUserId($user->getId());
			$data = $this->getData(
			$receipt->__get('type'),
			array(
					'contact'=>$contact,
					'receipt'=>$receipt,
					'order' => $order,
					'debitor' => $order->__get('debitor_id'),
					'positions' => $receiptPositions,
					'sums' => $receiptSumValues,
					'user' => Tinebase_Core::get(Tinebase_Core::USER),
					'currentuser' => Tinebase_Core::getUser(),
					'user' => $receipt->__get('created_by'),
					'userContact' => $userContact,
			),
			$replaceTextBlocks
			);
			$tempInFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_in.odt';
			$tempOutFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_out.odt';

			$this->templateController->renderTemplateToFile($templateId, $data, $tempInFile, $tempOutFile, $replaceTextBlocks);

			// move file into storage: cleans up tempfile at once
			$this->printJobStorage->moveIn( $tempOutFile,"//in/$contactId/$receiptId/odt/temp");
			//$watermarkFile = '/srv/www/vhosts/dev/projects/sopen/web/vdst/customize/data/template/documents/preview.pdf';

			if(!$this->preview && !$this->copy){
				$receipt->__set('print_date', new Zend_Date(strftime('%Y-%m-%d')));
				$receipt->flatten();
				$this->_receiptController->update($receipt);
			}
			
			if(Membership_Api_JobManager::getInstance()->hasJob()){
				Membership_Api_JobManager::getInstance()->updateJobFromArray(
					array('job_name2','PRINTING... '. $count)
				);
			}
		}catch(Exception $e){
			throw $e;
			//
			//echo $e->__toString();
			//throw new Billing_Exception_Order("Creating receipt document failed. - order: ".$this->receiptId, 0, $e);
		}
	}

	private function createSupplyReceipt(){
		$receipt = $this->_supplyReceiptController->get($this->receiptId);
		$receiptPositions = $this->_supplyReceiptController->getSupplyOrderPositions($this->receiptId)->toArray();
		$receiptSumValues = $this->_supplyReceiptController->getSupplyReceiptSumValues($this->receiptId);

		$receiptId = $receipt->id;
		$this->map[] = $receiptId;

		$orderId = $receipt->__get('supply_order_id');

		$order = Billing_Controller_SupplyOrder::getInstance()->get($orderId);

		$contact = $order->__get('creditor_id')->__get('contact_id');
		$contactId = $contact['id'];
		$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);

		$this->count += 1;

		if(!Billing_Custom_Template::isToPrint($receipt, $this->matchReceiptType($receipt->__get('type')), &$templateId)){
			--$this->count;
		}

		// get data for template from custom template
		$replaceTextBlocks = $this->templateController->getTextBlocks($templateId);

		$data = $this->getData(
		$receipt->__get('type'),
		
		array(
					'contact'=>$contact,
					'receipt'=>$receipt,
					'order' => $order,
					'creditor' => $order->__get('creditor_id'),
					'positions' => $receiptPositions,
					'sums' => $receiptSumValues,
					'currentuser' => Tinebase_Core::getUser(),
					'user' => $receipt->__get('created_by')
					//'user' => Tinebase_User::getInstance()->getFullUserById($userId)
		),
		$replaceTextBlocks
		);

		$tempInFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_in.odt';
		$tempOutFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_out.odt';

		$this->templateController->renderTemplateToFile($templateId, $data, $tempInFile, $tempOutFile, $replaceTextBlocks);

		// move file into storage: cleans up tempfile at once
		$this->printJobStorage->moveIn( $tempOutFile,"//in/receipt/$receiptId/odt/temp");

		if($this->printJobStorage->fileExists("//in/receipt/$receiptId/odt/temp")){
			$inFile = $this->printJobStorage->resolvePath( "//in/receipt/$receiptId/odt/temp" );
			$outFile = $this->printJobStorage->getCreateIfNotExist( "//out/result/$receiptId/pdf/final" );
			$this->pdfServer->convertDocumentToPdf($inFile, $outFile);
		}
	}

	private function createResult(){
		$inputFiles = array();
		$inputFileSPaths = array();
		$pathMap = array();

		if(!$this->isSortingUsed()){
			foreach($this->map as $contactId=>$receipt){
				foreach($receipt as $receiptId){
					if($this->printJobStorage->fileExists("//in/$contactId/$receiptId/odt/temp")){
						$inFile = $this->printJobStorage->resolvePath( "//in/$contactId/$receiptId/odt/temp" );
						$outFile = $this->printJobStorage->getCreateIfNotExist( "//convert/$contactId/$receiptId/pdf/final" );
						$inputFiles[] = $this->printJobStorage->resolvePath( "//convert/$contactId/$receiptId/pdf/final"  );
						$inputFileSPaths[] =  "//convert/$contactId/$receiptId/pdf/final";
						if($this->preview){
							$transFile = $this->printJobStorage->getCreateIfNotExist( "//preview/$contactId/$receiptId/pdf/final" );
							$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
							$this->pdfServer->watermarkPdf($transFile, $this->previewWatermarkFile, $outFile);
						}elseif($this->copy){
							$transFile = $this->printJobStorage->getCreateIfNotExist( "//preview/$contactId/$receiptId/pdf/final" );
							$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
							$this->pdfServer->watermarkPdf($transFile, $this->copyWatermarkFile, $outFile);
						}else{
							$this->pdfServer->convertDocumentToPdf($inFile, $outFile);
							if($this->withCopy){
								$outFile2 = $this->printJobStorage->getCreateIfNotExist( "//copy/$contactId/$receiptId/pdf/finalcopy" );
								//$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
								$this->pdfServer->watermarkPdf($outFile, $this->copyWatermarkFile, $outFile2);
								$inputFiles[] = $outFile2;
							}
						}
					}
				}
			}
		}else{
			foreach($this->sortedMap as $coReceiptMap){
				foreach($coReceiptMap as $contactId => $receiptId){
					if($this->printJobStorage->fileExists("//in/$contactId/$receiptId/odt/temp")){
						$inFile = $this->printJobStorage->resolvePath( "//in/$contactId/$receiptId/odt/temp" );
						$outFile = $this->printJobStorage->getCreateIfNotExist( "//convert/$contactId/$receiptId/pdf/final" );
						$inputFiles[] = $this->printJobStorage->resolvePath( "//convert/$contactId/$receiptId/pdf/final"  );
						$inputFileSPaths[] =  "//convert/$contactId/$receiptId/pdf/final";
						if($this->preview){
							$transFile = $this->printJobStorage->getCreateIfNotExist( "//preview/$contactId/$receiptId/pdf/final" );
							$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
							$this->pdfServer->watermarkPdf($transFile, $this->previewWatermarkFile, $outFile);
						}elseif($this->copy){
							$transFile = $this->printJobStorage->getCreateIfNotExist( "//preview/$contactId/$receiptId/pdf/final" );
							$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
							$this->pdfServer->watermarkPdf($transFile, $this->copyWatermarkFile, $outFile);
						}else{
							$this->pdfServer->convertDocumentToPdf($inFile, $outFile);
							
							if($this->withCopy){
								$outFile2 = $this->printJobStorage->getCreateIfNotExist( "//copy/$contactId/$receiptId/pdf/finalcopy" );
								//$this->pdfServer->convertDocumentToPdf($inFile, $transFile);
								$this->pdfServer->watermarkPdf($outFile, $this->copyWatermarkFile, $outFile2);
								$inputFiles[] = $outFile2;
							}
						}
					}
				}
			}
		}
		
		$outputFile = $this->printJobStorage->getCreateIfNotExist( "//out/result/merge/pdf/final" );
		if((count($inputFiles)>1) || $this->withCopy){
			$this->pdfServer->mergePdfFiles($inputFiles, $outputFile);
		}else{
			$inputFile = current($inputFileSPaths);
			$this->printJobStorage->copy($inputFile, "//out/result/merge/pdf/final" );
		}
	}
	
	private function outputResult(){
		header('Content-Type: application/pdf');
		echo $this->printJobStorage->getFileContent("//out/result/merge/pdf/final");
	}

	private function outputPreview(){
		header('Content-Type: image/jpg');
		echo $this->printJobStorage->getFileContent("//preview/result/invoice/png/preview");
	}
	
	private function outputResultForDownload(){
		$printFileName = 'Belegdruck-'.strftime('%d.%m.%Y %H:%M:%S').'.pdf';
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename='.$printFileName);
        header("Content-Description: Pdf Datei");  
      	header('Content-Type: application/pdf');
		echo $this->printJobStorage->getFileContent("//out/result/merge/pdf/final");
	}

	private function outputPreviewForDownload(){
		$printFileName = 'Belegdruck-'.strftime('%d.%m.%Y %H:%M:%S').'.pdf';
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename='.$printFileName);
        header("Content-Description: Pdf Datei");
      	header('Content-Type: application/pdf');
		echo $this->printJobStorage->getFileContent("//preview/result/invoice/png/preview");
	}
	
	
	private function outputNone(){
		echo 'Keine Dokumente fällig zum Druck!';
	}

	private function runTransaction($process){
		try{
			$config = \Tinebase_Config::getInstance()->getConfig('pdfserver', NULL, TRUE)->value;
			$storageConf = \Tinebase_Config::getInstance()->getConfig('printjobs', NULL, TRUE)->value;

			$this->copyWatermarkFile = $config['copywatermarkfile'];
			$this->previewWatermarkFile = $config['previewwatermarkfile'];
				
			$this->tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
			$this->templateController = DocManager_Controller_Template::getInstance();
			$db = Tinebase_Core::getDb();
			$tm = Tinebase_TransactionManager::getInstance();
				
			$this->pdfServer = org\sopen\app\api\pdf\server\PdfServer::getInstance($config)->
				setDocumentsTempPath(CSopen::instance()->getDocumentsTempPath());
				
			$this->printJobStorage =  org\sopen\app\api\filesystem\storage\FileProcessStorage::createNew(
				'printjobs', 
				$storageConf['storagepath']
			);

			$this->printJobStorage->addProcessLines(array('in','convert','out', 'preview', 'copy'));
				
			$tId = $tm->startTransaction($db);
			$preview = false;
			switch($process){

				case self::PROCESS_TEST:
						
						
					break;
				case self::PROCESS_RECEIPT:
					$this->createReceipt();
					break;
				case self::PROCESS_RECEIPTS:
					$this->createReceipts();
					break;
						
				case self::PROCESS_RECEIPT_PREVIEW:
					$this->createReceipt();
					$preview = true;
					break;
				case self::PROCESS_SUPPLY_RECEIPT:
					$this->createSupplyReceipt();
					break;
				case self::PROCESS_SUPPLY_RECEIPT_PREVIEW:
					$this->createSupplyReceipt();
					$preview = true;
					break;
			}
				
			// create the multipage output from single page input files
			if($this->count>0){
				$this->createResult();
			}
			// make db changes final
			$tm->commitTransaction($tId);
				
			// output the result
			if($this->output){
				if($this->count>0){
					if($preview){
						if($this->outputType == self::OUTPUT_TYPE_PAGE){
							$this->outputPreview();
						}else{
							$this->outputPreviewForDownload();
						}
					}else{
						if($this->outputType == self::OUTPUT_TYPE_PAGE){
							$this->outputResult();
						}else{
							$this->outputResultForDownload();
						}
					}
				}else{
					$this->outputNone();
				}
			}
		}catch(Exception $e){
			//echo $e->__toString();
			
			$tm->rollback($tId);
			throw $e;
		}
	}
}
?>