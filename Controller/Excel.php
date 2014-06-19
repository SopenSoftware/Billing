<?php 
use org\sopen\app\api\filesystem\storage\StorageException;
/**
 * 
 * Class for printing memberships (certificates, cards)
 * 
 * @author hhartl
 *
 */
class Billing_Controller_Excel extends Tinebase_Controller_Abstract{
	
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;
	private $map = array();
	private $count = 0;
	private $def = null;
	
	private $excelFileMap = array();
	private $periodBgMap = array();
	
	
	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
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
	
	public function setDefinition(Billing_Custom_PrintFibuDefinition $def){
		$this->def = $def;
	}
	
	public function getDefinitionBreak(){
		if(is_null($this->def)){
			throw new Exception('No definition specified');
		}
		return $this->def;
	}
	
	public function export($processArray, $def){
		$this->setDefinition($def);
		$this->processArray = $processArray;
		$this->runTransaction();
	}
	
	private function createResult(){
		//$this->templateId = $this->getDefinitionBreak()->getTemplateId();
		$fields = array(
			'Adressnummer',
			'Firma',
			'Nachname',
			'Vorname',
			'Belegdatum',
			'Zahlungsdatum',
			'Vwzw',
			'Gesamt',
			'Bezahlt',
			'Offen'
		);
		foreach($this->processArray as $item){
			$header = $item['header'];
			$period = $header['PERIOD'];
			$bgName = $header['BGNAME'];
			$bgKey = $header['BGKEY'];
			if(!array_key_exists($period, $this->excelFileMap)){
				$this->excelFileMap[$period]= new PHPExcel();
				
				$this->excelFileMap[$period]->getProperties()
                ->setCreator("wsf excel generator")
                ->setLastModifiedBy(Tinebase_Core::getUser()->accountDisplayName)
                ->setTitle('wsf ERP Excel Export')
                ->setSubject('Office 2007 XLSX Document')
                ->setCreated(Zend_Date::now()->get());
			}
			
			$excelFile = $this->excelFileMap[$period];
			
			
			if(!array_key_exists($period, $this->periodBgMap)){
				$this->periodBgMap[$period] = array();
			}
			
			if(!array_key_exists($bgName, $this->periodBgMap[$period])){
				if(count($this->periodBgMap[$period])==0){
					$this->periodBgMap[$period][$bgName] = 0;
				}else{
					$this->periodBgMap[$period][$bgName] = max($this->periodBgMap[$period]) + 1;
				}
			}
			
			$sheet = $excelFile->createSheet($this->periodBgMap[$period][$bgName]);
			$sheet->setTitle($bgKey);
			$excelFile->setActiveSheetIndex($this->periodBgMap[$period][$bgName]);
			
			$data = $item['values'];
			$line = 1;
			$column = 0;
			foreach($fields as $field){
				$sheet->setCellValueByColumnAndRow($column++, $line, $field);
			}
			++$line;
			foreach($data as $lineData){
				$column = 0;
				foreach($lineData as $cellValue){
					$sheet->setCellValueByColumnAndRow($column++, $line, $cellValue);
				}
				++$line;
			}
		}

		$this->finalize();
	}
	
	private function finalize(){
		$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
		
		$files = array();
		foreach($this->excelFileMap as $period => $excelObject){
			$filepart = $period."-".strftime("%Y-%m-%d_%H-%M-%S").".xlsx";
			$filename = $tempFilePath."/".$filepart;
			$files[] = array('file'=>$filename,'part'=> $filepart);
			$writer = new PHPExcel_Writer_Excel2007($excelObject);
			$writer->save($filename);
		}
		
		$zip = new ZipArchive();
		$downPart = "Excel-Fibu-Exp-".strftime("%Y-%m-%d_%H-%M-%S").".zip";
    	$downloadfilename = "$tempFilePath/".$downPart;

    	if ($zip->open($downloadfilename, ZIPARCHIVE::CREATE)!==TRUE) {
    		exit("cannot open <$downloadfilename>\n");
    	}

    	foreach($files as $fileInfo){
    		$zip->addFile($fileInfo['file'], $fileInfo['part']);
    	}
    	$zip->close();
    	
    	header("Pragma: public");
		header("Cache-Control: max-age=0");
		header('Content-Disposition: attachment; filename=' . $downPart);
		header("Content-Description: zip File");
		header("Content-type: application/zip");
		readfile($downloadfilename);
    	
	}
	
	private function runTransaction(){
		try{
						
			$this->createResult();
		}catch(Exception $e){
			echo $e->__toString();
		}
	}
}
?>