Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.AccountBookingGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-accountBooking-gridpanel',
    recordClass: Tine.Billing.Model.AccountBooking,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'account_system_id', direction: 'DESC'},
    useEditorGridPanel: true,
    
    gridConfig: {
        loadMask: true,
        clicksToEdit:1,
        autoExpandColumn: 'account_system_id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingBackend;
        
        this.action_editBooking = new Ext.Action({
            text: 'FIBU-Buchung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditBooking,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_editCompound = new Ext.Action({
            text: 'Verbund öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditCompound,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.AccountBookingGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.inDialog){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountBooking.getFilterModel(),
            defaultFilter: 'value',
            filters: [{field:'value',operator:'greater',value:'0'}],
            plugins: plugins
        });
    },  
    getContextMenuItems: function(){
    	var contextMenuItems = [];//Tine.Billing.PaymentGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_editBooking,
                this.action_editCompound
    	]);
    },
    onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},		
	onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
			
			this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				externalRecord: selectedRecord
			});
		}
	},
	
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Buchung'), dataIndex: 'booking_id',renderer: Tine.Billing.renderer.bookingRenderer, sortable:true},
		   { header: this.app.i18n._('Konto'), dataIndex: 'account_system_id',renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true },
		   { header: this.app.i18n._('Art'), dataIndex: 'type',renderer: Tine.Billing.renderer.accountBookingTypeRenderer, sortable:true },
		   { header: this.app.i18n._('Betrag'), dataIndex: 'value',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('Betrag Soll'), dataIndex: 'debit_value',renderer: Sopen.Renderer.MonetaryNumFieldRendererS, bodyStyle:'color:#FF0000;'  },
           { header: this.app.i18n._('Betrag Haben'), dataIndex: 'credit_value',renderer: Sopen.Renderer.MonetaryNumFieldRendererH  },
		   { header: this.app.i18n._('Buchungsdatum'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'booking_date', sortable:true,
			   editor: new Ext.form.DateField({})},
           { header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer  }
		   
	    ];
	}

});

Tine.Billing.AccountBookingCombiGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	recordClass: Tine.Billing.Model.AccountBooking,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'value', direction: 'ASC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'account_system_id',
        //quickaddMandatory: 'account_system_id',
        clicksToEdit: 'auto'
    },
    useEditorGridPanel: true,
    
    withGridViewMenuPlugin:false,
    withPagingToolbar:false,
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingBackend;
        
        this.action_editBooking = new Ext.Action({
            text: 'FIBU-Buchung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditBooking,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_editCompound = new Ext.Action({
            text: 'Verbund öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditCompound,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        var summary = new Ext.ux.grid.GridSummary();
        
        this.gridConfig.plugins = [summary];
       
        this.gridConfig.columns = this.getColumns();
        
        Tine.Billing.AccountBookingGridPanel.superclass.initComponent.call(this);
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
    getContextMenuItems: function(){
    	var contextMenuItems = [];
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_editBooking,
                this.action_editCompound
    	]);
    },
    onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},		
	onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
			
			this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				externalRecord: selectedRecord
			});
		}
	},
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.AccountBookingCombiGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	delete options.params.filter;
    	options.params.filter = [];
    	if(!this.foreignRecord || this.foreignRecord.id == 0){
    		this.store.removeAll();
    		return false;
    	}

    	var filter = {	
			field:'booking_id',
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
			  editor:  Tine.Billing.Custom.getRecordPicker('AccountSystem', 'editor_booking_debit_account_id',
						{
				    name:'debit_account_id',
				    width: 240,
				    allowBlank:false,
				    displayFunc:'getTitle'
				})
		   },
		   { header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id',renderer: Tine.Billing.renderer.debitorRenderer, sortable:true,
			  editor:  Tine.Billing.Custom.getRecordPicker('Debitor', 'editor_booking_debitor_id',
						{
				    name:'debitor_id',
				    width: 240,
				    allowBlank:false,
				    displayFunc:'getTitle'
				})
		   },
		   {  header: this.app.i18n._('Buchungsdatum'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'booking_date', sortable:true},
		   { header: this.app.i18n._('Betrag'), dataIndex: 'value',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,summaryType:'sum',
		        summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true, 
		        editor: new Sopen.CurrencyField({
		            allowBlank:false
		        })}
	    ];
	}

});


Tine.Billing.AccountBookingCombiAccountGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	recordClass: Tine.Billing.Model.AccountBooking,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'value', direction: 'ASC'},
    gridConfig: {
        loadMask: true
    },
    useEditorGridPanel:true,
    initComponent: function() {
        this.recordProxy = Tine.Billing.accountBookingBackend;
        
        this.action_editBooking = new Ext.Action({
            text: 'FIBU-Buchung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditBooking,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_editCompound = new Ext.Action({
            text: 'Verbund öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditCompound,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
       
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        Tine.Billing.AccountBookingGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountBooking.getFilterModelForSplitGrid(),
            defaultFilter: 'value',
            filters: [{field:'value',operator:'greater',value:0}],
            plugins: []
        });
    },  
    onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},		
	 getContextMenuItems: function(){
	    	var contextMenuItems = [];
	    	return contextMenuItems.concat(
	    	[
	    	        '-',
	    	        this.action_editBooking,
	                this.action_editCompound
	    	]);
	    },
	onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
			
			this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				externalRecord: selectedRecord
			});
		}
	},
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.AccountBookingCombiGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
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
		   { header: this.app.i18n._('Buchung'), dataIndex: 'booking_id',renderer: Tine.Billing.renderer.bookingRenderer, sortable:true},
		   { header: this.app.i18n._('Betrag'), dataIndex: 'value',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,summaryType:'sum',
		        sortable:true},
		   {  header: this.app.i18n._('Buchungsdatum'), 
		      	renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'booking_date', 
		       	sortable:true,
		       	editor: new Ext.form.DateField({})
		   },
		   { header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id',renderer: Tine.Billing.renderer.debitorRenderer, sortable:true}
		   
					
	    ];
	}

});