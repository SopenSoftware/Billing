Ext.namespace('Tine.Billing');

Tine.Billing.BankEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pribanke
	 */
	windowNamePrefix: 'BankEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Bank,
	recordProxy: Tine.Billing.bankBackend,
	loadRecord: false,
	evalGrants: false,
	
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		
		var fields = Tine.Billing.BankFormFields.get();
		
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	fields.id, fields.code, fields.short_name
				 ],[
					fields.name
					  
				 ],[
				    fields.country_code, fields.postal_code, fields.location
				 ],[
				    fields.bic, fields.pan, fields.validate, fields.att
			    ],[
				    fields.record_number, fields.follow_code, fields.change_sign				    
				 ]
	        ]}]
	    };
	}
});

Ext.ns('Tine.Billing.BankFormFields');

Tine.Billing.BankFormFields.get = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		country_code: 
		{
        	width:120,
            xtype: 'widget-countrycombo',
            fieldLabel: app.i18n._('Land'),
            id:'adr_one_countryname',
            name: 'adr_one_countryname',
            disabled:true,
            value:'DE',
            hiddenValue: 'Deutschland'
        },
		code:
		{
			fieldLabel: app.i18n._('Bank-Code(BLZ)'),
		    name:'code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:200
		},
		att:
		{
			fieldLabel: app.i18n._('Merkmal'),
		    name:'att',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:100
		},
		name:
		{
			fieldLabel: app.i18n._('Bezeichnung'),
		    name:'name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:300
		},
		short_name:
		{
			fieldLabel: app.i18n._('Kurzname'),
		    name:'short_name',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:100
		},
		postal_code:
		{
			fieldLabel: app.i18n._('PLZ'),
		    name:'postal_code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		location:
		{
			fieldLabel: app.i18n._('Ort'),
		    name:'location',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:100
		},
		pan:
		{
			fieldLabel: app.i18n._('PAN'),
		    name:'pan',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		bic:
		{
			fieldLabel: app.i18n._('BIC'),
		    name:'bic',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		validate:
		{
			fieldLabel: app.i18n._('Prüfalgorithmus'),
		    name:'validate',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		record_number:
		{
			fieldLabel: app.i18n._('DS-Nr'),
		    name:'record_number',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		change_sign:
		{
			fieldLabel: app.i18n._('Änderungskennzeichen'),
		    name:'change_sign',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		},
		follow_code:
		{
			fieldLabel: app.i18n._('Folge-BLZ'),
		    name:'follow_code',
		    disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	    	disabled:true,
	 	    width:80
		}
	};
}

/**
 * Billing Edit Popup
 */
Tine.Billing.BankEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 300,
        name: Tine.Billing.BankEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BankEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};