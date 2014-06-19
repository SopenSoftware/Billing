<?php
/**
 * 
 * Controller Debitor
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Debitor extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_Debitor();
        $this->_modelName = 'Billing_Model_Debitor';
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
     * @return Billing_Model_Debitor
     */
    public function getEmptyDebitor(){
     	$emptyDebitor = new Billing_Model_Debitor(null,true);
     	return $emptyDebitor;
    }
    
    
 	public function getBankAccountCollectionForDebitor($debitor, $paymentMethod = null){
    	if(!($debitor instanceof Billing_Model_Debitor)){
    		$debitor = $this->get($debitor);
    	}
    	$bankAccountCollection = new Billing_Api_BankAccountCollection();
    	//$bankAccount = Billing_Api_BankAccount::createEmpty();
    	
    	$contact = $debitor->getForeignRecord('contact_id',Addressbook_Controller_Contact::getInstance());
    	$memberships = Membership_Controller_SoMember::getInstance()->getByContactId($contact->getId());
    	foreach($memberships as $membership){
    		$bankAccount = Billing_Api_BankAccount::getFromSoMember($membership);
    		$bankAccountCollection->attach($bankAccount);
    	}
    	try{
	    	$fundMaster = Donator_Controller_FundMaster::getInstance()->getByContactId($contact->getId());
		    if($fundMaster instanceof Donator_Model_FundMaster){
		    	//regular donations
		    	$regularDonations = Donator_Controller_RegularDonation::getInstance()->getByFundMasterId($fundMaster->getId());
		    	foreach($regularDonations as $regDon){
		    		if(!$regDon->__get('terminated') && !$regDon->__get('on_hold')){
		    			$bankAccount = Billing_Api_BankAccount::getFromRegularDonation($regDon);
		    			$bankAccountCollection->attach($bankAccount);
		    		}
		    	}
		    }
    	}catch(Exception $e){
    		// silent failure ok
    	}
    	
    	//$bankAccount = Billing_Api_BankAccount::getFromFundMaster($fundMaster);
	    //$bankAccountCollection->attach($bankAccount);
	    
	    $bankAccount = Billing_Api_BankAccount::getFromContact($contact);
	    $bankAccountCollection->attach($bankAccount);
	    
    	return $bankAccountCollection;
    	
    }
    
    public function getBankAccountForDebitor($debitor, $paymentMethod = null){
    	
    	if(!($debitor instanceof Billing_Model_Debitor)){
    		$debitor = $this->get($debitor);
    	}
    	
    	$bankAccount = Billing_Api_BankAccount::createEmpty();
    	
    	$contact = $debitor->getForeignRecord('contact_id',Addressbook_Controller_Contact::getInstance());
    	$memberships = Membership_Controller_SoMember::getInstance()->getByContactId($contact->getId());
    	foreach($memberships as $membership){
    		$bankAccount = Billing_Api_BankAccount::getFromSoMember($membership);
    	//	if($bankAccount->isValidForPaymentMethod($paymentMethod)){
    		if($bankAccount->isValid()){
    			break;
    		}
    	}
    	
    	//if(!$bankAccount->isValidForPaymentMethod($paymentMethod)){
	 	if(!$bankAccount->isValid()){
    		try{
	    	$fundMaster = Donator_Controller_FundMaster::getInstance()->getByContactId($contact->getId());
	    	$bankAccount = Billing_Api_BankAccount::getFromFundMaster($fundMaster);
    		}catch(Exception $e){
    			
    		}
	    }
	    
	    if(!$bankAccount->isValid()){
	    	$bankAccount = Billing_Api_BankAccount::getFromContact($contact);
	    }
	    //if(!$bankAccount->isValidForPaymentMethod($paymentMethod)){
	    /*if(!$bankAccount->isValid()){
	    	throw new Billing_Exception_BankAccountInvalidForPaymentMethod('No valid bankaccount for debitor '.$debitor->getId(). ' and payment method '.$paymentMethod. ' log: '.$log);
	    }*/
    	
    	return $bankAccount;
    	
    }
    
    /**
     * 
     * Get debitor by it's contact id
     * @param int $contactId
     */
    public function getByContactId($contactId){
    	return $this->_backend->getByContactId($contactId);
    }
    
	public function getIdByContactId($contactId){
    	return $this->_backend->getIdByProperty($contactId, 'contact_id');
    }
    
    /**
     * 
     * Fetches a debitor record by it's contact_id or creates it, if it does not exist
     * @param int $contactId
     */
    public function getByContactOrCreate($contactId, $additionalData = null){
    	try{
    		$debitor = $this->_backend->getByContactId($contactId);
    	}catch(Exception $e){
    		$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
    		$debitor = Addressbook_Custom_Contact::createDebitorFromContact($contact);
    		if(is_array($additionalData)){
    			$debitor->setFromArray($additionalData);
    			return Billing_Controller_Debitor::getInstance()->update($debitor);
    		}
    		
    		$debitor = Billing_Controller_Debitor::getInstance()->get($debitor->getId());
    	}

		return $debitor;    	
    }
    
    public function getContactIdsForDebitorIds(array $debitorIds){
    	//$this->search()
    }
    
	public function getContactIdForDebitorId($debitorId){
    	return $this->_backend->getPropertyById($debitorId, 'contact_id');
    }
    
    /**
     * inspect creation of one record
     * 
     * @param   Tinebase_Record_Interface $_record
     * @return  void
     */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    	$contact = Addressbook_Controller_Contact::getInstance()->get($_record->__get('contact_id'));
    	$debitor = Addressbook_Custom_Contact::getDebitorFromContact($contact);
    	$_record->__set('debitor_nr', $debitor->__get('debitor_nr'));
    	$_record->__set('price_group_id', $debitor->__get('price_group_id'));
    }
    
	 protected function _inspectUpdate(Tinebase_Record_Interface $_record)
    {
    	
    }
}
?>