Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.SupplyReceiptGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	stateFull:true,
	id: 'tine-billing-supply-receipt-gridpanel',
	supplyReceiptType: null,
	recordClass: Tine.Billing.Model.SupplyReceipt,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    supplyOrderRecord: null,
    useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.supplyReceiptBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.SupplyReceiptGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.SupplyReceipt.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []
        });
		//this.filterToolbar.filters.push({field:'type',operator:'equals',value:this.supplyReceiptType});
    },
    loadSupplyOrder: function( supplyOrderRecord ){
    	this.supplyOrderRecord = supplyOrderRecord;
    	this.store.reload();
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.SupplyReceiptGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(this.useTypeFilter){
    	options.params.filter.push({field:'type',operator:'equals',value:this.supplyReceiptType});
    	}
    	if(!this.supplyOrderRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.supplyOrderRecord;
    	filterOptions.field = 'supply_order_id';
    
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
    		return false;
    	}
    	var recordId = filterOptions.record.get('id');
    	if(recordId == 0 || recordId == undefined){
    		recordId = -1;
    	}
    	//alert(recordId);
    	var filter = {	
			field: filterOptions.field,
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: recordId }]
		};
        options.params.filter.push(filter);
    },
    onEditInNewWindow: function(button, event) {
        var record; 
        if (button.actionType == 'edit') {
            if (! this.action_editInNewWindow || this.action_editInNewWindow.isDisabled()) {
                // if edit action is disabled or not available, we also don't open a new window
                return false;
            }
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = selectedRows[0];
            
        } else if (button.actionType == 'copy') {
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = this.copyRecord(selectedRows[0].data);

        } else {
            record = new this.recordClass(this.recordClass.getDefaultData(), 0);
        }
        
        var supplyReceiptClass;
        switch(this.supplyReceiptType){
        case 'SPQUERY':
        	supplyReceiptClass = Tine.Billing.SupplyQueryEditDialog;
        	break;
        case 'SPOFFER':
        	supplyReceiptClass = Tine.Billing.SupplyOfferEditDialog;
        	break;
        case 'SPORDER':
        	supplyReceiptClass = Tine.Billing.SupplyOrderOrderEditDialog;
        	break;
        case 'SPINVOICE':
        	supplyReceiptClass = Tine.Billing.SupplyInvoiceEditDialog;
        	break;
        }
        
        var popupWindow = supplyReceiptClass.openWindow({
        	record: record,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    }
});

Tine.Billing.AllSupplyReceiptsGridPanel = Ext.extend(Tine.Billing.SupplyReceiptGridPanel, {
	id: 'tine-billing-all-supply-receipts-gridpanel',
	stateId: 'tine-billing-all-supply-receipts-gridpanel',
	grouping: true,
    groupField: 'type',
    groupTextTpl: '{text} ({[values.rs.length]})',
    useTypeFilter: false, // don't use type filter -> all receipts of this order are displayed
    gridConfig: {
    	id: 'tine-billing-all-supply-receipts-gridpanel-grid',
        loadMask: true,
        autoExpandColumn: 'id',
        grouping: true,
        groupField: 'type',
        groupTextTpl: '{text} ({[values.rs.length]})'
    },
    initComponent: function() {
    	Ext.apply(this,this.initialConfig);
        this.grouping = true;
        this.groupField = 'text';
    	Tine.Billing.AllSupplyReceiptsGridPanel.superclass.initComponent.call(this);
    },
  getColumns: function() {
		var columns = Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns();
		return [
		  /// columns.type,
		   columns.order_nr,
		   columns.supplier_order_nr,
		   columns.supply_request_nr,
		   columns.supply_offer_nr,
		   columns.supply_order_nr,
		   columns.supply_inc_inv_nr,
		   columns.discount_percentage,
		   columns.discount_total,
//		   columns.request_date,
//		   columns.offer_date,
//		   columns.offer_shipping_date,
//		   columns.order_shipping_date,
//		   columns.shipping_date,
//		   columns.order_confirm_date,
//		   columns.inc_invoice_date,
//		   columns.inc_invoice_postal_date
		   
	    ];
	},
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.SupplyReceiptGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	if(!this.supplyOrderRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.supplyOrderRecord;
    	filterOptions.field = 'supply_order_id';
    
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
    		return false;
    	}
    	var recordId = filterOptions.record.get('id');
    	if(recordId == 0 || recordId == undefined){
    		recordId = -1;
    	}
    	//alert(recordId);
    	var filter = {	
			field: filterOptions.field,
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: recordId }]
		};
        options.params.filter.push(filter);
    },
    onStoreLoad: function(store, records, options) {
    	Tine.Billing.SupplyReceiptGridPanel.superclass.onStoreLoad.call(this, store, records, options);
    	store.groupBy(this.groupField);
    },
    onEditInNewWindow: function(button, event) {
        var record; 
        if (button.actionType == 'edit') {
            if (! this.action_editInNewWindow || this.action_editInNewWindow.isDisabled()) {
                // if edit action is disabled or not available, we also don't open a new window
                return false;
            }
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = selectedRows[0];
            
        } else if (button.actionType == 'copy') {
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = this.copyRecord(selectedRows[0].data);

        } else {
            record = new this.recordClass(this.recordClass.getDefaultData(), 0);
        }
        
       
        switch(record.data.type){
        case 'SPQUERY':
        	supplyReceiptClass = Tine.Billing.SupplyQueryEditDialog;
        	break;
        case 'SPOFFER':
        	supplyReceiptClass = Tine.Billing.SupplyOfferEditDialog;
        	break;
        case 'SPORDER':
        	supplyReceiptClass = Tine.Billing.SupplyOrderOrderEditDialog;
        	break;
        case 'SPINVOICE':
        	supplyReceiptClass = Tine.Billing.SupplyInvoiceEditDialog;
        	break;
        }
        
        var popupWindow = supplyReceiptClass.openWindow({
        	record: record,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    }
});

Tine.Billing.SupplyQueryGridPanel = Ext.extend(Tine.Billing.SupplyReceiptGridPanel, {
	supplyReceiptType: 'SPQUERY',
	id: 'tine-billing-supply-query-gridpanel',
	stateId: 'tine-billing-supply-query-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-supply-query-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.SupplyQueryGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns();
		return [
		   columns.supply_order_nr,
		   columns.supplier_order_nr,
		   columns.request_date
	    ];
	}
});

Tine.Billing.SupplyOfferGridPanel = Ext.extend(Tine.Billing.SupplyReceiptGridPanel, {
	supplyReceiptType: 'SPOFFER',
	id: 'tine-billing-supply-offer-gridpanel',
	stateId: 'tine-billing-supply-offer-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-supply-offer-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.SupplyOfferGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns();
		return [
		   columns.supply_offer_nr,
		   columns.offer_date,
		   columns.offer_shipping_date,
		   columns.discount_percentage,
		   columns.discount_total
	    ];
	}
});

Tine.Billing.SupplyOrderOrderGridPanel = Ext.extend(Tine.Billing.SupplyReceiptGridPanel, {
	supplyReceiptType: 'SPORDER',
	id: 'tine-billing-supply-order-order-gridpanel',
	stateId: 'tine-billing-supply-order-order-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-supply-order-order-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.SupplyOrderOrderGridPanel.superclass.initComponent.call(this);
    },
  getColumns: function() {
		var columns = Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns();
		return [
		   columns.supply_order_nr,
		   columns.supplier_order_nr,
		   columns.request_date,
		   columns.order_date,
		   columns.order_confirm_date,
		   columns.order_shipping_date,
		   columns.shipping_date//,
		   //columns.order_state
	    ];
	}
});

Tine.Billing.SupplyInvoiceGridPanel = Ext.extend(Tine.Billing.SupplyReceiptGridPanel, {
	supplyReceiptType: 'SPINVOICE',
	id: 'tine-billing-supply-invoice-gridpanel',
	stateId: 'tine-billing-supply-invoice-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-supply-invoice-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.SupplyInvoiceGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns();
		return [
		   columns.supply_inc_inv_nr
	    ];
	}
});

Ext.namespace('Tine.Billing.SupplyReceipt.GridPanelConfig');

Tine.Billing.SupplyReceipt.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		id:
			{ id: 'id', header: app.i18n._('Nummer'), dataIndex: 'id', sortable:true },
		supply_order_id:
			{ id: 'supply_order_id', header: app.i18n._('Auftrags-Nr'), dataIndex: 'supply_order_id', sortable:true },			
		type:
			{ id: 'type', header: app.i18n._('Typ'), dataIndex: 'type', sortable:true },
		order_nr:
			{ id: 'order_nr', header: app.i18n._('Lieferauftrag-Nr'), dataIndex: 'order_nr', sortable:true },
		supplier_order_nr:
			{ id: 'supplier_order_nr', header: app.i18n._('Bestell-Nr Lieferant'), dataIndex: 'supplier_order_nr', sortable:true },
		supply_request_nr:
			{ id: 'supply_request_nr', header: app.i18n._('Anfrage-Nr'), dataIndex: 'supply_request_nr', sortable:true },			
		supply_offer_nr:
			{ id: 'supply_offer_nr', header: app.i18n._('Lieferangebot-Nr'), dataIndex: 'supply_offer_nr', sortable:true },
		supply_order_nr:
			{ id: 'supply_order_nr', header: app.i18n._('Bestell-Nr'), dataIndex: 'supply_order_nr', sortable:true },			
		supply_inc_inv_nr:
			{ id: 'supply_inc_inv_nr', header: app.i18n._('ER-Nr'), dataIndex: 'supply_inc_inv_nr', sortable:true },				
		discount_percentage:
			{ id: 'discount_percentage', header: app.i18n._('Rabatt Gesamtsumme %'), dataIndex: 'discount_percentage', sortable:true },				
		discount_total:
			{ id: 'discount_total', header: app.i18n._('Rabatt Gesamtsumme EUR'), dataIndex: 'discount_total', sortable:true },				
		request_date:
			{ id: 'request_date', header: app.i18n._('Datum Anfrage'), dataIndex: 'request_date', sortable:true },				
		offer_date:
			{ id: 'supply_order_nr', header: app.i18n._('Datum Angebot'), dataIndex: 'offer_date', sortable:true },				
		offer_shipping_date:
			{ id: 'offer_shipping_date', header: app.i18n._('Lieferdatum Angebot'), dataIndex: 'offer_shipping_date', sortable:true },				
		order_shipping_date:
			{ id: 'order_shipping_date', header: app.i18n._('Lieferdatum Bestellung'), dataIndex: 'order_shipping_date', sortable:true },				
		offer_shipping_date:
			{ id: 'offer_shipping_date', header: app.i18n._('Lieferdatum Angebot'), dataIndex: 'offer_shipping_date', sortable:true },				
		shipping_date:
			{ id: 'shipping_date', header: app.i18n._('Lieferdatum'), dataIndex: 'shipping_date', sortable:true },				
		order_confirm_date:
			{ id: 'order_confirm_date', header: app.i18n._('Datum Bestätigung Lieferauftrag'), dataIndex: 'order_confirm_date', sortable:true },				
		order_date:
			{ id: 'order_date', header: app.i18n._('Datum Bestellung'), dataIndex: 'order_date', sortable:true },				
		inc_invoice_date:
			{ id: 'inc_invoice_date', header: app.i18n._('Datum ER'), dataIndex: 'inc_invoice_date', sortable:true },				
		inc_invoice_postal_date:
			{ id: 'inc_invoice_postal_date', header: app.i18n._('Datum ER Posteingang'), dataIndex: 'inc_invoice_postal_date', sortable:true }		
	};
}