
Ext.ns('Tine.Billing');

Tine.Billing.BankAccountWidgetFormFields = {
	iban:
	{
		id: 'iban_field',
		fieldLabel: 'IBAN',
	    name:'iban',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	disabled:false,
    	allowBlank:true,
 	    width:200
	},
	bic:
	{
		id: 'bic_field',
		fieldLabel: 'BIC',
	    name:'bic',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	disabled:false,
    	allowBlank:true,
 	    width:120
	},
	bank_code:
	{
		id: 'bank_code_field',
		fieldLabel: 'Bankleitzahl',
	    name:'bank_code',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	disabled:false,
    	allowBlank:true,
 	    width:120
	},
	bank_name:
	{
		id: 'bank_name_field',
		fieldLabel: 'Bank-Bezeichnung',
	    name:'bank_name',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	disabled:true,
    	allowBlank:true,
 	    width:400
	},
	name:
	{
		id: 'name_field',
		fieldLabel: 'Kontoinhaber',
	    name:'name',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	disabled:false,
    	allowBlank:true,
 	    width:200
	},
	number:
	{
		id: 'number_field',
		fieldLabel: 'Kontonummer',
	    name:'number',
	    disabledClass: 'x-item-disabled-view',
    	blurOnSelect: true,
    	allowBlank:true,
    	disabled:false,
 	    width:160
	},
	bank_account:
	{
		id: 'bank_account_selector',
		disabledClass: 'x-item-disabled-view',
		width: 400,
		fieldLabel: 'Bankkonto',
	    name:'bank_account_id',
	    disabled: false,
	    allowBlank:true,
	    blurOnSelect: true,
	},
	bank:
	{
		id: 'bank_selector',
		disabledClass: 'x-item-disabled-view',
		width: 400,
		fieldLabel: 'Bank',
	    name:'bank_id',
	    disabled: false,
	    allowBlank:true,
	    blurOnSelect: true
	},
	sepa_mandate_ident:
	{
		id: 'sepa_mandate_ident',
		disabledClass: 'x-item-disabled-view',
		width: 200,
		fieldLabel: 'Sepa-Mandat-ID',
	    name:'sepa_mandate_ident',
	    disabled: false,
	    allowBlank:true,
	    blurOnSelect: true
	},
	sepa_mandate_signature_date:
	{
		xtype:'extuxclearabledatefield',
		id: 'sepa_mandate_signature_date',
		disabledClass: 'x-item-disabled-view',
		width: 200,
		fieldLabel: 'Sepa-Unterschrift',
	    name:'sepa_mandate_signature_date',
	    disabled: false,
	    allowBlank:true,
	    blurOnSelect: true
	},
	sepa_mandate_id:
	{
		id: 'sepa_mandate_selector',
		disabledClass: 'x-item-disabled-view',
		width: 400,
		fieldLabel: 'Sepa-Mandat',
	    name:'sepa_mandate_id',
	    disabled: false,
	    allowBlank:true,
	    blurOnSelect: true
	},
	getIbanField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.iban;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);

	},
	getBicField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.bic;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);
	},
	getBankCodeField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.bank_code;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);
	},
	getBankNameField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.bank_name;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);
	},
	getNameField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.name;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);
	},
	getNumberField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.number;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);
	},
	getBankSelector: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.bank;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Tine.Billing.Custom.getRecordPicker('Bank','bank_id',
				Ext.apply( field, config));
		
	},
	getBankAccountSelector: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.bank_account;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Tine.Billing.Custom.getRecordPicker('BankAccount','bank_account_id',
				Ext.apply( field, config));
	},
	getSepaMandateIdentField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.sepa_mandate_ident;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);

	},
	getSepaMandateSignatureDateField: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.sepa_mandate_signature_date;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Ext.apply( field, config);

	},
	getSepaMandateSelector: function(config){
		var field = Tine.Billing.BankAccountWidgetFormFields.sepa_mandate_id;
		field.fieldLabel = this.getFieldLabel(field.fieldLabel);
		return Tine.Billing.Custom.getRecordPicker('SepaMandate','sepa_mandate_id',
				Ext.apply( field, config));
	},
	getFieldLabel: function(label){
		 return Tine.Tinebase.appMgr.get('Billing').i18n._(label);
	}
	
};

Tine.Billing.BankAccountWidget = function(config){
	config = config || {};
    Ext.apply(this, config);

    Tine.Billing.BankAccountWidget.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.BankAccountWidget, Ext.util.Observable, {
	formComponent: null,
	ibanFieldId: null,
	bicFieldId: null,
	bankCodeFieldId: null,
	bankNameFieldId: null,
	nameFieldId: null,
	numberFieldId: null,
	bankSelectorId: null,
	bankAccountSelectorId: null,
	sepaMandateIdentFieldId: null,
	sepaMandateSignatureDateFieldId: null,
	sepaMandateSelectorId: null,
	paymentMethodFieldId: null,
	
	bankCode: null,
	bankName: null,
	accountNumber: null,
	accountName: null,
	
	ibanField: null,
	bicField: null,
	bankCodeField: null,
	bankNameField: null,
	accountNumberField: null,
	accountNameField: null,
	paymentMethodField: null,
	
	topToolbar: null,
	registerPaymentMethodField: function(paymentMethodField){
		this.paymentMethodFieldId = paymentMethodField.id;
		return paymentMethodField;
	},
	isPaymentMethodFieldRegistered: function(){
		return !(!this.paymentMethodFieldId);
	},
	getPaymentMethodField: function(){
		return Ext.getCmp(this.paymentMethodFieldId);
	},
	registerIbanField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getIbanField(config);
		this.ibanFieldId = field.id;
		return field;
	},
	getIbanField: function(){
		try{
			return Ext.getCmp(this.ibanFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field iban';
		}
	},
	registerBicField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getBicField(config);
		this.bicFieldId = field.id;
		return field;
	},
	getBicField: function(){
		try{
			return Ext.getCmp(this.bicFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field bic';
		}
	},
	registerBankCodeField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getBankCodeField(config);
		this.bankCodeFieldId = field.id;
		return field;
	},
	getBankCodeField: function(){
		try{
			return Ext.getCmp(this.bankCodeFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field bankCode';
		}
	},
	registerBankNameField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getBankNameField(config);
		this.bankNameFieldId = field.id;
		return field;
	},
	getBankNameField: function(){
		try{
			return Ext.getCmp(this.bankNameFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field bankName';
		}
	},
	registerNameField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getNameField(config);
		this.nameFieldId = field.id;
		return field;
	},
	getNameField: function(){
		try{
			return Ext.getCmp(this.nameFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field name';
		}
	},
	registerNumberField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getNumberField(config);
		this.numberFieldId = field.id;
		return field;
	},
	getNumberField: function(){
		try{
			return Ext.getCmp(this.numberFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field number';
		}
	},
	registerBankSelector: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getBankSelector(config);
		this.bankSelectorId = field.id;
		return field;
	},
	getBankSelector: function(){
		try{
			return Ext.getCmp(this.bankSelectorId);
		}catch(e){
			throw 'BankAccountWidget: unknown field bankSelector';
		}
	},
	registerSepaMandateSelector: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getSepaMandateSelector(config);
		this.sepaMandateSelectorId = field.id;
		return field;
	},
	getSepaMandateSelector: function(){
		try{
			return Ext.getCmp(this.sepaMandateSelectorId);
		}catch(e){
			throw 'SepaMandateAccountWidget: unknown field sepaMandateSelector';
		}
	},
	registerBankAccountSelector: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getBankAccountSelector(config);
		this.bankAccountSelectorId = field.id;
		return field;
	},
	getBankAccountSelector: function(){
		try{
			return Ext.getCmp(this.bankAccountSelectorId);
		}catch(e){
			throw 'BankAccountWidget: unknown field bankAccountSelector';
		}
	},
	registerSepaMandateIdentField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getSepaMandateIdentField(config);
		this.sepaMandateIdentFieldId = field.id;
		return field;
	},
	getSepaMandateIdentField: function(){
		try{
			return Ext.getCmp(this.sepaMandateIdentFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field sepa mandate ident';
		}
	},
	registerSepaMandateSignatureDateField: function(config){
		config = config || {};
		var field = Tine.Billing.BankAccountWidgetFormFields.getSepaMandateSignatureDateField(config);
		this.sepaMandateSignatureFieldId = field.id;
		return field;
	},
	getSepaMandateSignatureDateField: function(){
		try{
			return Ext.getCmp(this.sepaMandateSignatureFieldId);
		}catch(e){
			throw 'BankAccountWidget: unknown field sepa mandate signature date';
		}
	},
	getDefaultForm: function(){
		return {
			   xtype: 'fieldset',
			   collapsible: true,
			   title: 'Bank-/Zahlungsdaten',
			   width:500,
			   layout:'fit',
			   tbar: this.topToolbar,
			   items:[
			          	{xtype:'columnform', 
			          		items:[/*[
			          		     fields.fee_payment_interval,
			          		     fields.fee_payment_method,
			          		     fields.debit_auth_date
			      		     ],*/
			          		[
			          		   this.registerBankAccountSelector()
			          		],[
			      		       this.registerIbanField(),
			      		       this.registerNumberField()
			      	        ],[
			      		       this.registerBicField(),
			      		       this.registerBankCodeField()
			      		    ],[
			      		       this.registerNameField(),
			      		       this.registerBankNameField()
			      		    ],[
			      		       this.registerBankSelector({hidden:true, hideLabel:true}),this.registerSepaMandateSelector({hidden:true, hideLabel:true})
			          	    ]]                                                            
			          	}
			   ]
		   };
	},
	getFormComponent: function(){
		if(!this.formComponent){
			return this.getDefaultForm();
		}
		return this.formComponent;
	},
	setFormComponent: function(formComponent){
		this.formComponent = formComponent;
		this.formComponent.tbar = this.topToolbar;
		//this.finalize();
	},	
	finalize: function(){
		this.getBankAccountSelector().on('select', this.triggerUpdate, this);
		this.getIbanField().on('specialkey', this.onInputIban, this);
	},
	init: function(applicationName /**...**/){
		this.addEvents(
			'opensepamandate',
			'openbankaccount',
			'removebankaccount',
			'lockbankselector',
			'unlockbankselector'
		);
		this.applicationName = applicationName;
		this.application = Tine.Tinebase.appMgr.get(applicationName);
		
		this.initActions();
		//this.topToolbar = new Ext.Toolbar();
		//this.setToolbarButtons();
		
	},
	initActions: function(){
		
		this.action_openSepaMandate = new Ext.Action({
            handler: this.openSepaMandate,
            scope: this
        });
		this.action_updateBankAccount = new Ext.Action({
            handler: this.updateBankAccount,
            scope: this
        });
		this.action_openBankAccount = new Ext.Action({
            handler: this.openBankAccount,
            scope: this
        });
		this.action_unlinkBankAccount = new Ext.Action({
            handler: this.unlinkBankAccount,
            scope: this
        });
		this.action_toggleBankAccountLock = new Ext.Action({
            scope: this,
            handler: this.toggleBankAccountLock
            
        });
		
		this.buttonUpdateBankAccount = Ext.apply(new Ext.Button(this.action_updateBankAccount), {
		    scale: 'small',
		    tooltip: 'Bankverbindung/Sepa-Mandat aktualisieren',
		    iconCls: 'bactToolUpdateBankAccount',			
		});
		
		this.buttonOpenBankAccount = Ext.apply(new Ext.Button(this.action_openBankAccount), {
		    scale: 'small',
		    tooltip: 'Bankverbindung öffnen',
		    iconCls: 'bactToolOpenBankAccount',			
		});
		this.buttonUnlinkBankAccount = Ext.apply(new Ext.Button(this.action_unlinkBankAccount), {
		    scale: 'small',
		    tooltip: 'Zuordnung der Bankverbindung lösen',
		    iconCls: 'bactToolUnlinkBankAccount',			
		});
		this.buttonOpenSepaMandate = Ext.apply(new Ext.Button(this.action_openSepaMandate), {
		    scale: 'small',
		    tooltip:'Sepa-Mandat öffnen',
		    iconCls: 'bactToolOpenSepaMandate',
		});
		this.buttonToggleBankAccountLock = Ext.apply(new Ext.Button(this.action_toggleBankAccountLock), {
			enableToggle: true,
			toggleHandler: this.toggleBankAccountLock,
		    scale: 'small',
		    tooltip: 'Auswahlbox Bankkonto: nur Bankverbindungen dieses Kontaktes zulassen',
		    iconCls: 'bactToolToggleBankAccountLock',
		    getState: function(){
        		return {
        			pressed: this.pressed
        		};
        	}
		});
		
	},
	getButtonUpdateBankAccount: function (){
		return this.buttonUpdateBankAccount;
	},
	getButtonOpenBankAccount: function (){
		return this.buttonOpenBankAccount;
	},
	getButtonUnlinkBankAccount: function(){
		return this.buttonUnlinkBankAccount;
	},
	getButtonOpenSepaMandate: function(){
		return this.buttonOpenSepaMandate;
	},
	getButtonToggleBankAccountLock: function(){
		return this.buttonToggleBankAccountLock;
	},
	openSepaMandate: function(){
		this.fireEvent('opensepamandate', this);
		var id = this.getSepaMandateSelector().getValue();
		if(id){
		   	var win = Tine.Billing.SepaMandateEditDialog.openWindow({
				record: new Tine.Billing.Model.SepaMandate({id:id},id)
			});
		}
	},
	openBankAccount: function(){
		this.fireEvent('openbankaccount', this);
		var id = this.getBankAccountSelector().getValue();
	   	var win = Tine.Billing.BankAccountEditDialog.openWindow({
			record: new Tine.Billing.Model.BankAccount({id:id},id)
		});
	},
	
	updateBankAccount: function(){
		var bankAccountId = this.getBankAccountSelector().getValue();
		if(bankAccountId){
			var iban = this.getIbanField().getValue();
			this.checkIbanBeforeUpdate(iban);
		}else{
			Ext.MessageBox.show({
	            title: 'Hinweis', 
	            msg: 'Es ist keine Bankverbindung hinterlegt, die aktualisiert werden könnte.',
	            buttons: Ext.Msg.OK,
	            scope:this,
	            fn: function(){this.getIbanField().focus();},
	            icon: Ext.MessageBox.ERROR
	        });
		}
	},
	
	updateBankAccountForValidIban: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		var state = result.state;
		if(state!=='success'){
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: 'Die eingegebene IBAN ist nicht korrekt.',
	            buttons: Ext.Msg.OK,
	            scope:this,
	            fn: function(){this.getIbanField().focus();},
	            icon: Ext.MessageBox.ERROR
	        });
			this.getIbanField().focus();
		}else{
			var bankAccountId = this.getBankAccountSelector().getValue();
			var iban = this.getIbanField().getValue();
			
			var bankAccountName = this.getNameField().getValue();
			var sepaMandateId = this.getSepaMandateSelector().getValue();
			var sepaMandateSignatureDate = null;
			if(sepaMandateId){
				sepaMandateSignatureDate = this.getSepaMandateSignatureDateField().getValue();
			}
			
			Ext.Ajax.request({
	            scope: this,
	            success: this.onUpdateBankAccountSuccess,
	            params: {
	                method: 'Billing.updateBankAccountAndSepaMandate',
	                bankAccountId: bankAccountId,
	                iban:  iban,
	                bankAccountName: bankAccountName,
	                sepaMandateId: sepaMandateId,
	                sepaMandateSignatureDate: sepaMandateSignatureDate
	                
	            },
	            failure: this.onUpdateBankAccountFailure
	        });	
		}
	},
	
	onUpdateBankAccountSuccess: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		var state = result.state;
		if(state!=='success'){
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: 'Bankverbindung/Sepa-Mandat konnte nicht aktualsiert werden',
	            buttons: Ext.Msg.OK,
	            scope:this,
	            fn: function(){this.getIbanField().focus();},
	            icon: Ext.MessageBox.ERROR
	        });
			this.getIbanField().focus();
		}else{
			var bankAccountData = result.data.bankAccount;
			var sepaMandateData = result.data.sepaMandate;
			
			if(bankAccountData){
				var objRecordBankAccount = new Tine.Billing.Model.BankAccount(bankAccountData, bankAccountData.id);
				this.getBankAccountSelector().setValue(objRecordBankAccount);
			}
			if(sepaMandateData){
				var objSepaMandate = new Tine.Billing.Model.SepaMandate(sepaMandateData, sepaMandateData.id);
				this.getSepaMandateSelector().setValue(objSepaMandate);
			}
			
			this.triggerUpdate();
			
			Ext.MessageBox.show({
	            title: 'Erfolg', 
	            msg: 'Bankverbindung/Sepa-Mandat wurde erfolgreich aktualisiert',
	            buttons: Ext.Msg.OK,
	            scope:this,
	            fn: function(){this.getIbanField().focus();},
	            icon: Ext.MessageBox.ERROR
	        });
		}
	},
	
	onUpdateBankAccountFailure: function(response){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Die Bankverbindung konnte nicht aktualisiert werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
	},
	
	unlinkBankAccount: function(){
		this.fireEvent('unlinkbankaccount', this);
		this.getBankAccountSelector().setValue(null);
		this.getNumberField().setValue(null);
		this.getIbanField().setValue(null);
		this.getBicField().setValue(null);
		this.getNameField().setValue(null);
		this.getBankCodeField().setValue(null);
		this.getBankNameField().setValue(null);
		this.getSepaMandateIdentField().setValue(null);
		this.getSepaMandateSignatureDateField().setValue(null);
		
		this.triggerUpdate();
		//this.getForm().clearInvalid();
	},
	toggleBankAccountLock: function(btn,a,b){
		var useContact = !btn.pressed;
		console.log(useContact);
		this.getBankAccountSelector().clearStore();
		this.getBankAccountSelector().setUseContact(useContact);
		this.getBankAccountSelector().loadStore();
		if(useContact){
			this.getButtonToggleBankAccountLock().setTooltip('Auswahlbox Bankkonto: Bankverbindungen aller Kontakte zur Auswahl zulassen');
		}else{
			this.getButtonToggleBankAccountLock().setTooltip('Auswahlbox Bankkonto: nur Bankverbindungen dieses Kontaktes zulassen');
		}
		
	},
	triggerUpdate: function(){
		this.action_openBankAccount.enable();
		this.action_unlinkBankAccount.enable();
		/*if(this.hasBankAccountAssigned()){
			this.action_openBankAccount.enable();
			this.action_unlinkBankAccount.enable();
		}else{
			this.action_openBankAccount.disable();
			this.action_unlinkBankAccount.disable();
		}*/
	},
	lockFields: function(){
		
	},
	unlockFields: function(){
		
	},
	hasBankAccountAssigned: function(){
		return !(!this.getBankAccountSelector().getValue());
	},
	setAllBankAccounts: function(){
		
	},
	setContactBankAccountsOnly: function(){
		
	},
	setContactId: function(contactId){
		this.bankAccountContactId = contactId;
		this.getBankAccountSelector().setUseContact(true);
		this.getBankAccountSelector().setContactId(contactId);
	},
	getContactId: function(){
		return this.bankAccountContactId;
	},
	onInputIban: function(field, e){
		if (e.getKey() == e.RETURN || e.getKey() == e.TAB ) {
			var iban = this.getIbanField().getValue();
			if(iban){
				this.checkIbanAndGetBankAccountIfValid(iban);
			}
		}
		
	},
	/*checkIbanAndGetBankAccountIfValid: function(iban){
		Ext.Ajax.request({
            scope: this,
            success: this.onCheckIBANSuccess,
            params: {
                method: 'Billing.getBankAccountForValidIBAN',
                iban:  iban,
                contactId: this.getContactId(),
                bankAccountName: this.getNameField().getValue()
            },
            failure: this.onCheckIBANFailure
        });	
	},*/
	checkIbanBeforeUpdate: function(iban){
		Ext.Ajax.request({
            scope: this,
            success: this.updateBankAccountForValidIban,
            params: {
                method: 'Billing.improveIBAN',
                iban:  iban
            },
            failure: this.onCheckIBANFailure
        });	
	},
	checkIbanAndGetBankAccountIfValid: function(iban){
		Ext.Ajax.request({
            scope: this,
            success: this.onCheckIBANSuccess,
            params: {
                method: 'Billing.improveIBAN',
                iban:  iban
            },
            failure: this.onCheckIBANFailure
        });	
	},
	onCheckIBANSuccess: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		var state = result.state;
		if(state!=='success'){
			Ext.MessageBox.show({
	            title: 'Fehler', 
	            msg: 'Die eingegebene IBAN ist nicht korrekt.',
	            buttons: Ext.Msg.OK,
	            scope:this,
	            fn: function(){this.getIbanField().focus();},
	            icon: Ext.MessageBox.ERROR
	        });
			this.getIbanField().focus();
		}
	},
	onCheckIBANFailure: function(response){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'IBAN-Prüfung konnte nicht durchgeführt werden.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
	}
});