Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.BookingGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-booking-gridpanel',
	stateId: 'tine-billing-booking-gridpanel-state-id',
    recordClass: Tine.Billing.Model.Booking,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'booking_nr', direction: 'DESC'},
    useEditorGridPanel: true,
    
    gridConfig: {
    	clicksToEdit: 1,
        loadMask: true,
        autoExpandColumn: 'booking_text'
    },
    crud:{
    	_add:true,
    	_edit:true,
    	_delete:true
    },
    inDialog:false,
    initComponent: function() {
        this.recordProxy = Tine.Billing.bookingBackend;
        
        this.action_reverseBooking = new Ext.Action({
            text: 'Buchung stornieren',
            //disabled: true,
            actionType: 'edit',
            handler: this.reverseBooking,
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
        
        this.action_improveBookingsValid = new Ext.Action({
            text: 'Buchungen: Validität prüfen',
            //disabled: true,
            actionType: 'edit',
            handler: this.improveBookingsValid,
            //actionUpdater: this.updatePayInvoiceAction,
            iconCls: 'action_edit',
            scope: this
        });
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.cm = new Ext.grid.ColumnModel(this.getColumns());
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.BookingGridPanel.superclass.initComponent.call(this);
    },
    getActionToolbarItems: function() {
    	return [
            Ext.apply(new Ext.Button(this.action_improveBookingsValid), {
                scale: 'medium',
                rowspan: 2,
                iconAlign: 'top',
                iconCls: 'action_execDueTasksMedium'
            })
        ];
    },
    reverseBooking: function(){
    	var selectedId = this.getSelectedId();
    	if(!selectedId){
    		return true;
    	}
    	Ext.Ajax.request({
            scope: this,
            success: this.onReverseBooking,
            params: {
                method: 'Billing.reverseBooking',
               	bookingId:  selectedId
            },
            failure: this.onReverseBookingFailed
        });
	},
	
	onReverseBooking: function(response){
		this.reverseBookingResponse = response;
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Buchung wurde erfolgreich storniert.',
            buttons: Ext.Msg.OK,
            //scope:this,
            //fn: this.showReversedDialog,
            icon: Ext.MessageBox.INFO
        });
		this.refresh();
	},
	onReverseBookingFailed: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Buchung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	improveBookingsValid: function(){
    	Ext.Ajax.request({
			scope: this,
			success: this.onImproveBookingsValid,
			timeout:3600000,
			params: {
				method: 'Billing.improveBookingsValid'
			},
			failure: this.onImproveBookingsValidFailure
		});
    },
    onImproveBookingsValid: function(response){
    	Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Überprüfung der Buchungen ist fertiggestellt.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.INFO
        });
    },
    onImproveBookingsValidFailure: function(response){
    	Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Überprüfung der Buchungen ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
    },
	onEditCompound: function(){
		var selectedRecord = this.getSelectedRecord();
		if(selectedRecord){
		   	this.compoundWin = Tine.Billing.CompoundWorkPanel.openWindow({
				booking: selectedRecord
			});
		}
	},
    initFilterToolbar: function() {
    	var plugins = [];
    	if(!this.inDialog){
    		plugins = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
    	}
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Booking.getFilterModel(),
            defaultFilter: 'booking_text',
            filters: [{field:'booking_text',operator:'contains',value:''}],
            plugins: plugins
        });
    },  
    getContextMenuItems: function(){
    	var contextMenuItems = Tine.Billing.BookingGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_reverseBooking,
    	        this.action_editCompound
    	]);
    },
	getColumns: function() {
		return [
		   {  header: this.app.i18n._('ID'), dataIndex: 'id', width:100, sortable:true, hidden:true },
		   {  header: this.app.i18n._('Buchungsnummer'), dataIndex: 'booking_nr', width:100, sortable:true },
		   {  header: this.app.i18n._('Belegnummer'), dataIndex: 'booking_receipt_nr', width:100, sortable:true,
			   editor: {
				   xtype:'textfield'
		   }},
		   {  header: this.app.i18n._('Buchungstext'), dataIndex: 'booking_text', width:400, sortable:true,
			   editor: {
				   xtype:'textfield'
		   } },
		   {  header: this.app.i18n._('Buchungsdatum'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'booking_date', sortable:true,
			   editor: {
				   xtype:'datefield',
				   enableKeyEvents:true,
				   hideTrigger:true,
				   triggerAction: 'all'
			   }},
		   {  header: this.app.i18n._('Belegdatum'), renderer: Tine.Tinebase.common.dateRenderer, dataIndex: 'booking_receipt_date', sortable:true,
			   editor: {
				   xtype:'datefield',
				   enableKeyEvents:true,
				   hideTrigger:true,
				   triggerAction: 'all'
			   }},
		   { header:  this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true,
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
		   //{  header: this.app.i18n._('Belegnummer ERP'), dataIndex: 'receipt_unique_nr', width:100, sortable:true },
		   {  header: this.app.i18n._('Betrag'), dataIndex: 'value',renderer: Sopen.Renderer.MonetaryNumFieldRenderer,sortable:true},
		   { header: this.app.i18n._('Valide'), dataIndex: 'valid', sortable:true },
	       { header: this.app.i18n._('Storniert'), dataIndex: 'is_cancelled', sortable:true },
	       { header: this.app.i18n._('Ist Storno'), dataIndex: 'is_cancellation', sortable:true },
		   
	    ];
	}

});