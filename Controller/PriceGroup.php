<?php
/**
 * 
 * Controller PriceGroup
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_PriceGroup extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_PriceGroup();
        $this->_modelName = 'Billing_Model_PriceGroup';
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
     * @return Billing_Model_PriceGroup
     */
    public function getEmptyPriceGroup(){
     	$emptyBrevet = new Billing_Model_PriceGroup(null,true);
     	return $emptyPriceGroup;
    }
    
    public function getDefaultPriceGroup(){
    	return $this->_backend->getByProperty(1,'is_default');
    }
    
    public function getByName($name){
    	return $this->_backend->getByProperty($name,'name');
    }
}
?>