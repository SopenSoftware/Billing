Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.SupplyOrderPositionGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-supply-receipt-position-gridpanel',
	recordClass: Tine.Billing.Model.SupplyOrderPosition,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'position_nr', direction: 'ASC'},
    ddConfig:{
    	ddGroup: 'ddGroupArticle'
    },
    gridConfig: {
        loadMask: true,
        enableDragDrop:true,
        ddGroup: 'ddGroupSupplyOrderPosition',
	   	 selfTarget:true,
	     //selectAfterDrop:true,
	     ignoreSelf:false
        //autoExpandColumn: 'id'
    },
    // gets injected by parent dialog (ReceiptEditDialog)
    supplyReceiptRecord: null,
    initComponent: function() {
        this.recordProxy = Tine.Billing.supplyorderPositionBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        var expander = new Ext.ux.grid.RowExpander({
        	fixed:true,
            tpl : new Ext.Template(
                '<p><b>Beschreibung:</b> {description}</p><br>'
            )
        });

        this.gridConfig.columns = this.getColumns(expander);
        this.gridConfig.plugins = [expander];
        this.initFilterToolbar();
                
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);     
      
        this.on('afterrender',this.initDropZone, this);
        Tine.Billing.SupplyOrderPositionGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.SupplyOrderPosition.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: []
        });
    },
    initGridEvents: function() {    
        this.grid.on('newentry', function(positionData){
            var position = new Tine.Billing.Model.SupplyOrderPosition(Ext.apply(this.recordClass.getDefaultData(), positionData));
            var position_nr = this.store.getCount()+1;
            position.set('position_nr', position_nr);
            Tine.Billing.supplyorderPositionBackend.saveRecord(position, {
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
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.SupplyOrderPositionGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	
    	if(!this.supplyReceiptRecord){
    		return true;
    	}
    	var filterOptions = {};
    	filterOptions.record = this.supplyReceiptRecord;
    	filterOptions.field = 'supply_receipt_id';
    
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
	getColumns: function(expander) {
		var columns = Tine.Billing.SupplyOrderPosition.GridPanelConfig.getColumns();
		return [
		  new Ext.grid.RowNumberer({width: 30}),
		  expander,
		   //columns.position_nr,
		   columns.article_id,
		   columns.name,
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
		var creditorRecord = new Tine.Billing.Model.Creditor(this.supplyReceiptRecord.data.supply_order_id.creditor_id,this.supplyReceiptRecord.data.supply_order_id.creditor_id.id);
		var creditorId = creditorRecord.get('id');
		var articleId = articleRecord.get('id');
		var prices = articleRecord.getPricesForCreditor(creditorId);
		var OrderPosition = Tine.Billing.Model.SupplyOrderPosition.getFromArticle(articleRecord);
		OrderPosition.set('price_netto', prices.price_netto);
		OrderPosition.calculate();
		OrderPosition.set('article_id', OrderPosition.data.article_id.id);
		OrderPosition.set('unit_id', OrderPosition.data.unit_id.id);
		OrderPosition.set('vat_id', OrderPosition.data.vat_id.id);
		OrderPosition.set('position_nr', this.store.getCount()+1);
		OrderPosition.set('supply_receipt_id', this.supplyReceiptRecord.get('id'));
		Tine.Billing.supplyorderPositionBackend.saveRecord(OrderPosition, {
	            scope: this,
	            success: function() {
	                this.loadData(true, true, true);
	            },
	            failure: function () { 
	                Ext.MessageBox.alert(this.app.i18n._('Fehler'), this.app.i18n._('Position konnte nicht gespeichert werden.')); 
	            }
	    });
		return true;
	},
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
		// if article gets dropped in: add new receipt position
		case 'ddGroupArticle':
			this.addRecordFromArticle(data.selections[0]);
			break;
		// if receipt position gets dropped -> swap positions
		case 'ddGroupSupplyOrderPosition':
			/*console.log(ddSource);
			console.log(e);
			console.log(data);
			 var selectedRows = this.grid.getSelectionModel();
			 console.log(selectedRows);*/
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
        
        var popupWindow = Tine.Billing.SupplyOrderPositionEditDialog.openWindow({
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

Ext.namespace('Tine.Billing.SupplyOrderPosition.GridPanelConfig');

Tine.Billing.SupplyOrderPosition.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		position_nr:
			{ id: 'position_nr', header: app.i18n._('Nr'), dataIndex: 'position_nr', sortable:false },
		id:
			{ id: 'id', header: app.i18n._('Position-ID'), dataIndex: 'id', sortable:false },
		receipt_id:
			{ id: 'receipt_id', header: app.i18n._('Beleg-Nr'), dataIndex: 'receipt_id', sortable:false },
		article_id:
			{ id: 'article_id', header: app.i18n._('Artikel'), dataIndex: 'article_id', renderer: Tine.Billing.renderer.articleRenderer, sortable:false },
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
			{ id: 'total_netto', header: app.i18n._('Gesamt netto EUR'), dataIndex: 'total_netto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer },			
		total_brutto:
			{ id: 'total_brutto', header: app.i18n._('Gesamt brutto EUR'), dataIndex: 'total_brutto', sortable:false, renderer: Sopen.Renderer.MonetaryNumFieldRenderer  },			
		total_weight:
			{ id: 'total_weight', header: app.i18n._('Gesamtgewicht'), dataIndex: 'total_weight', sortable:true },	
		optional:
			{ id: 'optional', header: app.i18n._('Optional'), dataIndex: 'optional', sortable:true }			
	};
	
}