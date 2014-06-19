<?php
/**
 * 
 * Controller SepaMandate
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_SepaMandate extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_SepaMandate();
        $this->_modelName = 'Billing_Model_SepaMandate';
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
     * @return Billing_Model_SepaMandate
     */
    public function getEmptySepaMandate(){
     	$emptyBrevet = new Billing_Model_SepaMandate(null,true);
     	return $emptySepaMandate;
    }
    
    public function _inspectUpdate($_record, $oldRecord){
    	// if iban has changed
    	if($oldRecord->__get('iban') != $_record->__get('iban')){
    		if(Billing_Api_BankAccount::improveIBAN($_record->__get('iban'))){
    			$bankAccount = $_record->getForeignRecord('bank_account_id', Billing_Controller_BankAccount::getInstance());
    			$bankAccount->__set('iban', $_record->__get('iban'));
    			Billing_Controller_BankAccount::getInstance()->update($bankAccount);
    		}
    	}
    	
    	if($oldRecord->__get('account_name') != $_record->__get('account_name')){
    		$bankAccount = $_record->getForeignRecord('bank_account_id', Billing_Controller_BankAccount::getInstance());
    		$bankAccount->__set('name', $_record->__get('account_name'));
    		Billing_Controller_BankAccount::getInstance()->update($bankAccount);
    	}
    	
    	if($oldRecord->__get('mandate_state') != 'CONFIRMED' && $_record->__get('mandate_state') == 'CONFIRMED'){
    		$_record->__set('is_valid', true);
    	}
    	
    	if($_record->__get('mandate_state') != 'CONFIRMED'){
    		$_record->__set('is_valid', false);
    	}
    }
    
    public function exportSepaMandateDATEV($filters, $data){
    	try{
    		set_time_limit(0);
    		
    		if(!is_array($data)){
    			$data = Zend_Json::decode($data);
    		}
    		
			$export = new Billing_Export_SepaDATEVCsv();
			$outFile = $export->generate($filters, $data);
			$contentType = $export->getDownloadContentType();
			$filename = 'Sepa-Mandate-Export-'.strftime('%Y-%m-%dT%H-%M-%S').'.csv';
	        header("Pragma: public");
	        header("Cache-Control: max-age=0");
	        header('Content-Disposition: attachment; filename=' . $filename);
	        header("Content-Description: csv File");  
	        header("Content-type: $contentType");
	        readfile($outFile);
	        unlink($outFile);
		}catch(Exception $e){
			echo $e->__toString();
		}
    }
    
    public function getByMandateID($mandateID){
    	return $this->_backend->getByProperty($mandateID, 'mandate_ident');
    }
    
 	public function getByMandateIDBreakNull($mandateID){
 		try{
    		return $this->_backend->getByProperty($mandateID, 'mandate_ident');
 		}catch(Exception $e){
 			//echo $e->__toString();
 			return null;
 		}
    }
    
	public function generateSepaMandateForBankAccountUsage(Billing_Model_BankAccountUsage $usage){
		// read full featured record from backend
    	$usage = Billing_Controller_BankAccountUsage::getInstance()->get($usage->getId());
    	$sepaMandate = $usage->getForeignRecordBreakNull('sepa_mandate_id', $this);
    	if(!$sepaMandate || (is_object($sepaMandate && $sepaMandate->__get('is_deleted')))){
    		
    		$bank = $usage->getForeignRecord('bank_id', Billing_Controller_Bank::getInstance());
	    	$bankAccount = $usage->getForeignRecord('bank_account_id', Billing_Controller_BankAccount::getInstance());
	    	
    		$sepaMandateIdent = $bankAccount->getForeignId('contact_id');
    		$sepaMandate = $this->getByMandateIDBreakNull($sepaMandateIdent);
    		//var_dump($sepaMandate);
    		if(is_null($sepaMandate)){
    			//echo "create new...";
    	    	$sepaMandate = new Billing_Model_SepaMandate();
		    	
		    	
		    	$sepaMandate->__set('contact_id', $bankAccount->getForeignId('contact_id'));
		    	$sepaMandate->__set('bank_account_id', $bankAccount->getId());
		    	
		    	$sepaCreditors = Billing_Controller_SepaCreditor::getInstance()->getAll();
		    	$sepaCreditor = $sepaCreditors->getFirstRecord();
		    	$sepaMandate->__set('sepa_creditor_id', $sepaCreditor->getId());
		    	$sepaMandate->__set('mandate_ident', $sepaMandateIdent);
		    	$sepaMandate->__set('is_single', false);
		    	$sepaMandate = $this->create($sepaMandate);
		    }else{
		    	//echo "double...";
    			if($sepaMandate->getForeignId('bank_account_id') != $bankAccount->getId()){
    				//echo "create...";
    				$sepaMandateIdent .= '-BA'.$bankAccount->getId();
    				$sepaMandate = new Billing_Model_SepaMandate();
		    	
			    	$sepaMandate->__set('contact_id', $bankAccount->getForeignId('contact_id'));
			    	$sepaMandate->__set('bank_account_id', $bankAccount->getId());
			    	
			    	$sepaCreditors = Billing_Controller_SepaCreditor::getInstance()->getAll();
			    	$sepaCreditor = $sepaCreditors->getFirstRecord();
			    	$sepaMandate->__set('sepa_creditor_id', $sepaCreditor->getId());
			    	$sepaMandate->__set('mandate_ident', $sepaMandateIdent);
			    	$sepaMandate->__set('is_single', false);
			    	$sepaMandate = $this->create($sepaMandate);
				}
    		}
	    	
	    	
    	}
    	$usage->__set('sepa_mandate_id', $sepaMandate->getId());
    	//echo "set usage sepa mandate:". $sepaMandate->getId();
	    Billing_Controller_BankAccountUsage::getInstance()->update($usage);
		
	}
	
 	public function updateSignatureDate($sepaMandateId, $sepaMandateSignatureDate){
    	$sepaMandate = $this->get($sepaMandateId);
    	$update = false;
    	if($sepaMandateSignatureDate){
    		$sepaMandate->__set('signature_date', new Zend_Date($sepaMandateSignatureDate));
    		$sepaMandate->__set('mandate_state','CONFIRMED');
    		$update = true;
    	}else{
    		if($sepaMandate->__get('signature_date')){
    			$sepaMandate->__set('signature_date',null);
    			$sepaMandate->__set('mandate_state','GENERATED');
    			$update = true;
    		}
    	}
    	
    	if($update){
    		$sepaMandate = $this->update($sepaMandate);
    	}
    	return $sepaMandate;
    	
    }
    
	public function getByContactId($contactId){
    	return $this->_backend->getMultipleByProperty(
    		$contactId, 'contact_id'
    	);
    }
    
    public function removeAllSepaMandatesForContactId($contactId){
    	
    	$bankAccounts = Billing_Controller_BankAccount::getInstance()->getByContactId($contactId);
		$baIds = array();
		
    	foreach($bankAccounts as $bankAccount){
			$baIds[] = $bankAccount->getId();
		}
		if(count($baIds)>0){
			$bFilter = array(array(
				'field' => 'bank_account_id',
				'operator' => 'AND',
				'value' => array(array(
					'field' => 'id',
					'operator' => 'in',
					'value' => $baIds
				))
			));
			$bFilter = new Billing_Model_SepaMandateFilter($bFilter);
			$sepaMandateIds = $this->search($bFilter, null, false, true);
			
	    	if(count($sepaMandateIds)>0){
	
	    		foreach($sepaMandateIds as $sepaMandateId){
					$bankAccountUsages = Billing_Controller_BankAccountUsage::getInstance()->getBySepaMandateId($sepaMandateId);
					foreach($bankAccountUsage as $bankAccountUsage){
						$bankAccountUsage->__set('sepa_mandate_id', null);
						
						Billing_Controller_BankAccountUsage::getInstance()->update($bankAccountUsage);
						
					}	
				}
				$this->delete($sepaMandateIds);    		
	    		return true;
	    	}
    	}
    	return false;
    	
    }
}
?>