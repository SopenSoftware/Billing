<?php
/**
 * Billing csv generation class sepaMandate -> DATEV
 * 
 * @package     Billing
 * @subpackage	Export
 * @author		Hans-Jürgen Hartl
 */
class Billing_Export_SepaDATEVCsv extends Tinebase_Export_Csv
{
	private $controller = null;
	private $fields = array(
		'header' => array(
			/*
			Beraternummer
			Mandantennummer
			Gläubiger
			Gläubiger-ID
			Zahlungspflichtiger
			IBAN
			BIC
			Kreditinstitut
			Unterschriftsdatum
			Mandatsreferenz
			Mandatstyp
			Ausführungsvariante
			Mandatszweck
			Vorlauffrist zur Einreichung bei der Bank
			Mandat ist gültig ab
			Notiz
			Pre-Notification-Frist
			Historische Mandatsreferenz
			Status
			 */
		)
	);
    /**
     * export timesheets to csv file
     *
     * @param Membership_Model_ContactFilter $_filter
     * @return string filename
     */
    public function generate($filters, $data) {
   	 if(!is_array($filters)){
			$filters = Zend_Json::decode($filters);
		}
    	$pagination = new Tinebase_Model_Pagination(array(
            'start' => 0,
            'limit' => 0,
            'sort' => 'signature_date',
            'dir' => 'ASC',
        ));
        
        //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($_filter->toArray(), true));
        $this->controller = Billing_Controller_SepaMandate::getInstance();
        $filter = new Billing_Model_SepaMandateFilter($filters, 'AND');
        $mandateIds = $this->controller->search($filter, $pagination, FALSE, TRUE, 'export');

        return $this->doExport($mandateIds, $data);
    }
    
 	private function doExport( $mandateIds, $data) {
        
 		$tempFilePath = CSopen::instance()->getCustomerPath().'/customize/data/documents/temp/';
        $filename =  $tempFilePath . DIRECTORY_SEPARATOR . md5(uniqid(rand(), true)) . '.csv';
      
        $filehandle = fopen($filename, 'w');
      	//self::fputcsv($filehandle, $this->fields['header']);
       
 		if (count($mandateIds) < 1) {
            self::fputcsv($filehandle, array('Fehler:','keine Sepa-Mandate zum angegebenen Filter gefunden.'));
        }
        /*
         * 	Beraternummer
			Mandantennummer
			Gläubiger
			Gläubiger-ID
			Zahlungspflichtiger
			IBAN
			BIC
			Kreditinstitut
			Unterschriftsdatum
			Mandatsreferenz
			Mandatstyp
			Ausführungsvariante
			Mandatszweck
			Vorlauffrist zur Einreichung bei der Bank
			Mandat ist gültig ab
			Notiz
			Pre-Notification-Frist
			Historische Mandatsreferenz
			Status
         */
        
        foreach($mandateIds as $id){
        	$sepaMandate = $this->controller->get($id);
        	$sepaCreditor = $sepaMandate->getSepaCreditor();
        	$bankAccount = $sepaMandate->getBankAccount();
       		$resultArray = array(
        		$data['datevBerater'],
       			$data['datevMandant'],
        		$sepaCreditor->getName(),
        		$sepaCreditor->getSepaCreditorIdent(),
        		$bankAccount->getName(),
        		$bankAccount->getIBAN(),
        		$bankAccount->getBIC(),
        		$bankAccount->getBank(),
        		$sepaMandate->getSignatureDate()->toString('dd.MM.yyyy'),
        		$sepaMandate->getMandateIdent(),
        		$sepaMandate->tellMandateType(),
        		$sepaMandate->tellMandateExecutionType(),
        		'',
        		6,
        		$sepaMandate->getSignatureDate()->toString('dd.MM.yyyy'),
        		'',
        		14,
        		'',
        		''
        	);
        	self::fputcsvEncoding('ISO-8859-1',$filehandle, $resultArray, ';', '','');
        }

        fclose($filehandle);
        
        return $filename;
    }
}
