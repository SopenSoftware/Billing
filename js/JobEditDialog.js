Ext.namespace('Tine.Billing');

Tine.Billing.JobEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priJobe
	 */
	//windowNamePrefix: 'JobEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Job,
	recordProxy: Tine.Billing.jobBackend,
	loadRecord: false,
	evalGrants: false,
	frame:true,
	initComponent: function(){
		this.initDependentGrids();
		this.on('load',this.onLoadJob, this);
		this.tbarItems = [new Tine.widgets.activities.ActivitiesAddButton({})];
		Tine.Billing.JobEditDialog.superclass.initComponent.call(this);
		
	},
    initButtons: function(){
    	Tine.Billing.JobEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
	initDependentGrids: function(){
		this.orderGrid = new Tine.Billing.OrderGridPanel({
			title:'Kundenaufträge',
			layout:'fit',
			disabled:true,
			frame: true,
			useQuickFilter:false,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.supplyOrderGrid = new Tine.Billing.SupplyOrderGridPanel({
			title:'Lieferaufträge',
			layout:'fit',
			disabled:true,
			frame: true,
			useQuickFilter:false,
			displayCountInTitle: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
	},
	onLoadJob: function(){
		this.orderGrid.loadJob(this.record);
		this.supplyOrderGrid.loadJob(this.record);
		if(this.record.id !== 0){
			this.orderGrid.enable();
			this.supplyOrderGrid.enable();
		}
	},
	onAddOrder: function(){
		this.orderWin = Tine.Billing.OrderEditDialog.openWindow({
			job: this.record
		});
		this.orderWin.on('beforeclose',this.onReloadOrder,this);
	},
	onAddSupplyOrder: function(){
		this.supplyOrderWin = Tine.Billing.SupplyOrderEditDialog.openWindow({
			job: this.record
		});
		this.supplyOrderWin.on('beforeclose',this.onReloadSupplyOrder,this);
	},
	onReloadOrder: function(){
		this.orderGrid.getStore().reload();
	},
	onReloadSupplyOrder: function(){
		this.supplyOrderGrid.getStore().reload();
	},
	getFormItems: function(){
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.Job,
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
		            {text: 'Kundenauftrag', handler: this.onAddOrder, scope:this},
		            {text: 'Lieferauftrag', handler: this.onAddSupplyOrder, scope:this}
		            
		 ]});

		 toolbar.add(
				 {
					 text: 'Neuer Auftrag',
					 menu: menu
				 }
		 );
		this.dependentPanel = new Ext.Panel(
				{
					xtype:'panel',
					title:'Aufträge',
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
						 	this.orderGrid,
						 	this.supplyOrderGrid
					   ]
					}  
					]
				}
		);
		this.formItemsPanel = Tine.Billing.getJobFormItems();
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
						    title:'Job',
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
                },{
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
		
		
		return Tine.Billing.getJobFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.JobEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.JobEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.JobEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
Tine.Billing.getJobFormItems = function(){
	var fields = Tine.Billing.JobFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id
		   	],
		   	[
		   	 	fields.job_nr,
		   	 	fields.contact_id
		   	],[
		   	    fields.name
	   		],[
		   	    fields.description
		   	],[
		   	   	fields.budget_unit_id,
		   	   	fields.budget_amount,
		   	   	fields.finish_date	   	   	
		   	]]}
		]
	}];
};


Ext.ns('Tine.Billing.JobFormFields');

Tine.Billing.JobFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		job_nr: 
			{
		    	fieldLabel: 'Job-Nr', 
		    	emptyText:'<automatisch>',
			    id:'job_job_nr',
			    name:'job_nr',
			    disabled:true,
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:120
			},
		contact_id:	
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Ansprechpartner',
			    id:'job_contact_id',
			    name:'contact_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Addressbook.Model.Contact,
			    allowBlank:false
			}),
		
		budget_unit_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Budget-Einheit',
			    id:'job_budget_unit_id',
			    name:'budget_unit_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleUnit,
			    allowBlank:false
			}),
		name:
		{
	    	fieldLabel: 'Bezeichnung', 
		    id:'job_name',
		    name:'name',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:400
	 	},
	 	description:
		{
			xtype: 'textarea',
			fieldLabel: 'Beschreibung',
			disabledClass: 'x-item-disabled-view',
			id:'job_description',
			name:'description',
			width: 400,
			height: 60
		},
		budget_amount:
		{
	 		fieldLabel: 'Budget', 
		    id:'job_budget_amount',
		    name:'budget_amount',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	finish_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Fertigstellung', 
			id:'job_finish_date',
			name:'finish_date',
		    width: 150
		},
	};
};