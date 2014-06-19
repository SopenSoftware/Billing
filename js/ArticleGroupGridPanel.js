Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleGroupGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-articleGroup-gridpanel',
    recordClass: Tine.Billing.Model.ArticleGroup,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.articleGroupBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.ArticleGroupGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.ArticleGroup.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'id', header: this.app.i18n._('ID'), dataIndex: 'id', sortable:true, hidden:true },
		   { id: 'name', header: this.app.i18n._('Bezeichnung'), width:100, style:'text-align:right;', dataIndex: 'name', sortable:true },
		   { id: 'comment', header: this.app.i18n._('Bemerkung'), dataIndex: 'comment', sortable:true }
	    ];
	}

});