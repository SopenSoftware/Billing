Ext.namespace('Tine.Billing');



Tine.Billing.getBatchJobCategoryIcon = function(value, meta, record){
	var qtip, icon;
	var state = record.get('job_category');
	switch(state){
	case 'DTAEXPORT':
		qtip = 'DTA-Export';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + '16x16/coins.png';
	
		break;
	case 'MONITION':
		qtip = 'Mahnungen erstellen';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + '16x16/bell_go.png';
	
		break;

	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.getBatchJobStatusIcon = function(value, meta, record){
	var qtip, icon;
	var state = record.get('job_state');
	switch(state){
	case 'RUNNING':
		qtip = 'Wird ausgeführt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'ajax-loader.gif';
	
		break;
	case 'TOBEPROCESSED':
		qtip = 'Warten';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'gg_offline.png';
	
		break;
	case 'PROCESSED':
		qtip = 'Ausgeführt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'greenled.png';
	
		break;
	case 'ABANDONED':
	case 'USERCANCELLED':
		qtip = 'Abgebrochen';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'agt_stop.png';
	
		break;

	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.getBatchJobResultStatusIcon = function(value, meta, record){
	var qtip, icon;
	var state = record.get('job_result_state');
	switch(state){
	case 'UNDEFINED':
		qtip = 'undefiniert';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'status_unknown.png';
	
		break;
	case 'OK':
		qtip = 'Ok';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'agt_action_success.png';
	
		break;
	case 'PARTLYERROR':
	case 'ERROR':
		qtip = 'Fehler';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'agt_action_fail.png';
	
		break;

	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};


/**
 * Timeaccount grid panel
 */
Tine.Billing.BatchJobGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'billing-batch-job-grid-panl',
    recordClass: Tine.Billing.Model.BatchJob,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'job_nr', direction: 'DESC'},
    gridConfig: {
    	clicksToEdit:1,
        loadMask: true,
        autoExpandColumn: 'job_name1'
    },
    crud:{
    	_add:false,
    	_edit:true,
    	_delete:true
    },
    useImplicitForeignRecordFilter: false,
    jobRecord: null,
    useEditorGridPanel: true,
    initComponent: function() {
        this.recordProxy = Tine.Billing.batchJobBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
        
        Tine.Billing.BatchJobGridPanel.superclass.initComponent.call(this);
    },
    initActions: function(){
    	this.actions_directDebit = new Ext.Action({
            text: 'Lastschrifteinzug',
			disabled: false,
            handler: this.directDebit,
            iconCls: 'action_dtaExport',
            scope: this
        });
    	
    	this.actions_directMonition = new Ext.Action({
            text: 'Mahnungen erstellen',
			disabled: false,
            handler: this.directMonition,
            iconCls: 'action_Monition',
            scope: this
        });
    	
    	this.actions_downloadPrintedDocument = new Ext.Action({
            text: 'Dokument herunterladen',
			//disabled: true,
            handler: this.downloadPrintedDocument,
            iconCls: 'action_exportAsPdf',
            scope: this,
            actionUpdater: this.updatePrintBilling
        });
    	
    	this.actions_downloadErrorLog = new Ext.Action({
            text: 'Logdatei herunterladen',
			//disabled: true,
            handler: this.downloadErrorLog,
            iconCls: 'action_exportAsCsv',
            scope: this,
            actionUpdater: this.updatePrintBilling
        });
    	
    	this.actions_printInvoices = new Ext.Action({
            text: 'Rechnungen drucken',
			//disabled: true,
            handler: this.printInvoices,
            iconCls: 'action_exportAsPdf',
            scope: this,
            actionUpdater: this.updatePrintBilling
        });
    	
    	this.actions_printVerficationList = new Ext.Action({
            text: 'Nachweisliste drucken',
			//disabled: true,
            handler: this.printVerificationList,
            iconCls: 'action_exportAsPdf',
            scope: this,
            actionUpdater: this.updatePrintBilling
        });
    	
        this.actions_printBatchJobs = new Ext.Action({
        	allowMultiple: false,
        	//disabled:true,
            text: 'Druckaufträge',
            iconCls: 'action_exportAsPdf',
            scope: this,
            actionUpdater: this.updatePrintBatchJobs,
            menu:{
            	items:[
            	       this.actions_printInvoices,
            	       this.actions_printVerficationList
		    	]
            }
        });
        this.actionUpdater.addActions([
           this.updatePrintBatchJobs,
           this.updatePrintBilling
        ]);
        this.supr().initActions.call(this);
    },
    directDebit: function(){
    	Tine.Billing.DirectDebitDialog.openWindow({
    		jobType:'DTA'
    	});
    },
    directMonition: function(){
    	Tine.Billing.DirectDebitDialog.openWindow({
    		jobType:'MONITION'
    	});
    },
    printInvoices: function(){
    	var selectedRows = this.getGrid().getSelectionModel().getSelections();
    	var parentBatchJobId = selectedRows[0].id;
//		var filterValue = Ext.util.JSON.encode(this.filterPanel.getValue());
//		var feeYear = Ext.getCmp('fee_year').getValue();
//		var action = Ext.getCmp('action').getValue();
		Ext.Ajax.request({
			scope: this,
			success: this.onRequestBatchJob,
			params: {
				method: 'Billing.requestPrintInvoiceBatchJob',
				parentBatchJobId: parentBatchJobId
			},
			failure: function(){
				Ext.MessageBox.show({
		            title: 'Fehler', 
		            msg: 'Es konnte kein BatchJob erzeugt werden',
		            buttons: Ext.Msg.OK,
		            icon: Ext.MessageBox.ERROR
		        });
			}
		});
    },
    printVerificationList: function(){
    	var selectedRows = this.getGrid().getSelectionModel().getSelections();
    	var parentBatchJobId = selectedRows[0].id;
		Ext.Ajax.request({
			scope: this,
			success: this.onRequestBatchJob,
			timeout:360000,
			params: {
				method: 'Billing.requestPrintVerificationListBatchJob',
				parentBatchJobId: parentBatchJobId
			},
			failure: function(){
				Ext.MessageBox.show({
		            title: 'Fehler', 
		            msg: 'Es konnte kein BatchJob erzeugt werden',
		            buttons: Ext.Msg.OK,
		            icon: Ext.MessageBox.ERROR
		        });
			}
		});
    },
    downloadPrintedDocument: function(){
    	var selectedRows = this.getGrid().getSelectionModel().getSelections();
    	var jobId = selectedRows[0].id;
    	
    	var jobCategory = selectedRows[0].data.job_category;
    	var params;
    	switch(jobCategory){
    	case 'MANUALEXPORT':
    		params = {
                method: 'Billing.downloadBatchJobExportFile',
                customExportCsvBatchJobId: jobId
            };
    		break;
    	default:
    		params = {
                method: 'Billing.getPrintBatchJobResult',
                printBatchJobId: jobId
            }
    		method = 'Billing.getPrintBatchJobResult';
    		break;
    	}
		var downloader = new Ext.ux.file.Download({
            params: params
        }).start();

    },
    downloadErrorLog: function(){
    	var selectedRows = this.getGrid().getSelectionModel().getSelections();
    	var jobId = selectedRows[0].id;
    	
    	var jobCategory = selectedRows[0].data.job_category;
    	var params;
    	switch(jobCategory){
    	case 'MANUALEXPORT':
    		params = {
                method: 'Billing.downloadBatchJobErrorFile',
                customExportCsvBatchJobId: jobId
            };
    		break;
    	default:
    		return;
    	}
		var downloader = new Ext.ux.file.Download({
            params: params
        }).start();
    },
    
    onRequestBatchJob: function(response){
    	var result = Ext.util.JSON.decode(response.responseText);
		this.job = new Tine.Billing.Model.BatchJob(result, result.id);

		Ext.Ajax.request({
			scope: this,
			success: this.onRunBatchJob,
			timeout:6000,
			params: {
				method: 'Billing.runBatchJob',
				jobId: this.job.get('id')
			},
			failure: this.onRunBatchJob
		});
    },
    onRunBatchJob: function(){
    	this.grid.getStore().reload();
    },
    getActionToolbarItems: function() {
    	
    	return [
			Ext.apply(new Ext.Button(this.actions_directDebit), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_dtaExport'
            }),
            Ext.apply(new Ext.Button(this.actions_directMonition), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_monition'
            })
        ];
    },
    
    getContextMenuItems: function(){
    	return [
			'-',
			this.actions_downloadPrintedDocument     
    	];
    },
    
    updatePrintBatchJobs: function(action, grants, records) {
    	action.setDisabled(true);
        if (records.length == 1) {
            var obj = records[0];
            if (! obj) {
                return false;
            }
            action.setDisabled(false);
        }
    },
    updatePrintBilling: function(action, grants, records) {
    	action.setDisabled(true);
    	try{
	        if (records.length == 1) {
	            var obj = records[0];
	            if (! obj) {
	                return false;
	            }
	            if(obj.get('job_type')=='FEEINVOICE'){
	            	action.setDisabled(false);
	            }
	        }
    	}catch(e){
    		action.setDisabled(true);
    	}
    },
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.useImplicitForeignRecordFilter){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.BatchJob.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: plugins
        });
    },  
    
	getColumns: function() {
		return [
		   {  header: this.app.i18n._('BatchJob-Nr'), dataIndex: 'job_nr', sortable:true },		               
		   {  header: this.app.i18n._('Bezeichnung1'), dataIndex: 'job_name1', sortable:false,
			   editor: new Ext.form.TextField({})
		   },
		   { header: this.app.i18n._('Bezeichnung2'), dataIndex: 'job_name2', sortable:false,
			   editor: new Ext.form.TextField({}) 
		   },
		   { header: this.app.i18n._('Art'), dataIndex: 'job_category', sortable:false, renderer: Tine.Billing.getBatchJobCategoryIcon },
		   { header: this.app.i18n._('Typ'), dataIndex: 'job_type', sortable:false },
		   { header: this.app.i18n._('Daten'), dataIndex: 'job_data', sortable:false },
		   { header: this.app.i18n._('Status'), dataIndex: 'job_state', sortable:false, renderer: Tine.Billing.getBatchJobStatusIcon },
		   { header: this.app.i18n._('Ergebnisstatus'), dataIndex: 'job_result_state', sortable:false, renderer: Tine.Billing.getBatchJobResultStatusIcon },
		   { header: this.app.i18n._('bei Fehler'), dataIndex: 'on_error', sortable:false },
		   {
	            header: 'fertig %',
	            width: 50,
	            dataIndex: 'process_percentage',
	            renderer: Ext.ux.PercentRenderer
		   },
		   { header: this.app.i18n._('Info'), dataIndex: 'process_info', sortable:false },
		   { header: this.app.i18n._('Fehlerinfo'), dataIndex: 'error_info', sortable:false },
		   { header: this.app.i18n._('Anz. OK'), dataIndex: 'ok_count', sortable:false },
		   { header: this.app.i18n._('Anz. Fehler'), dataIndex: 'error_count', sortable:false },
		   { header: this.app.i18n._('geplant am'), dataIndex: 'schedule_datetime', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:false },
		   { header: this.app.i18n._('gestartet'), dataIndex: 'start_datetime', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:true },
		   { header: this.app.i18n._('beendet am'), dataIndex: 'end_datetime', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:true },
		   { header: this.app.i18n._('Benutzer'), dataIndex: 'account_id',renderer: Tine.Tinebase.common.usernameRenderer , sortable:true  },
		   { header: this.app.i18n._('zuletzt geändert'), dataIndex: 'modified_datetime', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:true },
		   { header: this.app.i18n._('Aufgaben gesamt'), dataIndex: 'task_count'},
		   
		   { header: this.app.i18n._('ist freig.'), dataIndex: 'is_approved', sortable:false },
		   
		   { header: this.app.i18n._('freig.von'), dataIndex: 'approved_by_user',renderer: Tine.Tinebase.common.usernameRenderer , sortable:true  },
		   
		   { header: this.app.i18n._('freig.am'), dataIndex: 'approved_datetime', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:true }
		   
        ];
	},
	// load job in order to be able to retrieve subjobs
	loadBatchJob: function(jobRecord){
    	this.jobRecord = jobRecord;
    	this.store.reload();
    },
	 onStoreBeforeload: function(store, options) {
	    	Tine.Billing.BatchJobGridPanel.superclass.onStoreBeforeload.call(this, store, options);
	    	if(!this.useImplicitForeignRecordFilter){
	    		return true;
	    	}
	    	
	    	if(!this.jobRecord){
	    		return true;
	    	}
	    	
	    	var filter = {
        		field: 'job_id',
        		operator: 'equals',
        		value: this.jobRecord.get('id')
        	};
	    	options.params.filter.push(filter);
	    }
});