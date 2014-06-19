Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.AccountBookingTemplateGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-accountBookingTemplate-gridpanel',
    recordClass: Tine.Billing.Model.AccountBookingTemplate,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'account_system_id', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'account_system_id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingTemplateBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.AccountBookingTemplateGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountBookingTemplate.getFilterModel(),
            defaultFilter: 'id',
            filters: [{field:'value',operator:'greater',value:'0'}],
            plugins: quickFilter
        });
    },  
    
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Konto'), dataIndex: 'account_system_id',renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true },
		   { header: this.app.i18n._('Art'), dataIndex: 'type',renderer: Tine.Billing.renderer.accountBookingTemplateTypeRenderer, sortable:true }
		   
	    ];
	}

});

Tine.Billing.AccountBookingTemplateCombiGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	recordClass: Tine.Billing.Model.AccountBookingTemplate,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'ASC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'account_system_id',
        quickaddMandatory: 'account_system_id',
        clicksToEdit: 'auto'
    },
    
    withGridViewMenuPlugin:false,
    withPagingToolbar:false,
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingTemplateBackend;
        
        this.gridConfig.columns = this.getColumns();
        
        Tine.Billing.AccountBookingTemplateGridPanel.superclass.initComponent.call(this);
    },
    initGridEvents: function() {    
        this.grid.on('newentry', function(articleSellPriceData){
        	var data = this.recordClass.getDefaultData();
        	Ext.apply(data, articleSellPriceData);
        	data.article_id = this.articleRecord.get('id');
        	
            var articleSellPrice = new this.recordClass(data,0);
            
            Tine.Billing.sellPriceBackend.saveRecord(articleSellPrice, {
                scope: this,
                success: function() {
                    this.loadData(true, true, true);
                },
                failure: function () { 
                    Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save article sellPrice.')); 
                }
            });
            return true;
        }, this);
        
        this.grid.on('afteredit', this.calculateAfterEdit,this);
    },
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.AccountBookingTemplateCombiGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	delete options.params.filter;
    	options.params.filter = [];
    	if(!this.foreignRecord || this.foreignRecord.id == 0){
    		this.store.removeAll();
    		return false;
    	}

    	var filter = {	
			field:'booking_template_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: this.foreignRecord.getId()}]
		};
        options.params.filter.push(filter);
        
        var filter = {	
			field:'type',
			operator:'equals',
			value: this.bookingType
		};
        options.params.filter.push(filter);
    },
    loadForeignRecord: function( foreignRecord ){
    	this.foreignRecord = foreignRecord;
    	this.store.reload();
    },
    reload: function(){
    	this.store.reload();
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Konto'), dataIndex: 'account_system_id',renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true,
			   quickaddField:  Tine.Billing.Custom.getRecordPicker('AccountSystem', 'quick_add_booking_debit_account_id',
						{
				    name:'debit_account_id',
				    width: 240,
				    allowBlank:false,
				    displayFunc:'getTitle'
				}),
				editor:  Tine.Billing.Custom.getRecordPicker('AccountSystem', 'editor_booking_debit_account_id',
						{
				    name:'debit_account_id',
				    width: 240,
				    allowBlank:false,
				    displayFunc:'getTitle'
				})
		   }
	    ];
	}

});


Tine.Billing.AccountBookingTemplateCombiAccountGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	recordClass: Tine.Billing.Model.AccountBookingTemplate,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'ASC'},
    gridConfig: {
        loadMask: true
    },
    
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingTemplateBackend;
        
       
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        Tine.Billing.AccountBookingTemplateGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountBookingTemplate.getFilterModelForSplitGrid(),
            defaultFilter: 'id',
            filters: [{field:'id',operator:'greater',value:0}],
            plugins: []
        });
    },  
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.AccountBookingTemplateCombiGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	delete options.params.filter;
    	options.params.filter = [];
    	if(!this.foreignRecord || this.foreignRecord.id == 0){
    		this.store.removeAll();
    		return false;
    	}

    	var filter = {	
			field:'account_system_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: this.foreignRecord.getId()}]
		};
        options.params.filter.push(filter);
        
        var filter = {	
			field:'type',
			operator:'equals',
			value: this.bookingType
		};
        options.params.filter.push(filter);
    },
    
    loadForeignRecord: function( foreignRecord ){
    	this.foreignRecord = foreignRecord;
    	this.store.reload();
    },
    reload: function(){
    	this.store.reload();
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Konto'), dataIndex: 'account_system_id',renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true},
	    ];
	}

});