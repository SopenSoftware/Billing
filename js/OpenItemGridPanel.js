Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.OpenItemGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-openItem-gridpanel',
	recordClass: Tine.Billing.Model.OpenItem,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    inDialog:false,
    perspective:'PAYMENT',
	useEditorGridPanel: true,
    crud:{
    	_add:false,
    	_edit:true,
    	_delete:true
    },
    gridConfig: {
        loadMask: true,
		clicksToEdit: 1,
		autoExpandColumn: 'debitor_id'
    },
    initComponent: function() {
	    	//if(this.useDetailsPanel){
    		this.initDetailsPanel();
    	//}
	
        this.recordProxy = Tine.Billing.openItemBackend;
        this.action_payInvoice = new Ext.Action({
            text: 'Bezahlung erfassen',
            disabled: true,
            actionType: 'edit',
            handler: this.payInvoice,
            actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_editContact = new Ext.Action({
            text: 'Kontakt/Kunde öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditContact,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editDebitor = new Ext.Action({
            text: 'Debitor öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditDebitor,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editReceipt = new Ext.Action({
            text: 'Beleg öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditReceipt,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editPayment = new Ext.Action({
            text: 'Zahlung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditPayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
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
        
        Tine.Billing.OpenItemGridPanel.superclass.initComponent.call(this);
        this.actionUpdater.addActions([this.action_payInvoice]);
    },
    updatePayInvoiceAction: function(action, grants, records) {
    	action.setDisabled(true);
        if (records.length == 1) {
            var invoice = records[0];
            if (! invoice) {
                return false;
            }
            var isPayed = invoice.get('payment_state')=='PAYED';

            if(!isPayed){
            	action.setDisabled(false);
            }
        }
    },
    onEditPayment: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('payment_id')){
		   	this.lastReceiptWin = Tine.Billing.PaymentEditDialog.openWindow({
				record: new Tine.Billing.Model.Payment({id:selectedRecord.getForeignId('payment_id')},selectedRecord.getForeignId('payment_id'))
			});
		}
	},
	onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},
    onEditContact: function(){
		var selectedRecord = this.getSelectedRecord();
		var debitor = selectedRecord.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		var contactId = debitor.getForeignId('contact_id');
		if(contactId){
		   	this.contactWin = Tine.Addressbook.ContactEditDialog.openWindow({
				record: new Tine.Addressbook.Model.Contact({id:contactId},contactId)
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
	onEditDebitor: function(){
		var selectedRecord = this.getSelectedRecord();
		var debitor = selectedRecord.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		
		if(debitor){
		   	this.debitorWin = Tine.Billing.DebitorEditDialog.openWindow({
				record: debitor
			});
		}
	},
	onEditReceipt: function(){
		var selectedRecord = this.getSelectedRecord();
		var receiptId = selectedRecord.getForeignId('receipt_id');
		
		if(receiptId){
			var receipt = selectedRecord.getForeignRecord(Tine.Billing.Model.Receipt,'receipt_id');
			var type = receipt.get('type');
			if(type=='INVOICE'){
				this.receiptWin = Tine.Billing.InvoiceEditDialog.openWindow({
					record: new Tine.Billing.Model.Receipt({id:receiptId},receiptId)
				});
			}else if(type=='CREDIT'){
				this.receiptWin = Tine.Billing.CreditEditDialog.openWindow({
					record: new Tine.Billing.Model.Receipt({id:receiptId},receiptId)
				});
			}
		   
		}
	},
    payInvoice: function(){
    	var selectedRows = this.grid.getSelectionModel().getSelections();
        record = selectedRows[0];
        var receiptRecord = record.getForeignRecord(Tine.Billing.Model.Receipt,'receipt_id');
        var orderRecord = record.getForeignRecord(Tine.Billing.Model.Order,'order_id');
        var debitorRecord = record.getForeignRecord(Tine.Billing.Model.Debitor,'debitor_id');
        receiptRecord.set('order_id', orderRecord);
        receiptRecord.set('debitor_id', debitorRecord);
    	
        var win = Tine.Billing.PaymentEditDialog.openWindow({
    		record: null,
    		receiptRecord: receiptRecord,
    		debitorRecord: debitorRecord,
			listeners: {
                scope: this,
                'update': function(record) {
                    this.grid.getStore().reload();
                }
            }
		});
    },
    getContextMenuItems: function(){
    	var contextMenuItems = Tine.Billing.OpenItemGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	    //this.action_payInvoice,
    	    this.action_editContact,
    	    this.action_editDebitor,
    	    this.action_editReceipt,
	    	this.action_editPayment,
	    	this.action_editBooking,
            this.action_editCompound
    	]);
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.inDialog){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.OpenItem.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.OpenItemGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(!this.inDialog){
    		return true;
    	}
    	
    	if(this.perspective=='PAYMENT'){
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
    	}else{
    		return true;
    	}
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
		var columns = Tine.Billing.OpenItem.GridPanelConfig.getColumns();
		return [
		   columns.order_id,
		   columns.op_nr,
		   columns.receipt_id,
		   columns.debitor_id,
		   columns.receipt_nr,
		   columns.receipt_date,
		   columns.erp_context_id,
		   columns.type,
		   columns.due_date,
		   columns.due_days,
		   columns.fibu_exp_date,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.open_sum,
		   columns.payed_sum,
		   columns.banking_exp_date,
		   columns.state,
		   columns.usage,
		   columns.payment_method_id,
		   columns.is_cancelled,
		   columns.is_cancellation,
		   columns.booking_id,
		   columns.payment_id,
		   columns.payment_date,
		   columns.monition_stage,
		   columns.is_member,
		   columns.period,
		   columns.fee_group_id
	    ];
	},
	 initDetailsPanel: function() {
	        this.detailsPanel = new Tine.widgets.grid.DetailsPanel({
	            gridpanel: this,
	            
	            // use default Tpl for default and multi view
	            defaultTpl: new Ext.XTemplate(
	                '<div class="preview-panel-timesheet-nobreak">',
	                    '<!-- Preview timeframe -->',           
	                    '<div class="preview-panel preview-panel-timesheet-left">',
	                        '<div class="bordercorner_1"></div>',
	                        '<div class="bordercorner_2"></div>',
	                        '<div class="bordercorner_3"></div>',
	                        '<div class="bordercorner_4"></div>',
	                        '<div class="preview-panel-declaration">' /*+ this.app.i18n._('timeframe')*/ + '</div>',
	                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
	                            '<span class="preview-panel-bold">',
	                            /*'First Entry'*/'<br/>',
	                            /*'Last Entry*/'<br/>',
	                            /*'Last Entry*/'<br/>',
	                            /*'Duration*/'<br/>',
	                            '<br/>',
	                            '</span>',
	                        '</div>',
	                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
	                            '<span class="preview-panel-nonbold">',
	                            '<br/>',
	                            '<br/>',
	                            '<br/>',
	                            '<br/>',
								'<br/>',
	                            '</span>',
	                        '</div>',
	                    '</div>',
	                    '<!-- Preview summary -->',
	                    '<div class="preview-panel-timesheet-right">',
	                        '<div class="bordercorner_gray_1"></div>',
	                        '<div class="bordercorner_gray_2"></div>',
	                        '<div class="bordercorner_gray_3"></div>',
	                        '<div class="bordercorner_gray_4"></div>',
	                        '<div class="preview-panel-declaration">'/* + this.app.i18n._('summary')*/ + '</div>',
	                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
	                            '<span class="preview-panel-bold">',
	                            this.app.i18n._('Anzahl Rechnungen') + '<br/>',
	                            this.app.i18n._('Gesamt netto') + '<br/>',
	                            this.app.i18n._('Gesamt brutto') + '<br/>',
	                            this.app.i18n._('Gesamt offen') + '<br/>',
	                            this.app.i18n._('Gesamt bezahlt') + '<br/>',

	                            '</span>',
	                        '</div>',
	                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
	                            '<span class="preview-panel-nonbold">',
	                            '{count}<br/>',
	                            '{total_netto}',
	                            '{total_brutto}',
								'{open_sum}',
	                            '{payed_sum}<br/>',
	                            '</span>',
	                        '</div>',
	                    '</div>',
	                '</div>'            
	            ),
	            
	            showDefault: function(body) {
	            	
					var data = {
					    count: this.gridpanel.store.proxy.jsonReader.jsonData.totalcount,
					    total_netto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_netto),
					    total_brutto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_brutto),
						open_sum:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.open_sum),
					    payed_sum:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.payed_sum)
				    };
	                
	                this.defaultTpl.overwrite(body, data);
	            },
	            
	            showMulti: function(sm, body) {
	            	
	                var data = {
	                    count: sm.getCount(),
	                    total_netto: 0,
	                    total_brutto: 0,
						open_sum: 0,
						payed_sum: 0
						
	                };
	                sm.each(function(record){
	                    data.total_netto += parseFloat(record.data.total_netto);
	                    data.total_brutto += parseFloat(record.data.total_brutto);
						data.open_sum += parseFloat(record.data.open_sum);
	                    data.payed_sum += parseFloat(record.data.payed_sum);
	                });
	                data.total_netto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_netto);
	                data.total_brutto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_brutto);
	                data.open_sum =  Sopen.Renderer.MonetaryNumFieldRenderer(data.open_sum);
	                data.payed_sum =  Sopen.Renderer.MonetaryNumFieldRenderer(data.payed_sum);
	                
	                this.defaultTpl.overwrite(body, data);
	            },
	            
	            tpl: new Ext.XTemplate(
	        		'<div class="preview-panel-timesheet-nobreak">',	
	        			'<!-- Preview beschreibung -->',
	        			'<div class="preview-panel preview-panel-timesheet-left">',
	        				'<div class="bordercorner_1"></div>',
	        				'<div class="bordercorner_2"></div>',
	        				'<div class="bordercorner_3"></div>',
	        				'<div class="bordercorner_4"></div>',
	        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Description') */ + '</div>',
	        				'<div class="preview-panel-timesheet-description preview-panel-left" ext:qtip="{[this.encode(values.description)]}">',
	        					'<span class="preview-panel-nonbold">',
	        					 '{[this.encode(values.description, "longtext")]}',
	        					'<br/>',
	        					'</span>',
	        				'</div>',
	        			'</div>',
	        			'<!-- Preview detail-->',
	        			'<div class="preview-panel-timesheet-right">',
	        				'<div class="bordercorner_gray_1"></div>',
	        				'<div class="bordercorner_gray_2"></div>',
	        				'<div class="bordercorner_gray_3"></div>',
	        				'<div class="bordercorner_gray_4"></div>',
	        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Detail') */ + '</div>',
	        				'<div class="preview-panel-timesheet-leftside preview-panel-left">',
	        				// @todo add custom fields here
	        				/*
	        					'<span class="preview-panel-bold">',
	        					'Ansprechpartner<br/>',
	        					'Newsletter<br/>',
	        					'Ticketnummer<br/>',
	        					'Ticketsubjekt<br/>',
	        					'</span>',
	        			    */
	        				'</div>',
	        				'<div class="preview-panel-timesheet-rightside preview-panel-left">',
	        					'<span class="preview-panel-nonbold">',
	        					'<br/>',
	        					'<br/>',
	        					'<br/>',
								'<br/>',
								'<br/>',
	        					'</span>',
	        				'</div>',
	        			'</div>',
	        		'</div>',{
	                encode: function(value, type, prefix) {
	                    if (value) {
	                        if (type) {
	                            switch (type) {
	                                case 'longtext':
	                                    value = Ext.util.Format.ellipsis(value, 150);
	                                    break;
	                                default:
	                                    value += type;
	                            }                           
	                        }
	                    	
	                        var encoded = Ext.util.Format.htmlEncode(value);
	                        encoded = Ext.util.Format.nl2br(encoded);
	                        
	                        return encoded;
	                    } else {
	                        return '';
	                    }
	                }
	            })
	        });
	    }

});


Tine.Billing.OpenItemMonitionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-openItem-monition-gridpanel',
	recordClass: Tine.Billing.Model.OpenItemMonition,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    inDialog:false,
    gridConfig: {
        loadMask: true
    },
    loadDebitorData: function(data){
		if(data.orderRecord !== undefined){
			this.orderRecord = data.orderRecord;
		}
		if(data.receiptRecord !== undefined){
			this.receiptRecord = data.receiptRecord;
		}
		try{
			this.debitorRecord = data.debitorRecord;
		}catch(e){
			this.debitorRecord = null;
			this.debitorId = null;
		}
		this.contactRecord = data.contactRecord;
		if(this.debitorRecord){
			this.priceGroupId = this.debitorRecord.getForeignId('price_group_id');
			this.debitorId = this.debitorRecord.get('id');
		}else{
			this.priceGroupId = data.priceGroupId;
		}
		
		this.loadForeignRecord(this.receiptRecord);
		
	},
    initComponent: function() {
        this.recordProxy = Tine.Billing.openItemMonitionBackend;
        this.recordClass = Tine.Billing.Model.OpenItemMonition;
        
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.OpenItemMonitionGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.inDialog){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.OpenItemMonition.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },
    onStoreBeforeload: function(store, options) {
    	
    	Tine.Billing.OpenItemMonitionGridPanel.superclass.onStoreBeforeload.call(this, store, options);
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
			field:'monition_receipt_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: this.foreignRecord.getId()}]
		};
        options.params.filter.push(filter);
    	
    },
    
    loadForeignRecord: function( foreignRecord ){
    	this.foreignRecord = foreignRecord;
    	this.store.reload();
    },
	getColumns: function() {
		var columns = Tine.Billing.OpenItem.GridPanelConfig.getColumns();
		return [
		   columns.monition_receipt_id,
		   columns.debitor_id,
		   columns.open_item_id,
		   columns.due_date,
		   columns.monition_date,
		   columns.monition_stage,
		   columns.monition_fee,
		   columns.open_sum
	    ];
	}
});

Ext.namespace('Tine.Billing.OpenItem.GridPanelConfig');

Tine.Billing.OpenItem.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
	id:
		{ id: 'id', header: app.i18n._('ID'), dataIndex: 'id', sortable:true },
	order_id:
		{ id: 'order_id', header: app.i18n._('Auftrags-Nr'), dataIndex: 'order_id', sortable:true, renderer: Tine.Billing.renderer.orderRenderer },			
	op_nr:
		{ id: 'op_nr', header: app.i18n._('OP-Nr'), dataIndex: 'op_nr', sortable:true },
	receipt_id:
		{ id: 'receipt_id', header: app.i18n._('Beleg'), dataIndex: 'receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },			
	monition_receipt_id:
		{ header: app.i18n._('Mahn-Beleg'), dataIndex: 'monition_receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },			
	open_item_id:
		{ header: app.i18n._('OP'), dataIndex: 'open_item_id', sortable:true, renderer: Tine.Billing.renderer.openItemRenderer },			
	debitor_id:
		{ id: 'debitor_id', header: app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer },			
	receipt_nr:
		{ id: 'receipt_nr', header: app.i18n._('Beleg-Nr'), dataIndex: 'receipt_nr', sortable:true },
	receipt_date:
		{ id: 'receipt_date', header: app.i18n._('Beleg-Datum'), dataIndex: 'receipt_date', renderer: Tine.Tinebase.common.dateRenderer },
	type:
		{ id: 'type', header: app.i18n._('Typ'), dataIndex: 'type', sortable:true },
	due_date:
		{ id: 'due_date', header: app.i18n._('Datum Fälligkeit'), dataIndex: 'due_date', renderer: Tine.Tinebase.common.dateRenderer },
	monition_date:
		{ id: 'monition_date', header: app.i18n._('Datum Mahnung'), dataIndex: 'monition_date', renderer: Tine.Tinebase.common.dateRenderer },
	fibu_exp_date:
		{ id: 'fibu_exp_date', header: app.i18n._('Datum FIBU Exp.'), dataIndex: 'fibu_exp_date', renderer: Tine.Tinebase.common.dateRenderer },
	total_netto:
	{ 
		   id: 'total_netto', header: 'Gesamt netto', dataIndex: 'total_netto', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
     },
	total_brutto:{
		   id: 'total_brutto', header: 'Gesamt brutto', dataIndex: 'total_brutto', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	},
	open_sum:
	{ 
		   header: 'Betr. offen', dataIndex: 'open_sum', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
     },
	payed_sum:{
		   header: 'Betr. bez.', dataIndex: 'payed_sum', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	},
	total_sum:{
		   header: 'Summe ges.', dataIndex: 'total_sum', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
	},
	monition_fee:
	{ 
		   id: 'monition_fee', header: 'Mahngebühr', dataIndex: 'monition_fee', sortable:false,
		   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
     },
	banking_exp_date:
		{ id: 'banking_exp_date', header: app.i18n._('Datum DTA Exp.'), dataIndex: 'banking_exp_date', renderer: Tine.Tinebase.common.dateRenderer },
	state:
		{ id: 'state', header: app.i18n._('Status'), dataIndex: 'state', sortable:false, renderer:Tine.Billing.getOpenItemStateIcon  },
	payment_method_id:	   
		{ id: 'payment_method_id', header: app.i18n._('Zahlungsart'), dataIndex: 'payment_method_id', sortable:false, renderer:Tine.Billing.renderer.paymentMethodRenderer  },
	erp_context_id:	
		{ header: app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
	usage:
		{ header: app.i18n._('VwZw'), dataIndex: 'usage', sortable:true }   
		,
    is_cancelled: { header: app.i18n._('Storniert'), dataIndex: 'is_cancelled', sortable:true },
    is_cancellation:{ header: app.i18n._('Ist Storno'), dataIndex: 'is_cancellation', sortable:true },
    booking_id:{ header: app.i18n._('Buchung'), dataIndex: 'booking_id',renderer: Tine.Billing.renderer.bookingRenderer, sortable:true},
    payment_id:{ header: app.i18n._('Zahlung'), dataIndex: 'payment_id', sortable:false, renderer:Tine.Billing.renderer.paymentRenderer  },
	payment_date:
	{ header: app.i18n._('Zahlung-Datum'), dataIndex: 'payment_date', renderer: Tine.Tinebase.common.dateRenderer },
	due_days:{
		   header: 'Tage fällig', dataIndex: 'due_days', sortable:false
	},
	monition_stage:{
		   header: 'Mahnstufe', dataIndex: 'monition_stage', sortable:false},
	is_member: { header: app.i18n._('Ist Mitglied'), dataIndex: 'is_member', sortable:true },
    period: { header: app.i18n._('Periode'), dataIndex: 'period', sortable:true },
    fee_group_id: { header: app.i18n._('Beitr.gruppe'), dataIndex: 'fee_group_id', renderer: Tine.Membership.renderer.feeGroupRenderer, sortable:true, 
	 editor:{
					xtype: 'combo',
					store: Tine.Membership.getStore('FeeGroup'),
				    //value: '',
					mode: 'local',
					displayField: 'name',
				    valueField: 'id',
				    triggerAction: 'all',
				    width:150
				}
	
	}
	}
	
	;
}