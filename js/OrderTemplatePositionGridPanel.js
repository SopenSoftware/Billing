Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.OrderTemplatePositionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-order-template-position-gridpanel',
	recordClass: Tine.Billing.Model.OrderTemplatePosition,
	frame:true,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'position_nr', direction: 'ASC'},
    ddConfig:{
    	ddGroup: 'ddGroupArticle'
    },
    gridConfig: {
        loadMask: true,
        enableDragDrop:true,
        ddGroup: 'ddGroupOrderTemplatePosition',
	   	 selfTarget:true,
	     //selectAfterDrop:true,
	     ignoreSelf:false
        //autoExpandColumn: 'id'
    },
    // gets injected by parent dialog (OrderTemplateEditDialog)
    orderTemplateRecord: null,
    initComponent: function() {
    	this.addEvents(
    		'selectposition'	
    	);
        this.recordProxy = Tine.Billing.orderTemplatePositionBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        var expander = new Ext.ux.grid.RowExpander({
        	fixed:true,
            tpl : new Ext.Template(
                '<p><b>Beschreibung:</b> {description}</p><br>'
            )
        });

        var summary = new Ext.ux.grid.GridSummary();
        
        this.gridConfig.columns = this.getColumns(expander);
        this.gridConfig.plugins = [expander,summary];
        this.initFilterToolbar();
                
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);     
      
        this.on('afterrender',this.initDropZone, this);
        Tine.Billing.OrderTemplatePositionGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.OrderTemplatePosition.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []
        });
    },
    initGridEvents: function() {    
        this.grid.on('newentry', function(positionData){
            var position = new Tine.Billing.Model.OrderTemplatePosition(Ext.apply(this.recordClass.getDefaultData(), positionData));
            var position_nr = this.store.getCount()+1;
            position.set('position_nr', position_nr);
            Tine.Billing.orderTemplatePositionBackend.saveRecord(position, {
                scope: this,
                success: function() {
                    this.loadData(true, true, true);
                },
                failure: function () { 
                    Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save task.')); 
                }
            });
            return true;
        }, this);
        
    },
    /**
     *  Handle position selection
     *  @param	SelectionModel	sm
     */
    onRowClick: function(grid, row, e) {
    	Tine.Billing.OrderTemplatePositionGridPanel.superclass.onRowClick.call(this,grid, row, e);
    	var selections = this.grid.getSelectionModel().getSelections();
    	var selectedRecord = selections[0];
    	this.fireEvent('selectposition',this, selectedRecord);
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.OrderTemplatePositionGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	if(!this.orderTemplateRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.orderTemplateRecord;
    	filterOptions.field = 'order_template_id';
    
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
    loadOrderTemplate: function(orderTemplateRecord){
    	this.orderTemplateRecord = orderTemplateRecord;
    	this.store.reload();
    },
	getColumns: function(expander) {
		var columns = Tine.Billing.OrderTemplatePosition.GridPanelConfig.getColumns();
		return [
		  new Ext.grid.RowNumberer({width: 30}),
		  expander,
		   //columns.position_nr,
		   columns.article_id,
		   columns.name,
		   columns.price_group_id,
		   columns.unit_id,
		   columns.vat_id,
		   columns.price_netto,
		   columns.amount,
		   columns.total_netto,
		   columns.total_brutto,
		   columns.discount_percentage,
		   columns.discount_total
		];
	},
	addRecordFromArticle: function(articleRecord){
		var posArticles = this.store.collect('article_id',false,true);
		if(posArticles.indexOf(articleRecord) != -1){
			Ext.MessageBox.show({
	            title: 'Artikel bereits vorhanden', 
	            msg: 'Der Artikel ist bereits als Position vorhanden.',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.WARNING
	        });
			return;
		}
		try{
			var debitorRecord = new Tine.Billing.Model.Debitor(this.orderTemplateRecord.data.order_id.debitor_id,this.orderTemplateRecord.data.order_id.debitor_id.id);
			var debitorId = debitorRecord.get('id');
			var priceGroupRecord = new Tine.Billing.Model.PriceGroup(debitorRecord.data.price_group_id,debitorRecord.data.price_group_id.id);
			var priceGroupId = priceGroupRecord.get('id');
			var articleId = articleRecord.get('id');
			var prices = articleRecord.getPrices(debitorId, priceGroupId);
		}catch(e){
			var prices = {
					price_netto:0,
					price_brutto:0
			};
		}
		var orderTemplatePosition = Tine.Billing.Model.OrderTemplatePosition.getFromArticle(articleRecord);
		if(priceGroupRecord){
			orderTemplatePosition.set('price_group_id',priceGroupRecord.id);
		}
		orderTemplatePosition.set('price_netto', prices.price_netto);
		orderTemplatePosition.calculate();
		orderTemplatePosition.set('article_id', orderTemplatePosition.data.article_id.id);
		orderTemplatePosition.set('unit_id', orderTemplatePosition.data.unit_id.id);
		orderTemplatePosition.set('vat_id', orderTemplatePosition.data.vat_id.id);
		orderTemplatePosition.set('order_template_id', this.orderTemplateRecord.id);
		orderTemplatePosition.set('position_nr', this.store.getCount()+1);
		//var orderTemplatePositionSave = new Tine.Billing.Model.OrderTemplatePosition(orderTemplatePosition.data,orderTemplatePosition.id);
		//orderTemplatePositionSave.flatten();
	    Tine.Billing.orderTemplatePositionBackend.saveRecord(orderTemplatePosition, {
            scope: this,
            success: function() {
                this.loadData(true, true, true);
            },
            failure: function () { 
                Ext.MessageBox.alert(this.app.i18n._('Fehler'), this.app.i18n._('Position konnte nicht gespeichert werden.')); 
            }
        });
		//this.store.add([orderTemplatePosition]);
		return true;
//		this.onAddRecordFromArticle(articleRecord, orderTemplatePosition);
	},
//	onAddRecordFromArticle(article, orderTemplatePosition){
//		if(this.orderTemplateRecord.type=='CALCUATION'){
//			
//		}
//	}
	onAfterRender: function(){
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
		// if article gets dropped in: add new orderTemplate position
		case 'ddGroupArticle':
			return this.addRecordFromArticle(data.selections[0]);
			break;
		// if orderTemplate position gets dropped -> swap positions
		case 'ddGroupOrderTemplatePosition':
			break;
		}
	},
    onEditInNewWindow: function(button, event) {
        var record; 
        if (button.actionType == 'edit') {
            if (! this.action_editInNewWindow || this.action_editInNewWindow.isDisabled()) {
                // if edit action is disabled or not available, we also don't open a new window
                return false;
            }
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = selectedRows[0];
            
        } else if (button.actionType == 'copy') {
            var selectedRows = this.grid.getSelectionModel().getSelections();
            record = this.copyRecord(selectedRows[0].data);
        } else {
            record = new this.recordClass(this.recordClass.getDefaultData(), 0);
        }
        
        var popupWindow = Tine.Billing.OrderTemplatePositionEditDialog.openWindow({
            record: record,
            grid: this,
            listeners: {
                scope: this,
                'update': function(record) {
                    this.loadData(true, true, true);
                }
            }
        });
    }
});

Ext.namespace('Tine.Billing.OrderTemplatePosition.GridPanelConfig');

Tine.Billing.OrderTemplatePosition.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		position_nr:
			{ id: 'position_nr', header: app.i18n._('Nr'), dataIndex: 'position_nr', sortable:false },
		id:
			{ id: 'id', header: app.i18n._('Position-ID'), dataIndex: 'id', sortable:false },
		order_template_id:
			{ id: 'order_template_id', header: app.i18n._('Beleg-Nr'), dataIndex: 'order_template_id', sortable:false },
		article_id:
			{ id: 'article_id', header: app.i18n._('Artikel'), dataIndex: 'article_id', renderer: Tine.Billing.renderer.articleRenderer, sortable:false },
		price_group_id:
			{ id: 'price_group_id', header: app.i18n._('Preisgruppe'), dataIndex: 'price_group_id', renderer:Tine.Billing.renderer.priceGroupRenderer, sortable:false },			
		unit_id:
			{ id: 'unit_id', header: app.i18n._('Einheit'), dataIndex: 'unit_id', renderer: Tine.Billing.renderer.articleUnitRenderer, sortable:false },			
		vat_id:
			{ id: 'vat_id', header: app.i18n._('MwSt'), dataIndex: 'vat_id', renderer: Tine.Billing.renderer.vatRenderer, sortable:false },			
		price_netto:
			{ id: 'price_netto', header: app.i18n._('Preis netto'), dataIndex: 'price_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
		amount:
			{ id: 'amount', header: app.i18n._('Menge'), dataIndex: 'amount', sortable:false }	,		
		discount_percentage:
			{ id: 'discount_percentage', header: app.i18n._('Rabatt %'), dataIndex: 'discount_percentage', sortable:false },			
		discount_total:
			{ id: 'discount_total', header: app.i18n._('Rabatt EUR'), dataIndex: 'discount_total', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer },
		weight:
			{ id: 'weight', header: app.i18n._('Gewicht'), dataIndex: 'weight', sortable:false },
		name:
			{ id: 'name', header: app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:false },		
		description:
			{ id: 'description', header: app.i18n._('Beschreibung'), dataIndex: 'description', sortable:false },			
		total_netto:
			{ id: 'total_netto', header: app.i18n._('Gesamt netto EUR'), dataIndex: 'total_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer,summaryType:'sum',
	        summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer },			
		total_brutto:
			{ id: 'total_brutto', header: app.i18n._('Gesamt brutto EUR'), dataIndex: 'total_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer,summaryType:'sum',
	        summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer  },			
		total_weight:
			{ id: 'total_weight', header: app.i18n._('Gesamtgewicht'), dataIndex: 'total_weight', sortable:true },	
		optional:
			{ id: 'optional', header: app.i18n._('Optional'), dataIndex: 'optional', sortable:true }			
	};
	
}