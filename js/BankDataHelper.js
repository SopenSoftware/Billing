
Tine.Billing.BankDataHelper = function(config){
	config = config || {};
    Ext.apply(this, config);

    Tine.Billing.BankDataHelper.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.BankDataHelper, Ext.util.Observable, {
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
	
	/**
	 *  state(valid|invalid) indicator
	 *  assume valid:true at the beginning
	 *  editing postal code or location inits invalid state until
	 *  server responded valid combination of postal code and location
	 **/
	valid:true,
	
	initialize: function(bankCodeFieldCodeFieldId, bankNameFieldId, accountNumberFieldId, accountNameFieldId){
		
		this.bankCodeField = Ext.getCmp(bankCodeFieldCodeFieldId);
		this.bankNameField = Ext.getCmp(bankNameFieldId);
		this.accountNumberField = Ext.getCmp(accountNumberFieldId);
		this.accountNameField = Ext.getCmp(accountNameFieldId);
		
		this.updateFromForm();
		
		this.bankCodeField.on('specialkey', this.onSubmitBankCode, this);
		
		return this;
		
	},
	updateFromForm: function(){
		this.setBankCode(this.bankCodeField.getValue());
		this.setBankName(this.bankNameField.getValue());
		this.setAccountNumber(this.accountNumberField.getValue());
		this.setAccountName(this.accountNameField.getValue());
	},
	isValid: function(){
		return this.valid;
	},
	setValid: function(){
		this.valid = true;
	},
	setInvalid: function(){
		this.valid = false;
	},
	hasChangedBankCode: function(){
		return this.bankCodeField.getValue() !== this.getBankCode();
	},
	setBankCode: function(bankCode){
		this.bankCode = bankCode;
	},
	getBankCode: function(){
		return this.bankCode;
	},
	updateBankCode: function(){
		this.setBankCode(this.bankCodeField.getValue());
	},
	
	setBankName: function(bankName){
		this.bankName = bankName;
	},
	getBankName: function(){
		return this.bankName;
	},
	updateBankName: function(){
		this.setBankName(this.bankNameField.getValue());
	},
	
	setAccountNumber: function(accountNumber){
		this.accountNumber = accountNumber;
	},
	getAccountNumber: function(){
		return this.accountNumber;
	},
	updateAccountNumber: function(){
		this.setAccountNumber(this.accountNumberField.getValue());
	},
	
	setAccountName: function(accountName){
		this.accountName = accountName;
	},
	getAccountName: function(){
		return this.accountName;
	},
	updateAccountName: function(){
		this.setAccountName(this.accountNameField.getValue());
	},
	
	getBankCodeResponseObject: function(response){
		var result = Ext.util.JSON.decode(response.responseText);
		var obj = {
			isError: false,
			data: result.data,
			isSingle: result.data.length == 1
		};
		if(result.state!=='success'){
			obj.isError = true;
		}
		return obj;
	},
	
	presetBankNameFieldFromBankCode: function(response){
		var responseObj = this.getBankCodeResponseObject(response);
		if(responseObj.isError){
			this.bankCodeField.focus();
			this.failureBankCodeInvalid();
			this.bankCodeField.focus();
		}else{
			this.updateBankCode();
			if(responseObj.isSingle){
				// clear location field store
				this.bankNameField.getStore().loadData([]);
				this.bankNameField.setValue(responseObj.data[0].name);
			}else{
				this.bankNameField.setValue('');
				this.bankNameField.emptyText = '...bitte wählen...';
				var data = [];
				for(var i=0; i<responseObj.data.length; i++){
					data[i] = responseObj.data[i].name;
				}
				this.bankNameField.getStore().loadData(data);
				this.bankNameField.focus();
				this.bankNameField.expand();
			}
		}
	},
	
	getBanksByBankCode: function(bankCode, successFn, failureFn){
		Ext.Ajax.request({
            scope: this,
            success: successFn,
            params: {
                method: 'Billing.getBanksByBankCode',
                bankCode:  bankCode
            },
            failure: failureFn
        });
	},
	
	onSubmitBankCode: function(field, e){
		 // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
        // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
        if (e.getKey() == e.RETURN || e.getKey() == e.TAB ) {
        	if(this.hasChangedBankCode() || this.getBankCode()==''){
        		this.checkBankCode();
        	}
        }
	},
	onSubmitBankCodeOnBlur: function(field, e){
		 // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
       // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
	   if(this.hasChangedBankCode() || this.getBankCode()==''){
       		this.checkBankCode();
       }
	},
	checkBankCode: function(){
   		
   		if(this.bankCodeField.getValue()!=''){
	   		this.getBanksByBankCode(
	   			this.bankCodeField.getValue(),
	   			this.presetBankNameFieldFromBankCode, // -> success
	   			this.failureBankCodeRequest			// -> failure
	   		);
   		}
 	},
	
	failureBankCodeInvalid: function(){
		Ext.MessageBox.show({
			title: 'Fehler', 
            msg: 'Die eingegebene Bankleitzahl existiert nicht.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
	},
	
	failureBankCodeRequest: function(){
		Ext.MessageBox.show({
            title: 'Fehler', 
            msg: 'Bei der Abfrage der Bankleitzahl ist ein Fehler aufgetreten.',
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.WARNING
        });
	}
});