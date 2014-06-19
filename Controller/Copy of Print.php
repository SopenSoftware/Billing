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
	
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;
	private $pdfServer = null;
	private $printJobStorage = null;
	private $map = array();
	private $count = 0;

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
	
	public function printReceipts($receiptIds){
		$receiptIds = Zend_Json::decode($receiptIds);
		$this->receiptIds = $receiptIds;
		$this->runTransaction(self::PROCESS_RECEIPTS);
	}
	
	public function printReceipt($receiptId){
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
	private function getData($type,$data, $replaceTextBlocks){
		switch($type){
			case 'CALCULATION':
				return Billing_Custom_Template::getCalculationData(
					$data,
					$replaceTextBlocks
				);
				
			case 'BID':
				return Billing_Custom_Template::getBidData(
					$data,
					$replaceTextBlocks
				);
			case 'CONFIRM':
				return Billing_Custom_Template::getABData(
					$data,
					$replaceTextBlocks
				);
			case 'SHIPPING':
				return Billing_Custom_Template::getShippingData(
					$data,
					$replaceTextBlocks
				);
			case 'INVOICE':
				return Billing_Custom_Template::getInvoiceData(
					$data,
					$replaceTextBlocks
				);
			case 'CREDIT':
				return Billing_Custom_Template::getInvoiceData(
					$data,
					$replaceTextBlocks
				);
			case 'MONITION':
				return Billing_Custom_Template::getInvoiceData(
					$data,
					$replaceTextBlocks
				);
			case 'SPQUERY':
				return Billing_Custom_Template::getQueryData(
					$data,
					$replaceTextBlocks
				);
			case 'SPOFFER':
				return Billing_Custom_Template::getOfferData(
					$data,
					$replaceTextBlocks
				);
			case 'SPORDER':
				return Billing_Custom_Template::getOrderData(
					$data,
					$replaceTextBlocks
				);
			case 'SPINVOICE':
				return Billing_Custom_Template::getIncInvoiceData(
					$data,
					$replaceTextBlocks
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
		$receipt = $this->_receiptController->get($this->receiptId);
		$receiptPositions = $this->_receiptController->getOrderPositions($this->receiptId)->toArray();
		$receiptSumValues = $this->_receiptController->getReceiptSumValues($this->receiptId);
		
		$receiptId = $receipt->id;
		
		$this->map[] = $receiptId;
		$orderId = $receipt->__get('order_id');
		
		$order = Billing_Controller_Order::getInstance()->get($orderId);
		
		$contact = $order->__get('debitor_id')->__get('contact_id');
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
					'debitor' => $order->__get('debitor_id'),
					'positions' => $receiptPositions,
					'sums' => $receiptSumValues,
					'user' => Tinebase_Core::getUser()
			),
			$replaceTextBlocks
		);
		$tempInFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_in.odt';
		$tempOutFile = $this->tempFilePath . md5(serialize($receipt).microtime()) . '_out.odt';
		
		$this->templateController->renderTemplateToFile($templateId, $data, $tempInFile, $tempOutFile, $replaceTextBlocks);
		
		// move file into storage: cleans up tempfile at once
		$this->printJobStorage->moveIn( $tempOutFile,"//in/receipt/$receiptId/odt/temp");
		//$watermarkFile = '/srv/www/vhosts/dev/projects/sopen/web/vdst/customize/data/template/documents/preview.pdf';
		
		if($this->printJobStorage->fileExists("//in/receipt/$receiptId/odt/temp")){
			$inFile = $this->printJobStorage->resolvePath( "//in/receipt/$receiptId/odt/temp" );
			$outFile = $this->printJobStorage->getCreateIfNotExist( "//out/result/$receiptId/pdf/final" );
			$this->pdfServer->convertDocumentToPdf($inFile, $outFile);
			//$previewOutFile = $this->printJobStorage->getCreateIfNotExist( "//out/preview/$receiptId/pdf/final" );
			//$this->pdfServer->watermarkPdf($outFile, $watermarkFile, $previewOutFile);
			
			
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
					'user' => Tinebase_Core::getUser()
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
		$pathMap = array();
		
		// give the final output file a name in the storage
		foreach($this->map as $receiptId){
			$outputFile = $this->printJobStorage->getCreateIfNotExist( "//out/result/$receiptId/pdf/final" );
			$inputFiles[$receiptId] = $outputFile;
			$outputThumbnail = $this->printJobStorage->getCreateIfNotExist( "//preview/result/$receiptId/png/preview");
			$this->pdfServer->createThumbnail($outputFile, $outputThumbnail, 800, 1200);
		}
		
		$outputFile = $this->printJobStorage->getCreateIfNotExist( "//out/result/merge/pdf/final" );
		if(count($this->map)>1){
			$this->pdfServer->mergePdfFiles($inputFiles, $outputFile);
		}else{
			$this->printJobStorage->copy("//out/result/$receiptId/pdf/final", "//out/result/merge/pdf/final" );
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
	
	private function outputNone(){
		echo 'Keine Dokumente fällig zum Druck!';
	}
	
	private function runTransaction($process){
		try{
			$config = \Tinebase_Config::getInstance()->getConfig('pdfserver', NULL, TRUE)->value;
			$storageConf = \Tinebase_Config::getInstance()->getConfig('printjobs', NULL, TRUE)->value;
			
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

			$this->printJobStorage->addProcessLines(array('in','convert','out', 'preview'));
			
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
			if($this->count>0){
				if($preview){
					$this->outputPreview();
				}else{
					$this->outputResult();
				}
			}else{
				$this->outputNone();
			}
		}catch(Exception $e){
			echo $e->__toString();
			$tm->rollback($tId);
		}
	}
}
?>