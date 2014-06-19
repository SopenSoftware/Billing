Ext.namespace('Tine.Billing');

Tine.Billing.ExportFibuDialog = Ext.extend(Ext.form.FormPanel, {
	windowNamePrefix: 'ExportFibuWindow_',
	title: 'Forderungsbuchungen an Fibu übergeben (csv)',
	//mode: 'local',
	appName: 'Billing',
	layout:'fit',
	predefinedFilter: null,
	/**
	 * {Tine.Billing.CreateTLAccountGridPanel}	positions grid
	 */
	grid: null,
	/**
	 * initialize component
	 */
	initComponent: function(){
		this.initActions();
		this.initToolbar();
		this.items = this.getFormItems();
		Tine.Billing.ExportFibuDialog.superclass.initComponent.call(this);
	},
	setFilter: function(filter){
		this.filterPanel.setValue(filter);
	},
	initActions: function(){
        this.actions_exportFibu = new Ext.Action({
            text: 'Ok',
            disabled: false,
            iconCls: 'action_applyChanges',
            handler: this.exportFibu,
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
                    Ext.apply(new Ext.Button(this.actions_exportFibu), {
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
	exportFibu: function(){
		var filterValue = Ext.util.JSON.encode(this.filterPanel.getValue());
        
		var downloader = new Ext.ux.file.Download({
			timeout: 12000000,
            params: {
                method: 'Billing.exportFibu',
                requestType: 'HTTP',
                filters: filterValue
                
                //_format: this.format
            }
        }).start();
        
//		var win = window.open(
//				Sopen.Config.runtime.requestURI + '?method=Billing.exportFibu&filters='+filterValue,
//				"sPDF",
//				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
//		);
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
	        region:'center',
	        height: 1,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 {xtype:'hidden',id:'filters', name:'filters', width:1}
				]
	        ]}]
	    };

		if(this.predefinedFilter == null){
			this.predefinedFilter = [];
		}
		this.filterPanel = new Tine.widgets.form.FilterFormField({
			 	id:'fp',
		    	filterModels: Tine.Billing.Model.OpenItem.getFilterModel(),
		    	defaultFilter: 'receipt_date',
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
					title: 'Selektion Forderungsbuchungen',
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
Tine.Billing.ExportFibuDialog.openWindow = function (config) {
    // TODO: this does not work here, because of missing record
	record = {};
	var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 800,
        height: 300,
        name: Tine.Billing.ExportFibuDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ExportFibuDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};