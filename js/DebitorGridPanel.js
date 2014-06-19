Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.DebitorGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-debitor-gridpanel',
    recordClass: Tine.Billing.Model.Debitor,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'debitor_nr', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'debitor_nr'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.debitorBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.DebitorGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Debitor.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { id: 'contact_id', header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Billing.renderer.contactRenderer, sortable:true  },
		   { id: 'debitor_nr', header: this.app.i18n._('Debitor-Nr'), dataIndex: 'debitor_nr', sortable: true, hidden: false },
		   { id: 'vat_id', header: this.app.i18n._('MwSt'), dataIndex: 'vat_id',renderer:Tine.Billing.renderer.vatRenderer, sortable:true  },
		   { id: 'price_group_id', header: this.app.i18n._('Preisgruppe'), dataIndex: 'price_group_id',renderer:Tine.Billing.renderer.priceGroupRenderer, sortable:true  },
		   { id: 'debitor_group_id', header: this.app.i18n._('Kundengruppe'), dataIndex: 'debitor_group_id',renderer:Tine.Billing.renderer.debitorGroupRenderer, sortable:true  },
		   
		   { id: 'ust_id', header: this.app.i18n._('UST-ID'), dataIndex: 'ust_id', sortable: true, hidden: false },
		   { id: 'org_name', header: this.app.i18n._('Company'), dataIndex: 'org_name', width: 200, hidden: false },
           { id: 'adr_one_street', header: this.app.i18n._('Street'), dataIndex: 'adr_one_street' },
           { id: 'adr_one_locality', header: this.app.i18n._('City'), dataIndex: 'adr_one_locality', width: 150, hidden: false },
           { id: 'adr_one_region', header: this.app.i18n._('Region'), dataIndex: 'adr_one_region' },
           { id: 'adr_one_postalcode', header: this.app.i18n._('Postalcode'), dataIndex: 'adr_one_postalcode' },
           { id: 'adr_one_countryname', header: this.app.i18n._('Country'), dataIndex: 'adr_one_countryname' }/*,
           { 
			   	id: 'vat_id', 
			   	header: 'MwSt', 
			   	width:100, 
			   	dataIndex: 'vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer
		   },{ 
			   	id: 'price_group_id', 
			   	header: 'Preisgruppe', 
			   	width:100, 
			   	dataIndex: 'price_group_id', 
			   	renderer: Tine.Billing.renderer.priceGroupRenderer
		   }*/
		];
	}

});

Tine.Billing.DebitorSelectionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-debitor-selection-gridpanel',
    recordClass: Tine.Billing.Model.Debitor,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'debitor_nr', direction: 'DESC'},
	useQuickSearchPlugin: false,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'contact_id',
        // drag n drop
        enableDragDrop: true,
        ddGroup: 'ddGroupDebitor'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.debitorBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.filterToolbar = this.getFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.DebitorSelectionGridPanel.superclass.initComponent.call(this);
    },
    
	getColumns: function() {
		return [
		   { id: 'contact_id', header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Billing.renderer.contactRenderer, sortable:true  },
		   { id: 'debitor_nr', header: this.app.i18n._('Debitor-Nr'), dataIndex: 'debitor_nr', sortable: true, hidden: false },
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

Ext.reg('debitorselectiongrid',Tine.Billing.DebitorSelectionGridPanel);