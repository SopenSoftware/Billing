<?php
/**
 * sopen
 *
 * @package     Billing
 * @subpackage  Frontend
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Hans-Jürgen Hartl
 * @copyright   Copyright (c) 2011 sopen GmbH (http://www.sopen.de)
 * @version     $Id:  $
 *
 */

/**
 * backend class for Zend_Json_Server
 *
 * This class handles all Json requests for the Billing application
 *
 * @package     Billing
 * @subpackage  Frontend
 */
class Billing_Frontend_Json extends Tinebase_Frontend_Json_Abstract
{
    /**
     * app name
     * 
     * @var string
     */
    protected $_applicationName = 'Billing';    

    public function __construct()
	{
		/*
		Billing_Controller_Vat::getInstance() = Billing_Controller_Vat::getInstance();
		Billing_Controller_ArticleUnit::getInstance() = Billing_Controller_ArticleUnit::getInstance();
		Billing_Controller_ArticleGroup::getInstance() = Billing_Controller_ArticleGroup::getInstance();
		Billing_Controller_PriceGroup::getInstance() = Billing_Controller_PriceGroup::getInstance();
		Billing_Controller_StockLocation::getInstance()  = Billing_Controller_StockLocation::getInstance();
		Billing_Controller_Creditor::getInstance()  = Billing_Controller_Creditor::getInstance();
		Billing_Controller_Debitor::getInstance()  = Billing_Controller_Debitor::getInstance();
		Billing_Controller_Article::getInstance()  = Billing_Controller_Article::getInstance();
		Billing_Controller_ArticleSupplier::getInstance()  = Billing_Controller_ArticleSupplier::getInstance();
		Billing_Controller_ArticleCustomer::getInstance()  = Billing_Controller_ArticleCustomer::getInstance();
		Billing_Controller_SellPrice::getInstance()  = Billing_Controller_SellPrice::getInstance();
		Billing_Controller_Job::getInstance()  = Billing_Controller_Job::getInstance();
		Billing_Controller_Order::getInstance()  = Billing_Controller_Order::getInstance();
		Billing_Controller_SupplyOrder::getInstance()  = Billing_Controller_SupplyOrder::getInstance();
		Billing_Controller_Receipt::getInstance()  = Billing_Controller_Receipt::getInstance();
		Billing_Controller_OrderPosition::getInstance() = Billing_Controller_OrderPosition::getInstance();
		Billing_Controller_ReceiptPosition::getInstance() = Billing_Controller_ReceiptPosition::getInstance();
		Billing_Controller_SupplyReceipt::getInstance()  = Billing_Controller_SupplyReceipt::getInstance();
		Billing_Controller_SupplyOrderPosition::getInstance() = Billing_Controller_SupplyOrderPosition::getInstance();
		Billing_Controller_ProductionCost::getInstance() = Billing_Controller_ProductionCost::getInstance();
		Billing_Controller_OrderTemplate::getInstance()  = Billing_Controller_OrderTemplate::getInstance();
		Billing_Controller_OrderTemplatePosition::getInstance() = Billing_Controller_OrderTemplatePosition::getInstance();
		Billing_Controller_OpenItem::getInstance() = Billing_Controller_OpenItem::getInstance();
		Billing_Controller_StockFlow::getInstance() = Billing_Controller_StockFlow::getInstance();
		Billing_Controller_ArticleSupply::getInstance() = Billing_Controller_ArticleSupply::getInstance();
		Billing_Controller_PaymentMethod::getInstance() = Billing_Controller_PaymentMethod::getInstance();
		Billing_Controller_Payment::getInstance() = Billing_Controller_Payment::getInstance();
		Billing_Controller_DebitorAccount::getInstance() = Billing_Controller_DebitorAccount::getInstance();
		*/
	}
	
	// Context
	public function getContext($id){
		if(!$id ) {
			$obj = Billing_Controller_Context::getInstance()->getEmptyContext();
		} else {
			$obj = Billing_Controller_Context::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchContexts($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Context::getInstance(),'Billing_Model_ContextFilter');
	}

	public function deleteContexts($ids){
	}
	
	public function saveContext($recordData){
		return $this->_save($recordData, Billing_Controller_Context::getInstance(), 'Context');
	}
	
 	public function getContextsAsSimpleArray(){
    	return Billing_Controller_Context::getInstance()->getContextsAsSimpleArray();
    }
    
    public function getContexts(){
    	return Billing_Controller_Context::getInstance()->getAllContexts();
    }
	
	// AccountClass
	public function getAccountClass($id){
		if(!$id ) {
			$obj = Billing_Controller_AccountClass::getInstance()->getEmptyAccountClass();
		} else {
			$obj = Billing_Controller_AccountClass::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchAccountClasss($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_AccountClass::getInstance(),'Billing_Model_AccountClassFilter');
	}

	public function deleteAccountClasss($ids){
	}
	
	public function saveAccountClass($recordData){
		return $this->_save($recordData, Billing_Controller_AccountClass::getInstance(), 'AccountClass');
	}
	
// Bank
	public function getBank($id){
		if(!$id ) {
			$obj = Billing_Controller_Bank::getInstance()->getEmptyBank();
		} else {
			$obj = Billing_Controller_Bank::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBanks($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Bank::getInstance(),'Billing_Model_BankFilter');
	}

	public function deleteBanks($ids){
	}
	
	public function saveBank($recordData){
		return $this->_save($recordData, Billing_Controller_Bank::getInstance(), 'Bank');
	}
	
	// BankAccount
	public function getBankAccount($id){
		if(!$id ) {
			$obj = Billing_Controller_BankAccount::getInstance()->getEmptyBankAccount();
		} else {
			$obj = Billing_Controller_BankAccount::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBankAccounts($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BankAccount::getInstance(),'Billing_Model_BankAccountFilter');
	}

	public function deleteBankAccounts($ids){
	}
	
	public function saveBankAccount($recordData){
		return $this->_save($recordData, Billing_Controller_BankAccount::getInstance(), 'BankAccount');
	}
	
	public function updateBankAccountAndSepaMandate($bankAccountId, $iban, $bankAccountName, $sepaMandateId, $sepaMandateSignatureDate){
		try{
			$bankAccount = Billing_Controller_BankAccount::getInstance()->updateBankAccountFromIbanAndAccountName($bankAccountId, $iban, $bankAccountName);
			
			$sepaMandate = Billing_Controller_SepaMandate::getInstance()->updateSignatureDate($sepaMandateId, $sepaMandateSignatureDate);
			
			return array(
				'state' => 'success',
				'data' => array(
					'bankAccount' => $bankAccount->toArray(true),
					'sepaMandate' => $sepaMandate->toArray(true)
				)
			);
		}catch(Exception $e){
			return array(
				'state' => 'failure',
				'data' => null
			);
		}
		
	}
	/*
	 
	 
	  method: 'Billing.updateBankAccountAndSepaMandate',
	                bankAccountId: bankAccountId,
	                iban:  iban,
	                bankAccountName: bankAccountName,
	                sepaMandateId: sepaMandateId,
	                sepaMandateSignatureDate: sepaMandateSignatureDate
	  
	 */
	
	// BankAccountUsage
	public function getBankAccountUsage($id){
		if(!$id ) {
			$obj = Billing_Controller_BankAccountUsage::getInstance()->getEmptyBankAccountUsage();
		} else {
			$obj = Billing_Controller_BankAccountUsage::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBankAccountUsages($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BankAccountUsage::getInstance(),'Billing_Model_BankAccountUsageFilter');
	}

	public function deleteBankAccountUsages($ids){
	}
	
	public function saveBankAccountUsage($recordData){
		return $this->_save($recordData, Billing_Controller_BankAccountUsage::getInstance(), 'BankAccountUsage');
	}
	
// SepaCreditor
	public function getSepaCreditor($id){
		if(!$id ) {
			$obj = Billing_Controller_SepaCreditor::getInstance()->getEmptySepaCreditor();
		} else {
			$obj = Billing_Controller_SepaCreditor::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSepaCreditors($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SepaCreditor::getInstance(),'Billing_Model_SepaCreditorFilter');
	}

	public function deleteSepaCreditors($ids){
	}
	
	public function saveSepaCreditor($recordData){
		return $this->_save($recordData, Billing_Controller_SepaCreditor::getInstance(), 'SepaCreditor');
	}
	
	// SepaMandate
	public function getSepaMandate($id){
		if(!$id ) {
			$obj = Billing_Controller_SepaMandate::getInstance()->getEmptySepaMandate();
		} else {
			$obj = Billing_Controller_SepaMandate::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSepaMandates($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SepaMandate::getInstance(),'Billing_Model_SepaMandateFilter');
	}

	public function deleteSepaMandates($ids){
	}
	
	public function saveSepaMandate($recordData){
		return $this->_save($recordData, Billing_Controller_SepaMandate::getInstance(), 'SepaMandate');
	}
	
	public function removeAllSepaMandatesForContactId($contactId){
		
		try{
			$deleted = Billing_Controller_SepaMandate::getInstance()->removeAllSepaMandatesForContactId($contactId);
			return array(
				'state' => 'success',
				'deleted' => $deleted
			);
		}catch(Exception $e){
			return array(
				'state' => 'failure',
				'errorInfo' => $e->__toString()	
			);
		}
	}
	
	// AccountSystem
	public function getAccountSystem($id){
		if(!$id ) {
			$obj = Billing_Controller_AccountSystem::getInstance()->getEmptyAccountSystem();
		} else {
			$obj = Billing_Controller_AccountSystem::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchAccountSystems($filter,$paging){
		$preserveFilter = $filter;
		$result = $this->_search($filter,$paging,Billing_Controller_AccountSystem::getInstance(),'Billing_Model_AccountSystemFilter');
		
		
		$aResult = Billing_Controller_AccountSystem::getInstance()->getSummation($preserveFilter);
		/*$result['total_netto'] = $aResult['total_netto'];
        $result['total_brutto'] = $aResult['global_brutto'];
        $result['totalcount'] = $aResult['totalcount'];
		*/
		$aResult['total'] = $aResult['credit_total'] - $aResult['debit_total'];
        return array_merge($result, $aResult);
        
		//return $this->_search($filter,$paging,Billing_Controller_AccountSystem::getInstance(),'Billing_Model_AccountSystemFilter');
	}

	public function deleteAccountSystems($ids){
	}
	
	public function saveAccountSystem($recordData){
		return $this->_save($recordData, Billing_Controller_AccountSystem::getInstance(), 'AccountSystem');
	}
	
	
	// Booking
	public function getBooking($id){
		if(!$id ) {
			$obj = Billing_Controller_Booking::getInstance()->getEmptyBooking();
		} else {
			$obj = Billing_Controller_Booking::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBookings($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Booking::getInstance(),'Billing_Model_BookingFilter');
	}

	public function deleteBookings($ids){
		return $this->_delete($ids, Billing_Controller_Booking::getInstance());
	}
	
	public function saveBooking($recordData){
		return $this->_save($recordData, Billing_Controller_Booking::getInstance(), 'Booking');
	}
	
	public function improveBookingsValid(){
		return Billing_Controller_Booking::getInstance()->improveBookingsValid();
	}
	
	public function renewBookingForBillableReceipt($receiptId){
		try{
    		$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId(receiptId);
    	}catch(Exception $e){
    		Billing_Controller_OpenItem::getInstance()->onBillableReceiptCreated(Billing_Controller_Receipt::getInstance()->get($receiptId));
    		//Tinebase_Event::fireEvent(new Billing_Events_BillableReceiptCreated(Billing_Controller_Receipt::getInstance()->get($_record->getId())));
	    }
		
		//return Billing_Controller_Booking::getInstance()->renewBookingForBillableReceipt($receiptId);
	}
	
	// AccountBooking
	public function getAccountBooking($id){
		if(!$id ) {
			$obj = Billing_Controller_AccountBooking::getInstance()->getEmptyAccountBooking();
		} else {
			$obj = Billing_Controller_AccountBooking::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchAccountBookings($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_AccountBooking::getInstance(),'Billing_Model_AccountBookingFilter');
	}

	public function deleteAccountBookings($ids){
		return $this->_delete($ids, Billing_Controller_AccountBooking::getInstance());
	}
	
	public function saveAccountBooking($recordData){
		return $this->_save($recordData, Billing_Controller_AccountBooking::getInstance(), 'AccountBooking');
	}
	
	public function multiCreateAccountBookings($bookingId, $data){
		try{
			Billing_Controller_AccountBooking::getInstance()->multiCreateAccountBookings($bookingId, $data);
			return array(
				'success' => true,
				'result' => null
			);
		}catch(Exception $e){
			return array(
				'success' => false,
				'result' => null
			);
		}
		
	}
	
	
	
	// 	BookingTemplate
	public function getBookingTemplate($id){
		if(!$id ) {
			$obj = Billing_Controller_BookingTemplate::getInstance()->getEmptyBookingTemplate();
		} else {
			$obj = Billing_Controller_BookingTemplate::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBookingTemplates($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BookingTemplate::getInstance(),'Billing_Model_BookingTemplateFilter');
	}

	public function deleteBookingTemplates($ids){
		return $this->_delete($ids, Billing_Controller_BookingTemplate::getInstance());
	}
	
	public function saveBookingTemplate($recordData){
		return $this->_save($recordData, Billing_Controller_BookingTemplate::getInstance(), 'BookingTemplate');
	}
	
	// AccountBookingTemplate
	public function getAccountBookingTemplate($id){
		if(!$id ) {
			$obj = Billing_Controller_AccountBookingTemplate::getInstance()->getEmptyAccountBookingTemplate();
		} else {
			$obj = Billing_Controller_AccountBookingTemplate::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchAccountBookingTemplates($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_AccountBookingTemplate::getInstance(),'Billing_Model_AccountBookingTemplateFilter');
	}

	public function deleteAccountBookingTemplates($ids){
		return $this->_delete($ids, Billing_Controller_AccountBookingTemplate::getInstance());
	}
	
	public function saveAccountBookingTemplate($recordData){
		return $this->_save($recordData, Billing_Controller_AccountBookingTemplate::getInstance(), 'AccountBookingTemplate');
	}
	
	// Vat
	public function getVat($id){
		if(!$id ) {
			$obj = Billing_Controller_Vat::getInstance()->getEmptyVat();
		} else {
			$obj = Billing_Controller_Vat::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchVats($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Vat::getInstance(),'Billing_Model_VatFilter');
	}

	public function deleteVats($ids){
	}
	
	public function saveVat($recordData){
		return $this->_save($recordData, Billing_Controller_Vat::getInstance(), 'Vat');
	}
	
	// ArticleUnit
	public function getArticleUnit($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleUnit::getInstance()->getEmptyArticleUnit();
		} else {
			$obj = Billing_Controller_ArticleUnit::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleUnits($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleUnit::getInstance(),'Billing_Model_ArticleUnitFilter');
	}

	public function deleteArticleUnits($ids){
		return $this->_delete($ids, Billing_Controller_ArticleUnit::getInstance());
	}

	public function saveArticleUnit($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleUnit::getInstance(), 'ArticleUnit');
	}
	
	// ArticleGroup
	public function getArticleGroup($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleGroup::getInstance()->getEmptyArticleGroup();
		} else {
			$obj = Billing_Controller_ArticleGroup::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleGroups($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleGroup::getInstance(),'Billing_Model_ArticleGroupFilter');
	}

	public function deleteArticleGroups($ids){
		return $this->_delete($ids, Billing_Controller_ArticleGroup::getInstance());
	}

	public function saveArticleGroup($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleGroup::getInstance(), 'ArticleGroup');
	}
	
	// ArticleSeries
	public function getArticleSeries($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleSeries::getInstance()->getEmptyArticleSeries();
		} else {
			$obj = Billing_Controller_ArticleSeries::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleSeriess($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleSeries::getInstance(),'Billing_Model_ArticleSeriesFilter');
	}

	public function deleteArticleSeriess($ids){
		return $this->_delete($ids, Billing_Controller_ArticleSeries::getInstance());
	}

	public function saveArticleSeries($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleSeries::getInstance(), 'ArticleSeries');
	}
	
	// PriceGroup
	public function getPriceGroup($id){
		if(!$id ) {
			$obj = Billing_Controller_PriceGroup::getInstance()->getEmptyPriceGroup();
		} else {
			$obj = Billing_Controller_PriceGroup::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function getAllPriceGroups(){
		return $this->_search(null,null,Billing_Controller_PriceGroup::getInstance(),'Billing_Model_PriceGroupFilter');
	}
	
	public function searchPriceGroups($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_PriceGroup::getInstance(),'Billing_Model_PriceGroupFilter');
	}

	public function deletePriceGroups($ids){
		return $this->_delete($ids, Billing_Controller_PriceGroup::getInstance());
	}

	public function savePriceGroup($recordData){
		return $this->_save($recordData, Billing_Controller_PriceGroup::getInstance(), 'PriceGroup');
	}
	
// DebitorGroup
	public function getDebitorGroup($id){
		if(!$id ) {
			$obj = Billing_Controller_DebitorGroup::getInstance()->getEmptyDebitorGroup();
		} else {
			$obj = Billing_Controller_DebitorGroup::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function getAllDebitorGroups(){
		return $this->_search(null,null,Billing_Controller_DebitorGroup::getInstance(),'Billing_Model_DebitorGroupFilter');
	}
	
	public function searchDebitorGroups($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_DebitorGroup::getInstance(),'Billing_Model_DebitorGroupFilter');
	}

	public function deleteDebitorGroups($ids){
		return $this->_delete($ids, Billing_Controller_DebitorGroup::getInstance());
	}

	public function saveDebitorGroup($recordData){
		return $this->_save($recordData, Billing_Controller_DebitorGroup::getInstance(), 'DebitorGroup');
	}
	
		// SellPrice
	public function getSellPrice($id){
		if(!$id ) {
			$obj = Billing_Controller_SellPrice::getInstance()->getEmptySellPrice();
		} else {
			$obj = Billing_Controller_SellPrice::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSellPrices($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SellPrice::getInstance(),'Billing_Model_SellPriceFilter');
	}

	public function deleteSellPrices($ids){
		return $this->_delete($ids, Billing_Controller_SellPrice::getInstance());
	}

	public function saveSellPrice($recordData){
		return $this->_save($recordData, Billing_Controller_SellPrice::getInstance(), 'SellPrice');
	}	
	
	// StockLocation
	public function getStockLocation($id){
		if(!$id ) {
			$obj = Billing_Controller_StockLocation::getInstance()->getEmptyStockLocation();
		} else {
			$obj = Billing_Controller_StockLocation::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchStockLocations($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_StockLocation::getInstance(),'Billing_Model_StockLocationFilter');
	}

	public function deleteStockLocations($ids){
		return $this->_delete($ids, Billing_Controller_StockLocation::getInstance());
	}

	public function saveStockLocation($recordData){
		return $this->_save($recordData, Billing_Controller_StockLocation::getInstance(), 'StockLocation');
	}
	
	// Creditor
	public function getCreditor($id){
		if(!$id ) {
			$obj = Billing_Controller_Creditor::getInstance()->getEmptyCreditor();
		} else {
			$obj = Billing_Controller_Creditor::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchCreditors($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Creditor::getInstance(),'Billing_Model_CreditorFilter');
	}

	public function deleteCreditors($ids){
		return $this->_delete($ids, Billing_Controller_Creditor::getInstance());
	}

	public function saveCreditor($recordData){
		return $this->_save($recordData, Billing_Controller_Creditor::getInstance(), 'Creditor');
	}
	
	// Debitor
	public function getDebitor($id){
		if(!$id ) {
			$obj = Billing_Controller_Debitor::getInstance()->getEmptyDebitor();
		} else {
			$obj = Billing_Controller_Debitor::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}
	/**
	 * 
	 * Loads a debitor record by it's underlying contacts' identifier
	 * @param 	int $contactId
	 * @return	array	result
	 */
	public function getDebitorByContactId($contactId){
		try{
			$obj = Billing_Controller_Debitor::getInstance()->getByContactId($contactId);
			$id = $obj->id;
			$debitor = Billing_Controller_Debitor::getInstance()->get($id);
			$objData = $debitor->toArray();
			return array(
				'success' => true,
				'result' => $objData
			);
		}catch(Exception $e){
			return array(
				'success' => false,
				'result' => null,
				'errorInfo' => $e->__toString()
			);	
		}
	}
	/**
	 * 
	 *  Loads a debitor record by it's underlying contacts' identifier or
	 *  creates the debitor from contact if it doesn't exist
	 * @param 	int		$contactId
	 * @return 	array	result
	 */
	public function getDebitorByContactOrCreate($contactId, $additionalData){
		try{
			if($additionalData && !is_array($additionalData)){
				$additionalData = Zend_Json::decode($additionalData);
			}
			$debitor = Billing_Controller_Debitor::getInstance()->getByContactOrCreate($contactId, $additionalData);
			$objData = $debitor->toArray();
			return array(
				'success' => true,
				'result' => $objData
			);
		}catch(Exception $e){
			return array(
				'success' => false,
				'result' => null,
				'errorInfo' => $e->__toString()
			);	
		}
	}
	/**
	 * 
	 * Standard filtered searach
	 * @param array $filter
	 * @param array$paging
	 * @return multitype:boolean unknown |multitype:boolean NULL
	 */
	public function searchDebitors($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Debitor::getInstance(),'Billing_Model_DebitorFilter');
	}
	/**
	 * 
	 * Delete debitors by given ids
	 * @param array $ids
	 */	
	public function deleteDebitors($ids){
		return $this->_delete($ids, Billing_Controller_Debitor::getInstance());
	}
	/**
	 * 
	 * Save a debitor record (create/update)
	 * @param array $recordData
	 */
	public function saveDebitor($recordData){
		return $this->_save($recordData, Billing_Controller_Debitor::getInstance(), 'Debitor');
	}
	
	// Article
	public function getArticle($id){
		if(!$id ) {
			$obj = Billing_Controller_Article::getInstance()->getEmptyArticle();
		} else {
			$obj = Billing_Controller_Article::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}
	
	public function getArticleByNumber($articleNr){
		$objData = array();
		$obj = null;
		$success = false;
		try{
			$obj = Billing_Controller_Article::getInstance()->getByArticleNumber($articleNr);
		}catch(Exception $e){
			// article could not be found by number
			// -> try with ext_number
			$obj = Billing_Controller_Article::getInstance()->getByArticleExtNumber($articleNr);
		}
		if($obj){
			$success = true;
			$objData = $obj->toArray();
		}
		return array(
			'success' => $success,
			'data' => $objData
		);
	}
	
	public function getAllArticles(){
		Tinebase_Core::getLogger()->debug('search all articles - retrieve: '.strftime('%M:%S'));
		$fG = new Billing_Model_ArticleFilter(array());
		$filter = new Tinebase_Model_Filter_Text('query','contains','');
		
		$fG->addFilter($filter);
		$result = $this->_search($fG,null,Billing_Controller_Article::getInstance(),'Billing_Model_ArticleFilter');
		Tinebase_Core::getLogger()->debug('search all articles - result: '.strftime('%M:%S'));
		return $result;
	}

	public function searchArticles($filter,$paging){
		$result = $this->_search($filter,$paging,Billing_Controller_Article::getInstance(),'Billing_Model_ArticleFilter');

		//print_r($result);
		$result['totalcount'] = $result['totalcount']['count'];
		return $result;
	}

	public function deleteArticles($ids){
		return $this->_delete($ids, Billing_Controller_Article::getInstance());
	}

	public function saveArticle($recordData){
		return $this->_save($recordData, Billing_Controller_Article::getInstance(), 'Article');
	}	
	
	public function getArticleNumbers(){
		try{
			$aArticleNumbers = Billing_Controller_Article::getInstance()->getArticleNumbers();
			return array(
				'success' => 	true,
				'data' => 		$aArticleNumbers
			);
		}catch(Exception $e){
			return array(
				'success' => 	false,
				'data' => 		null,
				'errorInfo' =>  $e->__toString()
			);
		}
		
	}
	
	// ArticleSupplier
	public function getArticleSupplier($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleSupplier::getInstance()->getEmptyArticleSupplier();
		} else {
			$obj = Billing_Controller_ArticleSupplier::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleSuppliers($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleSupplier::getInstance(),'Billing_Model_ArticleSupplierFilter');
	}

	public function deleteArticleSuppliers($ids){
		return $this->_delete($ids, Billing_Controller_ArticleSupplier::getInstance());
	}

	public function saveArticleSupplier($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleSupplier::getInstance(), 'ArticleSupplier');
	}
	
	// ArticleCustomer
	public function getArticleCustomer($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleCustomer::getInstance()->getEmptyArticleCustomer();
		} else {
			$obj = Billing_Controller_ArticleCustomer::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleCustomers($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleCustomer::getInstance(),'Billing_Model_ArticleCustomerFilter');
	}

	public function deleteArticleCustomers($ids){
		return $this->_delete($ids, Billing_Controller_ArticleCustomer::getInstance());
	}

	public function saveArticleCustomer($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleCustomer::getInstance(), 'ArticleCustomer');
	}
	
	// Receipt
	public function getReceipt($id){
		if(!$id ) {
			$obj = Billing_Controller_Receipt::getInstance()->getEmptyReceipt();
		} else {
			$obj = Billing_Controller_Receipt::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchReceipts($filter,$paging){
		$preserveFilter = $filter;
		$result = $this->_search($filter,$paging,Billing_Controller_Receipt::getInstance(),'Billing_Model_ReceiptFilter');
		
		$aResult = Billing_Controller_Receipt::getInstance()->getSummation($preserveFilter);
		/*$result['total_netto'] = $aResult['total_netto'];
        $result['total_brutto'] = $aResult['global_brutto'];
        $result['totalcount'] = $aResult['totalcount'];
		*/
        return array_merge($result, $aResult);
        
		//print_r($result);
		return $result;
	}

	public function deleteReceipts($ids){
		return $this->_delete(array($ids), Billing_Controller_Receipt::getInstance());
	}
	
	public function deleteReceiptForReverse($receiptId){
		return $this->_delete(array($receiptId), Billing_Controller_Receipt::getInstance());
	}

	public function saveReceipt($recordData){
		if(array_key_exists('total_netto',$recordData)){
			unset($recordData['total_netto']);
		}
		if(array_key_exists('total_brutto',$recordData)){
			unset($recordData['total_brutto']);
		}
		if(array_key_exists('open_sum',$recordData)){
			unset($recordData['open_sum']);
		}
		if(array_key_exists('payed_sum',$recordData)){
			unset($recordData['payed_sum']);
		}
		return $this->_save($recordData, Billing_Controller_Receipt::getInstance(), 'Receipt');
	}
	
	public function getCalculationVariants($receiptId){
		return Billing_Controller_Receipt::getInstance()->getCalculationVariants($receiptId);
	}
	
	// OrderPosition
	public function getOrderPosition($id){
		if(!$id ) {
			$obj = Billing_Controller_OrderPosition::getInstance()->getEmptyOrderPosition();
		} else {
			$obj = Billing_Controller_OrderPosition::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOrderPositions($filter,$paging){
		Tinebase_Core::getLogger()->debug('search order pos - retrieve: '.strftime('%M:%S'));
		$result = $this->_search($filter,$paging,Billing_Controller_OrderPosition::getInstance(),'Billing_Model_OrderPositionFilter');
		Tinebase_Core::getLogger()->debug('search order pos - result: '.strftime('%M:%S'));
		return $result;	
	}

	public function deleteOrderPositions($ids){
		return $this->_delete($ids, Billing_Controller_OrderPosition::getInstance());
	}

	public function saveOrderPosition($recordData){
		// -> activate immediate update of receipt!
		// in order to have correct total sums
		Billing_Controller_OrderPosition::getInstance()->setUpdateReceiptAtOnce(true);
		
		
		return $this->_save($recordData, Billing_Controller_OrderPosition::getInstance(), 'OrderPosition');
	}
	
	// ReceiptPosition
	public function getReceiptPosition($id){
		if(!$id ) {
			$obj = Billing_Controller_ReceiptPosition::getInstance()->getEmptyReceiptPosition();
		} else {
			$obj = Billing_Controller_ReceiptPosition::getInstance()->get($id, false, false);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchReceiptPositions($filter,$paging){
		Tinebase_Core::getLogger()->debug('search order pos - retrieve: '.strftime('%M:%S'));
		$result = $this->_search($filter,$paging,Billing_Controller_ReceiptPosition::getInstance(),'Billing_Model_ReceiptPositionFilter');
		Tinebase_Core::getLogger()->debug('search order pos - result: '.strftime('%M:%S'));
		return $result;
	}

	public function deleteReceiptPositions($ids){
		return $this->_delete($ids, Billing_Controller_ReceiptPosition::getInstance());
	}

	public function saveReceiptPosition($recordData){
		$receiptId = null;
		if(array_key_exists('receipt_id',$recordData)){
			if($recordData['receipt_id']){
				$receiptId = $recordData['receipt_id'];
			}
		}
		
		$orderPosition = $this->_save($recordData, Billing_Controller_OrderPosition::getInstance(), 'OrderPosition');
		if($orderPosition instanceof Tinebase_Model_OrderPosition){
			$orderPosId = $orderPosition->getId();
		}else{
			$orderPosId = $orderPosition['id'];
		}
		$orderPosition = Billing_Controller_OrderPosition::getInstance()->get($orderPosId);
		if($receiptId){
			// -> activate immediate update of receipt!
			// in order to have correct total sums
			Billing_Controller_ReceiptPosition::getInstance()->setUpdateReceiptAtOnce(true);
			$receipt = Billing_Controller_Receipt::getInstance()->get($receiptId);
			Billing_Controller_ReceiptPosition::getInstance()->addOrderPositions($receipt, array($orderPosition));
		}
		return $orderPosition;
	}

	// Order
	public function getOrder($id){
		if(!$id ) {
			$obj = Billing_Controller_Order::getInstance()->getEmptyOrder();
		} else {
			$obj = Billing_Controller_Order::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOrders($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Order::getInstance(),'Billing_Model_OrderFilter');
	}

	public function deleteOrders($ids){
		return $this->_delete($ids, Billing_Controller_Order::getInstance());
	}

	public function saveOrder($recordData){
		return $this->_save($recordData, Billing_Controller_Order::getInstance(), 'Order');
	}
	
	public function processOrder($orderId, $params){
		return Billing_Controller_Order::getInstance()->processOrder($orderId, $params);
	}
	
	public function orderReceipt($orderId, $receiptId){
		return Billing_Controller_Order::getInstance()->orderReceipt($orderId, $receiptId);
	}
	
	public function createMonition($orderId, $invoiceId){
		return Billing_Controller_Order::getInstance()->createMonition($orderId, $invoiceId);
	}
	
	public function searchArticleSolds($filter,$paging){
		$result = $this->_search($filter,$paging,Billing_Controller_ArticleSold::getInstance(),'Billing_Model_ArticleSoldFilter');
		return $result;	
	}
	
	public function requestOrderForContact($contactId){
		try{
			$order = Billing_Controller_Order::getInstance()->requestOrderForContact($contactId);
			$objData = $order->toArray();
			return array(
				'success' => true,
				'result' => $objData
			);
		}catch(Exception $e){
			return array(
				'success' => false,
				'result' => null,
				'errorInfo' => $e->__toString()
			);	
		}
	}
	
	public function requestBidForOrder( $orderId, $orderPositionIds){
		try{
			$order = Billing_Controller_Order::getInstance()->requestBidForOrder( $orderId, $orderPositionIds);
			$objData = $order->toArray();
			return array(
				'success' => true,
				'result' => $objData
			);
		}catch(Exception $e){
			return array(
				'success' => false,
				'result' => null,
				'errorInfo' => $e->__toString()
			);	
		}
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $receiptId
	 */
	public function reverseInvoice($receiptId, $orderPositionData){
		return Billing_Controller_Order::getInstance()->reverseInvoice($receiptId, $orderPositionData)->toArray();
	}
	
	public function reverseBooking($bookingId){
		return Billing_Controller_Booking::getInstance()->reverseBooking($bookingId)->toArray();
	}
	
	
	// Job
	public function getJob($id){
		if(!$id ) {
			$obj = Billing_Controller_Job::getInstance()->getEmptyJob();
		} else {
			$obj = Billing_Controller_Job::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchJobs($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Job::getInstance(),'Billing_Model_JobFilter');
	}

	public function deleteJobs($ids){
		return $this->_delete($ids, Billing_Controller_Job::getInstance());
	}
	
	public function saveJob($recordData){
		return $this->_save($recordData, Billing_Controller_Job::getInstance(), 'Job');
	}
	
// BatchJob
	public function getBatchJob($id){
		if(!$id ) {
			$obj = Billing_Controller_BatchJob::getInstance()->getEmptyBatchJob();
		} else {
			$obj = Billing_Controller_BatchJob::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBatchJobs($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BatchJob::getInstance(),'Billing_Model_BatchJobFilter');
	}

	public function deleteBatchJobs($ids){
		return $this->_delete($ids, Billing_Controller_BatchJob::getInstance());
	}
	
	public function saveBatchJob($recordData){
		$aTransmitt = array(
			'id' 		=> $recordData['id'],
			'job_name1' => $recordData['job_name1'],
			'job_name2' => $recordData['job_name2']
		);
		return $this->_save($aTransmitt, Billing_Controller_BatchJob::getInstance(), 'BatchJob');
	}
	
// BatchJobDta
	public function getBatchJobDta($id){
		if(!$id ) {
			$obj = Billing_Controller_BatchJobDta::getInstance()->getEmptyBatchJobDta();
		} else {
			$obj = Billing_Controller_BatchJobDta::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBatchJobDtas($filter,$paging){
		$result =  $this->_search($filter,$paging,Billing_Controller_BatchJobDta::getInstance(),'Billing_Model_BatchJobDtaFilter');
		$result['count'] = $result['totalcount']['count'];
		$result['total_sum'] = $result['totalcount']['total_sum'];
        $result['count_op'] = $result['totalcount']['count_op'];
        $result['totalcount'] = $result['totalcount']['count'];
        
        return $result;
	}

	public function deleteBatchJobDtas($ids){
		return $this->_delete($ids, Billing_Controller_BatchJobDta::getInstance());
	}
	
	public function saveBatchJobDta($recordData){
		return $this->_save($recordData, Billing_Controller_BatchJobDta::getInstance(), 'BatchJobDta');
	}

// BatchJobDtaItem
	public function getBatchJobDtaItem($id){
		if(!$id ) {
			$obj = Billing_Controller_BatchJobDtaItem::getInstance()->getEmptyBatchJobDtaItem();
		} else {
			$obj = Billing_Controller_BatchJobDtaItem::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBatchJobDtaItems($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BatchJobDtaItem::getInstance(),'Billing_Model_BatchJobDtaItemFilter');
	}

	public function deleteBatchJobDtaItems($ids){
		return $this->_delete($ids, Billing_Controller_BatchJobDtaItem::getInstance());
	}
	
	public function saveBatchJobDtaItem($recordData){
		return $this->_save($recordData, Billing_Controller_BatchJobDtaItem::getInstance(), 'BatchJobDtaItem');
	}
	
	
public function getBatchJobMonition($id){
		if(!$id ) {
			$obj = Billing_Controller_BatchJobMonition::getInstance()->getEmptyBatchJobMonition();
		} else {
			$obj = Billing_Controller_BatchJobMonition::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBatchJobMonitions($filter,$paging){
		$result =  $this->_search($filter,$paging,Billing_Controller_BatchJobMonition::getInstance(),'Billing_Model_BatchJobMonitionFilter');
		$result['count'] = $result['totalcount']['count'];
		$result['total_sum'] = $result['totalcount']['total_sum'];
        $result['count_op'] = $result['totalcount']['count_op'];
        $result['totalcount'] = $result['totalcount']['count'];
        
        return $result;
	}

	public function deleteBatchJobMonitions($ids){
		return $this->_delete($ids, Billing_Controller_BatchJobMonition::getInstance());
	}
	
	public function saveBatchJobMonition($recordData){
		return $this->_save($recordData, Billing_Controller_BatchJobMonition::getInstance(), 'BatchJobMonition');
	}

// BatchJobMonitionItem
	public function getBatchJobMonitionItem($id){
		if(!$id ) {
			$obj = Billing_Controller_BatchJobMonitionItem::getInstance()->getEmptyBatchJobMonitionItem();
		} else {
			$obj = Billing_Controller_BatchJobMonitionItem::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchBatchJobMonitionItems($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_BatchJobMonitionItem::getInstance(),'Billing_Model_BatchJobMonitionItemFilter');
	}

	public function deleteBatchJobMonitionItems($ids){
		return $this->_delete($ids, Billing_Controller_BatchJobMonitionItem::getInstance());
	}
	
	public function saveBatchJobMonitionItem($recordData){
		return $this->_save($recordData, Billing_Controller_BatchJobMonitionItem::getInstance(), 'BatchJobMonitionItem');
	}
	
	
	// SupplyOrder
	public function getSupplyOrder($id){
		if(!$id ) {
			$obj = Billing_Controller_SupplyOrder::getInstance()->getEmptySupplyOrder();
		} else {
			$obj = Billing_Controller_SupplyOrder::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSupplyOrders($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SupplyOrder::getInstance(),'Billing_Model_SupplyOrderFilter');
	}

	public function deleteSupplyOrders($ids){
		return $this->_delete($ids, Billing_Controller_SupplyOrder::getInstance());
	}

	public function saveSupplyOrder($recordData){
		return $this->_save($recordData, Billing_Controller_SupplyOrder::getInstance(), 'SupplyOrder');
	}
	
// SupplyReceipt
	public function getSupplyReceipt($id){
		if(!$id ) {
			$obj = Billing_Controller_SupplyReceipt::getInstance()->getEmptySupplyReceipt();
		} else {
			$obj = Billing_Controller_SupplyReceipt::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSupplyReceipts($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SupplyReceipt::getInstance(),'Billing_Model_SupplyReceiptFilter');
	}

	public function deleteSupplyReceipts($ids){
		return $this->_delete($ids, Billing_Controller_SupplyReceipt::getInstance());
	}

	public function saveSupplyReceipt($recordData){
		return $this->_save($recordData, Billing_Controller_SupplyReceipt::getInstance(), 'SupplyReceipt');
	}
	
	// SupplyOrderPosition
	public function getSupplyOrderPosition($id){
		if(!$id ) {
			$obj = Billing_Controller_SupplyOrderPosition::getInstance()->getEmptySupplyOrderPosition();
		} else {
			$obj = Billing_Controller_SupplyOrderPosition::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchSupplyOrderPositions($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_SupplyOrderPosition::getInstance(),'Billing_Model_SupplyOrderPositionFilter');
	}

	public function deleteSupplyOrderPositions($ids){
		return $this->_delete($ids, Billing_Controller_SupplyOrderPosition::getInstance());
	}

	public function saveSupplyOrderPosition($recordData){
		return $this->_save($recordData, Billing_Controller_SupplyOrderPosition::getInstance(), 'SupplyOrderPosition');
	}
	
	public function getProductionCost($id){
		if(!$id ) {
			$obj = Billing_Controller_ProductionCost::getInstance()->getEmptyProductionCost();
		} else {
			$obj = Billing_Controller_ProductionCost::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchProductionCosts($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ProductionCost::getInstance(),'Billing_Model_ProductionCostFilter');
	}

	public function deleteProductionCosts($ids){
		return $this->_delete($ids, Billing_Controller_ProductionCost::getInstance());
	}
	
	public function saveProductionCost($recordData){
		return $this->_save($recordData, Billing_Controller_ProductionCost::getInstance(), 'ProductionCost');
	}
	
	public function createQuickOrder($data){
		// get contact -> debitor (create if not exists)
		// get article prices
		// create order
		// create collection of positions
		// create invoice
		// if with shipping doc -> create shipping doc
		$result = Billing_Controller_Order::getInstance()->createQuickOrder($data);
		
		return array(
			'success' => true,
			'data' => $result
		);

	}
	
	// OrderTemplate
	public function getOrderTemplate($id){
		if(!$id ) {
			$obj = Billing_Controller_OrderTemplate::getInstance()->getEmptyOrderTemplate();
		} else {
			$obj = Billing_Controller_OrderTemplate::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOrderTemplates($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_OrderTemplate::getInstance(),'Billing_Model_OrderTemplateFilter');
	}

	public function deleteOrderTemplates($ids){
		return $this->_delete($ids, Billing_Controller_OrderTemplate::getInstance());
	}

	public function saveOrderTemplate($recordData){
		return $this->_save($recordData, Billing_Controller_OrderTemplate::getInstance(), 'OrderTemplate');
	}
	
	// OrderTemplatePosition
	public function getOrderTemplatePosition($id){
		if(!$id ) {
			$obj = Billing_Controller_OrderTemplatePosition::getInstance()->getEmptyOrderTemplatePosition();
		} else {
			$obj = Billing_Controller_OrderTemplatePosition::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOrderTemplatePositions($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_OrderTemplatePosition::getInstance(),'Billing_Model_OrderTemplatePositionFilter');
	}

	public function deleteOrderTemplatePositions($ids){
		return $this->_delete($ids, Billing_Controller_OrderTemplatePosition::getInstance());
	}

	public function saveOrderTemplatePosition($recordData){
		return $this->_save($recordData, Billing_Controller_OrderTemplatePosition::getInstance(), 'OrderTemplatePosition');
	}
	
	// OpenItem
	public function getOpenItem($id){
		if(!$id ) {
			$obj = Billing_Controller_OpenItem::getInstance()->getEmptyOpenItem();
		} else {
			$obj = Billing_Controller_OpenItem::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOpenItems($filter,$paging){
	//	return $this->_search($filter,$paging,Billing_Controller_OpenItem::getInstance(),'Billing_Model_OpenItemFilter');
		
		$preserveFilter = $filter;
		$result = $this->_search($filter,$paging,Billing_Controller_OpenItem::getInstance(),'Billing_Model_OpenItemFilter');
		
		$aResult = Billing_Controller_OpenItem::getInstance()->getSummation($preserveFilter);
		
        return array_merge($result, $aResult);
		
	}

	public function deleteOpenItems($ids){
		return $this->_delete($ids, Billing_Controller_OpenItem::getInstance());
	}

	public function saveOpenItem($recordData){
		return $this->_save($recordData, Billing_Controller_OpenItem::getInstance(), 'OpenItem');
	}
	
	public function getPayableOpenItems($memberNr, $contactNr, $amount){
		return Billing_Controller_OpenItem::getInstance()->getPayableOpenItems($memberNr, $contactNr, $amount);
	}
	
	public function payOpenItems($data, $paymentRecord, $donationData){
		return Billing_Controller_OpenItem::getInstance()->payOpenItems($data, $paymentRecord, $donationData);
	}
	
// OpenItemMonition
	public function getOpenItemMonition($id){
		if(!$id ) {
			$obj = Billing_Controller_OpenItemMonition::getInstance()->getEmptyOpenItemMonition();
		} else {
			$obj = Billing_Controller_OpenItemMonition::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchOpenItemMonitions($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_OpenItemMonition::getInstance(),'Billing_Model_OpenItemMonitionFilter');
	}

	public function deleteOpenItemMonitions($ids){
	}
	
	public function saveOpenItemMonition($recordData){
		return $this->_save($recordData, Billing_Controller_OpenItemMonition::getInstance(), 'OpenItemMonition');
	}
	
	// MT940Payment
	public function getMT940Payment($id){
		if(!$id ) {
			$obj = Billing_Controller_MT940Payment::getInstance()->getEmptyMT940Payment();
		} else {
			$obj = Billing_Controller_MT940Payment::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchMT940Payments($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_MT940Payment::getInstance(),'Billing_Model_MT940PaymentFilter');
	}

	public function deleteMT940Payments($ids){
		return $this->_delete($ids, Billing_Controller_MT940Payment::getInstance());
	}

	public function saveMT940Payment($recordData){
		return $this->_save($recordData, Billing_Controller_MT940Payment::getInstance(), 'MT940Payment');
	}
	
	public function importMT940($files, $importOptions){
		return Billing_Controller_Payment::getInstance()->importMT940Files($files, $importOptions);
	}
	
	public function mt940BookSelected($ids){
		return Billing_Controller_MT940Payment::getInstance()->bookSelected($ids);
	}
	
	public function mt940BookGreen(){
		return Billing_Controller_MT940Payment::getInstance()->bookGreen();
	}
	
	public function mt940BookOrange(){
		return Billing_Controller_MT940Payment::getInstance()->bookOrange();
	}
	
	public function mt940ClearBookings(){
		return Billing_Controller_MT940Payment::getInstance()->clearBookings();
	}
	
	// StockFlow
	public function getStockFlow($id){
		if(!$id ) {
			$obj = Billing_Controller_StockFlow::getInstance()->getEmptyStockFlow();
		} else {
			$obj = Billing_Controller_StockFlow::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchStockFlows($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_StockFlow::getInstance(),'Billing_Model_StockFlowFilter');
	}

	public function deleteStockFlows($ids){
		return $this->_delete($ids, Billing_Controller_StockFlow::getInstance());
	}

	public function saveStockFlow($recordData){
		return $this->_save($recordData, Billing_Controller_StockFlow::getInstance(), 'StockFlow');
	}
	
	// ArticleSupply
	public function getArticleSupply($id){
		if(!$id ) {
			$obj = Billing_Controller_ArticleSupply::getInstance()->getEmptyArticleSupply();
		} else {
			$obj = Billing_Controller_ArticleSupply::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchArticleSupplys($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_ArticleSupply::getInstance(),'Billing_Model_ArticleSupplyFilter');
	}

	public function deleteArticleSupplys($ids){
		return $this->_delete($ids, Billing_Controller_ArticleSupply::getInstance());
	}

	public function saveArticleSupply($recordData){
		return $this->_save($recordData, Billing_Controller_ArticleSupply::getInstance(), 'ArticleSupply');
	}
	
// PaymentMethod
	public function getPaymentMethod($id){
		if(!$id ) {
			$obj = Billing_Controller_PaymentMethod::getInstance()->getEmptyPaymentMethod();
		} else {
			$obj = Billing_Controller_PaymentMethod::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchPaymentMethods($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_PaymentMethod::getInstance(),'Billing_Model_PaymentMethodFilter');
	}

	public function deletePaymentMethods($ids){
		return $this->_delete($ids, Billing_Controller_PaymentMethod::getInstance());
	}

	public function savePaymentMethod($recordData){
		$obj = new Billing_Model_PaymentMethod();
        $obj->setFromArray($recordData);
        try{
        	$objId = $obj->getId();
        	$obj = Billing_Controller_PaymentMethod::getInstance()->get($objId);
        	$obj->setFromArray($recordData);
        	$obj = Billing_Controller_PaymentMethod::getInstance()->update($obj);
        }catch(Exception $e){
        	$obj = Billing_Controller_PaymentMethod::getInstance()->create($obj);
        }
        return $obj->toArray();
	}
	
    public function getPaymentMethodsAsSimpleArray(){
    	return Billing_Controller_PaymentMethod::getInstance()->getPaymentMethodsAsSimpleArray();
    }
    
    public function getPaymentMethods(){
    	return Billing_Controller_PaymentMethod::getInstance()->getAllPaymentMethods();
    }
    
    
// Payment
	public function getPayment($id){
		if(!$id ) {
			$obj = Billing_Controller_Payment::getInstance()->getEmptyPayment();
		} else {
			$obj = Billing_Controller_Payment::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchPayments($filter,$paging){
		return $this->_search($filter,$paging,Billing_Controller_Payment::getInstance(),'Billing_Model_PaymentFilter');
	}

	public function deletePayments($ids){
		return $this->_delete($ids, Billing_Controller_Payment::getInstance());
	}

	public function savePayment($recordData){
		$obj = new Billing_Model_Payment();
        $obj->setFromArray($recordData);
        try{
        	$objId = $obj->getId();
        	$obj = Billing_Controller_Payment::getInstance()->get($objId);
        	$obj->setFromArray($recordData);
        	$obj = Billing_Controller_Payment::getInstance()->update($obj);
        }catch(Exception $e){
        	$obj = Billing_Controller_Payment::getInstance()->create($obj);
        }
        return $obj->toArray();
	}

	public function reversePayment($paymentId){
		return Billing_Controller_Payment::getInstance()->reversePayment($paymentId)->toArray();
	}
	
	
// DebitorAccount
	public function getDebitorAccount($id){
		if(!$id ) {
			$obj = Billing_Controller_DebitorAccount::getInstance()->getEmptyDebitorAccount();
		} else {
			$obj = Billing_Controller_DebitorAccount::getInstance()->get($id);
		}
		$objData = $obj->toArray();

		return $objData;
	}

	public function searchDebitorAccounts($filter,$paging){
		$preserveFilter = $filter;
		$result = $this->_search($filter,$paging,Billing_Controller_DebitorAccount::getInstance(),'Billing_Model_DebitorAccountFilter');
		
		
		$aResult = Billing_Controller_DebitorAccount::getInstance()->getSummation($preserveFilter);
		/*$result['total_netto'] = $aResult['total_netto'];
        $result['total_brutto'] = $aResult['global_brutto'];
        $result['totalcount'] = $aResult['totalcount'];
		*/
        return array_merge($result, $aResult);
		
		return $this->_search($filter,$paging,Billing_Controller_DebitorAccount::getInstance(),'Billing_Model_DebitorAccountFilter');
	}

	public function deleteDebitorAccounts($ids){
		return $this->_delete($ids, Billing_Controller_DebitorAccount::getInstance());
	}

	public function saveDebitorAccount($recordData){
		$obj = new Billing_Model_DebitorAccount();
        $obj->setFromArray($recordData);
        try{
        	$objId = $obj->getId();
        	$obj = Billing_Controller_DebitorAccount::getInstance()->get($objId);
        	$obj->setFromArray($recordData);
        	$obj = Billing_Controller_DebitorAccount::getInstance()->update($obj);
        }catch(Exception $e){
        	//echo $e->__toString();
        	$obj = Billing_Controller_DebitorAccount::getInstance()->create($obj);
        }
        return $obj->toArray();
	}
	
	
 	public function requestBatchJobDtaDebit($filters, $contexts){
    	$data = array(
    		'filters' 	=> Zend_Json::decode($filters),
    		'class'		=> 'Billing_Controller_BatchJobDta',
    		'method'	=> 'prepareDebitDtaExport',
    		'type'      => 'DEBIT',
    		'contexts'  => $contexts
    	);
    	
    	
    	$job = Billing_Api_BatchJobManager::getInstance()->requestRuntimeBatchJob('DTAEXPORT', null, null, $data);
    	//Billing_Api_BatchJobManager::getInstance()->runBatchJob($job->getId());
    	return $job->toArray();
    }
    
	public function printDtaExportPrepare($jobId, $filteredList, $filteredListData){
		return Billing_Controller_BatchJobDta::getInstance()->printDtaExportPrepare($jobId, $filteredList, $filteredListData);
	}
	
	public function createDtaExport($jobId, $forDate){
//		return "get";
		return Billing_Controller_BatchJobDta::getInstance()->runDebitDtaExport($jobId, $forDate);
	}
	
	public function requestBatchJobMonition($filters, $contexts){
    	$data = array(
    		'filters' 	=> Zend_Json::decode($filters),
    		'class'		=> 'Billing_Controller_BatchJobMonition',
    		'method'	=> 'prepareMonitionExport',
    		'type'      => 'DEBIT',
    		'contexts'  => $contexts
    	);
    	
    	
    	$job = Billing_Api_BatchJobManager::getInstance()->requestRuntimeBatchJob('MONITION', null, null, $data);
    	
    	return $job->toArray();
    }
    
	public function printMonitionExportPrepare($jobId, $filteredList, $filteredListData){
		return Billing_Controller_BatchJobMonition::getInstance()->printMonitionExportPrepare($jobId, $filteredList, $filteredListData);
	}
	
	public function createMonitionExport($jobId, $forDate){
		return Billing_Controller_BatchJobMonition::getInstance()->runMonitionExport($jobId, $forDate);
	}
	
	
	public function runBatchJob($jobId, $dryRun){
		ignore_user_abort(true);
		set_time_limit(0);
		Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . ' run job (id: '.$jobId.')');
		$job = Billing_Api_BatchJobManager::getInstance()->runBatchJob($jobId);
		return $job->toArray();
	}
	
	public function bookDtaJob($jobId, $forDate){
		$job = Billing_Controller_BatchJobDta::getInstance()->runBookingQueue($jobId, $forDate);
		return $job->toArray();
	}
	
	/**
	 * 
	 * Enter description here ...
	 * @param unknown_type $jobId
	 */
	public function approveBatchJob($jobId){
		ignore_user_abort(true);
		set_time_limit(0);
		Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . ' approve job (id: '.$jobId.')');
		$job = Billing_Api_BatchJobManager::getInstance()->approveBatchJob($jobId);
		return $job->toArray();
	}
    
     /**
     * import banks
     * 
     * @param array $files to import
     * @param array $importOptions
     * @param string $definitionId
     * @return array
     */
    public function importBanks($files, $importOptions, $definitionId)
    {
        return $this->_import($files, $definitionId, Billing_Controller_Bank::getInstance(), $importOptions);
    }
    
	public function getBanksByBankCode($bankCode){
    	try{
	    	$recordSet = Billing_Controller_Bank::getInstance()->getBanksByBankCode($bankCode);
	    	
	    	if(count($recordSet)==0){
	    		throw new Tinebase_Exception_Record_RecordNotFound('No bank accounts found for given code', 'NO_RESULT');
	    	}
	    	
	    	return array(
	    		'state' => 'success',
	    		'data' => $recordSet->toArray(),
	    		'count' => count($data)
	    	);
    	}catch(Exception $e){
    		return array(
	    		'state' => 'failure',
    			'errorcode' => $e->getCode(),
	    		'data' => array(),
	    		'count' => 0
	    	);
    	}
    }
    
    public function improveIBAN($iban){
   	 	try{
	    	$check = Billing_Api_BankAccount::improveIBAN($iban);
   	 		if($check){
	   	 		return array(
		    		'state' => 'success',
		    		'data' => null 
		    	);
   	 		}else{
   	 			return array(
		    		'state' => 'failure',
		    		'data' => null 
		    	);
   	 		}
    	}catch(Exception $e){
    		return array(
	    		'state' => 'failure',
    			'errorcode' => $e->getCode(),
	    		'data' => array(),
	    		'count' => 0
	    	);
    	}
    }
    
	public function calculateIBAN($bankCode, $bankAccountNumber){
   	 	try{
	    	$iban = Billing_Api_BankAccount::calculateIBAN('DE', $bankCode, $bankAccountNumber);
   	 		if($iban){
	   	 		return array(
		    		'state' => 'success',
		    		'data' => array(
	   	 				'IBAN' => $iban
	   	 			) 
		    	);
   	 		}else{
   	 			return array(
		    		'state' => 'failure',
		    		'data' => null 
		    	);
   	 		}
    	}catch(Exception $e){
    		return array(
	    		'state' => 'failure',
    			'errorcode' => $e->getCode(),
	    		'data' => array(),
	    		'count' => 0
	    	);
    	}
    }
	
    /**
     * Returns registry data of addressbook.
     * @see Tinebase_Application_Json_Abstract
     * 
     * @return mixed array 'variable name' => 'data'
     */
    public function getRegistryData()
    {
    	
     	$filter = new Tinebase_Model_ImportExportDefinitionFilter(array(
            array('field' => 'plugin', 'operator' => 'equals', 'value' => 'Billing_Import_BankCsv'),
        ));
        $importDefinitions = Tinebase_ImportExportDefinition::getInstance()->search($filter);
        //print_r($importDefinitions);
        try {
            $defaultDefinitionArray = Tinebase_ImportExportDefinition::getInstance()->getByName('bank_import_csv')->toArray();
        } catch (Tinebase_Exception_NotFound $tenf) {
            if (count($importDefinitions) > 0) {
                $defaultDefinitionArray = $importDefinitions->getFirstRecord()->toArray();
            } else {
                Tinebase_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' No import definitions found for Banks');
                $defaultDefinitionArray = array();
            }
        }
        $registryData = array(
            'Order' => Billing_Controller_Order::getInstance()->getRegistryData(),
        	'StockLocation' => Billing_Controller_StockLocation::getInstance()->getRegistryData(),
        	'PaymentMethods' => $this->getPaymentMethodsAsSimpleArray(),
        	'Context' => $this->getContextsAsSimpleArray(),
        	'ArticleGroups' => Billing_Controller_ArticleGroup::getInstance()->getArticleGroupsAsSimpleArray(),
        	'DebitorGroups' => Billing_Controller_DebitorGroup::getInstance()->getDebitorGroupsAsSimpleArray(),
       	 	'ArticleSeriess' => Billing_Controller_ArticleSeries::getInstance()->getArticleSeriessAsSimpleArray(),
        	'AccountSystems' => Billing_Controller_AccountSystem::getInstance()->getAccountSystemsAsSimpleArray(),
        	'AccountClasss' => Billing_Controller_AccountClass::getInstance()->getAccountClasssAsSimpleArray(),
        	'defaultBankImportDefinition'   => $defaultDefinitionArray,
        	'importDefinitions'         => array(
        	        'results'               => $importDefinitions->toArray(),
                	'totalcount'            => count($importDefinitions)
            	 ) 	
//        	
//        	'Vat' => Billing_Controller_Vat::getInstance()->getRegistryData(),
//        	'PriceGroup' => Billing_Controller_PriceGroup::getInstance()->getRegistryData(),
//        	'ArticleGroup' => Billing_Controller_ArticleGroup::getInstance()->getRegistryData(),
//        	'ArticleUnit' => Billing_Controller_ArticleUnit::getInstance()->getRegistryData()
        );        
        return $registryData;    
    }
}