Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.CreditorGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-creditor-gridpanel',
    recordClass: Tine.Billing.Model.Creditor,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'creditor_nr', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'creditor_nr'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.creditorBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.CreditorGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Creditor.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'contact_id', header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Billing.renderer.contactRenderer, sortable:true  },
		   { id: 'creditor_nr', header: this.app.i18n._('Kreditor-Nr'), dataIndex: 'creditor_nr', sortable: true, hidden: false },
		   { id: 'org_name', header: this.app.i18n._('Company'), dataIndex: 'org_name', width: 200, hidden: false },
           { id: 'adr_one_street', header: this.app.i18n._('Street'), dataIndex: 'adr_one_street' },
           { id: 'adr_one_locality', header: this.app.i18n._('City'), dataIndex: 'adr_one_locality', width: 150, hidden: false },
           { id: 'adr_one_region', header: this.app.i18n._('Region'), dataIndex: 'adr_one_region' },
           { id: 'adr_one_postalcode', header: this.app.i18n._('Postalcode'), dataIndex: 'adr_one_postalcode' },
           { id: 'adr_one_countryname', header: this.app.i18n._('Country'), dataIndex: 'adr_one_countryname' }
		];
	}

});

Tine.Billing.CreditorSelectionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-creditor-selection-gridpanel',
    recordClass: Tine.Billing.Model.Creditor,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'creditor_nr', direction: 'DESC'},
	useQuickSearchPlugin: false,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'contact_id',
        // drag n drop
        enableDragDrop: true,
        ddGroup: 'ddGroupCreditor'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.creditorBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.filterToolbar = this.getFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.CreditorSelectionGridPanel.superclass.initComponent.call(this);
    },
    
	getColumns: function() {
		return [
		   { id: 'contact_id', header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Billing.renderer.contactRenderer, sortable:true  },
		   { id: 'creditor_nr', header: this.app.i18n._('Kreditor-Nr'), dataIndex: 'creditor_nr', sortable: true, hidden: false },
		   { id: 'org_name', header: this.app.i18n._('Company'), dataIndex: 'org_name', width: 200, hidden: false },
           { id: 'adr_one_street', header: this.app.i18n._('Street'), dataIndex: 'adr_one_street' },
           { id: 'adr_one_locality', header: this.app.i18n._('City'), dataIndex: 'adr_one_locality', width: 150, hidden: false },
           { id: 'adr_one_region', header: this.app.i18n._('Region'), dataIndex: 'adr_one_region' },
           { id: 'adr_one_postalcode', header: this.app.i18n._('Postalcode'), dataIndex: 'adr_one_postalcode' },
           { id: 'adr_one_countryname', header: this.app.i18n._('Country'), dataIndex: 'adr_one_countryname' }
		];
	},
    getDetailsPanel: function(){
    	return null;
    }

});

Ext.reg('creditorselectiongrid',Tine.Billing.CreditorSelectionGridPanel);