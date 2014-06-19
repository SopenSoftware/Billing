Tine.Billing.InstantOrderPositionsGridPanel = Ext.extend(Tine.widgets.grid.EditorGridPanel, {
	stateFull:true,
	id: 'tine-billing-instant-order-positions-grid-panel',
	stateId: 'tine-billing-instant-order-positions-grid-panel-state-id',
	recordClass: Tine.Billing.Model.OrderPosition,
	clicksToEdit: 'auto',
	loadMask: true,
	autoExpandColumn: 'article_id',
	forceFit:false,
	receiptRecord: null,
	initComponent: function(){
		this.recordProxy = Tine.Billing.receiptPositionBackend;
		this.initColumnModel();
//		this.on('newentry',this.onAddEntry, this);
		this.on('validateedit', this.onEditEntry, this);
//		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.InstantOrderPositionsGridPanel.superclass.initComponent.call(this);
	},
	loadPositions: function(){
		
		var filterOptions = {};
   		filterOptions.record = this.receiptRecord;
       	filterOptions.field = 'receipt_id';
    	
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
    		return false;
    	}
    	var recordId = filterOptions.record.get('id');
    	var filter = {	
			field: filterOptions.field,
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: recordId }]
		};
		Ext.Ajax
		.request({
			scope : this,
			params : {
				method : 'Billing.searchReceiptPositions',
				filter: [filter],
				paging: {sort:"position_nr",dir:"ASC",start:0,"limit":50}
			},
			success : function(response) {
				var result = Ext.util.JSON.decode(response.responseText);
				var results = result.results;
				var record;
				this.store.removeAll();
				for(var i in results){
					if(typeof(results[i])==='object'){
						if(results[i].id !== undefined){
							record = new Tine.Billing.Model.OrderPosition(results[i],results[i].id);
							this.store.add(record);
						}
					}
				}
			},
			failure : function(response) {
				var result = Ext.util.JSON
						.decode(response.responseText);
				Ext.Msg
						.alert('Fehler',
								'Offene Posten konnten nicht abgefragt werden');
			}
		});
	},
	initColumnModel: function(){
		this.expander = new Ext.ux.grid.RowExpander({
			fixed:true,
			tpl : new Ext.Template(
            	'<p><b>Artikel-Nr:</b> {article_nr}</p>',
                '<p><b>Artikel-Nr2:</b> {article_ext_nr}</p>',
                '<p><b>Beschreibung:</b> {description}</p>'
            ),
            /**
             * redirect record to "inner record": article_record 
             */
            getBodyContent : function(record, index){
            	//this.articleStore.getAt(this.articleStore.findExact('id',recordData.article_id));
            	record = record.getForeignRecord(Tine.Billing.Model.Article, 'article_id');
            	//record = record.data.article_record;
            	
                if(!this.enableCaching){
                    return this.tpl.apply(record.data);
                }
                var content = this.bodyContent[record.id];
                if(!content){
                    content = this.tpl.apply(record.data);
                    this.bodyContent[record.id] = content;
                }
                return content;
            }
        });
		this.summary = new Ext.ux.grid.GridSummary();
		this.plugins = [this.expander, this.summary];
		this.cm = this.getColumnModel(this.expander);
	},
	getSummaryData: function(){
		return this.summary.getSummaryData();
	},
	getRowCount: function(){
		return this.store.getCount();
	},
	onStoreBeforeload: function(store, options) {
    	Tine.Billing.InstantOrderPositionsGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	var filterOptions = {};
   		filterOptions.record = this.receiptRecord;
       	filterOptions.field = 'receipt_id';
    	
    	if(!filterOptions.record){// || filterOptions.record.id == 0){
    		return false;
    	}
    	var recordId = filterOptions.record.get('id');
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
	

    onEditEntry: function(e){
    	
    	if(e.field == 'invert_amount'){
    		var maxAmount = e.record.get('amount');
    		if(e.value){
    			e.record.data[e.field] = Math.min(maxAmount, e.value);
    			this.getView().refresh();
    			return false;
    		}
    	}
    	return true;
    	
    },
    
    isValidNewEntry: function(newRecord){
    	
    	return true;
    },
	getColumnModel: function(expander) {
		var columns = [
		               new Ext.grid.RowNumberer({width: 30}),
		               expander,
		               { 
		               	id: 'article_id', header: 'Artikel', dataIndex: 'article_id', width: 120,
		   			   	renderer: Tine.Billing.renderer.articleRenderer,
		   			   	sortable:false//, 
		   		    },
		               { 
		               	id: 'name', header: 'Bezeichnung', dataIndex: 'name',
		                editor: 
		               	 	new Ext.form.TextField({
		               		 	xtype:'textfield',
		   	    				disabledClass: 'x-item-disabled-view',
		   	    			    allowBlank:true,
		   	    			    name: 'name',
		   	    			    width:100
		   	    			})
		               },
		               { 
		               	id: 'amount', header: 'Menge', dataIndex: 'amount'
		               },
		               { 
			               	id: 'invert_amount', header: 'Storno-Menge', dataIndex: 'invert_amount',
			               	editor: 
			               	 	new Ext.form.TextField({
			               		 	xtype:'textfield',
			   	    				disabledClass: 'x-item-disabled-view',
			   	    			    allowBlank:true,
			   	    			    name: 'invert_amount',
			   	    			    width:100
			   	    			})
			           },{ 
		   			   id: 'price_netto', header: 'Preis netto', dataIndex: 'price_netto', sortable:false,
		   			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		               },{ 
		            	   id: 'price_brutto', header: 'Preis brutto', dataIndex: 'price_brutto', sortable:false,
		            	   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
		               },{ 
		   			   	id: 'vat_id', 
		   			   	header: 'MwSt', 
		   			   	width:100, 
		   			   	dataIndex: 'vat_id', 
		   			   	renderer: Tine.Billing.renderer.vatRenderer,
		   			   	sortable:false 
		   		   },{ 
		   			   	id: 'price_group_id', 
		   			   	header: 'Preisgruppe', 
		   			   	width:100, 
		   			   	dataIndex: 'price_group_id', 
		   			   	renderer: Tine.Billing.renderer.priceGroupRenderer,
		   			   	sortable:false
		   		   },{
		   			    id:'discount_percentage',
		   			    dataIndex:'discount_percentage',
		   			    renderer: Ext.ux.PercentRenderer,
		   			    header: 'Rabatt %'
		   		 	},{ 
		   				   id: 'total_netto', header: 'ges. netto', dataIndex: 'total_netto', sortable:false,
		   				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		   		 	},{ 
		   				   id: 'total_brutto', header: 'ges. brutto', dataIndex: 'total_brutto', sortable:false,
		   				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		   		 	},{ 
		   				   id: 'total2_netto', header: 'Zuschl. ges. netto', dataIndex: 'total2_netto', sortable:false,hidden:true,
		   				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		   		 	},{ 
		   				   id: 'total2_brutto', header: 'Zuschl. ges. brutto', dataIndex: 'total2_brutto', sortable:false,hidden:true,
		   				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer, summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer 
		   		 	},{ 
		               	id: 'comment', header: 'Bemerkung', dataIndex: 'comment',
		            	editor: 
		               	 	new Ext.form.TextField({
		               		 	xtype:'textfield',
		   	    				disabledClass: 'x-item-disabled-view',
		   	    			    allowBlank:true,
		   	    			    name: 'comment'
		   	    			})
		               }
		           ];
        if(!this.ccm){
        	this.ccm = new Ext.grid.ColumnModel({ 
                defaults: {
                    sortable: false,
                    resizable: true
                },
                columns: columns
            });
        }
        return this.ccm;
    },
    checkAmount: function( record ){
    	return true;
    },
    checkArticleNumber: function( record ){
    	return true;
    },
    onArticleInitializeError: function(){
    	
    },
    addRecordFromArticle: function(articleRecord){
    	
	},
	getValues: function(){
		var result = {
			count: 0,
			sumProposalPaymentAmount: 0,
			sumPaymentAmount: 0
		};

		this.store.each(function(record) {                     
            result.count ++;
            result.sumProposalPaymentAmount += record.get('proposal_payment_amount');
            result.sumPaymentAmount += record.get('payment_amount');
        }, this);
        
        return result;
	},
	getFromStoreAsArray: function() {
        var result = [];
        this.store.each(function(record) {  
        	var data = {
        		id: record.data.id,
        		invert_amount: record.data.invert_amount
        	}
            this.push(data);
        }, result);
        
        return result;
    }
});