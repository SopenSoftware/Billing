Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.SepaCreditorGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-sepa-creditor-gridpanel',
    recordClass: Tine.Billing.Model.SepaCreditor,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'creditor_name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'contact_id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.sepaCreditorBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.SepaCreditorGridPanel.superclass.initComponent.call(this);
    },
   
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.SepaCreditor.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
   
	getColumns: function() {
		return [
		        { header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Membership.renderer.contactRenderer, sortable:true  },
		        { header: this.app.i18n._('Bankkonto'), dataIndex: 'bank_account_id',renderer:Tine.Billing.renderer.bankAccountRenderer, sortable:true  },
		        { header: this.app.i18n._('Gläubiger Name'), width:200, dataIndex: 'creditor_name', sortable:true },
			    { header: this.app.i18n._('Gläubiger-ID'), dataIndex: 'sepa_creditor_ident', sortable:true, width:200 }
		   
			  
	    ];
	}

});