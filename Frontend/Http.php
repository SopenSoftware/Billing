<?php
/**
 * Billing Http frontend
 *
 * This class handles all Http requests for the Billing application
 *
 * @package     Billing
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Http.php 18068 2010-12-23 10:24:41Z p.schuele@metaways.de $
 *
 */
class Billing_Frontend_Http extends Tinebase_Frontend_Http_Abstract
{
    /**
     * app name
     *
     * @var string
     */
    protected $_applicationName = 'Billing';
    
    /**
     * Returns all JS files which must be included for this app
     *
     * @return array Array of filenames
     */
    public function getJsFilesToInclude()
    {
        return array(
        	'Billing/js/Custom.js',
        	'Billing/js/Models.js',
        	'Billing/js/Constants.js',
            'Billing/js/Backend.js',
        	'Billing/js/Renderer.js',
        	'Billing/js/Application.js',
        	'Billing/js/MainScreen.js',
        	'Billing/js/AddressbookPlugin.js',
        	'Billing/js/VatEditDialog.js',
        	'Billing/js/VatGridPanel.js',
        	'Billing/js/ArticleUnitEditDialog.js',
        	'Billing/js/ArticleUnitGridPanel.js',
            'Billing/js/ArticleGroupEditDialog.js',
        	'Billing/js/ArticleGroupGridPanel.js',
        	'Billing/js/ArticleSoldGridPanel.js',
        	'Billing/js/ArticleSeriesEditDialog.js',
        	'Billing/js/ArticleSeriesGridPanel.js',
            'Billing/js/PriceGroupEditDialog.js',
        	'Billing/js/PriceGroupGridPanel.js',
         	'Billing/js/DebitorGroupEditDialog.js',
        	'Billing/js/DebitorGroupGridPanel.js',
        	'Billing/js/StockLocationEditDialog.js',
        	'Billing/js/StockLocationGridPanel.js',
        	'Billing/js/CreditorEditDialog.js',
        	'Billing/js/CreditorGridPanel.js',
        	'Billing/js/CreditorWidget.js',
        	'Billing/js/DebitorEditDialog.js',
        	'Billing/js/DebitorGridPanel.js',
        	'Billing/js/DebitorWidget.js',        
        	'Billing/js/ArticleEditDialog.js',
        	'Billing/js/ArticleGridPanel.js',
        	'Billing/js/ArticleWidget.js',
        	'Billing/js/ArticleSupplierGridPanel.js',
        	'Billing/js/ArticleSupplyGridPanel.js',
        	'Billing/js/ArticleCustomerGridPanel.js',
        	'Billing/js/ArticleSellPriceGridPanel.js',
        	'Billing/js/ReceiptEditDialog.js',
        	'Billing/js/ReceiptGridPanel.js',
	        'Billing/js/OrderPositionEditDialog.js',
        	'Billing/js/OrderPositionGridPanel.js',
        	'Billing/js/OrderEditDialog.js',
        	'Billing/js/OrderGridPanel.js',
			'Billing/js/JobEditDialog.js',
        	'Billing/js/JobGridPanel.js',
        	'Billing/js/StockFlowGridPanel.js',
        	'Billing/js/StockFlowEditDialog.js',
        	'Billing/js/SupplyReceiptEditDialog.js',
        	'Billing/js/SupplyReceiptGridPanel.js',
	        'Billing/js/SupplyOrderPositionEditDialog.js',
        	'Billing/js/SupplyOrderPositionGridPanel.js',
        	'Billing/js/SupplyOrderEditDialog.js',
        	'Billing/js/SupplyOrderGridPanel.js',
        	'Billing/js/PaymentMethodEditDialog.js',
        	'Billing/js/PaymentMethodGridPanel.js',
        	'Billing/js/ProductionCostGridPanel.js',
        	'Billing/js/QuickOrderEditDialog.js',
        	'Billing/js/POSEditDialog.js',
        	'Billing/js/QuickOrderGridPanel.js',
        	'Billing/js/OrderTemplatePositionEditDialog.js',
        	'Billing/js/OrderTemplatePositionGridPanel.js',
        	'Billing/js/OrderTemplateEditDialog.js',
        	'Billing/js/OrderTemplateGridPanel.js',
            'Billing/js/OpenItemEditDialog.js',
        	'Billing/js/OpenItemGridPanel.js',
        	'Billing/js/InstantOpenItemGridPanel.js',
        	'Billing/js/InstantOrderPositionsGridPanel.js',
        	'Billing/js/PrintReceiptDialog.js',
        	'Billing/js/ExportFibuDialog.js',
        	'Billing/js/ExpArticleDialog.js',
        	'Billing/js/PaymentEditDialog.js',
        	'Billing/js/PaymentGridPanel.js',
        	'Billing/js/PaymentWidget.js',
        	'Billing/js/DebitorAccountGridPanel.js',
        	'Billing/js/DirectDebitDialog.js',
        	'Billing/js/AccountClassEditDialog.js',
        	'Billing/js/AccountClassGridPanel.js',
        	'Billing/js/AccountSystemEditDialog.js',
        	'Billing/js/AccountSystemGridPanel.js',
        	'Billing/js/BookingEditDialog.js',
        	'Billing/js/BookingGridPanel.js',
        	'Billing/js/AccountBookingEditDialog.js',
        	'Billing/js/AccountBookingGridPanel.js',
        	'Billing/js/BookingTemplateEditDialog.js',
        	'Billing/js/BookingTemplateGridPanel.js',
        	'Billing/js/AccountBookingTemplateEditDialog.js',
        	'Billing/js/AccountBookingTemplateGridPanel.js',
        	'Billing/js/MT940PaymentGridPanel.js',
        	'Billing/js/MT940ImportDialog.js',
        	'Billing/js/BatchJobEditDialog.js',
        	'Billing/js/BatchJobGridPanel.js',

        	'Billing/js/BatchJobDtaGridPanel.js',
        	'Billing/js/BatchJobDtaItemEditDialog.js',
        	'Billing/js/BatchJobDtaItemGridPanel.js',
        	'Billing/js/BatchJobMonitionGridPanel.js',
        	'Billing/js/BatchJobMonitionItemEditDialog.js',
        	'Billing/js/BatchJobMonitionItemGridPanel.js',
        	'Billing/js/CompoundWorkPanel.js',
        	'Billing/js/PrintFibuDialog.js',
        	'Billing/js/BankEditDialog.js',
        	'Billing/js/BankGridPanel.js',
        	'Billing/js/BankDataHelper.js',
        	'Billing/js/BankAccountEditDialog.js',
        	'Billing/js/BankAccountGridPanel.js',
        	'Billing/js/SepaCreditorEditDialog.js',
        	'Billing/js/SepaCreditorGridPanel.js',
        	'Billing/js/SepaMandateEditDialog.js',
        	'Billing/js/SepaMandateGridPanel.js',
        	'Billing/js/BankAccountWidget.js',
        	'Billing/js/ExportSepaMandateDialog.js'
        );
    }
    
    public function getCssFilesToInclude(){
    	return array(
    		'Billing/css/Billing.css'
    	);
    }
    
    public function printTest(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printTest();
    }
    
	public function printReceipts(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printReceipts($_REQUEST['ids'],true, null, $_REQUEST['preview'],$_REQUEST['copy'],$_REQUEST['withCopy']);
    }
    
	public function printReceiptsByUser(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printReceiptsByUser($_REQUEST['preview']);
    }
    
	public function printReceiptsByFilter(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printReceiptsByFilter(
    		isset($_REQUEST['preview']), 
    		$_REQUEST['outputType'], 
    		$_REQUEST['filters'], 
    		$_REQUEST['userOptions'], 
    		$_REQUEST['types'], 
    		$_REQUEST['sort'], 
    		$_REQUEST['additionalOptions']
    	);
    }
    
    public function printReceipt(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printReceipt($_REQUEST['id']);
    }
    
 	public function getReceiptPreview(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->getReceiptPreview($_REQUEST['id']);
    }
    
    public function printSupplyReceipt(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->printSupplyReceipt($_REQUEST['id']);
    }
    
 	public function getSupplyReceiptPreview(){
    	error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	Billing_Controller_Print::getInstance()->getSupplyReceiptPreview($_REQUEST['id']);
    }
    
	public function exportFibu($filters, $simulation){
		error_reporting(E_ALL);
    	ini_set('display_errors','on');
		Billing_Controller_Order::getInstance()->exportFibu($filters, (strtolower(trim($simulation))=='false')?false:true);
	}
	
	public function directDebit($aPaymentMethodKeys, $filters){
		error_reporting(E_ALL);
    	ini_set('display_errors','on');
		Billing_Controller_OpenItem::getInstance()->directDebit($aPaymentMethodKeys, $filters);
	}
	
	public function runArticleSellListExport(){
    	Billing_Controller_Export::getInstance()->exportArticleSellList($_REQUEST['data'],$_REQUEST['exportType']);
    }
    
	public function downloadPreparePDF(){
		Billing_Controller_BatchJobDta::getInstance()->downloadPreparePDF($_REQUEST['jobId'], $_REQUEST['filteredList']);
	}
	
	public function downloadProtocolPDF(){
		Billing_Controller_BatchJobDta::getInstance()->downloadProtocolPDF($_REQUEST['jobId']);
	}
	
	public function downloadDTA(){
		Billing_Controller_BatchJobDta::getInstance()->downloadDTA($_REQUEST['jobId']);
	}
	

	public function downloadMonitionPrintResult(){
		Billing_Controller_BatchJobMonition::getInstance()->downloadMonition($_REQUEST['jobId']);
	}
	
	 public function printReturnInquiry(){
	 	try{
    	Billing_Controller_Payment::getInstance()->printReturnInquiry();
	 	}catch(Exception $e){
	 		echo $e->__toString();
	 	}
    }
    
	public function printFibu($filters){
		error_reporting(E_ALL);
    	ini_set('display_errors','on');
    	try{
    	$filters = $_REQUEST['filters'];
    	$data = $_REQUEST['data'];
    	$accountBookingFilters = $_REQUEST['accountBookingFilters'];
		Billing_Controller_AccountSystem::getInstance()->printFibu($filters, $data, $accountBookingFilters);
    	}catch(Exception $e){
    		echo $e->__toString();
    	}
	}
	
	public function exportSepaMandateDATEV($filters, $data){
		error_reporting(E_ALL);
    	ini_set('display_errors','on');
		Billing_Controller_SepaMandate::getInstance()->exportSepaMandateDATEV($filters, $data);
	}
    
	
}
