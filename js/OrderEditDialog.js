Ext.namespace('Tine.Billing');

Tine.Billing.OrderEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	/**
	 * @priOrdere
	 */
	//windowNamePrefix: 'OrderEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Order,
	recordProxy: Tine.Billing.orderBackend,
	loadRecord: false,
	job:null,
	debitor:null,
	evalGrants: false,
	frame:true,
	/**
	 * var selectedReceipt
	 * {Tine.Billing.Model.Receipt} A selected receipt (calculation or bid) to be transformed to 
	 * confirmed order!
	 */
	selectedReceipt: null,
	/**
	 * init the component
	 */
	initComponent: function(){
		this.initDependentGrids();
	    this.tbarItems = [new Tine.widgets.activities.ActivitiesAddButton({})];
	    this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.OrderEditDialog.superclass.initComponent.call(this);
		this.on('load',this.onLoadOrder, this);
	},
    initButtons: function(){
    	Tine.Billing.OrderEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
    onAfterRender: function(){
    	if(this.record.id==0){
    		Ext.getCmp('order_payment_method_id').selectDefault();
    	}
    },
	initDependentGrids: function(){
		this.calculationGrid = new Tine.Billing.CalculationGridPanel({
			title:'Kalkulationen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.bidGrid = new Tine.Billing.BidGridPanel({
			title:'Angebote',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.confirmGrid = new Tine.Billing.ConfirmGridPanel({
			title:'Auftragsbestätigung',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.shippingGrid = new Tine.Billing.ShippingGridPanel({
			title:'Lieferscheine',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.invoiceGrid = new Tine.Billing.InvoiceGridPanel({
			title:'Rechnungen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});	
		this.creditGrid = new Tine.Billing.CreditGridPanel({
			title:'Gutschriften',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});	
		this.monitionGrid = new Tine.Billing.MonitionGridPanel({
			title:'Mahnungen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});	
		this.integratedGrid = new Tine.Billing.AllReceiptsGridPanel({
			title:'Alle Vorgänge',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			defaultFilter: {field:'query',operator:'contains',value:''},
			app: Tine.Tinebase.appMgr.get('Billing')
		});	
		
		this.bidGrid.getGrid().getSelectionModel().on('selectionchange', this.onReceiptSelect, this);
		this.calculationGrid.getGrid().getSelectionModel().on('selectionchange', this.onReceiptSelect, this);
		this.invoiceGrid.getGrid().getSelectionModel().on('selectionchange', this.onReceiptSelect, this);
	},
	onReceiptSelect: function(sm){
		 var transOrderButton = Ext.getCmp('transOrderButton');
		 var monitionButton = Ext.getCmp('monitionButton');
		 if (sm.getCount() == 1) {
        	 var aSel = sm.getSelections();
        	 this.selectedReceipt = aSel[0];
        	 if(this.selectedReceipt.get('type')=='INVOICE'){
        		 monitionButton.enable();
        		 return;
        	 }else{
        		 transOrderButton.enable();
        		 return;
        	 }
         }
		 this.selectedReceipt = null;
         transOrderButton.disable();
         monitionButton.disable();
	},
	onLoadOrder: function(){
		if(this.record.id == 0){
			if(this.job){
				this.record.data.job_id = new Tine.Billing.Model.Job(this.job.data, this.job.id);
			}
			if(this.debitor){
				this.record.data.debitor_id = new Tine.Billing.Model.Debitor(this.debitor.data, this.debitor.id);
				this.record.data.price_group_id = this.record.data.debitor_id.get('price_group_id');
			}
		}else{
			var debitorRecord = new Tine.Billing.Model.Debitor(this.record.data.debitor_id);
			var contactRecord = debitorRecord.getForeignRecord(Tine.Addressbook.Model.Contact,'contact_id');
			
			this.orderPositionsGrid.loadDebitorData({
				debitorRecord: debitorRecord,
				contactRecord: contactRecord,
				orderRecord: this.record,
				receiptRecord: null,
				priceGroupId: debitorRecord.getForeignId('price_group_id')
			});
			var confirmState = this.record.get('confirm_state');
			var deliveryState = this.record.get('delivery_state');
			var billState = this.record.get('bill_state');
			
			this.orderPositionsGrid.enable();
			this.articleSelectionGrid.enable();
			if(confirmState === 'UNCONFIRMED' && deliveryState === 'TOBEDELIVERED' && billState ==='TOBEBILLED'){
				
			}
			if(confirmState === 'CONFIRMED'){
				this.getBidMenu().disable();
				this.getConfirmButton().disable();
			}
			if(deliveryState != 'TOBEDELIVERED' && billState != 'TOBEBILLED'){
				this.getBillMenu().disable();
			}
		}
		
		this.calculationGrid.loadOrder(this.record);
		this.bidGrid.loadOrder(this.record);
		this.confirmGrid.loadOrder(this.record);
		this.shippingGrid.loadOrder(this.record);
		this.invoiceGrid.loadOrder(this.record);
		this.creditGrid.loadOrder(this.record);
		this.monitionGrid.loadOrder(this.record);
		this.integratedGrid.loadOrder(this.record);

		if(this.record.id !== 0){
			this.calculationGrid.enable();
			this.bidGrid.enable();
			this.confirmGrid.enable();
			this.shippingGrid.enable();
			this.invoiceGrid.enable();
			this.creditGrid.enable();
			this.monitionGrid.enable();
			this.integratedGrid.enable();
		}
	},
	onAddCalc: function(){
		this.calcWin = Tine.Billing.CalculationEditDialog.openWindow({
			order: this.record
		});
		this.calcWin.on('beforeclose',this.onReloadCalc,this);
	},
	onAddBid: function(){
		this.bidWin = Tine.Billing.BidEditDialog.openWindow({
			order: this.record
		});
		this.bidWin.on('beforeclose',this.onReloadBid,this);
	},
	onAddShipping: function(){
		this.shippingWin = Tine.Billing.ShippingEditDialog.openWindow({
			order: this.record
		});
		this.shippingWin.on('beforeclose',this.onReloadShipping,this);
	},
	onAddInvoice: function(){
		this.invoiceWin = Tine.Billing.InvoiceEditDialog.openWindow({
			order: this.record
		});
		this.invoiceWin.on('beforeclose',this.onReloadInvoice,this);
	},
	onAddCredit: function(){
		this.creditWin = Tine.Billing.CreditEditDialog.openWindow({
			order: this.record
		});
		this.creditWin.on('beforeclose',this.onReloadCredit,this);
	},
	onAddMonition: function(){
		this.monitionWin = Tine.Billing.MonitionEditDialog.openWindow({
			order: this.record
		});
		this.monitionWin.on('beforeclose',this.onReloadMonition,this);
	},
	onEditMonition: function(receiptRecord){
		this.monitionWin = Tine.Billing.MonitionEditDialog.openWindow({
			record: receiptRecord,
			order: this.record
		});
		this.monitionWin.on('beforeclose',this.onReloadMonition,this);
	},
	onReloadCalc: function(){
		this.calculationGrid.getStore().reload();
	},
	onReloadBid: function(){
		this.bidGrid.getStore().reload();
	},
	onReloadShipping: function(){
		this.shippingGrid.getStore().reload();
	},
	onReloadInvoice: function(){
		this.invoiceGrid.getStore().reload();
	},	
	onReloadCredit: function(){
		this.creditGrid.getStore().reload();
	},	
	onReloadMonition: function(){
		this.creditGrid.getStore().reload();
	},	
	onProcessConfirm: function(){
		var params = this.getParamsModel();
		params.params.process.confirm.active = true;
		this.requestProcessOrder(params);
	},
	onProcessDelivery: function(){
		var params = this.getParamsModel();
		params.params.process.delivery.active = true;		
		this.requestProcessOrder(params);
	},
	onProcessBilling: function(){
		var params = this.getParamsModel();
		params.params.process.billing.active = true;
		this.requestProcessOrder(params);
	},
	onProcessDeliveryAndBilling: function(){
		var params = this.getParamsModel();
		params.params.process.delivery.active = true;
		params.params.process.billing.active = true;
		this.requestProcessOrder(params);
	},
	requestProcessOrder: function(parameters){
		parameters.method = 'Billing.processOrder';
		Ext.Ajax.request({
            scope: this,
            success: this.onProcessOrder,
            params: parameters,
            failure: this.onProcessOrderFailure
        });
	},
	onProcessOrder: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		if(result.success == true){
			var order = result.result;
			this.record = new Tine.Billing.Model.Order(order,order.id);
			this.onRecordLoad();
			this.confirmGrid.getStore().reload();
			this.shippingGrid.getStore().reload();
			this.invoiceGrid.getStore().reload();
			this.creditGrid.getStore().reload();
			this.monitionGrid.getStore().reload();
		}
	},
	onProcessOrderFailure: function(){
		Ext.MessageBox.show({
            title: 'Vorgang nicht ausgeführt', 
            msg: 'Der gewünschte Vorgang für diesen Auftrag konnte nicht ausgeführt werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	onRequestOrderReceipt: function(){
		var orderId = this.record.get('id');
		var receiptId = this.selectedReceipt.get('id');
		Ext.Ajax.request({
            scope: this,
            success: this.onProcessOrder,
            params: {
            	method: 'Billing.orderReceipt',
            	orderId: orderId,
            	receiptId: receiptId
            },
            failure: this.onProcessOrderFailure
        });
	},
	onCreateMonition: function(){
		var orderId = this.record.get('id');
		var invoiceId = this.selectedReceipt.get('id');
		Ext.Ajax.request({
            scope: this,
            success: this.onAfterCreateMonition,
            params: {
            	method: 'Billing.createMonition',
            	orderId: orderId,
            	invoiceId: invoiceId
            },
            failure: this.onProcessOrderFailure
        });
	},
	onAfterCreateMonition: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		if(result.success == true){
			var data = result.result;
			var receiptRecord = new Tine.Billing.Model.Receipt(data,data.id);
			this.monitionGrid.getStore().reload();
			this.onEditMonition(receiptRecord);
		}
	},
	getParamsModel: function(){
		var params = {
			orderId: null,
			params:{
				process: {
					confirm:{
						active: false,
						bidId: null,
						orderPositions: new Ext.util.MixedCollection()
					},
					delivery:{
						active: false
					},
					billing: {
						active: false
					}
				}
			}
		};
		params.orderId = this.record.id;
		return params;
	},
	getFormItems: function(){
		var toolbar = new Ext.Toolbar();
		
		 var menu = new Ext.menu.Menu({
		        id: 'receiptMenu',
		        style: {
		            overflow: 'visible'     // For the Combo popup
		        },
		        items: [
		            {text: 'Neue Kalkulation', handler: this.onAddCalc, scope:this},
		            {text: 'Neues Angebot', handler: this.onAddBid, scope:this}
		            
		 ]});

		 toolbar.add(
				 {
					 text: 'Angebotsphase',
					 id: 'bidMenu',
					 menu: menu
				 }
		 );
		 
		 var abMenu = new Ext.menu.Menu({
		        id: 'abMenu',
		        style: {
		            overflow: 'visible'     // For the Combo popup
		        },
		        items: [
		            {text: 'gewählte(s) Kalkulation/Angebot', id:'transOrderButton', disabled:true, handler: this.onRequestOrderReceipt, scope:this},
		            {text: 'erfasste Auftragspositionen', handler: this.onProcessConfirm, scope:this}
		 ]});
		 
		 toolbar.add(
				 {
					 text: 'Auftragserteilung',
					 id: 'confirmButton',
					 menu: abMenu
				 }
		 );
		 
		 var lMenu = new Ext.menu.Menu({
		        style: {
		            overflow: 'visible'     // For the Combo popup
		        },
		        items: [
		            {text: 'mit Lieferschein', handler: this.onProcessDelivery, scope:this},
		            {text: 'mit Rechnung', handler: this.onProcessBilling, scope:this},
		            {text: 'mit Lieferschein und Rechnung', handler: this.onProcessDeliveryAndBilling, scope:this}
		            
		 ]});
		 
		 toolbar.add(
				 {
					 id: 'billMenu',
					 text: 'Lieferung u. Leistung',
					 menu: lMenu
				 }
		 );		 
		 
		 toolbar.add(
				 {
					 text: 'Gutschrift',
					 id: 'creditButton',
					 handler: this.onAddCredit, scope:this
				 }
		 );
		 toolbar.add(
				 {
					 text: 'Mahnung',
					 id: 'monitionButton',
					 disabled:true,
					 handler: this.onCreateMonition, scope:this
				 }
		 );
		 
		this.articleSelectionGrid = new Tine.Billing.ArticleSelectionGridPanel({
			title:'Artikel',
			region:'south',
			layout:'border',
			height:200,
			disabled:true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.dependentPanel = new Ext.Panel(
				{
					xtype:'panel',
					header:false,
					layout:'fit',
					collapsible:true,
					items: [
					{
						xtype:'tabpanel',
						border: false,
						autoDestroy:true,
						layoutOnTabChange: true,
						forceLayout:true,
						activeTab:0,
						items:[
						 	this.calculationGrid,
						 	this.bidGrid,
						 	this.confirmGrid,
						 	this.shippingGrid,
						 	this.invoiceGrid,
						 	this.creditGrid,
						 	this.monitionGrid,
						 	this.integratedGrid
					   ]
					}  
					]
				}
		);
		
		
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: 'Billing_Model_Order'
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.Order,
            disabled: (Tine.Billing.registry.get('customfields').length === 0),
            quickHack: {record: this.record}
        });
		
        this.orderPositionsGrid = new Tine.Billing.QuickOrderGridPanel({
	    	region:'center',
	    	title: 'Auftragspositionen',
	    	storeAtOnce: true,
	    	disabled:true
	    });
		this.formItemsPanel = Tine.Billing.getOrderFormItems();
		return {
			xtype:'panel',
			header:false,
			region:'center',
			layout:'border',
			autoScroll:'true',
			items:[
				{
					xtype:'tabpanel',
					region:'center',
					border: false,
					autoDestroy:true,
					layoutOnTabChange: true,
					forceLayout:true,
					activeTab:0,
					tbar: toolbar,
					items:[
					 	{
						    xtype: 'panel',
						    title:'Auftrag',
						    border: false,
						    autoScroll:true,
						    height:360,
						    frame:true,
						    items: this.formItemsPanel
						},
					 	this.activitiesPanel,
					 	this.customFieldsPanel,
					 	{
							xtype:'panel',
							//region:'south',
							//header:false,
							//height: 300,
							layout:'fit',
							'title' : 'Vorgänge/Belege',
//							collapsible:true,
//							collapseMode:'mini',
//							split:true,
							items:[this.dependentPanel]
						}  
				   ]
				},{
                    // activities and tags
                    region: 'east',
                    layout: 'accordion',
                    animate: true,
                    width: 210,
                    split: true,
                    collapsible: true,
                    collapseMode: 'mini',
                    header: false,
                    margins: '0 5 0 5',
                    border: true,
                    items: [
                        new Ext.Panel({
                            // @todo generalise!
                            title: this.app.i18n._('Description'),
                            iconCls: 'descriptionIcon',
                            layout: 'form',
                            labelAlign: 'top',
                            border: false,
                            items: [{
                                style: 'margin-top: -4px; border 0px;',
                                labelSeparator: '',
                                xtype:'textarea',
                                name: 'note',
                                hideLabel: true,
                                grow: false,
                                preventScrollbars:false,
                                anchor:'100% 100%',
                                emptyText: this.app.i18n._('Enter description'),
                                requiredGrant: 'editGrant'                           
                            }]
                        }),
                        new Tine.widgets.activities.ActivitiesPanel({
                            app: 'Billing',
                            showAddNoteForm: false,
                            border: false,
                            bodyStyle: 'border:1px solid #B5B8C8;'
                        }),
                        new Tine.widgets.tags.TagPanel({
                            app: 'Billing',
                            border: false,
                            bodyStyle: 'border:1px solid #B5B8C8;'
                        })
                    ]
                },
                
                {
					xtype:'panel',
					region:'south',
					layout:'border',
					height:500,
					split:true,
					items:[
					    this.orderPositionsGrid,
					    this.articleSelectionGrid
					]
				}
                
				
				
		]};
		
		
		return Tine.Billing.getOrderFormItems();
	},
	
	getBillMenu: function(){
		return Ext.getCmp('billMenu');
	},
	getBidMenu: function(){
		return Ext.getCmp('bidMenu');
	},
	getConfirmButton: function(){
		return Ext.getCmp('confirmButton');
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.OrderEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1200,
        height: 900,
        name: Tine.Billing.OrderEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.OrderEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
Tine.Billing.getOrderFormItems = function(){
	var fields = Tine.Billing.OrderFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.context,
		   	 	fields.account_id,
		   	 	fields.timeaccount_id,
		   		fields.job_id,
		   		fields.debitor_id,
		   		fields.price_group_id
		   		
		   	],[
		   	    fields.order_nr,
		   	   	fields.template_id,
				fields.template_varset_id,
			   	fields.cust_order_nr,
			   	fields.confirm_date,
			   	fields.payment_until_date
		   	],[
				
				fields.confirm_state,
				fields.delivery_state,
				fields.bill_state,
				fields.payment_state
			],[	
				fields.payment_method
		   	]]}
		]
	}];
};


Ext.ns('Tine.Billing.OrderFormFields');

Tine.Billing.OrderFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		context: 
			{
	    		xtype:'hidden',
			    id:'order_context',
			    name:'context',
			    width: 1
	    	},
		account_id: 
			{xtype: 'hidden',id:'order_account_id',name:'account_id'},
		timeaccount_id: 
			{xtype: 'hidden',id:'order_timeaccount_id',name:'timeaccount_id'},			
		// mandator_id:
			//{xtype: 'hidden',id:'receipt_mandator_id',name:'mandator_id'},
		job_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Job',
			    id:'order_job_id',
			    name:'job_id',
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Job
			}),
		debitor_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Kunde',
			    id:'order_debitor_id',
			    name:'debitor_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Debitor,
			    allowBlank:false
			}),
		
		template_id:
			{xtype: 'hidden',id:'receipt_template_id',name:'template_id'},
		template_varset_id:
			{xtype: 'hidden',id:'receipt_template_varset_id',name:'template_varset_id'},
		price_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Preisgruppe',
			    id:'order_price_group_id',
			    name:'price_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.PriceGroup,
			    allowBlank:false
			}),
	order_nr:
			{
		    	fieldLabel: 'Auftrags-Nr', 
			    id:'order_order_nr',
			    name:'order_nr',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:120
		 	},	
	cust_order_nr:
		{
	    	fieldLabel: 'Bestell-Nr', 
		    id:'order_cust_order_nr',
		    name:'cust_order_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
		},	
	confirm_state:		    
	    {
		    fieldLabel: 'Auftragsstatus',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_confirm_state',
		    name:'confirm_state',
		    width: 200,
		    xtype:'combo',
		    //disabled: true,
		    //hidden: true,			    
		    store:[['CONFIRMED','bestätigt'],['UNCONFIRMED','unbestätigt']],
		    value: 'UNCONFIRMED',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},	
	delivery_state:		    
	    {
		    fieldLabel: 'Lieferstatus',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_delivery_state',
		    name:'delivery_state',
		    width: 200,
		    xtype:'combo',
		    //disabled: true,
		    //hidden: true,			    
		    store:[['TOBEDELIVERED','zu liefern'], ['PARTLYDELIVERED','teilgeliefert'],['DELIVERED','geliefert']],
		    value: 'TOBEDELIVERED',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},	
	bill_state:		    
	    {
		    fieldLabel: 'Rechnungsstatus',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_bill_state',
		    name:'bill_state',
		    width: 200,
		    xtype:'combo',
		    //disabled: true,
		    //hidden: true,			    
		    store:[['TOBEBILLED','zu berechnen'],['PARTLYBILLED','teilberechnet'],['BILLED','berechnet']],
		    value: 'TOBEBILLED',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},	
	payment_state:		    
	    {
		    fieldLabel: 'Zahlungsstatus',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_payment_state',
		    name:'payment_state',
		    width: 200,
		    xtype:'combo',
		   // disabled: true,
		    //hidden: true,			    
		    store:[['TOBEPAYED','unbezahlt'],['PARTLYPAYED','teilbezahlt'],['PAYED','bezahlt']],
		    value: 'TOBEPAYED',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},
	payment_until_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Zu bezahlen bis', 
			id:'order_payment_until_date',
			name:'payment_until_date',
		    width: 150
		},
	confirm_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Auftragsbestätigung', 
			id:'order_confirm_date',
			name:'confirm_date',
		    width: 150
		},
	payment_method:
		Tine.Billing.Custom.getRecordPicker('PaymentMethod', 'order_payment_method_id',
		{
		    fieldLabel: 'Zahlungsart',
		    name:'payment_method_id',
		    columnwidth: 100
		})
	};
};