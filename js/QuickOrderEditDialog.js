Ext.namespace('Tine.Billing');

Tine.Billing.QuickOrderEditDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'QuickOrderEditWindow_',
	title: 'Auftrag Schnellerfassung',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
	recordClass: Tine.Billing.Model.QuickOrder,
	loadRecord: false,
	evalGrants: false,
	isSaving: false,
	isClosing: false,
	/**
	 * {Tine.Billing.QuickOrderGridPanel}	positions grid
	 */
	grid: null,
	/**
	 * initialize component
	 */
	initComponent: function(){
		this.initActions();
		this.initToolbar();
		var contactRecord = (this.contactRecord !== undefined) ? this.contactRecord : null;
		var debitorRecord = (this.debitorRecord !== undefined) ? this.debitorRecord : null;
		this.record = new Tine.Billing.Model.QuickOrder({
			contact_id: contactRecord,
			debitor_id: debitorRecord
		},0);
		this.tbar = new Ext.Toolbar([this.action_addContact]);
		this.items = this.getFormItems();
		Tine.Billing.QuickOrderEditDialog.superclass.initComponent.call(this);
		Ext.getCmp('billing_contact_id').on('change',this.onChangeContact, this);
		Ext.getCmp('billing_contact_id').on('select',this.onChangeContact, this);
		Ext.getCmp('billing_contact_id').on('afterdrop',this.onDropContact, this);
		
		this.getForm().loadRecord(this.record);
		this.getForm().clearInvalid();
	},
	resetDialog: function(){
		this.contactRecord = new Tine.Addressbook.Model.Contact({},0);
		this.debitorRecord = null;
		this.record = new Tine.Billing.Model.QuickOrder({
		contact_id: this.contactRecord,
		debitor_id: this.debitorRecord
	},0);
		this.getForm().reset();
		this.grid.getStore().removeAll();
		this.getContactWidget().onLoadContact(this.contactRecord);

		Ext.getCmp('billing_contact_id').setValue(this.contactRecord);
	},
	onRender: function(ct, position){
		Tine.Billing.QuickOrderEditDialog.superclass.onRender.call(this, ct, position);
		this.loadMask = new Ext.LoadMask(ct, {msg: 'Versuche Debitor zu laden'});
		if(this.contactRecord){
			this.checkDebitor(this.contactRecord.id);
		}
	},
	onChangeContact: function(sel){
		this.contactRecord = sel.selectedRecord;
		this.getContactWidget().onLoadContact(this.contactRecord);
		this.checkDebitor(this.contactRecord.id);
	},
	onUpdateContact: function(contact){
		this.bufferContact =  Ext.util.JSON.decode(contact);
		if(this.contactRecord && (this.contactRecord.id !== undefined) && (this.bufferContact.id == this.contactRecord.id)){
			return true;
		}
		if(this.grid.getStore().getCount()>0){
			Ext.MessageBox.show({
	             title: 'Auftragserfassung aktiv', 
	             msg: 'Möchten Sie den aktuellen Auftrag hiermit speichern, um dann mit dem neuen Debitor fortzufahren?',
	             buttons: Ext.Msg.YESNOCANCEL,
	             scope: this,
	             fn: this.intermediateOrder,
	             icon: Ext.MessageBox.QUESTION
	         });
		}else{
			this.reloadExternally();
		}
	},
	intermediateOrder: function(btn, text){
		if(btn=='yes'){
			this.saveQuickOrder();
		}else if(btn=='cancel'){
			return;
		}
		this.reloadExternally.defer(500,this);
	},
	reloadExternally: function(){
		if(this.isSaving){
			this.reloadExternally.defer(200,this);
		}
		this.resetDialog();
		contact = this.bufferContact;
		if(contact.id==0){
			return true;
		}
		this.contactRecord = new Tine.Addressbook.Model.Contact(contact, contact.id);
		this.contactSelector.setValue(this.contactRecord );
		// maybe contact widget is not initialized
		try{
			this.getContactWidget().onLoadContact(this.contactRecord);
		}catch(e){
			// silent failure ok
		}
		this.checkDebitor(this.contactRecord.id);
	},
	onDropContact: function(el, contactRecord){
		this.contactRecord = contactRecord;
		this.getContactWidget().onLoadContact(this.contactRecord);
		this.checkDebitor(this.contactRecord.id);
		Ext.getCmp('billing_payment_method').selectDefault();
	},
	onAddContact: function(){
		this.contactWin = Tine.Addressbook.ContactEditDialog.openWindow({
			simpleDialog: true,
			listeners:{
				update:{
					scope:this,
					fn: this.onUpdateContact
				}
			}
		});
		//this.contactWin.on('close',this.onReloadSelectionGrid,this);
	},
	/**
	 * load contact from widget
	 */
	onLoadContact: function(el, contactRecord){
		this.onDropContact(el,contactRecord);
	},
	checkDebitor: function(contactId){
		this.loadMask.show();
		Ext.Ajax.request({
            scope: this,
            params: {
                method: Tine.Billing.Config.QuickOrder.Strategy.Debitor.method,
    	        contactId: contactId,
    	        additionalData: null
            },
            success: function(response){
            	var result = Ext.util.JSON.decode(response.responseText);
            	if(result.success){
            		this.loadMask.hide();
            		var data = {
            			contactRecord: this.contactRecord,
            			debitorRecord: new Tine.Billing.Model.Debitor(result.result, result.result.id)
            		};
            		var debitorNrField = Ext.getCmp('debitor_debitor_nr');
            		debitorNrField.setValue(result.result.debitor_nr);
            		var debitorPGField = Ext.getCmp('debitor_price_group_id');
            		debitorPGField.setValue(new Tine.Billing.Model.PriceGroup(result.result.price_group_id));
            		this.grid.loadDebitorData(data);
            	}else{
	        		Ext.Msg.alert(
            			'Hinweis', 
                        'Kein Kundensatz vorhanden.'
                    );
            	}
        	},
        	failure: function(response){
        		var result = Ext.util.JSON.decode(response.responseText);
        		Ext.Msg.alert(
        			'Fehler', 
                    'Kunde konnte nicht abgefragt werden'
                );
        	}
        });
	},
	/**
	 * init bottom toolbar
	 */
	initToolbar: function(){
		this.bbar = new Ext.Toolbar({
			height:48,
        	items: [
        	        '->',
                    Ext.apply(new Ext.Button(this.actions_saveQuickOrder), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    }),
        	        Ext.apply(new Ext.Button(this.actions_cancel), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    }),
                    Ext.apply(new Ext.Button(this.actions_saveQuickOrderAndClose), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    })
                ]
        });
	},
	/**
	 * init toolbar (button) actions
	 */
	initActions: function(){
        this.actions_saveQuickOrder = new Ext.Action({
            text: 'Speichern & weiterer Auftrag',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.saveQuickOrder,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_saveQuickOrderAndClose = new Ext.Action({
            text: 'Speichern & Schliessen',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.saveQuickOrderAndClose,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_cancel = new Ext.Action({
            text: 'Abbrechen',
            disabled: false,
            iconCls: 'action_cancel',
            handler: this.cancel,
            scale:'small',
            iconAlign:'left',
            scope: this
        });   
        this.action_addContact = new Ext.Action({
            actionType: 'edit',
            handler: this.onAddContact,
            iconCls: 'actionAdd',
            text: 'Neuen Kontakt anlegen und verwenden',
            scope: this
        });
	},

	previewQuickOrder: function(){
		this.saveQuickOrder(true);
	},
	saveQuickOrderAndClose: function(){
		this.isClosing = true;
		this.saveQuickOrder();
	},
	/**
	 * save the order including positions
	 */
	saveQuickOrder: function(){
		if(this.validate()){
			var posData = this.grid.getFromStoreAsArray();
			for(var i in posData){
				delete posData[i].article_record;
				posData[i].additionalData = {
					COMMENT: posData[i].comment
				};
			}
			
			var data = {
					contactId: Ext.getCmp('billing_contact_id').getValue(),
					withShippingDoc: Ext.getCmp('billing_with_shipping_doc').getValue(),
					paymentMethodId: Ext.getCmp('billing_payment_method').getValue(),
					paymentState: Ext.getCmp('billing_payment_state').getValue(),
					paymentConditions: Ext.getCmp('billing_special_payment_condition').getValue(),
					positions: posData
			}
			this.isSaving = true;
			
			Ext.Ajax.request({
	            scope: this,
	            params: {
	                method: 'Billing.createQuickOrder',
	                data: data
	            },
	            success: function(response){
	            	var result = Ext.util.JSON.decode(response.responseText);
	            	if(result.success){
	            		var invoices = result.data.invoices;
	            		var shippings = result.data.shippings;
	            		var invoiceId = invoices[0].id;
	            		var shipDocId;
	            		if(typeof(shippings)=='object'){
	            			if(shippings[0] !== undefined){
	            				shipDocId = shippings[0].id;
	            			}
	            		}
	            		
	            		var receiptIds = [invoiceId];
	            		if(shipDocId){
	            			receiptIds.push(shipDocId);
	            		}
	            		
	            		var receiptParam = Ext.util.JSON.encode(receiptIds);
	            		if(Ext.getCmp('billing_print_at_once').getValue()){
		            		var win = window.open(
		            				Sopen.Config.runtime.requestURI + '?method=Billing.printReceipts&ids='+receiptParam,
		            				"receiptsPDF",
		            				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		            		);
	            		}
	            		
	            		this.resetDialog();
	            		this.isSaving = false;
	            		if(this.isClosing){
	            			this.cancel();
	            		}
	            	}else{
		        		Ext.Msg.alert(
	            			'Fehler', 
	                        'Der Auftrag kann nicht angelegt werden.'
	                    );
	            	}
	        	},
	        	failure: function(response){
	        		var result = Ext.util.JSON.decode(response.responseText);
	        		Ext.Msg.alert(
            			'Fehler', 
                        'Der Auftrag kann nicht angelegt werden.<br/>Geben Sie bitte Positionen ein.<br/>' + result
                    );
	        	}
	        });
		}else{
			Ext.Msg.alert(
    			'Fehler', 
                'Der Auftrag kann nicht angelegt werden.<br/>Geben Sie bitte Positionen ein.'
            );
		}
	},
	/**
	 * Cancel and close window
	 */
	cancel: function(){
		this.purgeListeners();
        this.window.close();
	},
	/**
	 * Validate the order -> check whether positions are there
	 * other validation necessary? -> implement
	 * -preValidation is done already when adding a position
	 * -formFields of this dialog are validated instantly
	 */
	validate: function(){
		return this.validatePositions();
	},
	/**
	 * check whether positions are put in
	 */
	validatePositions: function(){
		if(this.grid.getRowCount()==0){
			return false;
		}
		return true;
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		var debitorFormFields = Tine.Billing.DebitorFormFields.get();
		this.contactSelector = Tine.Addressbook.Custom.getRecordPicker('Contact','billing_contact_id',{
			width: 300,
			name: 'contact_id',
			blurOnSelect: true,
		    allowBlank:false,
		    ddConfig:{
	        	ddGroup: 'ddGroupContact',
	        	ddGroupGetForeign: {
	        		group: 'ddGroupGetContact',
	        		method: 'getContact'
	        	}
	        }
		});
		
		var panel = {
	        xtype: 'panel',
	        border: false,
	        region:'center',
	        height: 150,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'billing_with_shipping_doc',
						name: 'with_shipping_doc',
						hideLabel:true,
						value:false,
					    boxLabel: 'mit Lieferschein',
					    width: 140
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'billing_print_at_once',
						name: 'print_at_once',
						hideLabel:true,
						value:false,
					    boxLabel: 'sofort drucken',
					    width: 140
					}
				],[
					Tine.Billing.Custom.getRecordPicker('PaymentMethod', 'billing_payment_method',
	        		{
	        		    fieldLabel: 'Zahlungsart',
	        		    id: 'billing_payment_method',
	        		    name:'payment_method',
	        		    width: 200
	        		}),{
	        		    fieldLabel: 'Zahlungsstatus',
	        		    disabledClass: 'x-item-disabled-view',
	        		    id:'billing_payment_state',
	        		    name:'payment_state',
	        		    width: 140,
	        		    xtype:'combo',
	        		   // disabled: true,
	        		    //hidden: true,			    
	        		    store:[['TOBEPAYED','unbezahlt'],['PAYED','bezahlt']],
	        		    value: 'TOBEPAYED',
	        			mode: 'local',
	        			displayField: 'name',
	        		    valueField: 'id',
	        		    triggerAction: 'all'
	        		}
				],[
					{
						xtype: 'textarea',
						disabledClass: 'x-item-disabled-view',
						id: 'billing_special_payment_condition',
						name: 'special_payment_condition',
						fieldLabel: 'Alternative Zahlungsbedingungen',
						width: 400,
					    height:40
					}
				],[
						{
						xtype: 'fieldset',title:'Kontakt',
						width: 400,
						items:[
							this.contactSelector
						]}
				 ],[
					{
					xtype: 'fieldset', checkBoxToggle:true,name:'Debitor',header:'Debitor',title:'Debitor',
					width: 400,
					items:[
					      Ext.apply(debitorFormFields.debitor_nr,{disabled:true}),
					      Ext.apply(debitorFormFields.price_group_id,{disabled:true})
					]
				}]
	        ]}]
	    };
		this.grid = new Tine.Billing.DirectOrderPositionGridPanel({
			region:'south',
			storeAtOnce: false,
			split:true,
			height:300
		});
		var wrapper = {
			xtype: 'panel',
			layout: 'border',
			frame: true,
			items: [
			   panel,
			   this.grid
			]
		
		};
		return wrapper;
	},
	getContactWidget: function(){
		if(!this.contactWidget){
			this.contactWidget = new Tine.Addressbook.ContactWidget({
					region: 'north',
					layout:'fit',
					height:40,
					contactEditDialog: this
			});
		}
		return this.contactWidget;
	}
});


//extended content panel constructor
Tine.Billing.QuickOrderEditDialogPanel = Ext.extend(Ext.Panel, {
	panelManager:null,
	windowNamePrefix: 'QuickOrderEditWindow_',
	appName: 'Billing',
	layout:'fit',
	bodyStyle:'padding:0px;padding-top:5px',
	forceLayout:true,
	initComponent: function(){
		Ext.apply(this.initialConfig, {
			region:'center'//,
			//title:'Kreditor'
		});
		var regularDialog = new Tine.Billing.QuickOrderEditDialog(this.initialConfig);
		regularDialog.doLayout();
		this.items = this.getItems(regularDialog);
		Tine.Billing.QuickOrderEditDialogPanel.superclass.initComponent.call(this);
	},
	getItems: function(regularDialog){
		var recordChoosers = [
			{
				xtype:'contactselectiongrid',
				title:'Kontakte',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Addressbook')
			},{
				xtype:'debitorselectiongrid',
				gridConfig: {
			        enableDragDrop: true,
			        ddGroup: 'ddGroupGetContact'
			    },
				title:'Kunden',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Billing')
			},{
  				xtype:'articleselectiongrid',
  				title:'Artikel',
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
				 width:540,
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
			       // display debitor widget north
			       regularDialog.getContactWidget(),
			       // tab panel containing debitor master data
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
Tine.Billing.QuickOrderEditDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1280,
        height: 768,
        name: Tine.Billing.QuickOrderEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.QuickOrderEditDialogPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};