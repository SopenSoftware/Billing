Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.BankAccountGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-bankAccount-gridpanel',
    recordClass: Tine.Billing.Model.BankAccount,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.bankAccountBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.BankAccountGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	 this.actions_import = new Ext.Action({
             //requiredGrant: 'addGrant',
             text: this.app.i18n._('Bankkonten validieren'),
             disabled: false,
             handler: this.validateBankAccounts,
             iconCls: 'action_edit',
             scope: this,
             allowMultiple: true
         });
    	 Tine.Billing.BankAccountGridPanel.superclass.initActions.call(this);
    },
    getActionToolbarItems: function(){
    	return [
    	{
            xtype: 'buttongroup',
            columns: 1,
            frame: false,
            items: [
                this.actions_import
            ]
        }];
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.BankAccount.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    validateBankAccounts: function(btn) {
     
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Bank'), dataIndex: 'bank_id',renderer:Tine.Billing.renderer.bankRenderer, sortable:true  },
		   { header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Membership.renderer.contactRenderer, sortable:true  },
		   { header: this.app.i18n._('IBAN'), dataIndex: 'iban', style:'text-align:right;', sortable:true, width:80 },
		   { header: this.app.i18n._('BIC'), dataIndex: 'bic', style:'text-align:right;', sortable:true, width:80 },
		   { header: this.app.i18n._('BLZ'), dataIndex: 'bank_code', style:'text-align:right;', sortable:true, width:80 },
		   { header: this.app.i18n._('Kontonummer'), dataIndex: 'number', sortable:true, width:80 },
		   { header: this.app.i18n._('Bankname'), width:150, dataIndex: 'bank_name', sortable:true },
		   { header: this.app.i18n._('Kontoinhaber'), dataIndex: 'name', sortable:true }		   
			  
	    ];
	}

});