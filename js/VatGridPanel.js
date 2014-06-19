Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.VatGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-vat-gridpanel',
    recordClass: Tine.Billing.Model.Vat,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.vatBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.VatGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Vat.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'name', header: this.app.i18n._('MwSt-Satz'), width:100, style:'text-align:right;',renderer: Tine.Billing.renderer.percentage, dataIndex: 'name', sortable:true },		               
		   { id: 'is_default', header: this.app.i18n._('als Voreinstellung'), renderer: Tine.Billing.renderer.isDefault, dataIndex: 'is_default', sortable:false}
	    ];
	}

});