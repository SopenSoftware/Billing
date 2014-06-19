Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.PaymentGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-payment-gridpanel',
    recordClass: Tine.Billing.Model.Payment,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'amount'
    },
    crud:{
    	_add:false,
    	_edit:true,
    	_delete:true
    },
    inDialog:false,
    initComponent: function() {
        this.recordProxy = Tine.Billing.paymentBackend;
        
        this.action_reversePayment = new Ext.Action({
            text: 'Zahlung stornieren',
            //disabled: true,
            actionType: 'edit',
            handler: this.reversePayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.action_addDebitReturn = new Ext.Action({
            text: 'Rücklastschrift erfassen',
            //disabled: true,
            actionType: 'edit',
            handler: this.addDebitReturn,
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
        
        this.action_editExtendedInNewWindow = new Ext.Action({
            requiredGrant: 'readGrant',
            text: 'Erweiterte Zahlungserfassung',
            disabled: false,
            actionType: 'edit',
            handler: this.onEditExtendedInNewWindow,
            iconCls: 'action_edit',
            scope: this
        });
        
        this.actions_printReturnInquiry = new Ext.Action({
            text: 'Nachforschung Rücklastschriften',
			disabled: false,
            handler: this.printReturnInquiry,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
        this.actions_print = new Ext.Action({
        	allowMultiple: false,
        	text: 'Druckaufträge',
            menu:{
            	items:[
            	       this.actions_printReturnInquiry
		    	]
            }
        });
        
        
        this.gridConfig.columns = this.getColumns();
        this.gridConfig.plugins = [];
        
        this.initFilterToolbar();
		this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
        
        
        Tine.Billing.PaymentGridPanel.superclass.initComponent.call(this);
    },
    printReturnInquiry: function(){
    	var downloader = new Ext.ux.file.Download({
            params: {
                method: 'Billing.printReturnInquiry',
                requestType: 'HTTP'
            }
        }).start();
    },
    addDebitReturn: function(){
    	var selectedId = this.getSelectedId();
    	if(!selectedId){
    		return true;
    	}
    	
    	var record = this.getSelectedRecord();
    	
    	var popupWindow = Tine[this.app.appName][this.recordClass.getMeta('modelName') + 'EditDialog'].openWindow({
            record: new this.recordClass(this.recordClass.getDefaultData(), 0),
    		addDebitReturn: true,
            debitToReturnRecord: new this.recordClass(record.data, record.data.id),
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    },
    onEditExtendedInNewWindow: function(button, event) {
        var record = new this.recordClass(this.recordClass.getDefaultData(), 0);
        
        var popupWindow = Tine[this.app.appName][this.recordClass.getMeta('modelName') + 'ExtendedEditDialog'].openWindow({
            record: record,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    },
    getActionToolbarItems: function() {
    	return [
            Ext.apply(new Ext.Button(this.actions_print), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_exportAsPdf'
            }),
            Ext.apply(new Ext.Button(this.action_editExtendedInNewWindow), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_edit'
            })
        ];
    },
    reversePayment: function(){
    	var selectedId = this.getSelectedId();
    	if(!selectedId){
    		return true;
    	}
    	Ext.Ajax.request({
            scope: this,
            success: this.onReversePayment,
            params: {
                method: 'Billing.reversePayment',
               	paymentId:  selectedId
            },
            failure: this.onReversePaymentFailed
        });
	},
	
	onReversePayment: function(response){
		this.reversePaymentResponse = response;
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Zahlung wurde erfolgreich storniert.',
            buttons: Ext.Msg.OK,
            //scope:this,
            //fn: this.showReversedDialog,
            icon: Ext.MessageBox.INFO
        });
		this.refresh();
	},
	onReversePaymentFailed: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Zahlung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	 onEditReceipt: function(){
	    	var selectedRecord = this.getSelectedRecord();
			if(selectedRecord.getForeignId('receipt_id')){
			   	this.lastReceiptWin = Tine.Billing.InvoiceEditDialog.openWindow({
					record: new Tine.Billing.Model.Receipt({id:selectedRecord.getForeignId('receipt_id')},selectedRecord.getForeignId('receipt_id'))
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
		onEditCompound: function(){
			var selectedRecord = this.getSelectedRecord();
			if(selectedRecord){
			   	this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
					externalRecord: selectedRecord
				});
			}
		},
	getContextMenuItems: function(){
    	var contextMenuItems = [];//Tine.Billing.PaymentGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_addDebitReturn,
    	        this.action_reversePayment,
    	        this.action_editReceipt,
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
            filterModels: Tine.Billing.Model.Payment.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },
    
	getColumns: function() {
		
		return [
		{ header: this.app.i18n._('Zahlung-Nr'), width:100, style:'text-align:right;', dataIndex: 'id', sortable:true },
		{ header: this.app.i18n._('Angelegt am'), dataIndex: 'creation_time', renderer: Tine.Tinebase.common.dateTimeRenderer, sortable:true },
        
		{ header: this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true},
		{ id: 'order_id', header: this.app.i18n._('Auftrags-Nr'), dataIndex: 'order_id', sortable:true, renderer: Tine.Billing.renderer.orderRenderer },			
		{ id: 'receipt_id', header: this.app.i18n._('Beleg'), dataIndex: 'receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },			
		{ header: this.app.i18n._('OP'), dataIndex: 'open_item_id', sortable:true, renderer: Tine.Billing.renderer.openItemRenderer },			
		{ id: 'debitor_id', header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer },			
		{ header: this.app.i18n._('Verwendungszweck'), dataIndex: 'usage', sortable:true },
		{ id: 'receipt_nr', header: this.app.i18n._('Beleg-Nr'), dataIndex: 'receipt_nr', sortable:true },
		{ header: this.app.i18n._('Zahlung-Datum'), dataIndex: 'payment_date', renderer: Tine.Tinebase.common.dateRenderer },
		{ 
			   header: 'Betrag', dataIndex: 'amount', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		},{ 
			   header: 'Typ', dataIndex: 'type', sortable:false,
			   renderer: Tine.Billing.renderer.paymentTypeRenderer
		},
		{ header: this.app.i18n._('Zahlungsmethode'), dataIndex: 'payment_method_id', sortable:false, renderer:Tine.Billing.renderer.paymentMethodRenderer  },
		{ header: this.app.i18n._('FIBU Soll'), dataIndex: 'account_system_id', sortable:true, renderer:Tine.Billing.renderer.accountSystemRenderer  },
		{ header: this.app.i18n._('FIBU Haben'), dataIndex: 'account_system_id_haben', sortable:true, renderer:Tine.Billing.renderer.accountSystemRenderer  },
		{ header: this.app.i18n._('Buchung'), dataIndex: 'booking_id', sortable:false, renderer:Tine.Billing.renderer.paymentMethodRenderer  },
		
		{ header: this.app.i18n._('Nachf.'), dataIndex: 'print_inquiry', sortable:true },
		{ header: this.app.i18n._('Rücklast.'), dataIndex: 'is_return_debit', sortable:true },
		{ 
			   header: 'Rücklast.geb', dataIndex: 'return_inquiry_fee', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		},
		{ 
			   header: 'zugr.LS-Zahlung', dataIndex: 'return_debit_base_payment_id', sortable:true,
			   renderer: Tine.Billing.renderer.paymentRenderer
		},
		{ 
			   header: 'DTA-Transaktion-ID', dataIndex: 'batch_job_dta_id', sortable:true
		},
		{ header: this.app.i18n._('Überweis forcieren'), dataIndex: 'set_accounts_banktransfer', sortable:true },
		{ header: this.app.i18n._('Dat.Druck Nachf.'), dataIndex: 'inquiry_print_date', renderer: Tine.Tinebase.common.dateRenderer }
		
		
		];
	}

});


Tine.Billing.PaymentSelectionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-payment-selection-gridpanel',
    recordClass: Tine.Billing.Model.Payment,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    useQuickSearchPlugin: false,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'id',
        // drag n drop
        enableDragDrop: true,
        ddGroup: 'ddGroupPayment'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.paymentBackend;
        
        this.action_reversePayment = new Ext.Action({
            text: 'Zahlung stornieren',
            //disabled: true,
            actionType: 'edit',
            handler: this.reversePayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        //this.initFilterToolbar();
        this.filterToolbar = this.getFilterToolbar();
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.PaymentSelectionGridPanel.superclass.initComponent.call(this);
    },
    
    reversePayment: function(){
    	var selectedId = this.getSelectedId();
    	if(!selectedId){
    		return true;
    	}
    	Ext.Ajax.request({
            scope: this,
            success: this.onReversePayment,
            params: {
                method: 'Billing.reversePayment',
               	paymentId:  selectedId
            },
            failure: this.onReversePaymentFailed
        });
	},
	
	onReversePayment: function(response){
		this.reversePaymentResponse = response;
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Zahlung wurde erfolgreich storniert.',
            buttons: Ext.Msg.OK,
            //scope:this,
            //fn: this.showReversedDialog,
            icon: Ext.MessageBox.INFO
        });
		this.refresh();
	},
	onReversePaymentFailed: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Zahlung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	getContextMenuItems: function(){
    	var contextMenuItems = [];//Tine.Billing.PaymentGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_reversePayment
    	]);
    },
	getColumns: function() {
		return [
			{ id: 'payment_id', header: this.app.i18n._('Zahlung-Nr'), width:100, style:'text-align:right;', dataIndex: 'id', sortable:true },
			{ header: this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
			{ id: 'order_id', header: this.app.i18n._('Auftrags-Nr'), dataIndex: 'order_id', sortable:true, renderer: Tine.Billing.renderer.orderRenderer },			
			{ id: 'receipt_id', header: this.app.i18n._('Beleg'), dataIndex: 'receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },			
			{ id: 'debitor_id', header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer },			
			{ id: 'receipt_nr', header: this.app.i18n._('Beleg-Nr'), dataIndex: 'receipt_nr', sortable:true },
			{ header: this.app.i18n._('Verwendungszweck'), dataIndex: 'usage', sortable:true },
			{ header: this.app.i18n._('Zahlung-Datum'), dataIndex: 'payment_date', renderer: Tine.Tinebase.common.dateRenderer },
			{ 
				   header: 'Betrag', dataIndex: 'amount', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
			},
			{ header: this.app.i18n._('Buchung'), dataIndex: 'booking_id', sortable:false, renderer:Tine.Billing.renderer.bookingRenderer  },
	           { header: this.app.i18n._('Storniert'), dataIndex: 'is_cancelled', sortable:true },
		       { header: this.app.i18n._('Ist Storno'), dataIndex: 'is_cancellation', sortable:true }//,
			//{ id: 'rev_account_vat_ex', header: this.app.i18n._('Erlöskonto ohne MwSt'), dataIndex: 'rev_account_vat_ex', sortable:true }
			];
	},
    getDetailsPanel: function(){
    	return null;
    }

});

Ext.reg('paymentselectiongrid',Tine.Billing.PaymentSelectionGridPanel);