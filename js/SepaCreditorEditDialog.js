Ext.namespace('Tine.Billing');

Tine.Billing.SepaCreditorEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pribanke
	 */
	windowNamePrefix: 'SepaCreditorEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.SepaCreditor,
	recordProxy: Tine.Billing.sepaCreditorBackend,
	loadRecord: false,
	evalGrants: false,
	
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var fields = Tine.Billing.SepaCreditorFormFields.get();
		
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	fields.id, fields.contact_id
				 ],[
					fields.bank_account_id
					  
				 ],[
				    fields.sepa_creditor_ident
				 ],[
				    fields.creditor_name				    
				 ]
	        ]}]
	    };
	}
});

Ext.ns('Tine.Billing.SepaCreditorFormFields');

Tine.Billing.SepaCreditorFormFields.get = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		contact_id:
				Tine.Addressbook.Custom.getRecordPicker('Contact','sepa_creditor_contact_id',{
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
				
		bank_account_id:
			Tine.Billing.Custom.getRecordPicker('BankAccount','sepa_creditor_bank_account_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'Bankkonto',
			    name:'bank_account_id',
			    disabled: false,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:false
			}),
		sepa_creditor_ident:
		{
			fieldLabel: app.i18n._('Gläubiger-ID'),
		    name:'sepa_creditor_ident',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		},
		creditor_name:
		{
			fieldLabel: app.i18n._('Bezeichnung Gläubiger'),
		    name:'creditor_name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		}
	};
}

/**
 * Billing Edit Popup
 */
Tine.Billing.SepaCreditorEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 300,
        name: Tine.Billing.SepaCreditorEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SepaCreditorEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};