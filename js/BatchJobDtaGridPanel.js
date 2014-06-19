Ext.ns('Tine.Billing');

Tine.Billing.getBatchJobDtaGridConfig = function(app){
	return {
	    recordClass: Tine.Billing.Model.BatchJobDta,
		recordProxy: Tine.Billing.Model.batchJobDtaBackend,
		columns: [
		   { header: app.i18n._('Job'), dataIndex: 'job_id',renderer:Tine.Billing.renderer.batchJobRenderer },
		   { header: app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Billing.renderer.contactRenderer },
		   
		   { header: app.i18n._('Debitor'), dataIndex: 'debitor_id',renderer:Tine.Billing.renderer.debitorRenderer },
		   { header: app.i18n._('Bank OK'), dataIndex: 'bank_valid', sortable:true,
			   renderer: Tine.Billing.renderer.bankAccountValidRenderer,
			   editor:{
					xtype: 'combo',
					store:[['YES','Ja'],['NO','Nein'],['UNKNOWN','Unbekannt']],
				    value: 'UNKNOWN',
					mode: 'local',
					displayField: 'name',
				    valueField: 'id',
				    triggerAction: 'all',
				    width:120
				}},
		   { header: app.i18n._('Kto.Nr.'), dataIndex: 'bank_account_number', sortable:true,
			   editor: new Ext.form.TextField()},
		   { header: app.i18n._('BLZ'), dataIndex: 'bank_code', sortable:true,
			   editor: new Ext.form.TextField()},
		   { header: app.i18n._('Kto.inhaber'), dataIndex: 'bank_account_name', sortable:true,
			   editor: new Ext.form.TextField()},
		   { header: app.i18n._('Bank'), dataIndex: 'bank_name', sortable:true,
			   editor: new Ext.form.TextField()},
		   { header: app.i18n._('Summe'), dataIndex: 'total_sum',renderer: Sopen.Renderer.MonetaryNumFieldRenderer, sortable:true },
		   { header: app.i18n._('Diff'), dataIndex: 'diff_saldation',renderer: Sopen.Renderer.MonetaryNumFieldRenderer, sortable:true,
			   editor: new Sopen.CurrencyField({
		            allowBlank:false
		        }) },
		   { header: app.i18n._('Zahlsaldo'), dataIndex: 'total_saldation',renderer: Sopen.Renderer.MonetaryNumFieldRenderer, sortable:true},
		   { header: app.i18n._('Anz.OP'), dataIndex: 'count_pos', sortable:true},
		   { header: app.i18n._('Text'), dataIndex: 'action_text', sortable:true,
			   editor: new Ext.form.TextField()},
		   { header: app.i18n._('Typ'), dataIndex: 'action_type',renderer: Tine.Billing.renderer.actionTypeRenderer},
		   { header: app.i18n._('Status'), dataIndex: 'action_state',renderer: Tine.Billing.renderer.actionStateRenderer},
		   { header: app.i18n._('Fehlerinfo'), dataIndex: 'error_info'},
		   { header: app.i18n._('Angelegt am'), dataIndex: 'created_datetime', renderer: Tine.Tinebase.common.dateTimeRenderer, sortable:true },
          // { header: app.i18n._('Gültig ab'), dataIndex: 'valid_datetime', renderer: Tine.Tinebase.common.dateRenderer, sortable:true,hidden:true },
           { header: app.i18n._('Auszuführen am'), dataIndex: 'to_process_datetime', renderer: Tine.Tinebase.common.dateTimeRenderer, sortable:true,hidden:true },
           { header: app.i18n._('Ausgeführt am'), dataIndex: 'process_datetime', renderer: Tine.Tinebase.common.dateTimeRenderer },
           { 
      	 		id: 'created_by_user',      header: 'angelegt von',             width: 220, dataIndex: 'created_by_user',            
      	 		renderer: Tine.Tinebase.common.usernameRenderer 
			}
        ]
	};
};

Tine.Billing.BatchJobDtaGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-batch-job-dta-gridpanel',
	//stateId: 'tine-billing-batch-job-dta-gridpanel-state',
    recordClass: Tine.Billing.Model.BatchJobDta,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'created_datetime', direction: 'DESC'},
    gridConfig: {
    	clicksToEdit:'auto',
        loadMask: true,
        autoExpandColumn: 'contact_id'
    },
    crud:{
    	_add:false,
    	_edit:false,
    	_delete:true
    },
    useImplicitForeignRecordFilter: false,
    useEditorGridPanel: true,
    soMemberRecord: null,
    jobRecord: null,
    initComponent: function() {
    	this.initDetailsPanel();
        this.recordProxy = Tine.Billing.batchJobDtaBackend;
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.BatchJobDtaGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	 
    	 this.actions_openBatchJobDtaItemContact = new Ext.Action({
             actionType: 'edit',
             handler: this.openBatchJobDtaItemContact,
             text: 'Öffne Kontakt',
             iconCls: 'actionEdit',
             scope: this
         });
    	
    	
    	this.supr().initActions.call(this);
    },
   
    getActionToolbarItems: function() {
    	return [
    	        this.actions_openBatchJobDtaItemContact
        ];
    },
    
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.useImplicitForeignRecordFilter){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.BatchJobDta.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },  

    getContextMenuItems: function(){
    	return [
    	        
    	        this.actions_openBatchJobDtaItemContact
    	        
    	        /*this.actions_openBatchJobDtaItemContact,
    	        this.actions_openMember,
    	        this.actions_openParentBatchJobDtaItemContact,
    	        this.actions_openParentMember,
    	        this.actions_openChildBatchJobDtaItemContact,
    	        this.actions_openChildMember,
    	        this.actions_openOrder,
    	        this.actions_openReceipt*/
    	];
    },
	getColumns: function() {
    	return Tine.Billing.getBatchJobDtaGridConfig(this.app).columns;
	},
	
	openBatchJobDtaItemContact: function(){
    	var selectedRows = this.grid.getSelectionModel().getSelections();
        record = selectedRows[0];
		if(record.get('contact_id')){
			var contact = record.getForeignRecord(Tine.Addressbook.Model.Contact, 'contact_id');
			var win = Tine.Addressbook.ContactEditDialog.openWindow({
	    		record: contact
			});
		}
	},
	openOrder: function(){
    	var selectedRows = this.grid.getSelectionModel().getSelections();
        record = selectedRows[0];
		if(record.get('order_id')){
			var win = Tine.Billing.OrderEditDialog.openWindow({
	    		record: record.getForeignRecord(Tine.Billing.Model.Order, 'order_id')
			});
		}
	},
	
    loadBatchJob: function(jobRecord){
    	this.jobRecord = jobRecord;
    	this.store.reload();
    },
    createForeignIdFilter: function( filterOptions){
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
    	return filter;
    },
    onStoreBeforeload: function(store, options) {
    	Tine.Billing.BatchJobDtaGridPanel.superclass.onStoreBeforeload.call(this, store, options);
    	if(!this.useImplicitForeignRecordFilter){
    		return true;
    	}
    	
    	if(!this.jobRecord){
    		return true;
    	}
    	
    	var filterOptions = {};
    	var filter;
    	if(this.jobRecord){
    		filter = {
        		field: 'job_id',
        		operator: 'equals',
        		value: this.jobRecord.get('id')
        	};
    	}
    	
    	
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
                            this.app.i18n._('Anzahl Datensätze') + '<br/>',
                            this.app.i18n._('Anzahl OP') + '<br/>',
                            this.app.i18n._('Gesamtsumme') + '<br/>',
                            '</span>',
                        '</div>',
                        '<div class="preview-panel-timesheet-rightside preview-panel-left">',
                            '<span class="preview-panel-nonbold">',
                            '{count}<br/>',
                            '{count_op}',
                            '{total_sum}<br/>',
                            '</span>',
                        '</div>',
                    '</div>',
                '</div>'            
            ),
            
            showDefault: function(body) {
            	
				var data = {
				    count: this.gridpanel.store.proxy.jsonReader.jsonData.count,
				    count_op:  this.gridpanel.store.proxy.jsonReader.jsonData.count_op,
				    total_sum:  Sopen.Renderer.MonetaryNumFieldRenderer(this.gridpanel.store.proxy.jsonReader.jsonData.total_sum)
			    };
                
                this.defaultTpl.overwrite(body, data);
            },
            
            showMulti: function(sm, body) {
            	
                var data = {
                    count: sm.getCount(),
                    count_op: 0,
                    total_sum: 0
                };
                sm.each(function(record){
                    data.count_op += parseFloat(record.data.count_pos);
                    data.total_sum += parseFloat(record.data.total_sum);
                });
                data.total_sum =  Sopen.Renderer.MonetaryNumFieldRenderer(data.total_sum);
                
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
