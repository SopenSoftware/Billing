Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.BankGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-bank-gridpanel',
    recordClass: Tine.Billing.Model.Bank,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.bankBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.BankGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	 this.actions_import = new Ext.Action({
             //requiredGrant: 'addGrant',
             text: this.app.i18n._('Import Banks'),
             disabled: false,
             handler: this.onImport,
             iconCls: 'action_import',
             scope: this,
             allowMultiple: true
         });
    	 Tine.Billing.BankGridPanel.superclass.initActions.call(this);
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
            filterModels: Tine.Billing.Model.Bank.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    onImport: function(btn) {
        var popupWindow = Tine.widgets.dialog.ImportDialog.openWindow({
        	title: 'Bankdatei importieren',
        	useContainer:false,
            appName: 'Billing',
            // update grid after import
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true);
                }
            },
            record: new Tine.Tinebase.Model.ImportJob({
                // TODO get selected container -> if no container is selected use default container
                container_id: null,
                model: this.recordClass,
                import_definition_id:  Tine.Billing.registry.get('defaultBankImportDefinition').id
            }, 0)
        });
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('BLZ'), dataIndex: 'code', style:'text-align:right;', sortable:true, width:80 },
		   { header: this.app.i18n._('Kurzname'), dataIndex: 'short_name', sortable:true, width:80 },
		   { header: this.app.i18n._('Bezeichnung'), width:100, dataIndex: 'name', sortable:true },
		   { header: this.app.i18n._('Land'), dataIndex: 'country_code', sortable:true },
		   { header: this.app.i18n._('PLZ'), dataIndex: 'postal_code', sortable:true },
		   { header: this.app.i18n._('Ort'), dataIndex: 'location', sortable:true },
		   { header: this.app.i18n._('BIC'), dataIndex: 'bic', sortable:true },
		   { header: this.app.i18n._('PAN'), dataIndex: 'pan', sortable:true },
		   { header: this.app.i18n._('Prüf-Algo'), dataIndex: 'validate', sortable:true },
		   { header: this.app.i18n._('Merkmal'), dataIndex: 'att', sortable:true },
		   { header: this.app.i18n._('DS-Nr'), dataIndex: 'record_number', sortable:true },
		   { header: this.app.i18n._('Folge-BLZ'), dataIndex: 'follow_code', sortable:true },
		   { header: this.app.i18n._('Änd.kennz.'), dataIndex: 'change_sign', sortable:true }
		   
			  
	    ];
	}

});