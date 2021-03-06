Ext.namespace('Tine.Billing');

Tine.Billing.DebitorGroupEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pridebitorGroupe
	 */
	windowNamePrefix: 'DebitorGroupEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.DebitorGroup,
	recordProxy: Tine.Billing.debitorGroupBackend,
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
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 150,
		    			allowBlank:false
					}
				 ],[
					{
						xtype: 'textarea',
						fieldLabel: 'Bemerkung zur Kundengruppe',
						disabledClass: 'x-item-disabled-view',
						id:'comment',
						name:'comment',
						width: 450,
						height: 80
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
Tine.Billing.DebitorGroupEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 160,
        name: Tine.Billing.DebitorGroupEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.DebitorGroupEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};