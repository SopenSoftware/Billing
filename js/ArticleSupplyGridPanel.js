Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleSupplyGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-article-articlesupply-gridpanel',
    recordClass: Tine.Billing.Model.ArticleSupply,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'amount', direction: 'DESC'},
    articleRecord: null,
    gridConfig: {
	   loadMask: true
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.articleSupplyBackend;
        // init with empty article record
        // -> hopefully filter causes no article articleSupplys to be displayed
        // -> TODO: test this
        this.articleRecord = new Tine.Billing.Model.Article({},0);
        //this.actionToolbarItems = this.getToolbarItems();
        //this.gridConfig.columns = this.getColumns();

       // var summary = new Ext.ux.grid.GridSummary();
        
        this.gridConfig.columns = this.getColumns();
        //this.gridConfig.plugins = [summary];
        
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);  

        Tine.Billing.ArticleSupplyGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.ArticleSupply.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []//quickFilter
        });
    },  
    
    loadArticle: function( articleRecord ){
    	this.articleRecord = articleRecord;
    	this.store.reload();
    },
    
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.ArticleSupplyGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(!this.articleRecord || this.articleRecord.id == 0){
    		return false;
    	}
    	var filter = {	
			field:'article_id',
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: this.articleRecord.get('id')}]
		};
        options.params.filter.push(filter);
    },
//    onStoreUpdate: function(store, record, operation) {
//    	record.data.price_group_id = record.data.price_group_id['id'];
//    	Tine.Billing.ArticleSupplyGridPanel.superclass.onStoreUpdate.call(this,store, record, operation);
//    },    
	getColumns: function() {
		return [
		   { id: 'article_id', header: 'Artikel', width:100, dataIndex: 'article_id', 	renderer: Tine.Billing.renderer.articleRenderer,sortable:true },
		   { 
			   	id: 'stock_location_id', 
			   	header: 'Lagerort', 
			   	width:100, 
			   	dataIndex: 'stock_location_id', 
			   	renderer: Tine.Billing.renderer.stockLocationRenderer,
			   	sortable:true
		   },
		   { 
			   id: 'amount', header: 'Menge', dataIndex: 'amount', sortable:true,summaryType:'sum'
		  }
	    ];
	}

});

Ext.reg('articlesellpricegridpanel',Tine.Billing.ArticleSupplyGridPanel);