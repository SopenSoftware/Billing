Ext.namespace('Tine.Billing');

Tine.Billing.AccountBookingTemplateEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priaccountBookingTemplatee
	 */
	windowNamePrefix: 'AccountBookingTemplateEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.AccountBookingTemplate,
	recordProxy: Tine.Billing.accountBookingTemplateBackend,
	loadRecord: false,
	evalGrants: false,
	bookingTemplateRecord: null,
	
	initComponent: function(){
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.AccountBookingTemplateEditDialog.superclass.initComponent.call(this);
	},
	onAfterRender: function(){
		if(this.bookingTemplateRecord){
			Ext.getCmp('account_booking_booking_template_id').setValue(this.bookingTemplateRecord);
		}
	},
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
				 	Tine.Billing.Custom.getRecordPicker('BookingTemplate', 'account_booking_booking_template_id',{
	        		    fieldLabel: 'Buchungsvorlage',
	        		    name:'booking_template_id',
	        		    disabled:true,
	        		    width: 400,
	        		    displayFunc:'getTitle'
	        		})
				 ],[
					Tine.Billing.Custom.getRecordPicker('AccountSystem', 'account_booking_account_system_id',
	        		{
	        		    fieldLabel: 'Konto',
	        		    name:'account_system_id',
	        		    disabled:false,
	        		    width: 200,
	        		    displayFunc:'getTitle'
	        		}),
	        		{
					    fieldLabel: 'Art',
					    disabledClass: 'x-item-disabled-view',
					    name:'type',
					    width: 200,
					    xtype:'combo',
					    store:[['DEBIT','Soll'],['CREDIT','Haben']],
					    value: 'DEBIT',
						mode: 'local',
						disabled:false,
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}
					
	        	],[	
	        		{
					    fieldLabel: 'Quelle Betrag',
					    disabledClass: 'x-item-disabled-view',
					    name:'type',
					    width: 400,
					    xtype:'combo',
					    store:
					    [
					     ['NETTO_TOTAL','Gesamt netto'],
					     ['BRUTTO_TOTAL','Gesamt brutto'],
					     ['NETTO_VAT_ZERO','Gesamt netto MwSt-Satz 0'],
					     ['NETTO_VAT_REDUCED','Gesamt netto MwSt-Satz reduziert'],
					     ['NETTO_VAT_FULL','Gesamt netto MwSt-Satz'],
					     ['NETTO_P1_TOTAL','Gesamt P1 netto'],
					     ['NETTO_P2_TOTAL','Gesamt P2 netto'],
					     ['BRUTTO_VAT_ZERO','Gesamt brutto MwSt-Satz 0'],
					     ['BRUTTO_VAT_REDUCED','Gesamt brutto MwSt-Satz reduziert'],
					     ['BRUTTO_VAT_FULL','Gesamt brutto MwSt-Satz'],
					     ['BRUTTO_P1_TOTAL','Gesamt P1 brutto'],
					     ['BRUTTO_P2_TOTAL','Gesamt P2 brutto'],
					     ['NETTO_EK_VAT_ZERO','EK: Gesamt netto MwSt-Satz 0'],
					     ['NETTO_EK_VAT_REDUCED','EK: Gesamt netto MwSt-Satz reduziert'],
					     ['NETTO_EK_VAT_FULL','EK: Gesamt netto MwSt-Satz'],
					     ['NETTO_EK_TOTAL','EK Gesamt netto'],
					     ['BRUTTO_EK_VAT_ZERO','EK: Gesamt brutto MwSt-Satz 0'],
					     ['BRUTTO_EK_VAT_REDUCED','EK: Gesamt brutto MwSt-Satz reduziert'],
					     ['BRUTTO_EK_VAT_FULL','EK: Gesamt brutto MwSt-Satz'],
					     ['BRUTTO_EK_TOTAL','EK Gesamt brutto']
					    ],
					    value: 'BRUTTO_TOTAL',
						mode: 'local',
						disabled:false,
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}
        		],[	
	        		{
					    fieldLabel: 'Split',
					    disabledClass: 'x-item-disabled-view',
					    name:'type',
					    width: 200,
					    xtype:'combo',
					    store:
					    [
					     	['SPLITOPOS','OP-Split'],
					     	['NOSPLIT','kein Split']
					    ],
					    value: 'NOSPLIT',
						mode: 'local',
						disabled:false,
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}
	        	],[	
	        		   
					{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'has_customer',
						name: 'has_customer',
						hideLabel:true,
					    boxLabel: 'Hat Kunde',
					    width: 150
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'has_supplier',
						name: 'has_supplier',
						hideLabel:true,
					    boxLabel: 'Hat Lieferant',
					    width: 150
					}
				]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.AccountBookingTemplateEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 420,
        name: Tine.Billing.AccountBookingTemplateEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.AccountBookingTemplateEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};