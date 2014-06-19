Ext.ns('Tine.Billing');

Tine.Billing.creditorBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Creditor',
	   recordClass: Tine.Billing.Model.Creditor
});

Tine.Billing.debitorBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Debitor',
	   recordClass: Tine.Billing.Model.Debitor
});

Tine.Billing.debitorAccountBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'DebitorAccount',
	   recordClass: Tine.Billing.Model.DebitorAccount
});

Tine.Billing.bankBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Bank',
	   recordClass: Tine.Billing.Model.Bank
});

Tine.Billing.bankAccountBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BankAccount',
	   recordClass: Tine.Billing.Model.BankAccount
});

Tine.Billing.bankAccountUsageBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BankAccountUsage',
	   recordClass: Tine.Billing.Model.BankAccountUsage
});

Tine.Billing.sepaCreditorBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SepaCreditor',
	   recordClass: Tine.Billing.Model.SepaCreditor
});

Tine.Billing.sepaMandateBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SepaMandate',
	   recordClass: Tine.Billing.Model.SepaMandate
});

Tine.Billing.vatBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'Vat',
	   recordClass: Tine.Billing.Model.Vat
});

Tine.Billing.accountClassBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'AccountClass',
	   recordClass: Tine.Billing.Model.AccountClass
});

Tine.Billing.accountSystemBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'AccountSystem',
	   recordClass: Tine.Billing.Model.AccountSystem
});

Tine.Billing.bookingBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'Booking',
	   recordClass: Tine.Billing.Model.Booking
});

Tine.Billing.accountBookingBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'AccountBooking',
	   recordClass: Tine.Billing.Model.AccountBooking
});

Tine.Billing.bookingTemplateBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'BookingTemplate',
	   recordClass: Tine.Billing.Model.BookingTemplate
});

Tine.Billing.accountBookingTemplateBackend = new Tine.Tinebase.data.RecordProxy
({
	   appName: 'Billing',
	   modelName: 'AccountBookingTemplate',
	   recordClass: Tine.Billing.Model.AccountBookingTemplate
});


Tine.Billing.getVatStore = function() {

    var store = Ext.StoreMgr.get('Billing_Vat_Store');
    
    if (!store) {
    	store = new Ext.data.JsonStore({
            fields: Tine.Billing.Model.Vat,
            baseParams: {
                method: 'Billing.searchVats'
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            remoteSort: false
        });
    	store.reload();
        Ext.StoreMgr.add('Billing_Vat_Store', store);
    }
    return store;
};

// preload store at once
//Tine.Billing.getVatStore();

Tine.Billing.getVatDefault = function(){
	var vatStore = Tine.Billing.getVatStore();
	var defaultIndex = vatStore.find('is_default','1');
	return vatStore.getAt(defaultIndex);
};

Tine.Billing.getZeroVat = function(){
	var vatStore = Tine.Billing.getVatStore();
	var defaultIndex = vatStore.find('name','0');
	return vatStore.getAt(defaultIndex);
};


Tine.Billing.getVatById = function(id){
	var vatStore = Tine.Billing.getVatStore();
	if(id.id !== undefined){
		id = id.id;
	}
	var index = vatStore.find('id',id);
	var record = vatStore.getAt(index);
	return new Tine.Billing.Model.Vat(record.data, record.id);
}

Tine.Billing.priceGroupBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'PriceGroup',
	   recordClass: Tine.Billing.Model.PriceGroup
});

Tine.Billing.debitorGroupBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'DebitorGroup',
	   recordClass: Tine.Billing.Model.DebitorGroup
});

Tine.Billing.paymentMethodBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'PaymentMethod',
	   recordClass: Tine.Billing.Model.PaymentMethod
});

Tine.Billing.getPriceGroupStore = function() {

    var store = Ext.StoreMgr.get('Billing_PriceGroup_Store');
    
    if (!store) {
    	store = new Ext.data.JsonStore({
            fields: Tine.Billing.Model.PriceGroup,
            baseParams: {
                method: 'Billing.searchPriceGroups'
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            remoteSort: false
        });
    	store.reload();
        Ext.StoreMgr.add('Billing_PriceGroup_Store', store);
    }
    return store;
};

Tine.Billing.articleGroupBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleGroup',
	   recordClass: Tine.Billing.Model.ArticleGroup
});

Tine.Billing.articleSoldBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleSold',
	   recordClass: Tine.Billing.Model.ArticleSold
});


Tine.Billing.stockLocationBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'StockLocation',
	   recordClass: Tine.Billing.Model.StockLocation
});

Tine.Billing.articleUnitBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleUnit',
	   recordClass: Tine.Billing.Model.ArticleUnit
});  

Tine.Billing.articleBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Article',
	   recordClass: Tine.Billing.Model.Article
});  


Tine.Billing.sellPriceBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SellPrice',
	   recordClass: Tine.Billing.Model.SellPrice
}); 


Tine.Billing.articleSupplierBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleSupplier',
	   recordClass: Tine.Billing.Model.ArticleSupplier
});

Tine.Billing.articleSupplyBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleSupply',
	   recordClass: Tine.Billing.Model.ArticleSupply
});

Tine.Billing.stockFlowBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'StockFlow',
	   recordClass: Tine.Billing.Model.StockFlow
});

Tine.Billing.articleCustomerBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleCustomer',
	   recordClass: Tine.Billing.Model.ArticleCustomer
});

Tine.Billing.jobBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Job',
	   recordClass: Tine.Billing.Model.Job
});

Tine.Billing.batchJobBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BatchJob',
	   recordClass: Tine.Billing.Model.BatchJob
});

Tine.Billing.batchJobDtaBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BatchJobDta',
	   recordClass: Tine.Billing.Model.BatchJobDta
});

Tine.Billing.batchJobDtaItemBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BatchJobDtaItem',
	   recordClass: Tine.Billing.Model.BatchJobDtaItem
});

Tine.Billing.batchJobMonitionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BatchJobMonition',
	   recordClass: Tine.Billing.Model.BatchJobMonition
});

Tine.Billing.batchJobMonitionItemBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'BatchJobMonitionItem',
	   recordClass: Tine.Billing.Model.BatchJobMonitionItem
});

Tine.Billing.orderBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Order',
	   recordClass: Tine.Billing.Model.Order
});

Tine.Billing.supplyOrderBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SupplyOrder',
	   recordClass: Tine.Billing.Model.SupplyOrder
});

Tine.Billing.receiptBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Receipt',
	   recordClass: Tine.Billing.Model.Receipt
});

Tine.Billing.supplyReceiptBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SupplyReceipt',
	   recordClass: Tine.Billing.Model.SupplyReceipt
});

Tine.Billing.orderPositionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'OrderPosition',
	   recordClass: Tine.Billing.Model.OrderPosition
});

Tine.Billing.receiptPositionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ReceiptPosition',
	   recordClass: Tine.Billing.Model.OrderPosition
});

Tine.Billing.supplyorderPositionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'SupplyOrderPosition',
	   recordClass: Tine.Billing.Model.SupplyOrderPosition
});

Tine.Billing.openItemBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'OpenItem',
	   recordClass: Tine.Billing.Model.OpenItem
});

Tine.Billing.openItemMonitionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'OpenItemMonition',
	   recordClass: Tine.Billing.Model.OpenItemMonition
});

Tine.Billing.mt940PaymentBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'MT940Payment',
	   recordClass: Tine.Billing.Model.MT940Payment
});

Tine.Billing.paymentBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Payment',
	   recordClass: Tine.Billing.Model.Payment
});

Tine.Billing.productionCostBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ProductionCost',
	   recordClass: Tine.Billing.Model.ProductionCost
});

Tine.Billing.orderTemplateBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'OrderTemplate',
	   recordClass: Tine.Billing.Model.OrderTemplate
});

Tine.Billing.orderTemplatePositionBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'OrderTemplatePosition',
	   recordClass: Tine.Billing.Model.OrderTemplatePosition
});

Tine.Billing.articleSeriesBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'ArticleSeries',
	   recordClass: Tine.Billing.Model.ArticleSeries
});

Tine.Billing.getStore = function(model, getMethod) {
	var key = 'sm' + model.getMeta('modelName');
    var store = Ext.StoreMgr.get(key);
    if (!store) {
    	store = new Ext.data.JsonStore({
            fields: model,
            baseParams: {
                method: getMethod
            },
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            remoteSort: false
        });
    	store.reload();
        Ext.StoreMgr.add(key, store);
    }
    return store;
};

Tine.Billing.getPriceGroupById = function(id){
	var priceGroupStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
	if(id.id !== undefined){
		id = id.id;
	}
	var index = priceGroupStore.find('id',id);
	var record = priceGroupStore.getAt(index);
	return new Tine.Billing.Model.PriceGroup(record.data, record.id);
};

Tine.Billing.getPriceGroupDefault = function(){
	var pStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
	var defaultIndex = pStore.findExact('is_default','1');
	return pStore.getAt(defaultIndex);
};

Tine.Billing.getStockLocationDefault = function(){
	var store = Tine.Billing.getStoreFromRegistry('StockLocation');
	var defaultIndex = store.findExact('is_default','1');
	return store.getAt(defaultIndex);
};

Tine.Billing.getStoreFromRegistry = function(modelName){
	switch(modelName){
	case 'StockLocation':
	case 'ArticleGroup':
	case 'PriceGroup':
	case 'Vat':
	case 'ArticleUnit':
	case 'AccountSystem':
		var key = 'sm_reg_records' + modelName;
	    var store = Ext.StoreMgr.get(key);
	    if (!store) {
	    	var data = Tine.Billing.registry.get(modelName);
			store = new Ext.data.JsonStore({
	            fields: Tine.Billing.Model[modelName],
	            root: 'results',
	            totalProperty: 'totalcount',
	            id: 'id'
	        });
	    	store.loadData(data);
	    	Ext.StoreMgr.add(key, store);
	    }
	    return store;
		break;
	}
	throw 'Unsupported model, not to be delivered by registry!';
};

Tine.Billing.getArrayFromRegistry = function(registryKey){
	if(registryKey.indexOf('.')>-1){
		var keys = registryKey.split('.');
		var array = Tine.Billing.registry.get(keys[0]);
		var strIndex = '';
		var prefix = '';
		for(var i = 1; i<keys.length;i++){
			strIndex +=  prefix + keys[i];
			if(prefix==''){
				prefix = '.';
			}
		}
		return array[strIndex];
	}else if (Tine.Billing.registry.get(registryKey)) {
		return Tine.Billing.registry.get(registryKey);
	}
	return [];
};

/**
 * get attender role store
 * if available, load data from initial data
 * 
 * @return Ext.data.JsonStore with salutations
 */
Tine.Billing.getSimpleStore = function(modelName) {
	switch(modelName){
    case 'PaymentMethod':
    	return Tine.Billing.getArrayFromRegistry('PaymentMethods');
    case 'ArticleGroup':
    	return Tine.Billing.getArrayFromRegistry('ArticleGroups');
    case 'DebitorGroup':
    	return Tine.Billing.getArrayFromRegistry('DebitorGroups');
    case 'ArticleSeries':
    	return Tine.Billing.getArrayFromRegistry('ArticleSeriess');
    case 'AccountSystem':
    	return Tine.Billing.getArrayFromRegistry('AccountSystems');
    case 'AccountClass':
    	return Tine.Billing.getArrayFromRegistry('AccountClasss');
    default:
    	throw 'Unknown model for store';
    }
};



