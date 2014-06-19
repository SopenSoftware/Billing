Ext.namespace('Tine.Billing');

Tine.Billing.CompoundWorkPanel = Ext.extend(Ext.Panel, {
	windowNamePrefix: '-Verbund-',
	bodyStyle:'padding:5px',
    layout: 'fit',
    border: false,
    cls: 'tw-editdialog',
    anchor:'100% 100%',
    deferredRender: false,
    buttonAlign: null,
    bufferResize: 500,
    autoDestroy:true,
	
    setOpenItem: function(record){
		this.openItem = record;
	},
	getOpenItem : function(){
		return this.openItem;
	},
	setDebitorAccount: function(record){
		this.debitorAccount = record;
	},
	getDebitorAccount : function(){
		return this.debitorAccount;
	},
	setDonation: function(record){
		this.donation = record;
	},
	getDonation : function(){
		return this.donation;
	},
	setPayment: function(record){
		this.payment = record;
	},
	getPayment : function(){
		return this.payment ;
	},
	setBooking: function(record){
		this.booking = record;
	},
	getBooking : function(){
		return this.booking ;
	},
	initViewOpenItem: function(){
		if(this.getOpenItem()){
			this.openItemGrid.setFiltersId(
				[{field:'id', value:this.getOpenItem().get('id')}]	
			);
			this.openItemGrid.refresh();
			
			this.viewOpenItem(this.getOpenItem());
		}
	},
	viewOpenItem: function(){
		// get receipt id and filter the other panels
		var record;
		if(record || (record = this.openItemGrid.getSelectedRecord()) || (record = this.getOpenItem())){
			this.setOpenItem(record);
			
			var receiptId = this.getOpenItem().getForeignId('receipt_id');
			var paymentId = this.getOpenItem().getForeignId('payment_id');
			var donationId = this.getOpenItem().getForeignId('donation_id');
			var bookingId = this.getOpenItem().getForeignId('booking_id');
			
			var debitor = this.detectDebitor(this.getOpenItem());
			var debitorId = debitor.get('id');
			var contactId = debitor.getForeignId('contact_id');
			
			
			if(donationId){
				this.donationGrid.setFiltersId(
					[{field:'id', value:donationId}]	
				);
				this.donationGrid.refresh();
			}else{
				var contactId = debitor.getForeignId('contact_id');
				this.donationGrid.setFiltersId(
						[{field:'contact_id', value:contactId}]	
					);
					this.donationGrid.refresh();
			}
			
			if(paymentId){
				this.paymentGrid.setFiltersId(
					[{field:'id', value:paymentId}]	
				);
				this.paymentGrid.refresh();
			}else if(debitorId){
				this.paymentGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.paymentGrid.refresh();
			}
			
			if(donationId){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'donation_id', value:paymentId}]	
				);
				this.debitorAccountGrid.refresh();
			}else if(debitorId){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.debitorAccountGrid.refresh();
			}
			
			if(bookingId){
				this.bookingGrid.setFiltersId(
					[{field:'id', value:bookingId}]	
				);
				this.bookingGrid.refresh();
			}else if(debitorId){
				this.bookingGrid.clearAll();
				this.bookingGrid.setFiltersId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.bookingGrid.refresh();
			}
	
		}
		
	},
	initViewDonation: function(){
		if(this.getDonation()){
			this.donationGrid.setFiltersId(
				[{field:'id', value:this.getDonation().get('id')}]	
			);
			this.donationGrid.refresh();
			
			this.viewDonation(this.getDonation());
		}
	},
	viewDonation: function(){
		var record;
		if(record || (record = this.donationGrid.getSelectedRecord()) || (record = this.getDonation())){
			this.setDonation(record);
			
			
			//var receiptId = this.getDonation().getForeignId('receipt_id');
			var paymentId = this.getDonation().getForeignId('payment_id');
			var donationId = this.getDonation().get('id');
			var bookingId = this.getDonation().getForeignId('booking_id');
			//var debitorId = this.getOpenItem().getForeignId('debitor_id');
			
			
			if(paymentId){
				this.paymentGrid.setFiltersId(
					[{field:'id', value:paymentId}]	
				);
				this.paymentGrid.refresh();
			}
			
			if(donationId){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'donation_id', value:paymentId}]	
				);
				this.debitorAccountGrid.refresh();
			}
			
			if(bookingId){
				this.bookingGrid.setFiltersId(
					[{field:'id', value:bookingId}]	
				);
				this.bookingGrid.refresh();
			}
		}
	},
	initViewDebitorAccount: function(){
		if(this.getDebitorAccount()){
			this.debitorAccountGrid.setFiltersId(
				[{field:'id', value:this.getDebitorAccount().get('id')}]	
			);
			this.debitorAccountGrid.refresh();
			
			this.viewDebitorAccount(this.getDebitorAccount());
		}
	},
	viewDebitorAccount: function(record){
		
		if(record || (record = this.debitorAccountGrid.getSelectedRecord()) || (record = this.getDebitorAccount())){
			this.setDebitorAccount(record);
			var receiptId = this.getDebitorAccount().getForeignId('receipt_id');
			var paymentId = this.getDebitorAccount().getForeignId('payment_id');
			var donationId = this.getDebitorAccount().getForeignId('donation_id');
			var bookingId = this.getDebitorAccount().getForeignId('booking_id');
			var debitorId = this.getDebitorAccount().getForeignId('debitor_id');
			var debitor = this.getDebitorAccount().getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
			
			if(receiptId){
				this.openItemGrid.setFiltersForeignId(
					[{field:'receipt_id', value:receiptId}]	
				);
				this.openItemGrid.refresh();
			}else if(debitorId){
				this.openItemGrid.clearAll();
				this.openItemGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitor}]	
				);
				this.openItemGrid.refresh();
			}
			
			if(donationId){
				this.donationGrid.setFiltersId(
					[{field:'id', value:donationId}]	
				);
				this.donationGrid.refresh();
			}else{
				var contactId = debitor.getForeignId('contact_id');
				this.donationGrid.setFiltersId(
						[{field:'contact_id', value:contactId}]	
					);
					this.donationGrid.refresh();
			}
			
			if(paymentId){
				this.paymentGrid.setFiltersId(
					[{field:'id', value:paymentId}]	
				);
				this.paymentGrid.refresh();
			}else if(debitorId){
				this.paymentGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.paymentGrid.refresh();
			}
			
			if(bookingId){
				this.bookingGrid.setFiltersId(
					[{field:'id', value:bookingId}]	
				);
				this.bookingGrid.refresh();
			}else if(debitorId){
				this.bookingGrid.clearAll();
				this.bookingGrid.setFiltersId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.bookingGrid.refresh();
			}
			
		}
	},
	initViewPayment: function(){
		if(this.getPayment()){
			this.paymentGrid.setFiltersId(
				[{field:'id', value:this.getPayment().get('id')}]	
			);
			this.paymentGrid.refresh();
			
			this.viewPayment(this.getPayment());
		}
	},
	viewPayment: function(){
		var record;
		if(record = this.paymentGrid.getSelectedRecord()){
			this.setPayment(record);
		}
		
		if(record || (record = this.paymentGrid.getSelectedRecord()) || (record = this.getPayment())){
			this.setPayment(record);
			var receiptId = this.getPayment().getForeignId('receipt_id');
			var paymentId = this.getPayment().get('id');
			var donationId = this.getPayment().getForeignId('donation_id');
			var bookingId = this.getPayment().getForeignId('booking_id');
			
			var debitor = this.detectDebitor(this.getPayment());
			var debitorId = debitor.get('id');
			var contactId = debitor.getForeignId('contact_id');
			
			if(receiptId){
				this.openItemGrid.setFiltersForeignId(
					[{field:'receipt_id', value:receiptId}]	
				);
				this.openItemGrid.refresh();
			}else if(debitorId){
				this.openItemGrid.clearAll();
				this.openItemGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitor}]	
				);
				this.openItemGrid.refresh();
			}
			
			if(donationId){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'donation_id', value:paymentId}]	
				);
				this.debitorAccountGrid.refresh();
			}else if(debitorId){
				this.debitorAccountGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.debitorAccountGrid.refresh();
			}
			
			if(donationId){
				this.donationGrid.setFiltersId(
					[{field:'id', value:donationId}]	
				);
				this.donationGrid.refresh();
			}else{
				var contactId = debitor.getForeignId('contact_id');
				this.donationGrid.setFiltersId(
						[{field:'contact_id', value:contactId}]	
					);
					this.donationGrid.refresh();
			}
			
			if(paymentId){
				this.paymentGrid.setFiltersId(
					[{field:'id', value:paymentId}]	
				);
				this.paymentGrid.refresh();
			}else if(debitorId){
				this.paymentGrid.setFiltersForeignId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.paymentGrid.refresh();
			}
			
			if(bookingId){
				this.bookingGrid.setFiltersId(
					[{field:'id', value:bookingId}]	
				);
				this.bookingGrid.refresh();
			}else if(debitorId){
				this.bookingGrid.clearAll();
				this.bookingGrid.setFiltersId(
					[{field:'debitor_id', value:debitorId}]	
				);
				this.bookingGrid.refresh();
			}
			
		}
	},
	initViewBooking: function(){
		if(this.getBooking()){
			this.bookingGrid.setFiltersId(
				[{field:'id', value:this.getBooking().get('id')}]	
			);
			this.bookingGrid.refresh();
			
			this.viewBooking(this.getBooking());
		}
	},
	viewBooking: function(){
		var record;
		if(record = this.bookingGrid.getSelectedRecord()){
			this.setBooking(record);
		}
	},
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
		this.setOpenItem(null);
		this.setDonation(null);
		this.setDebitorAccount(null);
		this.setPayment(null);
		this.setBooking(null);
		this.gridsCollection.each(function(item){
			item.clearStore();
		},this);
	},
	detectDebitor: function(record){
		this.debitor = null;
		try{
			this.debitor = record.getForeignRecord(Tine.Billing.Model.Debitor,'debitor_id');
		}catch(e){
			this.debitor = null;
		}
		
	},
	getDebitor: function(){
		return this.debitor;
	},
	filterByDebitor: function(grid){
		if(this.getDebitor()){
			var debitorId = this.getDebitor().get('id');
			var contactId = this.getDebitor().getForeignId('contact_id');
			
			if(grid != this.donationGrid){
				this.donationGrid.setFiltersId(
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
				this.bookingGrid.setFiltersId(
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
	onAfterRender: function(){
		this.initializeView();
	},
	initializeView: function(){
		if(!this.rendered){
			this.initializeView.defer(250,this);
			return;
		}
		
		this.initViewDebitorAccount();
		this.initViewOpenItem();
		this.initViewDonation();
		this.initViewPayment();
		this.initViewBooking();
	},
	initToolbar: function(){
		this.tbar = new Ext.Toolbar();
		this.tbar.add(this.actions_view);
		
	},
	initActions: function(){
		this.action_viewOpenItem = new Ext.Action({
            text: 'gewählter OP',
            handler: this.viewOpenItem,
            //disabled: true,
            scope: this
        });
		this.action_viewDonation = new Ext.Action({
            text: 'gewählte Spende',
            handler: this.viewDonation,
            //disabled: true,
            scope: this
        });
		this.action_viewDebitorAccount = new Ext.Action({
            text: 'gewählter Eintrag Kundenkonto',
            handler: this.viewDebitorAccount,
            //disabled: true,
            scope: this
        });
		this.action_viewPayment = new Ext.Action({
            text: 'gewählte Zahlung',
            handler: this.viewPayment,
            //disabled: true,
            scope: this
        });
		this.action_viewBooking = new Ext.Action({
            text: 'gewählte FIBU-Buchung',
            handler: this.viewBooking,
            //disabled: true,
            scope: this
        });
		
		this.actions_view = new Ext.Action({
        	allowMultiple: false,
            text: 'Ansicht',
            menu:{
            	items:[
            	       this.action_viewOpenItem,
					   this.action_viewDonation,
					   this.action_viewDebitorAccount,
					   this.action_viewPayment,
					   this.action_viewBooking
            	]
            }
        });
	},
	initGrids: function(){
		this.openItemGrid = new Tine.Billing.OpenItemGridPanel({
			tools:[{
                id: 'right',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.openItemGrid);
        		    this.viewOpenItem();
        		}
            },{
                id: 'refresh',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	
                	var record;
                	if(record = this.openItemGrid.getSelectedRecord()){
                		this.clearOthers(this.openItemGrid);
                    	this.setOpenItem(null);
            			this.setOpenItem(record);
            			this.detectDebitor(record);
            			this.filterByDebitor();
            		}
        		}
            },{
                id: 'gear',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.openItemGrid);
                	this.setOpenItem(null);
                	this.openItemGrid.unsetFiltersId();
                	this.openItemGrid.unsetFiltersForeignId();
                	this.openItemGrid.clearFilters();
        		}
            }],
			title:'OPs',
			layout:'border',
			region:'west',
			perspective:'COMPOUND',
			height:300,
			flex:1,
			useImplicitForeignRecordFilter: true,
			frame: true,
			inDialog:true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
		this.donationGrid = new Tine.Donator.DonationGridPanel({
			tools:[{
                id: 'right',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.donationGrid);
        		    this.viewDonation();
        		}
            },{
                id: 'gear',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.donationGrid);
                	this.setDonation(null);
                	this.donationGrid.unsetFiltersId();
                	this.donationGrid.unsetFiltersForeignId();
                	this.donationGrid.clearFilters();
        		}
            }],
   		title:'Spenden',
			region:'center',
			layout:'border',
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
			tools:[{
                id: 'right',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.debitorAccountGrid);
        		    this.viewDebitorAccount();
        		}
            },{
                id: 'refresh',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	
                	var record;
                	if(record = this.debitorAccountGrid.getSelectedRecord()){
                		this.clearOthers(this.debitorAccountGrid);
                    	this.setDebitorAccount(null);
            			this.setDebitorAccount(record);
            			this.detectDebitor(record);
            			this.filterByDebitor();
            		}
        		}
            },{
                id: 'gear',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.debitorAccountGrid);
                	this.setDebitorAccount(null);
                	this.debitorAccountGrid.unsetFiltersId();
                	this.debitorAccountGrid.unsetFiltersForeignId();
                	this.debitorAccountGrid.clearFilters();
        		}
            }],
			title:'Kundenkonto',
			height:300,
			layout:'border',
			useImplicitForeignRecordFilter: true,
			frame: true,
			doInitialLoad: false,
			detailsPanelCollapsedOnInit:true,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.paymentGrid = new Tine.Billing.PaymentGridPanel({
			tools:[{
                id: 'right',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.paymentGrid);
        		    this.viewPayment();
        		}
            },{
                id: 'refresh',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	
                	var record;
                	if(record = this.paymentGrid.getSelectedRecord()){
                		this.clearOthers(this.paymentGrid);
                    	this.setPayment(null);
            			this.setPayment(record);
            			this.detectDebitor(record);
            			this.filterByDebitor();
            		}
        		}
            },{
                id: 'gear',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.paymentGrid);
                	this.setPayment(null);
                	this.paymentGrid.unsetFiltersId();
                	this.paymentGrid.unsetFiltersForeignId();
                	this.paymentGrid.clearFilters();
        		}
            }],
			title:'Zahlungen',
			layout:'border',
			height:300,
			 flex:1,
			useImplicitForeignRecordFilter: true,
			inDialog:true,
			frame: true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.bookingGrid = new Tine.Billing.BookingGridPanel({
			tools:[{
                id: 'right',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.bookingGrid);
        		    this.viewBooking();
        		}
            },{
                id: 'gear',
                scope:this,
                handler: function(e, target, panelHeader, tool){
                	this.clearOthers(this.bookingGrid);
                	this.setBooking(null);
                	this.bookingGrid.unsetFiltersId();
                	this.bookingGrid.unsetFiltersForeignId();
                	this.bookingGrid.clearFilters();
        		}
            }],
			title:'FIBU-Buchungen',
			layout:'border',
			height:300,
			 flex:1,
			useImplicitForeignRecordFilter: true,
			inDialog:true,
			frame: true,
			doInitialLoad: false,
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		
		this.gridsCollection = new Ext.util.MixedCollection();
		this.gridsCollection.add(this.openItemGrid);
		this.gridsCollection.add(this.donationGrid);
		this.gridsCollection.add(this.debitorAccountGrid);
		this.gridsCollection.add(this.paymentGrid);
		this.gridsCollection.add(this.bookingGrid);
		
	},
	
	getItems: function(){
		return {
			  xtype:'panel',
			  layout: 'vbox',
			  layoutConfig : {
	            align: 'stretch',
	            pack:'start'
			  },
			  items:[
				  {
					  xtype:'panel',
					  layout:'hbox',
					  flex:1,
					  items:[
					         this.openItemGrid,
					         this.donationGrid
					  ]
					  
				  },{
					  xtype:'panel',
					  layout:'fit',
					  flex:1,
					  items:[
					         this.debitorAccountGrid
					  ]
					  
				  },{
					  xtype:'panel',
					  layout:'hbox',
					  flex:1,
					  items:[
					         this.paymentGrid,
					         this.bookingGrid
					  ]
					  
				  }
			  ]
		  };
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