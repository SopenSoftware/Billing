Ext.namespace('Tine.Billing');

Tine.Billing.BookingTemplateEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pribookinge
	 */
	windowNamePrefix: 'BookingTemplateEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.BookingTemplate,
	recordProxy: Tine.Billing.bookingTemplateBackend,
	loadRecord: false,
	evalGrants: false,
	cycles:0,
	
	initComponent: function(){
		this.initRecord();
		this.action_addABTemplate = new Ext.Action({
            text: 'Vorlage Einzelbuchung hinzufügen',
            handler: this.addABTemplate,
            disabled: false,
            scope: this
        });
		var tbItems = [this.action_addABTemplate];
		this.tbarItems = tbItems;
		this.on('load',this.onLoadRecord, this);
		//this.on('afterrender',this.onAfterRender,this);
		this.initDependentGrids();
		Tine.Billing.BookingTemplateEditDialog.superclass.initComponent.call(this);
	},
	
	initActions: function(){
		
		
		this.action_clearFocusedField = new Ext.Action({
            text: 'Aktuelles Feld leeren',
            handler: this.clearFocusedField,
            disabled: false,
            scope: this
        });
		this.action_clearFields = new Ext.Action({
            text: 'Felder leeren',
            handler: this.clearFields,
            disabled: false,
            scope: this
        });
		this.action_doBookingTemplate = new Ext.Action({
            text: 'OK',
            handler: this.doBookingTemplate,
            disabled: false,
            scope: this
        });
		this.supr().initActions.call(this);
	},
	initDependentGrids: function(){
		
		
		this.debitGrid = new Tine.Billing.AccountBookingTemplateCombiGridPanel({
			gridConfig:{
				id:'booking-template-debit-grid',
			},
			bodyStyle:'margin:4px;',
			id:'booking-debit-grid-panel',
			bookingType:'DEBIT',
			title:'Soll',
			//layout:'fit',
			flex:1,
			border:false,
			//disabled:true,
			//frame: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.creditGrid = new Tine.Billing.AccountBookingTemplateCombiGridPanel({
			gridConfig:{
				id:'booking-template-credit-grid',
			},
			bodyStyle:'margin:4px;',
			id:'booking-credit-grid-panel',
			bookingType:'CREDIT',
			title:'Haben',
			//layout:'border',
			flex:1,
			//disabled:true,
			border:false,
		//	frame: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
	},
	onLoadRecord: function(){
		if(!this.record.isNew()){
			// enable attendance grid if record has id
			this.debitGrid.enable();
			this.debitGrid.loadForeignRecord(this.record);
			this.creditGrid.enable();
			this.creditGrid.loadForeignRecord(this.record);
		}
	},
	addABTemplate: function(){
		Tine.Billing.AccountBookingTemplateEditDialog.openWindow({
			bookingTemplateRecord: this.record,
			listeners: {
				scope: this,
		        'update': function(record) {
		            this.refreshGrids();
		        }
			}
		});
	},
	refreshGrids: function(){
		this.debitGrid.refresh();
		this.creditGrid.refresh();
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var bookingPanel = {
	        xtype: 'panel',
	        layoutConfig : {
	            align: 'stretch'
	        },
	        flex:1,
	        layout: 'hbox',
	        height:280,
	        border:false,
	        frame:true,
			items:[
	               this.debitGrid,
	               this.creditGrid
	        ]
		};

		/*var addPanel = {
				xtype:'panel',
				title: 'Buchen',
				layout:'fit',
				border:false,
				height:160,
				fbar: [
					   Ext.apply(new Ext.Button(this.action_clearFocusedField), {
			  				 scale: 'small',
			  	             rowspan: 2,
			  	           //iconCls: 'action_save',
			  	             iconAlign: 'left'
			  	        }),
					   Ext.apply(new Ext.Button(this.action_clearFields), {
			  				 scale: 'small',
			  	             rowspan: 2,
			  	             iconCls: 'action_cancel',
			  	             iconAlign: 'left'
			  	        }),
					   Ext.apply(new Ext.Button(this.action_doBookingTemplate), {
			  				 scale: 'small',
			  	             rowspan: 2,
			  	           iconCls: 'action_save',
			  	             iconAlign: 'left'
			  	        })
					   
					   
					],
				bodyStyle:'margin:3px;',
				items:[{xtype:'columnform',border:false,items:
				[[
				 
				 Tine.Billing.Custom.getRecordPicker('AccountSystem', 'booking_debit_account_id',
					{
					    fieldLabel: 'Konto Soll',
					    name:'debit_account_id',
					    width: 240,
					    allowBlank:true,
					    displayFunc:'getTitle'
					}),
					{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Betrag', 
					    id:'booking_debit_amount',
					    name:'debit_amount',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					},
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'booking_credit_account_id',
					{
					    fieldLabel: 'Konto Haben',
					    name:'credit_account_id',
					    width: 240,
					    allowBlank:true,
					    displayFunc:'getTitle'
					}),
					{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Betrag', 
					    id:'booking_credit_amount',
					    name:'credit_amount',
					    allowBlank:true,
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
					    width:120
					}
					
				],[
					   
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'booking_debit_account_id2',
					{
					    fieldLabel: 'Konto Soll',
					    name:'debit_account_id2',
					    width: 240,
					    allowBlank:true,
					    displayFunc:'getTitle'
					}),
					{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Betrag', 
					    id:'booking_debit_amount2',
					    name:'debit_amount2',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					},
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'booking_credit_account_id2',
					{
					    fieldLabel: 'Konto Haben',
					    name:'credit_account_id2',
					    width: 240,
					    allowBlank:true,
					    displayFunc:'getTitle'
					}),
					{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Betrag', 
					    id:'booking_credit_amount2',
					    name:'credit_amount2',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					}
				
				   
				]]}]
		
				
		};*/
		
		var formPanel = {
	        xtype: 'panel',
	        border: false,
	        layout:'fit',
	        height:160,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{xtype: 'hidden',id:'id',name:'id'},
				 	{xtype: 'hidden',id:'erp_context_id',value:'ERP', name:'id'},
				 	{
				 		fieldLabel: 'Nummer',
					    id:'booking_template_nr',
					    name:'booking_template_nr',
					    width: 250,
					    disabled:true,
		    			allowBlank:false
					},{
				 		fieldLabel: 'Schlüssel',
					    id:'key',
					    name:'key',
					    width: 250,
					    //disabled:true,
		    			allowBlank:false
					}
				 ],[
						{
							fieldLabel: 'Bezeichnung',
						    id:'name',
						    name:'name',
						    width: 500
						}
				 ],[
					{
						xtype: 'combo',
						id:'event_name',
						name:'event_name',
						fieldLabel: 'Event',
						store:
						[
						 	['NOEVENT','keine Eventreaktion'],
						 	['ERP_BILL_INVOICE','ERP Rechnung fakturieren'],
						 	['MEMBER_BILL_INVOICE','Mitglieder-Rechnung fakturieren'],
						 	['DONATOR_BILL_INVOICE','Spende fakturieren'],
						 	
						 	['ERP_PAY_INVOICE','ERP Rechnung fakturieren'],
						 	['MEMBER_PAY_INVOICE','Mitglieder-Rechnung fakturieren'],
						 	['DONATOR_PAY_INVOICE','Spende fakturieren']
						 ],
					    value: 'NOEVENT',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all',
					    width:250
					},{
							fieldLabel: 'Buchungstyp',
							xtype: 'combo',
							id:'booking_type',
							name:'booking_type',
							store:
							[
							 	['UNSPECIFIED','unspezifiziert'],
							 	['PAYOUTSTANDING','Bezahlung Kundenrechnung'],
							 	['PAYCOMMITMENT','Bezahlung Lieferantenrechnung'],
							 	['BILLOUTSTANDING','Faktura Kundenrechnung'],
							 	['BILLCOMMITMENT','Faktura Lieferantenrechnung']
							 ],
						    value: 'UNSPECIFIED',
							mode: 'local',
							displayField: 'name',
						    valueField: 'id',
						    triggerAction: 'all',
						    width:250
						}
				 ],[
						{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'has_vat',
						name: 'has_vat',
						hideLabel:true,
					    boxLabel: 'Mit USt/Vorsteuer',
					    width: 200
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'is_auto_possible',
						name: 'is_auto_possible',
						hideLabel:true,
					    boxLabel: 'auto. Verbuchung möglich',
					    width: 300
					}
				 ]
	        ]}]
	    };
		
		return {
				
			xtype:'panel',
			layout:'vbox',
			layoutConfig:{
				align:'stretch',
				pack:'start'
			},
			items:[
			       formPanel,
			      // addPanel,
			       bookingPanel
			]
		};
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.BookingTemplateEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 650,
        name: Tine.Billing.BookingTemplateEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BookingTemplateEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};