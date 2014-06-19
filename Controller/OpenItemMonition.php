<?php
/**
 * 
 * Controller OpenItemMonition
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_OpenItemMonition extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_OpenItemMonition();
        $this->_modelName = 'Billing_Model_OpenItemMonition';
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
     * @return Billing_Model_OpenItemMonition
     */
    public function getEmptyOpenItemMonition(){
     	$emptyBrevet = new Billing_Model_OpenItemMonition(null,true);
     	return $emptyOpenItemMonition;
    }
    
    public function getByReceiptId($receiptId){
    	return $this->_backend->getMultipleByProperty($receiptId, 'monition_receipt_id');
    }
 
    public function getAllOpenItemMonitions($_sort = 'name', $_dir = 'ASC')
    {
        $result = $this->_backend->getAll($_sort, $_dir);
        return $result;    
    }
        
    /**
     * get membership kinds as simple array (key=>value)
     * e.g. for simple array store on client side
     *
     */
    public function getOpenItemMonitionsAsSimpleArray(){
    	$rows = $this->getAllOpenItemMonitions();
    	if($rows){
    		$aResult = array();
	    	$rows->translate();
	    	
	    	foreach($rows as $row){
	    		$aResult[] = array(
	    			$row->getId(),
	    			$row->__get('name')
	    		);
	    	}
	    	return $aResult;
    	}
    	// return empty arra
    	return array();
    }
}
?>