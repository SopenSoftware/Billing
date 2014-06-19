Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.BatchJobMonitionItemGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'billing-batch-job-monition-item-grid-panel',
    recordClass: Tine.Billing.Model.BatchJobMonitionItem,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: ''
    },
    crud:{
    	_add:false,
    	_edit:false,
    	_delete:true
    },
    batchJobMonitionRecord: null,
    useQuickSearchPlugin: false,
    initComponent: function() {
        this.recordProxy = Tine.Billing.batchJobMonitionItemBackend;
        this.initFilterToolbar();
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        Tine.Billing.BatchJobMonitionItemGridPanel.superclass.initComponent.call(this);
       
    },
    initActions: function(){
	   	 this.actions_openReceipt = new Ext.Action({
	            actionType: 'edit',
	            handler: this.openReceipt,
	            text: 'Öffne Beleg',
	            iconCls: 'actionEdit',
	            scope: this
	        });
    },
    getContextMenuItems: function(){
    	return [
    	        this.actions_openReceipt
    	];
    },
    openReceipt: function(){
    	var selectedRows = this.grid.getSelectionModel().getSelections();
        record = selectedRows[0];
		if(record.get('open_item_id')){
			var openItem = record.getForeignRecord(Tine.Billing.Model.OpenItem, 'open_item_id');
			var receiptId = openItem.getForeignId('receipt_id');
			
			var receipt = new Tine.Billing.Model.Receipt({id:receiptId}, receiptId);
			
			var win = Tine.Billing.InvoiceEditDialog.openWindow({
	    		record: receipt
			});
		}
	},
	loadBatchJobHistory: function(wel){
    	this.batchJobMonitionRecord = wel;
    	this.grid.getStore().reload();
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
    	console.log(this);
    	Tine.Billing.BatchJobMonitionItemGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	console.log(this);
    	if(!this.batchJobMonitionRecord){
    		return true;
    	}
    	var filterOptions = {};
    	var filter;
    	
    	if(this.batchJobMonitionRecord){
    		filterOptions.record = this.batchJobMonitionRecord;
        	filterOptions.field = 'batch_monition_id';
    		filter = this.createForeignIdFilter(filterOptions);
    	}
    	console.log(filter);
    	console.log(filterOptions);
    	options.params.filter.push(filter);
    },
    onEditInNewWindow: function(button, event) {
    	return;
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
      
        var popupWindow = Tine[this.app.appName][this.recordClass.getMeta('modelName') + 'EditDialog'].openWindow({
            record: record,
            batchJobMonitionRecord: this.batchJobMonitionRecord,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.BatchJobMonitionItem.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []
        });
    },  
    
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Betrag'), renderer: Sopen.Renderer.MonetaryNumFieldRenderer, dataIndex: 'open_sum'},
		   { header: this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
		   { header: this.app.i18n._('OP'), dataIndex: 'open_item_id', renderer: Tine.Billing.renderer.openItemRenderer,sortable:true },
		   { header: this.app.i18n._('Mahnstufe'), dataIndex: 'monition_stage', sortable:true },
		   { header: this.app.i18n._('Tage'), dataIndex: 'due_days', sortable:true },
		   { header: this.app.i18n._('VwZw'), dataIndex: 'usage', sortable:true },
		   { header: this.app.i18n._('Übergehen'), dataIndex: 'skip'}
	    ];
	}
});