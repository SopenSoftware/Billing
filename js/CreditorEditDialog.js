Ext.namespace('Tine.Billing');

Tine.Billing.CreditorEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @private
	 */
	windowNamePrefix: 'CreditorEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Creditor,
	recordProxy: Tine.Billing.creditorBackend,
	loadRecord: false,
	evalGrants: false,
	
	initComponent: function(){
		this.addEvents(
			'loadcreditor'	
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
        Tine.Billing.CreditorEditDialog.superclass.initComponent.call(this);
	},
	onRecordLoad: function(){
		Tine.Billing.CreditorEditDialog.superclass.onRecordLoad.call(this);
		this.fireEvent('loadcreditor',this.record);
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		return {
			xtype:'panel',
			title: 'Kreditor Stammdaten',
			height:200,
			layout:'border',
			items:[
				{
				    xtype: 'panel',
				    region:'north',
				    border: false,
				    height:110,
				    frame:true,
				    items:[{xtype:'columnform',items:[
						[
						 	{xtype:'hidden',id:'id',name:'id'},
						 	new Tine.Tinebase.widgets.form.RecordPickerComboBox({
								disabledClass: 'x-item-disabled-view',
								width: 250,
								fieldLabel: 'Kontakt Lieferant',
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
    					    	fieldLabel: this.app.i18n._('Kreditor-Nr'), 
    						    id:'creditor_nr',
    						    name:'creditor_nr',
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
			case 'ddGroupCreditor':
				var source = data.selections[0];
				record = source;
				break;
				
			case 'ddGroupGetCreditor':
				if(source.getCreditor !== undefined && typeof(source.getCreditor)==='function'){
					record = source.getCreditor();
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
		getCreditorWidget: function(){
			if(!this.creditorWidget){
				this.creditorWidget = new Tine.Billing.CreditorWidget({
						region: 'north',
						layout:'fit',
						height:40,
						editDialog: this
				});
			}
			return this.creditorWidget;
		}
});

// extended content panel constructor
Tine.Billing.CreditorEditDialogPanel = Ext.extend(Ext.Panel, {
	panelManager:null,
	windowNamePrefix: 'CreditorEditWindow_',
	appName: 'Billing',
	layout:'fit',
	bodyStyle:'padding:0px;padding-top:5px',
	forceLayout:true,
	initComponent: function(){
		Ext.apply(this.initialConfig, {
			region:'center'
		});
		var regularDialog = new Tine.Billing.CreditorEditRecord(this.initialConfig);
		//regularDialog.doLayout();
		this.items = this.getItems(regularDialog);
		Tine.Billing.CreditorEditDialogPanel.superclass.initComponent.call(this);
	},
	getItems: function(regularDialog){
		var recordChoosers = [
			{
				xtype:'contactselectiongrid',
				title:'Kontakte',
				layout:'border',
				app: Tine.Tinebase.appMgr.get('Addressbook')
			},{
				xtype:'creditorselectiongrid',
				title:'Lieferanten',
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
		return [new Ext.Panel({
			//xtype:'panel',
			layout:'border',
			items:[
			       // display creditor widget north
			       regularDialog.getCreditorWidget(),
			       // tab panel containing creditor master data
			       // + dependent panels
			       regularDialog,
			       // place record chooser east
			       recordChooserPanel
			]
		})];
	}
});


/**
 * Billing Edit Popup
 */
Tine.Billing.CreditorEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.CreditorEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.CreditorEditDialogPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.CreditorEditRecord = Ext.extend(Tine.widgets.dialog.DependentEditForm, {
	id: 'sopen-billing-creditor-edit-record-form',
	className: 'Tine.Billing.CreditorMasterEditRecord',
	key: 'CreditorEditRecord',
	recordArray: Tine.Billing.Model.CreditorArray,
	recordClass: Tine.Billing.Model.Creditor,
    recordProxy: Tine.Billing.creditorBackend,
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
	formFieldPrefix: 'creditor_',
	formPanelToolbarId: 'billing-creditor-edit-dialog-panel-toolbar',
	//withFormPanelToolbar: false,
	frame:true,
	forceLayout:true,
	initComponent: function(){
		this.addEvents(
			'loadcreditor'	
		);
		this.initWidgets();
		this.initDependentGrids();
		// init creditor widget
		//this.getCreditorWidget().on('loadcreditor', this.getCreditorWidget().onLoadCreditor(), this.getCreditorWidget() );
		
		this.app = Tine.Tinebase.appMgr.get('Billing');
		//this.recordProxy = Tine.Billing.creditorBackend;
		this.parentRecordClass = Tine.Addressbook.Model.Contact;
		this.parentRelation = {
			fkey: 'contact_id',
			references: 'id'
		};
		Tine.Billing.CreditorEditRecord.superclass.initComponent.call(this);
		this.on('parentloaded', this.onLoadContact, this);
		this.on('afterrender',this.onAfterRender,this);
		this.on('loadform',this.onLoadCreditor, this);
		// register parent action events
		// this record events are handled by parent class
//    	this.on('beforeaddrecord', this.onBeforeAddRecord, this);
//    	this.on('addrecord', this.onAddRecord, this);
      	this.registerGridEvent('addparentrecord',this.onAddBilling, this);
    	this.registerGridEvent('editparentrecord',this.onEditBilling, this);
	},
	initChildPanels: function(){
		//this.registerChildPanel('ArticleSupplierEditRecord', Tine.Billing.getBillingEditRecordAsTab());
	},
	initWidgets: function(){
		this.getCreditorWidget();
	},
	onLoadContact: function(contactRecord){
		var options = {
			success: this.onLoadCreditorByContactId, 
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
	onLoadCreditorByContactId: function(response){
		var creditorRecord;
		if(response.success && response.totalRecords == 1){
			var resultRecord = response.records[0];
			creditorRecord = new Tine.Billing.Model.Creditor(resultRecord.data, resultRecord.id);
			this.articleSupplierGrid.enable();
		}else{
			creditorRecord = new Tine.Billing.Model.Creditor({}, 0);
			this.articleSupplierGrid.disable();
		}
		this.record = creditorRecord;
		this.showRecord(this.record);
	},
	onBeforeAddRecord: function(record){
		// parent record picker in this form -> unload parent, oterwise addRecord will fail
		//this.unloadParent();
		Tine.Billing.CreditorEditRecord.superclass.onBeforeAddRecord.call(this);
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

	getFormContents: function(){
		this.dependentPanel = new Ext.TabPanel({
			border: false,
			autoDestroy:true,
			layoutOnTabChange: true,
			forceLayout:true,
			activeTab:0,
			items:[
			 	this.articleSupplierGrid
    	   ]
		});
		this.formItemsPanel = Tine.Billing.getCreditorFormItems();
		return {
			xtype:'panel',
			title: 'Kreditor Stammdaten',
			region:'center',
			layout:'border',
			items:[
				{
				    xtype: 'panel',
				    region:'center',
				    border: false,
				    autoScroll:true,
				    height:140,
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
		//return Tine.Billing.getBillingMasterEditDialogPanel(this.getComponents());
		//return Tine.Billing.getCreditorFormItems();
	},
	initDependentGrids: function(){
		this.articleSupplierGrid = new Tine.Billing.ArticleSupplierGridPanel({
			title:'Lieferartikel',
			layout:'fit',
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing'),
			perspective: Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_CREDITOR
		});
	},
	onLoadCreditor: function(){
		this.articleSupplierGrid.loadCreditor(this.record);
		if(this.record.id !== 0){
			this.articleSupplierGrid.enable();
		}
		if(this.creditorWidget){
			try{
				this.creditorWidget.onLoadCreditor(this.record);
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
  				xtype:'creditorselectiongrid',
  				title:'Lieferanten',
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
			case 'ddGroupCreditor':
				var source = data.selections[0];
				record = source;
				break;
				
			case 'ddGroupGetCreditor':
				if(source.getCreditor !== undefined && typeof(source.getCreditor)==='function'){
					record = source.getCreditor();
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
		getCreditorWidget: function(){
			if(!this.creditorWidget){
				this.creditorWidget = new Tine.Billing.CreditorWidget({
						region: 'north',
						layout:'fit',
						height:40,
						editDialog: this
				});
			}
			return this.creditorWidget;
		}
	
});

Tine.Billing.getCreditorFormItems = function(){
	var fields = Tine.Billing.CreditorFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		tbar: new Ext.Toolbar({id:'billing-creditor-edit-dialog-panel-toolbar-tb',height:26}),
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,
		   	 	fields.contact_id                    
		   	],[
		   	   	fields.creditor_nr
		   	]]}
		]
	}];
};

Ext.ns('Tine.Billing.CreditorFormFields');

Tine.Billing.CreditorFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'creditor_id',name:'id'},
		contact_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 250,
				fieldLabel: 'Kontakt Lieferant',
			    id:'creditor_contact_id',
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
		creditor_nr:
			{
		    	xtype:'processtriggerfield',
		    	fieldLabel: 'Kreditor-Nr', 
			    id:'creditor_creditor_nr',
			    name:'creditor_nr',
		    	disabledClass: 'x-item-disabled-view',
		    	allowBlank:false,
		    	blurOnSelect: true,
		 	    width:250
		 	}
	};
};