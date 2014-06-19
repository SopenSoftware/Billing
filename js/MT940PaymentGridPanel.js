Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.MT940PaymentGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-mt940-payment-gridpanel',
	recordClass: Tine.Billing.Model.MT940Payment,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    inDialog:true,
    crud:{
    	_add:false,
    	_edit:false,
    	_delete:true
    },
    gridConfig: {
    	 cls: 'dta940-red',
        loadMask: true//,
        //autoExpandColumn: 'id'
    },
    initComponent: function() {
    	this.addEvents(
    		'beginmt940',
    		'testbooking',
    		'beginbooking',
    		'endbooking',
    		'endmt940'
    	);
    	
        this.recordProxy = Tine.Billing.mt940PaymentBackend;
        
        this.action_readBankFile = new Ext.Action({
            text: 'Bankdatei einlesen',
            //disabled: true,
            actionType: 'edit',
            handler: this.readBankFile,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_testBooking = new Ext.Action({
            text: 'Datensatz testen',
            //disabled: true,
            actionType: 'edit',
            handler: this.testBooking,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_bookSelected = new Ext.Action({
            text: 'Gewählte(n) buchen',
            //disabled: true,
            actionType: 'edit',
            handler: this.bookSelected,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_bookGreen = new Ext.Action({
            text: 'Grün buchen',
            //disabled: true,
            actionType: 'edit',
            handler: this.bookGreen,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_bookOrange = new Ext.Action({
            text: 'Grün/Orange buchen',
            //disabled: true,
            actionType: 'edit',
            handler: this.bookOrange,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_bookManually = new Ext.Action({
            text: 'manuelle FIBU-Buchung',
            //disabled: true,
            actionType: 'edit',
            handler: this.bookManually,
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
        	
        	
        
        this.action_endBooking = new Ext.Action({
            text: 'Einlesung beenden',
            //disabled: true,
            actionType: 'edit',
            handler: this.endBooking,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.actions_book = new Ext.Action({
        	allowMultiple: false,
        	text: 'Buchen',
            menu:{
            	items:[
            	       this.action_bookSelected,
            	       this.action_bookGreen,
            	       this.action_bookOrange,
            	       this.action_bookManually
            	       
		    	]
            }
        });
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.MT940PaymentGridPanel.superclass.initComponent.call(this);
        
        this.pagingToolbar.add(
				 '->'
		);
		this.pagingToolbar.add(
			 Ext.apply(new Ext.Button(this.action_readBankFile), {
				 text: 'Bankdatei einlesen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     }
		));
		
		this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.action_testBooking ), {
					 text: 'Datensatz testen',
			         scale: 'small',
			         rowspan: 2,
			         iconAlign: 'left'
			     }
			));
			
		this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.actions_book), {
					 text: 'Buchen',
			         scale: 'small',
			         iconCls: 'action_edit',
			         rowspan: 2,
			         iconAlign: 'left'
			     }
			));
		/*this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.action_bookOrange), {
					 text: 'Grün/Orange verbuchen',
			         scale: 'small',
			         rowspan: 2,
			         iconAlign: 'left'
			     }
			));*/
		
		this.pagingToolbar.add(
				 Ext.apply(new Ext.Button(this.action_endBooking ), {
					 text: 'Einlesung beenden',
			         scale: 'small',
			         rowspan: 2,
			         iconAlign: 'left'
			     }
			));
       
    },
    
    readBankFile: function(){
    	this.fireEvent('beginmt940', this);
    	 var popupWindow = Tine.Billing.MT940ImportDialog.openWindow({
             appName: 'Billing',
             // update grid after import
             listeners: {
                 scope: this,
                 'update': function(record) {
                     this.refresh();
                 }
             },
             record: new Tine.Billing.Model.MT940ImportJob({
             }, 0)
         });
    },
    
    bookGreen: function(){
    	
    	Ext.Ajax.request({
            scope: this,
            success: this.onMT940BookingSuccess,
            params: {
            	method: 'Billing.mt940BookGreen'
            },
            failure: this.onMT940BookingFailure
        });
    	
    	
    },
    bookOrange: function(){
    	Ext.Ajax.request({
            scope: this,
            success: this.onMT940BookingSuccess,
            params: {
            	method: 'Billing.mt940BookOrange'
            },
            failure: this.onMT940BookingFailure
        });
    },
    bookSelected: function(){
    	var ids = this.getSelectedIds();
    	if(!ids){
    		return;
    	}
    	Ext.Ajax.request({
            scope: this,
            success: this.onMT940BookingSuccess,
            params: {
            	method: 'Billing.mt940BookSelected',
            	ids: Ext.util.JSON.encode(ids)
            	
            },
            failure: this.onMT940BookingFailure
        });
    	
    	
    },
 
    bookManually: function(){
    	var id = this.getSelectedId();
    	var paymentRecord = null;
    	var record;
    	
    	if(id){
    		paymentRecord = this.getSelectedRecord();
    	}
    	
    	if(!paymentRecord){
    		record = new Tine.Billing.Model.Booking({}, 0);
    	}else{
    		record = new Tine.Billing.Model.Booking({
    			bookind_date: paymentRecord.get('payment_date'),
    			usage: paymentRecord.get('usage')
    		}, 0);
    	}
    	
    	var popupWindow = Tine.Billing.BookingEditDialog.openWindow({
            record: record,
    		grid: this
        });
    },
    onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
		   	this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				externalRecord: selectedRecord
			});
		}
	},
    onMT940BookingSuccess: function(){
    	Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Verbuchung ist erfolgreich durchgeführt worden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.INFO
        });
    	//this.fireEvent('endmt940', this);
    },
    onMT940BookingFailure: function(){
    	Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Verbuchung konnte nicht durchgeführt werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    	this.fireEvent('endmt940', this);
    },
    
    testBooking: function(){
    	this.fireEvent('testbooking', this);
    },
    endBooking: function(){
    	Ext.Ajax.request({
            scope: this,
            success: this.onEndBookingSuccess,
            params: {
            	method: 'Billing.mt940ClearBookings'
            },
            failure: this.onEndBookingFailure
        });
    	
    },
    onEndBookingSuccess: function(){
    	this.fireEvent('endmt940', this);
    	this.refresh();
    },
    onEndBookingFailure: function(){
    	this.fireEvent('endmt940', this);
    	this.refresh();
    },
    
    getContextMenuItems: function(){
    	//var contextMenuItems = Tine.Billing.MT940PaymentGridPanel.superclass.getContextMenuItems.call(this);
    	return [
    	 this.action_deleteRecord,
    	 this.action_bookSelected,
    	 this.action_bookManually,
    	 '-',
    	 this.action_editCompound
    	];
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.inDialog){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.MT940Payment.getFilterModel(),
            defaultFilter: 'state',
            filters: [{field:'state',operator:'equals',value:'GREEN'}],
            plugins: plugins
        });
    },
    onStoreBeforeload: function(store, options) {
    	return true;
    	Tine.Billing.MT940PaymentGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(!this.inDialog){
    		return true;
    	}
    	delete options.params.filter;
    	options.params.filter = [];
    	if(!this.foreignRecord || this.foreignRecord.id == 0){
    		this.store.removeAll();
    		return false;
    	}

    	var filter = {	
			field:'payment_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: this.foreignRecord.getId()}]
		};
        options.params.filter.push(filter);
        
       /* var filter = {	
			field:'type',
			operator:'equals',
			value: this.bookingType
		};
        options.params.filter.push(filter);*/
    },
    
    loadForeignRecord: function( foreignRecord ){
    	this.foreignRecord = foreignRecord;
    	this.store.reload();
    },
	getColumns: function() {
		var columns = Tine.Billing.MT940Payment.GridPanelConfig.getColumns();
		return [
		   columns.op_nr,
		   columns.op_id,
		   columns.debitor_id,
		   columns.erp_context_id,
		   columns.type,
		   columns.due_date,
		   columns.payment_date,
		   columns.op_amount,
		   columns.payment_amount,
		   columns.overpay_amount,
		   columns.overpay,
		   columns.state,
		   columns.usage,
		   columns.usage_payment,
		   columns.account_system_id,
		   columns.account_system_id_haben,
		   columns.print_inquiry,
		   columns.is_return_debit,
		   columns.return_inquiry_fee,
		   columns.set_accounts_banktransfer
		   
	    ];
	}
});

Ext.namespace('Tine.Billing.MT940Payment.GridPanelConfig');

Tine.Billing.MT940Payment.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
	id:
		{ id: 'id', header: app.i18n._('ID'), dataIndex: 'id', sortable:true },
	op_nr:
		{ id: 'op_nr', header: app.i18n._('OP-Nr'), dataIndex: 'op_nr', sortable:true },
	op_id:
		{ id: 'op_id', header: app.i18n._('OP'), dataIndex: 'op_id', sortable:true, renderer: Tine.Billing.renderer.openItemRenderer },			
	debitor_id:
		{ id: 'debitor_id', header: app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer },			
	type:
		{ id: 'type', header: app.i18n._('Typ'), dataIndex: 'type', sortable:true },
	due_date:
		{ id: 'due_date', header: app.i18n._('Datum Fälligkeit'), dataIndex: 'due_date', renderer: Tine.Tinebase.common.dateRenderer },
	payment_date:
		{ id: 'payment_date', header: app.i18n._('Datum Zahlungseingang'), dataIndex: 'payment_date', renderer: Tine.Tinebase.common.dateRenderer },
	op_amount:
	{ 
		   id: 'op_amount', header: 'Betrag OP', dataIndex: 'op_amount', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
     },
     payment_amount:{
		   id: 'payment_amount', header: 'Betrag Zahlungseingang', dataIndex: 'payment_amount', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	},
	overpay_amount:{
		   id: 'overpay_amount', header: 'Betrag Überzahlung', dataIndex: 'overpay_amount', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	},
    state:
		{ id: 'state', header: app.i18n._('Status'), dataIndex: 'state', sortable:false, renderer:Tine.Billing.getMT940PaymentStateIcon  },
	erp_context_id:	
		{ header: app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
	usage:
		{ header: app.i18n._('VwZw'), dataIndex: 'usage', sortable:true },
	usage_payment:
		{ header: app.i18n._('VwZw MT940'), dataIndex: 'usage_payment', sortable:true },
	account_system_id:
		{ id: 'account_system_id', header: 'Konto Soll', dataIndex: 'account_system_id', renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true },
	account_system_id_haben:
		{ id: 'account_system_id_haben', header: 'Konto Haben', dataIndex: 'account_system_id_haben', renderer: Tine.Billing.renderer.accountSystemRenderer, sortable:true },
	overpay:
		{ id: 'overpay', header: 'bei Überzahlung', dataIndex: 'overpay', renderer: Tine.Billing.renderer.overpayRenderer, sortable:true },
		
	print_inquiry:	
		{ header: app.i18n._('Nachf.'), dataIndex: 'print_inquiry', sortable:true },
	is_return_debit:
		{ header: app.i18n._('Rücklast.'), dataIndex: 'is_return_debit', sortable:true },
	return_inquiry_fee:
		{ 
			   header: 'Rücklast.geb', dataIndex: 'return_inquiry_fee', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		},
	set_accounts_banktransfer:
		{ header: app.i18n._('Überweis forcieren'), dataIndex: 'set_accounts_banktransfer', sortable:true }
		
	};
}