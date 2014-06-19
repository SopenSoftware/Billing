Ext.namespace('Tine.Billing');

Tine.Billing.ProductionCostGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-production-cost-gridpanel',
   recordClass: Tine.Billing.Model.ProductionCost,
   evalGrants: false,
   OrderPositionRecord: null,
   // grid specific
   defaultSortInfo: {field: 'id', direction: 'DESC'},
   frame:true,
   gridConfig: {
       clicksToEdit: 'auto',
       loadMask: true,
       quickaddMandatory: 'type',
       autoExpandColumn: 'type'
   },
   initComponent: function() {
       this.recordProxy = Tine.Billing.productionCostBackend;
       
       //this.actionToolbarItems = this.getToolbarItems();
       this.gridConfig.columns = this.getColumns();
       //this.initFilterToolbar();
       
       //this.plugins = this.plugins || [];
       //this.plugins.push(this.filterToolbar);        
       
       Tine.Billing.ProductionCostGridPanel.superclass.initComponent.call(this);
       this.initGridEvents();
   },
   initFilterToolbar: function() {
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
           app: this.app,
           filterModels: Tine.Billing.Model.ProductionCost.getFilterModel(),
           defaultFilter: 'query',
           filters: [{field:'query',operator:'contains',value:''}],
           plugins: []
       });
   },  
   loadOrderPosition: function(OrderPosition){
	   var reload = false;
	   if((!this.OrderPositionRecord) || OrderPosition.id !== this.OrderPositionRecord.id){
		   reload = true;
	   }
	   
	   this.OrderPositionRecord = OrderPosition;

	   if(reload){
		   this.store.reload();
	   }
   },
   onUpdateOrderPosition: function(grid, OrderPosition){
	   this.enable();
	   this.loadOrderPosition(OrderPosition);
   },
   onStoreBeforeload: function(store, options) {
   	Tine.Billing.ArticleCustomerGridPanel.superclass.onStoreBeforeload.call(this, store, options);
   	var filterOptions = {};
   	filterOptions.record = this.OrderPositionRecord;
   	filterOptions.field = 'receipt_position_id';
   	
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
       this.grid.on('newentry', function(productionCostData){
    	var data = this.recordClass.getDefaultData();
       	Ext.apply(data, productionCostData);
       	var productionCost = new Tine.Billing.Model.ProductionCost(data,0);
       	productionCost.set('receipt_position_id',this.OrderPositionRecord.get('id'));
       	Tine.Billing.productionCostBackend.saveRecord(productionCost, {
               scope: this,
               success: function() {
                   this.loadData(true, true, true);
               },
               failure: function () { 
                   Ext.MessageBox.alert(this.app.i18n._('Failed'), this.app.i18n._('Could not save production cost record.')); 
               }
           });
           return true;
       }, this);
   },

	getColumns: function() {
		return [
				{ 
				   	id: 'type', 
				   	header: 'Typ', 
				   	width:100, 
				   	dataIndex: 'type', 
				   	renderer: Tine.Billing.renderer.productionCostTypeRenderer,
				   	sortable:true, 
				   	editor: new Ext.form.ComboBox({
						disabledClass: 'x-item-disabled-view',
						//allowBlank:false,
					    autoExpand: true,
					    store:[['DELIVERY','Lieferung'],['OWNPRODUCTION','Eigenleistung'],['STOCK','Lager'],['MANUAL','Manuell']],
					    value: 'OWNPRODUCTION',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}),
		            quickaddField: new Ext.form.ComboBox({
						disabledClass: 'x-item-disabled-view',
						//allowBlank:false,
					    autoExpand: true,
					    store:[['DELIVERY','Lieferung'],['OWNPRODUCTION','Eigenleistung'],['STOCK','Lager'],['MANUAL','Manuell']],
					    value: 'OWNPRODUCTION',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
	    			})
			   },
				{ 
					id: 'creditor_id', 
				   	header: 'Lieferant', 
				   	width:100, 
				   	dataIndex: 'creditor_id', 
				   	renderer: Tine.Billing.renderer.creditorRenderer,
				   	hidden:true,
				   	disabled:true,
				   	sortable:true,
		            editor: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
	    				disabledClass: 'x-item-disabled-view',
	    				recordClass: Tine.Billing.Model.Creditor,
	    			    allowBlank:false,
	    			    autoExpand: true,
					    ddConfig:{
				        	ddGroup: 'ddGroupCreditor'
				        }
	    			}),
		            quickaddField: new Tine.Tinebase.widgets.form.RecordPickerComboBox({
	    				disabledClass: 'x-item-disabled-view',
	    				recordClass: Tine.Billing.Model.Creditor,
	    			    allowBlank:false,
	    			    autoExpand: true,
					    ddConfig:{
				        	ddGroup: 'ddGroupCreditor'
				        }
	    			})
			   },
			  { 
				   id: 'ek_netto', header: 'EK netto', dataIndex: 'ek_netto', sortable:true,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
				   editor: new Sopen.CurrencyField({
			            allowBlank:false
			        }),
				   quickaddField: new Sopen.CurrencyField({
					    allowBlank:false
			        })
			  },
			  {
				  header: "Variante", 
				  width: 80, 
				  sortable: true, 
				  dataIndex: 'category',
				   	editor: new Ext.form.ComboBox({
						disabledClass: 'x-item-disabled-view',
						allowBlank:false,
					    autoExpand: true,
					    store:[['I','I'],['II','II'],['III','III'],['IV','IV']],
					    value: 'I',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}),
		            quickaddField: new Ext.form.ComboBox({
						disabledClass: 'x-item-disabled-view',
						allowBlank:false,
					    autoExpand: true,
					    store:[['I','I'],['II','II'],['III','III'],['IV','IV']],
					    value: 'I',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
	    			})
			  }      
			];
	}
});