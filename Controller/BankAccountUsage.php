<?php
/**
 *
 * Controller BankAccountUsage
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_BankAccountUsage extends Tinebase_Controller_Record_Abstract
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
		$this->_backend = new Billing_Backend_BankAccountUsage();
		$this->_modelName = 'Billing_Model_BankAccountUsage';
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
	 * @return Billing_Model_BankAccountUsage
	 */
	public function getEmptyBankAccountUsage(){
		$emptyBankAccountUsage = new Billing_Model_BankAccountUsage(null,true);
		return $emptyBankAccountUsage;
	}
	
	public function getBySepaMandateId($sepaMandateId){
		return $this->_backend->getMultipleByProperty(
    		$sepaMandateId, 'sepa_mandate_id'
    	);
	}
	
	public function getSepaMandateForMembership($membership){
		if(!$membership->getForeignId('bank_account_id')){
			return null;
		}
		return $this->getSepaMandateByContextAndPurpose('MEMBERSHIP', 'APPRECORDONLY', $membership->getForeignId('bank_account_id'), $membership->getId());
	}
	
	public function getSepaMandateForRegularDonation($regDon){
		if(!$regDon->getForeignId('bank_account_id')){
			return null;
		}
		return $this->getSepaMandateByContextAndPurpose('DONATOR', 'APPRECORDONLY', $regDon->getForeignId('bank_account_id'), $regDon->getId());
	}

	public function getSepaMandateByContextAndPurpose($context, $purpose, $bankAccountId, $objId=null){
		$result = $this->getByContextAndPurpose($context, $purpose, $bankAccountId, $objId);
		// @todo: check whether count(result) is possible -> recordset?
		if(!$result || count($result)==0){
			return null;
		}
		
		return $result->getForeignRecordBreakNull('sepa_mandate_id', Billing_Controller_SepaMandate::getInstance());
		
	}
	
	public function getBankAccountUsageForMembership($membership){
		if(!$membership->getForeignId('bank_account_id')){
			return null;
		}
		return $this->getByContextAndPurpose('MEMBERSHIP', 'APPRECORDONLY', $membership->getForeignId('bank_account_id'), $membership->getId());
	}
	
	public function getBankAccountUsageForRegularDonation($regDon){
		if(!$regDon->getForeignId('bank_account_id')){
			return null;
		}
		return $this->getByContextAndPurpose('DONATOR', 'APPRECORDONLY', $regDon->getForeignId('bank_account_id'), $regDon->getId());
	}
	
	public function getByContextAndPurpose($context, $purpose, $bankAccountId, $objId = null){
		 
		if(!is_null($objId)){
			switch($context){
				case 'MEMBERSHIP':
					return $this->_backend->getByPropertySet(
						array(
					    			'context_id' => $context,
					    			'usage_type' => $purpose,
									'bank_account_id' => $bankAccountId,
									'membership_id' => $objId
						)
					);
				case 'DONATOR':
					return $this->_backend->getByPropertySet(
						array(
					    			'context_id' => $context,
					    			'usage_type' => $purpose,
									'bank_account_id' => $bankAccountId,
									'regular_donation_id' => $objId
						)
					);
						
			}
		}
		return $this->_backend->getByPropertySet(
			array(
		    			'context_id' => $context,
		    			'usage_type' => $purpose,
				'bank_account_id' => $bankAccountId
			)
		);
	}
}
?>