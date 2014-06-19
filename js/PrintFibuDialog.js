Ext.namespace('Tine.Billing');

Tine.Billing.PrintFibuDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'PrintFibuWindow_',
	title: 'Kontenauswertungen drucken',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
//	recordClass: Tine.Billing.Model.Fibu,
//	predefinedFilter: null,
	outputType: null,
	docType: 'ORIGINAL',
	mainGrid: null,
	isPreview: false,
	/**
	 * initialize component
	 */
	initComponent: function(){
		this.initActions();
		this.initToolbar();
		this.items = this.getFormItems();
		Tine.Billing.PrintFibuDialog.superclass.initComponent.call(this);
		this.on('afterrender', this.onAfterRender, this);
	},
	onAfterRender: function(){
		//Ext.getCmp('doc_type').setValue(this.docType);
		
		var today = new Date();
		var year = today.getFullYear();
		
		var actualBegin = new Date(year,0,1);
		var actualEnd = new Date(year,11,31);
		Ext.getCmp('fibu_susa_begin_actual').setValue(actualBegin);
		Ext.getCmp('fibu_susa_end_actual').setValue(actualEnd);
		
		Ext.getCmp('fibu_begin_datetime').setValue(actualBegin);
		Ext.getCmp('fibu_end_datetime').setValue(today);
		
	},
	initActions: function(){
        this.actions_print = new Ext.Action({
            text: 'Ok',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.printFibu,
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
                    Ext.apply(new Ext.Button(this.actions_print), {
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
	printFibu: function(){
		var data = Ext.util.JSON.encode(
			{
				printAction: Ext.getCmp('fibu_print_action').getValue(),
				beginDate: Ext.getCmp('fibu_begin_datetime').getValue(),
				endDate: Ext.getCmp('fibu_end_datetime').getValue(),
				susaBeginActual:Ext.getCmp('fibu_susa_begin_actual').getValue(),
				susaEndActual:Ext.getCmp('fibu_susa_end_actual').getValue(),
			}
		);
		
		var params = {
            method: 'Billing.printFibu',
            requestType: 'HTTP',
            data: data,
            outputType: 'DOWNLOAD',
            filters:  Ext.util.JSON.encode(this.filterPanel.getValue()),
            accountBookingFilters:  Ext.util.JSON.encode(this.abFilterPanel.getValue())
            //additionalOptions: null
        };
        
		var downloader = new Ext.ux.file.Download({
			params: params
        }).start();

	},
	/**
	 * Cancel and close window
	 */
	cancel: function(){
		this.purgeListeners();
        this.window.close();
	},
	setCurrentFilter: function(){
		if(this.mainGrid){
			this.filterBuffer = this.filterPanel.getValue();
			this.filterPanel.setValue(this.mainGrid.getGridFilterToolbar().getValue());
		}
	},
	unsetCurrentFilter: function(){
		this.filterPanel.setValue(this.filterBuffer);
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		
		var store = new Tine.Tinebase.data.RecordStore(Ext.copyTo({readOnly: true}, {
			recordClass: Tine.widgets.persistentfilter.model.PersistentFilter,
			proxy: Tine.widgets.persistentfilter.model.persistentFilterProxy
		}, 'totalProperty,root,recordClass'));
		// use some fields from brevetation edit dialog
		
		var panel = {
	        xtype: 'panel',
	        region:'north',
	        anchor:'100%',
	        border: false,
	        frame:true,
	        height:130,
	        items:[{xtype:'columnform',items:[
	              [
					{
					    fieldLabel: 'Druckaktion',
					    disabledClass: 'x-item-disabled-view',
					    allowEdit:false,
					    id:'fibu_print_action',
					    name:'print_action',
					    width: 140,
					    xtype:'combo',
					    store:[
					           ['PRINT_ACTION_STATEMENT','Kontoauszug'],
					           ['PRINT_ACTION_SUMSALDATION','SuSa'],
					           ['PRINT_ACTION_SALDATION','Kundenliste'],
					           ['PRINT_ACTION_ADD1','Zusatz1'],
					           ['PRINT_ACTION_ADD2','Zusatz2'],
					           ['PRINT_ACTION_ADD3','Zusatz3']
					    ],
					    value: 'PRINT_ACTION_STATEMENT',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}
				],[
					{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'fibu_begin_datetime',
						name: 'begin_datetime',
						value: new Date(),
						fieldLabel: 'Stichtag/Beginn Zeitraum',
					    width:180
					},{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'fibu_end_datetime',
						name: 'end_datetime',
						fieldLabel: 'Zeitraum Ende',
					    width:180
					}
				],[
					{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'fibu_susa_begin_actual',
						name: 'susa_begin_actual',
						value: new Date(),
						fieldLabel: 'Susa: Beginn akt. Periode',
					    width:180
					},{
						xtype:'extuxclearabledatefield',
						disabledClass: 'x-item-disabled-view',
						id: 'fibu_susa_end_actual',
						name: 'susa_end_actual',
						value: new Date(),
						fieldLabel: 'Susa: Ende akt. Periode',
					    width:180
					}
				],[
				   {xtype: 'checkbox', checked: true, name:'use_current_filter',hideLabel: true, boxLabel:'aktuellen Filter der Hauptansicht verwenden',
					   listeners:{
						   check:{
							   scope: this,
							   fn: function(field){
								   switch(field.getValue()){
								   case true:
									   this.setCurrentFilter();
									   break;
								   case false:
									   this.unsetCurrentFilter();
									   break;
								   }
							   }
						   }
					   }
				   }
				],[
				 {xtype:'hidden',id:'filters', name:'filters', width:1}
				]
	        ]}]
	    };

		if(this.predefinedFilter == null){
			this.predefinedFilter = [];
		}
		this.filterPanel = new Tine.widgets.form.FilterFormField({
				id:'fp',
				filterModels: Tine.Billing.Model.AccountSystem.getFilterModel(),
				defaultFilter: 'query',
				filters:this.predefinedFilter
		});
		 
		this.filterPanel.on('afterrender', this.onAfterRender, this);
		
		this.abFilterPanel = new Tine.widgets.form.FilterFormField({
			id:'afp',
			filterModels: Tine.Billing.Model.AccountBooking.getFilterModel(),
			defaultFilter: 'query',
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
					title: 'Fibu Druckausgabe - Selektion der Konten',
					height:200,
					id:'filterPanel',
					region:'center',
					autoScroll:true,
					items: 	[this.filterPanel]
				},
			   {
					xtype: 'panel',
					title: 'Selektion Buchungen',
					height:200,
					id:'abFilterPanel',
					region:'south',
					autoScroll:true,
					items: 	[this.abFilterPanel]
				}    
			]
		
		};
		return wrapper;
	}
});

/**
 * Fibu Edit Popup
 */
Tine.Billing.PrintFibuDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	record = {};
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 600,
        name: Tine.Billing.PrintFibuDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.PrintFibuDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};