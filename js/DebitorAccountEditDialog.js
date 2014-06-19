Ext.namespace('Tine.Billing');

Tine.Billing.DebitorAccountEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pridebitorAccounte
	 */
	windowNamePrefix: 'DebitorAccountEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.DebitorAccount,
	recordProxy: Tine.Billing.debitorAccountBackend,
	loadRecord: false,
	evalGrants: false,
	cycles:0,

	initComponent: function(){
		this.initRecord();
		this.on('load',this.onLoadRecord, this);
		//this.on('afterrender',this.onAfterRender,this);
		this.initDependentGrids();
		Tine.Billing.DebitorAccountEditDialog.superclass.initComponent.call(this);
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
		this.action_doDebitorAccount = new Ext.Action({
            text: 'OK',
            handler: this.doDebitorAccount,
            disabled: false,
            scope: this
        });
		this.supr().initActions.call(this);
	},
	initDependentGrids: function(){
		
		
		this.debitGrid = new Tine.Billing.AccountDebitorAccountCombiGridPanel({
			gridConfig:{
				id:'debitorAccount-debit-grid',
			},
			bodyStyle:'margin:4px;',
			id:'debitorAccount-debit-grid-panel',
			debitorAccountType:'DEBIT',
			title:'Soll',
			//layout:'fit',
			flex:1,
			border:false,
			//disabled:true,
			//frame: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.creditGrid = new Tine.Billing.AccountDebitorAccountCombiGridPanel({
			gridConfig:{
				id:'debitorAccount-credit-grid',
			},
			bodyStyle:'margin:4px;',
			id:'debitorAccount-credit-grid-panel',
			debitorAccountType:'CREDIT',
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
	clearFocusedField: function(){
		
	},
	
	clearFields: function(){
		  Ext.getCmp('debitorAccount_debit_account_id').setValue(null);
		  Ext.getCmp('debitorAccount_debit_amount').setValue(0);
		  Ext.getCmp('debitorAccount_debit_account_id2').setValue(null);
		  Ext.getCmp('debitorAccount_debit_amount2').setValue(0);
	
		  Ext.getCmp('debitorAccount_credit_account_id').setValue(null);
		  Ext.getCmp('debitorAccount_credit_amount').setValue(0);
		  Ext.getCmp('debitorAccount_credit_account_id2').setValue(null);
		  Ext.getCmp('debitorAccount_credit_amount2').setValue(0);
	},
	doDebitorAccount: function(){
		
		if(this.record.isNew()){
			if(this.cycles<5){
				if(this.cycles==0){
					this.onApplyChanges();
				}
				this.cycles++;
				
				this.doDebitorAccount.defer(500,this);
			}else{
				this.cycles = 0;
			}
			return;
		}
		
		var data = {
			debits: 
			[
			  {kto: Ext.getCmp('debitorAccount_debit_account_id').getValue(),value:Ext.getCmp('debitorAccount_debit_amount').getValue()},
			  {kto: Ext.getCmp('debitorAccount_debit_account_id2').getValue(),value:Ext.getCmp('debitorAccount_debit_amount2').getValue()}
			],
			credits: 
			[
			  {kto: Ext.getCmp('debitorAccount_credit_account_id').getValue(),value:Ext.getCmp('debitorAccount_credit_amount').getValue()},
			  {kto: Ext.getCmp('debitorAccount_credit_account_id2').getValue(),value:Ext.getCmp('debitorAccount_credit_amount2').getValue()}
			]
		
		};
		Ext.Ajax.request({
            scope: this,
            params: {
                method: 'Billing.multiCreateAccountDebitorAccounts',
    	        debitorAccountId: this.record.get('id'),
    	        data: data
            },
            success: function(response){
            	var result = Ext.util.JSON.decode(response.responseText);
            	if(result.success){
            		this.creditGrid.reload();
            		this.debitGrid.reload();
            		
            		//this.loadMask.hide();
            		//this.onGetDebitorAddPayment(new Tine.Billing.Model.Debitor(result.result, result.result.id));
            	}else{
	        		Ext.Msg.alert(
            			'Hinweis', 
                        'Buchung konnte nicht gespeichert werden'
                    );
            	}
        	},
        	failure: function(response){
        		var result = Ext.util.JSON.decode(response.responseText);
        		Ext.Msg.alert(
        				'Hinweis', 
                        'Buchung konnte nicht gespeichert werden'
                );
        	}
        })
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var debitorAccountPanel = {
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

		var addPanel = {
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
					   Ext.apply(new Ext.Button(this.action_doDebitorAccount), {
			  				 scale: 'small',
			  	             rowspan: 2,
			  	           iconCls: 'action_save',
			  	             iconAlign: 'left'
			  	        })
					   
					   
					],
				bodyStyle:'margin:3px;',
				items:[{xtype:'columnform',border:false,items:
				[[
				 
				 Tine.Billing.Custom.getRecordPicker('AccountSystem', 'debitorAccount_debit_account_id',
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
					    id:'debitorAccount_debit_amount',
					    name:'debit_amount',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					},
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'debitorAccount_credit_account_id',
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
					    id:'debitorAccount_credit_amount',
					    name:'credit_amount',
					    allowBlank:true,
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
					    width:120
					}
					
				],[
					   
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'debitorAccount_debit_account_id2',
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
					    id:'debitorAccount_debit_amount2',
					    name:'debit_amount2',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					},
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'debitorAccount_credit_account_id2',
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
					    id:'debitorAccount_credit_amount2',
					    name:'credit_amount2',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						allowBlank:true,
					    width:120
					}
				
				   
				]]}]
		
				
		};
		
		var formPanel = {
	        xtype: 'panel',
	        border: false,
	        layout:'fit',
	        height:160,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{xtype: 'hidden',id:'id',name:'id'},
				 	{xtype: 'hidden',id:'receipt_id',name:'receipt_id'},
				 	new Tine.Tinebase.widgets.form.RecordPickerComboBox({
						disabledClass: 'x-item-disabled-view',
						width: 300,
						fieldLabel: 'Kunde',
					    id:'account_booking_debitor_id',
					    name:'debitor_id',
					    disabled: true,
					    blurOnSelect: true,
					    recordClass: Tine.Billing.Model.Debitor,
					    allowBlank:true
					})
				 ],[
				 	{
						xtype: 'datefield',
						disabledClass: 'x-item-disabled-view',
						id: 'create_date',
						name: 'create_date',
						value: new Date(),
						fieldLabel: 'Buchungsdatum',
					    width: 150
					},{
						xtype: 'datefield',
						disabledClass: 'x-item-disabled-view',
						id: 'value_date',
						name: 'value_date',
						value: new Date(),
						fieldLabel: 'Wertstellung',
					    width: 150
					}
				],[
					{
						xtype: 'combo',
						id:'erp_context_id',
						name:'erp_context_id',
						fieldLabel: 'Kontext',
						store:[['PAYMENT','Zahlung'],['DISAGIO','Abschlag'],['DEBIT','Belastung'],['CREDIT','Gutschrift']],
					    value: 'PAYMENT',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all',
					    width:150
					}
					
				 ],[
						{
							fieldLabel: 'Belegnummer',
						    id:'debitorAccount_receipt_nr',
						    name:'debitorAccount_receipt_nr',
						    width: 250
						},{
							xtype: 'datefield',
							disabledClass: 'x-item-disabled-view',
							id: 'debitorAccount_receipt_date',
							name: 'debitorAccount_receipt_date',
							value: new Date(),
							fieldLabel: 'Belegdatum',
						    width: 150
						}
				 ],[
						{
							xtype:'textarea',
							fieldLabel: 'Buchungstext',
						    id:'debitorAccount_text',
						    name:'debitorAccount_text',
						    width: 550,
						    height:40,
						    allowBlank:true
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
			       addPanel,
			       debitorAccountPanel
			]
		};
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.DebitorAccountEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 650,
        name: Tine.Billing.DebitorAccountEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.DebitorAccountEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};