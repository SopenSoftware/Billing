<?php 
/**
 * 
 * Class for exporting
 * 
 * @author hhartl
 *
 */
class Billing_Controller_Export extends Tinebase_Controller_Abstract{
	
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
	
	public function exportArticleSellList($data, $exportType){
		
		$export = Billing_Custom_ArticleExportData::create($data);
		
		if($export->hasNoGrouping() || $exportType == 'CSV'){
			$export->setRecordSet(
				Billing_Controller_ArticleSold::getInstance()->search($export->getFilter(), $export->getPagination())
			);
		}elseif($export->hasGroupingCustomer()){
			// get all customers
			// -> maybe a huge set
			
			// check restrictions of filter regarding customer (customer_group)
			
			
		/*	$debitorFilter = new Billing_Model_DebitorFilter(array(),'AND');
			$debFilter = null;
			$articleFilter = $export->getFilter();
			
			if($articleFilter->isFilterSet('debitor_id')){
				$debFilter = $articleFilter->getFilter('debitor_id');
				
				if($debFilter->isFilterSet('id')){
					$debitorFilter->addFilter($debFilter->get('id'));
				}
				
				if($debFilter->isFilterSet('debitor_group_id')){
					$debitorFilter->addFilter($debFilter->get('debitor_group_id'));
				}
			}*/
			
			$debitorIds = Billing_Controller_ArticleSold::getInstance()->getDebitorIds($export->getFilter());
			
			foreach($debitorIds as $debitorId){
				$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
				
				$export->addCustomerRecordSet(
					Billing_Controller_ArticleSold::getInstance()->search($export->getCustomerFilter($debitor), $export->getPagination()),
					$debitorId
				);
			}				
			
			
		}
		
		
		
		switch($exportType){
			
			case 'PDF':
				
				$outputFileName = 'Artikel-Verkaufsliste-'.strftime('%d-%m-%Y %H-%M-%S').'.pdf';
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_ARTICLE_SOLD);
				
				if($export->hasGroupingCustomer()){
					$data = array();
					$aResult = $export->customerRecordsToArray(true);

					foreach($aResult as $debitorId => $result){
						$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
						$contact = $debitor->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
						
						$data[$contact->__get('n_fileas')] = array(
							'POS_TABLE' => $result['data'],
							'customer_nr' => $debitor->__get('debitor_nr'),
							'customer_name' => $contact->__get('n_fileas'),
							'begin_date' => \org\sopen\app\util\format\Date::format(new Zend_Date($export->getStartDate())),
							'end_date' => ($export->getEndDate()?\org\sopen\app\util\format\Date::format(new Zend_Date($export->getEndDate())):'heute'),
							'sum_total_netto' => number_format($result['total_netto'],2,',','.'),
							'sum_total_brutto' => number_format($result['total_brutto'],2,',','.')
						);
					}
					
					ksort($data);
					
				}else{
					$data = array(array(
						'POS_TABLE' => $export->toArray(true),
						'begin_date' => \org\sopen\app\util\format\Date::format(new Zend_Date($export->getStartDate())),
						'end_date' => ($export->getEndDate()?\org\sopen\app\util\format\Date::format(new Zend_Date($export->getEndDate())):'heute'),
						'sum_total_netto' => number_format($export->getSumTotalNetto(),2,',','.'),
						'sum_total_brutto' => number_format($export->getSumTotalBrutto(),2,',','.')
					));
				}
				

				Billing_Controller_PrintJobRecordData::getInstance()->export($data, $templateId, $outputFileName);
				break;
				
			case 'CSV':
				
				$this->exportAsCsv($export, 'Artikel-Verkaufsliste-'.strftime('%d-%m-%Y %H-%M-%S').'.csv');
				break;
				
		}
	}
	
	public function exportAsCsv($export, $outputFileName){
		
		$labels = $export->getFieldLabels();
		$data = $export->toArray();
		
		$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
        $filename =  $tempFilePath . DIRECTORY_SEPARATOR . md5(uniqid(rand(), true)) . '.csv';
        $filehandle = fopen($filename, 'w');
        
        Tinebase_Export_Csv::fputcsv($filehandle, $labels);
        foreach($data as $line){
        	Tinebase_Export_Csv::fputcsv($filehandle, $line);
        }
        
        Tinebase_Export_Csv::fputcsv($filehandle, array(null, null, null));
        Tinebase_Export_Csv::fputcsv($filehandle, array(null, null, null));
        
        Tinebase_Export_Csv::fputcsv($filehandle, $export->getSumLabels());
        Tinebase_Export_Csv::fputcsv($filehandle, array($export->getSumTotalNetto(), $export->getSumTotalBrutto()));
		
        fclose($filehandle);
		
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename=' . $outputFileName);
        header("Content-Description: csv File");  
        header("Content-type: $contentType");
        readfile($filename);
        unlink($filename);
	}
	
	
	public function downloadJobExportFile($jobId){
		$job = Membership_Api_JobManager::getInstance()->loadJob($jobId);
		$data = $job->getData();
		$exportFileName = $data['exportFileName'];
		$downloadFileName = $data['downloadFileName'];
		$contentType = $data['exportFileContentType'];
		
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename=' . $downloadFileName);
        header("Content-Description: csv File");  
        header("Content-type: $contentType");
        readfile($exportFileName);
	}
	
	public function downloadJobErrorFile($jobId){
		$job = Membership_Api_JobManager::getInstance()->loadJob($jobId);
		$data = $job->getData();
		$errorFileName = $data['exportErrorFileName'];
		$downloadFileName = 'ERROR-'.$data['downloadFileName'];
		$contentType = $data['exportFileContentType'];
		
		header("Pragma: public");
        header("Cache-Control: max-age=0");
        header('Content-Disposition: attachment; filename=' . $downloadFileName);
        header("Content-Description: csv File");  
        header("Content-type: $contentType");
        readfile($errorFileName);
	}
}
?>