Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.OrderGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-order-gridpanel',
	recordClass: Tine.Billing.Model.Order,
    evalGrants: false,
    // grid specific
    jobRecord: null,
    debitorRecord: null,
    useQuickFilter:true,
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    gridConfig: {
        loadMask: true//,
        //autoExpandColumn: 'id'
    },
    loadJob: function( jobRecord ){
    	this.jobRecord = jobRecord;
    	this.store.reload();
    },
    loadDebitor: function( debitorRecord ){
    	this.debitorRecord = debitorRecord;
    	this.store.reload();
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.orderBackend;
        //this.initActions();
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        this.action_addOrder = new Ext.Action({
            actionType: 'edit',
            handler: this.onAddOrder,
            iconCls: 'action_edit',
            scope: this
        });
        
        Tine.Billing.OrderGridPanel.superclass.initComponent.call(this);
		
//		 var menu = new Ext.menu.Menu({
//		        id: 'receiptMenu',
//		        style: {
//		            overflow: 'visible'     // For the Combo popup
//		        },
//		        items: [
//		            {text: 'Rechnung', handler: this.onAddInvoice, scope:this}
//		            
//		 ]});

		 
		 this.pagingToolbar.add(
				 '->'
		 );
		 this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.action_addOrder), {
					 text: 'Neuer Auftrag',
		             scale: 'small',
		             rowspan: 2,
		             iconAlign: 'left'
		        }
		 ));
    },
    initActions: function(){
        this.actions_exportFibu = new Ext.Action({
            text: 'Fibu Export',
			disabled: false,
            handler: this.exportFibu,
            iconCls: 'tinebase-action-export-csv',
            scope: this
        });
        
        this.actions_printReceipts = new Ext.Action({
            text: 'Auftragsbelege Stapeldruck',
			disabled: false,
            handler: this.printReceipts,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
        this.actions_printReceiptsPreview = new Ext.Action({
            text: 'Vorschau: Auftragsbelege Stapeldruck',
			disabled: false,
            handler: this.printReceiptsPreview,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
        this.actions_printReceiptsCopy = new Ext.Action({
            text: 'Kopien: Auftragsbelege Stapeldruck',
			disabled: false,
            handler: this.printReceiptsCopy,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
        this.actions_printReceiptsAddressLabels = new Ext.Action({
            text: 'Adressaufkleber',
			disabled: false,
            handler: this.printReceiptsAddressLabels,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
    	this.actions_print = new Ext.Action({
        	allowMultiple: false,
        	text: 'Druckaufträge',
            menu:{
            	items:[
            	       this.actions_printReceipts,
            	       this.actions_printReceiptsPreview,
            	       this.actions_printReceiptsCopy,
            	       this.actions_printReceiptsAddressLabels
		    	]
            }
        });
        
        /*this.actionUpdater.addActions([
           this.actions_printMembers
        ]);*/
        this.supr().initActions.call(this);
    },
    exportFibu: function(){
    	var win = Tine.Billing.ExportFibuDialog.openWindow({});
    },
   
    printReceipts: function(){
    	var win = Tine.Billing.PrintReceiptDialog.openWindow({
			mainGrid: this,
			docType:'ORIGINAL'
		});
    	//this.openPrintWindow('printReceiptsByUser', false);
		//var win = Tine.Billing.PrintReceiptDialog.openWindow({});
    },
    printReceiptsPreview: function(){
    	var win = Tine.Billing.PrintReceiptDialog.openWindow({
			mainGrid: this,
			docType:'PREVIEW'
		});
    	//this.openPrintWindow('printReceiptsByUser', true);
    },
    printReceiptsCopy: function(){
    	var win = Tine.Billing.PrintReceiptDialog.openWindow({
			mainGrid: this,
			docType:'COPY'
		});
    	//this.openPrintWindow('printReceiptsByUser', true);
    },
    printReceiptsAddressLabels: function(){
    	var win = Tine.Billing.PrintReceiptDialog.openWindow({
			mainGrid: this,
			docType:'ADDRESS'
		});
    	//this.openPrintWindow('printReceiptsByUser', true);
    },
    openPrintWindow: function(method, preview, ids){
    	if(typeof(preview)==='object'){
    		preview = false;
    	}
    	var requestStr = '?method=Billing.'+method;
    	var idsStr = '';
    	if(ids){
    		idsStr = '&ids=' + Ext.util.JSON.encode(ids);
    	}
    	if(preview){
    		requestStr += '&preview=1';
    	}
    	
    	requestStr += idsStr;

    	return window.open(
				Sopen.Config.runtime.requestURI + requestStr,
				requestStr,
				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		);
    },
    getActionToolbarItems: function() {
    	return [
            Ext.apply(new Ext.Button(this.actions_print), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_exportAsPdf'
            }),
            Ext.apply(new Ext.Button(this.actions_exportFibu), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'tinebase-action-export-csv'
            }),
             Ext.apply(new Ext.Button(this.actions_directDebit), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'tinebase-action-export-csv'
            })
        ];
    },
    
    getContextMenuItems: function(){
    	return [];
    },
    onAddOrder: function(){
    	this.orderWin = Tine.Billing.OrderEditDialog.openWindow({
			debitor: this.debitorRecord
		});
		this.orderWin.on('beforeclose',this.onReloadOrder,this);
    },
    onReloadOrder: function(){
    	this.store.reload();
    },
    createForeignIdFilter: function( filterOptions){
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
    	return filter;
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.OrderGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	if(!this.jobRecord && !this.debitorRecord){
    		return true;
    	}
    	var filterOptions = {};
    	var filter;
    	if(this.jobRecord){
    		filterOptions.record = this.jobRecord;
        	filterOptions.field = 'job_id';
    		filter = this.createForeignIdFilter(filterOptions);
    		options.params.filter.push(filter);
    	}
    	if(this.debitorRecord){
    		filterOptions.record = this.debitorRecord;
        	filterOptions.field = 'debitor_id';
    		filter = this.createForeignIdFilter(filterOptions);
    		options.params.filter.push(filter);
    	}
    },
    initFilterToolbar: function() {
    	var quickFilter;
    	if(this.useQuickFilter){
    		quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}else{
    		quickFilter = [];
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Order.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },
	getColumns: function() {
		var columns = Tine.Billing.Order.GridPanelConfig.getColumns();
		return [
		  // columns.id,
		  columns.order_nr,
		  columns.debitor_id,
		   columns.cust_order_nr,
		   columns.price_group_id,
//		   columns.op_netto,
//		   columns.op_brutto,
		   columns.erp_context_id,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
           { id: 'creation_time', header: this.app.i18n._('Creation Time'), dataIndex: 'creation_time', renderer: Tine.Tinebase.common.dateRenderer },
           { id: 'last_modified_time', header: this.app.i18n._('Last Modified Time'), dataIndex: 'last_modified_time', renderer: Tine.Tinebase.common.dateRenderer }
	    ];
	}
});

Tine.Billing.OrderSelectionGridPanel = Ext.extend(Tine.Billing.OrderGridPanel, {
	useQuickSearchPlugin: false,
	useQuickFilter: false,
	gridConfig: {
	    loadMask: true,
	    autoExpandColumn: 'debitor_id',
	    // drag n drop
	    enableDragDrop: true,
	    ddGroup: 'ddGroupOrder'
	},
	initComponent: function() {
		this.initActions();
        Tine.Billing.OrderSelectionGridPanel.superclass.initComponent.call(this);
	},
	initActions: function(){
		
	},
    getDetailsPanel: function(){
    	return null;
    }
});
Ext.reg('orderselectiongrid',Tine.Billing.OrderSelectionGridPanel);

Ext.namespace('Tine.Billing.Order.GridPanelConfig');

Tine.Billing.Order.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		id:
			{ id: 'id', header: app.i18n._('Auftrags-Nr'), dataIndex: 'cust_order_nr', sortable:true },
		order_nr:
			{ id: 'order_nr', header: app.i18n._('Auftrags-Nr'), dataIndex: 'order_nr', sortable:true},
		debitor_id:
			{ id: 'debitor_id', header: app.i18n._('Kunde'), dataIndex: 'debitor_id', renderer: Tine.Billing.renderer.debitorRenderer, sortable:true },
		cust_order_nr:
			{ id: 'cust_order_nr', header: app.i18n._('Bestell-Nr Kunde'), dataIndex: 'cust_order_nr', sortable:true },
		price_group_id:
			{ id: 'price_group_id', header: app.i18n._('Preisgruppe'), dataIndex: 'price_group_id', renderer:Tine.Billing.renderer.priceGroupRenderer, sortable:true },
			
		erp_context_id:
			{ header: app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
					
		op_netto:
			{ 
				   id: 'op_netto', header: 'OP netto', dataIndex: 'op_netto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		 	},
		op_brutto:
		 	{ 
				   id: 'op_brutto', header: 'OP brutto', dataIndex: 'op_brutto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer 
		 	}
	};
}