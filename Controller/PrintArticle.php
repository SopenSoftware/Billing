<?php
use org\sopen\app\api\filesystem\storage\StorageException;

class Billing_Controller_Print extends Tinebase_Controller_Abstract{
	const PROCESS_ARTICLE_LIST = 'articleList';
	
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

	

	private function createReceipts(){
		foreach($this->receiptIds as $receiptId){
			$this->receiptId = $receiptId;
			$this->createReceipt();
		}
	}

	private function createReceipt(){
		try{
			$receipt = $this->_receiptController->get($this->receiptId);
			$receiptPositions = $this->_receiptController->getOrderPositions($this->receiptId)->toArray();
			$receiptSumValues = $this->_receiptController->getReceiptSumValues($this->receiptId);

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
		}catch(Exception $e){
			echo $e->__toString();
			throw new Billing_Exception_Order("Creating receipt document failed. - order: ".$order->__get('order_nr'). ' receipt: '.$receipt->__get('type'), 0, $e);
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
		$printFileName = 'Artikelliste-'.strftime('%d.%m.%Y %H:%M:%S').'.pdf';
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename='.$printFileName);
        header("Content-Description: Pdf Datei");  
      	header('Content-Type: application/pdf');
		echo $this->printJobStorage->getFileContent("//out/result/merge/pdf/final");
	}

	private function outputPreviewForDownload(){
		$printFileName = 'Artikelliste-'.strftime('%d.%m.%Y %H:%M:%S').'.pdf';
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

				case self::PROCESS_ARTICLE_LIST:
						
						
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
			echo $e->__toString();
			$tm->rollback($tId);
		}
	}
}
?>