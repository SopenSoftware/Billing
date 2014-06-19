Ext.ns('Tine.Billing');

Tine.Billing.AddressbookPlugin = Ext.extend(Tine.Tinebase.AppPlugin, {
	pluginName: 'BillingAddressbookPlugin',
	appName: 'Billing',
	referencedAppName: 'Addressbook',
	hasAdditionalActions:true,
	hasAdditionalContextMenuItems:true,
	hasAdditionalToolbarItems:true,
	
	contactEditDialog: null,
	creditorEditDialog: null,
	//debitorEditDialog: null,
	
	initActions: function(scope){
		if(this.checkApp(scope)){
	        
	        scope.actions_openPOS = new Ext.Action({
	            requiredGrant: 'editGrant',
	            allowMultiple: false,
	            text: scope.app.i18n._('Kasse/POS'),
				disabled: false,
	            handler: scope.openPOS,
	            iconCls: 'actionAdd',
	            scope: scope
	        });
			
			scope.actions_createOrderForContact = new Ext.Action({
	            requiredGrant: 'readGrant',
	            text: scope.getApp().i18n._('Neuen Auftrag anlegen'),
	            disabled: false,
	            handler: scope.onCreateOrderForContact,
	            iconCls: 'action_edit',
	            scope: scope,
	            allowMultiple: true
	        });
			
			 scope.actions_addressbookERP = new Ext.Action({
		            text: scope.app.i18n._('ERP'),
		            iconCls: 'BillingIconCls',
		            scale: 'medium',
	             rowspan: 2,
	             iconAlign: 'top',
		            scope: scope,
		            disabled: false,
		            allowMultiple: true,
		            menu: {
		                items: [
		                    scope.actions_createOrderForContact,
		                    scope.actions_openPOS
		                ]
		            }
		        });
		}
	},
	
	addHandlers: function(scope){
		if(this.checkApp(scope)){
			
			scope.onRequestOrderForContact = function(response){
				var result = Ext.util.JSON.decode(response.responseText);
				if(result.success == true){
					var data = result.result;
					var orderRecord = new Tine.Billing.Model.Order(data,data.id);
					Tine.Billing.OrderEditDialog.openWindow({
						record: orderRecord
					});
				}
			};
			
			scope.onRequestOrderForContactFailure = function(response){
				Ext.MessageBox.show({
		            title: 'Fehler', 
		            msg: 'Beim Versuch einen Auftrag für den Kontakt zu generieren trat ein Fehler auf.',
		            buttons: Ext.Msg.OK,
		            icon: Ext.MessageBox.ERROR
		        });
			};
			
			scope.onCreateOrderForContact = function(){
				var contactRecord = this.getSelectedRecord();
				Ext.Ajax.request({
		            scope: this,
		            success: this.onRequestOrderForContact,
		            params: {
		            	method: 'Billing.requestOrderForContact',
		            	contactId: contactRecord.get('id')
		            },
		            failure: this.onRequestOrderForContactFailure
		        });
			};
			
			scope.openPOS = function(){
				var popupWindow = Tine.Billing.POSPanel.openWindow({
					modal:true,
					contactRecord: this.getSelectedRecord()
		        });
		        return popupWindow;
			};
		}
	},
	
	getAdditionalToolbarItems: function(scope){
		if(!this.checkApp(scope)){
			return [];
		}
		
		var a = [
				 Ext.apply( scope.actions_addressbookERP, {
		             scale: 'medium',
		             rowspan: 2,
		             iconAlign: 'top'
		         })
				];
	
		return a;
		
		
		
	},
	
	getAdditionalContextMenuItems: function(scope){
		if(!this.checkApp(scope)){
			return [];
		}
		var a = 
		[
		 	'-',
		 	scope.actions_addressbookERP
		];
		return a;
	},
	
	checkApp: function(scope){
		try{
			var appName = scope.getApp().getName();
			return appName == 'Addressbook';
		}catch(e){	
			return false;
		}
	},
	
	
	getEditDialogMainTabs: function(contactEditDialog, navigate){
		this.navigate = navigate;
		this.registerContactEventListeners(contactEditDialog);
		this.contactEditDialog = contactEditDialog;
		this.creditorEditDialog = new Tine.Billing.CreditorEditRecord({
			title:'Kreditor'
		});
		this.debitorEditDialog = new Tine.Billing.DebitorEditRecord({
			//easyAdding:true,
			title:'Debitor'
		});
		this.debitorEditDialog.disable();
		this.creditorEditDialog.disable();
		
		return [this.creditorEditDialog,this.debitorEditDialog];
	},
	
	registerContactEventListeners: function(contactEditDialog){
		contactEditDialog.on('loadcontact',this.onLoadContact,this);
	},
	
	onLoadContact: function(contact){
		if(contact.id != 0){
			this.creditorEditDialog.enable();
			this.creditorEditDialog.onLoadParent(contact);
			this.debitorEditDialog.enable();
			this.debitorEditDialog.onLoadParent(contact);
		}
		return true;
	},
	
	onUpdateContact: function(contact){
		this.creditorEditDialog.save(contact);
		this.debitorEditDialog.save(contact);
		return true;
	},
	
	onCancelContactEditDialog: function(){
		this.unsetCreditorEditDialog();
		this.debitorEditDialog = null;
		return true;
	},
	onSaveAndCloseContactDialog: function(){
		this.onSaveContact();
		this.unsetCreditorEditDialog();
		return true;
	},
	unsetCreditorEditDialog: function(){
		this.creditorEditDialog = null;
	}
});