Ext.namespace('Tine.Billing');

Tine.Billing.CompoundWorkPanel = Ext.extend(Ext.Panel, {
	stateId: 'erp-compound-work-panel-state',
	stateFull:true,
	windowNamePrefix: '-Verbund-',
	bodyStyle:'padding:5px',
	id:'compound-vbox-panel',
	layout: 'border',
    border: false,
    cls: 'tw-editdialog',
    anchor:'99% 99%',
    margins:            '5 5 5 5',
    deferredRender: false,
    buttonAlign: null,
    bufferResize: 500,
    externalRecord: null,
	
	clearOthers: function(grid){
		if(grid != this.openItemGrid){
			this.setOpenItem(null);
		}
		if(grid != this.donationGrid){
			this.setDonation(null);
		}
		if(grid != this.debitorAccountGrid){
			this.setDebitorAccount(null);
		}
		if(grid != this.paymentGrid){
			this.setPayment(null);
		}
		if(grid != this.bookingGrid){
			this.setBooking(null);
		}
		this.gridsCollection.each(function(item){
			if(item!=this){
				item.clearAll();
			}
		},grid);
	},
	clearAll: function(){
		
		//this.donationGrid.clearStore();
		this.donationGrid.unsetAllForeignFilters();
		this.donationGrid.refresh();
		
		//this.openItemGrid.clearAll();
		this.openItemGrid.unsetAllForeignFilters();
		this.openItemGrid.refresh();
		
		//this.debitorAccountGrid.clearAll();
		this.debitorAccountGrid.unsetAllForeignFilters();
		this.debitorAccountGrid.refresh();
		
		//this.paymentGrid.clearAll();
		this.paymentGrid.unsetAllForeignFilters();
		this.paymentGrid.refresh();
		
		//this.bookingGrid.clearAll();
		this.bookingGrid.unsetAllForeignFilters();
		this.bookingGrid.refresh();
		/*this.gridsCollection.each(function(item){
			item.clearStore();
		},this);*/
	},
	onChangeDebitor: function(debitorRecord){
		if(debitorRecord.data){
			this.setDebitor(debitorRecord);
		}else{
			this.setDebitor(debitorRecord.selectedRecord);
		}
		this.filterByDebitor();
	},
	detectDebitor: function(record){
		var debitor;
		try{
			debitor = record.getForeignRecord(Tine.Billing.Model.Debitor,'debitor_id');
		}catch(e){
			debitor = null;
		}
		this.setDebitor(debitor);
		
	},
	setDebitor: function(debitor){
		this.debitor = debitor;
	},
	getDebitor: function(){
		return this.debitor;
	},
	filterByDebitor: function(grid){
		if(this.getDebitor()){
			var debitorId = this.getDebitor().get('id');
			var contactId = this.getDebitor().getForeignId('contact_id');
			
			if(grid != this.donationGrid){
				this.donationGrid.setFiltersForeignId(
					[{field:'contact_id', value:contactId}]	
				);
				this.donationGrid.refresh();
			}
			
			if(grid != this.openItemGrid){
				this.openItemGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.openItemGrid.refresh();
			}
			
			if(grid != this.debitorAccountGrid){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.debitorAccountGrid.refresh();
			}
			
			if(grid != this.paymentGrid){
				this.paymentGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.paymentGrid.refresh();
			}
			
			if(grid != this.bookingGrid){
				this.bookingGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.bookingGrid.refresh();
			}
			
			
		}
		
	},
	initComponent: function(){
		this.addEvents(
			'selectdonation',
			'selectopenitem',
			'selectdebitoraccount',
			'selectpayment',
			'selectbooking'
		);
		this.initActions();
		this.initGrids();
		this.initToolbar();
		this.items = this.getItems();
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.CompoundWorkPanel.superclass.initComponent.call(this);
		
	},
	viewAll: function(){
		this.clearAll();
	},
	viewCustomer: function(){
		this.filterByDebitor();
	},
	onAfterRender: function(){
		this.initializeView();
	},
	initializeView: function(){
		if(!this.rendered){
			this.initializeView.defer(250,this);
			return;
		}
		
		if(this.externalRecord){
			this.detectDebitor(this.externalRecord);
		}
		
		if(this.getDebitor()){
			this.filterByDebitor();
		}
		
	},
	initToolbar: function(){
		this.debitorSelector = Tine.Billing.Custom.getDebitorRecordPicker('compound_working_payment_debitor_id',
	    	{
			    fieldLabel: 'Debitor',
			    name:'debitor_id',
			    width: 350,
			    ddConfig:{
			    	ddGroup: 'ddGroupDebitor'
			    }
		});
		
		this.debitorSelector.on('select', this.onChangeDebitor, this);
		
		
		this.tbar = new Ext.Toolbar();
		this.tbar.add('Kunde wählen:');
		this.tbar.add(this.debitorSelector);
		this.tbar.add(this.action_viewCustomer );
		this.tbar.add(this.action_viewAll );
		
	},
	initActions: function(){
		
		this.action_viewCustomer = new Ext.Action({
            text: 'Kunde anzeigen',
            handler: this.viewCustomer,
            //disabled: true,
            scope: this
        });
		
		this.action_viewAll = new Ext.Action({
            text: 'Alle anzeigen',
            handler: this.viewAll,
            //disabled: true,
            scope: this
        });
	},
	initGrids: function(){
		
		this.openItemGrid = new Tine.Billing.OpenItemGridPanel({
			stateId: 'open-item-grid-compound',
			stateFull:true,
			title:'OPs',
			layout:'border',
			region:'west',
			perspective:'COMPOUND',
			width:600,
			height:300,
			split:true,
			useImplicitForeignRecordFilter: true,
			withDebitor: false,
			//frame: true,
			inDialog:true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing'),
			initFilterToolbar: function() {
		    	this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
		            app: this.app,
		            filterModels: Tine.Billing.Model.OpenItem.getFilterModel(true),
		            defaultFilter: 'query',
		            filters: [{field:'query',operator:'contains',value:''}],
		            plugins: []
		        });
		    }
		});
		
		this.donationGrid = new Tine.Donator.DonationGridPanel({
			stateId: 'donation-grid-compound',
			stateFull:true,
			
			title:'Spenden',
			region:'center',
			layout:'border',
			withDebitor:false,
			height:300,
			flex:1,		
			useImplicitForeignRecordFilter: true,
			inDialog:true,
			frame: true,
			detailsPanelCollapsedOnInit:true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Donator')
		});
		
		this.debitorAccountGrid = new Tine.Billing.DebitorAccountGridPanel({
			stateId: 'debitor-account-grid-compound',
			stateFull:true,
			
			title:'Kundenkonto',
			height:300,
			layout:'border',
			 margins:            '5 5 5 5',
			region:'center',
			useImplicitForeignRecordFilter: true,
			withDebitor: false,
			frame: true,
			doInitialLoad: false,
			detailsPanelCollapsedOnInit:true,
			app: Tine.Tinebase.appMgr.get('Billing'),
			initFilterToolbar: function() {
		    	this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
		            app: this.app,
		            filterModels: Tine.Billing.Model.DebitorAccount.getFilterModel(true),
		            defaultFilter: 'query',
		            filters: [{field:'query',operator:'contains',value:''}],
		            plugins: []
		        });
		    }
		});
		this.paymentGrid = new Tine.Billing.PaymentGridPanel({
			stateId: 'payment-grid-compound',
			stateFull:true,
			title:'Zahlungen',
			layout:'border',
			region:'west',
			split:true,
			withDebitor:false,
			width:600,
			useImplicitForeignRecordFilter: true,
			inDialog:true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing'),
			initFilterToolbar: function() {
		    	this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
		            app: this.app,
		            filterModels: Tine.Billing.Model.Payment.getFilterModel(true),
		            defaultFilter: 'query',
		            filters: [{field:'query',operator:'contains',value:''}],
		            plugins: []
		        });
		    }
		});
		this.bookingGrid = new Tine.Billing.AccountBookingGridPanel({
			stateId: 'account-booking-grid-compound',
			stateFull:true,
			title:'FIBU-Buchungen',
			layout:'border',
			region:'center',
			useImplicitForeignRecordFilter: true,
			inDialog:true,
			withDebitor:false,
			frame: true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing'),
			initFilterToolbar: function() {
		    	this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
		            app: this.app,
		            filterModels: Tine.Billing.Model.AccountBooking.getFilterModel(true),
		            defaultFilter: 'value',
		            filters: [{field:'value',operator:'greater',value:'0'}],
		            plugins: []
		        });
		    }
		});
		
		this.gridsCollection = new Ext.util.MixedCollection();
		this.gridsCollection.add(this.openItemGrid);
		this.gridsCollection.add(this.donationGrid);
		this.gridsCollection.add(this.debitorAccountGrid);
		this.gridsCollection.add(this.paymentGrid);
		this.gridsCollection.add(this.bookingGrid);
		
	},
	
	getItems: function(){
	  return [
		  {
			  xtype:'panel',
			  region:'north',
			  layout:'border',
			  margins:            '5 5 5 5',
			  height:300,
			  collapsible:true,
			  split:true,
			  title:'Sollstellungen',
			  items:[
			         this.openItemGrid,
			         this.donationGrid
			  ]
			  
		  },
		  this.debitorAccountGrid,
		  {
			  xtype:'panel',
			  region:'south',
			  layout:'border',
			  margins:            '5 5 5 5',
			  collapsible:true,
			  split:true,
			  height:300,
			  title:'Zahlungen/FIBU',
			  items:[
			         this.paymentGrid,
			         this.bookingGrid
			  ]
			  
		  }
	  ];

	}

});

Tine.Billing.CompoundWorkPanel.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.CompoundWorkPanel.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.CompoundWorkPanel',
        contentPanelConstructorConfig: config
    });
    return window;
};