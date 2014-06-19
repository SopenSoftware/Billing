<?php
/**
 * 
 * Template data extractor class for ERP
 * @author hhartl
 *
 */
class Billing_Custom_Template{
	/**
	 * 
	 * Check whether current donation has to be printed
	 * @param Billing_Model_Receipt $donation
	 * @param string $templateId
	 */
	public static function isToPrint($obj=null, $type, &$templateId){
		$templateId = $obj->__get('template_id');
		if($templateId){
			return true;
		}
		
				switch($type){
			case Billing_Controller_Print::TYPE_CALCULATION:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_CALCULATION);
				return true;
			case Billing_Controller_Print::TYPE_BID:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_BID);
				return true;
			case Billing_Controller_Print::TYPE_CONFIRM:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_CONFIRM);
				return true;
			case Billing_Controller_Print::TYPE_SHIPPING:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_SHIPPING);
				return true;
			case Billing_Controller_Print::TYPE_INVOICE:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_INVOICE);
				return true;
			case Billing_Controller_Print::TYPE_CREDIT:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_CREDIT);
				return true;
			case Billing_Controller_Print::TYPE_MONITION:
				$monitionLevel = (int)$obj->__get('monition_level');
				$contact = $obj->getContact();
				$member = Addressbook_Controller_Contact::getInstance()->getMember($contact->getId());
				if($member){
					$memKind = $member->getForeignRecord('membership_type', Membership_Controller_MembershipKind::getInstance());
					switch($monitionLevel){
						case 0:
						case 1:
							$templateId = $memKind->getForeignId('monition1_template_id');
							break;
							
						case 2:
							$templateId = $memKind->getForeignId('monition2_template_id');
							break;
							
						case 3:
						default:
							$templateId = $memKind->getForeignId('monition3_template_id');
							break;
							
					}
				}else{
					switch($monitionLevel){
						case 0:
						case 1:
							$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_MONITION1);
							break;
							
						case 2:
							$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_MONITION2);
							break;
							
						case 3:
						default:
							$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_MONITION3);
							break;
							
					}
				}
				
				return true;
			case Billing_Controller_Print::TYPE_QUERY:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_QUERY);
				return true;
			case Billing_Controller_Print::TYPE_OFFER:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_OFFER);
				return true;
			case Billing_Controller_Print::TYPE_ORDER:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_ORDER);
				return true;
			case Billing_Controller_Print::TYPE_INCINVOICE:
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_INCINVOICE);
				return true;				
		}
	}
	
	/**
	 * 
	 * Get data objects from given array of objects
	 * 
	 * @param array $dataObjects
	 * @param Addressbook_Model_Contact $contact
	 * @param Billing_Model_Receipt 	$receipt
	 * @param Billing_Model_Job 		$job
	 * @param Billing_Model_Order 		$order
	 * @param Billing_Model_Debitor 	$debitor
	 * @param Billing_Model_Creditor 	$creditor
	 * @param array $sums
	 * @param array $aPositions
	 * @param array $sumTable
	 */
	protected static function getDataObjects(
		$dataObjects, 
		&$contact, 
		&$receipt, 
		&$job,
		&$order, 
		&$debitor,
		&$creditor,
		&$sums, 
		&$aPositions, 
		&$sumTable,
		&$sumData,
		&$addData)
	{
		$contact = $dataObjects['contact'];
		$receipt = $dataObjects['receipt'];
		$order = $dataObjects['order'];
		$positions = $dataObjects['positions'];
		$sums = $dataObjects['sums'];
		$debitor = null;
		if(array_key_exists('debitor', $dataObjects)){
			$debitor = $dataObjects['debitor'];
		}
		$creditor = null;
		if(array_key_exists('creditor', $dataObjects)){
			$creditor = $dataObjects['creditor'];
		}
		
		$job = $order->__get('job_id');
		$addData = array();
		
		if(!$receipt->isMonition()){
			$aPositions = array();
			$posData = array();
			$sum1Netto = 0;
			$sum1Brutto = 0;
			$sum2Netto = 0;
			$sum2Brutto = 0;
			$sumDonation = 0;
			foreach($positions as $pos){
				$unitTotalNetto = $pos['price_netto'] + $pos['price2_netto'];
				$unitTotalBrutto = $pos['price_brutto'] + $pos['price2_brutto'];
				
				$sum1Netto +=  $pos['total1_netto'];
				$sum1Brutto +=  $pos['total1_brutto'];
				$sum2Netto +=  $pos['total2_netto'];
				$sum2Brutto +=  $pos['total2_brutto'];
				$sumDonation += $pos['donation_amount'];
				$desc = $pos['description'];
				$result = array(
						'nr' => $pos['position_nr'],
						'amount' => $pos['amount'],
						'unit' => $pos['unit_id']['name'],
						'article_nr' => $pos['article_id']['article_nr'],
						'article_name' => $pos['name'],
						'article_desc' => $pos['description'],
						'crlf_article_desc' => '<text:line-break/>'.preg_replace('/$\R?^/m', '<text:line-break/>', $desc),
						'comment' => $pos['comment'],
						'crlf' => '<text:line-break/>',
						'crlf_comment' => '<text:line-break/>'.str_replace(chr(13).chr(10), '<text:line-break/>', $pos['comment']),
						'unit_price_netto' => number_format($pos['price_netto'],2,',','.'),
						'unit_price_brutto' => number_format($pos['price_brutto'],2,',','.'),
						'unit_price2_netto' => number_format($pos['price2_netto'],2,',','.'),
						'unit_price2_brutto' => number_format($pos['price2_brutto'],2,',','.'),
						'unit_total_netto' => number_format($unitTotalNetto,2,',','.'),
						'unit_total_brutto' => number_format($unitTotalBrutto,2,',','.'),
						'price_netto' => number_format($pos['total_netto'],2,',','.'),
						'price_brutto' => number_format($pos['total_brutto'],2,',','.'),
						'donation_amount' => number_format($pos['donation_amount'],2,',','.'),
						'vat' => $pos['vat_id']['name'],
						'price1_netto' => number_format($pos['total1_netto'],2,',','.'),
						'price1_brutto' => number_format($pos['total1_brutto'],2,',','.'),
						'price2_netto' => number_format($pos['total2_netto'],2,',','.'),
						'price2_brutto' => number_format($pos['total2_brutto'],2,',','.'),
						'vat2' => $pos['price2_vat_id']['name'],
						'discount_percentage' => $pos['discount_percentage'],
						'add_perc' => $pos['add_percentage'],
						'discount_total' => number_format($pos['discount_total'],2,',','.')
					);
	
				$posData['p'.$pos['position_nr'].'_brutto'] = number_format($pos['total_brutto'],2,',','.');
	
				$additionalData = Zend_Json::decode($pos['additional_data']);
				if(is_array($additionalData)){
					foreach($additionalData as $key => $value){
						$result[$key] = $value;
					}
				}
				$aPositions[] = $result;
			}
			
			$sumTable = array ('POSITIONS' => array(),'SUM' => array(), 'POSDATA' => $posData);
			foreach($sums['vat_sums'] as $sum){
				$sumTable['POSITIONS'][] = array(
					'vn_vatindex' => number_format($sum['sum']['vatindex'],1,',','.'),
					'vn_netto' => number_format($sum['sum']['netto'],2,',','.'),
					'vn_vat' =>  number_format($sum['sum']['vat'],2,',','.'),
					'vn_brutto' =>  number_format($sum['sum']['brutto'],2,',','.')
				);
			}
			
			$sumTable['SUM'][] = array(
				'netto1_sum' => number_format($sum1Netto,2,',','.'),
				'brutto1_sum' => number_format($sum1Brutto,2,',','.'),
				'netto2_sum' => number_format($sum2Netto,2,',','.'),
				'brutto2_sum' => number_format($sum2Brutto,2,',','.'),
				'vn_netto_sum' =>  number_format($sums['total']['sum']['netto'],2,',','.'),
				'vn_vat_sum' => number_format($sums['total']['sum']['vat'],2,',','.'),
				'vn_brutto_sum' =>number_format($sums['total']['sum']['brutto'],2,',','.')
			);
			
			$sumData = array(
				'netto1_sum' => number_format($sum1Netto,2,',','.'),
				'donation_sum' => number_format($sumDonation,2,',','.'),
				'brutto1_sum' => number_format($sum1Brutto,2,',','.'),
				'netto2_sum' => number_format($sum2Netto,2,',','.'),
				'brutto2_sum' => number_format($sum2Brutto,2,',','.'),
				'vn_netto_sum' =>  number_format($sums['total']['sum']['netto'],2,',','.'),
				'vn_vat_sum' => number_format($sums['total']['sum']['vat'],2,',','.'),
				'vn_brutto_sum' =>number_format($sums['total']['sum']['brutto'],2,',','.')
			);
			
		}elseif($receipt->isMonition()){
			
			$aPositions = array();
			$posData = array();
			$sum = 0;
			$sumExcludingMaxOp = 0;
			$maxOp = null;
			
			foreach($positions as $pos){
				
				$opId = $pos['open_item_id'];
				
				$op = Billing_Controller_OpenItem::getInstance()->get($opId);
				
				$receipt = $op->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
				$additionalData = $receipt->getAdditionalData();
				
				$usage = $op->__get('usage');
				$opNr = $op->__get('op_nr');
				$sum+=(float)$pos['open_sum'];
				
				$result = array(
					'created_at' => (float)strftime('YmdHMS',$receipt->__get('creation_time')),
					'op_nr' => $opNr,
					'usage' => $usage,
					'open_sum' => $pos['open_sum'],
					'open_f' => number_format($pos['open_sum'],2,',','.'),
					'monition_stage' => $pos['monition_stage'],
					'due_date' => \org\sopen\app\util\format\Date::format($pos['due_date']),
				);
				
				$result = array_merge($additionalData, $result);
				
				
				if(is_null($maxOp) || $result['created_at']>$maxOp['created_at']){
					$maxOp = $result;
				}
				
				$aPositions[] = $result;
				
			}
			
			$sumExcludingMaxOp = $sum-(float)$maxOp['open_sum'];
			$addData = array(
				'lastop' => $maxOp,
				'sum' => number_format($sum,2,',','.'),
				'sum2' => ($sumExcludingMaxOp>0?number_format($sumExcludingMaxOp,2,',','.'):'')
			);
		}
	}
	
	/**
	 * 
	 * Extract and provide data to be delivered to template
	 * @param array $dataObjects
	 * @param array $textBlocks	Reference to template inherent textblocks (can be manipulated here)
	 */
	protected static function getUniversalReceiptData( array $dataObjects, &$textBlocks){
		self::getDataObjects(
			$dataObjects, 
			&$contact, 
			&$receipt, 
			&$job, 
			&$order, 
			&$debitor, 
			&$creditor, 
			&$sums, 
			&$aPositions, 
			&$sumTable,
			&$sumData,
			&$addData)
		;
		
		$letterDrawee = $contact->getLetterDrawee();
		$shippingDrawee = $contact->getShippingDrawee();
		$invoiceDrawee = $contact->getInvoiceDrawee();
		$alternativeShippingDrawee = '';

		if($invoiceDrawee !== $shippingDrawee){
			$alternativeShippingDrawee = 'Lieferung an:'.chr(13).chr(10).$shippingDrawee->toText(true);
		}
		$totalBrutto = $sums['total']['sum']['brutto'];
		$monitionFee = $receipt->__get('monition_fee');
		$totalSum = $totalBrutto + $monitionFee;
		
		// overwrite payment conditions, if these are set in the record
		// otherwise use text from docmanager template
		$paymentMethod = $receipt->getForeignRecord('payment_method_id', Billing_Controller_PaymentMethod::getInstance());
		
		// if order state: PAYED -> get tb2 from payment method otherwise tb2
		if($order->__get('payment_state') == 'PAYED'){
			$textBlocks['ZAHLUNGSBEDINGUNGEN'] = $paymentMethod->__get('text1');
		}else{
			$textBlocks['ZAHLUNGSBEDINGUNGEN'] = $paymentMethod->__get('text2');
		}
		if($receipt->__get('payment_conditions')){
			$textBlocks['ZAHLUNGSBEDINGUNGEN'] = $receipt->__get('payment_conditions');
		}
		
		$sumPositions = $sumTable['POSITIONS'];
		$aVat = array();
		foreach($sumPositions as $sp){
			$name = (string)'vat'.(floor($sp['vn_vatindex']));
			$aVat[$name] = $sp['vn_vat'];
		}
		
		$userContact = $dataObjects['userContact'];
		$user = $dataObjects['user'];
		$userName = $userContact->__get('n_family');
		
		$payerName = $contact->__get('n_fileas');
		$payerBankAccountNumber = $contact->__get('bank_account_number');
		$payerBankCode = $contact->__get('bank_code');
		$payerBankAccountName = $contact->__get('bank_account_name');
		$payerBankName = $contact->__get('bank_name');
		
		$cpInvoiceDrawee = $contact->getInvoiceDrawee()->toText();
		$cpShippingDrawee = $contact->getShippingDrawee()->toText();

		if($receipt->hasAdditionalItem('contactPersonId')){
			try{
				
				$contactPerson = Addressbook_Controller_ContactPerson::getInstance()->get((int)$receipt->getAdditionalItem('contactPersonId'));
				
				$cpInvoiceDrawee = $contact->getInvoiceDrawee()->setContactPerson($contactPerson)->toText();
				$cpShippingDrawee = $contact->getShippingDrawee()->setContactPerson($contactPerson)->toText();
	
			}catch(Exception $e){
				echo $e;
				exit;
				//
			}
			
		}
		
		$result = array(
			// optional: job
			'JOB_NR' => ($job? $job->__get('job_nr'):null),
			// order
			'ORDER_NR' => $order->__get('order_nr'),
			// calculation
			'CALC_NR' => $receipt->__get('calc_nr'),
			// bid
			'BID_NR' => $receipt->__get('bid_nr'),
			'BID_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('bid_date')),
			'BID_SHIP_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('bid_shipping_date')),
			// order confirmation (AB: Auftragsbestätigung)
			'CONFIRM_NR' => $receipt->__get('confirm_nr'),
			'CONFIRM_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('order_confirm_date')),
			// invoice (R: Rechnung)
			'INV_NR' => $receipt->__get('invoice_nr'),
			'INV_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('invoice_date')),
			'DUE_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('due_date')),
			
			'CUST_NR' => $debitor->__get('debitor_nr'),
			// shipping doc (L: Lieferschein)
			'SHIP_NR' => $receipt->__get('ship_nr'),
			'SHIP_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('shipping_date')),
			'CREDIT_NR' => $receipt->__get('credit_nr'),
			'CREDIT_DATE' => \org\sopen\app\util\format\Date::format($receipt->__get('credit_date')),
			
			'MONITION_NR' => $receipt->__get('monition_nr'),
			'MONITION_LEVEL' => $receipt->__get('monition_level'),
			'MONITION_DATE' => strftime('%d.%m.%Y'),
		
			// additional texts
			'TEXT1' =>  $receipt->__get('upper_textblock'),
			'TEXT2' =>  $receipt->__get('lower_textblock'),
			'SHIPPING_COND' => $receipt->__get('shipping_conditions'),
			'PAYMENT_COND' => $receipt->__get('payment_conditions'),
		
			// date-time
			'TODAY' => strftime('%d.%m.%Y'),
			'NOW' => strftime('%d.%m.%Y %H:%M:%S'),
		
			// contact data
			'CONTACT' => $contact,
			'CONTACT_NR' => $contact->__get('id'),
			'ADRESS' => array(
				'ALTERNATIVE_SHIPPING_DRAWEE' => $alternativeShippingDrawee,
				'LETTER_DRAWEE' => $contact->getLetterDrawee()->toText(),
				'SHIPPING_DRAWEE' => $contact->getShippingDrawee()->toText(),
				'INVOICE_DRAWEE' => $contact->getInvoiceDrawee()->toText(),
				'SALUTATION' => $contact->__get('letter_salutation'),
				'AP_INVOICE_DRAWEE' => $cpInvoiceDrawee,
				'AP_SHIPPING_DRAWEE' => $cpShippingDrawee
			),
			'POSDATA' => $sumTable['POSDATA'],
			'POS_TABLE' => $aPositions,
			'SUM_TABLE' => $sumTable,
			'VALUES' => array_merge(array(
				'vn_netto_sum' =>  number_format($sums['total']['sum']['netto'],2,',','.'),
				'vn_vat_sum' => number_format($sums['total']['sum']['vat'],2,',','.'),
				'vn_brutto_sum' =>number_format($sums['total']['sum']['brutto'],2,',','.'),
				'add_perc' => $receipt->__get('add_percentage')
				),
				$aVat
			),
			'SUMS' => $sumData,
			'monition_fee' => number_format($monitionFee,2,',','.'),
			'total_sum' => number_format($totalSum,2,',','.'),
			'USER' => array(
				'N' => $userName,
				'NUPPER' => strtoupper($userName),
				'NFULL' => $userContact->__get('n_fileas'),
				'NFORE' => $userContact->__get('n_given'),
				'NLAST' => $userContact->__get('n_family'),
				'PHONE' => $userContact->__get('tel_work'),
				'FAX' =>  $userContact->__get('tel_fax'),
				'MAIL' =>  $userContact->__get('email')
			),
			'INVOICE_DRAWEE' => $invoiceDrawee->toText(true),
			'PAYER_NAME' => $payerName,
			'P_ACC' => $payerBankAccountNumber,
			'P_ACCOUNT_NAME' => $payerBankAccountName,
			'P_ACCOUNT_NR' => $payerBankAccountNumber,
			'P_BANK_CODE' => $payerBankCode,
			'P_BANK_NAME' => $payerBankName,
			
			// debitor
			'UST_ID' => $debitor->__get('ust_id')
	
			//'draw_image' => '/srv/www/vhosts/dev/projects/sopen/web/cv/customize/data/template/images/pdf/white.gif'
		);
		$additionalData = $receipt->getAdditionalData();
		/*if(is_array($additionalData)){
			if(array_key_exists('BALANCE', $additionalData)){
				if((float)$additionalData['BALANCE']<0){
					$additionalData['REMINDER'] = 'Wir erinnern höflich an den noch ausstehenden Jahresbeitrag 2012:';
					$additionalData['remind'] = number_format(abs((float)$additionalData['BALANCE']),2,',','.') . ' EUR';
				}elseif((float)$additionalData['BALANCE']>0){
					$additionalData['REMINDER'] = 'davon bereits bezahlt:';
					$additionalData['remind'] = number_format(abs((float)$additionalData['BALANCE']),2,',','.') . ' EUR';
				}
			}
			$result = array_merge($result, $additionalData );
		}*/
		if(is_array($additionalData)){
			if(array_key_exists('OPEN', $additionalData)){
				if((float)$additionalData['OPEN']>0){
					$additionalData['OPEN_EUR'] = $additionalData['OPEN_EUR'].' EUR';
					//$additionalData['REMINDER'] = 'Wir erinnern höflich an den noch ausstehenden Jahresbeitrag 2012:';
					//$additionalData['remind'] = number_format(abs((float)$additionalData['BALANCE']),2,',','.') . ' EUR';
				}else{
					$additionalData['OPEN_EUR'] = '';
				}
			}
			$result = array_merge($result, $additionalData );
		}
		
		$result = array_merge($result, $addData);
		
		//print_r($result);
		//exit;
		return $result;
	}
	
	/**
	 * 
	 * Get data for invoice
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getInvoiceData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$job, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get data for invoice
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getMonitionData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$job, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get data for calculation
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getCalculationData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get order confirmation data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getABData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get shipping doc data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getShippingData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$job, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get bid data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public static function getBidData(array $dataObjects, &$textBlocks){
		self::getDataObjects($dataObjects, &$contact, &$receipt, &$job, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = self::getUniversalReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	
	
	/**
	 * 
	 * Get data for supply receipt
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	protected function getUniversalSupplyReceiptData( array $dataObjects, &$textBlocks){
		$this->getDataObjects(
			$dataObjects, 
			&$contact, 
			&$receipt, 
			&$job, 
			&$order, 
			&$debitor, 
			&$creditor, 
			&$sums, 
			&$aPositions, 
			&$sumTable)
		;
		$letterDrawee = $contact->getLetterDrawee();
		$shippingDrawee = $contact->getShippingDrawee();
		$invoiceDrawee = $contact->getInvoiceDrawee();
		$alternativeShippingDrawee = '';
//		print_r($invoiceDrawee);
//		print_r($shippingDrawee);
//		exit;
		if($invoiceDrawee !== $shippingDrawee){
			$alternativeShippingDrawee = 'Lieferung an:'.chr(13).chr(10).$shippingDrawee->toText(true);
		}
		return array(
			// optional: job
			'JOB_NR' => ($job? $job->__get('job_nr'):null),
			// supply order
			'ORDER_NR' => $order->__get('order_nr'),
			'SUPPLIER_ORDER_NR' => $receipt->__get('supplier_order_nr'),
		
			// request (Lieferantenanfrage)
			'SP_REQUEST_NR' => $receipt->__get('supply_request_nr'),
			'REQEST_DATE' => $receipt->__get('request_date'),
		
			// offer (Lieferantenangebot)
			'SP_OFFER_NR' => $receipt->__get('supply_offer_nr'),
			'OFFER_DATE' => $receipt->__get('offer_date'),
			'OFFER_SHIPPING_DATE' => $receipt->__get('offer_shipping_date'),
		
			// order (Lieferantenauftrag)
			'SP_ORDER_NR' => $receipt->__get('supply_order_nr'),
			'ORDER_SHIPPING_DATE' => $receipt->__get('order_shipping_date'),
			'ORDER_CONFIRM_DATE' => $receipt->__get('order_confirm_date'),
			'ORDER_DATE' => $receipt->__get('order_date'),
			
			// inc invoice (Eingangsrechnung)
			'SP_INV_NR' => $receipt->__get('supply_inc_inv_nr'),
			'SP_INV_DATE' => $receipt->__get('inc_invoice_date'),
			'SP_INV_POSTAL_DATE' => $receipt->__get('inc_invoice_postal_date'),
			
			// shipping
			'SHIPPING_DATE' => $receipt->__get('shipping_date'),
			'SHIPPING_ADDRESS' => $receipt->__get('shipping_address'),
		
			'BID_DATE' => $receipt->__get('bid_date'),
			'BID_SHIP_DATE' => $receipt->__get('bid_shipping_date'),
			// order confirmation (AB: Auftragsbestätigung)
			'CONFIRM_NR' => $receipt->__get('confirm_nr'),
			'CONFIRM_DATE' => $receipt->__get('order_confirm_date'),
			// invoice (R: Rechnung)
			'INV_NR' => $receipt->__get('invoice_nr'),
			'INV_DATE' => $receipt->__get('invoice_date'),
			'CUST_NR' => $debitor->__get('debitor_nr'),
			// shipping doc (L: Lieferschein)
			'SHIP_NR' => $receipt->__get('ship_nr'),
			'SHIP_DATE' => $receipt->__get('shipping_date'),
			
			// additional texts
			'TEXT1' =>  $receipt->__get('upper_textblock'),
			'TEXT2' =>  $receipt->__get('lower_textblock'),
			'SHIPPING_COND' => $receipt->__get('shipping_conditions'),
			'SHIPPING_COND' => $receipt->__get('payment_conditions'),
		
			// date-time
			'TODAY' => strftime('%d.%m.%Y'),
			'NOW' => strftime('%d.%m.%Y %H:%M:%S'),
		
			// contact data
			'KONTAKT' => $contact,
			'ADRESS' => array(
				'LETTER_DRAWEE' => $letterDrawee->toText(true),
				'SHIPPING_DRAWEE' => $shippingDrawee->toText(true),
				'INVOICE_DRAWEE' => $invoiceDrawee->toText(true),
				'SALUTATION' => $contact->__get('letter_salutation')
			),
			'POS_TABLE' => $aPositions,
			'SUM_TABLE' => $sumTable
		);
	}
	
	/**
	 * 
	 * Get supply query data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public function getQueryData(array $dataObjects, &$textBlocks){
		$this->getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = $this->getUniversalSupplyReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get supply offer data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public function getOffer(array $dataObjects, &$textBlocks){
		$this->getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = $this->getUniversalSupplyReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get supply order data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public function getOrderData(array $dataObjects, &$textBlocks){
		$this->getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = $this->getUniversalSupplyReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
	
	/**
	 * 
	 * Get supply incoming invoice data
	 * @param array $dataObjects
	 * @param unknown_type $textBlocks
	 */
	public function getIncInvoiceData(array $dataObjects, &$textBlocks){
		$this->getDataObjects($dataObjects, &$contact, &$receipt, &$order, &$debitor, &$creditor, &$sums, &$aPositions, &$sumTable);
		$result = $this->getUniversalSupplyReceiptData($dataObjects, &$textBlocks);
		// if further data required
		// add to result here -->
		
		//..
		return $result;
	}
}
?>