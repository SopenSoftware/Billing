<?php 
use Jejik\MT940\Reader;

class Billing_Import_MT940{
	
	public static function import($fileName){
		$result = array(
			'failcount' => 0,
			'totalcount' => 0,
			'duplicatecount' => 0,
			'status' => 'success'
		);
		
		try{

			$reader = new Reader();
		    $statements = $reader->getStatements(file_get_contents($fileName));
		     
		    foreach ($statements as $statement) {
		    	
		     	foreach ($statement->getTransactions() as $transaction) {
		            //echo $transaction->getAmount() . "\n";
		            $amount = (float)$transaction->getAmount();
		            $description = $transaction->getDescription();
		            $accountNumber = $statement->getAccount()->getNumber();
		            //echo $accountNumber;
		            
		            $num = null;
		            $debitorNr = null;
		            $memberNr = null;
		            $receiptNr = null;
		            $context = 'ERP';
		            $cdesc = strtolower($description);
		            $opNr = null;
		            $openItemId = null;
		            $debitorId = null;
		            $opId = null;
		            $type = null;
		            $state = 'RED';
		            $opAmount = 0;
		            $overpay = 0;
		            
		            if($amount<0){
		            	$type = 'DEBIT';
		            }else{
		            	$type = 'CREDIT';
		            }
		            
		            
			    
		            if(strpos($cdesc, 'mitg') || strpos($cdesc, 'tgli') || strpos($cdesc, 'beitr')){
		            	$context = 'MEMBERSHIP';
		            }elseif(strpos($cdesc, 'spend')){
		            	$context = 'DONATOR';
		            }
		            $isReturnDebit = false;
		            if(strpos($cdesc, 'rueckbelast')){
		            	$isReturnDebit = true;
		            }
		            
		            $numDesc = $transaction->getDescriptionConcat(1,7);
		           $numDescCheck = strtolower($numDesc);
		            $pos = strpos($numDescCheck, 'mitg');
		            if(!$pos){
		            	$pos = strpos($numDescCheck, 'tgli');
		            }
			    if(!pos){
			     	$pos = strpos($numDescCheck, 'beitr');
			    }
		            
			    if(!pos){
			     	$pos = strpos($numDescCheck, 'rech');
			    }
		            
		            
		            if($numDesc && $pos){
			     		if (preg_match('/([0-9]{5,7})/', substr($numDesc, $pos), $match)) {
				            $num = $match[1];
				        }
			        }
			        if($num && !$isReturnDebit){
			            	
			            if(strpos($cdesc, 'rech')){
			            	try{
			            		
			            		$receiptNr = $num;
			            	
			            		$receiptId = Billing_Controller_Receipt::getInstance()->getIdByProperty('invoice_nr',$num);
			            		$receipt = Billing_Controller_Receipt::getInstance()->get($receiptId);
			            		$context = $receipt->getForeignId('erp_context_id');
			            		$order = $receipt->getForeignRecordBreakNull('order_id', Billing_Controller_Order::getInstance());
			            		$debitor = $order->getForeignRecordBreakNull('debitor_id', Billing_Controller_Debitor::getInstance());
			            		if($debitor){
				            		$debitorId = $debitor->getId();
				            		$state = 'ORANGE';
				            		
				            		$openItems = Billing_Controller_OpenItem::getInstance()->getByDebitor($debitorId);
				            		foreach($openItems as $op){
				            			if($op->__get('state')!='DONE'){
				            				$openItem = $op;
				            				break;
				            			}
				            		}
				            		//$openItem = $openItems->getFirstRecord();
				            		
				            		$openItemId = $openItem->getId();
	
				            		$opAmount = $openItem->__get('open_sum');
			            		}
			            		
			            	if(abs($amount)>abs($opAmount)){
			            			$overpay = abs($amount) - abs($opAmount);
			            		}
			            		
			            		if($overpay==0){
			            			$state = 'GREEN';
			            		}
			            		/*if((float)abs($openItem->__get('total_brutto')) == (float)abs($amount)){
			            			$state = 'GREEN';
			            		}*/
			            		
			            	}catch(Exception $e){
			            		
			            	}
			            }elseif(strpos($cdesc, 'mitg')){
			            	$memberNr = $num;
			            	
			            	try{
			            		
			            		$member = Membership_Controller_SoMember::getInstance()->getSoMemberByMemberNr($memberNr);
			            		$contactId = $member->getForeignId('contact_id');
			            		$debitorId = Billing_Controller_Debitor::getInstance()->getIdByContactId($contactId);
			            		
								$state = 'ORANGE';
				            		
			            		$openItems = Billing_Controller_OpenItem::getInstance()->getByDebitor($debitorId);
			            		foreach($openItems as $op){
			            			if($op->__get('state')!='DONE'){
			            				$openItem = $op;
				            				break;
			            			}
			            		}
				            	//$openItem = $openItems->getFirstRecord();
				            	if($openItem){
				            		$openItemId = $openItem->getId();
				            		
									$opAmount = $openItem->__get('open_sum');
				            		
				            		if(abs($amount)>abs($opAmount)){
				            			$overpay = abs($amount) - abs($opAmount);
				            		}
				            		
				            		if($overpay==0){
				            			$state = 'GREEN';
				            		}
			            		}
			            		/*if((float)abs($openItem->__get('total_brutto')) == (float)abs($amount)){
			            			$state = 'GREEN';
			            		}*/
			            		
			            	}catch(Exception $e){
			            		
			            	}
			            }else{
			            		
			            	try{
			            		
			            		$contactId = (int)trim($num);	
			            		$debitorId = Billing_Controller_Debitor::getInstance()->getIdByContactId($contactId);
			            		$state = 'ORANGE';
			            		
			            		$openItems = Billing_Controller_OpenItem::getInstance()->getByDebitor($debitorId);
			            		
			            		foreach($openItems as $op){
			            			if($op->__get('state')!='DONE'){
			            				$openItem = $op;
				            				break;
			            			}
			            		}
			            		// changed behviour: was only correct in first period :-/
			            		//$openItem = $openItems->getFirstRecord();
			            		if($openItem){
			            			$openItemId = $openItem->getId();
			            			$opAmount = $openItem->__get('open_sum');
			            		}
			            	if(abs($amount)>abs($opAmount)){
			            			$overpay = abs($amount) - abs($opAmount);
			            		}
			            		
			            		if($overpay==0){
			            			$state = 'GREEN';
			            		}
			            		//if((float)abs($openItem->__get('total_brutto')) == (float)abs($amount)){
			            		//	$state = 'GREEN';
			            		//}
			            	}catch(Exception $e){
			            		
			            	}
			            }
		            }
		            
		            if($isReturnDebit){
		            	$returnDebitFee = (float) Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::DEBIT_RETURN_FEE); 
		            	
		            	if($num){
		            		$contactId = (int)trim($num);	
		            		$debitorId = null;
		            		try{
		            			$debitorId = Billing_Controller_Debitor::getInstance()->getIdByContactId($contactId);
		            			$state = 'ORANGE';
		            		}catch(Exception $e){
		            			$state = 'RED';
		            		}
		            		
		            		try{
			            		$toReturnPayment = Billing_Controller_Payment::getInstance()->getDebitToReturn(
				            		$debitorId,
				            		$amount,
				            		$returnDebitFee,
				            		'DEBIT'
				            	);
			            		$returnPaymentId = $toReturnPayment->getId();

			            		if($returnPaymentId && $debitorId && ($toReturnPayment->__get('is_cancelled') == false)){
			            			$state = 'GREEN';
			            		}
			            		
			            		if($toReturnPayment->__get('is_cancelled') == true){
			            			$returnPaymentId = null;
			            		}
		            		}catch(Exception $e){
		            			$returnPaymentId = null;
		            		}
		            	}
		            	
		            }
		            
		            $id = md5($cdesc);
		            try{
		            	$payment = Billing_Controller_MT940Payment::getInstance()->get($id);
		            }catch(Exception $e){
		            	$payment = Billing_Controller_MT940Payment::getInstance()->getEmptyMT940Payment();
		            	
		            	$bankAccount = Billing_Controller_AccountSystem::getInstance()->getDefaultBankAccount();
		            	$fordAccount = Billing_Controller_AccountSystem::getInstance()->getByNumber('14000');
		            	if(!$isReturnDebit){
			            	if($type == 'DEBIT'){
				            	$payment->__set('account_system_id', $bankAccount->getId());
				            	$payment->__set('account_system_id_haben', $fordAccount->getId());
			            	}else{
			            		$payment->__set('account_system_id', $fordAccount->getId());
				            	$payment->__set('account_system_id_haben', $bankAccount->getId());
			            	}
		            	}else{
		            		$debitSettleAccount = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_KTO_DEBITOR); 
		            		$payment->__set('account_system_id', $debitSettleAccount);
				            $payment->__set('account_system_id_haben', $bankAccount->getId());
				            $payment->__set('is_return_debit', true);
				            $payment->__set('print_inquiry', true);
				            $payment->__set('set_accounts_banktransfer', true);
				            
				            $payment->__set('return_inquiry_fee', $returnDebitFee);
				            $payment->__set('return_debit_base_payment_id', $returnPaymentId);
				            
		            	}
		            	$payment->__set('id', $id);
			            $payment->__set('erp_context_id',$context);
			            if($opNr){
			            	$payment->__set('op_nr',$opNr);
			            }
			            if($openItemId){
			            	$payment->__set('op_id',$openItemId);
			            	$payment->__set('due_date',new Zend_Date($openItem->__get('due_date')));
			            	$payment->__set('op_amount', $openItem->__get('total_brutto'));
			            }
			            if($debitorId){
			            	$payment->__set('debitor_id',$debitorId);
			            }
			            $payment->__set('type', $type);
			            $payment->__set('payment_date', new Zend_Date($transaction->getBookDate()->format('Y-m-d H:i:s')));
			            $payment->__set('payment_amount', abs($amount));
			            
			            $payment->__set('state', $state);
			            $payment->__set('usage_payment', $description);
			            $payment->__set('usage', $numDesc);
			            $payment->__set('overpay_amount', $overpay);
			            
			     		Billing_Controller_MT940Payment::getInstance()->create($payment);
		            }
		            
		        }
		    	
		        /*echo $statement->getOpeningBalance()->getAmount() . "\n";
		     
		        foreach ($statement->getTransactions() as $transaction) {
		            echo $transaction->getAmount() . "\n";
		        }
		     
		        echo $statement->getClosingBalance()->getAmount() . "\n";*/
		    
		    }
		    

		}catch(Exception $e){
			Tinebase_Core::getLogger()->notice(__METHOD__ . '::' . __LINE__ . ' ' . 'TD-Import - Es trat ein Fehler auf. Nicht ausgeführt.' . print_r($e->__toString(),true));
			$result['status'] = 'error';
			$result['errorInfo'] = $e->getMessage();
			$result['errorTrace'] = $e->getTrace();
		}
		
		return $result;
	}
}
?>