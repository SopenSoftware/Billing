<?php
/**
 * 
 * Controller AccountSystem
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_AccountSystem extends Tinebase_Controller_Record_Abstract
{
	const PRINT_ACTION_STATEMENT = 'PRINT_ACTION_STATEMENT';
	const PRINT_ACTION_SUMSALDATION = 'PRINT_ACTION_SUMSALDATION';
	
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
        $this->_backend = new Billing_Backend_AccountSystem();
        $this->_modelName = 'Billing_Model_AccountSystem';
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
     * @return Billing_Model_AccountSystem
     */
    public function getEmptyAccountSystem(){
     	$emptyBrevet = new Billing_Model_AccountSystem(null,true);
     	return $emptyAccountSystem;
    }
    
    public function getDefaultBankAccount(){
    	try{
    		return $this->_backend->getByPropertySet(array(
    				'is_default_bank_account' => 1,
    				'is_bank_account' => 1
    			),
    			false,
    			true
    		);
    	}catch(Exception $e){
    		return null;
    	}
    }
    
    public function getByNumber($number){
    	return $this->_backend->getByProperty($number, 'number');
    }
    
	public function getSums($filter, $fromDate = null, $untilDate = null, $accountIds, &$select){
		return $this->_backend->getSums($filter, $fromDate, $untilDate, $accountIds, &$select);	
	}
	
	public function getSummation(array $aFilter, $fromDate = null, $untilDate = null, array $accountIds = null, &$select){
		
		$filter = new Billing_Model_AccountSystemFilter(array(), 'AND');
        $filter->setFromArrayInUsersTimezone($aFilter);
		
		$total = $this->getSums($filter, $fromDate, $untilDate, $accountIds, &$select);
		$totalCount = $this->_backend->searchCount($filter, $fromDate, $untilDate);
		
		return array(
			'total' => $total['credit_total'] - $total['debit_total'],
			'debit_total' => $total['debit_total'],
			'credit_total' => $total['credit_total'],
			'totalcount' => $totalCount
		);
		
	}
	
	public function getAccountSaldationAt($accountId, $saldoDate){
		$aSaldo = $this->getSummation(array(), null, $saldoDate, array($accountId));
	}
	
	public function getAccountSaldationWithin($accountId, $beginDate, $endDate){
		
	}
	
	public function getSusaSummation($accountSystemId = null, $accountClassId = null, $fromDate = null, $untilDate = null ){
				
		// sums from begin
		$filter = array();
		
		if($accountSystemId){
			$filter[] = array(
				'field' => 'id',
				'operator' => 'equals',
				'value' => $accountSystemId
			);
		}
		
		if($accountClassId){
			$filter[] = array(
				'field' => 'account_class_id',
				'operator' => 'equals',
				'value' => $accountClassId
			);
		}
		
		$result = array();
		
		$result['from_begin'] = $this->getSummation($filter, null, $untilDate);
		
		$result['actual'] = $this->getSummation($filter, $fromDate, $untilDate);
		
		return $result;
		// sums from previous period
		
		
		
		// sums from actual period
		
		
		
	}
	
	public function getAccountSystemsAsSimpleArray(){
    	$rows = $this->getAll('number','ASC');
    	if($rows){
    		$aResult = array();
	    	$rows->translate();
	    	
	    	foreach($rows as $row){
	    		$aResult[] = array(
	    			$row->getId(),
	    			$row->__get('number').' '.$row->__get('name')
	    		);
	    	}
	    	return $aResult;
    	}
    	// return empty arra
    	return array();
    }
    
    public function getByClassId($classId){
    	return $this->_backend->getByPropertySet(array('account_class_id' => $classId), false, false, 'number');
    	
    }
    
    public function printFibu($filters, $data, $accountBookingFilters){
    	set_time_limit(0);
		ignore_user_abort(true);
		
    	$definition = Billing_Custom_PrintFibuDefinition::create($filters,$data, $accountBookingFilters);
    	
    	$action = $definition->getPrintAction();
    	
    	$filters = $definition->getFilters();
    	$filter = new Billing_Model_AccountSystemFilter($filters, 'AND');
    	$paging = new Tinebase_Model_Pagination(array('sort' => 'number', 'dir' => 'ASC'));
    	
    	
    	
    	if($action == 'PRINT_ACTION_STATEMENT'){
	    	$accountIds = $this->search($filter, $paging, false, true);
	    	
	    	$beginDate = $definition->getStartDate(new Zend_Date());
	    	
	    	$beginSaldoDate = $definition->getStartDate(new Zend_Date());
	    	$beginSaldoDate->subDay(1);
	    	
	    	$endDate = $definition->getEndDate(new Zend_Date());
	    	
	    	$processArray = array();
	    	
	    	foreach($accountIds as $accountId){
	    		$account = $this->get($accountId);
	    		
	    		
	    		$accountBookingFilters = $definition->getAccountBookingFilters();
	    		
	    		$accountBookingFilters[] = array(
	    			'field' => 'account_system_id',
	    			'operator' => 'AND',
	    			'value' => array(array(
	    				'field' => 'id',
	    				'operator' => 'equals',
	    				'value' => $accountId
	    			))
	    		);
	    		
	    		$accountBookingFilters[] = array(
	    			'field' => 'booking_date',
	    			'operator' => 'afterOrAt',
	    			'value' => $beginDate->toString('yyyy-MM-dd')
	    		);
	    		
	    		$accountBookingFilters[] = array(
	    			'field' => 'booking_date',
	    			'operator' => 'beforeOrAt',
	    			'value' => $endDate->toString('yyyy-MM-dd')
	    		);
	    		
	    		$accountBookingFilter = new Billing_Model_AccountBookingFilter($accountBookingFilters, 'AND');
	    		$paging = new Tinebase_Model_Pagination(array('sort' => array('booking_date','booking_id'), 'dir' => 'ASC'));
	    		$accountBookingIds = Billing_Controller_AccountBooking::getInstance()->search($accountBookingFilter, $paging, false, true);
	
	    		$count = count($accountBookingIds);
	    		$account = $this->get($accountId);
	    		$credSum = 0;
	    		$debSum = 0;
	    		
	    		
	    		$aBeginSaldoFilter = array();
	    		
	    		$select = null;
	    		$aBeginSaldo = $this->getSummation(array(), null, $beginSaldoDate, array($accountId), &$select);
	    		
	    		$values = Billing_Custom_PrintFibuHelper::accountBookingsToExternalArray($accountBookingIds, &$debSum, &$credSum);
	    		
	    		//exit;
	    		$beginSaldo = $aBeginSaldo['total'] + $account->__get('begin_credit_saldo') - $account->__get('begin_debit_saldo');
	    		$beginSaldoS = ($beginSaldo<0?number_format(abs($beginSaldo),2,',','.'):'');
	    		$beginSaldoH = ($beginSaldo>=0?number_format(abs($beginSaldo),2,',','.'):'');
	    		
	    		$endSaldo = $beginSaldo + $credSum - $debSum;
	    		$endSaldoS = ($endSaldo<0?number_format(abs($endSaldo),2,',','.'):'');
	    		$endSaldoH = ($endSaldo>=0?number_format(abs($endSaldo),2,',','.'):'');
	    		
	    		$resultSum = $endSaldo - $beginSaldo;
	    		$resultF = number_format($resultSum,2,',','.');
	    		
	    		$processArray[] = array(
		    		'values'=> $values,
		    		'sums' => array(),
		    		'header' => array(
		    			'number' => $account->__get('number'),
		    			'name' => $account->__get('name'),
	    				'begin_saldo' => number_format($beginSaldo,2,',','.'),	 
	    				'begin_saldo_h' => $beginSaldoH,
	    				'begin_saldo_s' => $beginSaldoS,
	    				'end_saldo' => number_format($endSaldo,2,',','.'),
	    			   	'end_saldo_h' => $endSaldoH,
	    				'end_saldo_s' => $endSaldoS,
	    				'change_sum' => $resultF,
		    			'begin_date' =>  $beginDate->toString('dd.MM.yyyy'),
			    		'end_date' => $endDate->toString('dd.MM.yyyy'),
	    				'deb_sum_f' => ($debSum!=0?number_format($debSum,2,',','.'):''),
	    				'cred_sum_f' => ($credSum!=0?number_format($credSum,2,',','.'):''),
	    				'count' => $count
	    		));
	    		
	    	}
		}elseif($action == 'PRINT_ACTION_ADD1'){
			$beginDate = $definition->getStartDate(new Zend_Date());
			$period = $beginDate->get(Zend_Date::YEAR);
			$values = $this->getDonationAndMemberFeeSums($period, $definition, &$fixValues, &$resultArray);

			$processArray[] = array(
				'values' => $resultArray,
				'sums' => array(),
				'header' => $fixValues
			);
			
		
			
		}elseif($action == 'PRINT_ACTION_ADD2'){
			$beginDate = $definition->getStartDate(new Zend_Date());
			$period = $beginDate->get(Zend_Date::YEAR);
			$values = $this->printLists($period, $definition,&$processArray);

			
		
			
		}else{
    		// get account classes
    		$classes = Billing_Controller_AccountClass::getInstance()->getAll('key', 'ASC');
    		
    		
    		$processArray = array();
    		$arr = array();
    		foreach($classes as $class){
    			
    			// get accounts within class
    			try{
					$classAccounts = $this->getByClassId($class->getId());
    			}catch(Exception $e){
    				continue;
    			}
				$result = $this->getSusaSummation(null, $class->getId(), $definition->getSusaBeginDate(), $definition->getSusaEndDate() );
					
				/**
				 * 
				 * 
				from_begin and actual 
				array(
					'total' => $total['credit_total'] - $total['debit_total'],
					'debit_total' => $total['debit_total'],
					'credit_total' => $total['credit_total'],
					'totalcount' => $totalCount
				)
				 * 
				 */
				
				$arr[] = array(
					'class' => $class->__get('key') . ' ' . $class->__get('name'),
					'account' => '',
					'total1' => ($result['from_begin']['total']!=0?number_format($result['from_begin']['total'],2,',','.'):''),
					'debit_total1' => ($result['from_begin']['debit_total']!=0?number_format($result['from_begin']['debit_total'],2,',','.'):''),
					'credit_total1' => ($result['from_begin']['credit_total']!=0?number_format($result['from_begin']['credit_total'],2,',','.'):''),
					'totalcount1' => ($result['from_begin']['totalcount']!=0?number_format($result['from_begin']['totalcount'],2,',','.'):''),
					'total2' => ($result['actual']['total']!=0?number_format($result['actual']['total'],2,',','.'):''),
					'debit_total2' => ($result['actual']['debit_total']!=0?number_format($result['actual']['debit_total'],2,',','.'):''),
					'credit_total2' => ($result['actual']['credit_total']!=0?number_format($result['actual']['credit_total'],2,',','.'):''),
					'totalcount2' => ($result['actual']['totalcount']!=0?number_format($result['actual']['totalcount'],2,',','.'):'')
				);
				
				foreach($classAccounts as $account){

					$result = $this->getSusaSummation($account->getId(), null, $definition->getSusaBeginDate(), $definition->getSusaEndDate() );
					
					$arr[] = array(
						'class' => '',
						'account' => $account->__get('number').' '.$account->__get('name'),
						'total1' => ($result['from_begin']['total']!=0?number_format($result['from_begin']['total'],2,',','.'):''),
						'debit_total1' => ($result['from_begin']['debit_total']!=0?number_format($result['from_begin']['debit_total'],2,',','.'):''),
						'credit_total1' => ($result['from_begin']['credit_total']!=0?number_format($result['from_begin']['credit_total'],2,',','.'):''),
						'totalcount1' => ($result['from_begin']['totalcount']!=0?number_format($result['from_begin']['totalcount'],2,',','.'):''),
						'total2' => ($result['actual']['total']!=0?number_format($result['actual']['total'],2,',','.'):''),
						'debit_total2' => ($result['actual']['debit_total']!=0?number_format($result['actual']['debit_total'],2,',','.'):''),
						'credit_total2' => ($result['actual']['credit_total']!=0?number_format($result['actual']['credit_total'],2,',','.'):''),
						'totalcount2' => ($result['actual']['totalcount']!=0?number_format($result['actual']['totalcount'],2,',','.'):'')
						);
				}
				
    			
    		}
    		$processArray[] = array(
    			'values' => $arr,
    			'sums' => array(),
    			'header' => array()
    		);
    		
    	}
    	$outputType = 'pdf';
    	try{
    		$outputType = $definition->getOutputType();
    	}catch(Exception $e){
    		
    	}
    	
   		if(in_array($action, array('PRINT_ACTION_ADD2')) && $outputType == "excel"){
   			Billing_Controller_Excel::getInstance()->export($processArray, $definition);
   		}else{
    		Billing_Controller_PrintFibu::getInstance()->printResult($processArray, $definition);
   		}
    	
    	
    	
    	
    	
    }
	
	public function getDonationAndMemberFeeSums($period, $definition, &$fixValues, &$resultValues){
	
		$values = array(
			'VOR' => array(),
			'JETZT' => array(),
			'NACH' => array()
		);
		
		$fixValues = array(
			'prev_period' => ($period - 1),
			'now_period' => $period,
			'next_period' => $period +1
		);
		
		$periods = array(
			'VOR' => ($period - 1),
			'JETZT' => $period,
			'NACH' =>  $period +1
		);
		
		$result = array(
			
		);
		
		// Mitgliederbeiträge nach Beitragsgruppen:
		
		$date = new Zend_Date();
		$date->setYear($period);
		$beginDate = $definition->getStartDate(new Zend_Date());
		$endDate = $definition->getEndDate(new Zend_Date());
		/*$beginDate = clone $date;
		$endDate = clone $date;
		
		$beginDate->setMonth(1);
		$beginDate->setDay(1);
		
		$endDate->setMonth(12);
		$endDate->setDay(31);*/
		
		$baseOpFilter = array();
		$baseDonationFilter = array();
		
		$baseOpFilter[] = array(
			'field' => 'payment_date',
			'operator' => 'afterOrAt',
			'value' => $beginDate->toString('yyyy-MM-dd')
		);
		$baseOpFilter[] = array(
			'field' => 'payment_date',
			'operator' => 'beforeOrAt',
			'value' => $endDate->toString('yyyy-MM-dd')
		);
		
		$baseOpFilter[] = array(
			'field' => 'state',
			'operator' => 'not',
			'value' => 'OPEN'
		);
		
		$baseDonationFilter[] = array(
			'field' => 'donation_date',
			'operator' => 'afterOrAt',
			'value' => $beginDate->toString('yyyy-MM-dd')
		);
		$baseDonationFilter[] = array(
			'field' => 'donation_date',
			'operator' => 'beforeOrAt',
			'value' => $endDate->toString('yyyy-MM-dd')
		);
		
		$baseOpFilter = new Billing_Model_OpenItemFilter($baseOpFilter,'AND');
		$baseDonationFilter = new Donator_Model_DonationFilter($baseDonationFilter,'AND');
		
		$feeGroups = Membership_Controller_FeeGroup::getInstance()->getAllFeeGroups('key');
		
		$feeGroupSum = 0;
		$resultValues = array();
		$nowSum = $previousSum = $nextSum = $totalDonationSum = 0;
		foreach($feeGroups as $feeGroup){
			$opFilter = null;
			$opFilter = clone $baseOpFilter;
			$opFilter->addFilter($opFilter->createFilter('fee_group_id','equals',$feeGroup->__get('id'),'rc'));
			
			$innerArray = array();
			$innerArray['bg_name'] = $feeGroup->__get('name');
			
			foreach($values as $key => $value){
				$innerOpFilter = null;
				$innerOpFilter = clone $opFilter;
				switch($key){
				
					case 'VOR':
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'less',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$sums = Billing_Controller_OpenItem::getInstance()->getSummation($innerOpFilter);
						$payedSum = $sums['payed_sum'];
						$innerArray['previous'] = number_format($payedSum,2,',','.');
						$previousSum += $payedSum;
						break;
				
					case 'JETZT':
					
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'equals',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$sums = Billing_Controller_OpenItem::getInstance()->getSummation($innerOpFilter);
						$payedSum = $sums['payed_sum'];
						$innerArray['now'] = number_format($payedSum,2,',','.');
						$nowSum += $payedSum;
						break;
					
					case 'NACH':
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'greater',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$sums = Billing_Controller_OpenItem::getInstance()->getSummation($innerOpFilter);
						$payedSum = $sums['payed_sum'];
						$innerArray['next'] = number_format($payedSum,2,',','.');
						$nextSum += $payedSum;
						break;
				}
				
			
			}
			$donationFilter = clone $baseDonationFilter;
			$donationFilter->addFilter($donationFilter->createFilter('fee_group_id','equals',$feeGroup->__get('id')));
				$donationFilter->addFilter($donationFilter->createFilter('period','equals',$period));
			// get Donation summation
			$sums = Donator_Controller_Donation::getInstance()->searchCount($donationFilter);
			$donationSum = $sums['sum'];
			$innerArray['donation'] = number_format($donationSum,2,',','.');
			$totalDonationSum += $donationSum;
			$resultValues[] = $innerArray;
		}
		
		// Spenden verarbeiten:
		
		$SFeeGroupSum = 0;
		//$result['S'] = array();
		/*foreach($feeGroups as $feeGroup){
			$donationFilter = clone $baseDonationFilter;
			$donationFilter->addFilter($donationFilter->createFilter('fee_group_id','equals',$feeGroup->__get('id')));
				$donationFilter->addFilter($donationFilter->createFilter('period','equals',$period));
			// get Donation summation
			$sums = Donator_Controller_Donation::getInstance()->searchCount($donationFilter);
			$donationSum = $sums['sum'];
			$result['SPENDE'.$feeGroup->__get('key')] = number_format($payedSum,2,',','.');
			$SFeeGroupSum += $donationSum;
		}*/
		
		//-->
		// Summe auslesen für Nichtmitglieder (Filter: is_member=false)
		
		//$group = new Tinebase_Model_Filter_FilterGroup(array(),'OR');
		
		$donationFilter = clone $baseDonationFilter;
		$donationFilter->addFilter($donationFilter->createFilter('is_member','equals',0));
		$donationFilter->addFilter($donationFilter->createFilter('period','equals',$period));
		
		/*$group->addFilterGroup($donationFilter);
		
		$donationFilter2 = clone $baseDonationFilter;
		$donationFilter2->addFilter($donationFilter->createFilter('fee_group_id','equals',''));
		$donationFilter2->addFilter($donationFilter->createFilter('period','equals',$period));
		
		$group->addFilterGroup($donationFilter);*/
		
		$sums = Donator_Controller_Donation::getInstance()->searchCount($donationFilter);
		$donationSum = $sums['sum'];
		$totalDonationSum += $donationSum;
		$result['SPENDE'.'NOMEMBER'] = number_format($donationSum,2,',','.');
		//<--
		$resultValues[] = array(
			'bg_name' => 'Nichtmitglieder',
			'previous' => 0,
			'now' => 0,
			'next' => 0,
			'donation' => number_format($donationSum,2,',','.')
		);
		
		$fixValues['sum_prev'] = number_format($previousSum,2,',','.');
		$fixValues['sum_now'] = number_format($nowSum,2,',','.');
		$fixValues['sum_next'] = number_format($nextSum,2,',','.');
		$fixValues['sum_donation'] = number_format($totalDonationSum,2,',','.');
		
		return $resultValues;
		
	}
	
	
	public function printLists($period, $definition,&$processArray){
	set_time_limit(0);
	ignore_user_abort(true);
		$processArray = array();
		
		$values = array(
			'VOR' => array(),
			'JETZT' => array(),
			'NACH' => array()
		);
		
		$fixValues = array(
			'prev_period' => ($period - 1),
			'now_period' => $period,
			'next_period' => $period +1
		);
		$periods = array(
			'VOR' => ($period - 1),
			'JETZT' => $period,
			'NACH' =>  $period +1
		);
		$res = array(
			'VOR' => array(),
			'JETZT' => array(),
			'NACH' => array()
		);
		
		// Mitgliederbeiträge nach Beitragsgruppen:
		
		$date = new Zend_Date();
		$date->setYear($period);
		$beginDate = $definition->getStartDate(new Zend_Date());
		$endDate = $definition->getEndDate(new Zend_Date());
		/*$beginDate = clone $date;
		$endDate = clone $date;
		
		$beginDate->setMonth(1);
		$beginDate->setDay(1);
		
		$endDate->setMonth(12);
		$endDate->setDay(31);*/
		
		$baseOpFilter = array();
		$baseDonationFilter = array();
		
		$baseOpFilter[] = array(
			'field' => 'payment_date',
			'operator' => 'afterOrAt',
			'value' => $beginDate->toString('yyyy-MM-dd')
		);
		$baseOpFilter[] = array(
			'field' => 'payment_date',
			'operator' => 'beforeOrAt',
			'value' => $endDate->toString('yyyy-MM-dd')
		);
		
		$baseOpFilter[] = array(
			'field' => 'state',
			'operator' => 'not',
			'value' => 'OPEN'
		);
		
		$baseDonationFilter[] = array(
			'field' => 'donation_date',
			'operator' => 'afterOrAt',
			'value' => $beginDate->toString('yyyy-MM-dd')
		);
		$baseDonationFilter[] = array(
			'field' => 'donation_date',
			'operator' => 'beforeOrAt',
			'value' => $endDate->toString('yyyy-MM-dd')
		);
		
		$baseOpFilter = new Billing_Model_OpenItemFilter($baseOpFilter,'AND');
		$baseDonationFilter = new Donator_Model_DonationFilter($baseDonationFilter,'AND');
		
		$feeGroups = Membership_Controller_FeeGroup::getInstance()->getAllFeeGroups('key');
		
		$feeGroupSum = 0;
		$resultValues = array();
		$nowSum = $previousSum = $nextSum = $totalDonationSum = 0;
		
		$opPaging = new Tinebase_Model_Pagination(array('sort' => array('payment_date','pay.debitor_id'), 'dir' => 'ASC'));
		$bgMap = array();
		foreach($feeGroups as $feeGroup){
			$opFilter = null;
			$opFilter = clone $baseOpFilter;
			$opFilter->addFilter($opFilter->createFilter('fee_group_id','equals',$feeGroup->__get('id'),'rc'));
			
			$innerArray = array();
			$innerArray['bg_name'] = $feeGroup->__get('name');
			$bgMap[$feeGroup->__get('name')] = $feeGroup->__get('key');
			
			foreach($values as $key => $value){
				$innerOpFilter = null;
				$innerOpFilter = clone $opFilter;
				switch($key){
				
					case 'VOR':
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'less',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$ids = Billing_Controller_OpenItem::getInstance()->search($innerOpFilter, $opPaging, false,true);
						$res['VOR'][$feeGroup->__get('name')] = $ids;
				
					case 'JETZT':
					
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'equals',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$ids = Billing_Controller_OpenItem::getInstance()->search($innerOpFilter, $opPaging, false,true);
						$res['JETZT'][$feeGroup->__get('name')] = $ids;
						break;
					
					case 'NACH':
						$innerOpFilter->addFilter($innerOpFilter->createFilter(
							'period',
							'greater',
							$period,
							'rc' // do never forget alias if necessary!!
						));
						$ids = Billing_Controller_OpenItem::getInstance()->search($innerOpFilter, $opPaging, false,true);
						$res['NACH'][$feeGroup->__get('name')] = $ids;
				}
				
			
			}
			
		}
		
		foreach($res as $key => $bgOps){
			foreach($bgOps as $bgName => $ops){
				$items = array();
				$total = 0;
				foreach($ops as $opId){
				//var_dump($opId);
					
					$openItem = Billing_Controller_OpenItem::getInstance()->get($opId);
					$debi = $openItem->getForeignRecord('debitor_id', Billing_Controller_Debitor::getInstance());
					$contact = $debi->getForeignRecord('contact_id', Addressbook_Controller_Contact::getInstance());
					$openSum = $openItem->__get('open_sum');
					$payedSum = $openItem->__get('payed_sum');
					/*##CNR##
##COMPANY##
##LASTNAME##
##FORENAME##
##DDATE##
##USAGE##
##AMOUNT##
*/

					$items[] = array(
						'CNR' => $contact->__get('id'),
						'COMPANY' => $contact->__get('org_name'),
						'LASTNAME' => $contact->__get('n_family'),
						'FORENAME' => $contact->__get('n_given'),
						'SDATE' =>  \org\sopen\app\util\format\Date::format($openItem->__get('receipt_date')),
						'PDATE' =>  \org\sopen\app\util\format\Date::format($openItem->__get('payment_date')),
						'USAGE' => $openItem->__get('usage'),
						'TOTAL' => number_format($openItem->__get('total_brutto'),2,',','.'),
						'PAYED' => number_format($payedSum ,2,',','.'),
						'OPEN' => number_format($openSum ,2,',','.')
					);
					
					$total += $payedSum ;
					
					
				}
				$processArray[] = array(
					'values' => $items,
					'sums' => array(),
					'header' => array(
						'BGKEY' => $bgMap[$bgName],
						'BGNAME' => $bgName,
						'PERIOD' => $periods[$key],
						'total' => $total
					)
				);
			}
		}

	}
}
?>