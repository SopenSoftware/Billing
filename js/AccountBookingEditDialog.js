Ext.namespace('Tine.Billing');

Tine.Billing.AccountBookingEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priaccountBookinge
	 */
	windowNamePrefix: 'AccountBookingEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.AccountBooking,
	recordProxy: Tine.Billing.accountBookingBackend,
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
				 	{xtype: 'hidden',name:'termination_date'},
				 	{xtype: 'hidden',name:'status'},
				 	
				 	{
						xtype: 'sopencurrencyfield',
						fieldLabel: 'Betrag', 
					    name:'value',
						disabledClass: 'x-item-disabled-view',
						//disabled:true,
						blurOnSelect: true,
						width:120
					},{
					    fieldLabel: 'Art',
					    disabledClass: 'x-item-disabled-view',
					    name:'type',
					    width: 200,
					    xtype:'combo',
					    store:[['DEBIT','Soll'],['CREDIT','Haben']],
					    value: 'DEBIT',
						mode: 'local',
						//disabled:true,
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					},{
						xtype: 'datefield',
						disabledClass: 'x-item-disabled-view',
						name: 'booking_date',
						value: new Date(),
						fieldLabel: 'Buchungsdatum',
						//disabled:true,
					    width: 150
					}
				 ],[
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'account_booking_account_system_id',
	        		{
	        		    fieldLabel: 'Konto',
	        		    name:'account_system_id',
	        		    //disabled:true,
	        		    width: 200,
	        		    displayFunc:'getTitle'
	        		}),
					Tine.Billing.Custom.getRecordPicker('Booking', 'account_booking_booking_id',
	        		{
	        		    fieldLabel: 'Buchung',
	        		    name:'booking_id',
	        		    disabled:true,
	        		    width: 200,
	        		    displayFunc:'getTitle'
	        		})
	        	],[	
	        		new Tine.Tinebase.widgets.form.RecordPickerComboBox({
						disabledClass: 'x-item-disabled-view',
						width: 250,
						fieldLabel: 'Kunde',
					    id:'account_booking_debitor_id',
					    name:'debitor_id',
					    //disabled: true,
					    blurOnSelect: true,
					    recordClass: Tine.Billing.Model.Debitor,
					    allowBlank:true
					})
				 ]
				
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.AccountBookingEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 160,
        name: Tine.Billing.AccountBookingEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.AccountBookingEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};