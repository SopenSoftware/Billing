Ext.namespace('Tine.Billing');

Tine.Billing.VatEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @private
	 */
	windowNamePrefix: 'VatEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Vat,
	recordProxy: Tine.Billing.vatBackend,
	loadRecord: false,
	evalGrants: false,
	
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{xtype: 'hidden',id:'id',name:'id'},
				 	{xtype: 'hidden',id:'value',name:'value'},
					{
				 		xtype:'numberfield',
					    fieldLabel: 'MwSt-Satz %',
					    id:'name',
					    name:'name',
					    minValue:0,
					    maxValue:100,
					    allowNegative:false,
					    width: 150,
		    			allowBlank:false
					},{
			    		fieldLabel: 'Erlöskonto',
					    disabledClass: 'x-item-disabled-view',
					    id:'vat_credit_account',
					    name:'credit_account',
					    value:null,
					    width: 150
			    	}
				 ],[
				 	{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'billing_is_default',
						name: 'is_default',
						hideLabel:true,
					    boxLabel: 'als Voreinstellung verwenden',
					    width: 250
					}
				]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.VatEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 120,
        name: Tine.Billing.VatEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.VatEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};