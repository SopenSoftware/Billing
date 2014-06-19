Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleSupplierGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-articleSupplier-gridpanel',
    recordClass: Tine.Billing.Model.ArticleSupplier,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'price', direction: 'DESC'},
    articleRecord: null,
    perspective: null,
    initComponent: function() {
    	Ext.apply(this, this.initialConfig);
    	if(this.perspective == Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE){
    	    this.gridConfig = {
    	 	   clicksToEdit: 'auto',
    	        loadMask: true,
    	        quickaddMandatory: 'creditor_id',
    	        autoExpandColumn: 'creditor_id'
    	     }
    	}else{
    	    this.gridConfig = {
    	 	   clicksToEdit: 'auto',
    	        loadMask: true,
    	        quickaddMandatory: 'article_id',
    	        autoExpandColumn: 'article_id'
    	     }
    	}
        this.recordProxy = Tine.Billing.articleSupplierBackend;
        // init with empty article record
        // -> hopefully filter causes no article suppliers to be displayed
        // -> TODO: test this
        this.articleRecord = new Tine.Billing.Model.Article({},0);
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);  

        Tine.Billing.ArticleSupplierGridPanel.superclass.initComponent.call(this);
        this.validateComponent();
        this.initGridEvents();
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.ArticleSupplier.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []//quickFilter
        });
    },  
    
    loadArticle: function( articleRecord ){
    	this.articleRecord = articleRecord;
    	this.store.reload();
    },
    
    loadCreditor: function( creditorRecord ){
    	this.creditorRecord = creditorRecord;
    	this.store.reload();
    },
    
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.ArticleSupplierGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	var filterOptions = {};
    	switch(this.perspective){
    		case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE:
    			filterOptions.record = this.articleRecord;
    			filterOptions.field = 'article_id';
    			break;
    		case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_CREDITOR:
    			filterOptions.record = this.creditorRecord;
    			filterOptions.field = 'creditor_id';
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
        this.grid.on('newentry', function(articleSupplierData){
        	var data = this.recordClass.getDefaultData();
        	// apply data to given record data
        	Ext.apply(data, articleSupplierData);
        	
        	switch(this.perspective){
        	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE:
        		data.article_id = this.articleRecord.get('id');
        		break;
        	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_CREDITOR:
        		data.creditor_id = this.creditorRecord.get('id');
        		break;
        	}
        	
        	
        	var articleSupplier = new Tine.Billing.Model.ArticleSupplier(data,0);
            Tine.Billing.articleSupplierBackend.saveRecord(articleSupplier, {
                scope: this,
                success: function() {
                    this.loadData(true, true, true);
                },
                failure: function () { 
                    Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save article supplier.')); 
                }
            });
            return true;
        }, this);
     },
    onStoreUpdate: function(store, record, operation) {
    	switch(this.perspective){
    	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE:
    		record.data.article_id = this.articleRecord.get('id');
    		record.data.creditor_id = record.data.creditor_id['id'];
    		break;
    	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_CREDITOR:
    		record.data.creditor_id = this.creditorRecord.get('id');
    		record.data.article_id = record.data.article_id['id'];
    		break;
    	}
    	Tine.Billing.ArticleSupplierGridPanel.superclass.onStoreUpdate.call(this,store, record, operation);
    },
	getColumns: function() {
		var cols;
		switch(this.perspective){
    	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_ARTICLE:
    		cols = [
    		         { 
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
    				   	id: 'creditor_id', 
    				   	header: 'Lieferant', 
    				   	width:100, 
    				   	dataIndex: 'creditor_id', 
    				   	renderer: Tine.Billing.renderer.creditorRenderer,
    				   	sortable:true, 
    		            quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
    	    				disabledClass: 'x-item-disabled-view',
    	    				recordClass: Tine.Billing.Model.Creditor,
    	    			    allowBlank:false,
    	    			    autoExpand: true,
    					    ddConfig:{
    				        	ddGroup: 'ddGroupCreditor'
    				        }
    	    			})
    			   }
    		];
    		
    		break;
    	case Tine.Billing.Constants.ArticleSupplier.PERSPECTIVE_CREDITOR:
    		cols = [
    		        { 
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
	   				   	id: 'creditor_id', 
					   	header: 'Lieferant', 
					   	width:100, 
					   	dataIndex: 'creditor_id', 
					   	renderer: Tine.Billing.renderer.creditorRenderer,
					   	hidden:true,
					   	disabled:true,
					   	sortable:true
				   }
   		        
    		];
    		break;
    	}
		cols = cols.concat( [
		  { 
			   id: 'price', header: 'Preis', dataIndex: 'price', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        }),
			   quickaddField: new Sopen.CurrencyField({
				   emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
		  },
		   { id: 'last_order_date', header: 'Letzte Bestellung', dataIndex: 'last_order_date', sortable:true }
	    ]);
		return cols;
	},
	validateComponent: function(){
		if(!this.perspective){
			throw 'No perspective given!';
		}
	}

});

Ext.reg('articlesuppliergridpanel',Tine.Billing.ArticleSupplierGridPanel);