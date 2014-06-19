<?php
/**
 * 
 * Controller StockLocation
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_StockLocation extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_StockLocation();
        $this->_modelName = 'Billing_Model_StockLocation';
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
     * @return Billing_Model_StockLocation
     */
    public function getEmptyStockLocation(){
     	$emptyBrevet = new Billing_Model_StockLocation(null,true);
     	return $emptyStockLocation;
    }
    
    public function getDefaultStockLocation(){
    	return $this->_backend->getByProperty(1,'is_default');
    }
    
    public function getRegistryData(){
    	 $result = array(
            'results'     => array(),
            'totalcount'  => 0
        );
        
        if($rows = $this->getAll('location')) {
            $result['results']      = $rows->toArray();
            $result['totalcount']   = count($result['results']);
        }      
        return $result;
    }
}
?>