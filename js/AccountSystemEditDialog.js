Ext.namespace('Tine.Billing');

Tine.Billing.AccountSystemEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priaccountSysteme
	 */
	windowNamePrefix: 'AccountSystemEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.AccountSystem,
	recordProxy: Tine.Billing.accountSystemBackend,
	loadRecord: false,
	evalGrants: false,
	initComponent: function(){
		this.initRecord();
		this.on('load',this.onLoadRecord, this);
		//this.on('afterrender',this.onAfterRender,this);
		this.initDependentGrids();
		Tine.Billing.AccountSystemEditDialog.superclass.initComponent.call(this);
	},
	initDependentGrids: function(){
		
		
		this.debitGrid = new Tine.Billing.AccountBookingCombiAccountGridPanel({
			gridConfig:{
				id:'booking-debit-grid',
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
		this.creditGrid = new Tine.Billing.AccountBookingCombiAccountGridPanel({
			gridConfig:{
				id:'booking-credit-grid',
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
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		var formPanel = {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        autoScroll:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{xtype: 'hidden',id:'id',name:'id'},
				 	{
				 		fieldLabel: 'Kontonummer',
					    id:'number',
					    name:'number',
					    width: 80,
		    			allowBlank:false
					},
					Tine.Billing.Custom.getRecordPicker('AccountClass', 'account_system_account_class',
	        		{
	        		    fieldLabel: 'Kontenklasse',
	        		    name:'account_class_id',
	        		    width: 200
	        		}),{
					    fieldLabel: 'Typ',
					    disabledClass: 'x-item-disabled-view',
					    id:'account_system_account_type',
					    name:'account_type',
					    width: 120,
					    xtype:'combo',
					    store:[['NOMINAL','Erfolgskonto'],['INVENTORY','Bestandskonto']],
					    value: 'NOMINAL',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					},{
					    fieldLabel: 'Typ',
					    disabledClass: 'x-item-disabled-view',
					    id:'account_system_type',
					    name:'type',
					    width: 120,
					    xtype:'combo',
					    store:[['ACTIVE','Aktivkonto'],['PASSIVE','Passivkonto']],
					    value: 'ACTIVE',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'is_bank_account',
						name: 'is_bank_account',
						hideLabel:true,
					    boxLabel: 'Bankkonto',
					    width: 150
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'is_default_bank_account',
						name: 'is_default_bank_account',
						hideLabel:true,
					    boxLabel: 'Standard Bankkto',
					    width: 150
					}
				],[
					{
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 500,
		    			allowBlank:false
					},{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Summe S', 
					    name:'sum_debit',
						disabledClass: 'x-item-disabled-view',
						disabled:true,
						blurOnSelect: true,
						width:180
					},{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Summe H', 
						name:'sum_credit',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						disabled:true,
						width:180
					}
				 ],[
					{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'EB-Wert S', 
						name:'begin_debit_saldo',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						width:180
					},{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'EB-Wert H', 
						name:'begin_credit_saldo',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						width:180
					},{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Saldo S', 
						name:'debit_saldo',
						disabledClass: 'x-item-disabled-view',
						disabled:true,
						blurOnSelect: true,
						width:180
					},{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Saldo H', 
						name:'credit_saldo',
						disabledClass: 'x-item-disabled-view',
						blurOnSelect: true,
						disabled:true,
						width:180
					}
				 ]
	        ]}]
		};
	   
			
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

			return {
					
				xtype:'panel',
				layout:'vbox',
				layoutConfig:{
					align:'stretch',
					pack:'start'
				},
				items:[
				       formPanel,
				       bookingPanel
				]
			};
		
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.AccountSystemEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 900,
        height: 650,
        name: Tine.Billing.AccountSystemEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.AccountSystemEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};