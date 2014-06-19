Ext.namespace('Tine.Billing');

Tine.Billing.StockLocationEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockLocatione
	 */
	windowNamePrefix: 'StockLocationEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.StockLocation,
	recordProxy: Tine.Billing.stockLocationBackend,
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
				 	{xtype: 'hidden',id:'data',name:'data'},
					{
				 		fieldLabel: 'Lagerort',
					    id:'location',
					    name:'location',
					    width: 250,
		    			allowBlank:false
					},{
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
Tine.Billing.StockLocationEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 160,
        name: Tine.Billing.StockLocationEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.StockLocationEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};