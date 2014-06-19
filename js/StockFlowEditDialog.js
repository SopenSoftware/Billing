Ext.namespace('Tine.Billing');

Tine.Billing.StockFlowEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockFlowe
	 */
	windowNamePrefix: 'StockFlowEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.StockFlow,
	recordProxy: Tine.Billing.stockFlowBackend,
	loadRecord: false,
	evalGrants: false,
	initComponent: function(){
		this.on('load',this.onLoadIt, this);
		Tine.Billing.StockFlowEditDialog.superclass.initComponent.call(this);
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	onLoadIt: function(){
		return true;
	},
	getFormItems: function() {
		// get fields
		var fields = Tine.Billing.StockFlowFormFields.get();
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	fields.id,
				 	fields.article_id,
				 	fields.stock_location_id
				 ],[
				    fields.direction,
				    fields.amount,
				    fields.price_netto
				 ],[
				    fields.booking_date,
				    fields.reason
				 ],[
				    fields.creditor_id,
				    fields.debitor_id
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.StockFlowEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 700,
        height: 220,
        name: Tine.Billing.StockFlowEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.StockFlowEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Ext.ns('Tine.Billing.StockFlowFormFields');

Tine.Billing.StockFlowFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id', width:1},
		article_id:
			Tine.Billing.Custom.getRecordPicker('Article', 'stock_flow_article_id',{
				name:'article_id',
		   		width:300,
		   		disabled:true
		   	}),
		debitor_id:
			Tine.Billing.Custom.getRecordPicker('Debitor', 'stock_flow_debitor_id',{
		   		width:300,
		   		name:'debitor_id',
		   		allowBlank:true
		   	}),
		creditor_id:
			Tine.Billing.Custom.getRecordPicker('Creditor', 'stock_flow_creditor_id',{
		   		width:300,
		   		name:'creditor_id',
		   		allowBlank:true
		   	}),
		stock_location_id:
			Tine.Billing.Custom.getRecordPicker('StockLocation', 'stock_flow_stock_location_id',{
		   		width:300,
		   		name:'stock_location_id',
		   		allowBlank:true
		   	}),
		direction: 
			{
			    fieldLabel: 'Zugang/Abgang',
			    disabledClass: 'x-item-disabled-view',
			    id:'stock_flow_direction',
			    name:'direction',
			    width:100,
			    xtype:'combo',
			    store:[['IN','Zugang'],['OUT','Abgang']],
			    mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		amount:
	    	{
	    		fieldLabel: 'Menge',
			    disabledClass: 'x-item-disabled-view',
			    id:'stock_flow_amount',
			    name:'amount',
			    value:null,
			    width: 150
	    	},
    	price_netto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Preis netto', 
			    id:'stock_flow_price_netto',
			    name:'price_netto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:180
		 	},
		booking_date:
			{
			   	xtype: 'datefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Buchungsdatum', 
				id:'stock_flow_booking_date',
				name:'booking_date',
			    width: 150
			},
		reason:
			{
				xtype: 'textfield',
				name: 'reason',
				width:200,
				fieldLabel:'Grund Bewegung'
			}
	};
};