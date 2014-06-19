Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.StockLocationGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-stockLocation-gridpanel',
    recordClass: Tine.Billing.Model.StockLocation,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'location', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'location'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.stockLocationBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.StockLocationGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.StockLocation.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'location', header: this.app.i18n._('Lagerort'), dataIndex: 'location', sortable:true },
		   { id: 'is_default', header: this.app.i18n._('als Voreinstellung'), renderer: Tine.Billing.renderer.isDefault, dataIndex: 'is_default', sortable:false}
	    ];
	}

});