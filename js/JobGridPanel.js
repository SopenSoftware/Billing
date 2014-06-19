Ext.namespace('Tine.Billing');


/**
 * Timeaccount grid panel
 */
Tine.Billing.JobGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-job-gridpanel',
	recordClass: Tine.Billing.Model.Job,
    evalGrants: false,
    // grid specific
    defaultSortInfo: {field: 'id', direction: 'DESC'},
    gridConfig: {
        loadMask: true//,
        //autoExpandColumn: 'id'
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.jobBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.JobGridPanel.superclass.initComponent.call(this);
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.Job.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },
	getColumns: function() {
		var columns = Tine.Billing.Job.GridPanelConfig.getColumns();
		return [
		   columns.job_nr,
		   columns.contact_id,
		   columns.name,
		   columns.description,
		   columns.budget_unit_id,
		   columns.budget_amount,
		   columns.finish_date,
		   columns.billing_state,
		   { id: 'tags', header: this.app.i18n._('Tags'), dataIndex: 'tags', width: 50, renderer: Tine.Tinebase.common.tagsRenderer, sortable: false, hidden: false  },
           { id: 'creation_time', header: this.app.i18n._('Creation Time'), dataIndex: 'creation_time', renderer: Tine.Tinebase.common.dateRenderer },
           { id: 'last_modified_time', header: this.app.i18n._('Last Modified Time'), dataIndex: 'last_modified_time', renderer: Tine.Tinebase.common.dateRenderer }
	    ];
	}
});

Ext.namespace('Tine.Billing.Job.GridPanelConfig');

Tine.Billing.Job.GridPanelConfig.getColumns = function(){
	var app = Tine.Tinebase.appMgr.get('Billing');
	return {
		job_nr:
			{ id: 'job_nr', header: app.i18n._('Job-Nr'), dataIndex: 'job_nr', sortable:true },
		contact_id:
			{ id: 'contact_id', header: app.i18n._('Ansprechpartner'), dataIndex: 'contact_id', renderer:Tine.Billing.renderer.contactRenderer, sortable:true },
		name:
			{ id: 'name', header: app.i18n._('Bezeichnung'), dataIndex: 'name', sortable:true },
		description:
			{ id: 'description', header: app.i18n._('Beschreibung'), dataIndex: 'description', sortable:true },
		budget_unit_id:
			{ id: 'budget_unit_id', header: app.i18n._('Budget-Einheit'), dataIndex: 'budget_unit_id', sortable:true },		
		budget_amount:
			{ id: 'budget_amount', header: app.i18n._('Budget'), dataIndex: 'budget_amount', sortable:true },			
		finish_date:
			{ id: 'finish_date', header: app.i18n._('Fertigstellung'), dataIndex: 'finish_date', sortable:true },			
		billing_state:
			{ id: 'billing_state', header: app.i18n._('Abrechnungsstatus'), dataIndex: 'billing_state', sortable:true }			

	};
}