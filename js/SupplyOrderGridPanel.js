Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.SupplyOrderGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-supply-order-gridpanel',
	recordClass: Tine.Billing.Model.SupplyOrder,
    evalGrants: false,
    // grid specific
    jobRecord: null,
    useQuickFilter:true,
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    gridConfig: {
        loadMask: true//,
        //autoExpandColumn: 'id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.supplyOrderBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.SupplyOrderGridPanel.superclass.initComponent.call(this);
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
            filterModels: Tine.Billing.Model.SupplyOrder.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },
    loadJob: function( jobRecord ){
    	this.jobRecord = jobRecord;
    	this.store.reload();
    },    
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.SupplyOrderGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	if(!this.jobRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.jobRecord;
    	filterOptions.field = 'job_id';
    
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
	getColumns: function() {
		var columns = Tine.Billing.SupplyOrder.GridPanelConfig.getColumns();
		return [
		   columns.creditor_id,
		   columns.supply_order_nr
	    ];
	}
});

Ext.namespace('Tine.Billing.SupplyOrder.GridPanelConfig');

Tine.Billing.SupplyOrder.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		job_id:
			{ id: 'job_id', header: app.i18n._('Job'), dataIndex: 'job_id', renderer:Tine.Billing.renderer.jobRenderer, sortable:true },
		creditor_id:
			{ id: 'creditor_id', header: app.i18n._('Lieferant'), renderer:Tine.Billing.renderer.creditorRenderer ,  dataIndex: 'creditor_id', sortable:true },
		supply_order_nr:
			{ id: 'supply_order_nr', header: app.i18n._('Bestell-Nr'), dataIndex: 'supply_order_nr', sortable:true },
		supplier_order_nr:
			{ id: 'supplier_order_nr', header: app.i18n._('Bestell-Nr Lieferant'), dataIndex: 'supplier_order_nr', sortable:true }			
	};
}