<?php
/**
 * 
 * Controller BookingTemplate
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_BookingTemplate extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_BookingTemplate();
        $this->_modelName = 'Billing_Model_BookingTemplate';
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
     * @return Billing_Model_BookingTemplate
     */
    public function getEmptyBookingTemplate(){
     	$emptyBookingTemplate = new Billing_Model_BookingTemplate(null,true);
     	return $emptyBookingTemplate;
    }
    
 	protected function _inspectCreate($_record)
    {
    	if(!$_record->__get('booking_template_nr')){
    		$_record->__set('booking_template_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('booking_template_nr'));
    	}
    	
    }
    
	
}
?>