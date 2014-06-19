<?php
/**
 * 
 * Controller Vat
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_Vat extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_Vat();
        $this->_modelName = 'Billing_Model_Vat';
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
     * @return Billing_Model_Vat
     */
    public function getEmptyVat(){
     	$emptyBrevet = new Billing_Model_Vat(null,true);
     	return $emptyVat;
    }
    
    /**
     * inspect creation of one record
     * 
     * @param   Tinebase_Record_Interface $_record
     * @return  void
     */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
        if(isset($_record->name)){
        	$_record->value = round($_record->name/100,2);
        }
    }
    
    /**
     * inspect update of one record
     * 
     * @param   Tinebase_Record_Interface $_record
     * @return  void
     */
    protected function _inspectUpdate(Tinebase_Record_Interface $_record)
    {
        if(isset($_record->name)){
        	$_record->value = round($_record->name/100,2);
        }
    }
    
    public function getDefaultVat(){
    	return $this->_backend->getByProperty(1,'is_default');
    }
    /**
     * 
     * Fetch vat record by value
     * @param float $value
     */
    public function getByValue($value){
    	
    }
    /**
     * 
     * Fetch vat record by name
     * @param string $name
     */
    public function getByName($name){
    	return $this->_backend->getByProperty($name,'name');
    }
}
?>