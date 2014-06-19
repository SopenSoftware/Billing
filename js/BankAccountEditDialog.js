Ext.namespace('Tine.Billing');

Tine.Billing.BankAccountEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pribankAccounte
	 */
	windowNamePrefix: 'BankAccountEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.BankAccount,
	recordProxy: Tine.Billing.bankAccountBackend,
	loadRecord: false,
	evalGrants: false,
	
	initComponent: function(){
		this.initRecord();
		this.on('load',this.onLoadRecord, this);
		//this.on('afterrender',this.onAfterRender,this);
		//this.initDependentGrids();
		Tine.Billing.BankAccountEditDialog.superclass.initComponent.call(this);
	},
	onLoadRecord: function(){
		/*
		 
		 if(this.bankDataHelpers.getCount()==0){
    		this.bankDataHelpers.add(new Tine.Billing.BankDataHelper().initialize(
    				'membership_bank_code', 'membership_bank_name', 'membership_bank_account_nr' , 'membership_account_holder' 
    		));
    	}else{
    		this.bankDataHelpers.each(
				function(item){
					item.updateFromForm();
				},
				this
			);
    	}
    	
    	Ext.getCmp('membership_account_holder').addListener('focus', this.presetBankAccountName, this);
		 
		 */
		if(!this.record.isNew()){
			// enable attendance grid if record has id
			/*this.debitGrid.enable();
			this.debitGrid.loadForeignRecord(this.record);
			this.creditGrid.enable();
			this.creditGrid.loadForeignRecord(this.record);*/
		}
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var fields = Tine.Billing.BankAccountFormFields.get();
		
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	fields.id, fields.bank_id
				 ],[
					fields.contact_id
				 ],[
				    fields.name
				 ],[
				    fields.iban
				 ],[
				    fields.number
				 ],[
				    fields.bic, fields.bank_code
			    ],[
				    fields.bank_name				    
				 ]
	        ]}]
	    };
	}
});

Ext.ns('Tine.Billing.BankAccountFormFields');

Tine.Billing.BankAccountFormFields.get = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		contact_id:
			Tine.Addressbook.Custom.getRecordPicker('Contact','bank_account_contact_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'Kontakt',
			    name:'contact_id',
			    disabled: false,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:false,
			    ddConfig:{
		        	ddGroup: 'ddGroupContact'
		        }
			}),
			
		bank_id:
			Tine.Billing.Custom.getRecordPicker('Bank','bank_account_bank_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'Bank',
			    name:'bank_id',
			    disabled: false,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:false
			}),
		iban:
		{
			fieldLabel: app.i18n._('IBAN'),
		    name:'iban',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		},
		bic:
		{
			fieldLabel: app.i18n._('BIC'),
		    name:'bic',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		},		
		bank_code:
		{
			fieldLabel: app.i18n._('Bank-Code(BLZ)'),
		    name:'bank_code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		},
		bank_name:
		{
			fieldLabel: app.i18n._('Bank-Bezeichnung'),
		    name:'bank_name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:200
		},
		name:
		{
			fieldLabel: app.i18n._('Kontoinhaber'),
		    name:'name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:400
		},
		number:
		{
			fieldLabel: app.i18n._('Kontonummer'),
		    name:'number',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:400
		}
	};
}

/**
 * Billing Edit Popup
 */
Tine.Billing.BankAccountEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 450,
        height: 360,
        name: Tine.Billing.BankAccountEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BankAccountEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};