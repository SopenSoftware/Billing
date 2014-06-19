<?php
/**
 * 
 * Controller BankAccount
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_BankAccount extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_BankAccount();
        $this->_modelName = 'Billing_Model_BankAccount';
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
     * @return Billing_Model_BankAccount
     */
    public function getEmptyBankAccount(){
     	$emptyBrevet = new Billing_Model_BankAccount(null,true);
     	return $emptyBankAccount;
    }
    
	public function getByBankCodeAndNumber($bankCode, $accountNumber){
    	return $this->_backend->getByPropertySet(
    		array(
    			'bank_code' => $bankCode,
    			'number'  => $accountNumber
    		),
    		false,		// no deleted records
    		false		// recordset not just single record
    	);
    }
    
	public function getByIBAN($iban){
		return $this->_backend->getByProperty($iban, 'iban');
    }
    
	public function getByContactIdAndIBAN($contactId, $iban){
    	return $this->_backend->getByPropertySet(
    		array(
    			'contact_id' => $contactId,
    			'iban'  => $iban
    		),
    		false,		// no deleted records
    		false		// recordset not just single record
    	);
    }
    
	public function getByContactId($contactId){
    	return $this->_backend->getMultipleByProperty(
    		$contactId, 'contact_id'
    	);
    }
    
    public function _inspectCreate($record){
    	$iban = $record->__get('iban');
    	$accountNumber = Billing_Api_BankAccount::getAccountNumberFromIBAN($iban);
    	$record->__set('number', $accountNumber);
    	
    }
    
 	public function _inspectUpdate($record){
    	$iban = $record->__get('iban');
    	$accountNumber = Billing_Api_BankAccount::getAccountNumberFromIBAN($iban);
    	$record->__set('number', $accountNumber);
    	
    }
    
    public function updateBankAccountFromIbanAndAccountName($bankAccountId, $iban, $bankAccountName){
    	$bankAccount = $this->get($bankAccountId);
    	$update = false;
    	
    	if($iban){
    		if(!Billing_Api_BankAccount::improveIBAN($iban)){
	    		throw new Exception('Invalid iban');
	    	}
    		$bankAccount->__set('iban', $iban);
    		$update = true;
    	}
    	
    	if($bankAccountName){
    		$bankAccount->__set('name', $bankAccountName);
    		$update = true;
    	}
    	
    	if($update){
    		$bankAccount = $this->update($bankAccount);
    	}
    	return $bankAccount;
    	
    }
}
?>