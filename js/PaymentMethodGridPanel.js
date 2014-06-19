Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.PaymentMethodGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-payment-method-gridpanel',
    recordClass: Tine.Billing.Model.PaymentMethod,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.paymentMethodBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.PaymentMethodGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.PaymentMethod.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		       { id: 'id', header: this.app.i18n._('Schlüssel'), dataIndex: 'id', sortable:true },		               
		       { id: 'sort_order', header: this.app.i18n._('Sortierung'), dataIndex: 'sort_order', sortable:true },		               
		 	   { id: 'name', header: this.app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:true },		               
		 	   { id: 'text1', header: this.app.i18n._('ZB bezahlt'), dataIndex: 'text1', sortable:true },		               
		 	   { id: 'text2', header: this.app.i18n._('ZB unbezahlt'), dataIndex: 'text2', sortable:true },		               

		 	   { id: 'is_default', header: this.app.i18n._('als Voreinstellung'), /*renderer: Tine.Membership.renderer.isDefault, */dataIndex: 'is_default', sortable:false},
		 	  { id: 'due_in_days', header: this.app.i18n._('fällig in Tagen'), dataIndex: 'due_in_days', sortable:false}
	    ];
	}

});