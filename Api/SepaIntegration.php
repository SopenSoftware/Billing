<?php
class Billing_Api_SepaIntegration {
	private static $errorCounter = 0;
	public static function normalizeBankAccounts(){
		$limit = 400;
		\org\sopen\dev\DebugLogger::openLogFileAppend(CSopen::instance()->getConfigPath().'/logs/sepa-integrate.log');
		try{
			
			$dFilter = new Addressbook_Model_ContactFilter(array(array(
				'field' => 'query',
				'operator' => 'contains',
				'value' => ''
				)), 'AND');
			/*$dFilter = new Addressbook_Model_ContactFilter(array(array(
				'field' => 'contact_id',
				'operator' => 'in',
				'value' => array('100222', '100223')				)), 'AND');
			*/

				$contactIds = Addressbook_Controller_Contact::getInstance()->search(
					$dFilter,
					null,
					false,
					true
				);
				\org\sopen\dev\DebugLogger::log('Count adress ids: '. count($contactIds));
				$count = 0;
				foreach($contactIds as $contactId){
					/*if($count++ > $limit){
						break;
					}*/
					$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
					self::doSepa($contact);
					//$bankAccountCollection = Billing_Controller_Debitor::getInstance()->getBankAccountCollectionForDebitor($debitor);
				}
		}catch(Exception $e){
			\org\sopen\dev\DebugLogger::log('global error: '. $e->__toString());
		}
	}

	private static function doSepa($contact){
		try{
			
			$memberships = Membership_Controller_SoMember::getInstance()->getByContactId($contact->getId());
			foreach($memberships as $membership){
				$memKind = $membership->__get('membership_type');
				if($memKind == 'MEMBER_EX' || $memKind == 'INTERESTED'){
					continue;
				}
				if($memKind == 'MEMBER_GESCHENK'){
					$parentMembership = $membership->getForeignRecord('parent_member_id', Membership_Controller_SoMember::getInstance());
					$bankAccount = Billing_Api_BankAccount::getFromSoMember($parentMembership);
				}else{
					$bankAccount = Billing_Api_BankAccount::getFromSoMember($membership);
				}
				
				$objBankAccount = $bankAccount->convertSepa();
				if(!is_null($objBankAccount)){
					$usage = $objBankAccount->addUsageMembership($membership);
					$membership->__set('bank_account_id', $objBankAccount->getId());
					$membership->__set('bank_account_usage_id', $usage->getId());
					Membership_Controller_SoMember::getInstance()->update($membership);
					$paymentMethod = $bankAccount->getPaymentMethod();
					if($paymentMethod == 'DEBIT' || $paymentMethod == 'DEBIT_GM'){
						Billing_Controller_SepaMandate::getInstance()->generateSepaMandateForBankAccountUsage($usage);
					}
					
				}
			}

			$fundMasters = Donator_Controller_FundMaster::getInstance()->getAllByContactIdBreakNull($contact->getId());
			
			if(!is_null($fundMasters)){
				foreach($fundMasters as $fundMaster){
					if($fundMaster instanceof Donator_Model_FundMaster){
						//regular donations
						$regularDonations = Donator_Controller_RegularDonation::getInstance()->getByFundMasterId($fundMaster->getId());
						foreach($regularDonations as $regDon){
							if(!$regDon->__get('terminated') && !$regDon->__get('on_hold')){
								$bankAccount = Billing_Api_BankAccount::getFromRegularDonation($regDon);
								$objBankAccount = $bankAccount->convertSepa();
								if(!is_null($objBankAccount)){
									$usage = $objBankAccount->addUsageRegularDonation($regDon);
									$regDon->__set('bank_account_id', $objBankAccount->getId());
									$regDon->__set('bank_account_usage_id', $usage->getId());
									Donator_Controller_RegularDonation::getInstance()->update($regDon);
									$paymentMethod = $bankAccount->getPaymentMethod();
									if($paymentMethod == 'DEBIT' || $paymentMethod == 'DEBIT_GM'){
										Billing_Controller_SepaMandate::getInstance()->generateSepaMandateForBankAccountUsage($usage);
									}
								}
							}
						}
					}
				}
			}
				
			//$bankAccount = Billing_Api_BankAccount::getFromFundMaster($fundMaster);
			//$bankAccountCollection->attach($bankAccount);
				
			$bankAccount = Billing_Api_BankAccount::getFromContact($contact);
			$objBankAccount = $bankAccount->convertSepa();
			if(!is_null($objBankAccount)){
				$objBankAccount->addUsageAll();
			}
		}catch(Exception $e){
			\org\sopen\dev\DebugLogger::log('error '. (self::$errorCounter++) . ' contactId: ' . $contact->getId(). $e->getMessage());
			
			return;
		}
	}

}