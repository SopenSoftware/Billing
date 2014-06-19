Ext.namespace('Tine.Billing');

Tine.Billing.ExpArticleDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'ExpArticleWindow_',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
	//recordClass: Tine.Billing.Model.SoMember,
	predefinedFilter: null,
	/**
	 * {Tine.Billing.CreateTLAccountGridPanel}	positions grid
	 */
	grid: null,
	actionType: 'print', // alternative: 'csv'
	customExportDefinition:null,
	/**
	 * initialize component
	 */
	initComponent: function(){
		this.title = this.initialConfig.panelTitle;
		this.actionType = this.initialConfig.actionType;
		this.initActions();
		this.initToolbar();
		this.items = this.getFormItems();
		//this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.ExpArticleDialog.superclass.initComponent.call(this);
	},
//	this.onAfterRender: function(){
//		switch(this.actionType){
//		case 'printMembers':
//			
//			break;
//		}
//	},
	setFilter: function(filter){
		this.filterPanel.setValue(filter);
	},
	initActions: function(){
        this.actions_print = new Ext.Action({
            text: 'Ok',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.doCall,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_cancel = new Ext.Action({
            text: 'Abbrechen',
            disabled: false,
            iconCls: 'action_cancel',
            handler: this.cancel,
            scale:'small',
            iconAlign:'left',
            scope: this
        });        
	},
	doCall: function(){
		switch(this.actionType){
		case 'print':
			this.customExport();
			break;
		case 'customExport':
			this.customExport();
			break;
		}
	},
	/**
	 * init bottom toolbar
	 */
	initToolbar: function(){
		this.bbar = new Ext.Toolbar({
			height:48,
        	items: [
        	        '->',
                    Ext.apply(new Ext.Button(this.actions_cancel), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    }),
                    Ext.apply(new Ext.Button(this.actions_print), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    })
                ]
        });
	},
	customExport: function(){
		var fields = null;
		
		try{
			if(Tine.Billing.Config.Export.Article.Fields){
				fields = Ext.util.JSON.encode(Tine.Billing.Config.Export.Article.Fields);
			}
		}catch(e){
			//
		}
	
        var data = {
        	grouping:{
        		debitor_group: Ext.getCmp('classify_debitor_group').getValue(),
        		debitor: Ext.getCmp('classify_debitor').getValue(),
        		article_group: Ext.getCmp('classify_article_group').getValue()
        	},
        	timeframe:{
        		begin:  Ext.getCmp('begin_datetime').getValue(),
        		end:  Ext.getCmp('end_datetime').getValue()
        	},
    		//debitorFilter: Ext.util.JSON.encode(this.debitorFilterPanel.getValue()),
    		articleFilter: Ext.util.JSON.encode(this.articleFilterPanel.getValue()),
    		/*debitorSort: {
    			field: 	Ext.getCmp('debitor_sortfield1').getValue(),
    			dir: 	Ext.getCmp('debitor_sortfield1_dir').getValue()
    		},*/
    		articleSort: {
    			field: 	Ext.getCmp('article_sortfield1').getValue(),
    			dir: 	Ext.getCmp('article_sortfield1_dir').getValue()
    		},
    		fields: fields
        };
     
		var downloader = new Ext.ux.file.Download({
            params: {
                method: 'Billing.runArticleSellListExport',
                requestType: 'HTTP',
                data:  Ext.util.JSON.encode(data),
                exportType: Ext.getCmp('result_type').getValue()
            }
        }).start();
	},
	/**
	 * Cancel and close window
	 */
	cancel: function(){
		this.purgeListeners();
        this.window.close();
	},
	
	getAdditionalFormItems: function(){
		return [
		        
			{
			    fieldLabel: 'Ausgabeformat',
			    disabledClass: 'x-item-disabled-view',
			    allowEdit:false,
			    id:'result_type',
			    name:'result_type',
			    width: 200,
			    xtype:'combo',
			    store:[['PDF','Pdf'],['CSV','Csv']],
			    value: 'CSV',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},{
				xtype: 'fieldset',
				title: 'Gliederungselemente',
				width:250,
				height:150,
				items:[
						{
							xtype:'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'classify_debitor_group',
							name: 'classify_debitor_group',
							hideLabel:true,
							boxLabel: 'Gliederung Kundengruppe',
						    width:180
						},{
							xtype:'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'classify_debitor',
							name: 'classify_debitor',
							hideLabel:true,
							boxLabel: 'Gliederung Kunde',
						    width:180
						},{
							xtype:'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'classify_article_group',
							name: 'classify_article_group',
							hideLabel:true,
							boxLabel: 'Gliederung Artikelgruppe',
						    width:180
						}/*,{
							xtype:'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'classify_article_series',
							name: 'classify_article_series',
							hideLabel:true,
							boxLabel: 'Gliederung Serie',
						    width:180
						}*/
					]
				},{
				xtype: 'fieldset',
				title: 'Zeitraum/Stichtag',
				width:250,
				height:150,
				items:[
					{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'begin_datetime',
						name: 'begin_datetime',
						value: new Date(),
						fieldLabel: 'Stichtag/Beginn Zeitraum',
					    width:180
					},{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'end_datetime',
						name: 'end_datetime',
						fieldLabel: 'Zeitraum Ende',
					    width:180
					}
				]
			}      
		        
		];
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		switch(this.actionType){
		case 'printMembers':
			return this.getExpMembersFormItems();
			break;
		case 'exportMembersAsCsv':
		
			break;
		case 'customExport':
			return this.getExpMembersFormItems();
		}
		// use some fields from brevetation edit dialog
		
	},
	
	getExpMembersFormItems: function(){
		var formItems = [
		                 {xtype:'hidden',id:'filters', name:'filters', width:1}
		];
		
		var panel = {
	        xtype: 'panel',
	        border: false,
	        region:'north',
	        autoScroll:true,
	        height:160,
	        split:true,
	        frame:true,
	        layout:'border',
	        items:[{
	        	xtype:'panel',
	        	region:'center',
	        	height:200,
	        	items:[{
	    		   xtype:'columnform',
	    		   items:  [this.getAdditionalFormItems()]
	        	}]
    	    }]
	    };

		if(this.predefinedFilter == null){
			this.predefinedFilter = [];
		}
		/*this.debitorFilterPanel = new Tine.widgets.form.FilterFormField({
		 	id:'dfp',
	    	filterModels: Tine.Billing.Model.Debitor.getFilterModel(),
	    	defaultFilter: 'query',
	    	region:'center'
		});*/
		this.articleFilterPanel = new Tine.widgets.form.FilterFormField({
		 	id:'afp',
	    	filterModels: Tine.Billing.Model.ArticleSold.getFilterModel(),
	    	defaultFilter: 'query',
	    	region:'center'
		});
		
		
		var articleSortStore = 
		[
		   ['article_nr','Artikel-Nr'],
		   ['article_ext_nr','Artikel-Nr2'],
		   ['name','Bezeichnung'],
		   ['amount','Verkaufte Menge'],
		   ['total_netto','Gesamt netto'],
		   ['total_brutto','Gesamt brutto'],
		   ['date1','1.Verkaufstag'],
		   ['date2','Letzter Verkaufstag'],
		   ['UNDEFINED','---']
		];
		
		var wrapper = {
			xtype: 'panel',
			layout: 'border',
			frame: true,
			items: [
			   panel,
			   {
				   xtype:'panel',
				   layout:'vbox',
				   region:'center',
				   items:[
						/*{
							xtype: 'panel',
							title: 'Selektion Kunde',
							height:120,
							collapsible:true,
							id:'debitorFilterPanel',
							region:'north',
							autoScroll:true,
							flex:1,
							layout:'border',
							items: 	[
							       	 
							       	 {
							       		 xtype:'columnform',
							       		 region:'north',
							       		 anchor:'100%',
							       		 height:38,
							       		 items:[[
											{
											    fieldLabel: 'Sortierung1',
											    disabledClass: 'x-item-disabled-view',
											    allowEdit:false,
											    id:'debitor_sortfield1',
											    name:'debitor_sortfield1',
											    width: 140,
											    xtype:'combo',
											    store:[['debitor_nr','Debitor-Nr'],['n_family','Nachname'],['org_name','Firma'],['UNDEFINED','---']],
											    value: 'debitor_nr',
												mode: 'local',
												displayField: 'name',
											    valueField: 'id',
											    triggerAction: 'all'
											},{
											    fieldLabel: 'Richtung',
											    disabledClass: 'x-item-disabled-view',
											    allowEdit:false,
											    id:'debitor_sortfield1_dir',
											    name:'debitor_sortfield1_dir',
											    width: 100,
											    xtype:'combo',
											    store:[['ASC','aufsteigend'],['DESC','absteigend']],
											    value: 'ASC',
												mode: 'local',
												displayField: 'name',
											    valueField: 'id',
											    triggerAction: 'all'
											}
							       		 ]]
							       	 },
							       	 this.debitorFilterPanel
							       	 
							       	
							]
						},*/{
							xtype: 'panel',
							title: 'Selektion Artikel',
							height:120,
							id:'articleFilterPanel',
							region:'center',
							flex:1,
							autoScroll:true,
							layout:'border',
							items: 	[
								{
										 xtype:'columnform',
										 region:'north',
										 anchor:'100%',
										 height:38,
										 items:[[
										{
									    fieldLabel: 'Sortierung1',
									    disabledClass: 'x-item-disabled-view',
									    allowEdit:false,
									    id:'article_sortfield1',
									    name:'article_sortfield1',
									    width: 140,
									    xtype:'combo',
									    store:articleSortStore,
									    value: 'article_nr',
										mode: 'local',
										displayField: 'name',
									    valueField: 'id',
									    triggerAction: 'all'
									},{
									    fieldLabel: 'Richtung',
									    disabledClass: 'x-item-disabled-view',
									    allowEdit:false,
									    id:'article_sortfield1_dir',
									    name:'article_sortfield1_dir',
									    width: 100,
									    xtype:'combo',
									    store:[['ASC','aufsteigend'],['DESC','absteigend']],
									    value: 'ASC',
										mode: 'local',
										displayField: 'name',
									    valueField: 'id',
									    triggerAction: 'all'
									}
										 ]]
									 },
							    this.articleFilterPanel
							]
						}
						
				   ]
			   }
			   
			]
		
		};
		return wrapper;
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.ExpArticleDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	record = {};
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 650,
        name: Tine.Billing.ExpArticleDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ExpArticleDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};