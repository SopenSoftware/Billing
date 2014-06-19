Ext.namespace('Tine.Billing');

Tine.Billing.BatchJobEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @private
	 */
	windowNamePrefix: 'BatchJobEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.BatchJob,
	recordProxy: Tine.Billing.batchJobBackend,
	Record: false,
	evalGrants: false,
	autoUpdate: true,
	runAutoUpdate: false,
	autoUpdateInterval: 15000,
	closeWindowOn: null,
	
	
	jobType: 'DTA',
	jobMetaData: {
		DTA: {
			runActionText: 'DTA-Export erzeugen',
			downloadActionText: 'DTA-Export herunterladen',
			api: {
				printPrepare: 'Billing.printDtaExportPrepare',
				mainAction: 'Billing.createDtaExport',
				downloadMainResult: 'Billing.downloadDTA',
				downloadProtocol: 'Billing.downloadDTA'
			}
		},
		MONITION: {
			runActionText: 'Mahnungen erzeugen',
			downloadActionText: 'Mahnungen herunterladen',
			api: {
				printPrepare: 'Billing.printMonitionExportPrepare',
				mainAction: 'Billing.createMonitionExport',
				downloadMainResult: 'Billing.downloadMonitionPrintResult',
				downloadProtocol: 'Billing.downloadDTA'
			}
		}
	},
	setJobType: function(jobType){
		this.jobType = jobType;
	},
	getJobType: function(){
		return this.jobType;
	},
	isJobDta: function(){
		return this.getJobType() == 'DTA';
	},
	isJobMonition: function(){
		return this.getJobType() == 'MONITION';
	},
	
	getJobMetaData: function(){
		if(this.isJobDta()){
			return this.jobMetaData.DTA;
		}
		if(this.isJobMonition()){
			return this.jobMetaData.MONITION;
		}
	},
	getRunActionText: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.runActionText;
	},
	getDownActionText: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.downloadActionText;
	},
	getApiMethodPrintPrepare: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.api.printPrepare;
	},
	getApiMethodMainAction: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.api.mainAction;
	},
	getApiMethodDownMainResult: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.api.downloadMainResult;
	},
	getApiMethodDownProtocol: function(){
		var jobMetaData = this.getJobMetaData();
		return jobMetaData.api.downloadProtocol;
	},
	initComponent: function(){
		Ext.apply(this, this.initialConfig);
		if(this.record){
			if(this.record.get('job_category')=='MONITION'){
				this.setJobType('MONITION');
			}
		}
		this.initActions();
		this.initButtons();
		this.initDependentGrids();
		this.setAutoUpdateText();
		this.on('afterrender', this.onAfterRender, this);
		this.on('load', this.closeObjWindowOn, this);
		Tine.Billing.BatchJobEditDialog.superclass.initComponent.call(this);
	},
	closeObjWindowOn: function(){
		if(this.closeWindowOn){
			this.closeWindowOn.close();
			this.closeWindowOn = null;
		}
		
		if(this.record.get('job_state')=='PROCESSED' && this.record.get('job_category') == 'MANUALEXPORT'){
			this.buttonDownFile.enable();
		}
		if(this.editPanelMask){
			if(this.record.get('job_state')=='PROCESSED'){
				this.editPanelMask.hide();
			}
		}
		
		if(this.record.get('job_state')=='PROCESSED'){
			this.endAutoUpdate();
		}
		
		if(this.hasPreparePDF()){
			this.actions_downloadExportPrepareAsPDF.enable();
		}else{
			this.actions_downloadExportPrepareAsPDF.disable();
		}
		
		if(this.hasFilteredPreparePDF()){
			this.actions_downloadExportFilteredPrepareAsPDF.enable();
		}else{
			this.actions_downloadExportFilteredPrepareAsPDF.disable();
		}
		
		if(this.hasMainResult()){
			this.action_downloadMainResult.enable();
		}else{
			this.action_downloadMainResult.disable();
		}
		
		
		if(this.hasMainResultProtocol()){
			this.action_downloadMainResultProtocol.enable();
		}else{
			this.action_downloadMainResultProtocol.disable();
		}
		
		if(!this.isBatchJobRunning() && this.isApproved()){
			this.action_runMainAction.enable();
			this.action_approve.disable();
		}
		
	},
	getJobData: function(){
		var jobData = this.record.get('job_data');
		jobData = Ext.util.JSON.decode(jobData);
		return jobData;
	},
	hasPreparePDF: function(){
		var jobData = this.getJobData();
		if(jobData['preparePDF']){
			return true;
		}
	},
	hasFilteredPreparePDF: function(){
		var jobData = this.getJobData();
		if(jobData['filteredPreparePDF']){
			return true;
		}
	},
	hasMainResult: function(){
		var jobData = this.getJobData();
		if(jobData['DTA'] || jobData['MONITION']){
			return true;
		}
	},
	hasMainResultProtocol: function(){
		var jobData = this.getJobData();
		if(jobData['protocolPDF']){
			return true;
		}
	},
	isApproved: function(){
    	return this.record.get('is_approved')==1;
    },
	setAutoUpdateText: function(){
		if(this.autoUpdate){
			this.autoUpdateText = 'Autoupdate an';
		}else{
			this.autoUpdateText = 'Autoupdate aus'
		}
	},
	getAutoUpdateText: function(){
		return this.autoUpdateText;
	},
	initActions: function(){
		
		
		this.action_printPrepare = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            text: 'Vorbereitungsliste drucken',
            handler: this.printPrepare,
            disabled:false,
            scope: this
        });
		
		this.action_approve = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            handler: this.approveBatchJob,
            text: 'Freigabe erteilen',
            disabled:false,
            scope: this
        });
		
		this.action_runMainAction = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            handler: this.runMainAction,
            text: this.getRunActionText(),
            disabled:true,
            scope: this
        });
		
        this.action_autoUpdater = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            text: this.getAutoUpdateText(),
            scope: this
        });
        
        this.action_downloadFile = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            text: 'Vorbereitungsliste herunterladen',
            handler: this.downloadFile.createDelegate(this,['PREPARE']),
            disabled:false,
            scope: this
        });
        
        this.action_downloadMainResult = new Ext.Action({
            actionType: 'edit',
            iconCls: '',
            text: this.getDownActionText(),
            handler: this.downloadFile.createDelegate(this,['MAIN']),
            disabled:false,
            scope: this
        });
        
        /*this.buttonDownDtaFile = Ext.apply(new Ext.Button(this.action_downloadMainResult), {
            scale: 'small',
            rowspan: 2,
            iconAlign: 'top',
            iconCls: 'action_stockFlowDec'
        });*/
        
        this.actions_exportPrepareAsPDF = new Ext.Action({
            id: 'exportPrepareAsPDFButton',
            text: 'Vorbereitungsliste als PDF',
            handler: this.exportPrepareAsPDF,
            scope: this
        });
		 
	 	this.actions_exportPrepareAsCSV = new Ext.Action({
            id: 'exportPrepareAsCSVButton',
            text: 'Vorbereitungsliste als CSV',
            disabled: true,
            handler: this.exportPrepareAsCSV,
            scope: this
        });
	 	
	 	 this.actions_exportFilteredPrepareAsPDF = new Ext.Action({
            id: 'exportFilteredPrepareAsPDFButton',
            text: 'Liste lt. Filter als PDF',
            handler: this.exportFilteredPrepareAsPDF,
            scope: this
        });
		 
	 	this.actions_exportFilteredPrepareAsCSV = new Ext.Action({
            id: 'exportFilteredPrepareAsCSVButton',
            text: 'Liste lt. Filter als CSV',
            disabled: true,
            handler: this.exportFilteredPrepareAsCSV,
            scope: this
        });
	 	
	 	 this.actions_downloadExportPrepareAsPDF = new Ext.Action({
	            id: 'downloadExportPrepareAsPDFButton',
	            text: 'Vorbereitungsliste als PDF',
	            handler: this.downloadExportPrepareAsPDF,
	            disabled: true,
	            scope: this
	        });
			 
		 	this.actions_downloadExportPrepareAsCSV = new Ext.Action({
	            id: 'downloadxportPrepareAsCSVButton',
	            text: 'Vorbereitungsliste als CSV',
	            handler: this.downloadExportPrepareAsCSV,
	            disabled: true,
	            scope: this
	        });
		 	
		 	 this.actions_downloadExportFilteredPrepareAsPDF = new Ext.Action({
	            id: 'downloadxportFilteredPrepareAsPDFButton',
	            text: 'Liste lt. Filter als PDF',
	            handler: this.downloadExportFilteredPrepareAsPDF,
	            disabled: true,
	            scope: this
	        });
			 
		 	this.actions_downloadExportFilteredPrepareAsCSV = new Ext.Action({
	            id: 'downloadxportFilteredPrepareAsCSVButton',
	            text: 'Liste lt. Filter als CSV',
	            handler: this.downloadExportFilteredPrepareAsCSV,
	            disabled: true,
	            scope: this
	        });
		 	
		 	this.action_downloadMainResult = new Ext.Action({
	            actionType: 'edit',
	            iconCls: '',
	            text: this.getDownActionText(),
	            handler: this.downloadFile.createDelegate(this,['MAIN']),
	            disabled:true,
	            scope: this
	        });
		 	
		 	this.action_downloadMainResultProtocol = new Ext.Action({
	            actionType: 'edit',
	            iconCls: '',
	            text: 'Protokoll herunterladen (PDF)',
	            handler: this.downloadFile.createDelegate(this,['PROTOCOL']),
	            disabled:true,
	            scope: this
	        });
	        
		 
        this.actions_exportPrepare = new Ext.Action({
        	id: 'exportPrepareButton',
         	allowMultiple: false,
         	disabled:false,
         	text: 'Vorbereitung Export/Druck',
            menu:{
             	items:[
             	       this.actions_exportPrepareAsPDF,
             	       this.actions_exportPrepareAsCSV,
 					   this.actions_exportFilteredPrepareAsPDF,
 					   this.actions_exportFilteredPrepareAsCSV
             	]
             }
         });
        
        this.actions_downloadExportPrepare = new Ext.Action({
        	id: 'exportPrepareDownButton',
         	allowMultiple: false,
         	disabled:false,
         	text: 'Download Vorbereitung Export/Druck',
            menu:{
             	items:[
             	       this.actions_downloadExportPrepareAsPDF,
             	       this.actions_downloadExportPrepareAsCSV,
 					   this.actions_downloadExportFilteredPrepareAsPDF,
 					   this.actions_downloadExportFilteredPrepareAsCSV
             	]
             }
         });
        
        this.actions_downloadMainResult = new Ext.Action({
        	id: 'downloadMainResultButton',
         	allowMultiple: false,
         	disabled:false,
         	text: 'Ergebnis herunterladen',
            menu:{
             	items:[
             	      this.action_downloadMainResult,
             	      this.action_downloadMainResultProtocol
             	]
             }
         });
        
        
        Tine.Billing.BatchJobEditDialog.superclass.initActions.call(this);
    },
    initButtons: function(){
    	Tine.Billing.BatchJobEditDialog.superclass.initButtons.call(this);
    	/*this.toggleAutoUpdateButton = Ext.apply(new Ext.Button(this.action_autoUpdater), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    pressed: this.autoUpdate,
		    enableToggle:true,
		    text: this.autoUpdateText,
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		this.toggleAutoUpdateButton.on('toggle', this.onToggleAutoUpdate, this);
    	*/
		this.exportPrepareButton = Ext.apply(new Ext.Button(this.actions_exportPrepare), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    text: 'Vorbereitung Export/Druck',
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		
		this.downloadExportPrepareButton = Ext.apply(new Ext.Button(this.actions_downloadExportPrepare), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    text: 'Download Vorbereitung Export/Druck',
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		
		this.approveButton = Ext.apply(new Ext.Button(this.action_approve), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    text: 'Freigabe erteilen',
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		
		this.runMainActionButton = Ext.apply(new Ext.Button(this.action_runMainAction), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    text: this.getRunActionText(),
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		
		this.downloadMainResult = Ext.apply(new Ext.Button(this.actions_downloadMainResult), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    text: 'Ergebnis herunterladen',
		    iconAlign: 'left',
		    arrowAlign:'right'
		});
		
		/*this.toggleAutoUpdateButton = Ext.apply(new Ext.Button(this.action_autoUpdater), {
		    scale: 'large',
		    width:150,
		    rowspan: 3,
		    pressed: this.autoUpdate,
		    enableToggle:true,
		    text: this.autoUpdateText,
		    iconAlign: 'left',
		    arrowAlign:'right'
		});*/
		
    	this.tbar = [
    	     this.exportPrepareButton,
    	     this.downloadExportPrepareButton,
    	     this.approveButton,
    	     this.runMainActionButton,
    	     this.actions_downloadMainResult
    	];
    	
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },
 // functions
    exportPrepareAsPDF: function(){
    	this.printPrepare('PRINTPREPARE');
    },
    exportFilteredPrepareAsPDF:function(){
    	this.printPrepare('PRINTFILTEREDLIST');
    },
    downloadExportPrepareAsPDF: function(){
    	this.downloadFile('PREPARE');
    },
    downloadExportFilteredPrepareAsPDF: function(){
    	this.downloadFile('PREPAREFILTERED');
    },
    /*
    exportPrepareAsCSV
    exportFilteredPrepareAsPDF
    exportFilteredPrepareAsCSV
    downloadExportPrepareAsPDF
    downloadExportPrepareAsCSV
    downloadExportFilteredPrepareAsPDF
    downloadExportFilteredPrepareAsCSV
    */
    onToggleAutoUpdate: function(){
    	var buttonState = this.toggleAutoUpdateButton.pressed;
		if(buttonState == true){
			this.autoUpdate = true;
			this.createAutoUpdater();
		}else{
			this.autoUpdate = false;
			this.stopAutoUpdater();
		}
		this.setAutoUpdateText();
		this.toggleAutoUpdateButton.setText(this.autoUpdateText);
    },
    isBatchJobRunning: function(){
    	if(this.record && this.record.id && this.record.get('job_state')=='RUNNING'){
			return true;
		}
		return false;
    },
    downloadFile: function(type){
    	//var selectedRows = this.getGrid().getSelectionModel().getSelections();
    	
    	var jobId = this.record.get('id');
    	
    	var params;
    	switch(type){
    	case 'PREPARE':
    		params = {
                method: 'Billing.downloadPreparePDF',
                jobId: jobId,
                filteredList: false
            };
    		break;
    	case 'PREPAREFILTERED':
    		params = {
                method: 'Billing.downloadPreparePDF',
                jobId: jobId,
                filteredList: true
            };
    		break;
    	case 'PROTOCOL':
    		params = {
                method: 'Billing.downloadProtocolPDF',
                jobId: jobId,
                filteredList: false
            };
    		break;
    	case 'MAIN':
    		params = {
                method: this.getApiMethodDownMainResult(),
                jobId: jobId
            };
    		break;
    	}
		var downloader = new Ext.ux.file.Download({
            params: params
        }).start();
    },
	createAutoUpdater: function(){
		//if(this.isBatchJobRunning()){
			if(this.autoUpdate == true && !this.autoUpdaterRunning){
				this.autoUpdaterRunning = true;
				Ext.TaskMgr.start({
		    	    run: function(){
						this.doAutoUpdate();
					},
				    interval: this.autoUpdateInterval,
				    scope:this
		    	});
			}
		//}
	},
	stopAutoUpdater: function(){
		if(this.autoUpdaterRunning == true){
			this.autoUpdaterRunning = false;
			Ext.TaskMgr.stop({
	    	    run: function(){
					this.doAutoUpdate();
				},
			    interval: this.autoUpdateInterval,
			    scope:this
	    	});
		}
	},
	beginAutoUpdate: function(){
		this.runAutoUpdate = true;
	},
	endAutoUpdate: function(){
		this.runAutoUpdate = false;
	},
	doAutoUpdate: function(){
		if(this.runAutoUpdate){
			if(!this.editPanel){
				this.editPanel = Ext.getCmp('batchJobDtaEditPanel');
				this.editPanelMask = new Ext.Mask(this.editPanel.el,{
					useMsg: false
				});
			}
			this.editPanelMask.show();
			this.initRecord();
		}
		
	},
	getJobDtaGridFilter: function(){
		return this.actionHistoryGrid.getGridFilterToolbar().getValue();
	},
	getJobDtaGridSortInfo: function(){
		return this.actionHistoryGrid.getSortInfo();
	},
	printPrepare: function(type){
		//if(this.record.get('job_category')=='DTAEXPORT'){
			var filteredListData = null;
			var useFilteredList = false;
			if(type == 'PRINTFILTEREDLIST'){
				var filter = this.getJobDtaGridFilter();
				var sort = this.getJobDtaGridSortInfo();
				filteredListData = {
					filter: filter,
					sort: sort
				};
				useFilteredList = true;
				
				filteredListData = Ext.util.JSON.encode(filteredListData);
				//console.log(filteredListData);
			}
	    	var parentBatchJobId = this.record.get('id');

			Ext.Ajax.request({
				scope: this,
				success: function(){
					this.beginAutoUpdate();
					this.doAutoUpdate();
				},
				params: {
					method: this.getApiMethodPrintPrepare(),
					jobId: parentBatchJobId,
					filteredList: useFilteredList,
					filteredListData: filteredListData
				},
				failure: function(){
					Ext.MessageBox.show({
			            title: 'Fehler', 
			            msg: 'Es konnte kein Druck gestartet werden',
			            buttons: Ext.Msg.OK,
			            icon: Ext.MessageBox.ERROR
			        });
				}
			});
		//}
    	
    },
    onApproveBatchJob: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		this.record = new Tine.Billing.Model.BatchJob(result, result.id);
		this.onRecordLoad();
    },
	onRequestBatchJob: function(response){
			var result = Ext.util.JSON.decode(response.responseText);
			this.job = new Tine.Billing.Model.BatchJob(result, result.id);

			var id = Ext.Ajax.request({
				scope: this,
				success: this.onRequestChildBatchJob,
				timeout:3000,
				params: {
					method: 'Billing.runBatchJob',
					jobId: this.job.get('id')
				},
				failure: this.onRequestChildBatchJob
			});
			
			this.transactionId = id.tId;
	}, 
	onRequestChildBatchJob: function(){
		Ext.getCmp('subjobPanel').setActiveTab(1);
		//this.jobGrid.grid.store.re();
	},
	approveBatchJob: function(){
		var jobId = this.record.get('id');
		Ext.Ajax.request({
			scope: this,
			success: this.onApproveBatchJob,
			timeout:360000,
			params: {
				method: 'Billing.approveBatchJob',
				jobId: jobId
			},
			failure: function(){
				Ext.MessageBox.show({
		            title: 'Fehler', 
		            msg: 'Bei der Anforderung der Freigabe ist ein Fehler aufgetreten',
		            buttons: Ext.Msg.OK,
		            icon: Ext.MessageBox.ERROR
		        });
			}
		});
	},
    runMainAction: function(){
    	//if(this.record.get('job_category')=='FEEINVOICE'){
			var parentBatchJobId = this.record.get('id');
			Ext.Ajax.request({
				scope: this,
				success: this.onRequestBatchJob,
				timeout:360000,
				params: {
					method: this.getApiMethodMainAction(),
					jobId: parentBatchJobId
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
		//}
    },
	onAfterRender: function(){
		this.actionHistoryGrid.enable();
		this.actionHistoryGrid.loadBatchJob(this.record);
		
		this.actionHistoryGrid.on('selectrow', this.selectBatchJobDta, this);
		
		//this.jobGrid.enable();
		//this.jobGrid.loadBatchJob(this.record);
		
		this.createAutoUpdater();
	},
	selectBatchJobDta: function(sm){
		// should only be one record in array (single selection)
		var selRecords = sm.getSelections();
		var selRecord = selRecords[0];
		//  property grid according to selected position
		this.batchJobItemGrid.enable();
		this.batchJobItemGrid.loadBatchJobHistory(selRecord);
	},
	
	initDependentGrids: function(){
		if(this.isJobDta()){
			this.actionHistoryGrid = new Tine.Billing.BatchJobDtaGridPanel({
				title:'Transaktionen',
				layout:'border',
				region:'center',
				useImplicitForeignRecordFilter: true,
				disabled:true,
				frame: true,
				app: Tine.Tinebase.appMgr.get('Billing')
			});
			
			this.batchJobItemGrid = new Tine.Billing.BatchJobDtaItemGridPanel({
				title:'OPs - Transaktionskomponenten',
				layout:'border',
				region:'east',
				width:300,
				split:true,
				doInitial:false,
				useImplicitForeignRecordFilter: true,
				disabled:true,
				frame: true,
				app: Tine.Tinebase.appMgr.get('Billing')
			});
		}else if(this.isJobMonition()){
			this.actionHistoryGrid = new Tine.Billing.BatchJobMonitionGridPanel({
				title:'Mahnvorstufen',
				layout:'border',
				region:'center',
				useImplicitForeignRecordFilter: true,
				disabled:true,
				frame: true,
				app: Tine.Tinebase.appMgr.get('Billing')
			});
			
			this.batchJobItemGrid = new Tine.Billing.BatchJobMonitionItemGridPanel({
				title:'Mahn-OPs',
				layout:'border',
				region:'east',
				width:300,
				split:true,
				doInitial:false,
				useImplicitForeignRecordFilter: true,
				disabled:true,
				frame: true,
				app: Tine.Tinebase.appMgr.get('Billing')
			});
		}
		/*this.jobGrid = new Tine.Billing.BatchJobGridPanel({
			title:'Subjobs',
			layout:'border',
			useImplicitForeignRecordFilter: true,
			disabled:true,
			frame: true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});*/
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		var editPanel = {
	        xtype: 'panel',
	        id:'batchJobDtaEditPanel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
	             [	
	             // 	this.toggleAutoUpdateButton
	             //],
	             //[
					{
						fieldLabel: 'BatchJob-Nr',
					    emptyText: '<automatisch>',
					    disabledClass: 'x-item-disabled-view',
					    id:'job_nr',
					    name:'job_nr',
					    value:null,
					    disabled:true,
					    width: 150
					},{
						fieldLabel: 'Kategorie',
						disabledClass: 'x-item-disabled-view',
						id: 'job_category',
						disabledClass: 'x-item-disabled-view',
					    disabled:true,
						name: 'job_category',
						width: 120
					}
				 ],[
					{
						fieldLabel: 'Bezeichnung1',
					    id:'job_name1',
					    name:'job_name1',
					    value:null,
					    width: 500
					} 
				 ],[
					{
						fieldLabel: 'Bezeichnung2',
					    id:'job_name2',
					    name:'job_name2',
					    value:null,
					    width: 500
					} 
				 ],[
					{
						fieldLabel: 'Status',
					    id:'job_state',
					    name:'job_state',
					    disabledClass: 'x-item-disabled-view',
					    
					    disabled:true,
					    value:null,
					    width: 130
					},{
						fieldLabel: 'Ergebnisstatus',
					    id:'job_result_state',
					    name:'job_result_state',
					    disabledClass: 'x-item-disabled-view',
					    
					    disabled:true,
					    value:null,
					    width: 130
					} 
	             ]
	        ]}]
	    };
		return [
	 			{
	 				   xtype:'panel',
	 				   layout:'border',
	 				   frame:true,
	 				   items:[
							{
								 xtype:'panel',
								 region:'south',
								 split:true,
								 height:340,
								 layout:'border',
								 items:[
								        this.actionHistoryGrid,
								        this.batchJobItemGrid
								 ]
							 },{
	 				        	 xtype: 'panel',
	 				        	 region:'center',
	 				        	 autoScroll:true,
	 				        	 items: editPanel
	 				         }
	 				         
	 				         
	 				   ]
	 			}   
	 		];
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.BatchJobEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 900,
        height: 600,
        name: Tine.Billing.BatchJobEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BatchJobEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};