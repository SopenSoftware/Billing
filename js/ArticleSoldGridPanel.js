Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleSoldGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-articleSold-gridpanel',
    recordClass: Tine.Billing.Model.ArticleSold,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'article_nr', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'article_nr'
    },
    crud:{
    	_add:false,
    	_edit:false,
    	_delete:false
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.articleSoldBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.ArticleSoldGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	this.actions_printArticleSellList = new Ext.Action({
            text: 'Artikelverkaufsliste',
			disabled: false,
            handler: this.printArticleSellList,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
    	this.actions_print = new Ext.Action({
        	allowMultiple: false,
        	//disabled:true,
            text: 'Drucken',
            menu:{
            	items:[
            	       this.actions_printArticleSellList
		    	]
            }
        });
    	//this.supr().initActions.call(this);
    },
    printArticleSellList: function(){
		var win = Tine.Billing.ExpArticleDialog.openWindow({
			panelTitle: 'Artikelverkaufsliste',
    		actionType: 'customExport'
		});
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.ArticleSold.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  

    getActionToolbarItems: function() {
    	return [
			Ext.apply(new Ext.Button(this.actions_printPage), {
			    scale: 'medium',
			    rowspan: 2,
			    iconAlign: 'top',
			    iconCls: 'action_exportAsPdf'
			}),
			Ext.apply(new Ext.Button(this.actions_print), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_exportAsPdf'
            })
        ];
    },
	getColumns: function() {
		return [
{ id: 'article_nr', header: this.app.i18n._('Artikel-Nr'), width:100, style:'text-align:right;', dataIndex: 'article_nr', sortable:true },
{ id: 'article_ext_nr', header: this.app.i18n._('Artikel-Nr2'), width:100, style:'text-align:right;', dataIndex: 'article_ext_nr', sortable:true },
{ id: 'name', header: this.app.i18n._('Bezeichnung'), width:100, style:'text-align:right;', dataIndex: 'name', sortable:true },
{ id: 'article_group_id', header: this.app.i18n._('Artikelgruppe'), dataIndex: 'article_group_id', sortable:true, renderer:Tine.Billing.renderer.articleGroup },
{ id: 'article_series_id', header: this.app.i18n._('Serie'), dataIndex: 'article_series_id', sortable:true, renderer:Tine.Billing.renderer.articleSeriesRenderer },
{ id: 'article_unit_id', header: this.app.i18n._('Einheit'), dataIndex: 'article_unit_id', sortable:true, renderer:Tine.Billing.renderer.articleUnit },
{ id: 'amount', header: this.app.i18n._('Verkaufte Menge'), width:100, style:'text-align:right;', dataIndex: 'amount', sortable:true },
{ id: 'description', header: this.app.i18n._('Bemerkung'), dataIndex: 'comment', sortable:true },
{ id: 'date1', header: this.app.i18n._('1. Verkauf'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'date1', sortable:true},
{ id: 'date2', header: this.app.i18n._('letzt. Verkauf'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'date2', sortable:true},
{ id: 'stock_amount_min', header: this.app.i18n._('Lagerbestand minimum'), dataIndex: 'stock_amount_min', sortable:true },
{ id: 'stock_amount_total', header: this.app.i18n._('Lagerbestand gesamt'), dataIndex: 'stock_amount_total', sortable:true },
{ id: 'stock_status', header: this.app.i18n._('Lagerstatus'), dataIndex: 'stock_amount_total', sortable:false, renderer:Tine.Billing.getStockStatusIcon  },
{ id: 'total_netto', header: this.app.i18n._('∑∑ netto'), dataIndex: 'total_netto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
{ id: 'total_brutto', header: this.app.i18n._('∑∑ brutto'), dataIndex: 'total_brutto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },
{ id: 'min_price_netto', header: this.app.i18n._('min Einzel netto'), dataIndex: 'min_price_netto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
{ id: 'min_price_brutto', header: this.app.i18n._('min Einzel brutto'), dataIndex: 'min_price_brutto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },
{ id: 'max_price_netto', header: this.app.i18n._('max Einzel netto'), dataIndex: 'max_price_netto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
{ id: 'max_price_brutto', header: this.app.i18n._('max Einzel brutto'), dataIndex: 'max_price_brutto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },
{ id: 'total1_netto', header: this.app.i18n._('∑ P1 netto'), dataIndex: 'total1_netto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
{ id: 'total1_brutto', header: this.app.i18n._('∑ P1 brutto'), dataIndex: 'total1_brutto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },
{ id: 'total2_netto', header: this.app.i18n._('∑ P2 netto'), dataIndex: 'total2_netto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
{ id: 'total2_brutto', header: this.app.i18n._('∑ P2 brutto'), dataIndex: 'total2_brutto', sortable:true, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  }
];
	}

});