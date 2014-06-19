Ext.namespace('Tine.Billing.Custom');

Tine.Billing.Custom.getArticleRecordPicker = function(id, config){
	if(!id){
		id = 'articleEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Article,
		fieldLabel: 'Artikel',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    itemSelector: 'div.search-item',
	    onBeforeQuery: function(qevent){
	    	this.store.baseParams.filter = [
	            {field: 'query', operator: 'contains', value: qevent.query }
	            //{field: 'article_nr', operator: 'startswith', value: qevent.query }
	        ];
	    	this.store.baseParams.sort = 'article_nr';
	    	this.store.baseParams.dir = 'ASC';
	    },
	    onBeforeLoad: function(store, options) {
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = 'article_nr';
	        options.params.dir = 'ASC';
	        options.params.paging.sort = 'article_nr';
		    options.params.paging.dir = 'ASC';
	    },
	    tpl:new Ext.XTemplate(
	            '<tpl for="."><div class="search-item">',
	                '<table cellspacing="0" cellpadding="2" border="0" style="font-size: 11px;" width="100%">',
	                    '<tr  style="font-size: 11px;border-bottom:1px solid #000000;">',
	                        '<td width="30%"><b>{[this.encode(values.article_nr)]}</b><br/>##{[this.encode(values.article_ext_nr)]}</td>',
	                        '<td width="70%">{[this.encode(values.name)]}<br/>',
	                            'Beschreibung: {[this.encode(values.description)]}</td>',
	                    '</tr>',
	                '</table>',
	            '</div></tpl>',
	            {
	                encode: function(value) {
	                     if (value) {
	                        return Ext.util.Format.htmlEncode(value);
	                    } else {
	                        return '';
	                    }
	                }
	            }
	        )
	},config));
};

Tine.Billing.Custom.getPriceGroupRecordPicker = function(id, config){
	if(!id){
		id = 'priceGroupEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.PriceGroup,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getDebitorGroupRecordPicker = function(id, config){
	if(!id){
		id = 'debitorGroupEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.DebitorGroup,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getVatRecordPicker = function(id, config){
	if(!id){
		id = 'vatEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Vat,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getCreditorRecordPicker = function(id, config){
	if(!id){
		id = 'creditorEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Creditor,
		fieldLabel: 'Lieferant',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getDebitorRecordPicker = function(id, config){
	if(!id){
		id = 'debitorEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Debitor,
		fieldLabel: 'Kunde',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getStockLocationRecordPicker = function(id, config){
	if(!id){
		id = 'stockLocationEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.StockLocation,
		fieldLabel: 'Lagerort',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getOrderTemplateRecordPicker = function(id, config){
	if(!id){
		id = 'orderTemplateEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.OrderTemplate,
		fieldLabel: 'Auftragsvorlage',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getOrderRecordPicker = function(id, config){
	if(!id){
		id = 'orderEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Order,
		fieldLabel: 'Auftrag',
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    debitor: null,
	    setDebitor: function(debitor){
	    	this.debitor = debitor;
	    },
	    onBeforeQuery: function(qevent){
	    	this.store.baseParams.filter = [
	            {field: 'query', operator: 'contains', value: qevent.query }
	        ];
	    	if(this.debitor){
	    		this.store.baseParams.filter = this.store.baseParams.filter.concat(
	    			[
						{	
							field:'debitor_id',
							operator:'AND',
							value:[{
								field:'id',
								operator:'equals',
								value: this.debitor.get('id')}]
						}
	    			]
	    		);
	    	}
	    	this.store.baseParams.sort = 'order_nr';
	    	this.store.baseParams.dir = 'DESC';
	    },
	    onBeforeLoad: function(store, options) {
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = 'order_nr';
	        options.params.dir = 'DESC';
	        options.params.paging.sort = 'order_nr';
		    options.params.paging.dir = 'DESC';
	    }
	}, config));
};


Tine.Billing.Custom.getPaymentMethodRecordPicker = function(id, config){
	if(!id){
		id = 'paymentMethodEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.PaymentMethod,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    autoSelectDefault:false,
	    hasDefault:true,
	    onBeforeQuery: function(qevent){
	    	this.store.baseParams.filter = [
	            {field: 'query', operator: 'contains', value: qevent.query }
	        ];
	    	this.store.baseParams.sort = 'sort_order';
	    	this.store.baseParams.dir = 'ASC';
	    },
	    onBeforeLoad: function(store, options) {
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = 'sort_order';
	        options.params.dir = 'ASC';
	        options.params.paging.sort = 'sort_order';
		    options.params.paging.dir = 'ASC';
	    }
	}, config));
};

Tine.Billing.Custom.getInvoiceRecordPicker = function(id, config){
	if(!id){
		id = 'invoiceEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Receipt,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    hasDefault:true,
	    order: null,
	    setOrder: function(order){
	    	this.order = order;
	    },
	    onBeforeQuery: function(qevent){
	    	this.store.baseParams.filter = [
	            {field: 'query', operator: 'contains', value: qevent.query },
	            {field: 'type', operator: 'equals', value: 'INVOICE' }
	        ];
	    	if(this.order){
	    		this.store.baseParams.filter = this.store.baseParams.filter.concat(
	    			[
						{	
							field:'order_id',
							operator:'AND',
							value:[{
								field:'id',
								operator:'equals',
								value: this.order.get('id')}]
						}
	    			]
	    		);
	    	}
	    	this.store.baseParams.sort = 'invoice_nr';
	    	this.store.baseParams.dir = 'DESC';
	    },
	    onBeforeLoad: function(store, options) {
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = 'invoice_nr';
	        options.params.dir = 'DESC';
	        options.params.paging.sort = 'invoice_nr';
		    options.params.paging.dir = 'DESC';
	    }
	}, config));
};

Tine.Billing.Custom.getAccountClassRecordPicker = function(id, config){
	if(!id){
		id = 'accountClassEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.AccountClass,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getAccountSystemRecordPicker = function(id, config){
	if(!id){
		id = 'accountSystemEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.AccountSystem,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    itemSelector: 'div.search-item',
	    tpl:new Ext.XTemplate(
	            '<tpl for="."><div class="search-item">',
	                '<table cellspacing="0" cellpadding="2" border="0" style="font-size: 11px;" width="100%">',
	                    '<tr  style="font-size: 11px;border-bottom:1px solid #000000;">',
	                        '<td width="100%"><b>{[this.encode(values.number)]} &nbsp [Saldo: {[this.encode(values.credit_saldo-values.debit_saldo)]} EUR]</b><br/>##{[this.encode(values.name)]}</td>',
	                    '</tr>',
	                '</table>',
	            '</div></tpl>',
	            {
	                encode: function(value) {
	                     if (value) {
	                        return Ext.util.Format.htmlEncode(value);
	                    } else {
	                        return '';
	                    }
	                }
	            }
	        ),
        onBeforeQuery: function(qevent){
	    	this.store.baseParams.filter = [
	            {field: 'query', operator: 'contains', value: qevent.query }
	        ];
	    	this.store.baseParams.sort = 'number';
	    	this.store.baseParams.dir = 'ASC';
	    },
	    onBeforeLoad: function(store, options) {
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = 'number';
	        options.params.dir = 'ASC';
	        options.params.paging.sort = 'number';
		    options.params.paging.dir = 'ASC';
	    }
	}, config));
};

Tine.Billing.Custom.getArticleSeriesRecordPicker = function(id, config){
	if(!id){
		id = 'articleSeriesEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.ArticleSeries,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getBookingRecordPicker = function(id, config){
	if(!id){
		id = 'bookingEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Booking,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getBookingTemplateRecordPicker = function(id, config){
	if(!id){
		id = 'bookingTemplateEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.BookingTemplate,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getAccountBookingRecordPicker = function(id, config){
	if(!id){
		id = 'accountBookingEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.AccountBooking,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getPaymentRecordPicker = function(id, config){
	if(!id){
		id = 'paymentEditorField';
	}
	var obj = {
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Payment,
	    allowBlank:true,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    itemSelector: 'div.search-item',
	    sortField: 'id',
	    debitorRecord: null,
	    useDebitor: false,
	    //displayFunc: 'getQualifiedTitle',
	    appendFilters:[],
	    setDebitorRecord: function(rec){
	    	this.debitorRecord = rec;
	    	this.setValue(null);
	    	//this.store.removeAll();
	    	//this.store.reload();
	    },
	    onBeforeQuery: function(qevent){
	    	if(this.useDebitor && !this.debitorRecord){
	    		return false;
	    	}
	    	
	    	this.store.baseParams.filter = [
	    	       {field: 'query', operator: 'contains', value: qevent.query }                                
	    	];
	    	if(this.debitorRecord){
	    		var contactFilter = {	
	    			field:'debitor_id',
	    			operator:'AND',
	    			value:[{
	    				field:'id',
	    				operator:'equals',
	    				value: this.debitorRecord.get('id')}]
	    		};
	    		this.store.baseParams.filter.push(contactFilter);
	    	}
	    	
	    	this.store.baseParams.filter = this.store.baseParams.filter.concat(this.appendFilters);
	    	this.store.baseParams.sort = this.sortField;
	    	this.store.baseParams.dir = 'ASC';
	    },
	    onBeforeLoad: function(store, options) {
	    	if(this.useDebitor && !this.debitorRecord){
	    		return false;
	    	}
	    	options.params.filter = [];
    		options.params.filter.push({field: 'query', operator: 'contains', value: '' });  
	    	if(this.debitorRecord){
	    		var contactFilter = {	
	    			field:'debitor_id',
	    			operator:'AND',
	    			value:[{
	    				field:'id',
	    				operator:'equals',
	    				value: this.debitorRecord.get('id')}]
	    		};
	    		  
	    		options.params.filter.push(contactFilter);
	    	}
	    	
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = this.sortField;
	        options.params.dir = 'ASC';
	        options.params.paging.sort = this.sortField;
		    options.params.paging.dir = 'ASC';
	    },
	    tpl: new Ext.XTemplate(
            '<tpl for="."><div class="search-item">',
                '<table cellspacing="0" cellpadding="2" border="0" style="font-size: 11px;" width="100%">',
                    '<tr>',
                        '<td width="30%"><b>{[this.encode(values.id)]}</b><br/>{[this.encode(values.amount)]}</td>',
                        '<td width="25%">{[this.encode(values.payment_date)]}</td>',
                    '</tr>',
                '</table>',
            '</div></tpl>',
            {
                encode: function(value) {
                     if (value) {
                        return Ext.util.Format.htmlEncode(value);
                    } else {
                        return '';
                    }
                }
            }
        )
	};
	Ext.apply(obj,config);
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(obj);
};

Tine.Billing.Custom.getBankRecordPicker = function(id, config){
	if(!id){
		id = 'bankEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.Bank,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getBankAccountRecordPicker = function(id, config){
	/*if(!id){
		id = 'bankAccountEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.BankAccount,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
	
	*/
	if(!id){
		id = 'bankAccountEditorField';
	}
	var obj = {
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.BankAccount,
	    allowBlank:true,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true,
	    itemSelector: 'div.search-item',
	    sortField: 'id',
	    contactId: null,
	    useContact: false,
	    appendFilters:[],
	    setUseContact: function(useContact){
	    	this.useContact = useContact;
	    },
	    setContactId: function(contactId){
	    	this.contactId = contactId;
	    	this.setValue(null);
	    },
	    clearStore: function(){
	    	this.store.removeAll(true);
	    },
	    loadStore: function(){
	    	this.store.reload();
	    },
	    onBeforeQuery: function(qevent){
	    	if(this.useContact && !this.contactId){
	    		return false;
	    	}
	    	
	    	this.store.baseParams.filter = [
	    	       {field: 'query', operator: 'contains', value: qevent.query }                                
	    	];
	    	if(this.contactId && this.useContact){
	    		var contactFilter = {	
	    			field:'contact_id',
	    			operator:'AND',
	    			value:[{
	    				field:'id',
	    				operator:'equals',
	    				value: this.contactId}]
	    		};
	    		this.store.baseParams.filter.push(contactFilter);
	    	}
	    	
	    	this.store.baseParams.filter = this.store.baseParams.filter.concat(this.appendFilters);
	    	this.store.baseParams.sort = this.sortField;
	    	this.store.baseParams.dir = 'ASC';
	    },
	    onBeforeLoad: function(store, options) {
	    	if(this.useContact && !this.contactId){
	    		return false;
	    	}
	    	var sval = '' || store.baseParams['query'];
	    	options.params.filter = [];
	    	options.params.filter.push({field: 'query', operator: 'contains', value: sval}); 
    		if(this.contactId && this.useContact){
	    		var contactFilter = {	
	    			field:'contact_id',
	    			operator:'AND',
	    			value:[{
	    				field:'id',
	    				operator:'equals',
	    				value: this.contactId}]
	    		};
	    		  
	    		options.params.filter.push(contactFilter);
	    	}
	    	
	        options.params.paging = {
                start: options.params.start,
                limit: options.params.limit
            };
	        options.params.sort = this.sortField;
	        options.params.dir = 'ASC';
	        options.params.paging.sort = this.sortField;
		    options.params.paging.dir = 'ASC';
	    },
	    tpl: new Ext.XTemplate(
            '<tpl for="."><div class="search-item">',
                '<table cellspacing="0" cellpadding="2" border="0" style="font-size: 11px;" width="100%">',
                    '<tr>',
                        '<td width="30%"><b>{[this.encode(values.iban)]}</b><br/>{[this.encode(values.name)]}</td>',
                        '<td width="25%">{[this.encode(values.bank_name)]}</td>',
                    '</tr>',
                '</table>',
            '</div></tpl>',
            {
                encode: function(value) {
                     if (value) {
                        return Ext.util.Format.htmlEncode(value);
                    } else {
                        return '';
                    }
                }
            }
        )
	};
	Ext.apply(obj,config);
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(obj);
};

Tine.Billing.Custom.getSepaCreditorRecordPicker = function(id, config){
	if(!id){
		id = 'sepaCreditorEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.SepaCreditor,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getSepaMandateRecordPicker = function(id, config){
	if(!id){
		id = 'sepaMandateEditorField';
	}
	return new Tine.Tinebase.widgets.form.RecordPickerComboBox(Ext.apply({
		id:id,
		disabledClass: 'x-item-disabled-view',
		recordClass: Tine.Billing.Model.SepaMandate,
	    allowBlank:false,
	    autoExpand: true,
	    triggerAction: 'all',
	    selectOnFocus: true
	}, config));
};

Tine.Billing.Custom.getRecordPicker = function(modelName, id, config){
	switch(modelName){
	case 'Article':
		return Tine.Billing.Custom.getArticleRecordPicker(id, config);
	case 'PriceGroup':
		return Tine.Billing.Custom.getPriceGroupRecordPicker(id, config);
	case 'DebitorGroup':
		return Tine.Billing.Custom.getDebitorGroupRecordPicker(id, config);
	case 'Vat':
		return Tine.Billing.Custom.getVatRecordPicker(id, config);
	case 'Debitor':
		return Tine.Billing.Custom.getDebitorRecordPicker(id, config);
	case 'Creditor':
		return Tine.Billing.Custom.getCreditorRecordPicker(id, config);
	case 'StockLocation':
		return Tine.Billing.Custom.getStockLocationRecordPicker(id, config);
	case 'OrderTemplate':
		return Tine.Billing.Custom.getOrderTemplateRecordPicker(id, config);
	case 'Order':
		return Tine.Billing.Custom.getOrderRecordPicker(id, config);
	case 'Invoice':
		return Tine.Billing.Custom.getInvoiceRecordPicker(id, config);
	case 'PaymentMethod':
		return Tine.Billing.Custom.getPaymentMethodRecordPicker(id, config);
	case 'AccountClass':
		return Tine.Billing.Custom.getAccountClassRecordPicker(id, config);
	case 'AccountSystem':
		return Tine.Billing.Custom.getAccountSystemRecordPicker(id, config);
	case 'ArticleSeries':
		return Tine.Billing.Custom.getArticleSeriesRecordPicker(id, config);
	case 'Booking':
		return Tine.Billing.Custom.getBookingRecordPicker(id, config);
	case 'BookingTemplate':
		return Tine.Billing.Custom.getBookingTemplateRecordPicker(id, config);		
	case 'AccountBooking':
		return Tine.Billing.Custom.getAccountBookingRecordPicker(id, config);
	case 'Payment':
		return Tine.Billing.Custom.getPaymentRecordPicker(id, config);
	case 'Bank':
		return Tine.Billing.Custom.getBankRecordPicker(id, config);
	case 'BankAccount':
		return Tine.Billing.Custom.getBankAccountRecordPicker(id, config);
	case 'SepaCreditor':
		return Tine.Billing.Custom.getSepaCreditorRecordPicker(id, config);
	case 'SepaMandate':
		return Tine.Billing.Custom.getSepaCreditorRecordPicker(id, config);
	
	default: 
		throw 'Unknown model type for record picker';
	}
};