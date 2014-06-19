Ext.namespace('Tine.Billing');

Tine.Billing.ReceiptEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	receiptType: null,
	/**
	 * @priReceipte
	 */
	//windowNamePrefix: 'ReceiptEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.Receipt,
	recordProxy: Tine.Billing.receiptBackend,
	/**
	 * @var order {Tine.Billing.Model.Order}
	 */
	order: null,
	loadRecord: false,
	evalGrants: false,
	frame:true,
	initComponent: function(){
		this.i18n = Tine.Tinebase.appMgr.get('Billing').i18n;
		this._initActions();
		var tbItems = [this.printReceiptButton,this.printReceiptCopyButton, this.printReceiptPreviewButton,new Tine.widgets.activities.ActivitiesAddButton({})];
		tbItems = tbItems.concat(this.getAdditionalActions());
		this.tbarItems = tbItems;
		this.on('load',this.onLoadReceipt, this);
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.ReceiptEditDialog.superclass.initComponent.call(this);
	},
    onAfterRender: function(){
    	if(this.record.id==0){
    		Ext.getCmp('receipt_payment_method_id').selectDefault();
    	}
    },
    getAdditionalActions: function(){
    	return [];
    },
	_initActions: function(){
		this.printOriginal = this.i18n._('Beleg drucken');
		this.printCopy = this.i18n._('Beleg in Kopie drucken');
		this.printText = this.printOriginal;
        this.printReceiptButton = new Ext.Action({
            id: 'printReceiptButton',
            text: this.printText,
            handler: this.printReceipt,
            iconCls: 'action_exportAsPdf',
            disabled: true,
            scope: this
        });
        this.printReceiptCopyButton = new Ext.Action({
            id: 'printReceiptCopyButton',
            text: this.printCopy,
            handler: this.printReceiptCopy,
            iconCls: 'action_exportAsPdf',
            disabled: true,
            scope: this
        });
        this.printReceiptPreviewButton = new Ext.Action({
            id: 'printReceiptPreviewButton',
            text: this.i18n._('PDF Vorschau'),
            handler: this.printReceiptPreview,
            iconCls: 'action_exportAsPdf',
            disabled: false,
            scope: this
        });
	},
    initButtons: function(){
    	Tine.Billing.ReceiptEditDialog.superclass.initButtons.call(this);
        this.fbar = [
             '->',
             this.action_applyChanges,
             this.action_cancel,
             this.action_saveAndClose
        ];
    },	
	printReceiptPreview: function(){
    	this.printReceipt(true);
    },
    printReceiptCopy: function(){
    	this.printReceipt(false,true);
    },
    printReceipt: function(preview,copy){
    	var requestStr = '?method=Billing.printReceipt&id='+this.record.id;
    	if(preview==true){
    		requestStr += '&preview=true';
    	}
    	if(copy==true){
    		requestStr += '&copy=true';
    	}
		window.open(
				Sopen.Config.runtime.requestURI + requestStr,
				"confirmationsPDF",
				"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes"
		);
		if(preview !== true && copy!==true){
			this.initRecord.defer(500,this);
		}
    },
    isReverse: function(){
    	if(this.record){
    		var state = this.record.get('receipt_state');
    		
    		console.log('state');
    		console.log(state);
    		if(state == 'VALID'){
    			return false;
    		}
    		return true;
    	}else{
    		Ext.Msg({
    			title: 'Hinweis', 
	            msg: 'Es ist noch kein Datensatz geladen.',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.INFO
    		});
    		return false;
    	}
    },
	getFormItems: function(specificReceiptFormItems){
		this.activitiesPanel =  new Tine.widgets.activities.ActivitiesTabPanel({
            app: this.app,
            record_id: (this.record) ? this.record.id : '',
            record_model: this.appName + '_Model_' + this.recordClass.getMeta('modelName')
        });
        this.customFieldsPanel = new Tine.Tinebase.widgets.customfields.CustomfieldsPanel({
            recordClass: Tine.Billing.Model.Receipt,
            disabled: (Tine.Billing.registry.get('customfields').length === 0),
            quickHack: {record: this.record}
        });
		if(this.record.get('print_date')){
			this.printText = this.printCopy;
		}
		var positionPanelDisabled = true;
		if(!this.record || this.record.id!=0){
			positionPanelDisabled = false;
		}
		
		if(this.receiptType != 'MONITION'){
			this.OrderPositionPanel = new Tine.Billing.QuickOrderGridPanel({
					title:'Positionen',
					app: this.app,
					perspective:'receipt',
					storeAtOnce: true,
					region:'center',
					layout:'fit'
			});
		}else{
			this.OrderPositionPanel = new Tine.Billing.OpenItemMonitionGridPanel({
				title:'Mahn-OPs',
				inDialog:true,
				layout:'border',
				app: this.app,
				region:'center'
			});
		}
		this.articleSelectionGrid = new Tine.Billing.ArticleSelectionGridPanel({
			title:'Artikel',
			layout:'border',
			app: Tine.Tinebase.appMgr.get('Billing')
		});
		this.previewPanel = new Ext.ux.ImagePanel({
			layout:'fit'
		});
		var OrderPositionsPanels = [this.OrderPositionPanel];
		if(this.receiptType == 'CALCULATION'){
			this.initCalculationVariantGrid();
			this.calcVarStore.reload();
			var costGrid = new Tine.Billing.ProductionCostGridPanel({
				app: Tine.Tinebase.appMgr.get('Billing'),
		        title            : 'Herstell-/Lieferkosten',
		        //autoHeight:true,
		        disabled:true,
		        layout:'fit',
		        region:'center'
			});
			
			var costGridPanel = {
				region:'east',
				xtype:'panel',
				layout:'border',
				split:true,
				items:[
				       costGrid,
				       this.calculationVariantGrid
				]
			};
			
			this.OrderPositionPanel.on('selectposition', costGrid.onUpdateOrderPosition, costGrid);
			this.OrderPositionPanel.on('selectposition', function(){
				this.calculationVariantGrid.store.reload();
			}, this);
			
			OrderPositionsPanels = OrderPositionsPanels.concat([costGridPanel]);
		}
		return[
		       {
		    	   xtype:'tabpanel',
		    	   layoutOnTabChange:true,
		    	   activeTab:0,
		    	   items:[{
			   			xtype:'panel',
						header:false,
						title:'Daten',
						layout:'border',
						border:false,
						items:[{
						    xtype: 'panel',
						    region:'north',
						    border: false,
						    autoScroll:true,
						    height:210,
						    frame:true,
							split:true,
							collapsible:true,
						    items: specificReceiptFormItems
						},{
							xtype:'panel',
							header:false,
							region:'center',
							layout:'border',
							border:false,
							items:[{
								xtype:'panel',
								id:'OrderPositionConainer',
								region:'center',
								header:false,
								layout:'border',
								//defaults:{flex:1},
								split:true,
								items: OrderPositionsPanels
							},{
								xtype:'panel',
								region:'south',
								header:false,
								height: 200,
								layout:'fit',
								collapsible:true,
								collapseMode:'mini',
								split:true,
								items:[
								   this.articleSelectionGrid
								]
							}]
						},{
			                   // activities and tags
			                   region: 'east',
			                   layout: 'accordion',
			                   animate: true,
			                   width: 210,
			                   split: true,
			                   collapsible: true,
			                   collapseMode: 'mini',
			                   header: false,
			                   margins: '0 5 0 5',
			                   border: true,
			                   items: [
			                       new Ext.Panel({
			                           // @todo generalise!
			                           title: this.app.i18n._('Description'),
			                           iconCls: 'descriptionIcon',
			                           layout: 'form',
			                           labelAlign: 'top',
			                           border: false,
			                           items: [{
			                               style: 'margin-top: -4px; border 0px;',
			                               labelSeparator: '',
			                               xtype:'textarea',
			                               name: 'note',
			                               hideLabel: true,
			                               grow: false,
			                               preventScrollbars:false,
			                               anchor:'100% 100%',
			                               emptyText: this.app.i18n._('Enter description'),
			                               requiredGrant: 'editGrant'                           
			                           }]
			                       }),
			                       new Tine.widgets.activities.ActivitiesPanel({
			                           app: 'Billing',
			                           showAddNoteForm: false,
			                           border: false,
			                           bodyStyle: 'border:1px solid #B5B8C8;'
			                       }),
			                       new Tine.widgets.tags.TagPanel({
			                           app: 'Billing',
			                           border: false,
			                           bodyStyle: 'border:1px solid #B5B8C8;'
			                       })
			                   ]
			               }]
					},
					this.activitiesPanel,
				 	this.customFieldsPanel,
					{
							xtype:'panel',
							id:'receiptPreview',
							title: 'Vorschau',
							layout:'fit',
                            border: false,
                			autoScroll:true,
                            items:[
                      	           	this.previewPanel
                      	    ]
		    	    }
		    	   ]
		       }
		  ];
	},
	onLoadReceipt: function(){
		if(this.record.id == 0){
			this.record.data.order_id = new Tine.Billing.Model.Order(this.order.data, this.order.id);
			this.record.data.type = this.receiptType;
		}
		if(this.record.id!=0){
			if(this.record.get('print_date')){
// TODO: implement global impossibility of editing a receipt after print (acl controlled)
//				if(!Tine.Tinebase.common.hasRight('editreceipt_afterprint', 'Billing')){
//					this.setDisabled(true);
//				}
				this.printReceiptButton.disable();
				this.printReceiptCopyButton.enable();
				if(Tine.Tinebase.common.hasRight('reset_receipt', 'Billing')){
					Ext.getCmp('receipt_print_date').enable();
				}
			}else{
				this.printReceiptButton.enable();
				this.printReceiptCopyButton.disable();
			}

			var orderRecord = this.record.getForeignRecord(Tine.Billing.Model.Order, 'order_id');
			var debitorRecord = orderRecord.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
			var contactRecord = debitorRecord.getForeignRecord(Tine.Addressbook.Model.Contact, 'contact_id');
			
			this.OrderPositionPanel.loadDebitorData({
				debitorRecord: debitorRecord,
				contactRecord: contactRecord,
				orderRecord: orderRecord,
				receiptRecord: this.record
			});
			if(this.record.get('fibu_exp_date')){
				this.OrderPositionPanel.disable();
				this.action_applyChanges.disable();
	            this.action_saveAndClose.disable();
				
			}else{
				this.OrderPositionPanel.enable();
				this.previewPanel.setURL(Sopen.Config.runtime.requestURI + '?method=Billing.getReceiptPreview&id='+this.record.id);
			}
		}
		return true;
	},
	initCalculationVariantGrid: function(){
		this.calcVarStore = new Ext.data.JsonStore({
			fields: [
				{name: 'variant'},
				{name: 'ek_total'},
				{name: 'total_netto'},
				{name: 'profit'}
			],
            baseParams: {
                method: 'Billing.getCalculationVariants',
                receiptId: this.record.id
            },
            root: 'results',
            successProperty: 'success',
            totalProperty: 'totalcount',
            idProperty: 'variant',
            remoteSort: false/*,
            loadFromResult: function(response){
            	var result = Ext.util.JSON.decode(response.responseText);
            	Sopen.Config.runtime.stores.VDSTClubMembersStore.loadData(result.result);
            }*/
        });
		
		var cm = new Ext.grid.ColumnModel([
            {header: "Variante", id:'variant',width: 80, sortable: true, dataIndex: 'variant'},
            {header: "EK gesamt netto", width: 120, sortable: true, dataIndex: 'ek_total', renderer: Sopen.Renderer.MonetaryNumFieldRenderer},
            {header: "VK gesamt netto", width: 120, sortable: true, dataIndex: 'total_netto', renderer: Sopen.Renderer.MonetaryNumFieldRenderer},
            {header: "Profit", width: 80, sortable: true, dataIndex: 'profit', renderer: Sopen.Renderer.MonetaryNumFieldRenderer}
        ]);
		
		this.calculationVariantGrid = new Ext.grid.GridPanel({
			split:true,
			loadMask:true,
			region: 'south',
			//layout:'fit',
			autoScroll:true,
			ds: this.calcVarStore,
            cm: cm,
            frame:true,
            viewConfig:{
            	forceFit:true
            },
           sm: new Ext.grid.RowSelectionModel({
        	  
                singleSelect: true,
                listeners: {
                    rowselect: function(sm, row, rec) {
                    }
                }
            }),
            title:'Ergebnis Kalkulation',
            border: true,
            listeners: {
                viewready: function(g) {
                    g.getSelectionModel().selectRow(0);
                }
            }
        });
	}
});

Tine.Billing.CalculationEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'CALCULATION',
	windowNamePrefix: 'CalculationEditWindow_',
	title: 'Kalkulation',
	getFormItems: function(){
		return Tine.Billing.CalculationEditDialog.superclass.getFormItems.call(this,Tine.Billing.getCalculationFormItems());
	}
});

Tine.Billing.BidEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'BID',
	windowNamePrefix: 'BidEditWindow_',
	title:'Angebot',
	getFormItems: function(){
		return Tine.Billing.BidEditDialog.superclass.getFormItems.call(this,Tine.Billing.getBidFormItems());
	}
});

Tine.Billing.ConfirmEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'CONFIRM',
	windowNamePrefix: 'ConfirmEditWindow_',
	title:'Auftragsbestätigung',
	getFormItems: function(){
		return Tine.Billing.ConfirmEditDialog.superclass.getFormItems.call(this,Tine.Billing.getConfirmFormItems());
		
		//return Tine.Billing.getConfirmFormItems();
	}
});

Tine.Billing.ShippingEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'SHIPPING',
	windowNamePrefix: 'ShippingEditWindow_',
	title:'Lieferschein',
	getFormItems: function(){
		return Tine.Billing.ShippingEditDialog.superclass.getFormItems.call(this,Tine.Billing.getShippingFormItems());
	}
});

Tine.Billing.InvoiceEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'INVOICE',
	windowNamePrefix: 'InvoiceEditWindow_',
	title:'Rechnung',
	initComponent: function(){
		this.on('load', this.loadInvoice, this);
		Tine.Billing.InvoiceEditDialog.superclass.initComponent.call(this);
	},
	loadInvoice: function(){
		if(this.record.id!=0 && !this.isReverse()){
			this.actions_reverseAction.enable();
			this.reverseButton.enable();
			this.partReverseButton.enable();
			if(!this.record.get('fibu_exp_date')){
				this.delInvoiceButton.enable();
			}
		}
	},
	askReverseInvoice: function(){
		Ext.MessageBox.show({
            title: 'Frage', 
            msg: 'Möchten Sie die Rechnung tatsächlich stornieren?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.doReverseInvoice,
            icon: Ext.MessageBox.QUESTION
        });
	},
	doReverseInvoice: function(btn, text){
		if(btn!='yes'){
			return;
		}
		this.reverseInvoice(btn, null, true);
	},
	reverseInvoice: function(btn, event, proceed){
		if(proceed){
			this.loadMask.show();
			Ext.Ajax.request({
	            scope: this,
	            success: this.onReverseInvoice,
	            params: {
	                method: 'Billing.reverseInvoice',
	               	receiptId:  this.record.get('id'),
	               	orderPositionIds: []
	            },
	            failure: this.onReverseInvoiceFailed
	        });
		}else{
			this.askReverseInvoice();
		}
	},
	onReverseInvoice: function(response){
		this.reverseInvoiceResponse = response;
		if(this.invertWin){
			this.invertWin.hide();
			this.invertWin = null;
		}
		
		this.loadMask.hide();
		
		Ext.MessageBox.show({
            title: 'Erfolg', 
            msg: 'Die Rechnung wurde erfolgreich storniert.</br>Möchten Sie den Gutschriftsbeleg öffnen?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.showCreditDialog,
            icon: Ext.MessageBox.INFO
        });
	},
	onReverseInvoiceFailed: function(){
		this.loadMask.hide();
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Stornieren der Rechnung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	showCreditDialog: function(btn, text){
		if(btn!='yes'){
			return;
		}
		var result = Ext.util.JSON.decode(this.reverseInvoiceResponse.responseText);
		if(result){
			var record = new Tine.Billing.Model.Receipt(result, result.id);
			Tine.Billing.CreditEditDialog.openWindow({
				record:record
			});
		}
	},
	askPartReverseInvoice: function(){
		Ext.MessageBox.show({
            title: 'Frage', 
            msg: 'Möchten Sie die gewählten Positionen der Rechnung tatsächlich stornieren?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.doPartReverseInvoice,
            icon: Ext.MessageBox.QUESTION
        });
	},
	doPartReverseInvoice: function(btn, text){
		if(btn!='yes'){
			return;
		}
		this.partReverseInvoice(btn, null, true);
	},
	partReverseInvoice: function(btn, event, proceed){
		if(proceed){
			var orderPositionIds = this.OrderPositionPanel.getSelectedIds();
			Ext.Ajax.request({
	            scope: this,
	            success: this.onReverseInvoice,
	            params: {
	                method: 'Billing.reverseInvoice',
	               	receiptId:  this.record.get('id'),
	               	orderPositionData: this.instantOrderPositionsGrid.getFromStoreAsArray()
	            },
	            failure: this.onReverseInvoiceFailed
	        });
		}else{
			this.instantOrderPositionsGrid = new Tine.Billing.InstantOrderPositionsGridPanel({
					title:'Positionen',
					id: 'positions-reverse-grid',
					app: this.app,
					region:'center',
					layout:'fit',
					receiptRecord: this.record,
					tools: [{
        				id: 'gear',
        				handler: function(e, target, panelHeader, tool){
        					Ext.getCmp('positions-reverse-grid').loadPositions();
        				}
        			}]
			});
			
			this.instantOrderPositionsGrid.loadPositions();
			
			var win = new Ext.Window({
				modal:true,
				parentScope:this,
	            title: 'Rechnung teilstornieren: Positionen auswählen ',  
				layout:'fit',
	            width:700,
	            height:400,
	            closeAction:'hide',
	            plain: true,
	            items: [{
	               	xtype:'panel',
	               	layout:'fit',
	               	items:[this.instantOrderPositionsGrid]
	            }],
	            buttons: [{
	                text:'Abbruch',
	                handler: function(){
	                	win.hide();
	                }
	            },{
	                text: 'Positionen stornieren',
	                handler: function(){
	                   	win.parentScope.askPartReverseInvoice();
	                }
	            }]
	        });
	        this.invertWin = win;
	        win.show(this);
			
		}
	},
	doDeleteInvoice: function(btn, text){
		if(btn!='yes'){
			return;
		}
		this.deleteInvoice();
	},
	deleteInvoice: function(){
		this.loadMask.show();
		Ext.Ajax.request({
            scope: this,
            success: this.onDeleteInvoice,
            params: {
                method: 'Billing.deleteReceiptForReverse',
               	receiptId:  this.record.get('id')
            },
            failure: this.onDeleteInvoiceFailed
        });
	},
	onDeleteInvoice: function(response){
		this.loadMask.hide();
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Rechnung ist erfolgreich gelöscht worden.',
            buttons: Ext.Msg.OK,
            scope:this,
            fn: this.closeOnDelete,
            icon: Ext.MessageBox.INFO
        });
	},
	closeOnDelete: function(){
		this.purgeListeners();
		this.window.close();
	},
	onDeleteInvoiceFailed: function(){
		this.loadMask.hide();
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Das Löschen der Rechnung ist fehlgeschlagen.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	askRenewFibu: function(){
		Ext.MessageBox.show({
            title: 'Frage', 
            msg: 'Möchten Sie die Fibu-Buchung tatsächlich durchführen/erneuern?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.doRenewFibu,
            icon: Ext.MessageBox.QUESTION
        });
	},
	doRenewFibu: function(btn, text){
		if(btn!='yes'){
			return;
		}
		this.renewFibu();
	},
	renewFibu: function(){
		this.loadMask.show();
		Ext.Ajax.request({
            scope: this,
            success: this.onRenewFibu,
            params: {
                method: 'Billing.renewBookingForBillableReceipt',
               	receiptId:  this.record.get('id')
            },
            failure: this.onRenewFibuFailed
        });
	},
	onRenewFibu: function(response){
		this.loadMask.hide();
		
		var result = Ext.util.JSON.decode(response.responseText);
		
		var state = result.state;
		if(state == 'success'){
			Ext.MessageBox.show({
	            title: 'Erfolg', 
	            msg: 'Die Buchung ist erneuert worden.',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.INFO
	        });
			
			var booking = new Tine.Billing.Model.Booking({id:result.result.bookingId}, result.result.bookingId);
			
			Tine.Billing.BookingEditDialog.openWindow({
				record:booking
			});
			
		}else{
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: result.userMessage,
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.ERROR
	        });
		}
		
		
		
	},
	onRenewFibuFailed: function(){
		this.loadMask.hide();
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Buchung konnte nicht angelegt/erneuert werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	getAdditionalActions: function(){
		 	this.reverseButton = new Ext.Action({
	            id: 'reverseButton',
	            text: 'Rechnung komplett stornieren',
	            handler: this.reverseInvoice,
	            disabled: true,
	            scope: this
	        });
			 
		 	this.partReverseButton = new Ext.Action({
	            id: 'partReverseButton',
	            text: 'Rechnung teilstornieren',
	            handler: this.partReverseInvoice,
	            disabled: true,
	            scope: this
	        });
		 	
			this.delInvoiceButton = new Ext.Action({
	            id: 'delInvoiceButton',
	            text: 'Rechnung löschen',
	            handler: this.doDeleteInvoice,
	            disabled: true,
	            scope: this
	        });
			 
	        this.actions_reverseAction = new Ext.Action({
	        	id: 'reverseActionButton',
	         	allowMultiple: false,
	         	disabled:true,
	         	text: 'Storno',
	            menu:{
	             	items:[
	             	       this.reverseButton,
	             	       this.partReverseButton,
	 					   this.delInvoiceButton
	             	]
	             }
	         });
	        
	        this.actions_renewFibu = new Ext.Action({
	            id: 'renewFibuButton',
	            text: 'FIBU: Sollstellung erzeugen/erneuern',
	            handler: this.askRenewFibu,
	            disabled: false,
	            scope: this
	        });
	        
		return [this.actions_reverseAction, this.actions_renewFibu];
	},
	getFormItems: function(){
		return Tine.Billing.InvoiceEditDialog.superclass.getFormItems.call(this,Tine.Billing.getInvoiceFormItems());
	}
});

Tine.Billing.CreditEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'CREDIT',
	windowNamePrefix: 'CreditEditWindow_',
	title:'Gutschrift',
	initComponent: function(){
		//this.on('load', this.loadInvoice, this);
		Tine.Billing.CreditEditDialog.superclass.initComponent.call(this);
	},
	askRenewFibu: function(){
		Ext.MessageBox.show({
            title: 'Frage', 
            msg: 'Möchten Sie die Fibu-Buchung tatsächlich durchführen/erneuern?',
            buttons: Ext.Msg.YESNO,
            scope:this,
            fn: this.doRenewFibu,
            icon: Ext.MessageBox.QUESTION
        });
	},
	doRenewFibu: function(btn, text){
		if(btn!='yes'){
			return;
		}
		this.renewFibu();
	},
	renewFibu: function(){
		this.loadMask.show();
		Ext.Ajax.request({
            scope: this,
            success: this.onRenewFibu,
            params: {
                method: 'Billing.renewBookingForBillableReceipt',
               	receiptId:  this.record.get('id')
            },
            failure: this.onRenewFibuFailed
        });
	},
	onRenewFibu: function(response){
		this.loadMask.hide();
		
		var result = Ext.util.JSON.decode(response.responseText);
		
		var state = result.state;
		if(state == 'success'){
			Ext.MessageBox.show({
	            title: 'Erfolg', 
	            msg: 'Die Buchung ist erneuert worden.',
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.INFO
	        });
			
			var booking = new Tine.Billing.Model.Booking({id:result.result.bookingId}, result.result.bookingId);
			
			Tine.Billing.BookingEditDialog.openWindow({
				record:booking
			});
			
		}else{
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: result.userMessage,
	            buttons: Ext.Msg.OK,
	            icon: Ext.MessageBox.ERROR
	        });
		}
	},
	onRenewFibuFailed: function(){
		this.loadMask.hide();
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Buchung konnte nicht angelegt/erneuert werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	},
	getAdditionalActions: function(){
		// @todo: make available -> cancellation of credit action
		/* 	this.reverseButton = new Ext.Action({
	            id: 'reverseButton',
	            text: 'Rechnung komplett stornieren',
	            handler: this.reverseInvoice,
	            disabled: true,
	            scope: this
	        });
			 
		 	this.partReverseButton = new Ext.Action({
	            id: 'partReverseButton',
	            text: 'Rechnung teilstornieren',
	            handler: this.partReverseInvoice,
	            disabled: true,
	            scope: this
	        });
		 	
			this.delInvoiceButton = new Ext.Action({
	            id: 'delInvoiceButton',
	            text: 'Rechnung löschen',
	            handler: this.doDeleteInvoice,
	            disabled: true,
	            scope: this
	        });
			 
	        this.actions_reverseAction = new Ext.Action({
	        	id: 'reverseActionButton',
	         	allowMultiple: false,
	         	disabled:true,
	         	text: 'Storno',
	            menu:{
	             	items:[
	             	       this.reverseButton,
	             	       this.partReverseButton,
	 					   this.delInvoiceButton
	             	]
	             }
	         });*/
	        
	        this.actions_renewFibu = new Ext.Action({
	            id: 'renewFibuCreditButton',
	            text: 'FIBU: Gutschriftbuchung erzeugen/erneuern',
	            handler: this.askRenewFibu,
	            disabled: false,
	            scope: this
	        });
	        
		return [this.actions_renewFibu];
	},
	getFormItems: function(){
		return Tine.Billing.CreditEditDialog.superclass.getFormItems.call(this,Tine.Billing.getCreditFormItems());
	}
});

Tine.Billing.MonitionEditDialog = Ext.extend(Tine.Billing.ReceiptEditDialog, {
	receiptType: 'MONITION',
	windowNamePrefix: 'MonitionEditWindow_',
	title:'Mahnung',
	getFormItems: function(){
		return Tine.Billing.MonitionEditDialog.superclass.getFormItems.call(this,Tine.Billing.getMonitionFormItems());
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.CalculationEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.CalculationEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.CalculationEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.BidEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.BidEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BidEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.ShippingEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.ShippingEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ShippingEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.ConfirmEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.ConfirmEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ConfirmEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.InvoiceEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.InvoiceEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.InvoiceEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.CreditEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.CreditEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.CreditEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.MonitionEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 1024,
        height: 800,
        name: Tine.Billing.MonitionEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.MonitionEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getShippingFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.erp_context_id, fields.order_id
		   	],[
		   	  // 	fields.order_nr,
		   	   	fields.ship_nr
		   	 ],[
		   	   	fields.shipping_date, fields.print_date
		   	],[
			   	fields.template_id,
			   	fields.preview_template_id	
			],[
			   	fields.usage
		   	]]}
		]
	}];
};

Tine.Billing.getCalculationFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.context, fields.order_id
		   	],[
		   	   //	fields.order_nr,
		   	   	fields.calc_nr, fields.print_date
		   	 ],[
		   	   	fields.discount_percentage,
		   	   	fields.discount_total	
		   	],[
			   	fields.template_id,
			   	fields.preview_template_id			   	   	
		   	]]}
		]
	}];
};

Tine.Billing.getBidFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id, fields.context,fields.order_id
		   	],[
		   	   //	fields.order_nr,
		   	   	fields.calc_nr,
		   	   	fields.bid_nr,fields.print_date
		   	 ],[  	
		   	   	fields.discount_percentage,
		   	   	fields.discount_total
		   	 ],[
		   	   	fields.bid_date,
		   	   	fields.bid_shipping_date	
		   	 ],[
		   		fields.payment_conditions	
			 ],[
			  	fields.template_id,
			   	fields.preview_template_id			   		
		   	]]}
		]
	}];
};

Tine.Billing.getConfirmFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.context, fields.order_id
		   	],[
		   	   //	fields.order_nr,
		   	   	fields.calc_nr,
		   	   	fields.bid_nr,
		   	   	fields.confirm_nr,
		   	   	fields.print_date
		   	 ],[  	
		   	   	fields.discount_percentage,
		   	   	fields.discount_total
		   	 ],[
		   	   	fields.confirm_shipping_date,
		   	   	fields.order_in_date,
		   	   	fields.order_confirm_date
		   	 ],[
		   		fields.payment_conditions	
		   	],[
			   	fields.template_id,
			   	fields.preview_template_id		   		
		   	]]}
		]
	}];
};

Tine.Billing.getInvoiceFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.invoice_nr, fields.order_id, fields.erp_context_id,
		   	   	fields.calc_nr,
		   	   	fields.bid_nr,
		   	   	fields.confirm_nr
		   	 ],[
		   	    fields.is_cancelled,fields.is_cancellation, fields.fee_group_id
		   	 ],[
		   	    fields.total_netto, fields.total_brutto, fields.open_sum, fields.payed_sum
		   	 ],[
		   	    fields.invoice_date,
		   	    fields.due_date,
		   	    fields.discount_percentage,
		   	   	fields.discount_total,
		   	   	fields.add_percentage
		   	 ],[
		   	   	fields.fibu_exp_date,
		   	   	fields.print_date,
		   	   	fields.receipt_state,
				fields.period
		   	 ],[
		   	    fields.payment_method, fields.payment_state
		   	 ],[
		   		fields.payment_conditions	
	   		],[
		   		fields.template_id
	   		],[
			   	fields.usage
		   	]]}
		]
	}];
};

Tine.Billing.getCreditFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id,fields.credit_nr, fields.erp_context_id, fields.order_id,
				fields.period, fields.fee_group_id
		   	],[
		 	    fields.total_netto, fields.total_brutto, fields.open_sum, fields.payed_sum
		 	],[	  
		   	    fields.print_date, fields.receipt_state, fields.payment_method, fields.payment_state
		   	],[
			   	fields.usage
		   	]]}
		]
	}];
};


Tine.Billing.getMonitionFormItems = function(){
	var fields = Tine.Billing.ReceiptFormFields.get();
	return [{
		xtype:'panel',
		layout:'fit',
		items:[
		   	{xtype:'columnform',border:false,items:[
		   	[
		   	 	fields.id, fields.context,fields.order_id
		   	],[
			   	fields.invoice_nr,
	   	   	    fields.monition_nr,
		   	    fields.monition_level,
		   	    fields.monition_fee
		   	 ],[ 
		   	    fields.print_date
		   	]]}
		]
	}];
};
Ext.ns('Tine.Billing.ReceiptFormFields');

Tine.Billing.ReceiptFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		erp_context_id: 
		{
			xtype: 'combo',
			id:'erp_context_id',
			name:'erp_context_id',
			fieldLabel: 'Kontext',
			store:[['ERP','ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']],
		    value: 'ERP',
			mode: 'local',
			displayField: 'name',
		    valueField: 'id',
		    triggerAction: 'all',
		    width:150
		},
		order_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Auftrag',
			    id:'receipt_order_id',
			    name:'order_id',
			    //disabled: true,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Order,
			    allowBlank:false
			}),
		// mandator_id:
			//{xtype: 'hidden',id:'receipt_mandator_id',name:'mandator_id'},
		receipt_type:	
			{xtype: 'hidden',id:'receipt_type',name:'type'}, //(enum: calc, part_ship, ship, bid, confirm, part_invoice, invoice)
		order_nr:
		{
			fieldLabel: 'Auftrags-Nr',
		    id:'receipt_order_nr',
		    name:'order_nr',
		    disabled:true,
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
		},
		calc_nr:
		{
	    	fieldLabel: 'Kalkulations-Nr', 
		    id:'receipt_calc_nr',
		    name:'calc_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	bid_nr:
		{
	    	fieldLabel: 'Angebots-Nr', 
		    id:'receipt_bid_nr',
		    name:'bid_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	confirm_nr:
		{
	    	fieldLabel: 'AB-Nr', 
		    id:'receipt_confirm_nr',
		    name:'confirm_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
		period:
		{
			fieldLabel: 'Periode',
		    id:'receipt_period',
		    name:'period',
		    //disabled:true,
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
		},
	 	part_ship_nr:
		{
	    	fieldLabel: 'Teillieferungs-Nr', 
		    id:'receipt_part_ship_nr',
		    name:'part_ship_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	ship_nr:
		{
	    	fieldLabel: 'Lieferschein-Nr', 
		    id:'receipt_ship_nr',
		    name:'ship_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	part_invoice_nr:
		{
	    	fieldLabel: 'Teilrechnungs-Nr',
		    id:'receipt_part_invoice_nr',
		    name:'part_invoice_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	invoice_nr:
		{
	    	fieldLabel: 'Rechnungs-Nr', 
		    id:'receipt_invoice_nr',
		    name:'invoice_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	credit_nr:
		{
	    	fieldLabel: 'Gutschrift-Nr', 
		    id:'receipt_credit_nr',
		    name:'credit_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	monition_nr:
		{
	    	fieldLabel: 'Mahnungs-Nr', 
		    id:'receipt_monition_nr',
		    name:'monition_nr',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:120
	 	},
	 	discount_percentage:
		{
	 		xtype: 'extuxpercentcombo',
	    	fieldLabel: 'Rabatt auf Gesamtsumme %', 
		    id:'receipt_discount_percentage',
		    name:'discount_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	discount_total:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Rabatt auf Gesamtsumme', 
		    id:'receipt_discount_total',
		    name:'discount_total',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		bid_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Angebot', 
			id:'receipt_bid_date',
			name:'bid_date',
		    width: 150
		},
		bid_shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum Angebot', 
			id:'receipt_bid_shipping_date',
			name:'bid_shipping_date',
		    width: 150
		},		
		confirm_shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum AB', 
			id:'receipt_confirm_shipping_date',
			name:'confirm_shipping_date',
		    width: 150
		},
		order_in_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Auftragseingang', 
			id:'receipt_order_in_date',
			name:'order_in_date',
		    width: 150
		},	
		order_confirm_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Auftragsbestätigung', 
			id:'receipt_order_confirm_date',
			name:'order_confirm_date',
		    width: 150
		},
		shipping_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Lieferdatum', 
			id:'receipt_shipping_date',
			name:'shipping_date',
		    width: 150
		},
		invoice_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Rechnungsdatum', 
			id:'receipt_invoice_date',
			name:'invoice_date',
		    width: 150
		},
		fibu_exp_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Übergabe Fibu', 
			id:'receipt_fibu_exp_date',
			disabled:true,
			name:'fibu_exp_date',
		    width: 150
		},	
		due_date:
		{
		   	xtype: 'datefield',
			disabledClass: 'x-item-disabled-view',
			fieldLabel: 'Datum Fälligkeit', 
			id:'receipt_due_date',
			name:'due_date',
		    width: 150
		},
		upper_textblock:
		{
			xtype: 'textarea',
			fieldLabel: 'Textbaustein oben',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_upper_textblock',
			name:'upper_textblock',
			width: 320,
			height: 60
		},		
		comment:
		{
			xtype: 'textarea',
			fieldLabel: 'Textbaustein unten',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_lower_textblock',
			name:'lower_textblock',
			width: 320,
			height: 60
		},		
		shipping_conditions:
		{
			xtype: 'textarea',
			fieldLabel: 'Lieferbedingungen (abweichend)',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_shipping_conditions',
			name:'shipping_conditions',
			width: 320,
			height: 60
		},		
		payment_conditions:
		{
			xtype: 'textarea',
			fieldLabel: 'Zahlungsbedingungen (abweichend)',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_payment_conditions',
			name:'payment_conditions',
			width: 320,
			height: 60
		},
		template_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
			    fieldLabel: 'Druckvorlage Beleg',
			    id: 'template_id',
			    name: 'template_id',
			    blurOnSelect: true,
			    allowBlank:true,
			    recordClass: Tine.DocManager.Model.Template,
			    width: 450
			}),
		preview_template_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
			    fieldLabel: 'Vorlage Druckvorschau Beleg',
			    id: 'preview_template_id',
			    name: 'preview_template_id',
			    blurOnSelect: true,
			    allowBlank:true,
			    recordClass: Tine.DocManager.Model.Template,
			    width: 450
			}),
		monition_level:		    
		    {
			    fieldLabel: 'Mahnstufe',
			    disabledClass: 'x-item-disabled-view',
			    id:'receipt_monition_level',
			    name:'monition_level',
			    width: 200,
			    xtype:'combo',
			   // disabled: true,
			    //hidden: true,			    
			    store:[['1','1'],['2','2'],['3','3']],
			    value: '1',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		monition_fee:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Mahngebühr', 
			    id:'receipt_monition_fee',
			    name:'monition_fee',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:100
		 	},		
		print_date:
			{
			   	xtype: 'extuxclearabledatefield',
				disabledClass: 'x-item-disabled-view',
				fieldLabel: 'Datum Belegdruck', 
				disabled: true,
				id:'receipt_print_date',
				name:'print_date',
			    width: 150
			},
		payment_method:
			Tine.Billing.Custom.getRecordPicker('PaymentMethod', 'receipt_payment_method_id',
			{
			    fieldLabel: 'Zahlungsart',
			    name:'payment_method_id',
			    columnwidth: 100
			}),
		payment_state:		    
		    {
			    fieldLabel: 'Zahlungsstatus',
			    disabledClass: 'x-item-disabled-view',
			    id:'receipt_payment_state',
			    name:'payment_state',
			    width: 200,
			    xtype:'combo',
			    store:[['TOBEPAYED','unbezahlt'],['PARTLYPAYED','teilbezahlt'],['PAYED','bezahlt']],
			    value: 'TOBEPAYED',
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		// Belegstatus:
			/*
			  <value>VALID</value>
                    <value>REVERTED</value>
					<value>PARTLYREVERTED</value>
					<value>ISREVERSION</value>
					<value>ISPARTREVERSION</value>
			 */
		receipt_state:		    
		    {
			    fieldLabel: 'Belegstatus',
			    disabledClass: 'x-item-disabled-view',
			    id:'receipt_receipt_state',
			    name:'receipt_state',
			    width: 200,
			    xtype:'combo',
			    store:[['VALID','gültig'],['REVERTED','storniert'],['PARTLYREVERTED','teilstorniert'],['ISREVERSION','ist Storno'],['ISPARTREVERSION','ist Teilstorno']],
			    value: 'VALID',
			    disabled:true,
				mode: 'local',
				displayField: 'name',
			    valueField: 'id',
			    triggerAction: 'all'
			},
		add_percentage:
			{
		 		xtype: 'extuxpercentcombo',
		    	fieldLabel: 'Satz Zuschlag %', 
			    id:'receipt_add_percentage',
			    name:'add_percentage',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		 	    width:180
		 	},
		usage:
			{
				xtype: 'textarea',
				fieldLabel: 'Verwendungszweck',
				disabledClass: 'x-item-disabled-view',
				id:'receipt_usage',
				name:'usage',
				width: 320,
				height: 60
			},
		total_netto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Gesamt netto', 
			    id:'receipt_total_netto',
			    name:'total_netto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		total_brutto:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Gesamt brutto', 
			    id:'receipt_total_brutto',
			    name:'total_brutto',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		open_sum:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Betrag offen', 
			    id:'receipt_open_sum',
			    name:'open_sum',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 payed_sum:
			{
		 		xtype: 'sopencurrencyfield',
		    	fieldLabel: 'Betrag bezahlt', 
			    id:'receipt_payed_sum',
			    name:'payed_sum',
		    	disabledClass: 'x-item-disabled-view',
		    	blurOnSelect: true,
		    	disabled:false,
				width:180
		 	},
		 	is_cancelled: {
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'receipt_is_cancelled',
				name: 'is_cancelled',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'storniert',
			    width: 200
			},
		is_cancellation: {
				xtype: 'checkbox',
				disabledClass: 'x-item-disabled-view',
				id: 'receipt_is_cancellation',
				name: 'is_cancellation',
				hideLabel:true,
				disabled:false,
			    boxLabel: 'ist Storno',
			    width: 200
			},
		fee_group_id:
			Tine.Membership.Custom.getRecordPicker('FeeGroup','membership_fee_group_id',{
				//disabledClass: 'x-item-disabled-view',
				width: 220,
				fieldLabel: 'Beitragsgruppe',
				name:'fee_group_id',
				onAddEditable: true,
				onEditEditable: false,
				blurOnSelect: true,
				allowBlank:true
			})
	};
};