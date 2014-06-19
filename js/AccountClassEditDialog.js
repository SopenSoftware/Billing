Ext.namespace('Tine.Billing');

Tine.Billing.AccountClassEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priaccountClasse
	 */
	windowNamePrefix: 'AccountClassEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.AccountClass,
	recordProxy: Tine.Billing.accountClassBackend,
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
				 	{
				 		fieldLabel: 'Schlüssel',
					    id:'key',
					    name:'key',
					    width: 250,
		    			allowBlank:false
					},{
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 250,
		    			allowBlank:false
					}
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.AccountClassEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 160,
        name: Tine.Billing.AccountClassEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.AccountClassEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};