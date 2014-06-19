Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.AccountClassGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-accountClass-gridpanel',
    recordClass: Tine.Billing.Model.AccountClass,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'key', direction: 'ASC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'key'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountClassBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.AccountClassGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountClass.getFilterModel(),
            defaultFilter: 'name',
            filters: [{field:'name',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'key', header: this.app.i18n._('Schlüssel'), dataIndex: 'key', sortable:true },
		   { id: 'name', header: this.app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:false}
	    ];
	}

});