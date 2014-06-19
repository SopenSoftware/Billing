Ext.namespace('Tine.Billing');

Tine.Billing.DebitorEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @private
	 */
	windowNamePrefix: 'DebitorEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Debitor,
	recordProxy: Tine.Billing.debitorBackend,
	loadRecord: false,
	evalGrants: false,
	
	initComponent: function(){
		this.addEvents(
			'loaddebitor'	
		);
		this.dependentPanel = new Ext.TabPanel({
			region:'center',
			border: false,
			autoDestroy:true,
			layoutOnTabChange: true,
			forceLayout:true,
			activeTab:0,
			items:[
    	        {
    	        	xtype:'panel',
    	        	title:'Lieferartikel',
    	        	layout:'fit',
    	        	frame:true
    	        },{
    	        	xtype:'panel',
    	        	title:'Leistungseigenschaften',
    	        	layout:'fit',
    	        	frame:true
    	        },{
    	        	xtype:'panel',
    	        	title:'Bestellungen',
    	        	layout:'fit',
    	        	frame:true
    	        },{
    	        	xtype:'panel',
    	        	title:'Eingangsrechnungen',
    	        	layout:'fit',
    	        	frame:true
    	        }
    	   ]
		});
        this.on('afterrender',this.onAfterRender,this);
        Tine.Billing.DebitorEditDialog.superclass.initComponent.call(this);
	},
	onRecordLoad: function(){
		Tine.Billing.DebitorEditDialog.superclass.onRecordLoad.call(this);
		this.fireEvent('loaddebitor',this.record);
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		return {
			xtype:'panel',
			title: 'Debitor Stammdaten',
			height:200,
			layout:'border',
			items:[
				{
				    xtype: 'panel',
				    region:'north',
				    border: false,
				    height:110,
				    frame:true,
				    items:[{xtype:'columnform',items:[[
						 	{xtype:'hidden',id:'id',name:'id'},
						 	new Tine.Tinebase.widgets.form.RecordPickerComboBox({
								disabledClass: 'x-item-disabled-view',
								width: 250,
								fieldLabel: 'Kontakt Kunde',
							    id:'contact_id',
							    name:'contact_id',
							    disabled: false,
							    onAddEditable: true,	// only has effect in class:DependentEditForm
							    onEditEditable: false,	// only has effect in class:DependentEditForm
							    blurOnSelect: true,
							    recordClass: Tine.Addressbook.Model.Contact,
							    allowBlank:false,
						        ddConfig:{
						        	ddGroup: 'ddGroupContact'
						        }
							})
						 ],[
						 	{
    					    	xtype:'processtriggerfield',
    					    	fieldLabel: this.app.i18n._('Debitor-Nr'), 
    						    id:'debitor_nr',
    						    name:'debitor_nr',
    					    	disabledClass: 'x-item-disabled-view',
    					    	blurOnSelect: true,
    					 	    width:250
        					 	/*listeners:{
        					 	   scope:this,
        					 	   triggerclick: Tine.Addressbook.Listeners.debitorNumberChangeListener,
        					 	   valid: Tine.Addressbook.Listeners.debitorNumberValidateListener
       							}*/
						 	}
						 ]
				    ]}]
				},
				this.dependentPanel
			]
		};
	},
	   onAfterRender: function(){
	    	this.initDropZone();
	    },
	    
	    initDropZone: function(){
	    	if(!this.ddConfig){
	    		return;
	    	}
			this.dd = new Ext.dd.DropTarget(this.el, {
				scope: this,
				ddGroup     : this.ddConfig.ddGroupContact,
				notifyEnter : function(ddSource, e, data) {
					this.scope.el.stopFx();
					this.scope.el.highlight();
				},
				notifyDrop  : function(ddSource, e, data){
					return this.scope.onDrop(ddSource, e, data);
				}
			});
			this.dd.addToGroup(this.ddConfig.ddGroupGetContact);
		},
		
		extractRecordFromDrop: function(ddSource, e, data){
			var source = data.selections[0];
			var record = null;
			switch(ddSource.ddGroup){
			case 'ddGroupDebitor':
				var source = data.selections[0];
				record = source;
				break;
				
			case 'ddGroupGetDebitor':
				if(source.getDebitor !== undefined && typeof(source.getDebitor)==='function'){
					record = source.getDebitor();
				}
				break;
			}
			return record;
		},
		
		onDrop: function(ddSource, e, data){
			var record = this.extractRecordFromDrop(ddSource, e, data);
			if(!record){
				return false;
			}
			this.record = record;
			this.initRecord();
			return true;
		},
		getDebitorWidget: function(){
			if(!this.debitorWidget){
				this.debitorWidget = new Tine.Billing.DebitorWidget({
						region: 'north',
						layout:'fit',
						height:40,
						editDialog: this
				});
			}
			return this.debitorWidget;
		}
});

// extended content panel constructor
Tine.Billing.DebitorEditDialogPanel = Ext.extend(Ext.Panel, {
	panelManager:null,
	windowNamePrefix: 'DebitorEditWindow_',
	appName: 'Billing',
	layout:'fit',
	bodyStyle:'padding:0px;padding-top:5px',
	forceLayout:true,
	initComponent: function(){
		Ext.apply(this.initialConfig, {
			region:'center'//,
			//title:'Kreditor'
		});
		var regularDialog = new Tine.Billing.DebitorEditRecord(this.initialConfig);
		regularDialog.doLayout();
		this.items = this.getItems(regularDialog);
		Tine.Billing.DebitorEditDialogPanel.superclass.initComponent.call(this);
	},
	getItems: function(regularDialog){
		var recordChoosers = [
			{
				xtype:'contactselectiongrid',
				title:'Kontakte',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Addressbook')
			},{
				xtype:'debitorselectiongrid',
				title:'Kunden',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Billing')
			},{
  				xtype:'articleselectiongrid',
  				title:'Artikel',
  				layout:'border',
  				app: Tine.Tinebase.appMgr.get('Billing')
  			}                    
		];
		
		// use some fields from brevetation edit dialog
		 var recordChooserPanel = {
				 xtype:'panel',
				 layout:'accordion',
				 region:'east',
				 title: 'Auswahlübersicht',
				 width:540,
				 collapsible:true,
				 bodyStyle:'padding:8px;',
				 split:true,
				 items: recordChoosers
		 };
		return [{
			xtype:'panel',
			layout:'border',
			items:[
			       // display debitor widget north
			       regularDialog.getDebitorWidget(),
			       // tab panel containing debitor master data
			       // + dependent panels
			       regularDialog,
			       // place record chooser east
			       recordChooserPanel
			]
		}];
	}
});


/**
 * Billing Edit Popup
 */
Tine.Billing.DebitorEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.DebitorEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.DebitorEditDialogPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.DebitorEditRecord = Ext.extend(Tine.widgets.dialog.DependentEditForm, {
	easyAdding:false,
	id: 'sopen-billing-debitor-edit-record-form',
	className: 'Tine.Billing.DebitorEditRecord',
	key: 'DebitorEditRecord',
	recordArray: Tine.Billing.Model.DebitorArray,
	recordClass: Tine.Billing.Model.Debitor,
    recordProxy: Tine.Billing.debitorBackend,
    parentRecordClass: Tine.Addressbook.Model.Contact,
    parentRelation: {
    	type: Tine.widgets.dialog.parentRelationTypes.ONE_TO_ONE,
		fkey: 'contact_id',
		references: 'id'
	},
    useGrid: false,
    useChildPanels:true,
    splitViewToggle: true,
    //gridPanelClass: Tine.Billing.BillingMasterGridPanelNested,
	formFieldPrefix: 'debitor_',
	formPanelToolbarId: 'billing-debitor-edit-dialog-panel-toolbar',
	//withFormPanelToolbar: false,
	frame:true,
	initComponent: function(){
		this.addEvents(
			'loaddebitor'
		);
		this.initWidgets();
		this.initToolbarActions();
		this.initDependentGrids();

		this.app = Tine.Tinebase.appMgr.get('Billing');
		//this.recordProxy = Tine.Billing.debitorBackend;
		this.parentRecordClass = Tine.Addressbook.Model.Contact;
		this.parentRelation = {
			fkey: 'contact_id',
			references: 'id'
		};
		Tine.Billing.DebitorEditRecord.superclass.initComponent.call(this);
		this.on('parentloaded', this.onLoadContact, this);
		this.on('afterrender',this.onAfterRender,this);
		this.on('loadform',this.onLoadDebitor, this);
		// register parent action events
		// this record events are handled by parent class
      	this.registerGridEvent('addparentrecord',this.onAddBilling, this);
    	this.registerGridEvent('editparentrecord',this.onEditBilling, this);
	},
	initChildPanels: function(){
		//this.registerChildPanel('ArticleCustomerEditRecord', Tine.Billing.getBillingEditRecordAsTab());
	},
	initWidgets: function(){
		this.getDebitorWidget();
	},
	initToolbarActions: function() {
        this.action_addContactAsDebitor = new Ext.Action({
            requiredGrant: 'editGrant',
            text: 'Kontakt als Debitor hinzufügen',
            minWidth: 70,
            disabled:true,
            scope: this,
            handler: this.onAddContactAsDebitor,
            iconCls: 'action_saveAndClose'
        });
        this.buttonAddContactAsDebitor = new Ext.Button(this.action_addContactAsDebitor);
    },
    onAddContactAsDebitor: function(){
    	
    },
	onLoadContact: function(contactRecord){
		var options = {
			success: this.onLoadDebitorByContactId, 
			scope: this
		};
		var filter = [{	
			field: 'contact_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: contactRecord.get('id')}]
		}];
	  this.recordProxy.searchRecords(filter, null, options);
	},
	onLoadDebitorByContactId: function(response){
		var debitorRecord;
		if(response.success && response.totalRecords == 1){
			var resultRecord = response.records[0];
			debitorRecord = new Tine.Billing.Model.Debitor(resultRecord.data, resultRecord.id);
			this.articleCustomerGrid.enable();
		}else{
			debitorRecord = new Tine.Billing.Model.Debitor({}, 0);
			this.articleCustomerGrid.disable();
		}
		this.record = debitorRecord;
		this.showRecord(this.record);
	},
	onBeforeAddRecord: function(record){
		// parent record picker in this form -> unload parent, oterwise addRecord will fail
		//this.unloadParent();
		Tine.Billing.DebitorEditRecord.superclass.onBeforeAddRecord.call(this);
	},
	exchangeEvents: function(observable){
		this.checkObservableBreak(observable);
		switch(observable.className){
		case 'Tine.Billing.BillingEditRecord':
			//observable.on('aftersavesuccess',this.onAfterSaveBilling, this);
			
			// don't call observable.exchangeEvents again here in parent
			// -> recursion
			return true;
		}
		return false;
	},
	getOrderLockSelect: function(){
    	return Ext.getCmp('debitor_is_order_locked');
    },
    getOrderLockExpander: function(){
		return Ext.getCmp('orderLockAddition');
	},
	getOrderLockDate: function(){
		return Ext.getCmp('debitor_order_lock_date');
	},
	getOrderLockComment: function(){
		return Ext.getCmp('debitor_order_lock_comment');
	},
	onOrderLockSelect: function( select ){
		var value = select.getValue();
		
		switch(value){
		case true:
				this.getOrderLockExpander().expand();
				this.getOrderLockDate().enable();
				this.getOrderLockComment().enable();
			break;
			
		case false:
			this.getOrderLockExpander().collapse();
			this.getOrderLockDate().disable();
			this.getOrderLockDate().setValue(null);
			this.getOrderLockComment().disable();
			this.getOrderLockComment.value = null;
			break;
		}
	},
	getMonitionLockSelect: function(){
    	return Ext.getCmp('debitor_is_monition_locked');
    },
    getMonitionLockExpander: function(){
		return Ext.getCmp('monitionLockAddition');
	},
	getMonitionLockDate: function(){
		return Ext.getCmp('debitor_monition_lock_date');
	},
	getMonitionLockComment: function(){
		return Ext.getCmp('debitor_monition_lock_comment');
	},
	onMonitionLockSelect: function( select ){
		var value = select.getValue();
		
		switch(value){
		case true:
				this.getMonitionLockExpander().expand();
				this.getMonitionLockDate().enable();
				this.getMonitionLockComment().enable();
			break;
			
		case false:
			this.getMonitionLockExpander().collapse();
			this.getMonitionLockDate().disable();
			this.getMonitionLockDate().setValue(null);
			this.getMonitionLockComment().disable();
			this.getMonitionLockComment.value = null;
			break;
		}
	},
	getFormContents: function(){
		var toolbar;
		if(this.easyAdding == true){
			toolbar = new Ext.Toolbar();
			//toolbar.hide();
			toolbar.add(this.buttonAddContactAsDebitor);
		}
		
		this.dependentPanel = new Ext.TabPanel({
			border: false,
			autoDestroy:true,
			layoutOnTabChange: true,
			forceLayout:true,
			activeTab:0,
			items:[
			    this.debitorAccountGrid,
			    this.customerOrderGrid,
			 	this.articleCustomerGrid
    	   ]
		});
		this.formItemsPanel = Tine.Billing.getDebitorFormItems();
		var panel = {
			xtype:'panel',
			title: 'Debitor Stammdaten',
			region:'center',
			layout:'border',
			items:[
				{
				    xtype: 'panel',
				    region:'center',
				    border: false,
				    autoScroll:true,
				    
				    frame:true,
				    items: this.formItemsPanel
				},
				{
					xtype:'panel',
					region:'south',
					header:false,
					height: 350,
					layout:'fit',
					collapsible:true,
					collapseMode:'mini',
					split:true,
					items:[this.dependentPanel]
				}
				
		]};
		
		if(toolbar){
			panel.tbar = toolbar;
		}
		return panel;
	},
	initDependentGrids: function(){
		this.customerOrderGrid = new Tine.Billing.OrderGridPanel({
			title:'Aufträge',
			disabled:true,
			frame: true,
			useQuickFilter:false,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
		this.articleCustomerGrid = new Tine.Billing.ArticleCustomerGridPanel({
			title:'Artikeldaten Kunde',
			layout:'fit',
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing'),
			perspective: Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_DEBITOR
		});
		
		this.debitorAccountGrid = new Tine.Billing.DebitorAccountGridPanel({
			title:'Kundenkonto',
			layout:'border',
			useImplicitForeignRecordFilter: true,
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
		
	},
	onLoadDebitor: function(){
		this.onOrderLockSelect(this.getOrderLockSelect());
		this.onMonitionLockSelect(this.getMonitionLockSelect());
		
		this.customerOrderGrid.loadDebitor(this.record);
		this.articleCustomerGrid.loadDebitor(this.record);
		this.debitorAccountGrid.loadDebitor(this.record);
		if(this.record.id !== 0){
			this.articleCustomerGrid.enable();
			this.customerOrderGrid.enable();
			this.debitorAccountGrid.enable();
		}
		if(this.debitorWidget){
			try{
				this.debitorWidget.onLoadDebitor(this.record);
			}catch(e){/*silent failure*/}
		}
	},
	getRecordChooserItems: function(){
		return [
  			{
  				xtype:'contactselectiongrid',
  				title:'Kontakte',
  				layout:'border',
  				app: Tine.Tinebase.appMgr.get('Addressbook')
  			},{
  				xtype:'debitorselectiongrid',
  				title:'Kunden',
  				layout:'border',
  				app: Tine.Tinebase.appMgr.get('Billing')
  			},{
  				xtype:'articleselectiongrid',
  				title:'Artikel',
  				layout:'border',
  				app: Tine.Tinebase.appMgr.get('Billing')
  			}];
	},
	   onAfterRender: function(){
		   this.getOrderLockSelect().addListener('check',this.onOrderLockSelect, this);
		   this.getMonitionLockSelect().addListener('check',this.onMonitionLockSelect, this);

		   this.showRecord(this.record);
		   this.initDropZone();
	    },
	    
	    initDropZone: function(){
	    	if(!this.ddConfig){
	    		return;
	    	}
			this.dd = new Ext.dd.DropTarget(this.el, {
				scope: this,
				ddGroup     : this.ddConfig.ddGroupContact,
				notifyEnter : function(ddSource, e, data) {
					this.scope.el.stopFx();
					this.scope.el.highlight();
				},
				notifyDrop  : function(ddSource, e, data){
					return this.scope.onDrop(ddSource, e, data);
				}
			});
			this.dd.addToGroup(this.ddConfig.ddGroupGetContact);
		},
		
		extractRecordFromDrop: function(ddSource, e, data){
			var source = data.selections[0];
			var record = null;
			switch(ddSource.ddGroup){
			case 'ddGroupDebitor':
				var source = data.selections[0];
				record = source;
				break;
				
			case 'ddGroupGetDebitor':
				if(source.getDebitor !== undefined && typeof(source.getDebitor)==='function'){
					record = source.getDebitor();
				}
				break;
			}
			return record;
		},
		
		onDrop: function(ddSource, e, data){
			var record = this.extractRecordFromDrop(ddSource, e, data);
			if(!record){
				return false;
			}
			this.record = record;
			this.showRecord(record);
			return true;
		},
		getDebitorWidget: function(){
			if(!this.debitorWidget){
				this.debitorWidget = new Tine.Billing.DebitorWidget({
						region: 'north',
						layout:'fit',
						height:40,
						editDialog: this
				});
			}
			return this.debitorWidget;
		}
	
});

Tine.Billing.getDebitorFormItems = function(){
	var fields = Tine.Billing.DebitorFormFields.get();
	 var orderLockForm = 
		{
			xtype:'columnform',border:false,width:450, items:
			[[
				{
					xtype: 'extuxclearabledatefield',
					disabledClass: 'x-item-disabled-view',
					id: 'debitor_order_lock_date',
					name: 'order_lock_date',
					fieldLabel: 'Auftrags-Sperre ab',
				    columnWidth:0.4,
				    disabled:true
				}
			],[  		
				{
					xtype: 'textarea',
					fieldLabel: 'Bemerkung zur Auftrags-Sperre',
					disabledClass: 'x-item-disabled-view',
					id:'debitor_order_lock_comment',
					name:'order_lock_comment',
					width: 450,
					height: 30,
					disabled:true
				} 
			]]
		};
	 
	var monitionLockForm = 
	{
		 xtype:'columnform',border:false,width:450, items:
				[[
					{
						xtype: 'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'debitor_monition_lock_date',
						name: 'monition_lock_date',
						fieldLabel: 'Mahns-Sperre ab',
					    columnWidth:0.4,
					    disabled:true
					}
				],[  		
					{
						xtype: 'textarea',
						fieldLabel: 'Bemerkung zur Mahns-Sperre',
						disabledClass: 'x-item-disabled-view',
						id:'debitor_monition_lock_comment',
						name:'monition_lock_comment',
						width: 450,
						height: 30,
						disabled:true
					} 
				]]
	};

	return [{
		xtype:'panel',
		layout:'fit',
		height:600,
		tbar: new Ext.Toolbar({id:'billing-debitor-edit-dialog-panel-toolbar-tb',height:26}),
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,
		   	 	fields.contact_id                    
		   	],[
		   	   	fields.debitor_nr, fields.fibu_exp_date
		   	],[
		   	   	fields.ust_id
		   	],[
		   	   	fields.price_group_id, fields.vat_id
	   		],[
		   	   	fields.debitor_group_id
			],[
				{
					xtype:'checkbox',
					hideLabel: true,
					boxLabel: 'Auftrags-Sperre',
				    id:'debitor_is_order_locked',
				    name:'is_order_locked',
				    width: 200
				},{
					xtype:'checkbox',
					hideLabel: true,
					boxLabel: 'Mahn-Sperre',
					id:'debitor_is_monition_locked',
				    name:'is_monition_locked',
				    width: 200
				}
			],[
				{
					xtype: 'panel',
					id:'orderLockAddition',
					layout:'fit',
					header:false,
					width:450,
					collapsible:true,
					collapsed:true,
					items:[
					       orderLockForm
					]
				}
			],[
				{
					xtype: 'panel',
					id:'monitionLockAddition',
					layout:'fit',
					header:false,
					width:450,
					collapsible:true,
					collapsed:true,
					items:[
					       monitionLockForm
					]
				}
			]		   
			   
			   
		   	]}
		]
	}];
};

Ext.ns('Tine.Billing.DebitorFormFields');

Tine.Billing.DebitorFormFields.get = function(){
	
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'debitor_id',name:'id'},
		contact_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Kontakt Kunde',
			    id:'debitor_contact_id',
			    name:'contact_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Addressbook.Model.Contact,
			    allowBlank:false,
		        ddConfig:{
		        	ddGroup: 'ddGroupContact'
		        }
			}),
		debitor_nr:
			{
		    	xtype:'processtriggerfield',
		    	fieldLabel: 'Debitor-Nr', 
			    id:'debitor_debitor_nr',
			    name:'debitor_nr',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:250
		 	},
		ust_id:	
		 	{
				disabledClass: 'x-item-disabled-view',
				id: 'debitor_ust_id',
				name: 'ust_id',
				fieldLabel: 'UST-ID',
			    columnWidth:0.4,
			    disabled:true
			},	
		price_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Preisgruppe',
			    id:'debitor_price_group_id',
			    name:'price_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.PriceGroup,
			    allowBlank:false
			}),
		debitor_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Kundengruppe',
			    id:'debitor_debitor_group_id',
			    name:'debitor_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.DebitorGroup,
			    allowBlank:false
			}),
		vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt',
			    id:'debitor_vat_id',
			    name:'vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:false
			}),
		fibu_exp_date:
			{
			   	xtype: 'extuxclearabledatefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Datum Übergabe Fibu', 
				id:'debitor_fibu_exp_date',
				disabled:true,
				name:'fibu_exp_date',
			    width: 150
			}
	};
};