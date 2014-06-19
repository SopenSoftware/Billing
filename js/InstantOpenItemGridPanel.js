Tine.Billing.InstantOpenItemGridPanel = Ext.extend(Tine.widgets.grid.EditorGridPanel, {
	stateFull:true,
	id: 'tine-billing-instant-open-item-grid-panel',
	stateId: 'tine-billing-instant-open-item-grid-panel-state-id',
	recordClass: Tine.Billing.Model.OpenItemPayment,
	clicksToEdit: 'auto',
	loadMask: true,
	//quickaddMandatory: 'debitor_id',
	autoExpandColumn: 'debitor_id',
	forceFit:false,
	initComponent: function(){
		//this.articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
		//this.articleStore.reload();
		//this.priceGroupStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
		//this.priceGroupStore.reload();
		this.initColumnModel();
		this.on('newentry',this.onAddEntry, this);
		this.on('validateedit', this.onEditEntry, this);
		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.InstantOpenItemGridPanel.superclass.initComponent.call(this);
	},
	
	initColumnModel: function(){
		
		this.summary = new Ext.ux.grid.GridSummary();
		this.plugins = [this.summary];
		this.cm = this.getColumnModel();
	},
	getSummaryData: function(){
		return this.summary.getSummaryData();
	},
	getRowCount: function(){
		return this.store.getCount();
	},
	loadDebitorData: function(data){
		if(data.orderRecord !== undefined){
			this.orderRecord = data.orderRecord;
		}
		if(data.receiptRecord !== undefined){
			this.receiptRecord = data.receiptRecord;
		}
		try{
			this.debitorRecord = data.debitorRecord;
		}catch(e){
			this.debitorRecord = null;
			this.debitorId = null;
		}
		this.contactRecord = data.contactRecord;
		
		
	},
	/**
	 * When entry is added to the store
	 * create new add line at once - this has to be a mass grid
	 */
	onAddEntry: function(data){
		//this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
		return true;
	},
    onNewentry: function(recordData) {
        
	 	Tine.Billing.InstantOpenItemGridPanel.superclass.onNewentry.call(this,recordData.data);
		
	 	//this.getColumnModel().getColumnById('article_id').quickaddField.setValue(null);
       	//this.getColumnModel().getColumnById('amount').quickaddField.setValue(0);
       	
       	return true;
    },
    inspectAdd: function(record){
    	//record.calculate();
    },
//    addNewItem: function(newRecord){
//    	Tine.Billing.InstantOpenItemGridPanel.superclass.onNewentry.call(this,newRecord.data);
//    },
    onEditEntry: function(e){
    	
    	return true;
    	// !! take care: every change within the record causes a record.commit in the background
    	// means the changes get stored multiply!! Don't flatten the original record, as this means changes too!
    	/*
    	switch(e.field){
    	case 'amount':
    	case 'price_brutto':
    	case 'price_netto':
    	case 'price2_brutto':
    	case 'price2_netto':
    	case 'discount_percentage':
    	case 'add_percentage':
    	case 'price_group_id':
    	case 'vat_id':
    	case 'price2_vat_id':
    		e.record.data[e.field] = e.value;
    		break;
    	}
    	
    	//e.record.data[e.field] = e.value;
		var priceGroupId = e.record.getForeignId('price_group_id');
		
		var articleRecord = e.record.getForeignRecord(Tine.Billing.Model.Article,'article_id');
		//var articleId = articleRecord;
		if(!articleRecord){
			articleRecord = this.articleStore.getAt(this.articleStore.findExact('id',e.record.data.article_id));
		}
		e.record.data.article_record = articleRecord;
		e.record.data.price_group_id = Tine.Billing.getPriceGroupById(priceGroupId);
		e.record.data.vat_id = Tine.Billing.getVatById(e.record.data.vat_id);
		
    	if(this.perspective == 'receipt' && this.receiptRecord.get('type')=='CREDIT' && e.record.data.amount>0){
    		e.record.data.amount *= (-1);
    	}
    	switch(e.field){
    	case 'price_group_id':
			var prices = articleRecord.getPrices(this.debitorId, priceGroupId);
			e.record.data.price_netto = prices.price_netto;
			e.record.data.price_brutto = prices.price_brutto;
    	case 'price_netto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO);
    		break;
    	case 'price_brutto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
    		break;
    	case 'price2_netto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO);
    		break;
    	case 'price2_brutto':
    		e.record.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
    		break;
    	default:
    		e.record.calculate();
    	}*/
   		this.getView().refresh();
    	return true;
    },
    
    isValidNewEntry: function(newRecord){
    	
    	return true;
    },
	getColumnModel: function() {
		var columns = [
		   { header: this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true },
			{ header: this.app.i18n._('VwZw'), dataIndex: 'usage', sortable:true },   
					               
		    { id: 'debitor_id', header: this.app.i18n._('Kunde'), 
		    	dataIndex: 'debitor_id', sortable:true, 
		    	renderer: Tine.Billing.renderer.debitorRenderer },			
		        	
		    { id: 'receipt_id', header: this.app.i18n._('Beleg'), 
		    		dataIndex: 'receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },			
		    { id: 'receipt_date', header: this.app.i18n._('Beleg-Datum'), dataIndex: 'receipt_date', renderer: Tine.Tinebase.common.dateRenderer },
			{ id: 'type', header: this.app.i18n._('Typ'), dataIndex: 'type', sortable:true },
			{ id: 'due_date', header: this.app.i18n._('Datum Fälligkeit'), dataIndex: 'due_date', renderer: Tine.Tinebase.common.dateRenderer },
			{
				   id: 'total_brutto', header: 'Gesamt brutto', dataIndex: 'total_brutto', sortable:false,
				   renderer: Sopen.Renderer.MonetaryNumFieldRenderer
				   , summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer
			},			
            /*{ 
			   id: 'proposal_payment_amount', header: 'Bezahlung Vorschlag', dataIndex: 'proposal_payment_amount', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   resizable:false,
			   summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
		        })
            },*/{ 
			   id: 'payment_amount', header: 'Bezahlung', dataIndex: 'payment_amount', sortable:false,
			   renderer: Sopen.Renderer.MonetaryNumFieldRenderer,
			   resizable:false,
			   summaryType:'sum', summaryRenderer:Sopen.Renderer.MonetaryNumFieldRenderer,
			   editor: new Sopen.CurrencyField({
		            emptyText: 'Preis eingeben',
		            allowBlank:false
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
    	/*if(!record.get('amount') || record.get('amount') < 0){
    		Ext.Msg.alert(
    			'Fehler', 
                'Bitte geben Sie die Menge ein.'
            );
    		return false;
    	}*/
    	return true;
    },
    checkArticleNumber: function( record ){
    	return true;
    },
    onArticleInitializeError: function(){
    	/*this.disable();
    	Ext.Msg.alert(
			'Fehler', 
            'Die Artikel zur Auftragserfassung konnten nicht initialisiert werden.<br/>Bitte schliessen Sie das Fenster.'
        );*/
    },
    addRecordFromArticle: function(articleRecord){
    	/*this.aRecord = articleRecord;
    	this.onNewentry({article_id:articleRecord.get('id')});
    	return;*/
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
	onAfterRender: function(){
		//this.colModel.getColumnById(this.quickaddMandatory).quickaddField.focus();
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
		case 'ddGroupReceipt':
			return this.addRecordFromReceipt(data.selections[0]);
			break;
		// if receipt position gets dropped -> swap positions
		case 'ddGroupOpenItem':
			break;
		}
	},
	getFromStoreAsArray: function() {
        var result = [];
        this.store.each(function(record) {  
        	var data = {
        		id: record.data.id,
        		payment_amount: record.data.payment_amount
        	}
            this.push(data);
        }, result);
        
        return result;
    }
});