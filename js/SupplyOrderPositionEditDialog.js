Ext.namespace('Tine.Billing');

Tine.Billing.SupplyOrderPositionEditHandler = function(config){
	config = config || {};
    Ext.apply(this, config);

    Tine.Billing.SupplyOrderPositionEditHandler.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.SupplyOrderPositionEditHandler, Ext.util.Observable, {
	
	initialize: function(){
		this.addEvents(
			'beforecalculate',
			'calculate'
		);
		
		Ext.getCmp('receipt_position_amount').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_discount_percentage').addListener('select', this.calculate, this);
		Ext.getCmp('receipt_position_discount_percentage').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_weight').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_vat_id').addListener('select', this.calculate, this);
		Ext.getCmp('receipt_position_price_netto').addListener('change', this.calculate, this);
	},
	calculate: function(){
		if(this.fireEvent('beforecalculate',this)){
			this.fireEvent('calculate');
		}
	}
});

Tine.Billing.SupplyOrderPositionEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockLocatione
	 */
	windowNamePrefix: 'SupplyOrderPositionEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.SupplyOrderPosition,
	recordProxy: Tine.Billing.supplyorderPositionBackend,
	loadRecord: false,
	evalGrants: false,
	initComponent: function(){
		Tine.Billing.SupplyOrderPositionEditDialog.superclass.initComponent.call(this);
		this.on('afterrender',this.onAfterRender,this);
	},
	onAfterRender: function(){
		this.editHandler = new Tine.Billing.SupplyOrderPositionEditHandler({});
		this.editHandler.initialize();
		this.editHandler.on('beforecalculate', this.onBeforeCalculate, this);
		this.editHandler.on('calculate', this.onCalculate, this);
	},
	onBeforeCalculate: function(){
		this.onRecordUpdate();
		this.record.calculate();
		return true;
	},
	onCalculate: function(){
		this.onRecordLoad();
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		return Tine.Billing.getSupplyOrderPositionFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.SupplyOrderPositionEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 480,
        name: Tine.Billing.SupplyOrderPositionEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyOrderPositionEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getSupplyOrderPositionFormItems = function(){
	var fields = Tine.Billing.SupplyOrderPositionFormFields.get();
	return {
        xtype: 'panel',
        border: false,
        frame:true,
        items:[{xtype:'columnform',items:[
			[
			   fields.id, fields.supply_receipt_id
			],[
			   fields.optional
			],[
			   fields.position_nr,
			   fields.article_id,
			   fields.price_netto
			],[
			   fields.name,
			   fields.vat_id
			],[
			   fields.unit_id,
			   fields.amount,
			   fields.weight
		    ],[
			   fields.description	   
			],[
			   fields.discount_percentage,
			   fields.discount_total
			],[
			   fields.total_netto,
			   fields.total_brutto,
			   fields.total_weight
			]
        ]}]
    };
};

Ext.ns('Tine.Billing.SupplyOrderPositionFormFields');

Tine.Billing.SupplyOrderPositionFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		supply_receipt_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 1,
				fieldLabel: 'Beleg',
			    id:'receipt_position_supply_receipt_id',
			    name:'supply_receipt_id',
			    disabled: true,
			    hidden:true,
			    onAddEditable: false,	// only has effect in class:DependentEditForm
			    onEditEditable: false,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Receipt
			}),
		position_nr:
    	{
    		fieldLabel: 'Pos-Nr',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_position_nr',
		    name:'position_nr',
		    value:null,
		    width: 40
    	},			
		article_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Artikel',
			    id:'receipt_position_article_id',
			    name:'article_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Article,
			    allowBlank:false
			}),
		vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt',
			    id:'receipt_position_vat_id',
			    name:'vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:false
			}),			
		unit_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Einheit',
			    id:'receipt_position_unit_id',
			    name:'unit_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleUnit,
			    allowBlank:false
			}),				
	 	discount_percentage:
		{
	 		xtype: 'extuxpercentcombo',
	    	fieldLabel: 'Rabatt auf Gesamtsumme %', 
		    id:'receipt_position_discount_percentage',
		    name:'discount_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	discount_total:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Rabatt auf Gesamtsumme', 
		    id:'receipt_position_discount_total',
		    name:'discount_total',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		weight:
    	{
			xtype:'numberfield',
			decimalPrecision: 4,
			decimalSeparator:',',
    		fieldLabel: 'Gewicht (kg)',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_weight',
		    name:'weight',
		    value:null,
		    width: 150
    	},
		amount:
    	{
    		fieldLabel: 'Menge',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_amount',
		    name:'amount',
		    value:null,
		    width: 150
    	},
    	price_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Preis netto', 
		    id:'receipt_position_price_netto',
		    name:'price_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		name:
    	{
    		fieldLabel: 'Bezeichnung',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_name',
		    name:'name',
		    value:null,
		    width: 320
    	},
    	description:
		{
			xtype: 'textarea',
			fieldLabel: 'Beschreibung',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_position_description',
			name:'description',
			width: 320,
			height: 60
		}, 
		total_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt netto', 
		    id:'receipt_position_total_netto',
		    name:'total_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt brutto', 
		    id:'receipt_position_total_brutto',
		    name:'total_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		total_weight:
    	{
			xtype:'numberfield',
			decimalPrecision: 4,
			decimalSeparator:',',
    		fieldLabel: 'Gesamtgewicht (kg)',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_total_weight',
		    name:'total_weight',
		    value:null,
		    width: 150
    	},
	   	optional:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'receipt_position_optional',
			name: 'optional',
			hideLabel:true,
		    boxLabel: 'ist optionale Position',
		    width: 150
		}	
	};
};