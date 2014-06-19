Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.DebitorAccountGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-debitor-account-gridpanel',
	stateId: 'tine-billing-debitor-account-gridpanel-state-id',
    recordClass: Tine.Billing.Model.DebitorAccount,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'create_date', direction: 'DESC'},
    gridConfig: {
    	clicksToEdit: 'auto',
        loadMask: true,
        autoExpandColumn: 'title'
    },
    crud:{
    	_add:false,
    	_edit:false,
    	_delete:true
    },
    useImplicitForeignRecordFilter: false,
    useEditorGridPanel: true,
    debitorRecord: null,
    initComponent: function() {
    	this.initDetailsPanel();
        this.recordProxy = Tine.Billing.debitorAccountBackend;
        this.action_reversePayment = new Ext.Action({
            text: 'Zahlung stornieren',
            //disabled: true,
            actionType: 'edit',
            handler: this.reversePayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editPayment = new Ext.Action({
            text: 'Zahlung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditPayment,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editBooking = new Ext.Action({
            text: 'FIBU-Buchung öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditBooking,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editReceipt = new Ext.Action({
            text: 'Beleg öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditReceipt,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        this.action_editCompound = new Ext.Action({
            text: 'Verbund öffnen',
            //disabled: true,
            actionType: 'edit',
            handler: this.onEditCompound,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
        this.action_addDebitorAccount = new Ext.Action({
            actionType: 'edit',
            handler: this.addDebitorAccount,
            iconCls: 'actionAdd',
            scope: this
        });
        Tine.Billing.DebitorAccountGridPanel.superclass.initComponent.call(this);
        this.pagingToolbar.add(
				 '->'
		);
		this.pagingToolbar.add(
			 Ext.apply(new Ext.Button(this.action_addDebitorAccount), {
				 text: 'Zahlung erfassen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     }),
		     Ext.apply(new Ext.Button(this.action_editPayment), {
				 text: 'Zahlung öffnen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     }),
		     Ext.apply(new Ext.Button(this.action_editBooking), {
				 text: 'FIBU-Buchung öffnen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     }),
		     Ext.apply(new Ext.Button(this.action_editReceipt), {
				 text: 'Beleg öffnen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     })//,
		     /*Ext.apply(new Ext.Button(this.action_editCompound), {
				 text: 'Verbund öffnen',
		         scale: 'small',
		         rowspan: 2,
		         iconAlign: 'left'
		     })*/
		);
    },
    onEditReceipt: function(){
    	var selectedRecord = this.getSelectedRecord();
    	if(selectedRecord.getForeignId('donation_id')){
    		this.lastReceiptWin = Tine.Donator.DonationEditDialog.openWindow({
				record: new Tine.Donator.Model.Donation({id:selectedRecord.getForeignId('donation_id')},selectedRecord.getForeignId('donation_id'))
			});
    		return;
    	}
    	
		if(selectedRecord.getForeignId('receipt_id')){
		   	this.lastReceiptWin = Tine.Billing.InvoiceEditDialog.openWindow({
				record: new Tine.Billing.Model.Receipt({id:selectedRecord.getForeignId('receipt_id')},selectedRecord.getForeignId('receipt_id'))
			});
		}
	},
	onEditPayment: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('payment_id')){
		   	this.lastReceiptWin = Tine.Billing.PaymentEditDialog.openWindow({
				record: new Tine.Billing.Model.Payment({id:selectedRecord.getForeignId('payment_id')},selectedRecord.getForeignId('payment_id'))
			});
		}
	},
	onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
		   	this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				externalRecord: selectedRecord
			});
		}
	},
	onEditBooking: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord.getForeignId('booking_id')){
		   	this.lastReceiptWin = Tine.Billing.BookingEditDialog.openWindow({
				record: new Tine.Billing.Model.Booking({id:selectedRecord.getForeignId('booking_id')},selectedRecord.getForeignId('booking_id'))
			});
		}
	},
    reversePayment: function(){
    	var selectedRecord = this.getSelectedRecord();
    	var selectedPaymentId = selectedRecord.getForeignId('payment_id');
    	
    	if(!selectedPaymentId){
    		return true;
    	}
    	Ext.Ajax.request({
            scope: this,
            success: this.onReversePayment,
            params: {
                method: 'Billing.reversePayment',
               	paymentId:  selectedPaymentId
            },
            failure: this.onReversePaymentFailed
        });
	},
	
	onReversePayment: function(response){
		this.reversePaymentResponse = response;
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Zahlung wurde erfolgreich storniert.',
            buttons: Ext.Msg.OK,
            //scope:this,
            //fn: this.showReversedDialog,
            icon: Ext.MessageBox.INFO
        });
		this.refresh();
	},
	onReversePaymentFailed: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Zahlung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	getActionToolbarItems: function(){
		return [];
	},
	getContextMenuItems: function(){
    	//var contextMenuItems = Tine.Billing.BookingGridPanel.superclass.getContextMenuItems.call(this);#
		var contextMenuItems = [];
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_reversePayment,
    	        this.action_editPayment,
    	        this.action_editReceipt,
    	        this.action_editCompound
    	]);
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.useImplicitForeignRecordFilter){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.DebitorAccount.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },
    loadDebitor: function( debitorRecord ){
    	this.debitorRecord = debitorRecord;
    	var associationRecord = this.debitorRecord.getForeignRecord(Tine.Billing.Model.Association, 'association_id');
    	if(associationRecord){
    		this.associationRecord = associationRecord;
    	}
    	this.store.reload();
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.DebitorAccountGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(!this.debitorRecord || !this.useImplicitForeignRecordFilter){
    		return;
    	}
    	delete options.params.filter;
    	options.params.filter = [];
    	
    	if(this.debitorRecord){
    		this.addForeignFilter('debitor_id', this.debitorRecord, options);
    	}
    },
    addForeignFilter: function(field, record, options){
    	var filter = {	
			field:field,
			operator:'AND',
			value:[{
				field:'id',
				operator:'equals',
				value: record.get('id')}]
		};
        options.params.filter.push(filter);
    },
    initDetailsPanel: function() {
        this.detailsPanel = new Tine.widgets.grid.DetailsPanel({
            gridpanel: this,
            
            // use default Tpl for default and multi view
            defaultTpl: new Ext.XTemplate(
                '<div class="preview-panel-timesheet-nobreak">',
                    '<!-- Preview timeframe -->',           
                    '<div class="preview-panel preview-panel-timesheet-left">',
                        '<div class="bordercorner_1"></div>',
                        '<div class="bordercorner_2"></div>',
                        '<div class="bordercorner_3"></div>',
                        '<div class="bordercorner_4"></div>',
                        '<div class="preview-panel-declaration">' /*+ this.app.i18n._('timeframe')*/ + '</div>',
                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
                            '<span class="preview-panel-bold">',
                            /*'First Entry'*/'<br/>',
                            /*'Last Entry*/'<br/>',
                            /*'Last Entry*/'<br/>',
                            /*'Duration*/'<br/>',
                            '<br/>',
                            '</span>',
                        '</div>',
                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
                            '<span class="preview-panel-nonbold">',
                            '<br/>',
                            '<br/>',
                            '<br/>',
                            '<br/>',
                            '</span>',
                        '</div>',
                    '</div>',
                    '<!-- Preview summary -->',
                    '<div class="preview-panel-timesheet-right">',
                        '<div class="bordercorner_gray_1"></div>',
                        '<div class="bordercorner_gray_2"></div>',
                        '<div class="bordercorner_gray_3"></div>',
                        '<div class="bordercorner_gray_4"></div>',
                        '<div class="preview-panel-declaration">'/* + this.app.i18n._('summary')*/ + '</div>',
                        '<div class="preview-panel-timesheet-leftside preview-panel-left">',
                            '<span class="preview-panel-bold">',
                            this.app.i18n._('Anzahl Buchungen') + '<br/>',
                            this.app.i18n._('Gesamt Soll') + '<br/>',
                            this.app.i18n._('Gesamt Haben') + '<br/>',
                            this.app.i18n._('Zahlsaldo') + '<br/>',
                            '</span>',
                        '</div>',
                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
                            '<span class="preview-panel-nonbold">',
                            '{count}<br/>',
                            '{total_netto}',
                            '{total_brutto}',
                            '{total}',
                            '</span>',
                        '</div>',
                    '</div>',
                '</div>'            
            ),
            
            showDefault: function(body) {
            	
				var data = {
				    count: this.gridpanel.store.proxy.jsonReader.jsonData.totalcount,
				    total_netto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_netto),
				    total_brutto:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_brutto),
				    total:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total)
			    };
                
                this.defaultTpl.overwrite(body, data);
            },
            
            showMulti: function(sm, body) {
            	
                var data = {
                    count: sm.getCount(),
                    total_netto: 0,
                    total_brutto: 0,
                    total: 0
                };
                sm.each(function(record){
                    data.total_netto += parseFloat(record.data.total_netto);
                    data.total_brutto += parseFloat(record.data.total_brutto);
                    data.total += parseFloat(record.data.total);
                });
                data.total_netto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_netto);
                data.total_brutto =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_brutto);
                data.total =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total);
                
                this.defaultTpl.overwrite(body, data);
            },
            
            tpl: new Ext.XTemplate(
        		'<div class="preview-panel-timesheet-nobreak">',	
        			'<!-- Preview beschreibung -->',
        			'<div class="preview-panel preview-panel-timesheet-left">',
        				'<div class="bordercorner_1"></div>',
        				'<div class="bordercorner_2"></div>',
        				'<div class="bordercorner_3"></div>',
        				'<div class="bordercorner_4"></div>',
        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Description') */ + '</div>',
        				'<div class="preview-panel-timesheet-description preview-panel-left" ext:qtip="{[this.encode(values.description)]}">',
        					'<span class="preview-panel-nonbold">',
        					 '{[this.encode(values.description, "longtext")]}',
        					'<br/>',
        					'</span>',
        				'</div>',
        			'</div>',
        			'<!-- Preview detail-->',
        			'<div class="preview-panel-timesheet-right">',
        				'<div class="bordercorner_gray_1"></div>',
        				'<div class="bordercorner_gray_2"></div>',
        				'<div class="bordercorner_gray_3"></div>',
        				'<div class="bordercorner_gray_4"></div>',
        				'<div class="preview-panel-declaration">' /* + this.app.i18n._('Detail') */ + '</div>',
        				'<div class="preview-panel-timesheet-leftside preview-panel-left">',
        				// @todo add custom fields here
        				/*
        					'<span class="preview-panel-bold">',
        					'Ansprechpartner<br/>',
        					'Newsletter<br/>',
        					'Ticketnummer<br/>',
        					'Ticketsubjekt<br/>',
        					'</span>',
        			    */
        				'</div>',
        				'<div class="preview-panel-timesheet-rightside preview-panel-left">',
        					'<span class="preview-panel-nonbold">',
        					'<br/>',
        					'<br/>',
        					'<br/>',
        					'<br/>',
        					'</span>',
        				'</div>',
        			'</div>',
        		'</div>',{
                encode: function(value, type, prefix) {
                    if (value) {
                        if (type) {
                            switch (type) {
                                case 'longtext':
                                    value = Ext.util.Format.ellipsis(value, 150);
                                    break;
                                default:
                                    value += type;
                            }                           
                        }
                    	
                        var encoded = Ext.util.Format.htmlEncode(value);
                        encoded = Ext.util.Format.nl2br(encoded);
                        
                        return encoded;
                    } else {
                        return '';
                    }
                }
            })
        });
    },
   
	getColumns: function() {
		return [
		   { id: 'debitor_id', header: this.app.i18n._('Kunde'), dataIndex: 'debitor_id', sortable:true, renderer: Tine.Billing.renderer.debitorRenderer  },
		   { id: 'receipt_id', header: this.app.i18n._('Beleg'), dataIndex: 'receipt_id', sortable:true, renderer: Tine.Billing.renderer.receiptRenderer },
		   { header: this.app.i18n._('Angelegt am'), dataIndex: 'created_datetime', renderer: Tine.Tinebase.common.dateTimeRenderer, sortable:true },
           { id: 'create_date', header: this.app.i18n._('Buchung'), dataIndex: 'create_date', 
			   renderer: Tine.Tinebase.common.dateRenderer,
			   editor: new Ext.form.DateField({}),width: 120,sortable:true },
           { id: 'value_date', header: this.app.i18n._('Wertstellung'), dataIndex: 'value_date',
				   editor: new Ext.form.DateField({}),renderer: Tine.Tinebase.common.dateRenderer, width: 120, hidden: false },
           { id: 's_brutto', header: this.app.i18n._('Soll'), 
					   
					   dataIndex: 's_brutto',renderer: Sopen.Renderer.MonetaryNumFieldRendererS, bodyStyle:'color:#FF0000;',
					   editor: new Sopen.CurrencyField({
			                allowBlank:false
			           })  },
           { id: 'h_brutto', header: this.app.i18n._('Haben'), dataIndex: 'h_brutto',renderer: Sopen.Renderer.MonetaryNumFieldRendererH,
						   editor: new Sopen.CurrencyField({
				                allowBlank:false
				           })  },
           { id: 'item_type', header: this.app.i18n._('Typ'), dataIndex: 'item_type', renderer:Tine.Billing.renderer.debitorAccountItemTypeRenderer },
           { id: 'usage', header: this.app.i18n._('VwZw'), dataIndex: 'usage', sortable:true, sortable:true},
           { header: this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', sortable:true, sortable:true, renderer:Tine.Billing.renderer.erpContextRenderer,
        	   editor:{
					xtype: 'combo',
					store:[['ERP','ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']],
				    value: 'ERP',
					mode: 'local',
					displayField: 'name',
				    valueField: 'id',
				    triggerAction: 'all',
				    width:150
				}},
           { header: this.app.i18n._('Storniert'), dataIndex: 'is_cancelled', sortable:true },
	       { header: this.app.i18n._('Ist Storno'), dataIndex: 'is_cancellation', sortable:true },
	       { header: this.app.i18n._('Buchung'), dataIndex: 'booking_id', sortable:false, renderer:Tine.Billing.renderer.bookingRenderer  },
	       { header: this.app.i18n._('Zahlung'), dataIndex: 'payment_id', sortable:false, renderer:Tine.Billing.renderer.paymentRenderer  }
		];
	},
	addDebitorAccount: function(){
		this.addPaymentWin = Tine.Billing.PaymentEditDialog.openWindow({
			debitorRecord: this.debitorRecord
		});
		this.addPaymentWin.on('beforeclose',this.onUpdateDebitorAccount,this);
	},
    
	onUpdateDebitorAccount: function(){
		this.grid.store.reload();
	}
});