Ext.namespace('Tine.Billing');

Tine.Billing.OpenItemEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priOpenIteme
	 */
	//windowNamePrefix: 'OpenItemEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.OpenItem,
	recordProxy: Tine.Billing.openItemBackend,
	loadRecord: false,
	evalGrants: false,
	frame:true,
	initComponent: function(){
		this.initDependentGrids();
		this.on('load',this.onLoadOpenItem, this);
		//this.tbarItems = [new Tine.widgets.activities.ActivitiesAddButton({})];
		Tine.Billing.OpenItemEditDialog.superclass.initComponent.call(this);
		
	},
    initButtons: function(){
    	Tine.Billing.OpenItemEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
	initDependentGrids: function(){
	},
	onLoadOpenItem: function(){
		var debitor = this.record.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
		Ext.getCmp('open_item_payment_id').setDebitorRecord(debitor);
		
	},

	getFormItems: function(){

		this.formItemsPanel = Tine.Billing.getOpenItemFormItems();
		return {
			xtype:'panel',
			header:false,
			region:'center',
			layout:'border',
			autoScroll:'true',
			items:[
				{
				    xtype: 'panel',
				    region: 'center',
				    border: false,
				    autoScroll:true,
				    height:360,
				    frame:true,
				    items: this.formItemsPanel
				}
				
		]};
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.OpenItemEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 400,
        name: Tine.Billing.OpenItemEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.OpenItemEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
Tine.Billing.getOpenItemFormItems = function(){
	var fields = Tine.Billing.OpenItemFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	//fields.id, fields.receipt_id
		   	 	fields.context,
		   	],[
		   	   fields.debitor_id,
		   	   fields.op_nr,
		   	   fields.receipt_id,
			   	fields.receipt_nr,
		   	 	fields.type
		   	],[
		   	 	fields.due_date,
		   	    fields.total_netto,
		   	    fields.total_brutto
		   	 ],[
		   	 	fields.open_sum,
		   	    fields.payed_sum, 
				fields.erp_context_id
	   		 ],[

	   		    fields.fibu_exp_date,
		   	 	fields.state,
		   	    fields.payment_method_id	
			 ],[
				fields.payment_id
		   	 ],[
		   	    fields.is_cancelled,fields.is_cancellation
		   	 ],[
		   	 	fields.usage	
	   		]]}
		]
	}];
};


Ext.ns('Tine.Billing.OpenItemFormFields');

Tine.Billing.OpenItemFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		context: 
			{
	    		xtype:'hidden',
			    id:'open_item_context',
			    name:'context',
			    width: 1
	    	},
		order_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Auftrag',
			    id:'open_item_order_id',
			    name:'order_id',
			    disabled: true,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Order,
			    allowBlank:false
			}),
		op_nr:
			{
		    	fieldLabel: 'OP-Nr', 
			    id:'open_op_nr',
			    name:'op_nr',
		    	disabledClass: 'x-item-disabled-view',
		    	disabled:true,
		    	blurOnSelect: true,
		 	    width:120
		 	},
		debitor_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Kunde',
			    id:'open_item_debitor_id',
			    name:'debitor_id',
			    disabled: true,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Debitor,
			    allowBlank:false
			}),
		receipt_id:
			{xtype:'hidden',id:'open_item_receipt_id',name:'receipt_id'},
		receipt_nr:
			{
				xtype:'textfield',
		    	fieldLabel: 'Beleg-Nr', 
			    id:'open_item_receipt_nr',
			    name:'receipt_nr',
		    	disabledClass: 'x-item-disabled-view',
		    	disabled:true,
		    	blurOnSelect: true,
		 	    width:120
		 	},
		receipt_date:
			{
			   	xtype: 'datefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Belegdatum', 
				id:'open_item_receipt_date',
				disabled:true,
				name:'receipt_date',
			    width: 150
			},
	 	type:
		 	{
			    fieldLabel: 'Umsatzart',
			    disabledClass: 'x-item-disabled-view',
			    id:'open_item_type',
			    name:'type',
			    width: 120,
			    xtype:'combo',
			    disabled: true,
			    store:[['CREDIT','Haben'],['DEBIT','Soll']],
			    value: 'DEBIT',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		due_date:
			{
			   	xtype: 'datefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Fälligkeitsdatum', 
				id:'open_item_due_date',
				name:'due_date',
			    width: 150
			},
		fibu_exp_date:
			{
			   	xtype: 'datefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Datum Export FIBU', 
				id:'open_item_fibu_exp_date',
				disabled:true,
				name:'fibu_exp_date',
			    width: 150
			},
		total_netto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Gesamt netto', 
			    id:'open_item_total_netto',
			    name:'total_netto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 total_brutto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Gesamt brutto', 
			    id:'open_item_total_brutto',
			    name:'total_brutto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 open_sum:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Betrag offen', 
			    id:'open_item_open_sum',
			    name:'open_sum',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 payed_sum:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Betrag bezahlt', 
			    id:'open_item_payed_sum',
			    name:'payed_sum',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 due_date:
			{
			   	xtype: 'datefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Datum DTA Export', 
				id:'open_item_banking_exp_date',
				name:'banking_exp_dat',
			    width: 150
			},
		 state:		    
		    {
			    fieldLabel: 'Status',
			    disabledClass: 'x-item-disabled-view',
			    id:'open_item_state',
			    name:'state',
			    width: 200,
			    xtype:'combo',
			    store:[['OPEN','offen'],['PARTLYOPEN','teilw.offen'],['DONE','erledigt/bezahlt']],
			    value: 'OPEN',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		payment_method_id:
				Tine.Billing.Custom.getRecordPicker('PaymentMethod', 'open_item_payment_method_id',
				{
				    fieldLabel: 'Zahlungsart',
				    name:'payment_method_id',
				    columnwidth: 100
				}),
		usage:
		{
			xtype: 'textarea',
			fieldLabel: 'Verwendungszweck',
			disabledClass: 'x-item-disabled-view',
			id:'open_item_usage',
			disabled:true,
			name:'usage',
			width: 320,
			height: 60
		},
		is_cancelled: {
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'open_item_is_cancelled',
			name: 'is_cancelled',
			hideLabel:true,
			disabled:false,
		    boxLabel: 'storniert',
		    width: 200
		},
	is_cancellation: {
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'open_item_is_cancellation',
			name: 'is_cancellation',
			hideLabel:true,
			disabled:false,
		    boxLabel: 'ist Storno',
		    width: 200
		},
	payment_id:
		Tine.Billing.Custom.getRecordPicker('Payment', 'open_item_payment_id',
		{
			fieldLabel: 'Zahlung',
			name:'payment_id',
			disabled:false,
			useDebitor:true,
			width: 350 ,
			displayFunc:'getTitle'
		}),
	
	erp_context_id: 
		{
			xtype: 'combo',
			id:'erp_context_id',
			name:'erp_context_id',
			fieldLabel: 'Kontext',
			store:[['ERP','ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']],
		    value: 'ERP',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all',
		    width:150
		}		
	}
};