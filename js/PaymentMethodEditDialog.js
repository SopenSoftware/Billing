Ext.namespace('Tine.Billing');

Tine.Billing.PaymentMethodEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockLocatione
	 */
	windowNamePrefix: 'PaymentMethodEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.PaymentMethod,
	recordProxy: Tine.Billing.paymentMethodBackend,
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
				 	{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'is_default',
						name: 'is_default',
						hideLabel:true,
					    boxLabel: 'als Voreinstellung verwenden',
					    width: 140
					},{
						fieldLabel: 'Schlüssel',
					    id:'id',
					    name:'id',
					    value:null,
					    width: 250
					}
					],[	
					{
						fieldLabel: 'Sortierung',
					    id:'sort_order',
					    name:'sort_order',
					    value:null,
					    width: 120
					},{
						fieldLabel: 'Fällig in Tagen',
					    xtype:'numberfield',
					    allowDecimals:false,
					    allowNegative:false,
					    maxValue:365,
						id:'due_in_days',
					    name:'due_in_days',
					    value:0,
					    width: 120
					}
					],[	
					{
						fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    value:null,
					    width: 500
					}
				],[
					new Tine.Tinebase.widgets.form.RecordPickerComboBox({
					    fieldLabel: 'Druckvorlage Rechnung',
					    id: 'invoice_template_id',
					    name: 'invoice_template_id',
					    blurOnSelect: true,
					    allowBlank:true,
					    recordClass: Tine.DocManager.Model.Template,
					    width: 500
					}) 
				],[
					{
						xtype:'textarea',
					    fieldLabel: 'Zahlungs-Bed (bezahlt)',
					    id:'text1',
					    name:'text1',
					    value:null,
					    width: 500,
					    height:140
					}
				],[
					{
						xtype:'textarea',
					    fieldLabel: 'Zahlungs-Bed (unbezahlt)',
					    id:'text2',
					    name:'text2',
					    value:null,
					    width: 500,
					    height:140
					}
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.PaymentMethodEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 600,
        name: Tine.Billing.PaymentMethodEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.PaymentMethodEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};