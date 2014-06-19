Ext.namespace('Tine.Billing');

Tine.Billing.SepaMandateEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pribanke
	 */
	windowNamePrefix: 'SepaMandateEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.SepaMandate,
	recordProxy: Tine.Billing.sepaMandateBackend,
	loadRecord: false,
	evalGrants: false,
	
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var fields = Tine.Billing.SepaMandateFormFields.get();
		
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	fields.id, fields.mandate_ident, fields.mandate_state
				 ],[
				    fields.sepa_creditor_id
				],[
				
					fields.bank_account_id
				],[
				   fields.account_name
				 ],[
					fields.iban
				 ],[
					fields.contact_id
					  
				 ],[
				    fields.signature_date, fields.last_usage_date
	        	 ],[
	        	    fields.is_valid, fields.is_single, fields.is_last
				 ],[
				    fields.bic, fields.bank_code
			    ],[
				    fields.bank_name
				],[
				   	fields.bank_country_code, fields.bank_postal_code, fields.bank_location
				],[
				   fields.comment
				 ]
	        ]}]
	    };
	}
});

Ext.ns('Tine.Billing.SepaMandateFormFields');

Tine.Billing.SepaMandateFormFields.get = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		mandate_ident:
		{
			fieldLabel: app.i18n._('SEPA-Mandat-ID'),
		    name:'mandate_ident',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:200
		},
		iban:
		{
			fieldLabel: app.i18n._('IBAN'),
		    name:'iban',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:false,
	 	    width:400
		},
		contact_id:
			Tine.Addressbook.Custom.getRecordPicker('Contact','sepa_mandate_contact_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'Kontakt',
			    name:'contact_id',
			    disabled: true,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:true,
			    ddConfig:{
		        	ddGroup: 'ddGroupContact'
		        }
			}),
			
		bank_account_id:
			Tine.Billing.Custom.getRecordPicker('BankAccount','sepa_mandate_bank_account_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'Bankkonto',
			    name:'bank_account_id',
			    disabled: false,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:false
			}),
		sepa_creditor_id:
			Tine.Billing.Custom.getRecordPicker('SepaCreditor','sepa_mandate_sepa_creditor_id',{
				disabledClass: 'x-item-disabled-view',
				width: 400,
				fieldLabel: 'SEPA-Kreditor',
			    name:'sepa_creditor_id',
			    disabled: false,
			    //displayField: 'full_company_ap',
			    blurOnSelect: true,
			    allowBlank:false
			}),
		signature_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Unterschrift', 
			id:'sepa_mandate_signature_date',
			name:'signature_date',
		    width: 150
		},
		last_usage_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'zuletzt benutzt', 
			id:'sepa_mandate_last_usage_date',
			name:'last_usage_date',
		    width: 150
		},
		is_single:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			name: 'is_single',
			hideLabel:true,
		    boxLabel: 'einmalig',
		    width: 130
		},
		is_last:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			name: 'is_last',
			hideLabel:true,
		    boxLabel: 'letztmalig',
		    width: 130
		},
		is_valid:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			name: 'is_valid',
			hideLabel:true,
		    boxLabel: 'gültig',
		    width: 130
		},
		bic:
		{
			fieldLabel: app.i18n._('BIC'),
		    name:'bic',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:200
		},
		bank_code:
		{
			fieldLabel: app.i18n._('BLZ'),
		    name:'bank_code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:200
		},
		bank_name:
		{
			fieldLabel: app.i18n._('Bankbezeichnung'),
		    name:'bank_name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:400
		},
		bank_country_code: 
		{
        	width:120,
            xtype: 'widget-countrycombo',
            fieldLabel: app.i18n._('Bank-Land'),
            id:'bank_country_code',
            name: 'bank_country_code',
            disabled:true,
            value:'DE',
            hiddenValue: 'Deutschland'
        },
        bank_postal_code:
		{
			fieldLabel: app.i18n._('Bank-PLZ'),
		    name:'bank_postal_code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		bank_location:
		{
			fieldLabel: app.i18n._('Bank-Ort'),
		    name:'bank_location',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:200
		},
		comment:
		{
			xtype: 'textarea',
			fieldLabel: 'Bemerkung',
			disabledClass: 'x-item-disabled-view',
			name:'comment',
			width: 400,
			height: 80
		},
		mandate_state:		    
	    {
		    fieldLabel: 'Status Bearbeitung',
		    disabledClass: 'x-item-disabled-view',
		    name:'mandate_state',
		    width: 200,
		    xtype:'combo',
		    store:[['GENERATED','zu bestätigen'], ['COMMUNICATION','in Bearbeitung'], ['CONFIRMED','bestätigt']],
		    value: 'GENERATED',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all'
		},
		account_name:
		{
			fieldLabel: app.i18n._('Kto.Inhaber'),
		    name:'account_name',
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
Tine.Billing.SepaMandateEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 460,
        height: 600,
        name: Tine.Billing.SepaMandateEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SepaMandateEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};