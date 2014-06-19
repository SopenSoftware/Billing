Ext.namespace('Tine.Billing');

Tine.Billing.SupplyOrderEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priSupplyOrdere
	 */
	//windowNamePrefix: 'SupplyOrderEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.SupplyOrder,
	recordProxy: Tine.Billing.supplyOrderBackend,
	loadRecord: false,
	job:null,
	evalGrants: false,
	frame:true,
	initComponent: function(){
		this.initDependentGrids();
		this.tbarItems = [new Tine.widgets.activities.ActivitiesAddButton({})];
		Tine.Billing.SupplyOrderEditDialog.superclass.initComponent.call(this);
		this.on('load',this.onLoadSupplyOrder, this);
	},
    initButtons: function(){
    	Tine.Billing.SupplyOrderEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
	initDependentGrids: function(){
		this.queryGrid = new Tine.Billing.SupplyQueryGridPanel({
			title:'Anfragen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.offerGrid = new Tine.Billing.SupplyOfferGridPanel({
			title:'Lieferangebote',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.orderGrid = new Tine.Billing.SupplyOrderOrderGridPanel({
			title:'Lieferantenbestellungen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.invoiceGrid = new Tine.Billing.SupplyInvoiceGridPanel({
			title:'Eingangsrechnungen',
			layout:'fit',
			disabled:true,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.integratedGrid = new Tine.Billing.AllSupplyReceiptsGridPanel({
			title:'Alle Vorgänge',
			layout:'fit',
			disabled:false,
			frame: true,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});	
	},
	onLoadSupplyOrder: function(){
		if(this.record.id == 0){
			this.record.data.job_id = new Tine.Billing.Model.Job(this.job.data, this.job.id);
		}
		this.queryGrid.loadSupplyOrder(this.record);
		this.offerGrid.loadSupplyOrder(this.record);
		this.orderGrid.loadSupplyOrder(this.record);
		this.invoiceGrid.loadSupplyOrder(this.record);
		if(this.record.id !== 0){
			this.queryGrid.enable();
			this.offerGrid.enable();
			this.orderGrid.enable();
			this.invoiceGrid.enable();
		}
	},
	onAddQuery: function(){
		this.queryWin = Tine.Billing.SupplyQueryEditDialog.openWindow({
			supplyOrder: this.record
		});
		this.queryWin.on('beforeclose',this.onReloadQuery,this);
	},
	onAddOffer: function(){
		this.offerWin = Tine.Billing.SupplyOfferEditDialog.openWindow({
			supplyOrder: this.record
		});
		this.offerWin.on('beforeclose',this.onReloadOffer,this);
	},
	onAddOrder: function(){
		this.orderWin = Tine.Billing.SupplyOrderOrderEditDialog.openWindow({
			supplyOrder: this.record
		});
		this.orderWin.on('beforeclose',this.onReloadOrder,this);
	},
	onAddInvoice: function(){
		this.invoiceWin = Tine.Billing.SupplyInvoiceEditDialog.openWindow({
			supplyOrder: this.record
		});
		this.invoiceWin.on('beforeclose',this.onReloadInvoice,this);
	},
	onReloadQuery: function(){
		this.queryGrid.getStore().reload();
	},
	onReloadOffer: function(){
		this.offerGrid.getStore().reload();
	},
	onReloadOrder: function(){
		this.orderGrid.getStore().reload();
	},
	onReloadInvoice: function(){
		this.invoiceGrid.getStore().reload();
	},	
	getFormItems: function(){
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.SupplyOrder,
            disabled: (Tine.Billing.registry.get('customfields').length === 0),
            quickHack: {record: this.record}
        });
		
		var toolbar = new Ext.Toolbar();
		
		 var menu = new Ext.menu.Menu({
		        id: 'receiptMenu',
		        style: {
		            overflow: 'visible'     // For the Combo popup
		        },
		        items: [
		            {text: 'Anfrage an Lieferanten', handler: this.onAddQuery, scope:this},
		            {text: 'Kostenangebot Lieferant', handler: this.onAddOffer, scope:this},
		            {text: 'Bestellung bei Lieferant', handler: this.onAddOrder, scope:this},
		            {text: 'Rechnung Lieferant', handler: this.onAddInvoice, scope:this}
		            
		 ]});

		 toolbar.add(
				 {
					 text: 'Neuer Vorgang',
					 menu: menu
				 }
		 );
		this.dependentPanel = new Ext.Panel(
				{
					xtype:'panel',
					title:'Belege',
					layout:'fit',
					collapsible:true,
					tbar: toolbar,
					items: [
					{
						xtype:'tabpanel',
						border: false,
						autoDestroy:true,
						layoutOnTabChange: true,
						forceLayout:true,
						activeTab:0,
						items:[
						 	this.queryGrid,
						 	this.offerGrid,
						 	this.orderGrid,
						 	this.invoiceGrid,
						 	this.integratedGrid
					   ]
					}  
					]
				}
		);
		this.formItemsPanel = Tine.Billing.getSupplyOrderFormItems();
		return {
			xtype:'panel',
			header:false,
			region:'center',
			layout:'border',
			autoScroll:'true',
			items:[
				{
					xtype:'tabpanel',
					region:'center',
					border: false,
					autoDestroy:true,
					layoutOnTabChange: true,
					forceLayout:true,
					activeTab:0,
					items:[
					 	{
						    xtype: 'panel',
						    title:'Lieferauftrag',
						    border: false,
						    autoScroll:true,
						    height:360,
						    frame:true,
						    items: this.formItemsPanel
						},
					 	this.activitiesPanel,
					 	this.customFieldsPanel
				   ]
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
                },
				{
					xtype:'panel',
					region:'south',
					header:false,
					height: 300,
					layout:'fit',
					collapsible:true,
					collapseMode:'mini',
					split:true,
					items:[this.dependentPanel]
				}
				
		]};
		
		
		return Tine.Billing.getSupplyOrderFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.SupplyOrderEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.SupplyOrderEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.SupplyOrderEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
Tine.Billing.getSupplyOrderFormItems = function(){
	var fields = Tine.Billing.SupplyOrderFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.job_id,
		   	 	fields.account_id,
		   	],[
		   	    fields.creditor_id,
		   	   	fields.supply_order_nr,
				fields.supplier_order_nr
		   	]]}
		]
	}];
};


Ext.ns('Tine.Billing.SupplyOrderFormFields');

Tine.Billing.SupplyOrderFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		job_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Job',
			    id:'supply_order_job_id',
			    name:'job_id',
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Job
			}),
		account_id: 
			{xtype: 'hidden',id:'supply_order_account_id',name:'account_id'},
		// mandator_id:
			//{xtype: 'hidden',id:'receipt_mandator_id',name:'mandator_id'},
		creditor_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Lieferant',
			    id:'supply_order_creditor_id',
			    name:'creditor_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Creditor,
			    allowBlank:false
			}),
		supply_order_nr:
		{
	    	fieldLabel: 'Bestell-Nr', 
		    id:'supply_order_supply_order_nr',
		    name:'supply_order_nr',
		    emptyText:'<automatisch>',
		    disabled:true,
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
		supplier_order_nr:
		{
	    	fieldLabel: 'Bestell-Nr Lieferant', 
		    id:'supply_order_supplier_order_nr',
		    name:'supplier_order_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	}		
	};
};