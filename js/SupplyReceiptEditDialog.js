Ext.namespace('Tine.Billing');

Tine.Billing.SupplyReceiptEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	receiptType: null,
	//windowNamePrefix: 'SupplyReceiptEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.SupplyReceipt,
	recordProxy: Tine.Billing.supplyReceiptBackend,
	/**
	 * @var supplyOrder {Tine.Billing.Model.SupplyOrder}
	 */
	supplyOrder: null,
	loadRecord: false,
	evalGrants: false,
	frame:true,
	initComponent: function(){
        var printSupplyReceiptButton = new Ext.Action({
            id: 'exportButton',
            text: Tine.Tinebase.appMgr.get('Billing').i18n._('Beleg drucken'),
            handler: this.printSupplyReceipt,
            iconCls: 'action_exportAsPdf',
            disabled: false,
            scope: this
        });
        this.tbarItems = [printSupplyReceiptButton, new Tine.widgets.activities.ActivitiesAddButton({})];
		this.on('load',this.onLoadSupplyReceipt, this);
		Tine.Billing.SupplyReceiptEditDialog.superclass.initComponent.call(this);
	},
    initButtons: function(){
    	Tine.Billing.SupplyReceiptEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
    printSupplyReceipt: function(){
		window.open(
				Sopen.Config.runtime.requestURI + '?method=Billing.printSupplyReceipt&id='+this.record.id,
				"confirmationsPDF",
				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		);
    },
	getFormItems: function(specificSupplyReceiptFormItems){
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.SupplyReceipt,
            disabled: (Tine.Billing.registry.get('customfields').length === 0),
            quickHack: {record: this.record}
        });
		
		var positionPanelDisabled = true;
		if(!this.record || this.record.id!=0){
			positionPanelDisabled = false;
		}
		this.OrderPositionPanel = new Tine.Billing.SupplyOrderPositionGridPanel({
				title:'Positionen',
				app: this.app,
				autoHeight:true,
				region:'center',
				layout:'fit',
				supplyReceiptRecord: this.record,
				disabled:positionPanelDisabled
		});
		this.articleSelectionGrid = new Tine.Billing.ArticleSelectionGridPanel({
			title:'Artikel',
			layout:'fit',
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.previewPanel = new Ext.ux.ImagePanel({
			layout:'fit'
		});
		var OrderPositionsPanels = [this.OrderPositionPanel];
		
		return[
		       {
		    	   xtype:'tabpanel',
		    	   layoutOnTabChange:true,
		    	   activeTab:0,
		    	   items:[{
		   			xtype:'panel',
					header:false,
					title:'Daten',
					region:'center',
					layout:'border',
					border:false,
					items:[{
						    xtype: 'panel',
						    region:'north',
						    border: false,
						    autoScroll:true,
						    height:210,
						    frame:true,
							split:true,
							collapsible:true,
						    items: specificSupplyReceiptFormItems
						},{
							xtype:'panel',
							header:false,
							region:'center',
							layout:'border',
							border:false,
							items:[{
								xtype:'panel',
								id:'OrderPositionConainer',
								region:'center',
								header:false,
								layout:'border',
								//defaults:{flex:1},
								split:true,
								items: OrderPositionsPanels
							},{
								xtype:'panel',
								region:'south',
								header:false,
								height: 200,
								layout:'fit',
								collapsible:true,
								collapseMode:'mini',
								split:true,
								items:[
								   this.articleSelectionGrid
								]
							}]
						},{
			                   // activities and tags
			                   region: 'east',
			                   layout: 'accordion',
			                   animate: true,
			                   width: 210,
			                   split: true,
			                   collapsible: true,
			                   collapseMode: 'mini',
			                   header: false,
			                   margins: '0 5 0 5',
			                   border: true,
			                   items: [
			                       new Ext.Panel({
			                           // @todo generalise!
			                           title: this.app.i18n._('Description'),
			                           iconCls: 'descriptionIcon',
			                           layout: 'form',
			                           labelAlign: 'top',
			                           border: false,
			                           items: [{
			                               style: 'margin-top: -4px; border 0px;',
			                               labelSeparator: '',
			                               xtype:'textarea',
			                               name: 'note',
			                               hideLabel: true,
			                               grow: false,
			                               preventScrollbars:false,
			                               anchor:'100% 100%',
			                               emptyText: this.app.i18n._('Enter description'),
			                               requiredGrant: 'editGrant'                           
			                           }]
			                       }),
			                       new Tine.widgets.activities.ActivitiesPanel({
			                           app: 'Billing',
			                           showAddNoteForm: false,
			                           border: false,
			                           bodyStyle: 'border:1px solid #B5B8C8;'
			                       }),
			                       new Tine.widgets.tags.TagPanel({
			                           app: 'Billing',
			                           border: false,
			                           bodyStyle: 'border:1px solid #B5B8C8;'
			                       })
			                   ]
			               }]
					},
					this.activitiesPanel,
				 	this.customFieldsPanel,
					{
							xtype:'panel',
							id:'receiptPreview',
							title: 'Vorschau',
							layout:'fit',
                            border: false,
                			autoScroll:true,
                            items:[
                      	           	this.previewPanel
                      	    ]
		    	    }
		    	   ]
		       }
		  ];
	},
	onLoadSupplyReceipt: function(){
		if(this.record.id == 0){
			this.record.data.supply_order_id = new Tine.Billing.Model.SupplyOrder(this.supplyOrder.data, this.supplyOrder.id);
			this.record.data.type = this.receiptType;
		}
		if(this.record.id!=0){
			this.OrderPositionPanel.enable();
			this.previewPanel.setURL(Sopen.Config.runtime.requestURI + '?method=Billing.getSupplyReceiptPreview&id='+this.record.id);
		}
		return true;
	}
});

Tine.Billing.SupplyQueryEditDialog = Ext.extend(Tine.Billing.SupplyReceiptEditDialog, {
	receiptType: 'SPQUERY',
	windowNamePrefix: 'SupplyQueryEditWindow_',
	title: 'Anfrage',
	getFormItems: function(){
		return Tine.Billing.SupplyQueryEditDialog.superclass.getFormItems.call(this,Tine.Billing.getSupplyQueryFormItems());
	}
});

Tine.Billing.SupplyOrderOrderEditDialog = Ext.extend(Tine.Billing.SupplyReceiptEditDialog, {
	receiptType: 'SPORDER',
	windowNamePrefix: 'SupplyOrderOrderEditWindow_',
	title:'Bestellung',
	getFormItems: function(){
		return Tine.Billing.SupplyOrderOrderEditDialog.superclass.getFormItems.call(this,Tine.Billing.getSupplyOrderOrderFormItems());
	}
});

Tine.Billing.SupplyOfferEditDialog = Ext.extend(Tine.Billing.SupplyReceiptEditDialog, {
	receiptType: 'SPOFFER',
	windowNamePrefix: 'ConfirmEditWindow_',
	title:'Angebot Lieferant',
	getFormItems: function(){
		return Tine.Billing.SupplyOfferEditDialog.superclass.getFormItems.call(this,Tine.Billing.getSupplyOfferFormItems());
	}
});

Tine.Billing.SupplyInvoiceEditDialog = Ext.extend(Tine.Billing.SupplyReceiptEditDialog, {
	receiptType: 'SPINVOICE',
	windowNamePrefix: 'SupplyInvoiceEditWindow_',
	title:'Eingangsrechnung',
	getFormItems: function(){
		return Tine.Billing.SupplyInvoiceEditDialog.superclass.getFormItems.call(this,Tine.Billing.getSupplyInvoiceFormItems());
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.SupplyQueryEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.SupplyQueryEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyQueryEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.SupplyOrderOrderEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.SupplyOrderOrderEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyOrderOrderEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.SupplyOfferEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.SupplyOfferEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyOfferEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.SupplyInvoiceEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.SupplyInvoiceEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyInvoiceEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};


Tine.Billing.getSupplyQueryFormItems = function(){
	var fields = Tine.Billing.SupplyReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id, fields.supply_order_id
		   	],[
		   	   	fields.supply_order_nr,
		   	   	fields.supplier_order_nr
		   	 ],[
		   	   	fields.request_date
		   	]]}
		]
	}];
};

Tine.Billing.getSupplyOrderOrderFormItems = function(){
	var fields = Tine.Billing.SupplyReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id, fields.supply_order_id
		   	],[
		   	   	fields.supply_order_nr,
		   	   	fields.supplier_order_nr
		   	 ],[
		   	   	fields.request_date,
		   	   	fields.order_date,
		   	   	fields.order_confirm_date
		   	],[
		   	   	fields.order_shipping_date,
		   	   	fields.shipping_date,
		   	   	fields.order_state
		   	],[
			   	   	fields.template_id,
			   	   	fields.preview_template_id   	
		   	]]}
		]
	}];
};

Tine.Billing.getSupplyOfferFormItems = function(){
	var fields = Tine.Billing.SupplyReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
			   	{xtype:'columnform',border:false,items:[
     		   	[
     		   	 	fields.id, fields.supply_order_id
     		   	],[
     		   	   	fields.supply_offer_nr,
     		   	   	fields.offer_date
     		   	 ],[
     		   	   	fields.offer_shipping_date,
     		   	   	fields.discount_percentage,
     		   	   	fields.discount_total
     		   	],[
			   	   	fields.template_id,
			   	   	fields.preview_template_id     		   	   	
     		   	]]}
		]
	}];
};

Tine.Billing.getSupplyInvoiceFormItems = function(){
	var fields = Tine.Billing.SupplyReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id, fields.supply_order_id
		   	],[
		   	   	fields.supply_inc_inv_nr,
		   	   	fields.inc_invoice_date,
		   	   	fields.inc_invoice_postal_date
		   	 ],[
		   	   	fields.template_id,
		   	   	fields.preview_template_id		   	   	
		   	]]}
		]
	}];
};

Ext.ns('Tine.Billing.SupplyReceiptFormFields');

Tine.Billing.SupplyReceiptFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'receipt_id',name:'id'},
		supply_order_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Lieferauftrag',
			    id:'supply_receipt_supply_order_id',
			    name:'supply_order_id',
			    //disabled: true,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.SupplyOrder,
			    allowBlank:false
			}),
		// mandator_id:
			//{xtype: 'hidden',id:'receipt_mandator_id',name:'mandator_id'},
		receipt_type:	
			{xtype: 'hidden',id:'receipt_type',name:'type'}, //(enum: offer, query, supply_invoice )
		order_nr:
		{
			fieldLabel: 'Auftrags-Nr',
		    id:'supply_receipt_order_nr',
		    name:'order_nr',
		    disabled:true,
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
		},
		supplier_order_nr:
		{
	    	fieldLabel: 'Bestell-Nr Lieferant', 
		    id:'supply_receipt_supplier_order_nr',
		    name:'supplier_order_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	supply_request_nr:
		{
	    	fieldLabel: 'Anfrage-Nr', 
		    id:'supply_receipt_supply_request_nr',
		    name:'supply_request_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	supply_offer_nr:
		{
	    	fieldLabel: 'Lieferangebot-Nr', 
		    id:'supply_receipt_supply_offer_nr',
		    name:'supply_offer_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	supply_order_nr:
		{
	    	fieldLabel: 'Bestell-Nr', 
		    id:'supply_receipt_supply_order_nr',
		    name:'supply_order_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	supply_inc_inv_nr:
		{
	    	fieldLabel: 'ER-Nr', 
		    id:'supply_receipt_supply_inc_inv_nr',
		    name:'supply_inc_inv_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	discount_percentage:
		{
	 		xtype: 'extuxpercentcombo',
	    	fieldLabel: 'Rabatt auf Gesamtsumme %', 
		    id:'supply_receipt_discount_percentage',
		    name:'discount_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	discount_total:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Rabatt auf Gesamtsumme', 
		    id:'supply_receipt_discount_total',
		    name:'discount_total',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	request_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Anfrage', 
			id:'supply_receipt_request_date',
			name:'request_date',
		    width: 150
		},
		offer_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Angebot', 
			id:'supply_receipt_offer_date',
			name:'offer_date',
		    width: 150
		},		
		offer_shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum Angebot', 
			id:'supply_receipt_offer_shipping_date',
			name:'offer_shipping_date',
		    width: 150
		},
		order_shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum Bestellung', 
			id:'supply_receipt_order_shipping_date',
			name:'order_shipping_date',
		    width: 150
		},	
		order_confirm_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum AB Lieferant', 
			id:'supply_receipt_order_confirm_date',
			name:'order_confirm_date',
		    width: 150
		},
		shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum', 
			id:'supply_receipt_shipping_date',
			name:'shipping_date',
		    width: 150
		},
		inc_invoice_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'ER Rechnungsdatum', 
			id:'supply_receipt_inc_invoice_date',
			name:'inc_invoice_date',
		    width: 150
		},
		inc_invoice_postal_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'ER Datum Posteingang', 
			id:'supply_receipt_inc_invoice_postal_date',
			name:'inc_invoice_postal_date',
		    width: 150
		},		
		order_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Bestellung', 
			id:'supply_receipt_order_date',
			name:'order_date',
		    width: 150
		},		
		upper_textblock:
		{
			xtype: 'textarea',
			fieldLabel: 'Textbaustein oben',
			disabledClass: 'x-item-disabled-view',
			id:'supply_receipt_upper_textblock',
			name:'upper_textblock',
			width: 320,
			height: 60
		},		
		comment:
		{
			xtype: 'textarea',
			fieldLabel: 'Textbaustein unten',
			disabledClass: 'x-item-disabled-view',
			id:'supply_receipt_lower_textblock',
			name:'lower_textblock',
			width: 320,
			height: 60
		},		
		shipping_conditions:
		{
			xtype: 'textarea',
			fieldLabel: 'Lieferbedingungen (abweichend)',
			disabledClass: 'x-item-disabled-view',
			id:'supply_receipt_shipping_conditions',
			name:'shipping_conditions',
			width: 320,
			height: 60
		},		
		payment_conditions:
		{
			xtype: 'textarea',
			fieldLabel: 'Zahlungsbedingungen (abweichend)',
			disabledClass: 'x-item-disabled-view',
			id:'supply_receipt_payment_conditions',
			name:'payment_conditions',
			width: 320,
			height: 60
		},		
		payment_conditions:
		{
			xtype: 'textarea',
			fieldLabel: 'Lieferadresse',
			disabledClass: 'x-item-disabled-view',
			id:'supply_receipt_shipping_address',
			name:'shipping_address',
			width: 320,
			height: 60
		},
		template_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
			    fieldLabel: 'Druckvorlage Beleg',
			    id: 'template_id',
			    name: 'template_id',
			    blurOnSelect: true,
			    allowBlank:true,
			    recordClass: Tine.DocManager.Model.Template,
			    width: 450
			}),
		preview_template_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
			    fieldLabel: 'Vorlage Druckvorschau Beleg',
			    id: 'preview_template_id',
			    name: 'preview_template_id',
			    blurOnSelect: true,
			    allowBlank:true,
			    recordClass: Tine.DocManager.Model.Template,
			    width: 450
			})	
	};
};