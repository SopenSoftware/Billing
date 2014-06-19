Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.ReceiptGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	stateFull:true,
	receiptType: null,
	recordClass: Tine.Billing.Model.Receipt,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    orderRecord: null,
    useTypeFilter: true,
    useTypeCombiFilter: false,
    combiType: [],
    additionalFilters:[],
    defaultFilter: {field:'creation_time',operator:'within',value:'dayThis'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id'
    },
    crud:{
    	_add:false,
    	_edit:true,
    	_delete:true
    },
    initComponent: function() {
    	this.app = Tine.Tinebase.appMgr.get('Billing');
    	this.recordProxy = Tine.Billing.receiptBackend;
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.ReceiptGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	this.printOriginal = 'Beleg drucken';
		this.printCopy = 'Beleg in Kopie drucken';
		this.printText = this.printOriginal;
        this.printReceiptButton = new Ext.Action({
            id: 'printReceiptButton',
            text: this.printText,
            handler: this.printReceipt,
            iconCls: 'action_exportAsPdf',
            disabled: false,
            scope: this
        });
        this.printReceiptCopyButton = new Ext.Action({
            id: 'printReceiptCopyButton',
            text: this.printCopy,
            handler: this.printReceiptCopy,
            iconCls: 'action_exportAsPdf',
            disabled: false,
            scope: this
        });
        this.printReceiptPreviewButton = new Ext.Action({
            id: 'printReceiptPreviewButton',
            text: 'PDF Vorschau',
            handler: this.printReceiptPreview,
            iconCls: 'action_exportAsPdf',
            disabled: false,
            scope: this
        });
        this.action_editPayment = new Ext.Action({
            text: 'Zahlung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditPayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editBooking = new Ext.Action({
            text: 'FIBU-Buchung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditBooking,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        Tine.Billing.ReceiptGridPanel.superclass.initActions.call(this);
    },
    getContextMenuItems: function(){
    	//var contextMenuItems = Tine.Billing.ReceiptGridPanel.superclass.getContextMenuItems.call(this);
    	//return contextMenuItems.concat(
    	return		 [
    	    	  '-',
    	    	  this.printReceiptButton,
    	    	  this.printReceiptCopyButton,
    	    	  this.printReceiptPreviewButton,
    	    	  this.action_editPayment,
    	    	  this.action_editBooking
    	    	];	
    	//);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Receipt.getFilterModel(),
            defaultFilter: 'query',
            filters: [this.defaultFilter],
            plugins: []
        });
		//this.filterToolbar.filters.push({field:'type',operator:'equals',value:this.receiptType});
    },
    onEditPayment: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('payment_id')){
		   	this.lastReceiptWin = Tine.Billing.PaymentEditDialog.openWindow({
				record: new Tine.Billing.Model.Payment({id:selectedRecord.getForeignId('payment_id')},selectedRecord.getForeignId('payment_id'))
			});
		}
	},
	onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},
    loadOrder: function( orderRecord ){
    	this.orderRecord = orderRecord;
    	this.store.reload();
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.ReceiptGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(this.useTypeFilter){
    		options.params.filter.push({field:'type',operator:'equals',value:this.receiptType});
    	}
    	if(this.useTypeCombiFilter){
    		options.params.filter.push({field:'combi_type',operator:'in',value:this.combiType});
    	}
    	if(this.additionalFilters){
    		options.params.filter = options.params.filter.concat(this.additionalFilters);
    	}
    	if(!this.orderRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.orderRecord;
    	filterOptions.field = 'order_id';
    
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
        var type = record.get('type');
        var receiptClass;
        switch(type){
        case 'CALCULATION':
        	receiptClass = Tine.Billing.CalculationEditDialog;
        	break;
        case 'BID':
        	receiptClass = Tine.Billing.BidEditDialog;
        	break;
        case 'CONFIRM':
        	receiptClass = Tine.Billing.ConfirmEditDialog;
        	break;
        case 'SHIPPING':
        	receiptClass = Tine.Billing.ShippingEditDialog;
        	break;
        case 'INVOICE':
        	receiptClass = Tine.Billing.InvoiceEditDialog;
        	break;
        case 'CREDIT':
        	receiptClass = Tine.Billing.CreditEditDialog;
        	break;
        case 'MONITION':
        	receiptClass = Tine.Billing.MonitionEditDialog;
        	break;
        }
        
        var popupWindow = receiptClass.openWindow({
        	record: record,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    },
    printReceiptPreview: function(){
    	this.printReceipt(true);
    },
    printReceiptCopy: function(){
    	this.printReceipt(false,true);
    },
    getSelectedIds: function(){
		 var selectedRows = this.grid.getSelectionModel().getSelections();
		 var result = [];
		 for(var i in selectedRows){
			 result.push(selectedRows[i].id);
		 }
		 return result;
	},
    printReceipt: function(preview,copy){
    	var selIds = this.getSelectedIds();
    	if(selIds.length==0){
    		return false;
    	}
    	var receiptParam = Ext.util.JSON.encode(selIds);
    	var requestStr = '?method=Billing.printReceipts&ids='+receiptParam;
    	if(preview==true){
    		requestStr += '&preview=true';
    	}
    	if(copy==true){
    		requestStr += '&copy=true';
    	}
		window.open(
				Sopen.Config.runtime.requestURI + requestStr,
				"confirmationsPDF",
				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		);
		if(preview !== true && copy!==true){
			this.initRecord.defer(500,this);
		}
    }
});

Tine.Billing.AllReceiptsGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	id: 'tine-billing-all-receipts-gridpanel',
    grouping: true,
    groupField: 'type',
    groupTextTpl: '{text} ({[values.rs.length]})',
    useTypeFilter: false, // don't use type filter -> all receipts of this order are displayed
    gridConfig: {
    	id: 'tine-billing-all-receipts-gridpanel-grid',
        loadMask: true,
        autoExpandColumn: 'id',
        grouping: true,
        groupField: 'type',
        groupTextTpl: '{text} ({[values.rs.length]})'
    },
    initComponent: function() {
    	Ext.apply(this,this.initialConfig);
        this.grouping = true;
        this.groupField = 'type';
    	Tine.Billing.AllReceiptsGridPanel.superclass.initComponent.call(this);
    },
  getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.type,
		   columns.calc_nr,
		   columns.bid_nr,
		   columns.confirm_nr,
		   columns.ship_nr,
		   columns.invoice_nr,
		   columns.credit_nr,
		   columns.monition_nr,
		   columns.pos_count,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.erp_context_id,
		   //columns.total_weight,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.creation_time,
		   columns.last_modified_time
	    ];
	},
    onStoreLoad: function(store, records, options) {
    	Tine.Billing.ReceiptGridPanel.superclass.onStoreLoad.call(this, store, records, options);
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
        case 'CALCULATION':
        	receiptClass = Tine.Billing.CalculationEditDialog;
        	break;
        case 'BID':
        	receiptClass = Tine.Billing.BidEditDialog;
        	break;
        case 'CONFIRM':
        	receiptClass = Tine.Billing.ConfirmEditDialog;
        	break;
        case 'SHIPPING':
        	receiptClass = Tine.Billing.ShippingEditDialog;
        	break;
        case 'INVOICE':
        	receiptClass = Tine.Billing.InvoiceEditDialog;
        	break;
        case 'CREDIT':
        	receiptClass = Tine.Billing.CreditEditDialog;
        	break;
        case 'MONITION':
        	receiptClass = Tine.Billing.MonitionEditDialog;
        	break;
        }
        
        var popupWindow = receiptClass.openWindow({
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

Tine.Billing.CalculationGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'CALCULATION',
	id: 'tine-billing-calculation-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-calculation-gridpanel-grid'
    },
    initComponent: function() {
        Tine.Billing.CalculationGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.calc_nr,
		   columns.erp_context_id,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.creation_time,
		   columns.last_modified_time
	    ];
	}
});

Tine.Billing.BidGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'BID',
	id: 'tine-billing-bid-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-bid-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.BidGridPanel.superclass.initComponent.call(this);
    },
  getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.calc_nr,
		   columns.bid_nr,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.pos_count,
		   columns.erp_context_id,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.creation_time,
		   columns.last_modified_time
	    ];
	}
});

Tine.Billing.ConfirmGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'CONFIRM',
	id: 'tine-billing-confirm-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-confirm-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.ConfirmGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.confirm_nr,
		   columns.order_id,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.pos_count,
		   columns.calc_nr,
		   columns.erp_context_id,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.creation_time,
		   columns.last_modified_time
	    ];
	}
});

Tine.Billing.ShippingGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'SHIPPING',
	id: 'tine-billing-shipping-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-shipping-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.ShippingGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.ship_nr,
		   columns.order_id,
		   columns.pos_count,
		   //columns.total_weight,
		   columns.usage,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.created_by,
           columns.creation_time,
		   columns.last_modified_time
	    ];
	},
    getContextMenuItems: function(){
    	return Tine.Billing.ShippingGridPanel.superclass.getContextMenuItems.call(this);
    }
});

Tine.Billing.InvoiceGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'INVOICE',
	id: 'tine-billing-invoice-gridpanel',
	useTypeFilter: true,
	useDetailsPanel:true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-invoice-gridpanel-grid',
    },
    initComponent: function() {
    	if(this.useDetailsPanel){
    		this.initDetailsPanel();
    	}
    	this.action_payInvoice = new Ext.Action({
            text: 'Rechnung bezahlen',
            disabled: true,
            actionType: 'edit',
            handler: this.payInvoice,
            actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
    	this.action_reverseInvoice = new Ext.Action({
            id: 'reverseButton',
            text: 'Stornieren',
            handler: this.askReverse,
            disabled: false,
            scope: this
        });
        Tine.Billing.InvoiceGridPanel.superclass.initComponent.call(this);
        this.actionUpdater.addActions([this.action_payInvoice]);
    },
    updatePayInvoiceAction: function(action, grants, records) {
    	action.setDisabled(true);
        if (records.length == 1) {
            var invoice = records[0];
            if (! invoice) {
                return false;
            }
            var isPayed = invoice.get('payment_state')=='PAYED';

            if(!isPayed){
            	action.setDisabled(false);
            }
        }
    },
    payInvoice: function(){
    	var selectedRows = this.grid.getSelectionModel().getSelections();
        record = selectedRows[0];
        
    	var win = Tine.Billing.PaymentEditDialog.openWindow({
    		record: null,
    		receiptRecord: record,
			listeners: {
                scope: this,
                'update': function(record) {
                    this.grid.getStore().reload();
                }
            }
		});
    },
    getSelectedId: function(){
		 var selectedRows = this.grid.getSelectionModel().getSelections();
		 
		 var result = [];
		 for(var i in selectedRows){
			 if(selectedRows[i]!== undefined && selectedRows[i].id !== undefined){
				 result.push(selectedRows[i].id);
			 }
		 }
		 return result;
	},
	askReverse: function(){
		Ext.MessageBox.show({
            title: 'Hinweis', 
            msg: 'Möchten Sie die Rechnung stornieren?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.reverseInvoice,
            icon: Ext.MessageBox.INFO
        });
	},
	reverseInvoice: function(){
		var selId = this.getSelectedId();
    	if(selId.length>1){
    		return false;
    	}
		Ext.Ajax.request({
            scope: this,
            success: this.onReverseInvoice,
            params: {
                method: 'Billing.reverseInvoice',
               	receiptId:  selId[0]
            },
            failure: this.onReverseInvoiceFailed
        });
	},
	onReverseInvoice: function(response){
		this.reverseInvoiceResponse = response;
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Rechnung wurde erfolgreich storniert.</br>Möchten Sie den Gutschriftsbeleg öffnen?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.showCreditDialog,
            icon: Ext.MessageBox.INFO
        });
	},
	onReverseInvoiceFailed: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Rechnung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	showCreditDialog: function(){
		var result = Ext.util.JSON.decode(this.reverseInvoiceResponse.responseText);
		if(result){
			var record = new Tine.Billing.Model.Receipt(result, result.id);
			Tine.Billing.CreditEditDialog.openWindow({
				record:record
			});
		}
	},
    getContextMenuItems: function(){
    	var contextMenuItems = Tine.Billing.InvoiceGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        this.action_payInvoice,
    	        '-',
    	        this.action_reverseInvoice
    	]);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.order_id,
		   columns.invoice_nr,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.open_sum,
		   columns.payed_sum,
		   columns.pos_count,
		   columns.receipt_state,
		   
		   {id: 'invoice_invoice_date', header: this.app.i18n._('Rechnungsdatum'), dataIndex: 'invoice_date', sortable:false, renderer: Tine.Tinebase.common.dateRenderer  },
		   
		   { id: 'invoice_payment_state', header: this.app.i18n._('Zahlungsstatus'), dataIndex: 'payment_state', sortable:false, renderer:Tine.Billing.getPaymentStateIcon  },
		   { id: 'invoice_payment_type', header: this.app.i18n._('Zahlungsart'), dataIndex: 'payment_method_id', sortable:false, renderer:Tine.Billing.renderer.paymentMethodRenderer  },
		   { id: 'invoice_due_date', header: this.app.i18n._('Fällig am'), dataIndex: 'due_date', sortable:false, renderer: Tine.Tinebase.common.dateRenderer  },
		   columns.erp_context_id,
		   columns.usage,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
           columns.created_by,
           columns.creation_time,
		   columns.last_modified_time,
		   columns.is_cancelled,
		   columns.is_cancellation,
		   columns.booking_id,
		   columns.payment_id
	    ];
	},
	 initDetailsPanel: function() {
	        this.detailsPanel = new Tine.widgets.grid.DetailsPanel({
	            gridpanel: this,
	            
	            // use default Tpl for default and multi view
	            defaultTpl: new Ext.XTemplate(
	                '<div class="preview-panel-timesheet-nobreak">',
	                    '<!-- Preview timeframe -->',           
	                    '<div class="preview-panel preview-panel-timesheet-left">',
	                        '<div class="bordercorner_1"></div>',
	                        '<div class="bordercorner_2"></div>',
	                        '<div class="bordercorner_3"></div>',
	                        '<div class="bordercorner_4"></div>',
	                        '<div class="preview-panel-declaration">' /*+ this.app.i18n._('timeframe')*/ + '</div>',
	                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
	                            '<span class="preview-panel-bold">',
	                            /*'First Entry'*/'<br/>',
	                            /*'Last Entry*/'<br/>',
	                            /*'Last Entry*/'<br/>',
	                            /*'Duration*/'<br/>',
	                            '<br/>',
	                            '</span>',
	                        '</div>',
	                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
	                            '<span class="preview-panel-nonbold">',
	                            '<br/>',
	                            '<br/>',
	                            '<br/>',
	                            '<br/>',
	                            '</span>',
	                        '</div>',
	                    '</div>',
	                    '<!-- Preview summary -->',
	                    '<div class="preview-panel-timesheet-right">',
	                        '<div class="bordercorner_gray_1"></div>',
	                        '<div class="bordercorner_gray_2"></div>',
	                        '<div class="bordercorner_gray_3"></div>',
	                        '<div class="bordercorner_gray_4"></div>',
	                        '<div class="preview-panel-declaration">'/* + this.app.i18n._('summary')*/ + '</div>',
	                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
	                            '<span class="preview-panel-bold">',
	                            this.app.i18n._('Anzahl Rechnungen') + '<br/>',
	                            this.app.i18n._('Gesamt netto') + '<br/>',
	                            this.app.i18n._('Gesamt brutto') + '<br/>',
	                            '</span>',
	                        '</div>',
	                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
	                            '<span class="preview-panel-nonbold">',
	                            '{count}<br/>',
	                            '{total_netto}',
	                            '{total_brutto}<br/>',
	                            '</span>',
	                        '</div>',
	                    '</div>',
	                '</div>'            
	            ),
	            
	            showDefault: function(body) {
	            	
					var data = {
					    count: this.gridpanel.store.proxy.jsonReader.jsonData.totalcount,
					    total_netto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_netto),
					    total_brutto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_brutto)
				    };
	                
	                this.defaultTpl.overwrite(body, data);
	            },
	            
	            showMulti: function(sm, body) {
	            	
	                var data = {
	                    count: sm.getCount(),
	                    total_netto: 0,
	                    total_brutto: 0
	                };
	                sm.each(function(record){
	                    data.total_netto += parseFloat(record.data.total_netto);
	                    data.total_brutto += parseFloat(record.data.total_brutto);
	                });
	                data.total_netto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_netto);
	                data.total_brutto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_brutto);
	                
	                this.defaultTpl.overwrite(body, data);
	            },
	            
	            tpl: new Ext.XTemplate(
	        		'<div class="preview-panel-timesheet-nobreak">',	
	        			'<!-- Preview beschreibung -->',
	        			'<div class="preview-panel preview-panel-timesheet-left">',
	        				'<div class="bordercorner_1"></div>',
	        				'<div class="bordercorner_2"></div>',
	        				'<div class="bordercorner_3"></div>',
	        				'<div class="bordercorner_4"></div>',
	        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Description') */ + '</div>',
	        				'<div class="preview-panel-timesheet-description preview-panel-left" ext:qtip="{[this.encode(values.description)]}">',
	        					'<span class="preview-panel-nonbold">',
	        					 '{[this.encode(values.description, "longtext")]}',
	        					'<br/>',
	        					'</span>',
	        				'</div>',
	        			'</div>',
	        			'<!-- Preview detail-->',
	        			'<div class="preview-panel-timesheet-right">',
	        				'<div class="bordercorner_gray_1"></div>',
	        				'<div class="bordercorner_gray_2"></div>',
	        				'<div class="bordercorner_gray_3"></div>',
	        				'<div class="bordercorner_gray_4"></div>',
	        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Detail') */ + '</div>',
	        				'<div class="preview-panel-timesheet-leftside preview-panel-left">',
	        				// @todo add custom fields here
	        				/*
	        					'<span class="preview-panel-bold">',
	        					'Ansprechpartner<br/>',
	        					'Newsletter<br/>',
	        					'Ticketnummer<br/>',
	        					'Ticketsubjekt<br/>',
	        					'</span>',
	        			    */
	        				'</div>',
	        				'<div class="preview-panel-timesheet-rightside preview-panel-left">',
	        					'<span class="preview-panel-nonbold">',
	        					'<br/>',
	        					'<br/>',
	        					'<br/>',
	        					'</span>',
	        				'</div>',
	        			'</div>',
	        		'</div>',{
	                encode: function(value, type, prefix) {
	                    if (value) {
	                        if (type) {
	                            switch (type) {
	                                case 'longtext':
	                                    value = Ext.util.Format.ellipsis(value, 150);
	                                    break;
	                                default:
	                                    value += type;
	                            }                           
	                        }
	                    	
	                        var encoded = Ext.util.Format.htmlEncode(value);
	                        encoded = Ext.util.Format.nl2br(encoded);
	                        
	                        return encoded;
	                    } else {
	                        return '';
	                    }
	                }
	            })
	        });
	    }
});

Tine.Billing.getPaymentStateIcon = function(value, meta, record){
	var qtip, icon;
	var paymentState = record.get('payment_state');
	switch(paymentState){
	case 'NOTDUE':
		qtip = 'Noch nicht fällig';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'gg_offline.png';
	
		break;
	case 'TOBEPAYED':
		qtip = 'unbezahlt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-busy.png';
		
		break;
	case 'PARTLYPAYED':
		qtip = 'teilbezahlt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/dialog-warning.png';
		
		break;
	case 'PAYED':
		qtip = 'bezahlt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-online.png';

		break;
	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.InvoiceSelectionGridPanel = Ext.extend(Tine.Billing.InvoiceGridPanel, {
	useQuickSearchPlugin: false,
	useDetailsPanel:false,
	additionalFilters: [],
	gridConfig: {
	    loadMask: true,
	    autoExpandColumn: 'order_id',
	    // drag n drop
	    enableDragDrop: true,
	    ddGroup: 'ddGroupInvoice'
	},
	initComponent: function() {
	    Tine.Billing.InvoiceSelectionGridPanel.superclass.initComponent.call(this);
	},
    getDetailsPanel: function(){
    	return null;
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.InvoiceSelectionGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	options.params.filter = options.params.filter.concat(this.additionalFilters);
    }//,
//    getColumns: function(){
//    	var cols = Tine.Billing.InvoiceSelectionGridPanel.superclass.getColumns.call(this);
//    	return cols.concat([
//    	   { id: 'invoice_payment_state', header: this.app.i18n._('Zahlungsstatus'), dataIndex: 'payment_state', sortable:false, renderer:Tine.Billing.getPaymentStateIcon  }                   
//    	]);
//    }
});
Ext.reg('invoiceselectiongrid',Tine.Billing.InvoiceSelectionGridPanel);


Tine.Billing.CreditGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'CREDIT',
	id: 'tine-billing-credit-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-credit-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.CreditGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		  // columns.order_id,
		   columns.credit_nr,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.open_sum,
		   columns.payed_sum,
		   columns.erp_context_id,
		   columns.receipt_state,
//		   columns.pos_count,
		   columns.usage,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.created_by,
           columns.creation_time,
		   columns.last_modified_time,
		   columns.is_cancelled,
		   columns.is_cancellation,
		   columns.booking_id,
		   columns.payment_id
	    ];
	},
    getContextMenuItems: function(){
    	return Tine.Billing.CreditGridPanel.superclass.getContextMenuItems.call(this);
    }
});


Tine.Billing.InvoiceCreditCombiGridPanel = Ext.extend(Tine.Billing.InvoiceGridPanel, {
	receiptType: 'INVOICE_CREDIT',
	id: 'tine-billing-invoice-credit-combi-gridpanel',
	useTypeFilter: false,
	useTypeCombiFilter: true,
	combiType:['INVOICE','CREDIT'],
	additionalFilters: [{field: 'current_user_only', operator:'equals', value:true}],
	useDetailsPanel:true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-invoice-credit-combi-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.InvoiceCreditCombiGridPanel.superclass.initComponent.call(this);
    },
    getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.order_id,
		   columns.erp_context_id,
		   columns.invoice_nr,
		   columns.credit_nr,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.open_sum,
		   columns.payed_sum,
		   columns.pos_count,
		   {id: 'invoice_invoice_date', header: this.app.i18n._('Rechnungsdatum'), dataIndex: 'invoice_date', sortable:false, renderer: Tine.Tinebase.common.dateRenderer  },
		   
		   { id: 'invoice_payment_state', header: this.app.i18n._('Zahlungsstatus'), dataIndex: 'payment_state', sortable:false, renderer:Tine.Billing.getPaymentStateIcon  },
		   { id: 'invoice_payment_type', header: this.app.i18n._('Zahlungsart'), dataIndex: 'payment_method_id', sortable:false, renderer:Tine.Billing.renderer.paymentMethodRenderer  },
		   { id: 'invoice_due_date', header: this.app.i18n._('Fällig am'), dataIndex: 'due_date', sortable:false, renderer: Tine.Tinebase.common.dateRenderer  },
		   columns.receipt_state,
		   columns.usage,
		   columns.created_by,
           columns.creation_time,
		   columns.last_modified_time
	    ];
	}
});

Tine.Billing.MonitionGridPanel = Ext.extend(Tine.Billing.ReceiptGridPanel, {
	receiptType: 'MONITION',
	id: 'tine-billing-monition-gridpanel',
	useTypeFilter: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        id: 'tine-billing-monition-gridpanel-grid',
    },
    initComponent: function() {
        Tine.Billing.MonitionGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		var columns = Tine.Billing.Receipt.GridPanelConfig.getColumns();
		return [
		   columns.order_id,
		   columns.monition_nr,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.pos_count,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
		   columns.creation_time,
		   columns.last_modified_time
       ];
	}
});

Ext.namespace('Tine.Billing.Receipt.GridPanelConfig');

Tine.Billing.Receipt.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		id:
			{ id: 'id', header: app.i18n._('Nummer'), dataIndex: 'id', sortable:true },
		order_id:
			{ id: 'order_id', header: app.i18n._('Auftrags-Nr'), dataIndex: 'order_id', sortable:true, renderer: Tine.Billing.renderer.orderRenderer },			
		erp_context_id:
			{ header: app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
		type:
			{ id: 'type', header: app.i18n._('Typ'), dataIndex: 'type', sortable:true },
		calc_nr:
			{ id: 'calc_nr', header: app.i18n._('Kalkulations-Nr'), dataIndex: 'calc_nr', sortable:true },
		bid_nr:
			{ id: 'bid_nr', header: app.i18n._('Angebots-Nr'), dataIndex: 'bid_nr', sortable:true },
		confirm_nr:
			{ id: 'confirm_nr', header: app.i18n._('Auftragsbestätigungs-Nr'), dataIndex: 'confirm_nr', sortable:true },			
		ship_nr:
			{ id: 'ship_nr', header: app.i18n._('Lieferschein-Nr'), dataIndex: 'ship_nr', sortable:true },
		invoice_nr:
			{ id: 'invoice_nr', header: app.i18n._('Rechnungs-Nr'), dataIndex: 'invoice_nr', sortable:true },
		credit_nr:
			{ id: 'credit_nr', header: app.i18n._('Gutschrift-Nr'), dataIndex: 'credit_nr', sortable:true },
		monition_nr:
			{ id: 'monition_nr', header: app.i18n._('Mahnungs-Nr'), dataIndex: 'monition_nr', sortable:true },
		total_netto:
		{ 
			   id: 'total_netto', header: 'ges. netto', dataIndex: 'total_netto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	 	},
	 	total_brutto:
	 	{ 
			   id: 'total_brutto', header: 'ges. brutto', dataIndex: 'total_brutto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer 
	 	},
	 	open_sum:
		{ 
			   header: 'Betr. offen', dataIndex: 'open_sum', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	     },
		payed_sum:{
			   header: 'Betr. bez.', dataIndex: 'payed_sum', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		},
	 	total_weight:
	 	{ 
			   id: 'total_weight', header: 'Gesamtgewicht', dataIndex: 'total_weight', sortable:false
	 	},
	 	pos_count:
		{ 
			   id: 'pos_count', header: 'Anz. Positionen', dataIndex: 'pos_count', sortable:false
	 	},
	 	usage:
		{ header: app.i18n._('VwZw'), dataIndex: 'usage', sortable:true },
	 	created_by:
	 	{ 
	 		id: 'created_by',      header: 'angelegt von',             width: 220, dataIndex: 'created_by',            
	 		renderer: Tine.Tinebase.common.usernameRenderer 
	 	},
	 	last_modified_by:
	 	{ 
	 		id: 'last_modified_by',      header: 'zuletzt geändert von',             width: 220, dataIndex: 'last_modified_by',            
	 		renderer: Tine.Tinebase.common.usernameRenderer 
	 	},
        creation_time:
        { 
        	id: 'creation_time', header: 'angelegt am', dataIndex: 'creation_time', renderer: Tine.Tinebase.common.dateRenderer 
        },
        last_modified_time:
        {
        	id: 'last_modified_time', header: 'zuletzt geändert am', dataIndex: 'last_modified_time', renderer: Tine.Tinebase.common.dateRenderer 
	    },
	    receipt_state:
	    { header: app.i18n._('Status'), dataIndex: 'receipt_state', sortable:false, renderer:Tine.Billing.renderer.getReceiptStateIcon  },
	    is_cancelled: { header: app.i18n._('Storniert'), dataIndex: 'is_cancelled', sortable:true },
		is_cancellation:{ header: app.i18n._('Ist Storno'), dataIndex: 'is_cancellation', sortable:true },
		booking_id:{ header: app.i18n._('Buchung'), dataIndex: 'booking_id',renderer: Tine.Billing.renderer.bookingRenderer, sortable:true},
	    payment_id:{ header: app.i18n._('Zahlung'), dataIndex: 'payment_id', sortable:false, renderer:Tine.Billing.renderer.paymentRenderer  }
	
	};
}