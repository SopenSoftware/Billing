Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.BookingTemplateGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-booking-template-gridpanel',
	stateId: 'tine-billing-booking-template-gridpanel-state-id',
    recordClass: Tine.Billing.Model.BookingTemplate,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'booking_template_nr', direction: 'DESC'},
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'booking_template_nr'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.bookingTemplateBackend;
        
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.BookingTemplateGridPanel.superclass.initComponent.call(this);
    },
   
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.BookingTemplate.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    getContextMenuItems: function(){
    	var contextMenuItems = Tine.Billing.BookingTemplateGridPanel.superclass.getContextMenuItems.call(this);
    	return contextMenuItems.concat(
    	[
    	        '-',
    	        this.action_reverseBookingTemplate
    	]);
    },
	getColumns: function() {
		return [
		   {  header: this.app.i18n._('Vorlagen-Nr'), dataIndex: 'booking_template_nr', width:100, sortable:true },
		   {  header: this.app.i18n._('Bezeichnung'), dataIndex: 'name', width:400, sortable:true },
		   
		   {  header: this.app.i18n._('Buchungstext'), dataIndex: 'booking_text', width:400, sortable:true },
		   { header:  this.app.i18n._('Kontext'), dataIndex: 'erp_context_id', renderer: Tine.Billing.renderer.erpContextRenderer, sortable:true }		   
	    ];
	}

});