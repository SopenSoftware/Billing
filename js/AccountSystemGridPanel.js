Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.AccountSystemGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-accountSystem-gridpanel',
    recordClass: Tine.Billing.Model.AccountSystem,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'number', direction: 'ASC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'number'
    },
    initComponent: function() {
    	this.initDetailsPanel();
        this.recordProxy = Tine.Billing.accountSystemBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.AccountSystemGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	this.actions_printFibu = new Ext.Action({
            text: 'Auswertung Druck',
			disabled: false,
            handler: this.printFibu,
            iconCls: 'action_exportAsPdf',
            scope: this
        });
    	this.supr().initActions.call(this);
    },
    printFibu: function(){
    	var win = Tine.Billing.PrintFibuDialog.openWindow({
			mainGrid: this
		});
    	//this.openPrintWindow('printReceiptsByUser', false);
		//var win = Tine.Billing.PrintReceiptDialog.openWindow({});
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.AccountSystem.getFilterModel(),
            defaultFilter: 'name',
            filters: [{field:'name',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    getActionToolbarItems: function() {
    	return [
            Ext.apply(new Ext.Button(this.actions_printFibu), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_exportAsPdf'
            })
        ];
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('Kontonummer'), dataIndex: 'number', sortable:true },
		   { header: this.app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:true},
		   { header: this.app.i18n._('Kontenklasse'), renderer: Tine.Billing.renderer.accountClassRenderer, dataIndex: 'account_class_id', sortable:true},
		   { header: this.app.i18n._('Typ'), renderer: Tine.Billing.renderer.accountClassTypeRenderer, dataIndex: 'type', sortable:false},
		   { header: this.app.i18n._('Typ Bestandskonto'), renderer: Tine.Billing.renderer.accountAccountTypeRenderer, dataIndex: 'account_type', sortable:false},
		   { header: this.app.i18n._('Saldo S'), dataIndex: 'debit_saldo',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('Saldo H'), dataIndex: 'credit_saldo',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('Summe S'), dataIndex: 'sum_debit',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('Summe H'), dataIndex: 'sum_credit',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('EB-Wert S'), dataIndex: 'begin_debit_saldo',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('EB-Wert H'), dataIndex: 'begin_credit_saldo',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true}
	    ];
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
	                            this.app.i18n._('Gesamt Soll') + '<br/>',
	                            this.app.i18n._('Gesamt Haben') + '<br/>',
	                            this.app.i18n._('Saldo') + '<br/>',
	                            '</span>',
	                        '</div>',
	                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
	                            '<span class="preview-panel-nonbold">',
	                            '{debit_total}',
	                            '{credit_total}',
	                            '{total}',
	                            '</span>',
	                        '</div>',
	                    '</div>',
	                '</div>'            
	            ),
	            
	            showDefault: function(body) {
	            	
					var data = {
					    count: this.gridpanel.store.proxy.jsonReader.jsonData.totalcount,
					    debit_total:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.debit_total),
					    credit_total:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.credit_total),
					    total:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total)
				    };
	                
	                this.defaultTpl.overwrite(body, data);
	            },
	            
	            showMulti: function(sm, body) {
	            	
	                var data = {
	                		debit_total: 0,
	                		credit_total: 0,
	                		total: 0
	                };
	                sm.each(function(record){
	                    data.debit_total += parseFloat(record.data.sum_debit);
	                    data.credit_total += parseFloat(record.data.sum_credit);
	                    //data.total += parseFloat(record.data.total);
	                });
	                data.debit_total =  Sopen.Renderer.MonetaryNumFieldRenderer(data.debit_total);
	                data.credit_total =  Sopen.Renderer.MonetaryNumFieldRenderer(data.credit_total);
	                
	                data.total =  Sopen.Renderer.MonetaryNumFieldRenderer(data.credit_total-data.debit_total);
	                
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
	    }

});