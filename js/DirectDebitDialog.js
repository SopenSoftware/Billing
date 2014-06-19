Ext.namespace('Tine.Billing');

Tine.Billing.DirectDebitDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'DirectDebitWindow_',
	title: '',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
	predefinedFilter: null,
	processing: false,
	jobType: 'DTA',
	jobData: {
		DTA: {
			title: 'Fällige Lastschriften einziehen (DTA erzeugen)',
			apiMethod: 'Billing.requestBatchJobDtaDebit'
		},
		MONITION: {
			title: 'Fällige OPs anmahnen',
			apiMethod: 'Billing.requestBatchJobMonition'
		}
	},
	/**
	 * {Tine.Billing.CreateTLAccountGridPanel}	positions grid
	 */
	grid: null,
	getJobData: function(){
		switch(this.jobType){
			case 'DTA':
				return this.jobData.DTA;
				
			case 'MONITION':
				return this.jobData.MONITION;
				
			throw 'Unknown jobType ' + this.jobType;
		
		}
	},
	getJobTitle: function(){
		var jobData = this.getJobData();
		return jobData.title;
	},
	getApiMethod: function(){
		var jobData = this.getJobData();
		return jobData.apiMethod;
	},
	/**
	 * initialize component
	 */
	initComponent: function(){
		Ext.applyIf(this, this.initialConfig);
		this.title = this.getJobTitle();
		this.initActions();
		this.initToolbar();
		this.predefinedFilter = [{field:'due_date', 'operator': 'beforeOrAt', value: new Date()}];
		this.items = this.getFormItems();
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.DirectDebitDialog.superclass.initComponent.call(this);
	},
	setFilter: function(filter){
		this.filterPanel.setValue(filter);
	},
	onAfterRender: function(){
		this.setTitle(this.getJobTitle());
	},
	initActions: function(){
        this.actions_directDebit = new Ext.Action({
            text: 'Ok',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.directDebit,
            scale:'small',
            iconAlign:'left',
            scope: this
        });
        this.actions_cancel = new Ext.Action({
            text: 'Abbrechen',
            disabled: false,
            iconCls: 'action_cancel',
            handler: this.cancel,
            scale:'small',
            iconAlign:'left',
            scope: this
        });        
	},
	/**
	 * init bottom toolbar
	 */
	initToolbar: function(){
		this.bbar = new Ext.Toolbar({
			height:48,
        	items: [
        	        '->',
                    Ext.apply(new Ext.Button(this.actions_cancel), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    }),
                    Ext.apply(new Ext.Button(this.actions_directDebit), {
                        scale: 'medium',
                        rowspan: 2,
                        iconAlign: 'left',
                        arrowAlign:'right'
                    })
                ]
        });
	},
	/**
	 * save the order including positions
	 */
	directDebit: function(){
		if(!this.processing){
			this.processing = true;
		}else{
			this.actions_directDebit.disable();
			return;
		}
		var filterValue = Ext.util.JSON.encode(this.filterPanel.getValue());
		var contexts = {
			ERP: Ext.getCmp('ERP').getValue(),
			MEMBERSHIP: Ext.getCmp('MEMBERSHIP').getValue(),
			DONATOR: Ext.getCmp('DONATOR').getValue(),
			EVENTMANAGER: Ext.getCmp('EVENTMANAGER').getValue(),
			FUNDPROJECT: Ext.getCmp('FUNDPROJECT').getValue()
		};
		
		if(	!contexts.ERP && 
			!contexts.MEMBERSHIP && 
			!contexts.DONATOR && 
			!contexts.EVENTMANAGER && 
			!contexts.FUNDPROJECT
		){
			Ext.MessageBox.show({
	            title: 'Hinweis', 
	            msg: 'Bitte wählen Sie mindestens einen Kontext aus!',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.INFO
	        });
			return;
		}
		
		Ext.Ajax.request({
			scope: this,
			success: this.onRequestJob,
			timeout:10000,
			params: {
				method: this.getApiMethod(),
				filters: filterValue,
				contexts: Ext.util.JSON.encode(contexts)
			},
			failure: function(){
				Ext.MessageBox.show({
		            title: 'Fehler', 
		            msg: 'Es konnte kein Job erzeugt werden',
		            buttons: Ext.Msg.OK,
		            icon: Ext.MessageBox.ERROR
		        });
			}
		});
		
		
	},
	onRequestJob: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		this.job = new Tine.Billing.Model.BatchJob(result, result.id);

		this.transactionId = Ext.Ajax.request({
			scope: this,
			success: this.onRunJob,
			timeout:3000,
			params: {
				method: 'Billing.runBatchJob',
				jobId: this.job.get('id')
			},
			failure: function(){
				this.abortJobStart();
			}
		});
		
		
	}, 
	abortJobStart: function(){
		if(this.transactionId && !this.aborted){
			Ext.Ajax.abort(this.transactionId);
			this.transactionId = null;
			this.onRunJob();
		}
	},
	onRunJob: function(){
		this.aborted = true;
		Tine.Billing.BatchJobEditDialog.openWindow({
			autoUpdate: true,
			closeWindowOnLoad: this.window,
			record: this.job
		});
		
	},
	updateJob: function(){
		
	},
	onUpdateJob: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		this.job = new Tine.Membership.Model.Job(result, result.id);
		//this.jobPanelTpl.overwrite(this.body, this.job.data);
		if(this.job.get('job_state') == 'PROCESSED'){
			Ext.TaskMgr.stop({
	    	    run: function(){
					this.updateJob();
				},
			    interval: 5000,
			    scope:this
	    	});
		}
	},
	/**
	 * Cancel and close window
	 */
	cancel: function(){
		this.purgeListeners();
        this.window.close();
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		var panel = {
	        xtype: 'panel',
	        border: false,
	        region:'north',
	        height: 70,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 {xtype:'hidden',id:'filters', name:'filters', width:1},
				 {
					xtype: 'checkbox',
					disabledClass: 'x-item-disabled-view',
					id: 'ERP',
					name: 'ERP',
					hideLabel:true,
					disabled:false,
					value:true,
				    boxLabel: 'Kontext ERP',
				    width: 200
				},{
					xtype: 'checkbox',
					disabledClass: 'x-item-disabled-view',
					id: 'MEMBERSHIP',
					name: 'MEMBERSHIP',
					hideLabel:true,
					disabled:false,
				    boxLabel: 'Kontext Mitglieder',
				    width: 200
				},{
					xtype: 'checkbox',
					disabledClass: 'x-item-disabled-view',
					id: 'DONATOR',
					name: 'DONATOR',
					hideLabel:true,
					disabled:false,
				    boxLabel: 'Kontext Spenden',
				    width: 200
				},{
					xtype: 'checkbox',
					disabledClass: 'x-item-disabled-view',
					id: 'EVENTMANAGER',
					name: 'EVENTMANAGER',
					hideLabel:true,
					disabled:false,
				    boxLabel: 'Kontext Veranstaltungen',
				    width: 200
				},{
					xtype: 'checkbox',
					disabledClass: 'x-item-disabled-view',
					id: 'FUNDPROJECT',
					name: 'FUNDPROJECT',
					hideLabel:true,
					disabled:false,
				    boxLabel: 'Kontext Förderprojekte',
				    width: 200
				}
				]
	        ]}]
	    };

		if(this.predefinedFilter == null){
			this.predefinedFilter = [];
		}
		this.filterPanel = new Tine.widgets.form.FilterFormField({
			 	id:'fp',
		    	filterModels: Tine.Billing.Model.OpenItem.getDebitExportFilterModel(),
		    	defaultFilter: 'due_date',
		    	filters:this.predefinedFilter
		});
		 
		var wrapper = {
			xtype: 'panel',
			layout: 'border',
			frame: true,
			items: [
			   panel,
			   {
					xtype: 'panel',
					title: 'Selektion OPs',
					height:200,
					id:'filterPanel',
					region:'center',
					autoScroll:true,
					items: 	[this.filterPanel]
				}  
			]
		
		};
		return wrapper;
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.DirectDebitDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	record = {};
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 300,
        name: Tine.Billing.DirectDebitDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.DirectDebitDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};