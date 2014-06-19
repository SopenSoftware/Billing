Ext.ns('Tine.Billing');

Tine.Billing.DirectOrderPositionGridPanel = Ext.extend(Tine.widgets.grid.EditorGridPanel, {
	stateFull:true,
	id: 'tine-billing-direct-order-grid-panel',
	stateId: 'tine-billing-direct-order-grid-panel-state-id',
	recordClass: Tine.Billing.Model.OrderPosition,
	clicksToEdit: 'auto',
	loadMask: true,
	quickaddMandatory: 'article_id',
	autoExpandColumn: 'article_id',
	forceFit:false,
	initComponent: function(){
		//this.articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
		//this.articleStore.reload();
		//this.priceGroupStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
		//this.priceGroupStore.reload();
		this.initColumnModel();
		this.on('newentry',this.onAddEntry, this);
		this.on('validateedit', this.onEditEntry, this);
		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.DirectOrderPositionGridPanel.superclass.initComponent.call(this);
	},
	
	initColumnModel: function(){
		this.expander = new Ext.ux.grid.RowExpander({
			fixed:true,
			tpl : new Ext.Template(
            	'<p><b>Artikel-Nr:</b> {article_nr}</p>',
                '<p><b>Artikel-Nr2:</b> {article_ext_nr}</p>',
                '<p><b>Beschreibung:</b> {description}</p>'
            ),
            /**
             * redirect record to "inner record": article_record 
             */
            getBodyContent : function(record, index){
            	record = record.getForeignRecord(Tine.Billing.Model.Article, 'article_id');
            	
                if(!this.enableCaching){
                    return this.tpl.apply(record.data);
                }
                var content = this.bodyContent[record.id];
                if(!content){
                    content = this.tpl.apply(record.data);
                    this.bodyContent[record.id] = content;
                }
                return content;
            }
        });
		var summary = new Ext.ux.grid.GridSummary();
		this.plugins = [this.expander,summary];
		this.cm = this.getColumnModel();
	},
	getRowCount: function(){
		return this.store.getCount();
	},
	loadDebitorData: function(data){
		if(data.orderRecord !== undefined){
			this.orderRecord = data.orderRecord;
		}
		if(data.receiptRecord !== undefined){
			this.receiptRecord = data.receiptRecord;
		}
		try{
			this.debitorRecord = data.debitorRecord;
		}catch(e){
			this.debitorRecord = null;
			this.debitorId = null;
		}
		this.contactRecord = data.contactRecord;
		if(this.debitorRecord){
			this.priceGroupId = this.debitorRecord.getForeignId('price_group_id');
			this.debitorId = this.debitorRecord.get('id');
		}else{
			this.priceGroupId = data.priceGroupId;
		}
		
	},
	/**
	 * When entry is added to the store
	 * create new add line at once - this has to be a mass grid
	 */
	onAddEntry: function(data){
		//this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
		return true;
	},
    onNewentry: function(recordData) {
        // add new record to store
    	if(recordData.article_id){
    		//var articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
    		recordData.article_record = this.articleStore.getAt(this.articleStore.findExact('id',recordData.article_id));
    	}
    	
    	// debitor id maybe null - ok
    	var prices = recordData.article_record.getPrices(this.debitorId, this.priceGroupId);
    	
    	var newRecord = Tine.Billing.Model.OrderPosition.getFromArticle(recordData.article_record);
    	
    	if(!recordData.amount){
    		recordData.amount = 1;
    	}
    	
    	if(this.perspective == 'receipt' && this.receiptRecord.get('type')=='CREDIT' && recordData.amount>0){
    		recordData.amount *= (-1);
    	}
    	
		recordData.price_netto = prices.price_netto;
		recordData.price_brutto = prices.price_brutto;
		
		recordData.price2_netto = prices.price2_netto;
		recordData.price2_brutto = prices.price2_brutto;
		
		recordData.vat_id = null;
		// if debitor record has set vat 0 (e.g. foreign country)
		// set vat_id of position to 0 too!
		var debitorVat =  this.debitorRecord.getForeignRecord(Tine.Billing.Model.Vat, 'vat_id');
		if(!debitorVat){
			debitorVat = Tine.Billing.getVatDefault();
		}
		if(debitorVat && debitorVat.getValue()==0){
			recordData.vat_id = debitorVat;
		}else{
			// otherwise take vat from article
			recordData.vat_id = recordData.article_record.getForeignRecord(Tine.Billing.Model.Vat, 'vat_id');
		}
		
		if(record.data.price2_vat_id){
			recordData.price2_vat_id = recordData.article_record.getForeignRecord(Tine.Billing.Model.Vat, 'price2_vat_id');
		}else{
			recordData.price2_vat_id =  Tine.Billing.getZeroVat();
		}
		
		recordData.price_group_id = this.debitorRecord.data.price_group_id;
	
    	// precalculate: hack
    	//var newRecord = new this.recordClass(Ext.apply(this.recordClass.getDefaultData(), recordData));
    	Ext.apply(newRecord.data, recordData);
		newRecord.calculate();
	 	Tine.Billing.DirectOrderPositionGridPanel.superclass.onNewentry.call(this,newRecord.data);
		
	 	this.getColumnModel().getColumnById('article_id').quickaddField.setValue(null);
       	this.getColumnModel().getColumnById('amount').quickaddField.setValue(0);
       	
       	return true;
    },
    inspectAdd: function(record){
    	record.calculate();
    },
//    addNewItem: function(newRecord){
//    	Tine.Billing.DirectOrderPositionGridPanel.superclass.onNewentry.call(this,newRecord.data);
//    },
    onEditEntry: function(e){
    	// !! take care: every change within the record causes a record.commit in the background
    	// means the changes get stored multiply!! Don't flatten the original record, as this means changes too!
    	
    	switch(e.field){
    	case 'amount':
    	case 'price_brutto':
    	case 'price_netto':
    	case 'price2_brutto':
    	case 'price2_netto':
    	case 'discount_percentage':
    	case 'add_percentage':
    	case 'price_group_id':
    	case 'vat_id':
    	case 'price2_vat_id':
    		e.record.data[e.field] = e.value;
    		break;
    	}
    	
    	//e.record.data[e.field] = e.value;
		var priceGroupId = e.record.getForeignId('price_group_id');
		
		var articleRecord = e.record.getForeignRecord(Tine.Billing.Model.Article,'article_id');
		//var articleId = articleRecord;
		if(!articleRecord){
			articleRecord = this.articleStore.getAt(this.articleStore.findExact('id',e.record.data.article_id));
		}
		e.record.data.article_record = articleRecord;
		e.record.data.price_group_id = Tine.Billing.getPriceGroupById(priceGroupId);
		e.record.data.vat_id = Tine.Billing.getVatById(e.record.data.vat_id);
		
    	if(this.perspective == 'receipt' && this.receiptRecord.get('type')=='CREDIT' && e.record.data.amount>0){
    		e.record.data.amount *= (-1);
    	}
    	switch(e.field){
    	case 'price_group_id':
			var prices = articleRecord.getPrices(this.debitorId, priceGroupId);
			e.record.data.price_netto = prices.price_netto;
			e.record.data.price_brutto = prices.price_brutto;
    	case 'price_netto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO);
    		break;
    	case 'price_brutto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
    		break;
    	case 'price2_netto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO);
    		break;
    	case 'price2_brutto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
    		break;
    	default:
    		e.record.calculate();
    	}
   		this.getView().refresh();
    	return true;
    },
    
    isValidNewEntry: function(newRecord){
    	if(!this.checkAmount( newRecord )){
    		return false;
    	}
    	if(!this.checkArticleNumber( newRecord )){
    		return false;
    	}
    	return true;
    },
	getColumnModel: function() {
		var columns = [
            new Ext.grid.RowNumberer({width: 30}),
            this.expander,
            { 
            	id: 'article_id', header: 'Artikel', dataIndex: 'article_id', width: 300,
			   	renderer: Tine.Billing.renderer.articleRenderer,
			   	resizable:true,
			   	width:300,
			   	sortable:false, 
			   	//editor: Tine.Billing.Custom.getRecordPicker('Article', 'articleEditor'),
			   	quickaddField:Tine.Billing.Custom.getRecordPicker('Article', 'articleAdd',{
			   		width:300
			   	})
            },
            { 
            	id: 'amount', header: 'Menge', dataIndex: 'amount',
            	width:100,
            	quickaddField: 
            			new Ext.form.TextField({
	            		 	xtype:'textfield',
		    				disabledClass: 'x-item-disabled-view',
		    			    allowBlank:true,
		    			    name: 'amount',
		    			    width:100
		    			}),
            	 editor: 
            	 	new Ext.form.TextField({
            		 	xtype:'textfield',
	    				disabledClass: 'x-item-disabled-view',
	    			    allowBlank:true,
	    			    name: 'amount',
	    			    width:100
	    			})
            },{ 
			   id: 'price_netto', header: 'Preis netto', dataIndex: 'price_netto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   resizable:false,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })/*,
			   quickaddField: new Sopen.CurrencyField({
				   emptyText: 'Preis eingeben',
		            allowBlank:false
		        })*/
            },{ 
			   id: 'price_brutto', header: 'Preis brutto', dataIndex: 'price_brutto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })/*,
			   quickaddField: new Sopen.CurrencyField({
				   emptyText: 'Preis eingeben',
		            allowBlank:false
		        })*/
            },{ 
			   	id: 'vat_id', 
			   	header: 'MwSt', 
			   	width:100, 
			   	dataIndex: 'vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('Vat', 'vatEditor'),
			   	quickaddField:Tine.Billing.Custom.getRecordPicker('Vat', 'vatAdd',{selectedRecord: Tine.Billing.getVatDefault()})
		   },{ 
			   id: 'price2_netto', header: 'Zuschlag netto', dataIndex: 'price2_netto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   hidden:true,
			   resizable:false,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Zuschlag eingeben',
		            allowBlank:false
		        })/*,
			   quickaddField: new Sopen.CurrencyField({
				   emptyText: 'Preis eingeben',
		            allowBlank:false
		        })*/
            },{ 
			   id: 'price2_brutto', header: 'Zuschlag brutto', dataIndex: 'price2_brutto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   hidden:true,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Zuschlag eingeben',
		            allowBlank:false
		        })/*,
			   quickaddField: new Sopen.CurrencyField({
				   emptyText: 'Preis eingeben',
		            allowBlank:false
		        })*/
            },{ 
			   	id: 'price2_vat_id', 
			   	header: 'MwSt Zuschlag', 
			   	hidden:true,
			   	width:100, 
			   	dataIndex: 'price2_vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('Vat', 'vatEditor'),
			   	quickaddField:Tine.Billing.Custom.getRecordPicker('Vat', 'vatAdd',{selectedRecord: Tine.Billing.getVatDefault()})
		   },{ 
			   	id: 'price_group_id', 
			   	header: 'Preisgruppe', 
			   	width:100, 
			   	dataIndex: 'price_group_id', 
			   	renderer: Tine.Billing.renderer.priceGroupRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('PriceGroup', 'priceGroupEditor'),
			   	quickaddField:Tine.Billing.Custom.getRecordPicker('PriceGroup', 'priceGroupAdd',{selectedRecord: Tine.Billing.getPriceGroupDefault()})
		   },{
			    id:'discount_percentage',
			    dataIndex:'discount_percentage',
			    renderer: Ext.ux.PercentRenderer,
			    header: 'Rabatt %',
			    editor: new Ext.ux.PercentCombo({
	                autoExpand: true,
	                blurOnSelect: true
	            }),
	            quickaddField: new Ext.ux.PercentCombo({
	                autoExpand: true
	            })
		 	},{ 
				   id: 'total_netto', header: 'ges. netto', dataIndex: 'total_netto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total_brutto', header: 'ges. brutto', dataIndex: 'total_brutto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total2_netto', header: 'Zuschl.ges. netto', dataIndex: 'total2_netto', sortable:false, hidden:true,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total2_brutto', header: 'Zuschl.ges. brutto', dataIndex: 'total2_brutto', sortable:false, hidden:true,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
            	id: 'comment', header: 'Bemerkung', dataIndex: 'comment',
            	quickaddField: 
            			new Ext.form.TextField({
	            		 	xtype:'textfield',
		    				disabledClass: 'x-item-disabled-view',
		    			    allowBlank:true,
		    			    name: 'comment'
		    			}),
            	 editor: 
            	 	new Ext.form.TextField({
            		 	xtype:'textfield',
	    				disabledClass: 'x-item-disabled-view',
	    			    allowBlank:true,
	    			    name: 'comment',
	    			})
            },{
			    id:'add_percentage',
			    dataIndex:'add_percentage',
			    renderer: Ext.ux.PercentRenderer,
			    header: 'Zuschlagsatz %',
			    hidden:true,
			    editor: new Ext.ux.PercentCombo({
	                autoExpand: true,
	                blurOnSelect: true
	            }),
	            quickaddField: new Ext.ux.PercentCombo({
	                autoExpand: true
	            })
		 	}
        ];
        if(!this.ccm){
        	this.ccm = new Ext.grid.ColumnModel({ 
                defaults: {
                    sortable: false,
                    resizable: true
                },
                columns: columns
            });
        }
        return this.ccm;
    },
    checkAmount: function( record ){
    	if(!record.get('amount') || record.get('amount') < 0){
    		Ext.Msg.alert(
    			'Fehler', 
                'Bitte geben Sie die Menge ein.'
            );
    		return false;
    	}
    	return true;
    },
    checkArticleNumber: function( record ){
    	return true;
    },
    onArticleInitializeError: function(){
    	this.disable();
    	Ext.Msg.alert(
			'Fehler', 
            'Die Artikel zur Auftragserfassung konnten nicht initialisiert werden.<br/>Bitte schliessen Sie das Fenster.'
        );
    },
    addRecordFromArticle: function(articleRecord){
    	this.aRecord = articleRecord;
    	this.onNewentry({article_id:articleRecord.get('id')});
    	return;
	},
	getValues: function(){
		var result = {
			count: 0,
			sumNetto: 0,
			sumBrutto: 0
		};

		this.store.each(function(record) {                     
            result.count ++;
            result.sumNetto += record.get('total_netto');
            result.sumBrutto += record.get('total_brutto');
        }, this);
        
        return result;
	},
	onAfterRender: function(){
		//this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
    	this.initDropZone();
    },
    initDropZone: function(){
    	if(!this.ddConfig){
    		return;
    	}
		this.dd = new Ext.dd.DropTarget(this.el, {
			scope: this,
			ddGroup     : this.ddConfig.ddGroup,
			notifyEnter : function(ddSource, e, data) {
				this.scope.el.stopFx();
				this.scope.el.highlight();
			},
			onDragOver: function(e,id){
			},
			notifyDrop  : function(ddSource, e, data){
				return this.scope.onDrop(ddSource, e, data);
				//this.scope.addRecordFromArticle(data.selections[0]);
				//this.scope.fireEvent('drop',data.selections[0]);
				return true;
			}
		});
		// self drag/drop
		this.dd.addToGroup(this.gridConfig.ddGroup);
	},
	onDrop: function(ddSource, e, data){
		switch(ddSource.ddGroup){
		// if article gets dropped in: add new receipt position
		case 'ddGroupArticle':
			return this.addRecordFromArticle(data.selections[0]);
			break;
		// if receipt position gets dropped -> swap positions
		case 'ddGroupOrderPosition':
			break;
		}
	}
});

Tine.Billing.QuickOrderGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	stateFull:true,
	id: 'tine-billing-quickorder-grid-panel',
	stateId: 'tine-billing-quickorder-grid-panel-state-id',
	perspective: 'order',
	backendConfig:{
		order:{
			recordClass: Tine.Billing.Model.OrderPosition,
			recordProxy: Tine.Billing.orderPositionBackend
		},
		receipt:{
			recordClass: Tine.Billing.Model.OrderPosition,
			recordProxy: Tine.Billing.receiptPositionBackend
		},
		orderTemplate:{
			recordClass: Tine.Billing.Model.OrderTemplatePosition,
			recordProxy: Tine.Billing.orderTemplatePositionBackend
		}
	},
	storeAtOnce: false,
	evalGrants: false,
	ddConfig:{
    	ddGroup: 'ddGroupArticle'
    },
    defaultSortInfo: {field: 'position_nr', direction: 'ASC'},
    gridConfig: {
    	clicksToEdit: 'auto',
    	loadMask: true,
    	enableDragDrop:true,
        ddGroup: 'ddGroupOrderPosition',
        selfTarget:true,
        ignoreSelf:false,
        //quickaddMandatory: 'article_id',
    	autoExpandColumn: 'article_id'
    },
    showDeleteMask:false,
    orderRecord: null,
    receiptRecord:null,
    orderTemplateRecord:null,
    currentArticleRecord: null,
	initComponent: function(){
		this.addEvents(
			// select row event
			'selectrow'
		);
		var backendConfig;
		switch(this.perspective){
		case 'order':
				backendConfig = this.backendConfig.order;
			break;
		case 'receipt':
				backendConfig = this.backendConfig.receipt;
			break;
		case 'orderTemplate':
			backendConfig = this.backendConfig.orderTemplate;
		break;
		}
		this.recordClass = backendConfig.recordClass;
		this.recordProxy =  backendConfig.recordProxy;

		this.app = Tine.Tinebase.appMgr.get('Billing');
		//this.articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
		//this.articleStore.reload();
		this.priceGroupStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
		this.priceGroupStore.reload();
		
		this.initColumnModel();
		this.initFilterToolbar();
         
	    this.plugins = this.plugins || [];
	    this.plugins.push(this.filterToolbar);     

	    this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.QuickOrderGridPanel.superclass.initComponent.call(this);
		this.grid.on('newentry',this.onNewentry, this);
		if(this.storeAtOnce){
			this.grid.on('afteredit', this.onEditEntry, this);
		}
	},
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.OrderPosition.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []
        });
    },
	initColumnModel: function(){
		var expander = new Ext.ux.grid.RowExpander({
			fixed:true,
			tpl : new Ext.Template(
            	'<p><b>Artikel-Nr:</b> {article_nr}</p>',
                '<p><b>Artikel-Nr2:</b> {article_ext_nr}</p>',
                '<p><b>Beschreibung:</b> {description}</p>'
            ),
            /**
             * redirect record to "inner record": article_record 
             */
            getBodyContent : function(record, index){
            	//this.articleStore.getAt(this.articleStore.findExact('id',recordData.article_id));
            	record = record.getForeignRecord(Tine.Billing.Model.Article, 'article_id');
            	//record = record.data.article_record;
            	
                if(!this.enableCaching){
                    return this.tpl.apply(record.data);
                }
                var content = this.bodyContent[record.id];
                if(!content){
                    content = this.tpl.apply(record.data);
                    this.bodyContent[record.id] = content;
                }
                return content;
            }
        });
		var summary = new Ext.ux.grid.GridSummary();
		this.gridConfig.plugins = [expander,summary];
		this.gridConfig.columns = this.getColumnModel(expander);
	},
	loadDebitorData: function(data){
		if(data.orderRecord !== undefined){
			this.orderRecord = data.orderRecord;
		}
		if(data.receiptRecord !== undefined){
			this.receiptRecord = data.receiptRecord;
		}
		
		if(data.orderTemplateRecord !== undefined){
			this.orderTemplateRecord = data.orderTemplateRecord;
		}
		
		try{
			this.debitorRecord = data.debitorRecord;
		}catch(e){
			this.debitorRecord = null;
			this.debitorId = null;
		}
		this.contactRecord = data.contactRecord;
		if(this.debitorRecord){
			this.priceGroupId = this.debitorRecord.getForeignId('price_group_id');
			this.debitorId = this.debitorRecord.get('id');
		}else{
			this.priceGroupId = data.priceGroupId;
		}
		this.grid.getStore().reload();
	},
	getRowCount: function(){
		return this.store.getCount();
	},
	/*onRowClick: function(grid, row, e) {
		Tine.Billing.QuickOrderGridPanel.superclass.initComponent.call(this);
		return this.fireEvent('selectrow', grid.getSelectionModel());
	},*/
	/**
	 * When entry is added to the store
	 * create new add line at once - this has to be a mass grid
	 */
	onAddEntry: function(data){
		this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
		return true;
	},
    onNewentry: function(recordData) {
    	recordData.article_record = this.currentArticleRecord;
        // add new record to store
//    	if(recordData.article_id){
//    		//var articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
//    		recordData.article_record = this.articleStore.getAt(this.articleStore.findExact('id',recordData.article_id));
//    	}
    	
    	var prices = recordData.article_record.getPrices(this.debitorId, this.priceGroupId);
    	
    	var newRecord = Tine.Billing.Model.OrderPosition.getFromArticle(recordData.article_record);
    	
    	if(!recordData.amount){
    		recordData.amount = 1;
    	}
    	
    	if(this.perspective == 'receipt' && this.receiptRecord.get('type')=='CREDIT' && recordData.amount>0){
    		recordData.amount *= (-1);
    	}
    	
		recordData.price_netto = prices.price_netto;
		recordData.price_brutto = prices.price_brutto;
		
		recordData.vat_id = null;
		// if debitor record has set vat 0 (e.g. foreign country)
		// set vat_id of position to 0 too!
		var debitorVat = null;
		if(this.debitorRecord){
			debitorVat =  this.debitorRecord.getForeignRecord(Tine.Billing.Model.Vat, 'vat_id');
		}
		if(!debitorVat){
			debitorVat = Tine.Billing.getVatDefault();
		}
		if(debitorVat && debitorVat.getValue()==0){
			recordData.vat_id = debitorVat;
		}else{
			// otherwise take vat from article
			recordData.vat_id = recordData.article_record.getForeignRecord(Tine.Billing.Model.Vat, 'vat_id');
		}
		recordData.price_group_id = this.priceGroupId;
		
    	// precalculate: hack
    	//var newRecord = new this.recordClass(Ext.apply(this.recordClass.getDefaultData(), recordData));
    	Ext.apply(newRecord.data, recordData);
		newRecord.calculate();
    	
       	if(this.storeAtOnce){
	       	 var position_nr = this.store.getCount()+1;
	       	newRecord.set('position_nr', position_nr);
	       	switch(this.perspective){
	       	case 'order':
	       		if(this.orderRecord){
		       		newRecord.set('order_id', this.orderRecord.get('id'));
		       	}
		       	newRecord.flatten();
		        Tine.Billing.orderPositionBackend.saveRecord(newRecord, {
		             scope: this,
		             success: function() {
		                 this.loadData(true, true, true);
		             },
		             failure: function () { 
		                 Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save position.')); 
		             }
		         });
		         break;
	       		
	       	case 'receipt':
	       		var receiptId = this.receiptRecord.get('id');
	       		var rType = this.receiptRecord.get('type');
	       		// if its a shipping doc or an invoice or an order confirmation ->
	       		// add the position to the order itself as well!
	       		if((rType =='SHIPPING' || rType =='INVOICE' || rType =='CONFIRM')&& this.orderRecord){
		       		newRecord.set('order_id', this.orderRecord.get('id'));
		       	}
	       		
	       		newRecord.set('receipt_id',receiptId);
	       		newRecord.flatten();
		        Tine.Billing.receiptPositionBackend.saveRecord(newRecord, {
		             scope: this,
		             success: function() {
		                 this.loadData(true, true, true);
		             },
		             failure: function () { 
		                 Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save receipt position.')); 
		             }
		         });
		         break;
	       	case 'orderTemplate':
	       		if(this.orderTemplateRecord){
		       		newRecord.set('order_template_id', this.orderTemplateRecord.get('id'));
		       	}
		       	newRecord.flatten();
		        Tine.Billing.orderTemplatePositionBackend.saveRecord(newRecord, {
		             scope: this,
		             success: function() {
		                 this.loadData(true, true, true);
		             },
		             failure: function () { 
		                 Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save position.')); 
		             }
		         });
		         break;
	       	}
	       
       	}else{
       		//var count = this.store.getCount();
       		this.addNewItem(newRecord);
       		//this.store.insert(count , newRecord);
       		//this.getView().refresh();
       	}
       	
       	//this.grid.getColumnModel().getColumnById('article_id').quickaddField.setValue(null);
       	//this.grid.getColumnModel().getColumnById('amount').quickaddField.setValue(0);
       	
       	return true;
    },
    addNewItem: function(newRecord){
    	var count = this.getGrid().getStore().getCount();
   		newRecord.id = count + 1;
   		newRecord.set('position_nr', newRecord.id);
   		
   		this.getGrid().getStore().add([newRecord]);
    },
    onEditEntry: function(e){
    	// !! take care: every change within the record causes a record.commit in the background
    	// means the changes get stored multiply!! Don't flatten the original record, as this means changes too!
    	//e.record.data[e.field] = e.value;
		var priceGroupId = e.record.data.price_group_id;
		if(priceGroupId.id !== undefined){
			priceGroupId = priceGroupId.id;
		}
		//console.log(e.record);
		var articleRecord = e.record.getForeignRecord(Tine.Billing.Model.Article,'article_id');
		//var articleId = articleRecord;
		//e.record.data.article_record = this.articleStore.getAt(this.articleStore.findExact('id',articleId));
		e.record.data.price_group_id = Tine.Billing.getPriceGroupById(priceGroupId);
		e.record.data.vat_id = Tine.Billing.getVatById(e.record.data.vat_id);
		
    	if(this.perspective == 'receipt' && this.receiptRecord.get('type')=='CREDIT' && e.record.data.amount>0){
    		e.record.data.amount *= (-1);
    	}
    	switch(e.field){
    	case 'price_group_id':
			var prices = articleRecord.getPrices(this.debitorId, priceGroupId);
			e.record.data.price_netto = prices.price_netto;
			e.record.data.price_brutto = prices.price_brutto;
    	case 'price_netto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO);
    		break;
    	case 'price_brutto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
    		break;
    	default:
    		e.record.calculate();
    	}
    	if(this.storeAtOnce){
    		e.cancel = true;
    	    this.recordProxy.saveRecord(e.record, {
	             scope: this,
	             success: function(updatedRecord) {
	                 //this.grid.getStore().commitChanges();
	                 // update record in store to prevent concurrency problems
	                 e.record.data = updatedRecord.data;
	                 
	                 // reloading the store feels like oldschool 1.x
	                 // maybe we should reload if the sort critera changed, 
	                 // but even this might be confusing
	                 //store.load({});
	             }
	         });
    	}else{
    		//this.getGrid().getStore().insert([newRecord]);
    		//e.record.commit();
    		//this.getGrid().getStore().commitChanges();
    		this.getView().refresh();
    	}
    	return true;
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.QuickOrderGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	var filterOptions = {};
    	if(!this.i){
    		this.i = 0;
    	}
    	switch(this.perspective){
    	case 'order':
        	if(!this.orderRecord){
        		this.i++;
        		return false;
        	}
    		filterOptions.record = this.orderRecord;
        	filterOptions.field = 'order_id';

    		break;
    	case 'receipt':
    		filterOptions.record = this.receiptRecord;
        	filterOptions.field = 'receipt_id';
        	if(!this.receiptRecord){
        		this.i++;
        		return false;
        	}
    		break;    
    	case 'orderTemplate':
    		filterOptions.record = this.orderTemplateRecord;
        	filterOptions.field = 'order_template_id';
        	if(!this.orderTemplateRecord){
        		this.i++;
        		return false;
        	}
    		break;     		
    	}
    	
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
    			this.i++;
    		return false;
    	}
    	var recordId = filterOptions.record.get('id');
    	if(recordId == 0 || recordId == undefined){
    		recordId = -1;
    	}
    	//alert(recordId);
    	var filter = {	
			field: filterOptions.field,
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: recordId }]
		};
        options.params.filter.push(filter);
    },
    onStoreUpdate: function(store, record, operation) {
        switch (operation) {
            case Ext.data.Record.EDIT:
                this.recordProxy.saveRecord(record, {
                    scope: this,
                    success: function(updatedRecord) {
                        this.grid.getStore().commitChanges();
                        // update record in store to prevent concurrency problems
                        record.data = updatedRecord.data;
                        
                        // reloading the store feels like oldschool 1.x
                        // maybe we should reload if the sort critera changed, 
                        // but even this might be confusing
                        //store.load({});
                    }
                });
                break;
            case Ext.data.Record.COMMIT:
                //nothing to do, as we need to reload the store anyway.
                break;
        }
    },
    isValidNewEntry: function(newRecord){
    	if(!this.checkAmount( newRecord )){
    		return false;
    	}
    	if(!this.checkArticleNumber( newRecord )){
    		return false;
    	}
    	return true;
    },
	getColumnModel: function(expander) {
        var columns = [
            new Ext.grid.RowNumberer({width: 30}),
            expander,
            { 
            	id: 'article_id', header: 'Artikel', dataIndex: 'article_id', width: 120,
			   	renderer: Tine.Billing.renderer.articleRenderer,
			   	sortable:false//, 
		    },
            { 
            	id: 'name', header: 'Bezeichnung', dataIndex: 'name',
            	/*quickaddField: 
            			new Ext.form.TextField({
	            		 	xtype:'textfield',
		    				disabledClass: 'x-item-disabled-view',
		    			    allowBlank:true,
		    			    name: 'name',
		    			    width:100
		    			}),*/
            	 editor: 
            	 	new Ext.form.TextField({
            		 	xtype:'textfield',
	    				disabledClass: 'x-item-disabled-view',
	    			    allowBlank:true,
	    			    name: 'name',
	    			    width:100
	    			})
            },
            { 
            	id: 'amount', header: 'Menge', dataIndex: 'amount',
            	editor: 
            	 	new Ext.form.TextField({
            		 	xtype:'textfield',
	    				disabledClass: 'x-item-disabled-view',
	    			    allowBlank:true,
	    			    name: 'amount',
	    			    width:100
	    			})
            },{ 
			   id: 'price_netto', header: 'Preis netto', dataIndex: 'price_netto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
            },{ 
			   id: 'price_brutto', header: 'Preis brutto', dataIndex: 'price_brutto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
            },{ 
			   id: 'price2_netto', header: 'Zuschlag netto', dataIndex: 'price2_netto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   hidden:true,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
            },{ 
			   id: 'price2_brutto', header: 'Zuschlag brutto', dataIndex: 'price2_brutto', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   hidden:true,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
            },{ 
			   	id: 'vat_id', 
			   	header: 'MwSt', 
			   	width:100, 
			   	dataIndex: 'vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('Vat', 'vatEditor'),
		   },{ 
			   	id: 'price2_vat_id', 
			   	header: 'MwSt Zuschlag', 
			   	hidden:true,
			   	width:100, 
			   	dataIndex: 'price2_vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('Vat', 'vatEditor'),
		   },{ 
			   	id: 'price_group_id', 
			   	header: 'Preisgruppe', 
			   	width:100, 
			   	dataIndex: 'price_group_id', 
			   	renderer: Tine.Billing.renderer.priceGroupRenderer,
			   	sortable:false, 
				editor: Tine.Billing.Custom.getRecordPicker('PriceGroup', 'priceGroupEditor'),
			   	//quickaddField:Tine.Billing.Custom.getRecordPicker('PriceGroup', 'priceGroupAdd',{selectedRecord: Tine.Billing.getPriceGroupDefault()})
		   },{
			    id:'discount_percentage',
			    dataIndex:'discount_percentage',
			    renderer: Ext.ux.PercentRenderer,
			    header: 'Rabatt %',
			    editor: new Ext.ux.PercentCombo({
	                autoExpand: true,
	                blurOnSelect: true
	            })
		 	},{ 
				   id: 'total_netto', header: 'ges. netto', dataIndex: 'total_netto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total_brutto', header: 'ges. brutto', dataIndex: 'total_brutto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total2_netto', header: 'Zuschl. ges. netto', dataIndex: 'total2_netto', sortable:false,hidden:true,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
				   id: 'total2_brutto', header: 'Zuschl. ges. brutto', dataIndex: 'total2_brutto', sortable:false,hidden:true,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		 	},{ 
            	id: 'comment', header: 'Bemerkung', dataIndex: 'comment',
            	/*quickaddField: 
            			new Ext.form.TextField({
	            		 	xtype:'textfield',
		    				disabledClass: 'x-item-disabled-view',
		    			    allowBlank:true,
		    			    name: 'comment'
		    			}),*/
            	 editor: 
            	 	new Ext.form.TextField({
            		 	xtype:'textfield',
	    				disabledClass: 'x-item-disabled-view',
	    			    allowBlank:true,
	    			    name: 'comment'
	    			})
            }
        ];
        return columns;
        return new Ext.grid.ColumnModel({ 
            defaults: {
                sortable: false,
                resizable: true
            },
            columns: columns
        });
    },
    checkAmount: function( record ){
    	if(!record.get('amount') || record.get('amount') < 0){
    		Ext.Msg.alert(
    			'Fehler', 
                'Bitte geben Sie die Menge ein.'
            );
    		return false;
    	}
    	return true;
    },
    checkArticleNumber: function( record ){
    	return true;
    },
    onArticleInitializeError: function(){
    	this.disable();
    	Ext.Msg.alert(
			'Fehler', 
            'Die Artikel zur Auftragserfassung konnten nicht initialisiert werden.<br/>Bitte schliessen Sie das Fenster.'
        );
    },
    addRecordFromArticle: function(articleRecord){
    	this.currentArticleRecord = articleRecord;
    	this.onNewentry({article_id:articleRecord.get('id')});
    	return;
	},
	onSelectArticle: function(articleRecord){
		this.currentArticleRecord = articleRecord.selectedRecord;
	},
	onAfterRender: function(){
		//this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
    	this.initDropZone();
    },
    initDropZone: function(){
    	if(!this.ddConfig){
    		return;
    	}
		this.dd = new Ext.dd.DropTarget(this.el, {
			scope: this,
			ddGroup     : this.ddConfig.ddGroup,
			notifyEnter : function(ddSource, e, data) {
				this.scope.el.stopFx();
				this.scope.el.highlight();
			},
			onDragOver: function(e,id){
			},
			notifyDrop  : function(ddSource, e, data){
				return this.scope.onDrop(ddSource, e, data);
				//this.scope.addRecordFromArticle(data.selections[0]);
				//this.scope.fireEvent('drop',data.selections[0]);
				return true;
			}
		});
		// self drag/drop
		this.dd.addToGroup(this.gridConfig.ddGroup);
	},
	onDrop: function(ddSource, e, data){
		switch(ddSource.ddGroup){
		// if article gets dropped in: add new receipt position
		case 'ddGroupArticle':
			return this.addRecordFromArticle(data.selections[0]);
			break;
		// if receipt position gets dropped -> swap positions
		case 'ddGroupOrderPosition':
			break;
		}
	},
    
    /**
     * get values from store (as array)
     * 
     * @return {Array}
     */
    getFromStoreAsArray: function() {
        var result = [];
        this.store.each(function(record) {                     
            this.push(record.data);
        }, result);
        
        return result;
    }
});