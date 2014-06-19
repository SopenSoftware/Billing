<?php

class Billing_Api_BankAccount{

	const INVALID_NUMBER = 'INVALID_NUMBER';
	const INVALID_BANK_CODE = 'INVALID_BANK_CODE';

	private $number = null;
	private $name = null;
	private $bank = null;
	private $bankCode = null;
	private $iban = null;
	private $bic = null;
	private $bankId = null;
	private $contactId = null;
	private $countryCode = null;

	private $paymentMethod = null;

	public function __construct($number,$name,$bank,$bankCode, $paymentMethod = null){
		$this->setNumber($number);
		$this->setName($name);
		$this->setBank($bank);
		$this->setBankCode($bankCode);
		$this->setPaymentMethod($paymentMethod);
	}

	public static function createEmpty(){
		return new self(null,null,null,null);
	}

	public static function getByContext(){

	}

	public static function getFromPrioStack(){

	}

	public static function getFromContact(Addressbook_Model_Contact $contact){
		$obj = new self(
		$contact->__get('bank_account_number'),
		$contact->__get('bank_account_name'),
		$contact->__get('bank_name'),
		$contact->__get('bank_code')
		);
		$obj->setContactId($contact->getId());

		$countryCode = $contact->getLetterDrawee()->getPostalAddress()->getCountryCode('DE');
		$obj->setCountryCode($countryCode);
		if(trim($obj->getName())==''){
			$obj->setName($contact->__get('n_fileas'));
		}
		return $obj;
	}

	public static function getFromBatchJobDta(Billing_Model_BatchJobDta $batchJobDta){
		$obj = new self(
		$batchJobDta->__get('bank_account_number'),
		$batchJobDta->__get('bank_account_name'),
		$batchJobDta->__get('bank_name'),
		$batchJobDta->__get('bank_code')
		);
		return $obj;
	}

	public static function getFromSoMember(Membership_Model_SoMember $member){

		$obj = new self(
		$member->__get('bank_account_nr'),
		$member->__get('account_holder'),
		$member->__get('bank_name'),
		$member->__get('bank_code'),
		$member->getForeignId('fee_payment_method')
		);
		$obj->setContactId($member->getForeignId('contact_id'));
		$contact = $member->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
		$countryCode = $contact->getLetterDrawee()->getPostalAddress()->getCountryCode('DE');
		$obj->setCountryCode($countryCode);
		if(trim($obj->getName())==''){
			$obj->setName($contact->__get('n_fileas'));
		}

		return $obj;
	}

	public static function getFromFundMaster(Donator_Model_FundMaster $fundMaster){
		$obj = new self(
		$fundMaster->__get('bank_account_nr'),
		$fundMaster->__get('account_name'),
		$fundMaster->__get('bank_name'),
		$fundMaster->__get('bank_code'),
		$fundMaster->getForeignId('donation_payment_method')
		);
		$obj->setContactId($fundMaster->getForeignId('contact_id'));
		$contact = $fundMaster->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
		$countryCode = $contact->getLetterDrawee()->getPostalAddress()->getCountryCode('DE');
		$obj->setCountryCode($countryCode);
		if(trim($obj->getName())==''){
			$obj->setName($contact->__get('n_fileas'));
		}
		return $obj;
	}

	public static function getFromRegularDonation(Donator_Model_RegularDonation $regDon){
		$obj = new self(
		$regDon->__get('bank_account_nr'),
		$regDon->__get('account_name'),
		$regDon->__get('bank_name'),
		$regDon->__get('bank_code'),
		$regDon->getForeignId('donation_payment_method')
		);
		$fundMaster = $regDon->getForeignRecord('fundmaster_id', Donator_Controller_FundMaster::getInstance());
		$obj->setContactId($fundMaster->getForeignId('contact_id'));
		$contact = $fundMaster->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
		$countryCode = $contact->getLetterDrawee()->getPostalAddress()->getCountryCode('DE');
		$obj->setCountryCode($countryCode);
		if(trim($obj->getName())==''){
			$obj->setName($contact->__get('n_fileas'));
		}
		return $obj;
	}
	
	public static function createForContactAndIBAN($contactId, $iban, $accountName = null, $bankAccountId = null){
		
		$foundBankAccount = null;
		
		if($bankAccountId){
			$givenBankAccount = Billing_Controller_BankAccount::getInstance()->get($bankAccountId);
			$gContactId = $givenBankAccount->getForeignId('contact_id');
			if($gContactId != $contactId){
				$foundBankAccount = clone $givenBankAccount;
				$foundBankAccount->setId(null);
				$foundBankAccount->__set('contact_id', $contactId);
				$foundBankAccount = Billing_Controller_BankAccount::getInstance()->create($foundBankAccount);
			}else{
				$foundBankAccount = $givenBankAccount;
			}
		}
		
		if(!self::improveIBAN($iban)){
			throw new Exception('IBAN not valid');
		}
		
		$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
		$bankCode = self::getBankCodeFromIBAN($iban);
		$bankAccountNumber = self::getAccountNumberFromIBAN($iban);
		
		$banks = Billing_Controller_Bank::getInstance()->getBanksByBankCode($bankCode);

		if(count($banks)!=1){
			throw new Exception("No or not unique bic found for bank code: $this->getBankCode()");
		}

		$bank = $banks->getFirstRecord();
		
		if(is_null($foundBankAccount)){
			try{
				$foundBankAccounts = Billing_Controller_BankAccount::getInstance()->getByContactIdAndIBAN($contactId,$iban);
				if($foundBankAccounts->getCount()>0){
					$foundBankAccount = $foundBankAccounts->getFirstRecord();
				}
			}catch(Exception $e){
				//
			}
		}
		if(!is_null($foundBankAccount)){
			$bankAccount = $foundBankAccount;
		}else{
			$bankAccount = new Billing_Model_BankAccount();
		}

		$bankAccount->__set('bank_id', $bank->getId());
		$bankAccount->__set('contact_id', $contactId);
		$bankAccount->__set('iban', $iban);
		$bankAccount->__set('number',$bankAccountNumber);
		$name = $accountName;
		if(is_null($name) || $name==''){
			$name = $contact->__get('n_fileas');
		}
		$bankAccount->__set('name', $name);
		$bankAccount->__set('valid', 1);
		$bankAccount->__set('last_validated', new Zend_Date());
		$bankAccount->__set('is_iban_improved', 1);
			
		if($bankAccount->getId()){
			$bankAccount = Billing_Controller_BankAccount::getInstance()->update($bankAccount);
		}else{
			$bankAccount = Billing_Controller_BankAccount::getInstance()->create($bankAccount);
		}
		return $bankAccount;
		
	}

	public function convertSepa(){


		if(!$this->isValid()){
			return;
		}
		$db = Tinebase_Core::getDb();
		$tm = Tinebase_TransactionManager::getInstance();
		// start transaction
		$tId = $tm->startTransaction($db);
		try{

			$iban = self::calculateIBAN(
			$this->getCountryCode(),
			$this->getBankCode(),
			$this->getNumber()
			);

			/*if(!self::improveIBAN($iban, $debug)){
			 print_r($this);
			 $debug['ctr'] = $this->getCountryCode();
			 $debug['blz'] = $this->getBankCode();
			 $debug['kto'] = $this->getNumber();
			 	
			 var_dump($debug);
			 throw new Exception("IBAN: $iban is not valid");
			 }*/

			$banks = Billing_Controller_Bank::getInstance()->getBanksByBankCode($this->getBankCode());

			if(count($banks)!=1){
				throw new Exception("No or not unique bic found for bank code: $this->getBankCode()");
			}

			$bank = $banks->getFirstRecord();
			$foundBankAccount = null;
			try{
				$foundBankAccounts = Billing_Controller_BankAccount::getInstance()->getByContactIdAndIBAN($this->getContactId(),$iban);
				if($foundBankAccounts->getCount()>0){
					$foundBankAccount = $foundBankAccounts->getFirstRecord();
				}
			}catch(Exception $e){
				$num = $this->getNumber();
				$code = $this->getBankCode();
					
				echo "not found: $num -> $code \n";
				//throw $e;
			}
			if(!is_null($foundBankAccount)){
				$bankAccount = $foundBankAccount;
			}else{
				$bankAccount = new Billing_Model_BankAccount();

				$bankAccount->__set('bank_id', $bank->getId());
				$bankAccount->__set('contact_id', $this->getContactId());
				$bankAccount->__set('iban', $iban);
				$bankAccount->__set('number', $this->getNumber());
				$bankAccount->__set('bank_code', $this->getBankCode());
				$bankAccount->__set('bank_name', $bank->__get('name'));
				$bankAccount->__set('name', $this->getName());
				$bankAccount->__set('valid', 0);
				$bankAccount->__set('last_validated', new Zend_Date());
				$bankAccount->__set('is_iban_improved', 0);
					
				Billing_Controller_BankAccount::getInstance()->create($bankAccount);
			}

			$this->setIBAN($bankAccount->__get('iban'));
			$this->setBIC($bank->__get('bic'));
			$tm->commitTransaction($tId);
			
			return $bankAccount;
		}catch(Exception $e){
			$tm->rollBack($tId);
		}
		return null;
	}

	public static function getCountryCodeFromIBAN($iban){
		return substr($iban, 0,2);
	}
	
	public static function getProofNumberFromIBAN($iban){
		return substr($iban, 2,2);
	}
	
	public static function getBankCodeFromIBAN($iban){
		return substr($iban,4,8);
	}
	
	public static function getAccountNumberFromIBAN($iban){
		return substr($iban,12,10);
	}
	
	public static function improveIBAN($iban, &$debug){
		/*
		 IBAN: DE68 2105 0170 0012 3456 78
		 Umstellung: 2105 0170 0012 3456 78DE 68
		 Modulo: 210501700012345678131468 mod 97 = 1
		 */

		$countryNum = strval(ord(substr($iban,0,1))-55).strval(ord(substr($iban,1,1))-55);
		$swap = substr($iban,4,strlen($iban)-4).$countryNum.substr($iban,2,2);
		$res =(intval(bcmod($swap,"97")) == 1);
		$debug = array(
			'cnum' => $countryNum,
			'swap' => $swap,
			'res' => $res
		);
		return $res;
	}

	public static function calculateIBAN($country_str, $blz, $kto){
		/*
		 IBAN: DE00 2105 0170 0012 3456 78
		 Umstellung: 2105 0170 0012 3456 78DE 00
		 Modulo: 210501700012345678131400 mod 97 = 30
		 Subtraktion: 98 - 30 = 68
		 */

		// no guarantee: ibans validate correct, but must not be correct
		// correct ibans can only be given by bank
		$bban_str = str_pad($blz,8,"0",STR_PAD_LEFT).str_pad($kto,10,"0",STR_PAD_LEFT);
		$country_num = strval(ord(substr($country_str,0,1))-55).strval(ord(substr($country_str,1,1))-55)."00";
		$check_digit = str_pad(98-intval(bcmod($bban_str.$country_num,"97")),2,"0",STR_PAD_LEFT);
		return $country_str.$check_digit.$bban_str;
	}

	public function getNumber(){
		return $this->number;
	}

	public function setNumber($number){
		$this->number = (string) $number;
	}

	public function getName(){
		return $this->name;
	}

	public function setName($name){
		$this->name = (string) $name;
	}

	public function getBank(){
		return $this->bank;
	}

	public function setBank($bank){
		$this->bank = (string) $bank;
	}

	public function getBankCode(){
		return $this->bankCode;
	}

	public function setBankCode($bankCode){
		$this->bankCode = (string) str_replace(' ', '', $bankCode);
	}

	public function getPaymentMethod(){
		return $this->paymentMethod;
	}

	public function setPaymentMethod($paymentMethod){
		$this->paymentMethod = $paymentMethod;
	}

	public function setContactId($contactId){
		$this->contactId = $contactId;
	}

	public function getContactId(){
		return $this->contactId;
	}

	public function setIBAN($iban){
		$this->iban = $iban;
	}

	public function getIBAN(){
		return $this->iban;
	}

	public function setBIC($bic){
		$this->bic = $bic;
	}

	public function getBIC(){
		return $this->bic;
	}

	public function setBankId($bankId){
		$this->bankId = $bankId;
	}

	public function getBankId(){
		return $this->bankId;
	}

	public function setCountryCode($countryCode){
		$this->countryCode = strtoupper($countryCode);
	}

	public function getCountryCode(){
		return $this->countryCode;
	}

	public function validate(){

	}

	public function isValid(){
		//return true;
		try{
			$bankCodeValid = Billing_Controller_Bank::getInstance()->isExistingBankCode($this->getBankCode());
			if(
			strlen($this->getBankCode()) == 8
			//&& strlen($this->getBankCode()) <= 8
			&& ctype_digit($this->getBankCode())
			&& strlen($this->getNumber()) > 0
			&& strlen($this->getNumber()) <= 10
			&& ctype_digit($this->getNumber())){
				return true;
				 
			}
		}catch(Exception $e){
			return false;
		}
		return false;
	}

	private function isItemValid($att){
		if($att == 0){
			return false;
		}
		if($att == '0'){
			return false;
		}
		if($att == ''){
			return false;
		}
		if(is_null($att)){
			return false;
		}

		return true;

	}

	public function isValidForPaymentMethod($paymentMethod){
		return ($this->isValid() && $this->isUsedForPaymentMethod($paymentMethod));
	}

	public function hasPaymentMethod(){
		return !is_null($this->getPaymentMethod());
	}

	public function isUsedForPaymentMethod($paymentMethodId){
		if($this->getPaymentMethod() == $paymentMethodId){
			return true;
		}
		return false;
	}

	public function equals(Billing_Api_BankAccount $bankAccount){

		if(trim($bankAccount->getNumber()) !== trim($this->getNumber())){
			return false;
		}

		if(trim($bankAccount->getBankCode()) !== trim($this->getBankCode())){
			return false;
		}

		return true;
	}
}
