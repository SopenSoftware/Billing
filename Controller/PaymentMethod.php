<?php
class Billing_Controller_PaymentMethod extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_PaymentMethod();
		$this->_modelName = 'Billing_Model_PaymentMethod';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_config = isset(Tinebase_Core::getConfig()->eventmanager) ? Tinebase_Core::getConfig()->eventmanager : new Zend_Config(array());
	}

	private static $_instance = NULL;

	/**
	 * the singleton pattern
	 *
	 * @return SoBillingManager_Controller_SoBilling
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}

	public function getEmptyPaymentMethod(){
		$emptyObj = new Billing_Model_PaymentMethod(null,true);
		return $emptyObj;
	}
	
    public function getDefaultPaymentMethod(){
    	return $this->_backend->getByProperty(1,'is_default');
    }
	
    public function getAllPaymentMethods($_sort = 'name', $_dir = 'ASC')
    {
        $result = $this->_backend->getAll($_sort, $_dir);
        return $result;    
    }
    /**
     * 
     * Get the payment method (foreign record) in given record, or use default, if not set
     * @param Tinebase_Record_Abstract $record
     * @param unknown_type $fieldForeignId
     */
    public function getPaymentMethodFromRecordOrDefault(Tinebase_Record_Abstract $record, $fieldForeignId){
    	if($record->__get($fieldForeignId)){
    		return $record->getForeignRecord($fieldForeignId, $this);
    	}
    	return $this->getDefaultPaymentMethod();
    }
    
    /**
     * get membership kinds as simple array (key=>value)
     * e.g. for simple array store on client side
     *
     */
    public function getPaymentMethodsAsSimpleArray(){
    	$rows = $this->getAllPaymentMethods();
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