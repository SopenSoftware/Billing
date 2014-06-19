Ext.namespace('Tine.Billing');

Tine.Billing.OrderTemplateEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priOrderTemplatee
	 */
	//windowNamePrefix: 'OrderTemplateEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.OrderTemplate,
	recordProxy: Tine.Billing.orderTemplateBackend,
	loadRecord: false,
	job:null,
	debitor:null,
	evalGrants: false,
	frame:true,
	initComponent: function(){
		this.tbarItems = [new Tine.widgets.activities.ActivitiesAddButton({})];
		Tine.Billing.OrderTemplateEditDialog.superclass.initComponent.call(this);
		this.on('load',this.onLoadOrderTemplate, this);
	},
    initButtons: function(){
    	Tine.Billing.OrderTemplateEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },
	onLoadOrderTemplate: function(){
		if(this.record.id == 0){
			if(this.job){
				this.record.data.job_id = new Tine.Billing.Model.Job(this.job.data, this.job.id);
			}
			if(this.debitor){
				this.record.data.debitor_id = new Tine.Billing.Model.Debitor(this.debitor.data, this.debitor.id);
				this.record.data.price_group_id = this.record.data.debitor_id.get('price_group_id');
			}
		}
		if(this.dependentPanel){
			this.dependentPanel.loadDebitorData({
				orderTemplateRecord: this.record,
				debitorRecord: this.record.getForeignRecord(Tine.Billing.Model.Debitor,'debitor_id'),
				priceGroupId: this.record.getForeignId('price_group_id')
			});
		}
	},
	getFormItems: function(){
		var positionPanelDisabled = true;
		if(!this.record || this.record.id!=0){
			positionPanelDisabled = false;
		}
		this.dependentPanel = new Tine.Billing.QuickOrderGridPanel({
			title:'Positionen',
			app: this.app,
			//autoHeight:true,
			region:'center',
			layout:'fit',
			storeAtOnce: true,
			perspective:'orderTemplate',
			orderTemplateRecord: this.record,
			disabled:positionPanelDisabled
		});
		
		this.articleSelectionGrid = new Tine.Billing.ArticleSelectionGridPanel({
			title:'Artikel',
			layout:'border',
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.OrderTemplate,
            disabled: (Tine.Billing.registry.get('customfields').length === 0),
            quickHack: {record: this.record}
        });
		
		
		this.formItemsPanel = Tine.Billing.getOrderTemplateFormItems();
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
						    title:'Auftragsvorlage',
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
					header:false,
					region:'south',
					layout:'border',
					height:500,
					border:false,
					items:[{
						xtype:'panel',
						region:'center',
						header:false,
						height: 300,
						layout:'fit',
						collapsible:true,
						collapseMode:'mini',
						split:true,
						items:[this.dependentPanel]
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
				}
				
		]};
		
		
		return Tine.Billing.getOrderTemplateFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.OrderTemplateEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.OrderTemplateEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.OrderTemplateEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
Tine.Billing.getOrderTemplateFormItems = function(){
	var fields = Tine.Billing.OrderTemplateFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,
		   	 	fields.account_id,
		   	 	fields.job_id,
			   	fields.debitor_id,
			   	{xtype:'hidden',width:40},
			   	fields.with_calculation,
			   	fields.with_bid
			],[			   	
			   	fields.name,
			   	fields.price_group_id,
			   	{xtype:'hidden',width:40},
			   	fields.with_confirm,
			   	fields.with_ship_doc
		   	],[
		   		fields.description,
		   		{xtype:'hidden',width:40},
		   		fields.with_invoice
		   	]]}
		]
	}];
};


Ext.ns('Tine.Billing.OrderTemplateFormFields');

Tine.Billing.OrderTemplateFormFields.get = function(){
	return{
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		account_id: 
			{xtype: 'hidden',id:'order_template_account_id',name:'account_id'},
		job_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Job',
			    id:'order_template_job_id',
			    name:'job_id',
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Job
			}),
		debitor_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Kunde',
			    id:'order_template_debitor_id',
			    name:'debitor_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Debitor,
			    allowBlank:true
			}),
		
		price_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Preisgruppe',
			    id:'order_template_price_group_id',
			    name:'price_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.PriceGroup,
			    allowBlank:false
			}),
		name:
			{
		    	fieldLabel: 'Bezeichnung', 
			    id:'order_template_name',
			    name:'name',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:250,
		 	    allowBlank: false
		 	},
		description:
			{
				xtype: 'textarea',
		    	fieldLabel: 'Beschreibung', 
			    id:'order_template_description',
			    name:'description',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:500,
		 	    height:80
		 	},
		with_calculation:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'order_template_with_calculation',
				name: 'with_calculation',
				hideLabel:true,
			    boxLabel: 'Kalkulation',
			    width: 150
			},
		with_bid:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'order_template_with_bid',
				name: 'with_bid',
				hideLabel:true,
			    boxLabel: 'Angebot',
			    width: 150
			},
		with_confirm:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'order_template_with_confirm',
				name: 'with_confirm',
				hideLabel:true,
			    boxLabel: 'AB',
			    width: 150
			},
		with_ship_doc:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'order_template_with_ship_doc',
				name: 'with_ship_doc',
				hideLabel:true,
			    boxLabel: 'Lieferschein',
			    width: 150
			},
		with_invoice:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'order_template_with_invoice',
				name: 'with_invoice',
				hideLabel:true,
			    boxLabel: 'Rechnung',
			    width: 150
			}			
	};
};