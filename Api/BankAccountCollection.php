<?php 

class Billing_Api_BankAccountCollection extends SplObjectStorage{
	
	public function hasPaymentMethod($paymentMethod){
		foreach($this as $bankAccount){
			if($bankAccount->getPaymentMethod()==$paymentMethod){
				return true;
			}
		}
		return false;
	}
	
	public function getFirstValidBankAccount(){
		foreach($this as $bankAccount){
			if($bankAccount->isValid()){
				return $bankAccount;
			}
		}
		throw new Exception('No Bank account for given payment method contained');
	}
	
	public function getFirstValidBankAccountForPaymentMethod($paymentMethod){
		foreach($this as $bankAccount){
			if(($bankAccount->isValid()) && ($bankAccount->getPaymentMethod()==$paymentMethod)){
				return $bankAccount;
			}
		}
		throw new Exception('No Bank account for given payment method contained');
	}
	
	public function getFirstValidBankAccountForPaymentMethods($aPaymentMethod){
		$aCheck = array_flip($aPaymentMethod);
		foreach($this as $bankAccount){
			$paymentMethod = $bankAccount->getPaymentMethod();
			if(($bankAccount->isValid()) && (array_key_exists($paymentMethod, $aCheck))){
				return $bankAccount;
			}
		}
		throw new Exception('No Bank account for given payment method contained');
	}
	
	public function getFirstBankAccountForPaymentMethod($paymentMethod){
		foreach($this as $bankAccount){
			if($bankAccount->getPaymentMethod()==$paymentMethod){
				return $bankAccount;
			}
		}
		throw new Exception('No Bank account for given payment method contained');
	}	
	
	
}