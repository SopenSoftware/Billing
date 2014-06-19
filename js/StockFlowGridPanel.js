Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.StockFlowGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-article-stockflow-gridpanel',
    recordClass: Tine.Billing.Model.StockFlow,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'price_netto', direction: 'DESC'},
    articleRecord: null,
    gridConfig: {
       loadMask: true
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.stockFlowBackend;
        // init with empty article record
        // -> hopefully filter causes no article stockFlows to be displayed
        // -> TODO: test this
        this.articleRecord = new Tine.Billing.Model.Article({},0);
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);  

        Tine.Billing.StockFlowGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.StockFlow.getFilterModel(),
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
    	Tine.Billing.StockFlowGridPanel.superclass.onStoreBeforeload.call(this, store, options);
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
    getColumns: function() {
		return [
		   { id: 'article_id', header: 'Artikel', width:100, dataIndex: 'article_id', sortable: false,renderer: Tine.Billing.renderer.articleRenderer },
		   { 
			   	id: 'stock_location_id', 
			   	header: 'Lagerort', 
			   	width:100, 
			   	dataIndex: 'stock_location_id', 
			   	renderer: Tine.Billing.renderer.stockLocationRenderer,
			   	sortable:true
		   },{ 
			   	id: 'amount', 
			   	header: 'Menge', 
			   	width:100, 
			   	dataIndex: 'amount', 
			   	sortable:true
		   },{ 
			   id: 'price_netto', header: 'Preis netto', dataIndex: 'price_netto', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		  },{ 
			   	id: 'creditor_id', 
			   	header: 'Lieferant', 
			   	width:100, 
			   	dataIndex: 'creditor_id', 
			   	renderer: Tine.Billing.renderer.creditorRenderer
		  },{ 
			   	id: 'debitor_id', 
			   	header: 'Kunde', 
			   	width:100, 
			   	dataIndex: 'debitor_id', 
			   	renderer: Tine.Billing.renderer.debitorRenderer
		  },{
				id: 'direction', 
			   	header: 'Zugang/Abgang', 
			   	width:100, 
			   	dataIndex: 'direction', 
			   	renderer: Tine.Billing.renderer.stockFlowDirectionRenderer
		  },{ id: 'booking_date', header: 'Buchungsdatum', dataIndex: 'booking_date', sortable:true, renderer: Tine.Tinebase.common.dateRenderer }
		  ,{ 
			   	id: 'reason', 
			   	header: 'Grund', 
			   	width:100, 
			   	dataIndex: 'reason', 
			   	sortable:true
		   }
	      
	    ];
	}

});

Ext.reg('stockflowgridpanel',Tine.Billing.StockFlowGridPanel);