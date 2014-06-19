Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.OrderTemplateGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-orderTemplate-template-gridpanel',
	recordClass: Tine.Billing.Model.OrderTemplate,
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
        this.recordProxy = Tine.Billing.orderTemplateBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        this.action_addOrderTemplate = new Ext.Action({
            actionType: 'edit',
            handler: this.onAddOrderTemplate,
            iconCls: 'action_edit',
            scope: this
        });
        
        Tine.Billing.OrderTemplateGridPanel.superclass.initComponent.call(this);
	 
		 this.pagingToolbar.add(
				 '->'
		 );
		 this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.action_addOrderTemplate), {
					 text: 'Neuer Auftrag',
		             scale: 'small',
		             rowspan: 2,
		             iconAlign: 'left'
		        }
		 ));
    },
    onAddOrderTemplate: function(){
    	this.orderTemplateWin = Tine.Billing.OrderTemplateEditDialog.openWindow({
			debitor: this.debitorRecord
		});
		this.orderTemplateWin.on('beforeclose',this.onReloadOrderTemplate,this);
    },
    onReloadOrderTemplate: function(){
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
    initFilterToolbar: function() {
    	var quickFilter;
    	if(this.useQuickFilter){
    		quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}else{
    		quickFilter = [];
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.OrderTemplate.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },
	getColumns: function() {
		var columns = Tine.Billing.OrderTemplate.GridPanelConfig.getColumns();
		return [
		  // columns.id,
		   columns.name,
		   columns.description,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
           { id: 'creation_time', header: this.app.i18n._('Creation Time'), dataIndex: 'creation_time', renderer: Tine.Tinebase.common.dateRenderer },
           { id: 'last_modified_time', header: this.app.i18n._('Last Modified Time'), dataIndex: 'last_modified_time', renderer: Tine.Tinebase.common.dateRenderer }
	    ];
	}
});

Ext.namespace('Tine.Billing.OrderTemplate.GridPanelConfig');

Tine.Billing.OrderTemplate.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		name:
			{ id: 'name', header: app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:true },
		description:
			{ id: 'description', header: app.i18n._('Beschreibung'), dataIndex: 'description', sortable:true },
		debitor_id:
			{ id: 'debitor_id', header: app.i18n._('Kunde'), dataIndex: 'debitor_id', renderer: Tine.Billing.renderer.debitorRenderer, sortable:true },
		price_group_id:
			{ id: 'price_group_id', header: app.i18n._('Preisgruppe'), dataIndex: 'price_group_id', renderer:Tine.Billing.renderer.priceGroupRenderer, sortable:true }			
	};
}