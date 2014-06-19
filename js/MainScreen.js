/**
 * Sopen
 * 
 * @package     Billing
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Hans-Jürgen Hartl <hhartl@sopen.de>
 * @copyright   sopen GmbH, Wefelen www.sopen.de (2011)
 * @version     $Id:  $
 *
 */
Ext.ns('Tine.Billing');


Tine.Billing.MainScreen = Ext.extend(Tine.widgets.MainScreen, {
	stateFull:true,
	stateId: 'tine-billing-main-screen-menu',
	westPanelXType: 'tine.billing.treepanel',
    mainPanel: null,
    activeContentType:null,
    initComponent: function(){

		Tine.Billing.MainScreen.superclass.initComponent.call(this);
	},
    show: function() {
    	if(!this.activeContentType){
        	try{
        		var activeContentType = Tine.Billing.registry.get('preferences').get('activeContentType');
        		console.log('billing.mainscreen');
        		console.log(activeContentType);
        		if(activeContentType){
        			this.activeContentType = activeContentType;
        		}else{
        			this.activeContentType= 'Invoice';
        		}
        	}catch(e){
        		console.log('billing.mainscreen');
        		console.log(e);
        		this.activeContentType= 'Invoice';
        		// ok: default is Invoice
        	}
    	}
	    if(this.fireEvent("beforeshow", this) !== false){
	    	this.showWestPanel();
	        this.showCenterPanel();
	        this.showNorthPanel();
	        this.fireEvent('show', this);
	    }
	    return this;
	},
	getCenterPanel: function(activeContentType){
		
		switch(activeContentType){
		
		case 'Vat':
			if(!this.vatPanel){
				this.vatPanel = new Tine.Billing.VatGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.vatPanel;
			break;
		
		case 'ArticleUnit':
			if(!this.articleUnitPanel){
				this.articleUnitPanel = new Tine.Billing.ArticleUnitGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.articleUnitPanel;
			break;
		
		case 'ArticleGroup':
			if(!this.articleGroupPanel){
				this.articleGroupPanel = new Tine.Billing.ArticleGroupGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.articleGroupPanel;
			break;

		case 'ArticleSold':
			this.mainPanel = new Tine.Billing.ArticleSoldGridPanel({
				app: this.app,
				plugins:[]
			});
			break;
			
		case 'ArticleSeries':
			if(!this.articleSeriesPanel){
				this.articleSeriesPanel = new Tine.Billing.ArticleSeriesGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.articleSeriesPanel;
			break;
		case 'PriceGroup':
			if(!this.priceGroupPanel){
				this.priceGroupPanel = new Tine.Billing.PriceGroupGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.priceGroupPanel;
			break;
		
		case 'DebitorGroup':
			if(!this.debitorGroupPanel){
				this.debitorGroupPanel = new Tine.Billing.DebitorGroupGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.debitorGroupPanel;
			break;
			
		case 'PaymentMethod':
			if(!this.paymentMethodPanel){
				this.paymentMethodPanel = new Tine.Billing.PaymentMethodGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.paymentMethodPanel;
			break;
			
		case 'Payment':
			if(!this.paymentPanel){
				this.paymentPanel = new Tine.Billing.PaymentGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.paymentPanel;
			break;

		case 'StockLocation':
			if(!this.stockLocationPanel){
				this.stockLocationPanel = new Tine.Billing.StockLocationGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.stockLocationPanel;
			break;
			
		case 'Creditor':
			if(!this.creditorPanel){
				this.creditorPanel = new Tine.Billing.CreditorGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.creditorPanel;
			break;

		case 'Debitor':
			if(!this.debitorPanel){
				this.debitorPanel = new Tine.Billing.DebitorGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.debitorPanel;
			break;
			
		case 'Article':
			if(!this.articlePanel){
				this.articlePanel = new Tine.Billing.ArticleGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.articlePanel;
			break;	
			
			// job
		case 'Job':
			if(!this.JobPanel){
				this.JobPanel = new Tine.Billing.JobGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.JobPanel;
			break;		
			
		case 'BatchJob':
			this.mainPanel = new Tine.Billing.BatchJobGridPanel({
				app: this.app,
				plugins:[]
			});
			break;	
			
		case 'BatchJobDta':
			this.mainPanel = new Tine.Billing.BatchJobDtaGridPanel({
				app: this.app,
				plugins:[]
			});
			break;	
			
		case 'BatchJobMonition':
			this.mainPanel = new Tine.Billing.BatchJobMonitionGridPanel({
				app: this.app,
				plugins:[]
			});
			break;	
			
// order
		case 'Order':
			if(!this.OrderPanel){
				this.OrderPanel = new Tine.Billing.OrderGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.OrderPanel;
			break;	
		case 'OrderTemplate':
			if(!this.OrderTemplatePanel){
				this.OrderTemplatePanel = new Tine.Billing.OrderTemplateGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.OrderTemplatePanel;
			break;	
			// order
		case 'SupplyOrder':
			if(!this.SupplyOrderPanel){
				this.SupplyOrderPanel = new Tine.Billing.SupplyOrderGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.SupplyOrderPanel;
			break;				
			
// receipts (calc, bid etc.)
		case 'Calculation':
			if(!this.CalculationPanel){
				this.CalculationPanel = new Tine.Billing.CalculationGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.CalculationPanel;
			break;	
		case 'Bid':
			if(!this.BidPanel){
				this.BidPanel = new Tine.Billing.BidGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.BidPanel;
			break;			

		case 'Confirm':
			if(!this.ConfirmPanel){
				this.ConfirmPanel = new Tine.Billing.ConfirmGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.ConfirmPanel;
			break;	
			
		case 'Shipping':
			if(!this.ShippingPanel){
				this.ShippingPanel = new Tine.Billing.ShippingGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.ShippingPanel;
			break;	
			
		case 'SupplyQuery':
			if(!this.SupplyQueryPanel){
				this.SupplyQueryPanel = new Tine.Billing.SupplyQueryGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.SupplyQueryPanel;
			break;			

		case 'SupplyOffer':
			if(!this.SupplyOfferPanel){
				this.SupplyOfferPanel = new Tine.Billing.SupplyOfferGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.SupplyOfferPanel;
			break;	
			
		case 'SupplyOrderOrder':
			if(!this.SupplyOrderOrderPanel){
				this.SupplyOrderOrderPanel = new Tine.Billing.SupplyOrderOrderGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.SupplyOrderOrderPanel;
			break;	
			
		case 'SupplyInvoice':
			if(!this.SupplyInvoicePanel){
				this.SupplyInvoicePanel = new Tine.Billing.SupplyInvoiceGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.SupplyInvoicePanel;
			break;	
		case 'OpenItem':
			if(!this.OpenItemPanel){
				this.OpenItemPanel = new Tine.Billing.OpenItemGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.OpenItemPanel;
			break;	
		case 'DebitorAccount':
			if(!this.DebitorAccountPanel){
				this.DebitorAccountPanel = new Tine.Billing.DebitorAccountGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.DebitorAccountPanel;
			break;	
		case 'Credit':
			if(!this.CreditPanel){
				this.CreditPanel = new Tine.Billing.CreditGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.CreditPanel;
			break;	
		case 'AllReceipts':
			if(!this.AllReceiptsPanel){
				this.AllReceiptsPanel = new Tine.Billing.AllReceiptsGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.AllReceiptsPanel;
			break;	
		case 'Monition':
			if(!this.MonitionPanel){
				this.MonitionPanel = new Tine.Billing.MonitionGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.MonitionPanel;
			break;
		case 'Invoice':
		default:
			if(!this.InvoicePanel){
				this.InvoicePanel = new Tine.Billing.InvoiceGridPanel({
					app: this.app,
					plugins:[]
				});
			}
			this.mainPanel = this.InvoicePanel;
			break;
		case 'Booking':
			if(!this.bookingPanel){
			this.bookingPanel = new Tine.Billing.BookingGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.bookingPanel;
			break;	
		case 'AccountClass':
			
			this.mainPanel = new Tine.Billing.AccountClassGridPanel({
				app: this.app,
				plugins:[]
			});
			break;
		case 'AccountSystem':
			if(!this.accountSystemPanel){
			this.accountSystemPanel = new Tine.Billing.AccountSystemGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.accountSystemPanel;
			break;
		case 'AccountBooking':
			if(!this.accountBookingPanel){
			this.accountBookingPanel = new Tine.Billing.AccountBookingGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.accountBookingPanel;
			break;
		case 'BookingTemplate':
			if(!this.bookingTemplatePanel){
			this.bookingTemplatePanel = new Tine.Billing.BookingTemplateGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.bookingTemplatePanel;
			break;	
		case 'Bank':
			if(!this.bankPanel){
			this.bankPanel = new Tine.Billing.BankGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.bankPanel;
			break;	
		case 'BankAccount':
			if(!this.bankAccountPanel){
			this.bankAccountPanel = new Tine.Billing.BankAccountGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.bankAccountPanel;
			break;	
		case 'SepaCreditor':
			if(!this.sepaCreditorPanel){
			this.sepaCreditorPanel = new Tine.Billing.SepaCreditorGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.sepaCreditorPanel;
			break;	
		case 'SepaMandate':
			if(!this.sepaMandatePanel){
			this.sepaMandatePanel = new Tine.Billing.SepaMandateGridPanel({
				app: this.app,
				plugins:[]
			});
			}
			this.mainPanel = this.sepaMandatePanel;
			break;	
		}
		return this.mainPanel;
	},
	getNorthPanel: function(){
		return this.mainPanel.getActionToolbar();
	}
});

Tine.Billing.FilterPanel = function(config) {
    Ext.apply(this, config);
    Tine.Billing.FilterPanel.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.FilterPanel, Tine.widgets.persistentfilter.PickerPanel, {
	suppressEvents:false,
    filter: [],
    onFilterChange: function(){
	}
});

Tine.Billing.TreePanel = Ext.extend(Ext.tree.TreePanel, {
	rootVisible:false,
	useArrows:true,
	initComponent: function() {
		this.root = {
            id: 'root',
            leaf: false,
            expanded: true,
            children: [
			{
			    text: this.app.i18n._('Batch-Aufträge'),
			    id : 'billingBatchJobContainer',
			    iconCls: 'BillingOrder',
			    contentType: 'BatchJob',
			    expanded: true,
			    leaf:false,
			    children: [{
	                text: this.app.i18n._('DTAs'),
	                id: 'billingBatchJobDtaContainer',
	                contentType: 'BatchJobDta',
	                leaf: true
                },{
	                text: this.app.i18n._('Mahnungen'),
	                id: 'billingBatchJobMonitionContainer',
	                contentType: 'BatchJobMonition',
	                leaf: true
                }]
			},{
	            text: this.app.i18n._('Jobs'),
	            id : 'billingJobContainer',
	            iconCls: 'BillingOrder',
	            contentType: 'Job',
	            expanded: true,
	            leaf:false,
	            children: [{
		                text: this.app.i18n._('Auftragsvorlagen'),
		                id: 'billingOrderTemplateContainer',
		                contentType: 'OrderTemplate',
		                leaf: true
	                },{
		                text: this.app.i18n._('Kunden-Aufträge'),
		                id: 'billingOrderContainer',
		                contentType: 'Order',
		                leaf: false,
		                expanded: true,
		                children: [
		       					{
		       					    text: this.app.i18n._('Kalkulationen'),
		       					    id : 'billingCalculationContainer',
		       					    contentType: 'Calculation',
		       					    leaf:true
		       					},
		       					{
		       					    text: this.app.i18n._('Angebote'),
		       					    id : 'billingBidContainer',
		       					    contentType: 'Bid',
		       					    leaf:true
		       					},
		       					{
		       					    text: this.app.i18n._('Auftragsbestätigungen'),
		       					    id : 'billingConfirmContainer',
		       					    contentType: 'Confirm',
		       					    leaf:true
		       					},
		       					{
		       					    text: this.app.i18n._('Lieferscheine'),
		       					    id : 'billingShippingContainer',
		       					    contentType: 'Shipping',
		       					    leaf:true
		       					},
		       					{
		       					    text: this.app.i18n._('Rechnungen'),
		       					    id : 'billingInvoiceContainer',
		       					    contentType: 'Invoice',
		       					    leaf:true
		       					},{
		       					    text: this.app.i18n._('Gutschriften'),
		       					    id : 'billingCreditContainer',
		       					    contentType: 'Credit',
		       					    leaf:true
		       					},{
		       					    text: this.app.i18n._('Mahnungen'),
		       					    id : 'billingMonitionContainer',
		       					    contentType: 'Monition',
		       					    leaf:true
		       					},{
		       					    text: this.app.i18n._('Alle Belege'),
		       					    id : 'billingAllReceiptsContainer',
		       					    contentType: 'AllReceipts',
		       					    leaf:true
		       					}
		       			]
	            },{
	                text: this.app.i18n._('Lieferanten-Aufträge'),
	                id: 'billingSupplyOrderContainer',
	                contentType: 'SupplyOrder',
	                leaf: false,
	                children: [
	       					{
	       					    text: this.app.i18n._('Anfragen'),
	       					    id : 'billingSupplyQueryContainer',
	       					    contentType: 'SupplyQuery',
	       					    leaf:true
	       					},
	       					{
	       					    text: this.app.i18n._('Kostenangebote'),
	       					    id : 'billingSupplyOfferContainer',
	       					    contentType: 'SupplyOffer',
	       					    leaf:true
	       					},
	       					{
	       					    text: this.app.i18n._('Bestellungen'),
	       					    id : 'billingSupplyOrderOrderContainer',
	       					    contentType: 'SupplyOrderOrder',
	       					    leaf:true
	       					},
	       					{
	       					    text: this.app.i18n._('ER'),
	       					    id : 'billingSupplyInvoiceContainer',
	       					    contentType: 'SupplyInvoice',
	       					    leaf:true
	       					}
	       			]
            }]},{
            	 text: this.app.i18n._('Buchhaltung'),
        		 iconCls: 'BillingPayment',
                 id : 'fibu',
                 contentType: 'Fibu',
                 leaf:false,
                 children: [
       					 {
			                text: this.app.i18n._('Offene Posten'),
			                id: 'billingOpenItemContainer',
			                iconCls: 'BillingOpenItem',
			                contentType: 'OpenItem',
			                leaf: true
			            },{
			                text: this.app.i18n._('Zahlungen'),
			                id: 'billingPaymentContainer',
			                iconCls: 'BillingPayment',
			                contentType: 'Payment',
			                leaf: true
			            },{
			                text: this.app.i18n._('Kundenkonto'),
			                id: 'billingDebitorAccountContainer',
			                iconCls: 'Payment',
			                contentType: 'DebitorAccount',
			                leaf: true
			            },
						{
						    text: this.app.i18n._('Konten'),
						    id : 'billingAccountSystemContainer',
						    contentType: 'AccountSystem',
						    leaf:true
						},{
			                text: this.app.i18n._('Buchungen'),
			                id: 'billingBookingContainer',
			                iconCls: 'Payment',
			                contentType: 'Booking',
			                leaf: true
			            },{
			                text: this.app.i18n._('Einzelbuchungen'),
			                id: 'billingAccountBookingContainer',
			                iconCls: 'Payment',
			                contentType: 'AccountBooking',
			                leaf: true
			            },{
			                text: this.app.i18n._('Buchungsvorlagen'),
			                id: 'billingBookingTemplateContainer',
			                iconCls: 'Payment',
			                contentType: 'BookingTemplate',
			                leaf: true
			            }
       			]
        },{
                text: this.app.i18n._('Konfiguration'),
                iconCls: 'BillingConfig',
                id : 'billingConfig',
                contentType: 'Config',
                leaf:false,
                children: [
					{
					    text: this.app.i18n._('Einheiten'),
					    id : 'billingUnitContainer',
					    contentType: 'ArticleUnit',
					    leaf:true
					},
					{
					    text: this.app.i18n._('MwSt'),
					    id : 'billingVatContainer',
					    contentType: 'Vat',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Zahlungsarten'),
					    id : 'billingPaymentMethodContainer',
					    contentType: 'PaymentMethod',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Banken'),
					    id : 'bankContainer',
					    contentType: 'Bank',
					    leaf:true
					},
					{
					    text: this.app.i18n._('SEPA-Kreditoren'),
					    id : 'sepaCreditorContainer',
					    contentType: 'SepaCreditor',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Fibu-Kontenklassen'),
					    id : 'billingAccountClassContainer',
					    contentType: 'AccountClass',
					    leaf:true
					}
                ]
            },{
                text: this.app.i18n._('Verwaltung'),
                id : 'billingAdministrationContainer',
                iconCls: 'BillingAdmin',
                contentType: 'Administration',
                leaf:false,
                children: [
					{
					    text: this.app.i18n._('Artikelgruppen'),
					    id : 'billingArticleGroupContainer',
					    contentType: 'ArticleGroup',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Preisgruppen'),
					    id : 'billingPriceGroupContainer',
					    contentType: 'PriceGroup',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Kundengruppen'),
					    id : 'billingDebitorGroupContainer',
					    contentType: 'DebitorGroup',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Serien'),
					    id : 'billingArticleSeriesContainer',
					    contentType: 'ArticleSeries',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Artikel'),
					    id : 'billingArticleContainer',
					    contentType: 'Article',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Kunden'),
					    id : 'billingDebitorContainer',
					    contentType: 'Debitor',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Bankkonten'),
					    id : 'billingBankAccountContainer',
					    contentType: 'BankAccount',
					    leaf:true
					},
					{
					    text: this.app.i18n._('SEPA-Mandate'),
					    id : 'billingSepaMandateContainer',
					    contentType: 'SepaMandate',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Lieferanten'),
					    id : 'billingCreditorContainer',
					    contentType: 'Creditor',
					    leaf:true
					},
					{
					    text: this.app.i18n._('Lager'),
					    id : 'billingStockLocationContainer',
					    contentType: 'StockLocation',
					    leaf:true
					}
	            ]
            },{
	            text: this.app.i18n._('Auswertungen'),
	            id : 'reportContainer',
	            iconCls: 'BillingOrder',
	            expanded: true,
	            leaf:false,
	            children: [{
		                text: this.app.i18n._('Verkaufte Artikel'),
		                id: 'articleSoldContainer',
		                contentType: 'ArticleSold',
		                leaf: true
	                }]
            }]
        };
		
		if (Tine.Tinebase.common.hasRight('manage_mandators', 'Billing')){
			var mandators = [{
                text: this.app.i18n._('Mandanten'),
                id : 'billingMandatorContainer',
                iconCls: 'BillingAdmin',
                contentType: 'Mandators',
                leaf:false,
                children: [
					{
					    text: this.app.i18n._('Haupt'),
					    id : 'billingArticleGroupContainer',
					    contentType: 'ArticleGroup',
					    leaf:true
					}
				]
            }];
			
			this.root.children = mandators.concat(this.root.children); 
		}   
		
    	Tine.Billing.TreePanel.superclass.initComponent.call(this);
        this.on('click', function(node) {
            if (node.attributes.contentType !== undefined) {
                this.app.getMainScreen().activeContentType = node.attributes.contentType;
                /*
                if(node.attributes.id == 'brevetationMasterBillingContainer'){
                	 this.app.getMainScreen().setBillingMasterEmbedded(true);
                }else{
                	this.app.getMainScreen().setBillingMasterEmbedded(false);
                }*/
                this.app.getMainScreen().show();
            }
        }, this);
	}
});
Ext.reg('tine.billing.treepanel',Tine.Billing.TreePanel);

