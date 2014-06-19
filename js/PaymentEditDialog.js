Ext.namespace('Tine.Billing');

Tine.Billing.PaymentEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	windowNamePrefix: 'PaymentEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Payment,
	recordProxy: Tine.Billing.paymentBackend,
	loadRecord: false,
	receiptRecord: null,
	debitorRecord: null,
	addDebitReturn:false,
	debitToReturnRecord: null,
	evalGrants: false,
	initComponent: function(){
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.PaymentEditDialog.superclass.initComponent.call(this);		
	},
	onAfterRender: function(){
		if(this.addDebitReturn && this.debitToReturnRecord){
			var fibuDebitor = Tine.Billing.registry.get('preferences').get('fibuKtoDebitor');
			var returnInquiryFee = Tine.Billing.registry.get('preferences').get('debitReturnFee');
			
			var newRecord = new Tine.Billing.Model.Payment(
			{
				debitor_id: this.debitToReturnRecord.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id'),
				erp_context_id: this.debitToReturnRecord.getForeignId('erp_context_id'),
				return_debit_base_payment_id: this.debitToReturnRecord.get('id'),
				payment_type:this.debitToReturnRecord.getForeignId('payment_type'),
				type: 'CREDIT',
				is_return_debit: 1,
				print_inquiry: 1,
				set_accounts_banktransfer: 1,
				return_inquiry_fee: returnInquiryFee,
				account_system_id: fibuDebitor,
				
			}
			,0);
			
			this.record = newRecord;
			this.initRecord();
			
			Ext.getCmp('payment_account_system_id').setValue(fibuDebitor);
			
		}
	},
	getFormItems: function(){
		return Tine.Billing.getPaymentFormItems();
	}
	
});

Tine.Billing.PaymentExtendedEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pripaymente
	 */
	windowNamePrefix: 'ExtendedPaymentEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Payment,
	recordProxy: Tine.Billing.paymentBackend,
	loadRecord: false,
	receiptRecord: null,
	debitorRecord: null,
	evalGrants: false,
	memberNr: null,
	perspective: 'payment',
	searchingOpenItems: false,
	initComponent: function(){
		//this.initStockFlowButtons();
		
		this.initInstantOpenItemGrid();
		this.initWidgets();
		this.initActions();
		
		this.buttonSearchOpenItems = Ext.apply(new Ext.Button(this.actions_searchOpenItems), {
            scale: 'small',
            rowspan: 2,
            text:'Suchen',
            iconAlign: 'top'//,
           // iconCls: 'action_stockFlowInc'
        });
		
		this.buttonPayOpenItems = Ext.apply(new Ext.Button(this.actions_payOpenItems), {
            scale: 'small',
            rowspan: 2,
            text:'OPs bezahlen',
            iconAlign: 'top'//,
           // iconCls: 'action_stockFlowInc'
        });
		
		
		this.initSearchPanel();
		//this.initDependentGrids();
		this.items = this.getFormItems();
		this.on('load',this.onLoadPayment, this);
		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.PaymentExtendedEditDialog.superclass.initComponent.call(this);
	},
	switchToPayment: function(){
		//this.searchPanel.enable();
		this.buttonSearchOpenItems.enable();
		this.buttonPayOpenItems.enable();
		this.fbar.enable();
		this.perspective = 'payment';
		this.recordClass = Tine.Billing.Model.Payment;
		this.recordProxy = Tine.Billing.paymentBackend;
		this.record = new Tine.Billing.Model.Payment({},0);
		this.initRecord();
	},
	switchToMT940: function(){
		this.buttonSearchOpenItems.disable();
		this.buttonPayOpenItems.disable();
		this.fbar.disable();
		this.perspective = 'mt940';
		this.recordClass = Tine.Billing.Model.MT940Payment;
		this.recordProxy = Tine.Billing.mt940PaymentBackend;
		this.record = new Tine.Billing.Model.MT940Payment({},0);
		this.initRecord();
	},
	initActions: function(){
        this.actions_saveAndProceed = new Ext.Action({
            text: 'Speichern & weitere Zahlung',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.saveAndProceed,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_searchOpenItems = new Ext.Action({
            text: 'Suchen',
            disabled: false,
            //iconCls: 'action_applyChanges',
            handler: this.onSearchOpenItems,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_payOpenItems = new Ext.Action({
            text: 'Bezahlung offene Posten',
            disabled: false,
            //iconCls: 'action_applyChanges',
            handler: this.onPayOpenItems,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        Tine.Billing.PaymentExtendedEditDialog.superclass.initActions.call(this);
	},
	initButtons: function(){
    	Tine.Billing.PaymentExtendedEditDialog.superclass.initButtons.call(this);
    	
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.actions_saveAndProceed,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },
    saveAndProceed: function(button, event){
    	this.on('update', this.proceedAdding, this);
        this.onApplyChanges(button, event, false);
    },
    proceedAdding: function(){
    	this.un('update', this.proceedAdding, this);
    	//Ext.getCmp('payment-invoice-selection-grid').grid.getStore().reload();
    	this.initDialog();
        this.record = new Tine.Billing.Model.Payment({},0);
        this.onRecordUpdate();
        Ext.getCmp('payment_account_system_id').selectDefault();
    },
    initInstantOpenItemGrid: function(){
    	this.instantOpenItemGrid = new Tine.Billing.InstantOpenItemGridPanel({
    		title: 'Zu bezahlende OPs',
    		height:300,
    		//region: 'south',
    		gridConfig:{
				id:'payment-instant-open-item-grid'
			},
			bodyStyle:'margin:4px;',
			border:false,
			//collapsible: true,
            //collapseMode: 'mini',
            //split: true,
           app: Tine.Tinebase.appMgr.get('Billing')
    			
    	});
    	
    	this.mt940PaymentGridPanel = new Tine.Billing.MT940PaymentGridPanel({
    		title: 'Einlesung aus Bankdatei',
    		region: 'center',
    		bodyStyle:'margin:4px;',
			border:false,
			//collapsible: true,
            //collapseMode: 'mini',
            //split: true,
           app: Tine.Tinebase.appMgr.get('Billing')
    			
    	});
    	
    	this.mt940PaymentGridPanel.on('selectrow', this.onSelectMT940, this);
    	this.mt940PaymentGridPanel.on('beginmt940', this.onBeginMT940, this);
    	this.mt940PaymentGridPanel.on('endmt940', this.onEndMT940, this);
    	this.mt940PaymentGridPanel.on('testbooking', this.onTestBooking, this);
    	
    	
    	
    },
    onTestBooking: function(){
    	if(this.perspective == 'mt940' && this.record.id != 0){
    		this.record.set('payment_amount', Ext.getCmp('payment_amount').getValue());
    		
    		var result = this.instantOpenItemGrid.getFromStoreAsArray();
    		
    		var donationData = {
    			donation_amount: Ext.getCmp('donation_amount').getValue(),
    			campaign: Ext.getCmp('donation_campaign_id').getValue()
    		};
    		
    		var additionalData = {
    			openItems: result,
    			donation: donationData
    		};
    		
    		this.record.set('additional_data', Ext.util.JSON.encode(additionalData));
    		
    		if(result.length>0){
    			this.record.set('multiple_ops',1);
    		}
    		this.on('update', this.onTestBookingUpdate, this);
    		this.onApplyChanges();
    	}
    },
    onTestBookingUpdate: function(){
    	this.mt940PaymentGridPanel.refresh();
    	this.un('update', this.onTestBookingUpdate, this);
    },
    onBeginMT940: function(){
    	this.switchToMT940();
    },
    onEndMT940: function(){
    	this.switchToPayment();
    },
    onSelectMT940: function(sm){
    	this.instantOpenItemGrid.getStore().removeAll();
    	Ext.getCmp('donation_amount').setValue(0);
    	
    	if(this.perspective != 'mt940'){
    		this.switchToMT940();
    	}
    	
    	var sel = sm.getSelections();
    	
    	this.record = sel[0]; 
    	var debitorRecord = this.record.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		if(debitorRecord){
			var contactId = debitorRecord.getForeignId('contact_id');
			//Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(debitorRecord);
			Ext.getCmp('search_field_contact_nr').setValue(contactId);
			Ext.getCmp('search_field_member_nr').setValue('');
			if(this.perspective == 'mt940'){
				this.onSearchOpenItems();
			}
		}
    	
    	this.initRecord();
    },
	onLoadPayment: function(){
		//Ext.getCmp('payment-selection-grid').refresh();
		if(this.record.id !== 0){
			Ext.getCmp('payment_account_system_id').autoSelectDefault = false;
		}else{
			
			//Ext.getCmp('payment-form-panel').add(this.instantOpenItemGrid);
			
			Ext.getCmp('payment_account_system_id').selectDefault();
			if(this.receiptRecord){
				this.onDropReceipt(null, this.receiptRecord);
				Ext.getCmp('payment_receipt_id').setValue(this.receiptRecord);
				
				if(!this.debitorRecord){
					var order = this.receiptRecord.getForeignRecord(Tine.Billing.Model.Order, 'order_id');
					this.debitorRecord = order.getForeignRecord(Tine.Billing.Model.Debitor,'debitor_id')
					if(!this.debitorRecord){
						var debitorId = order.getForeignId('debitor_id');
						var debitorRecord = new Tine.Billing.Model.Debitor({id:debitorId},debitorId);
						var debitorRequest = Tine.Billing.debitorBackend.loadRecord(
							debitorRecord, {
								scope: this,
								success: function(record) {
			                        this.debitorRecord = record;
			                        Ext.getCmp('payment_debitor_id').setValue(this.debitorRecord);
			                        //Ext.getCmp('payment_return_debit_base_payment_id').setValue(null);
			                		
			                        //Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(this.debitorRecord);
			                        //this.onRecordLoad();
			                    }
		                });
					}
					
				}
				this.receiptRecord = null;
			}
			
			if(this.debitorRecord){
				Ext.getCmp('payment_debitor_id').setValue(this.debitorRecord);
				Ext.getCmp('search_field_member_nr').setValue(this.debitorRecord.get('debitor_nr'));
				Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(this.debitorRecord);
			}
			
			if(this.memberNr){
				Ext.getCmp('search_field_member_nr').setValue(this.memberNr);
				this.memberNr = null;
			}
			//this.doLayout();
		}
		
		/*if(this.paymentWidget){
			this.paymentWidget.onLoadPayment(this.record);
		}*/
	},
	initWidgets: function(){
		//this.getPaymentWidget();
	},
	onAfterRender: function(){
		Ext.getCmp('payment_debitor_id').on('afterdrop', this.onDropDebitor, this);
		Ext.getCmp('payment_debitor_id').on('select', this.onChangeDebitor, this);
		Ext.getCmp('payment_order_id').on('afterdrop', this.onDropOrder, this);
		Ext.getCmp('payment_order_id').on('select', this.onChangeOrder, this);
		Ext.getCmp('payment_receipt_id').on('afterdrop', this.onDropReceipt, this);
		Ext.getCmp('payment_receipt_id').on('select', this.onChangeReceipt, this);
		
		Ext.getCmp('payments_type').on('select', this.onChangeType, this);
		
		
		
		this.initDialog();
	},
	initDialog: function(){
		
		this.getForm().reset();
		Ext.getCmp('payment_payment__type').setValue('PAYMENT');
		Ext.getCmp('payment_payment_date').setValue(new Date());
		Ext.getCmp('payment_erp_context_id').setValue('MEMBERSHIP');
		Ext.getCmp('payments_type').setValue('DEBIT');
		Ext.getCmp('donation_amount').setValue(0);
		Ext.getCmp('payment_account_system_id').selectDefault();
		
	},
	onPayOpenItems: function(){
		this.payLoadMask = new Ext.LoadMask(this.el, {msg:'Ausbuchung OP läuft...'});
		this.payLoadMask.show();
		var result = this.instantOpenItemGrid.getFromStoreAsArray();
		this.onRecordUpdate();
		var donationData = {
			donation_amount: Ext.getCmp('donation_amount').getValue(),
			campaign: Ext.getCmp('donation_campaign_id').getValue()
		};
		Ext.Ajax
		.request({
			scope : this,
			params : {
				method : 'Billing.payOpenItems',
				data : Ext.util.JSON.encode(result),
				paymentRecord: Ext.util.JSON.encode(this.record.data),
				donationData:  Ext.util.JSON.encode(donationData)
			},
			success : function(response) {
				
				var result = Ext.util.JSON.decode(response.responseText);
				if (result.success) {
					this.payLoadMask.hide();
					this.instantOpenItemGrid.store.removeAll();
					this.initDialog();
				} else {
					this.payLoadMask.hide();
					this.instantOpenItemGrid.store.removeAll();
					this.initDialog();
					Ext.Msg.alert('Fehler','Offene Posten konnten nicht ausgebucht werden');
				}
			},
			failure : function(response) {
				this.payLoadMask.hide();
				this.instantOpenItemGrid.store.removeAll();
				this.initDialog();
				var result = Ext.util.JSON
						.decode(response.responseText);
				Ext.Msg
						.alert('Fehler',
								'Offene Posten konnten nicht ausgebucht werden');
			}
		});
	},
	onSearchOpenItems: function(){
		if(!this.searchingOpenItems){
			this.searchingOpenItems = true;
		}else{
			return;
		}
		this.searchLoadMask = new Ext.LoadMask(this.el, {msg:'Suche läuft...'});
		this.searchLoadMask.show();
		Ext.Ajax
		.request({
			scope : this,
			params : {
				method : 'Billing.getPayableOpenItems',
				memberNr :  Ext.getCmp('search_field_member_nr').getValue(),
				contactNr: Ext.getCmp('search_field_contact_nr').getValue(),
				amount: Ext.getCmp('payment_amount').getValue()
			},
			success : function(response) {
				var result = Ext.util.JSON
						.decode(response.responseText);
				if (result.success) {
					this.searchLoadMask.hide();
					if(result.debitor){
						var dId = Ext.getCmp('payment_debitor_id').getValue();
						
						this.debitorRecord = new Tine.Billing.Model.Debitor(result.debitor,result.debitor.id);
						if(dId != result.debitor.id){
							Ext.getCmp('payment_debitor_id').setValue(this.debitorRecord);
						}
						//Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(this.debitorRecord);
						//this.onDropDebitor(null, this.debitorRecord);
					}
					var results = result.result;
					var record;
					this.instantOpenItemGrid.store.removeAll();
					for(var i in results){
						if(typeof(results[i])==='object'){
							if(results[i].id !== undefined){
								record = new Tine.Billing.Model.OpenItemPayment(results[i],results[i].id);
								this.instantOpenItemGrid.store.add(record);
							}
						}
					}
					
					var sums = this.instantOpenItemGrid.getSummaryData();
					var total = parseFloat(sums.total_brutto,2);
					var payment = parseFloat(Ext.getCmp('payment_amount').getValue(),2);
					var saldation = Math.abs(payment)-Math.abs(total);
					if(saldation>0 ){
						Ext.getCmp('donation_amount').setValue(saldation);
					}
					this.searchingOpenItems = false;
					console.log(sums);
				} else {
					this.searchLoadMask.hide();
					this.searchingOpenItems = true;
					Ext.Msg
							.alert('Fehler',
									'Offene Posten konnten nicht abgefragt werden');
				}
			},
			failure : function(response) {
				this.searchLoadMask.hide();
				var result = Ext.util.JSON
						.decode(response.responseText);
				this.searchingOpenItems = true;
				Ext.Msg
						.alert('Fehler',
								'Offene Posten konnten nicht abgefragt werden');
			}
		});
	},
	initSearchPanel: function(){
		this.searchPanel = new Ext.Panel({
		        
		        anchor:'100%',
		        border: false,
		        frame:true,
		        
		        height:75,
		        items:[{xtype:'columnform',items:[
		            [ 
							{
								xtype: 'textfield',
								disabledClass: 'x-item-disabled-view',
								id: 'search_field_contact_nr',
								fieldLabel: 'Adress-Nr',
							    width: 140
							},{
								xtype: 'textfield',
								disabledClass: 'x-item-disabled-view',
								id: 'search_field_member_nr',
								fieldLabel: 'Mitglied-Nr',
							    width: 140
							},
							{
								xtype: 'sopencurrencyfield',
								fieldLabel: 'Überz. Spende', 
							    id:'donation_amount',
							    name:'_don_amount',
							    minValue:0,
								disabledClass: 'x-item-disabled-view',
								blurOnSelect: true,
							    width:140
							},
							Tine.Donator.Custom.getRecordPicker('Campaign','donation_campaign_id',{
						    	fieldLabel: 'Spenden-Kampagne/Verwendungszweck',
						    	disabledClass: 'x-item-disabled-view',
						    	name: 'campaign_id',
							    appendFilters: [{field: 'is_closed', operator: 'equals', value: false }],
							    disabled: false,
							    width:300,
							    blurOnSelect: true,
							    allowBlank:true, 
							    hasDefault:true,
							    defaultIndicatorField: 'campaign_nr',
							    defaultComparisonValue: '1',
							    autoSelectDefault: true
							}),
							this.buttonSearchOpenItems,
							this.buttonPayOpenItems
						
				    ]]}]}
		);
	},
	onDropDebitor: function(el,debitorRecord){
		this.onChangeDebitor(debitorRecord);
	},
	onChangeDebitor: function(debitorRecord){
		if(debitorRecord.data){
			this.debitorRecord = debitorRecord;
		}else{
			this.debitorRecord = debitorRecord.selectedRecord;
		}
		Ext.getCmp('payment_order_id').setDebitor(this.debitorRecord );
		Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(this.debitorRecord);
		Ext.getCmp('payment_order_id').setValue(null);
		Ext.getCmp('payment_receipt_id').setValue(null);
		if(this.perspective != 'mt940'){
			Ext.getCmp('payment_amount').setValue(0);
		}
		var contactId = this.debitorRecord.getForeignId('contact_id');
		Ext.getCmp('search_field_contact_nr').setValue(contactId);
		Ext.getCmp('search_field_member_nr').setValue('');
		if(this.perspective == 'mt940'){
			this.onSearchOpenItems();
		}
		
		
	},
	onDropOrder: function(el,orderRecord){
		this.onChangeOrder(orderRecord);
	},
	onChangeOrder: function(orderRecord){
		if(orderRecord.data){
			this.orderRecord = orderRecord;
		}else{
			this.orderRecord = orderRecord.selectedRecord;
		}
		var debitor = this.orderRecord.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		Ext.getCmp('payment_debitor_id').setValue(debitor);
		//Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(debitor);
		Ext.getCmp('payment_erp_context_id').setValue(this.orderRecord.get('erp_context_id'));
		Ext.getCmp('payment_receipt_id').setOrder(this.orderRecord );
		Ext.getCmp('payment_receipt_id').setValue(null);
		Ext.getCmp('payment_amount').setValue(0);
	},
	onDropReceipt: function(el,receiptRecord){
		this.onChangeReceipt(receiptRecord);
	},
	onChangeReceipt: function(receiptRecord){
		if(receiptRecord.data){
			this.receiptRecord = receiptRecord;
		}else{
			this.receiptRecord = receiptRecord.selectedRecord;
		}
		Ext.getCmp('payment_amount').setValue(this.receiptRecord.get('total_brutto') );
		Ext.getCmp('payment_erp_context_id').setValue(this.receiptRecord.get('erp_context_id'));
		var order = this.receiptRecord.getForeignRecord(Tine.Billing.Model.Order, 'order_id');
		var debitor = order.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		Ext.getCmp('payment_order_id').setValue(order);
		Ext.getCmp('payment_debitor_id').setValue(debitor);
		//Ext.getCmp('payment_return_debit_base_payment_id').setValue(null);
		Ext.getCmp('payment_return_debit_base_payment_id').setDebitorRecord(debitor);
		
	},
	onChangeType: function(type){
		try{
			/*var debitAccount = Ext.getCmp('payment_account_system_id').selectedRecord;
			var creditAccount = Ext.getCmp('payment_account_system_id_haben').selectedRecord;
			
			Ext.getCmp('payment_account_system_id').setValue(creditAccount);
			Ext.getCmp('payment_account_system_id_haben').setValue(debitAccount);*/
		}catch(e){
			//silent failure
		}
		
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {

		this.formItemsPanel = Tine.Billing.getPaymentFormItems();
		return {
			xtype:'panel',
			id:'payment-form-panel',
			title: 'Zahlung',
			region:'center',
			layout: {
                type: 'vbox',
                align: 'stretch',
                pack:'start'
                	
            },
			items:[
			    this.searchPanel,
				{
				    xtype: 'panel',
				    region:'center',
				    flex:1,
				    border: false,
				    layout:'border',
				    items: [
				      
							{
							    xtype: 'panel',
							    region:'west',
							    border: false,
							    autoScroll:true,
							    width:400,
							    frame:true,
							    items:[
							           this.formItemsPanel
							    ]
							},
				    	     
				    	     this.mt940PaymentGridPanel
				    	  ]
				 
				},
				
this.instantOpenItemGrid
				
	
			
				
				
		]};
	}/*,
	getPaymentWidget: function(){
		if(!this.paymentWidget){
			this.paymentWidget = new Tine.Billing.PaymentWidget({
					region: 'north',
					layout:'fit',
					height:40,
					editDialog: this
			});
		}
		return this.paymentWidget;
	}*/
});

//extended content panel constructor
Tine.Billing.PaymentEditDialogPanel = Ext.extend(Ext.Panel, {
	panelManager:null,
	windowNamePrefix: 'PaymentEditWindow_',
	appName: 'Billing',
	layout:'fit',
	bodyStyle:'padding:0px;padding-top:5px',
	forceLayout:true,
	initComponent: function(){
		this.initSelectionGrids();
		
		Ext.apply(this.initialConfig,{region:'center'});
		
		var regularDialog = new Tine.Billing.PaymentExtendedEditDialog(this.initialConfig);
		regularDialog.setTitle('Zahlung');
		regularDialog.doLayout();
		this.items = this.getItems(regularDialog);
		Tine.Billing.PaymentEditDialogPanel.superclass.initComponent.call(this);
	},
	initSelectionGrids: function(){
		/*this.paymentSelectionGrid = new Tine.Billing.PaymentSelectionGridPanel({
			id: 'payment-selection-grid',
			doInitialLoad:false,
			title:'Zahlungen',
			layout:'border',
			app: Tine.Tinebase.appMgr.get('Billing')
		});*/
	},
	getItems: function(regularDialog){
		var recordChoosers = [
			/*{
				xtype:'invoiceselectiongrid',
				id: 'payment-invoice-selection-grid',
				title:'Rechnungen',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Billing')
			},{
				xtype:'orderselectiongrid',
				id: 'payment-order-selection-grid',
				title:'Aufträge',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Billing')
			},*/
			//this.paymentSelectionGrid,
			{
				xtype:'debitorselectiongrid',
				id: 'payment-debitor-selection-grid',
				title:'Debitoren',
				doInitialLoad:false,
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Billing')
			}
			
		];
		
		// use some fields from brevetation edit dialog
		 var recordChooserPanel = {
				 xtype:'panel',
				 layout:'accordion',
				 region:'east',
				 title: 'Auswahlübersicht',
				 width:600,
				 collapsible:true,
				 collapsed:true,
				 bodyStyle:'padding:8px;',
				 split:true,
				 items: recordChoosers
		 };
		return [{
			xtype:'panel',
			layout:'border',
			items:[
			       // display creditor widget north
			       //regularDialog.getPaymentWidget(),
			       // tab panel containing creditor master data
			       // + dependent panels
			       regularDialog,
			       // place record chooser east
			       recordChooserPanel
			]
		}];
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.PaymentEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.PaymentEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.PaymentEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.PaymentExtendedEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.PaymentEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.PaymentEditDialogPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getPaymentFormItems = function(){
	var fields = Tine.Billing.PaymentFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		frame:true,
		items:[
			{xtype:'columnform',border:false,items:
		   	[[
		   	  	fields.overpay, fields.payment_method_id //, {xtype:'hidden', name:'additional_data'},{xtype:'hidden', name:'multiple_ops'}
		   	],[
		   	   fields.payment_date,fields.amount,fields.type
		   	],[
		   	   fields.is_cancelled,fields.is_cancellation,
			   fields.is_return_debit,fields.print_inquiry,
			   fields.set_accounts_banktransfer
			],[
			   fields.return_inquiry_fee,fields.return_debit_base_payment_id
			],[	  		  
		   	   fields.account_system_id
		 	],[	  		  
			   fields.account_system_id_haben
		  	],[
			  fields.debitor_id
			],[	    
		   	  fields.usage
		  	],[		
			  fields.id,fields.open_item_id,fields.erp_context_id,fields.payment_type,
			],[			   	  
		   	  fields.order_id
		   	],[			   	  
		      fields.receipt_id
		   	],[     
		      fields.booking_id
		   	],[     
		       fields.account_booking_id
		   ]]}
		]
	}];
};		   	                                         

Ext.ns('Tine.Billing.PaymentFormFields');

Tine.Billing.PaymentFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{
	    		xtype:'hidden',
			    id:'payment_id',
			    name:'id',
			    width: 1
	    	},
	    erp_context_id:
	    	{
				xtype: 'combo',
				id:'payment_erp_context_id',
				name:'erp_context_id',
				fieldLabel: 'Kontext',
				store:[['ERP','ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']],
			    value: 'ERP',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all',
			    width:150
			},
	    open_item_id: 
			{
	    		xtype:'hidden',
			    id:'payment_open_item_id',
			    name:'open_item_id',
			    width: 1
	    	},
		debitor_id:
	        Tine.Billing.Custom.getDebitorRecordPicker('payment_debitor_id',
    		{
    		    fieldLabel: 'Debitor',
    		    name:'debitor_id',
    		    width: 350,
    		    ddConfig:{
   		        	ddGroup: 'ddGroupDebitor'
   		        }
    		}),
		order_id:
	        Tine.Billing.Custom.getOrderRecordPicker('payment_order_id',
    		{
    		    fieldLabel: 'Auftrag',
    		    name:'order_id',
    		    width: 350,
    		    allowBlank:true,
    		    ddConfig:{
   		        	ddGroup: 'ddGroupOrder'
   		        }
    		}),
		receipt_id:
	        Tine.Billing.Custom.getInvoiceRecordPicker('payment_receipt_id',
    		{
    		    fieldLabel: 'Rechnung',
    		    name:'receipt_id',
    		    width: 350,
    		    allowBlank:true,
    		    ddConfig:{
   		        	ddGroup: 'ddGroupInvoice'
   		        }
    		}),
		payment_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Zahlungsdatum', 
			id:'payment_payment_date',
			name:'payment_date',
		    width: 120
		},
		account_system_id:
			Tine.Billing.Custom.getRecordPicker('AccountSystem', 'payment_account_system_id',
			{
			    fieldLabel: 'Konto Soll',
			    name:'account_system_id',
			    width: 350,
			    displayFunc:'getTitle',
			    hasDefault:true,
			    defaultIndicatorField: 'is_default_bank_account',
			    defaultComparisonValue: '1',
			    autoSelectDefault: true
			}),
		account_system_id_haben:
			Tine.Billing.Custom.getRecordPicker('AccountSystem', 'payment_account_system_id_haben',
			{
			    fieldLabel: 'Konto Haben',
			    name:'account_system_id_haben',
			    width: 350,
			    displayFunc:'getTitle',
			    hasDefault:true,
			    defaultIndicatorField: 'number',
			    defaultComparisonValue: '14000',
			    autoSelectDefault: true
			}),			
		booking_id:
			Tine.Billing.Custom.getRecordPicker('Booking', 'payment_booking_id',
			{
			    fieldLabel: 'Buchung',
			    name:'booking_id',
			    disabled:true,
			    width: 350 ,
			    displayFunc:'getTitle'
			}),
		account_booking_id:
			Tine.Billing.Custom.getRecordPicker('AccountBooking', 'payment_account_booking_id',
			{
			    fieldLabel: 'Einzelbuchung',
			    name:'account_booking_id',
			    disabled:true,
			    width: 350,
			    displayFunc:'getTitle'
			}),
		payment_type:		    
	    {
		    fieldLabel: 'Art',
		    disabledClass: 'x-item-disabled-view',
		    id:'payment_payment__type',
		    name:'payment_type',
		    width: 200,
		    xtype:'combo',
		    store:[['PAYMENT','Zahlung'], ['DISAGIO','Abschlag']],
		    value: 'PAYMENT',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},
		amount:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zahlbetrag', 
		    id:'payment_amount',
		    minValue:0,
		    name:'amount',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:140
	 	},
		usage:
		{
			xtype: 'textarea',
			fieldLabel: 'VwZw',
			disabledClass: 'x-item-disabled-view',
			id:'payment_usage',
			name:'usage',
			width: 350,
			height: 80
		},
		type:
		{
		    fieldLabel: 'Eingang/Ausgang',
		    disabledClass: 'x-item-disabled-view',
		    id:'payments_type',
		    name:'type',
		    width: 90,
		    xtype:'combo',
		    store:[['DEBIT','Eingang'],['CREDIT','Ausgang']],
		    value: 'DEBIT',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},
		overpay:		    
	    {
		    fieldLabel: 'bei Überzahlung',
		    disabledClass: 'x-item-disabled-view',
		    id:'payment_overpay',
		    name:'overpay',
		    width: 200,
		    xtype:'combo',
		    store:[['DONATION','Spende'], ['PREPAYMEMBERFEE','Vorausz. Mitgliedsbeitrag']],
		    value: 'DONATION',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},
		payment_method_id:
			Tine.Billing.Custom.getRecordPicker('PaymentMethod', 'open_item_payment_method_id',
			{
			    fieldLabel: 'Zahlungsart',
			    name:'payment_method_id',
			    columnwidth: 100
			}),
		is_cancelled: {
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'payment_is_cancelled',
				name: 'is_cancelled',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'storniert',
			    width: 200
			},
		is_cancellation: {
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'payment_is_cancellation',
				name: 'is_cancellation',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'ist Storno',
			    width: 200
			},
		return_inquiry_fee:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Rücklast.gebühr', 
			    id:'payment_return_inquiry_fee',
				minValue:0,
			    name:'return_inquiry_fee',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:140
		 	},
		print_inquiry: 
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'payment_print_inquiry',
				name: 'print_inquiry',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'Nachforsch.drucken',
			    width: 200
			},
		is_return_debit: 
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'payment_is_return_debit',
				name: 'is_return_debit',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'ist Rücklastschrift',
			    width: 200
			},
		set_accounts_banktransfer: 
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'payment_set_accounts_banktransfer',
				name: 'set_accounts_banktransfer',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'auf Überweiser setzen',
			    width: 200
			},
		inquiry_print_date:
			{
			   	xtype: 'extuxclearabledatefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Datum Druck Nachf.', 
				id:'payment_inquiry_print_date',
				name:'inquiry_print_date',
			    width: 120
			},
		return_debit_base_payment_id:
			Tine.Billing.Custom.getRecordPicker('Payment', 'payment_return_debit_base_payment_id',
			{
			    fieldLabel: 'LS-Zahlung',
			    name:'return_debit_base_payment_id',
			    disabled:false,
			    useDebitor:true,
			    width: 350 ,
			    displayFunc:'getTitle'
			})
	};
}