Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleCustomerGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-articleCustomer-gridpanel',
    recordClass: Tine.Billing.Model.ArticleCustomer,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'price_netto', direction: 'DESC'},
    articleRecord: null,
    perspective: null,
    initComponent: function() {
    	Ext.apply(this, this.initialConfig);
    	if(this.perspective == Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE){
    	    this.gridConfig = {
    	 	   clicksToEdit: 'auto',
    	        loadMask: true,
    	        quickaddMandatory: 'debitor_id',
    	        autoExpandColumn: 'debitor_id'
    	     }
    	}else{
    	    this.gridConfig = {
    	 	   clicksToEdit: 'auto',
    	        loadMask: true,
    	        quickaddMandatory: 'article_id',
    	        autoExpandColumn: 'article_id'
    	     }
    	}
        this.recordProxy = Tine.Billing.articleCustomerBackend;
        // init with empty article record
        // -> hopefully filter causes no article customers to be displayed
        // -> TODO: test this
        this.articleRecord = new Tine.Billing.Model.Article({},0);
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);  

        Tine.Billing.ArticleCustomerGridPanel.superclass.initComponent.call(this);
        this.validateComponent();
        this.initGridEvents();
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.ArticleCustomer.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []//quickFilter
        });
    },  
    
    loadArticle: function( articleRecord ){
    	this.articleRecord = articleRecord;
    	this.store.reload();
    },
    
    loadDebitor: function( debitorRecord ){
    	this.debitorRecord = debitorRecord;
    	this.store.reload();
    },
    
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.ArticleCustomerGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	var filterOptions = {};
    	switch(this.perspective){
    		case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE:
    			filterOptions.record = this.articleRecord;
    			filterOptions.field = 'article_id';
    			break;
    		case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_DEBITOR:
    			filterOptions.record = this.debitorRecord;
    			filterOptions.field = 'debitor_id';
    			break;
    	}
    
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
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
    initGridEvents: function() {    
        this.grid.on('newentry', function(articleCustomerData){
        	var data = this.recordClass.getDefaultData();
        	Ext.apply(data, articleCustomerData);
        	
        	switch(this.perspective){
        	case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE:
        		data.article_id = this.articleRecord.get('id');
        		break;
        	case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_DEBITOR:
        		data.debitor_id = this.debitorRecord.get('id');
        		break;
        	}
        
        	var articleCustomer = new Tine.Billing.Model.ArticleCustomer(data,0);
            
            Tine.Billing.articleCustomerBackend.saveRecord(articleCustomer, {
                scope: this,
                success: function() {
                    this.loadData(true, true, true);
                },
                failure: function () { 
                    Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save article customer.')); 
                }
            });
            return true;
        }, this);
    },
	onStoreUpdate: function(store, record, operation) {
		switch(this.perspective){
		case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE:
			record.data.article_id = this.articleRecord.get('id');
			record.data.debitor_id = record.data.debitor_id['id'];
			break;
		case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_DEBITOR:
			record.data.debitor_id = this.debitorRecord.get('id');
			record.data.article_id = record.data.article_id['id'];
			break;
		}
		Tine.Billing.ArticleCustomerGridPanel.superclass.onStoreUpdate.call(this,store, record, operation);
	},    
	getColumns: function() {
		var cols;
		switch(this.perspective){
    	case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_ARTICLE:
    		cols = [{ 
				   	id: 'article_id', 
				   	header: 'Artikel', 
				   	width:100, 
				   	dataIndex: 'article_id', 
				   	renderer: Tine.Billing.renderer.articleRenderer,
				   	hidden:true,
				   	disabled:true,
				   	sortable:true
				},
				{ 
				   	id: 'debitor_id', 
				   	header: 'Kunde', 
				   	width:100, 
				   	dataIndex: 'debitor_id', 
				   	renderer: Tine.Billing.renderer.debitorRenderer,
				   	sortable:true, 
				    quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
						disabledClass: 'x-item-disabled-view',
						recordClass: Tine.Billing.Model.Debitor,
					    allowBlank:false,
					    autoExpand: true,
					    ddConfig:{
				        	ddGroup: 'ddGroupDebitor'
				        }
					})
			}];
    		
    		break;
    	case Tine.Billing.Constants.ArticleCustomer.PERSPECTIVE_DEBITOR:
    		cols = [{ 
				   	id: 'article_id', 
				   	header: 'Artikel', 
				   	width:100, 
				   	dataIndex: 'article_id', 
				   	renderer: Tine.Billing.renderer.articleRenderer,
				   	sortable:true, 
				    quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
						disabledClass: 'x-item-disabled-view',
						recordClass: Tine.Billing.Model.Article,
					    allowBlank:false,
					    autoExpand: true,
					    ddConfig:{
				        	ddGroup: 'ddGroupArticle'
				        }
					})
				},{ 
					   	id: 'debitor_id', 
				   	header: 'Kunde', 
				   	width:100, 
				   	dataIndex: 'debitor_id', 
				   	renderer: Tine.Billing.renderer.debitorRenderer,
				   	hidden:true,
				   	disabled:true,
				   	sortable:true
			}];
    		break;
    	}
		cols = cols.concat( [
		  { 
			   	id: 'vat_id', 
			   	header: 'MwSt', 
			   	width:100, 
			   	dataIndex: 'vat_id', 
			   	renderer: Tine.Billing.renderer.vatRenderer,
			   	sortable:true, 
			   	editor: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
					disabledClass: 'x-item-disabled-view',
					recordClass: Tine.Billing.Model.Vat,
				    allowBlank:false,
				    autoExpand: true
				}),
	            quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
    				disabledClass: 'x-item-disabled-view',
    				recordClass: Tine.Billing.Model.Vat,
    			    allowBlank:false,
    			    autoExpand: true
    			})
		   },
		  { 
			   id: 'price_netto', header: 'Preis netto(EUR)', dataIndex: 'price_netto', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            allowBlank:false
		        }),
			   quickaddField: new Sopen.CurrencyField({
				    allowBlank:false
		        })
		  },
		  { 
			   id: 'price_brutto', header: 'Preis brutto(EUR)', dataIndex: 'price_brutto', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            allowBlank:false
		        }),
			   quickaddField: new Sopen.CurrencyField({
				    allowBlank:false
		        })
		  }
		]);
		return cols;
	},
	validateComponent: function(){
		if(!this.perspective){
			throw 'No perspective given!';
		}
	}

});

Ext.reg('articlecustomergridpanel',Tine.Billing.ArticleCustomerGridPanel);