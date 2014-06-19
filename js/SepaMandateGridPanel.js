Ext.namespace('Tine.Billing');

/**
 * Timeaccount grid panel
 */
Tine.Billing.SepaMandateGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
	id: 'tine-billing-sepa-mandate-gridpanel',
	stateFull:true,
	stateId: 'tine-billing-sepa-mandate-gridpanel-state-id',
    recordClass: Tine.Billing.Model.SepaMandate,
    evalGrants: false,
    currentRecord: null,
    // grid specific
    defaultSortInfo: {field: 'mandate_ident', direction: 'DESC'},
    useEditorGridPanel: true,
    gridConfig: {
        loadMask: true,
        autoExpandColumn: 'contact_id',
        clicksToEdit: 1
    },
    crud:{
    	_add:true,
    	_edit:true,
    	_delete:true
    },
    initComponent: function() {
        this.recordProxy = Tine.Billing.sepaMandateBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.columns = this.getColumns();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);        
        
        Tine.Billing.SepaMandateGridPanel.superclass.initComponent.call(this);
       
        
    },
    initFilterToolbar: function() {
		var quickFilter = [new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()];	
		this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            app: this.app,
            filterModels: Tine.Billing.Model.SepaMandate.getFilterModel(),
            defaultFilter: 'query',
            filters: [{field:'query',operator:'contains',value:''}],
            plugins: quickFilter
        });
    },  
    checkIban: function (currentRecord, iban){
    	this.currentRecord = currentRecord;
    	Ext.Ajax.request({
            scope: this,
            success: this.onCheckIBANSuccess,
            params: {
                method: 'Billing.improveIBAN',
                iban:  iban
            },
            failure: this.onCheckIbanFailure
        });
    },
    
    onCheckIBANSuccess: function(response){
    	var result = Ext.util.JSON.decode(response.responseText);
		console.log(result);
		if(result.state=='success'){
			if(this.currentRecord){
				this.recordProxy.saveRecord(this.currentRecord, {
		             scope: this,
		             success: function(updatedRecord) {
		                 //this.grid.getStore().commitChanges();
		                 // update record in store to prevent concurrency problems
		            	 this.currentRecord.data = updatedRecord.data;
		                 
		                 // reloading the store feels like oldschool 1.x
		                 // maybe we should reload if the sort critera changed, 
		                 // but even this might be confusing
		                 //store.load({});
		             }
		         });
			}
		}else{
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: 'Die eingegebene IBAN ist nicht korrekt.',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.ERROR
	        });
		}
    },
    
    onCheckIbanFailure: function(response){
    	Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die IBAN-Prüfung konnte nicht durchgeführt werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    },
    onAfterEdit: function(e){
    	// !! take care: every change within the record causes a record.commit in the background
    	// means the changes get stored multiply!! Don't flatten the original record, as this means changes too!
    	console.log(e);
    	switch(e.field){
    	case 'iban':
    		e.cancel = true;
    		e.stop = true;
    		this.checkIban(e.record, e.value);
    		return false;
    		break;
    	}
    	
    	return true;
    },
	getColumns: function() {
		return [
		   { header: this.app.i18n._('SEPA-Mandat-ID'), dataIndex: 'mandate_ident', sortable:true },
		   { header: this.app.i18n._('Bearbeitungsstatus'), dataIndex: 'mandate_state', sortable:true,
			   renderer: Tine.Billing.renderer.sepaMandateStateRenderer,
			   editor:{
					xtype: 'combo',
					store:[['GENERATED','zu bestätigen'], ['COMMUNICATION','in Bearbeitung'], ['CONFIRMED','bestätigt']],
					value: 'GENERATED',
					mode: 'local',
					displayField: 'name',
				    valueField: 'id',
				    triggerAction: 'all',
				    width:150
				}},
		   
		   { header: this.app.i18n._('IBAN'), dataIndex: 'iban', sortable:true,
			   renderer: Tine.Billing.renderer.ibanRenderer,
			   editor: {
				   xtype:'textfield'
			   }},
		   { header: this.app.i18n._('Kontakt'), dataIndex: 'contact_id',renderer:Tine.Membership.renderer.contactRenderer, sortable:true  },
		   { header: this.app.i18n._('Bankkonto'), dataIndex: 'bank_account_id',renderer:Tine.Billing.renderer.bankAccountRenderer, sortable:true  },
		   { header: this.app.i18n._('Kto-Inhaber'), dataIndex: 'account_name',sortable:true, 
			   editor: {
				   xtype:'textfield'
		   }},
		   
		   { header: this.app.i18n._('SEPA-Kreditor'), dataIndex: 'sepa_creditor_id',renderer:Tine.Billing.renderer.sepaCreditorRenderer, sortable:true  },

		   { header: this.app.i18n._('Datum Unterschrift'), renderer:Tine.Tinebase.common.dateRenderer, dataIndex: 'signature_date', sortable:true,
			   editor: {
				   xtype:'datefield',
				   enableKeyEvents:true,
				   hideTrigger:true,
				   triggerAction: 'all'
			   }},
		   { header: this.app.i18n._('zuletzt ben.am'), dataIndex: 'last_usage_date', renderer:Tine.Tinebase.common.dateTimeRenderer, sortable:true },
		   { header: this.app.i18n._('einmalig'), dataIndex: 'is_single', sortable:true },
		   { header: this.app.i18n._('letztmalig'), dataIndex: 'is_last', sortable:true },
		   { header: this.app.i18n._('gültig'), dataIndex: 'is_valid', sortable:true },
			   
		   { header: this.app.i18n._('BIC'), dataIndex: 'bic', sortable:true },
		   { header: this.app.i18n._('BLZ'), dataIndex: 'bank_code', style:'text-align:right;', sortable:true, width:80 },
		   { header: this.app.i18n._('Bank'), width:100, dataIndex: 'bank_name', sortable:true },
		   { header: this.app.i18n._('Bank-Land'), dataIndex: 'bank_country_code', sortable:true },
		   { header: this.app.i18n._('Bank-PLZ'), dataIndex: 'bank_postal_code', sortable:true },
		   { header: this.app.i18n._('Bank-Ort'), dataIndex: 'bank_location', sortable:true }
		  
		  
	    ];
	}

});