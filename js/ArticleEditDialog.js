Ext.namespace('Tine.Billing');

Tine.Billing.ArticleEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priarticlee
	 */
	windowNamePrefix: 'ArticleEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Article,
	recordProxy: Tine.Billing.articleBackend,
	loadRecord: false,
	evalGrants: false,
	initComponent: function(){
		Tine.Billing.getVatStore();
		this.initStockFlowButtons();
		this.initWidgets();
		this.initDependentGrids();
		this.on('load',this.onLoadArticle, this);
		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.ArticleEditDialog.superclass.initComponent.call(this);
	},
	initStockFlowButtons: function(){
        this.action_addStockFlowInc = new Ext.Action({
            text: 'Lagerzugang',
			disabled: false,
            handler: this.addStockFlowInc,
            iconCls: 'action_stockFlowInc',
            scope: this
        });
        this.buttonStockFlowInc = Ext.apply(new Ext.Button(this.action_addStockFlowInc), {
                scale: 'small',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_stockFlowInc'
            });
        this.action_addStockFlowInc = new Ext.Action({
            text: 'Lagerabgang',
			disabled: false,
            handler: this.addStockFlowDec,
            iconCls: 'action_stockFlowDec',
            scope: this
        });
        this.buttonStockFlowDec = Ext.apply(new Ext.Button(this.action_addStockFlowInc), {
            scale: 'small',
            rowspan: 2,
            iconAlign: 'top',
            iconCls: 'action_stockFlowDec'
        });
	},
    initButtons: function(){
    	Tine.Billing.ArticleEditDialog.superclass.initButtons.call(this);
    	this.tbar = [
    	     this.buttonStockFlowInc,
    	     this.buttonStockFlowDec
    	];
    	
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },
    onLoadArticle: function(){
    	
		this.articleSupplierGrid.loadArticle(this.record);
		this.articleCustomerGrid.loadArticle(this.record);
		this.sellPriceGrid.loadArticle(this.record);
		this.stockFlowGrid.loadArticle(this.record);
		this.articleSupplyGrid.loadArticle(this.record);
		if(this.record.id !== 0){
			this.articleSupplierGrid.enable();
			this.articleCustomerGrid.enable();
			this.sellPriceGrid.enable();
			this.stockFlowGrid.enable();
			this.articleSupplyGrid.enable();
			if(this.record.get('add_calculation')==1){
				Ext.getCmp('additionForm').expand();
			}else{
				Ext.getCmp('additionForm').collapse();
			}
			
			if(this.record.get('simple_article')==1){
				Ext.getCmp('priceForm').expand();
			}else{
				Ext.getCmp('priceForm').collapse();
				Ext.getCmp('article_add_calculation').hide();
			}
			
			if(this.record.get('creates_donation')==1){
				Ext.getCmp('donationForm').expand();
			}else{
				Ext.getCmp('donationForm').collapse();
			}
		}else{
			Ext.getCmp('article_article_group_id').addListener('select', this.onSelectArticleGroup, this);
			Ext.getCmp('article_article_group_id').addListener('change', this.onSelectArticleGroup, this);
			
			var zeroVat = Tine.Billing.getZeroVat();
			var defaultVat = Tine.Billing.getVatDefault();
			
			Ext.getCmp('article_vat_id').setValue(defaultVat);
			
			Ext.getCmp('article_price2_vat_id').setValue(zeroVat);
			
		}
		
		Ext.getCmp('article_add_calculation').addListener('check', this.toggleAddCalc, this);
		Ext.getCmp('article_simple_article').addListener('check', this.toggleSimple, this);
		Ext.getCmp('article_creates_donation').addListener('check', this.toggleDonation, this);
		
		if(this.articleWidget){
			this.articleWidget.onLoadArticle(this.record);
		}
	},
	toggleAddCalc: function(select){
		var value = select.getValue();
		switch(value){
		case true:
				Ext.getCmp('additionForm').expand();
				
				
			break;
			
		case false:
			Ext.getCmp('additionForm').collapse();
			
			
			break;
		}
	},
	toggleSimple: function(select){
		var value = select.getValue();
		switch(value){
		case true:
				Ext.getCmp('priceForm').expand();
				Ext.getCmp('article_add_calculation').show();
			break;
			
		case false:
			Ext.getCmp('priceForm').collapse();
			Ext.getCmp('article_add_calculation').setValue(0);
			//Ext.getCmp('article_add_calculation').hide();
			this.record.set('add_calculation').setValue(0);
			break;
		}
	},
	toggleDonation: function(select){
		var value = select.getValue();
		switch(value){
		case true:
				Ext.getCmp('donationForm').expand();
			break;
			
		case false:
			Ext.getCmp('donationForm').collapse();
			this.record.set('article_donation_amount').setValue(0);
			break;
		}
	},
	initWidgets: function(){
		this.getArticleWidget();
	},
	/**
	 *  initialize dependent gridpanels
	 */
	initDependentGrids: function(){
		this.articleSupplierGrid = new Tine.Billing.ArticleSupplierGridPanel({
			title:'Lieferantenpreise',
			layout:'fit',
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing'),
			perspective: Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE
		});
		this.articleCustomerGrid = new Tine.Billing.ArticleCustomerGridPanel({
			title:'Kundenpreise',
			layout:'fit',
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing'),
			perspective: Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE
		});		
		this.sellPriceGrid = new Tine.Billing.ArticleSellPriceGridPanel({
			title:'Verkaufspreise',
			layout:'fit',
			frame: true,
			disabled:true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.stockFlowGrid = new Tine.Billing.StockFlowGridPanel({
			title:'Lagerfluss',
			layout:'fit',
			frame: true,
			disabled:true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.articleSupplyGrid = new Tine.Billing.ArticleSupplyGridPanel({
			title:'Lagerbestände',
			layout:'fit',
			frame: true,
			disabled:true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
	},
	addStockFlowInc: function(){
		this.addStockFlow(Tine.Billing.Model.StockFlow.getDefaultDataInc());
	},
	
	addStockFlowDec: function(){
		this.addStockFlow(Tine.Billing.Model.StockFlow.getDefaultDataDec());
	},
	addStockFlow: function(stockFlowData){
		// set article_id: embed this record
		stockFlowData.article_id = this.record;
		stockFlowData.stock_location_id = Tine.Billing.getStockLocationDefault();
		
		var stockFlowRecord = new Tine.Billing.Model.StockFlow(stockFlowData,0);
		
		var win = Tine.Billing.StockFlowEditDialog.openWindow({
			record: stockFlowRecord
			// add listener for updating this dialog
		});
	},
	onSelectArticleGroup: function(el, recArticleGroup){
		Ext.getCmp('article_pos_permitted').setValue(
			recArticleGroup.get('pos_permitted')
		);
		//var articleGroupId = Ext.getCmp('article_article_group_id').getValue();
		
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
			
		// use some fields from brevetation edit dialog
		this.dependentPanel = new Ext.TabPanel({
			border: false,
			autoDestroy:true,
			layoutOnTabChange: true,
			forceLayout:true,
			activeTab:0,
			items:[
			 	this.articleSupplierGrid,
			 	this.articleCustomerGrid,
			 	this.sellPriceGrid,
			 	this.stockFlowGrid,
			 	this.articleSupplyGrid
    	   ]
		});
		this.formItemsPanel = Tine.Billing.getArticleFormItems();
		return {
			xtype:'panel',
			title: 'Artikel Stammdaten',
			region:'center',
			layout:'border',
			items:[
				{
				    xtype: 'panel',
				    region:'center',
				    border: false,
				    autoScroll:true,
				    height:260,
				    frame:true,
				    items: this.formItemsPanel
				},
				{
					xtype:'panel',
					region:'south',
					header:false,
					height: 200,
					layout:'fit',
					collapsible:true,
					collapseMode:'mini',
					split:true,
					items:[this.dependentPanel]
				}
				
		]};
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
			case 'ddGroupArticle':
				var source = data.selections[0];
				record = source;
				break;
				
			case 'ddGroupGetArticle':
				if(source.getArticle !== undefined && typeof(source.getArticle)==='function'){
					record = source.getArticle();
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
		getArticleWidget: function(){
			if(!this.articleWidget){
				this.articleWidget = new Tine.Billing.ArticleWidget({
						region: 'north',
						layout:'fit',
						height:40,
						editDialog: this
				});
			}
			return this.articleWidget;
		}
});

//extended content panel constructor
Tine.Billing.ArticleEditDialogPanel = Ext.extend(Ext.Panel, {
	panelManager:null,
	windowNamePrefix: 'ArticleEditWindow_',
	appName: 'Billing',
	layout:'fit',
	bodyStyle:'padding:0px;padding-top:5px',
	forceLayout:true,
	initComponent: function(){
		this.initSelectionGrids();
		
		Ext.apply(this.initialConfig,{region:'center'});
		
		var regularDialog = new Tine.Billing.ArticleEditDialog(this.initialConfig);
		regularDialog.setTitle('Artikel Stammdaten');
		regularDialog.doLayout();
		this.items = this.getItems(regularDialog);
		Tine.Billing.ArticleEditDialogPanel.superclass.initComponent.call(this);
		
	},
	initSelectionGrids: function(){
		this.articleSelectionGrid = new Tine.Billing.ArticleSelectionGridPanel({
			title:'Artikel',
			layout:'border',
			app: Tine.Tinebase.appMgr.get('Billing')
		});
	},
	getItems: function(regularDialog){
		var recordChoosers = [
			this.articleSelectionGrid,
			{
				xtype:'creditorselectiongrid',
				title:'Lieferanten',
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
				 width:460,
				 collapsible:true,
				 bodyStyle:'padding:8px;',
				 split:true,
				 items: recordChoosers
		 };
		return [{
			xtype:'panel',
			layout:'border',
			items:[
			       // display creditor widget north
			       regularDialog.getArticleWidget(),
			       // tab panel containing creditor master data
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
Tine.Billing.ArticleEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 600,
        name: Tine.Billing.ArticleEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ArticleEditDialogPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getArticleFormItems = function(){
	var fields = Tine.Billing.ArticleFormFields.get();
	
	var additionFormComponents = 
	{
		deferredRender:false,
		xtype:'columnform',border:false,items:
		[[
		   fields.price2_netto,
		   fields.price2_vat_id
		]]
	};
	
	var additionForm  = {
    	xtype: 'panel',
    	id:'additionForm',
    	layout:'fit',
    	header:false,
    	width:520,
    	deferredRender:false,
    	collapsible:true,
    	collapsed:true,
    	items:[
    	       additionFormComponents
    	]
    };
	
	var priceFormComponents = 
	{
		xtype:'columnform',border:false,items:
		[[
		  	fields.price_netto
		]]
	};
	
	var priceForm  = {
    	xtype: 'panel',
    	id:'priceForm',
    	layout:'fit',
    	
    	header:false,
    	width:520,
    	collapsible:true,
    	collapsed:true,
    	items:[
    	       priceFormComponents
    	]
    };
	
	var donationFormComponents = null;
	if(Tine.Tinebase.appMgr.isEnabled('Donator')){
		donationFormComponents = 
		{
			xtype:'columnform',border:false,items:
			[[
			  	fields.donation_amount, fields.donation_campaign_id
			]]
		};
	}
	
	var donationForm  = {
    	xtype: 'panel',
    	id:'donationForm',
    	layout:'fit',
    	
    	header:false,
    	width:520,
    	collapsible:true,
    	collapsed:true,
    	items:[
    	       donationFormComponents
    	]
    };
	
	var aCheckboxes = [
	  fields.id,
 	  fields.is_stock_article,
   	  fields.locked,
   	  fields.hidden,
   	  fields.pos_permitted,
   	  fields.simple_article,
   	  fields.add_calculation
   	];
	
	if(Tine.Tinebase.appMgr.isEnabled('Donator')){
		aCheckboxes = aCheckboxes.concat(
		  [
	   	  	fields.creates_donation
	   	  ]
		);
	}
	
	return [{
		xtype:'panel',
		layout:'fit',
		frame:true,
		items:[
			{
			    xtype: 'panel',
			    layout: 'fit',
			    style: {
			        position: 'absolute',
			        width: '200px',
			        height: '200px',
			        left: '345px',
			        top: Ext.isGecko ? '35px' : '48px',
			        'z-index': 100
			    },
			    items: [fields.image]
			},
		   	{xtype:'columnform',border:false,items:
		   	[
		   	 	aCheckboxes,
		   	 [			   	  
		   	  fields.article_nr,
		   	  fields.vat_id
		   	],[		
		   	  fields.article_ext_nr,
	  		  fields.article_group_id	
	  		
	  		],[	  		  
	  		  fields.article_series_id,
	     	  fields.article_unit_id
			],[     
		   	   fields.name
		   	],[
		   	   priceForm
		   	],[
		   	   donationForm
		   	],[
		   	   additionForm
		   	   
		   //	],[
		   //	   fields.ek1,
		   //	   fields.ek2
		   	],[
		   	   fields.description
		   	],[
		   	   fields.comment
		   	],[
		   	   fields.weight,
		   	   fields.dimensions
		   	],[
		   	   fields.stock_amount_total,
		   	   fields.stock_amount_min
		   	],[
		   	   fields.rev_account_vat_in,
		   	   fields.rev_account_vat_ex
		   	//],[
		   	//   fields.rev_account_price2_vat_in,
		   	//   fields.rev_account_price2_vat_ex
		   ]]}
		]
	}];
};		   	                                         

Ext.ns('Tine.Billing.ArticleFormFields');

Tine.Billing.ArticleFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{
	    		xtype:'hidden',
			    id:'article_id',
			    name:'id',
			    width: 1
	    	},
		article_nr:
	    	{
	    		fieldLabel: 'Artikel-Nr',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_article_nr',
			    emptyText:'<automatisch>',
			    disabled:false,
			    name:'article_nr',
			    value:null,
			    width: 150
	    	},	    	
		article_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Artikelgruppe',
			    id:'article_article_group_id',
			    name:'article_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleGroup,
			    allowBlank:false
			}),
		article_series_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Serie',
			    id:'article_article_series_id',
			    name:'article_series_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleSeries,
			    allowBlank:true
			}),
		vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt',
			    id:'article_vat_id',
			    name:'vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:false
			}),			
		article_unit_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Einheit',
			    id:'article_article_unit_id',
			    name:'article_unit_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleUnit,
			    allowBlank:false
			}),
		article_ext_nr:
	    	{
	    		fieldLabel: 'Artikel-Nr 2',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_article_ext_nr',
			    name:'article_ext_nr',
			    value:null,
			    width: 150
	    	},
		name:
	    	{
	    		fieldLabel: 'Bezeichnung',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_name',
			    name:'name',
			    value:null,
			    width: 400
	    	},
		description:
			{
				xtype: 'textarea',
				fieldLabel: 'Beschreibung',
				disabledClass: 'x-item-disabled-view',
				id:'article_description',
				name:'description',
				width: 400,
				height: 60
			},
		comment:
			{
				xtype: 'textarea',
				fieldLabel: 'Bemerkung',
				disabledClass: 'x-item-disabled-view',
				id:'article_comment',
				name:'comment',
				width: 400,
				height: 60
			},
		image: 
			new Ext.ux.form.ImageField({
		    	id:'article_jpegphoto',
		        name: 'jpegphoto',
		        width: 100,
		        height: 100,
		        ratiomode: 1,
		        imageField:true
			}),
		weight:
	    	{
				xtype:'numberfield',
				decimalPrecision: 4,
				decimalSeparator:',',
	    		fieldLabel: 'Gewicht (kg)',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_weight',
			    name:'weight',
			    value:null,
			    width: 150
	    	},
		dimensions:
	    	{
	    		fieldLabel: 'Abmessungen',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_dimensions',
			    name:'dimensions',
			    value:null,
			    width: 150
	    	},	
	   	is_stock_article:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_is_stock_article',
				name: 'is_stock_article',
				hideLabel:true,
			    boxLabel: 'ist Lagerartikel',
			    width: 150
			},
		locked:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_locked',
				name: 'locked',
				hideLabel:true,
			    boxLabel: 'gesperrt',
			    width: 150
			},
		hidden:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_hidden',
				name: 'hidden',
				hideLabel:true,
			    boxLabel: 'versteckt',
			    width: 150
			},			
		stock_amount_total:
	    	{
	    		fieldLabel: 'Lagerbestand gesamt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_stock_amount_total',
			    name:'stock_amount_total',
			    disabled:true,
			    value:null,
			    width: 150
	    	},
		stock_amount_min:
	    	{
	    		fieldLabel: 'Lagerbestand Minimum',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_stock_amount_min',
			    name:'stock_amount_min',
			    value:null,
			    width: 150
	    	},
	    rev_account_vat_in:
	   		Tine.Billing.Custom.getRecordPicker('AccountSystem', 'article_rev_account_vat_in',
	   	    		{
	   			fieldLabel: 'Erlöskonto mit MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_vat_in',
			    name:'rev_account_vat_in',
	   	    		    width: 200,
	   	    		 allowBlank:true,
	   	    		    displayFunc:'getTitle'
	   	    		}),
	    	/*{
	    		fieldLabel: 'Erlöskonto mit MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_vat_in',
			    name:'rev_account_vat_in',
			    value:null,
			    width: 150
	    	},*/
	   	rev_account_vat_ex:
	   		Tine.Billing.Custom.getRecordPicker('AccountSystem', 'article_rev_account_vat_ex',
	   	    		{
	   			fieldLabel: 'Erlöskonto ohne MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_vat_ex',
			    allowBlank:true,
			    name:'rev_account_vat_ex',
	   	    		    width: 200,
	   	    		    displayFunc:'getTitle'
	   	    		}),
	    	/*{
	    		fieldLabel: 'Erlöskonto ohne MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_vat_ex',
			    name:'rev_account_vat_ex',
			    value:null,
			    width: 150
	    	},	*/
	    pos_permitted:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_pos_permitted',
				name: 'pos_permitted',
				hideLabel:true,
			    boxLabel: 'für Kassenerfassung',
			    width: 150
			},
			
		simple_article:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_simple_article',
				name: 'simple_article',
				hideLabel:true,
			    boxLabel: 'einfacher Artikel',
			    width: 150
			},	
		add_calculation:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_add_calculation',
				name: 'add_calculation',
				hideLabel:true,
				boxLabel: 'hat Zuschlag',
			    width: 150
			},	
		price2_vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt für Zuschlag',
			    id:'article_price2_vat_id',
			    lazyInit:true,
			    hideMode:'offsets',
			    lazyRender:true,
			    name:'price2_vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:true
			}),	
			
		price_netto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Preis netto', 
			    id:'article_price_netto',
			    name:'price_netto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:180
		 	},	
		price2_netto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Zuschlag netto', 
			    id:'article_price2_netto',
			    name:'price2_netto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:180
		 	},	
		 ek1:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'EK(1)', 
			    id:'article_ek1',
			    name:'ek1',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:180
		 	},	
		 ek2:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'EK(2)', 
			    id:'article_ek2',
			    name:'ek2',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	width:180
			},
		rev_account_price2_vat_in:
			Tine.Billing.Custom.getRecordPicker('AccountSystem', 'article_rev_account_price2_vat_in',
    		{
				fieldLabel: 'Erlöskto Zuschl. mit MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_price2_vat_in',
			    name:'rev_account_price2_vat_in',
    		    width: 200,
    		    allowBlank:true,
    		    displayFunc:'getTitle'
    		}),
	    	/*{
	    		fieldLabel: 'Erlöskto Zuschl. mit MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_price2_vat_in',
			    name:'rev_account_price2_vat_in',
			    value:null,
			    width: 150
	    	},*/
	   	rev_account_price2_vat_ex:
	   		Tine.Billing.Custom.getRecordPicker('AccountSystem', 'article_rev_account_price2_vat_ex',
	   	    		{
			   			fieldLabel: 'Erlöskto Zuschl. ohne MwSt',
					    disabledClass: 'x-item-disabled-view',
					    id:'article_rev_account_price2_vat_ex',
					    name:'rev_account_price2_vat_ex',
					    allowBlank:true,
	   	    		    width: 200,
	   	    		    displayFunc:'getTitle'
	   	    		}),
    	creates_donation:		    
			{
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'article_creates_donation',
				name: 'creates_donation',
				hideLabel:true,
			    boxLabel: 'Teilspende',
			    width: 150
			},		 
		donation_amount:
		 	{
				xtype:'monetarynumfield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Spendenbetrag',
				id:'article_donation_amount',
				name:'donation_amount',
				width: 150
			},
		donation_campaign_id:
			 Tine.Donator.Custom.getRecordPicker('Campaign','article_donation_campaign_id',{
		    	fieldLabel: 'Kampagne',
		    	disabledClass: 'x-item-disabled-view',
		    	name: 'donation_campaign_id',
			    appendFilters: [{field: 'is_closed', operator: 'equals', value: false }],
			    disabled: false,
			    width:250,
			    onAddEditable: true,
			    onEditEditable: false,
			    blurOnSelect: true,
			    allowBlank:true
			})
	    	/*{
	    		fieldLabel: 'Erlöskto Zuschl. ohne MwSt',
			    disabledClass: 'x-item-disabled-view',
			    id:'article_rev_account_price2_vat_ex',
			    name:'rev_account_price2_vat_ex',
			    value:null,
			    width: 150
	    	},	*/
		};
	};