Ext.namespace('Tine.Receipt');

Tine.Billing.PrintReceiptDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'PrintReceiptWindow_',
	title: 'Auftragsbelege drucken',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
//	recordClass: Tine.Billing.Model.Receipt,
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
		Tine.Billing.PrintReceiptDialog.superclass.initComponent.call(this);
		this.on('afterrender', this.onAfterRender, this);
	},
	onAfterRender: function(){
		Ext.getCmp('doc_type').setValue(this.docType);
	},
	initActions: function(){
        this.actions_print = new Ext.Action({
            text: 'Ok',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.printReceipts,
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
	printReceipts: function(){
		var types = Ext.util.JSON.encode(
			{
				shipping: Ext.getCmp('with_shipping').getValue(),
				invoice: Ext.getCmp('with_invoice').getValue(),
				credit: Ext.getCmp('with_credit').getValue()
			}
		);
		var sort = Ext.util.JSON.encode(
			{
				field: Ext.getCmp('receipt_sort').getValue(),
				order: Ext.getCmp('receipt_sort_dir').getValue()
			}
		);
		var params = {
            method: 'Billing.printReceiptsByFilter',
            requestType: 'HTTP',
            types: types,
            outputType: 'DOWNLOAD',
            userOptions: this.radioGroup.getValue().inputValue,
            filters:  Ext.util.JSON.encode(this.filterPanel.getValue()),
            sort: sort,
            additionalOptions: null
        };
        
		var additionalOptions = {
			copy: false,
			preview: false,
			addressLabels: false
		};
		
		this.docType = Ext.getCmp('doc_type').getValue();
		switch(this.docType){
		case 'PREVIEW':
			additionalOptions.preview = true;
			break;
		case 'COPY':
			additionalOptions.copy = true;
			break;
		case 'ADDRESS':
			additionalOptions.addressLabels = true;
			break;

		}
		params.additionalOptions = Ext.util.JSON.encode(additionalOptions);
		
		var downloader = new Ext.ux.file.Download({
			params: params
        }).start();
		//var filterValue = Ext.util.JSON.encode(this.filterPanel.getValue());
		//var shipping = Ext.getCmp('with_shipping').getValue();
		//var invoice = Ext.getCmp('with_invoice').getValue();
		//var win = window.open(
		//		Sopen.Config.runtime.requestURI + '?method=Billing.printReceiptList&shipping='+shipping+'&invoice='+invoice, //filters='+filterValue,
		//		"receiptsPDF",
		//		"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		//);
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
		this.radioGroup = new Ext.form.RadioGroup({
			hideLabel:true,
			columnWidth: 1,
		    id:"users",
		    items: [
		      	  {xtype: 'radio', name:'users', checked:true, hideLabel: true, boxLabel:'nur von mir erfasste', inputValue:'ONLYMINE'},
				  {xtype: 'radio', name:'users', hideLabel: true, boxLabel:'alle Benutzer', inputValue:'ALLUSERS'},
				  {xtype: 'radio', name:'users', hideLabel: true, boxLabel:'Benutzer laut Filter', inputValue:'CERTAINUSER'}
			 ]    
		});
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
							xtype: 'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'with_shipping',
							name: 'with_shipping',
							hideLabel:true,
							value:true,
						    boxLabel: 'Lieferscheine',
						    width: 140
						},{
							xtype: 'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'with_invoice',
							name: 'with_invoice',
							hideLabel:true,
							value:true,
							checked: true,
						    boxLabel: 'Rechnungen',
						    width: 140
						},{
							xtype: 'checkbox',
							disabledClass: 'x-item-disabled-view',
							id: 'with_credit',
							name: 'with_credit',
							hideLabel:true,
							value:true,
						    boxLabel: 'Gutschriften',
						    width: 140
						},{
						    fieldLabel: 'Ausgabe',
						    disabledClass: 'x-item-disabled-view',
						    allowEdit:false,
						    id:'doc_type',
						    name:'doc_type',
						    width: 200,
						    xtype:'combo',
						    store:[['ORIGINAL','Oringinaldokumente'],['PREVIEW','Vorschau'],['COPY','Kopien'],['ADDRESS','Adressaufkleber']],
						    value: 'ORIGINAL',
							mode: 'local',
							displayField: 'name',
						    valueField: 'id',
						    triggerAction: 'all'
						}
				],[
				 this.radioGroup
				],[
					{
					    fieldLabel: 'Sortierung',
					    disabledClass: 'x-item-disabled-view',
					    allowEdit:false,
					    id:'receipt_sort',
					    name:'receipt_sort',
					    width: 200,
					    xtype:'combo',
					    store:[/*['order_nr','Auftrags-Nr'],*/['creation_time','Zeitpunkt Erstellung']],
					    value: 'creation_time',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					},{
					    fieldLabel: 'Richtung',
					    disabledClass: 'x-item-disabled-view',
					    allowEdit:false,
					    id:'receipt_sort_dir',
					    name:'receipt_sort_dir',
					    width: 140,
					    xtype:'combo',
					    store:[['ASC','aufsteigend'],['DESC','absteigend']],
					    value: 'ASC',
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
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
				filterModels: Tine.Billing.Model.Receipt.getFilterModel(),
				defaultFilter: 'query',
				filters:this.predefinedFilter
		});
		 
		this.filterPanel.on('afterrender', this.onAfterRender, this);
		
		var wrapper = {
			xtype: 'panel',
			layout: 'border',
			frame: true,
			items: [
			   panel,
			   {
					xtype: 'panel',
					title: 'Selektion Belege',
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
 * Receipt Edit Popup
 */
Tine.Billing.PrintReceiptDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	record = {};
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 300,
        name: Tine.Billing.PrintReceiptDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.PrintReceiptDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};