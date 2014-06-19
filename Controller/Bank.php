<?php
/**
 * 
 * Controller Bank
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Bank extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_Bank();
        $this->_modelName = 'Billing_Model_Bank';
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
     * @return Billing_Model_Bank
     */
    public function getEmptyBank(){
     	$emptyBrevet = new Billing_Model_Bank(null,true);
     	return $emptyBank;
    }
    
    public function getByRecordNumber($recordNumber){
    	return $this->_backend->getByProperty($recordNumber, 'record_number');
    }
    
    public function isExistingBankCode($bankCode){
    	return ($this->getBanksByBankCode($bankCode)->getCount()>0);
    }
    
    public function getBanksByBankCode($bankCode){
    	return $this->_backend->getByPropertySet(
    		array(
    			'code' => $bankCode,
    			'att'  => '1'
    		),
    		false,		// no deleted records
    		false		// recordset not just single record
    	);
    }
}
?>