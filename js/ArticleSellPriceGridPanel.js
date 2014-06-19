Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleSellPriceGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-article-sellprice-gridpanel',
    recordClass: Tine.Billing.Model.SellPrice,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'price_netto', direction: 'DESC'},
    articleRecord: null,
    gridConfig: {
	   clicksToEdit: 'auto',
       loadMask: true,
       quickaddMandatory: 'price_group_id',
       autoExpandColumn: 'price_group_id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.sellPriceBackend;
        // init with empty article record
        // -> hopefully filter causes no article sellPrices to be displayed
        // -> TODO: test this
        this.articleRecord = new Tine.Billing.Model.Article({},0);
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);  

        Tine.Billing.ArticleSellPriceGridPanel.superclass.initComponent.call(this);
        
        this.initGridEvents();
    },
    initFilterToolbar: function() {
		//var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.SellPrice.getFilterModel(),
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
    	Tine.Billing.ArticleSellPriceGridPanel.superclass.onStoreBeforeload.call(this, store, options);
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
    initGridEvents: function() {    
        this.grid.on('newentry', function(articleSellPriceData){
        	var data = this.recordClass.getDefaultData();
        	Ext.apply(data, articleSellPriceData);
        	data.article_id = this.articleRecord.get('id');
        	
            var articleSellPrice = new this.recordClass(data,0);
            
            Tine.Billing.sellPriceBackend.saveRecord(articleSellPrice, {
                scope: this,
                success: function() {
                    this.loadData(true, true, true);
                },
                failure: function () { 
                    Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save article sellPrice.')); 
                }
            });
            return true;
        }, this);
        
        this.grid.on('afteredit', this.calculateAfterEdit,this);
    },
    calculateAfterEdit: function(e){
    	var vatValue = this.articleRecord.getVatValue();
    	switch(e.field){
    	case 'price_brutto':
    		e.record.calculateBaseBrutto(vatValue);
    		break;
       	case 'price_netto':
       	default:
    		e.record.calculateBaseNetto(vatValue);
    		break;    		
    	}
    	
    	e.record.commit();
    },
    onStoreUpdate: function(store, record, operation) {
    	record.data.price_group_id = record.data.price_group_id['id'];
    	Tine.Billing.ArticleSellPriceGridPanel.superclass.onStoreUpdate.call(this,store, record, operation);
    },    
	getColumns: function() {
		return [
		   { id: 'article_id', header: 'Artikel', width:100, dataIndex: 'article_id', sortable:true },
		   { 
			   	id: 'price_group_id', 
			   	header: 'Preisgruppe', 
			   	width:100, 
			   	dataIndex: 'price_group_id', 
			   	renderer: Tine.Billing.renderer.priceGroupRenderer,
			   	sortable:true, 
	            quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
    				disabledClass: 'x-item-disabled-view',
    				recordClass: Tine.Billing.Model.PriceGroup,
    			    allowBlank:false,
    			    autoExpand: true
    			})
		   },
		   { 
			   id: 'price_netto', header: 'Preis netto', dataIndex: 'price_netto', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
	                allowBlank:false
	            }),
			   quickaddField: new Sopen.CurrencyField({
				    allowBlank:false
	            })
		  },
		   { 
			   id: 'price_brutto', header: 'Preis brutto', dataIndex: 'price_brutto', sortable:true,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
	                allowBlank:false
	            }),
			   quickaddField: new Sopen.CurrencyField({
				    allowBlank:false
	            })
		  }
	    ];
	}

});

Ext.reg('articlesellpricegridpanel',Tine.Billing.ArticleSellPriceGridPanel);