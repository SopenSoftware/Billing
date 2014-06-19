Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.ArticleGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-article-gridpanel',
    recordClass: Tine.Billing.Model.Article,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'name'
    },
    crud:{
    	_add:true,
    	_edit:true,
    	_delete:true,
    	_copy:true
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.articleBackend;
       
        var expander = new Ext.ux.grid.RowExpander({
        	fixed:true,
        	tpl: new Ext.XTemplate(
        		'	<p><b>Beschreibung:</b> {description}</p><br>',
        		'	<tpl for="prices">',
        		'		<tpl for="pgp">',
	        	'	<tpl for=".">',
	        	'			<div style="width:400px;">',
	        	'			<div style="width:100px;float:left;"><b>{pricegroup}</b></div>',
	        	'			<div style="width:150px;float:left;">Preis netto (EUR): <b>{price_netto}</b></div>',
	        	'			<div style="width:150px;float:left;">Preis brutto (EUR): {price_brutto}</div>',
	        	'</div>',
	        	'		</tpl>',
	        	'		</tpl>',
	        	
        		'	</tpl>'
        	)
        		
//            tpl : new Ext.Template(
//                '<p><b>Beschreibung:</b> {description}</p><br>'
//            )
        });
        this.gridConfig.columns = this.getColumns(expander);
        this.gridConfig.plugins = [expander];
        
        this.initFilterToolbar();
		this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
        
        
        Tine.Billing.ArticleGridPanel.superclass.initComponent.call(this);
    },
    
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Article.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },
    
	getColumns: function(expander) {
		return [
		expander,
		{ id: 'article_nr', header: this.app.i18n._('Artikel-Nr'), width:100, style:'text-align:right;', dataIndex: 'article_nr', sortable:true },
		{ id: 'article_ext_nr', header: this.app.i18n._('Artikel-Nr2'), width:100, style:'text-align:right;', dataIndex: 'article_ext_nr', sortable:true },
		{ id: 'name', header: this.app.i18n._('Bezeichnung'), width:100, style:'text-align:right;', dataIndex: 'name', sortable:true },
		{ id: 'article_group_id', header: this.app.i18n._('Artikelgruppe'), dataIndex: 'article_group_id', sortable:true, renderer:Tine.Billing.renderer.articleGroup },
		{ id: 'article_series_id', header: this.app.i18n._('Serie'), dataIndex: 'article_series_id', sortable:true, renderer:Tine.Billing.renderer.articleSeriesRenderer },
		{ id: 'vat_id', header: this.app.i18n._('MwSt %'), dataIndex: 'vat_id', sortable:true, renderer:Tine.Billing.renderer.vat },
		{ id: 'article_unit_id', header: this.app.i18n._('Einheit'), dataIndex: 'article_unit_id', sortable:true, renderer:Tine.Billing.renderer.articleUnit },
		{ id: 'comment', header: this.app.i18n._('Bemerkung'), dataIndex: 'comment', sortable:true },
		{ id: 'weight', header: this.app.i18n._('Gewicht'), dataIndex: 'weight', sortable:true },
		{ id: 'dimensions', header: this.app.i18n._('Abmessungen'), dataIndex: 'dimensions', sortable:true },
		{ id: 'rev_account_vat_in', header: this.app.i18n._('Erlöskonto mit MwSt'), dataIndex: 'rev_account_vat_in', sortable:true },
		{ id: 'rev_account_vat_ex', header: this.app.i18n._('Erlöskonto ohne MwSt'), dataIndex: 'rev_account_vat_ex', sortable:true },
		{ id: 'stock_amount_min', header: this.app.i18n._('Lagerbestand minimum'), dataIndex: 'stock_amount_min', sortable:true },
		{ id: 'stock_amount_total', header: this.app.i18n._('Lagerbestand gesamt'), dataIndex: 'stock_amount_total', sortable:true },
		{ id: 'stock_status', header: this.app.i18n._('Lagerstatus'), dataIndex: 'stock_amount_total', sortable:false, renderer:Tine.Billing.getStockStatusIcon  },
		{ id: 'price_netto', header: this.app.i18n._('Preis netto'), dataIndex: 'price_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
		{ id: 'price2_netto', header: this.app.i18n._('Zuschlag netto'), dataIndex: 'price2_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
		{ id: 'price_brutto', header: this.app.i18n._('Preis brutto'), dataIndex: 'price_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
		{ id: 'price2_brutto', header: this.app.i18n._('Zuschlag brutto'), dataIndex: 'price2_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
		{ id: 'price2_vat_id', header: this.app.i18n._('Zuschlag MwSt %'), dataIndex: 'price2_vat_id', sortable:true, renderer:Tine.Billing.renderer.vat, hidden:true }
		

	   ];
	}

});

Tine.Billing.getStockStatusIcon = function(value, meta, record){
	var qtip, icon;
	var stockMin = record.get('stock_amount_min');
	var stockTotal = record.get('stock_amount_total');
	if( !stockTotal || (stockTotal <= 0) ){
		qtip = 'Kein Artikel im Bestand';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-busy.png';
	}else if(stockMin>=stockTotal){
		qtip = 'Zu wenig Artikel im Bestand.';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/dialog-warning.png';
	}else{
		qtip = 'Lagerbestand ok';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-online.png';
	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};


Tine.Billing.ArticleSelectionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-article-selection-gridpanel',
    recordClass: Tine.Billing.Model.Article,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    useQuickSearchPlugin: false,
    doInitialLoad: false,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'title',
        // drag n drop
        enableDragDrop: true,
        ddGroup: 'ddGroupArticle'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.articleBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.filterToolbar = this.getFilterToolbar();
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        Tine.Billing.ArticleSelectionGridPanel.superclass.initComponent.call(this);
    },
	getColumns: function() {
		return [
{ id: 'article_nr', header: this.app.i18n._('Artikel-Nr'), width:100, style:'text-align:right;', dataIndex: 'article_nr', sortable:true },
{ id: 'article_ext_nr', header: this.app.i18n._('Artikel-Nr2'), width:100, style:'text-align:right;', dataIndex: 'article_ext_nr', sortable:true },
{ id: 'article_series_id', header: this.app.i18n._('Serie'), dataIndex: 'article_series_id', sortable:true, renderer:Tine.Billing.renderer.articleSeriesRenderer },
{ id: 'name', header: this.app.i18n._('Bezeichnung'), width:100, style:'text-align:right;', dataIndex: 'name', sortable:true },
{ id: 'stock_amount_total', header: this.app.i18n._('Lagerbestand gesamt'), dataIndex: 'stock_amount_total', sortable:true },
{ id: 'stock_status', header: this.app.i18n._('Lagerstatus'), dataIndex: 'stock_amount_total', sortable:false, renderer:Tine.Billing.getStockStatusIcon  },
{ id: 'article_group_id', header: this.app.i18n._('Artikelgruppe'), dataIndex: 'article_group_id', sortable:true, renderer:Tine.Billing.renderer.articleGroup },
{ id: 'vat_id', header: this.app.i18n._('MwSt %'), dataIndex: 'vat_id', sortable:true, renderer:Tine.Billing.renderer.vatRenderer },
{ id: 'article_unit_id', header: this.app.i18n._('Einheit'), dataIndex: 'article_unit_id', sortable:true, renderer:Tine.Billing.renderer.articleUnitRenderer },
{ id: 'comment', header: this.app.i18n._('Bemerkung'), dataIndex: 'comment', sortable:true },
{ id: 'weight', header: this.app.i18n._('Gewicht'), dataIndex: 'weight', sortable:true },
{ id: 'dimensions', header: this.app.i18n._('Abmessungen'), dataIndex: 'dimensions', sortable:true },
{ id: 'rev_account_vat_in', header: this.app.i18n._('Erlöskonto mit MwSt'), dataIndex: 'rev_account_vat_in', sortable:true },
{ id: 'rev_account_vat_ex', header: this.app.i18n._('Erlöskonto ohne MwSt'), dataIndex: 'rev_account_vat_ex', sortable:true },
{ id: 'price_netto', header: this.app.i18n._('Preis netto'), dataIndex: 'price_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
{ id: 'price2_netto', header: this.app.i18n._('Zuschlag netto'), dataIndex: 'price2_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
{ id: 'price_brutto', header: this.app.i18n._('Preis brutto'), dataIndex: 'price_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
{ id: 'price2_brutto', header: this.app.i18n._('Zuschlag brutto'), dataIndex: 'price2_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer, hidden:true  },			
{ id: 'price2_vat_id', header: this.app.i18n._('Zuschlag MwSt %'), dataIndex: 'price2_vat_id', sortable:true, renderer:Tine.Billing.renderer.vat, hidden:true },
{ id: 'stock_amount_min', header: this.app.i18n._('Lagerbestand minimum'), dataIndex: 'stock_amount_min', sortable:true }



	];
	}

});

Ext.reg('articleselectiongrid',Tine.Billing.ArticleSelectionGridPanel);