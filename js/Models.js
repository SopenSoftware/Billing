Ext.ns('Tine.Billing','Tine.Billing.Model');

/**
* sopen docmanager models
*/

Tine.Billing.Model.ContextArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'name'},
  {name: 'application_name'},
  {name: 'model_name'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.Context = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ContextArray, {
	appName: 'Billing',
	modelName: 'Context',
	idProperty: 'id',
	recordName: 'Kontext',
	recordsName: 'Kontexts',
	containerProperty: null,
	titleProperty: 'name'
});

Tine.Billing.Model.Context.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.Context.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
   ];
};

Tine.Billing.Model.AccountClassArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'key'},
  {name: 'name'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.AccountClass = Tine.Tinebase.data.Record.create(Tine.Billing.Model.AccountClassArray, {
	appName: 'Billing',
	modelName: 'AccountClass',
	idProperty: 'id',
	recordName: 'Kontenklasse',
	recordsName: 'Kontenklassen',
	containerProperty: null,
	titleProperty: 'name'
});

Tine.Billing.Model.AccountClass.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.AccountClass.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
      {label: app.i18n._('Schlüssel'),  field: 'key',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Bezeichnung'),  field: 'name',       operators: ['equals','contains','startswith','endswith'] }
   ];
};

Tine.Billing.Model.AccountSystemArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'account_class_id'},
  {name: 'vat_account_id'},
  {name: 'number'},
  {name: 'name'},
  {name: 'type'},
  {name: 'account_type'},
  {name: 'last_termination_date'},

  {name: 'sum_debit'},
  {name: 'sum_credit'},
  
  {name: 'credit_saldo'},
  {name: 'debit_saldo'},
  {name: 'begin_credit_saldo'},
  {name: 'begin_debit_saldo'},
  {name: 'is_bank_account'},
  {name: 'is_default_bank_account'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.AccountSystem = Tine.Tinebase.data.Record.create(Tine.Billing.Model.AccountSystemArray, {
	appName: 'Billing',
	modelName: 'AccountSystem',
	idProperty: 'id',
	recordName: 'Konto',
	recordsName: 'Konten',
	containerProperty: null,
	titleProperty: 'number',
	getTitle: function(){
		var saldo = this.get('credit_saldo') - this.get('debit_saldo');
		
		return this.get('number') + ' ' + this.get('name') + " [Saldo: " + saldo + ' EUR]';
	}
});

Tine.Billing.Model.AccountSystem.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.AccountSystem.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
	{label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },
      {label: app.i18n._('Kontonummer'),  field: 'number',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Bezeichnung'),  field: 'name',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Kontenklasse'),  field: 'account_class_id',  valueType: 'combo', valueField:'id', displayField:'name',
        	store:Tine.Billing.getSimpleStore('AccountClass')},
      {label: app.i18n._('Typ'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name',
    	  store:[['ACTIVE', 'Aktivkonto'],['PASSIVE','Passivkonto']]}
   ];
};

Tine.Billing.Model.BookingArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'receipt_id'}, 
  {name: 'booking_nr'},
  {name: 'booking_receipt_nr'},
  {name: 'receipt_unique_nr'}, 
  {name: 'booking_date',      type: 'date', dateFormat: Date.patterns.ISO8601Short},
  {name: 'booking_receipt_date',      type: 'date', dateFormat: Date.patterns.ISO8601Short},
  {name: 'booking_text'},
  {name: 'erp_context_id'},
  {name: 'object_id'},
  {name: 'donation_id'},
  {name: 'value'},
  {name: 'valid'},
  {name: 'reversion_record_id'},
  {name: 'is_cancelled'},
  {name: 'is_cancellation'}
];


/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.Booking = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BookingArray, {
	appName: 'Billing',
	modelName: 'Booking',
	idProperty: 'id',
	recordName: 'Buchung',
	recordsName: 'Buchungen',
	containerProperty: null,
	titleProperty: 'booking_nr',
	getTite: function(){
		return this.get('booking_nr') + ' ' +this.get('booking_text');
	}
});

Tine.Billing.Model.Booking.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.Booking.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
      
      {label: app.i18n._('Buchungsnummer'),  field: 'booking_nr',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Belegnummer'),  field: 'booking_receipt_nr',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Buchungstext'),  field: 'booking_text',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Buchungsdatum'),         field: 'booking_date', valueType: 'date'},
      {label: app.i18n._('Belegdatum'),         field: 'booking_receipt_date', valueType: 'date'},
      {label: app.i18n._('Betrag'),         field: 'value', valueType: 'number',  operators: ['equals','greater','less']},
      {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
       	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
      {label: _('Valide'),   field: 'valid',  valueType: 'bool'}
      //{app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}
   ];
};

Tine.Billing.Model.AccountBookingArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'account_system_id'}, 
  {name: 'booking_id'},
  {name: 'receipt_id'},
  {name: 'debitor_id'},
  {name: 'value'}, 
  {name: 'credit_value'}, 
  {name: 'debit_value'}, 
  {name: 'type'}, 
  {name: 'booking_date',      type: 'date', dateFormat: Date.patterns.ISO8601Short},
  {name: 'termination_date'}, 
  {name: 'status'}
];


/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.AccountBooking = Tine.Tinebase.data.Record.create(Tine.Billing.Model.AccountBookingArray, {
	appName: 'Billing',
	modelName: 'AccountBooking',
	idProperty: 'id',
	recordName: 'Buchungsbetrag',
	recordsName: 'Buchungsbeträge',
	containerProperty: null,
	getTitle: function(){
		return this.getForeignRecord(Tine.Billing.Model.Booking, 'booking_id') + ' ' + this.get('value');
	}
});

Tine.Billing.Model.AccountBooking.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.AccountBooking.getFilterModel = function(withoutDebitor) {
   var app = Tine.Tinebase.appMgr.get('Billing');
   var aResult = [
	{label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },

      {label: app.i18n._('Betrag'),  field: 'value', valueType:'number',      operators: ['equals','greater','less'] },
      {label: app.i18n._('Art'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name',
    	  store:[['CREDIT', 'Haben'],['DEBIT','Soll']]},
      {app: app, filtertype: 'foreignrecord', label: 'Konto', field: 'account_system_id', foreignRecordClass: Tine.Billing.Model.AccountSystem, ownField:'account_system_id'},
      {label: app.i18n._('Buchungs-Datum'), field: 'booking_date', valueType: 'date' },
	  {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]}
  
      
   ];
   
   if(!withoutDebitor){
	   return aResult.concat([{app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}]);
   }else{
	   return aResult;
   }
};

Tine.Billing.Model.AccountBooking.getFilterModelForSplitGrid = function() {
	   var app = Tine.Tinebase.appMgr.get('Billing');
	   return [
	      {label: app.i18n._('Betrag'),  field: 'value', valueType:'number',      operators: ['equals','greater','less'] },
	      {app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'},
	      {label: app.i18n._('Buchungs-Datum'), field: 'booking_date', valueType: 'date' },
		             {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]}
  
	   ];
	};
	
	
	
	
	
Tine.Billing.Model.BookingTemplateArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'booking_template_nr'}, 
  {name: 'key'},
  {name: 'event_name'},
  {name: 'name'}, 
  {name: 'booking_text'},
  {name: 'erp_context_id'},
  {name: 'booking_type'},
  {name: 'has_vat'},
  {name: 'is_auto_possible'}
];


/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.BookingTemplate = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BookingTemplateArray, {
	appName: 'Billing',
	modelName: 'BookingTemplate',
	idProperty: 'id',
	recordName: 'Buchungsvorlage',
	recordsName: 'Buchungsvorlagen',
	containerProperty: null,
	titleProperty: 'booking_template_nr',
	getTite: function(){
		return this.get('booking_template_nr') + ' ' +this.get('name');
	}
});

Tine.Billing.Model.BookingTemplate.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.BookingTemplate.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
	{label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },

      {label: app.i18n._('Nummer'),  field: 'booking_nr',       operators: ['equals','contains','startswith','endswith'] },
      {label: app.i18n._('Buchungstext'),  field: 'booking_text',       operators: ['equals','contains','startswith','endswith'] }
   ];
};

Tine.Billing.Model.AccountBookingTemplateArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'account_system_id'}, 
  {name: 'booking_template_id'},
  {name: 'type'},
  {name: 'percentage'},
  {name: 'input_value'}, 
  {name: 'multiply'}, 
  {name: 'has_customer'}, 
  {name: 'has_supplier'}
];


/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.AccountBookingTemplate = Tine.Tinebase.data.Record.create(Tine.Billing.Model.AccountBookingTemplateArray, {
	appName: 'Billing',
	modelName: 'AccountBookingTemplate',
	idProperty: 'id',
	recordName: 'Vorlage Einzelbuchung',
	recordsName: 'Vorlagen Einzelbuchung',
	containerProperty: null,
	getTitle: function(){
		return this.getForeignRecord(Tine.Billing.Model.BookingTemplate, 'booking_template_id').getTitle();
	}
});

Tine.Billing.Model.AccountBookingTemplate.getDefaultData = function(){
   return {};
};
    
Tine.Billing.Model.AccountBookingTemplate.getFilterModel = function() {
   var app = Tine.Tinebase.appMgr.get('Billing');
   return [
     // {label: app.i18n._('Betrag'),  field: 'value',       operators: ['equals','greater','less'] },
      {label: app.i18n._('Art'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name',
    	  store:[['CREDIT', 'Haben'],['DEBIT','Soll']]}
   ];
};

Tine.Billing.Model.AccountBookingTemplate.getFilterModelForSplitGrid = function() {
	   var app = Tine.Tinebase.appMgr.get('Billing');
	   return [
	      {label: app.i18n._('Betrag'),  field: 'value',       operators: ['equals','greater','less'] }	     
	   ];
	};	
	
	
	
	
	
	

Tine.Billing.Model.CreditorArray = [
    {name: 'id'},	// (pk)
    {name: 'contact_id'},
    {name: 'creditor_nr'}
  ];

  /**
  * @type {Tine.Tinebase.data.Record}
  * Contact record definition
  */
  Tine.Billing.Model.Creditor = Tine.Tinebase.data.Record.create(Tine.Billing.Model.CreditorArray, {
  	appName: 'Billing',
 	modelName: 'Creditor',
 	idProperty: 'id',
 	recordName: 'Kreditor',
 	recordsName: 'Kreditoren',
 	containerProperty: null,
 	titleProperty: 'creditor_title',
 	getContact: function(){
    	var contact = this.get('contact_id');
    	var contactId = contact.id;
    	contact.jpegphoto = null;
    	return new Tine.Addressbook.Model.Contact(contact,contactId);
    },
	  relations:[{
			name: 'creditor_contact',
			model: Tine.Addressbook.Model.Contact,
			fkey: 'contact_id',
			embedded:true,
			emissions:[
			    {dest: {
			    	name: 'n_fileas'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('n_fileas');
			    		}else{
			    			return '';
			    		}
			    	}
			    },{dest: {
			    	name: 'org_name'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('org_name');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_street'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_street');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_postalcode'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_postalcode');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_locality'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_locality');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_countryname'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_countryname');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'contact_nr'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('id');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'creditor_title'}, 
			    	source: function(contact, creditor){
			    		if(typeof(contact) === 'object'){
			    			return creditor.get('creditor_nr') + ' ' + contact.getTitle();
			    		}else{
			    			return contact;
			    		}
			    	}
			    }
			]
		}]
  });

 Tine.Billing.Model.Creditor.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.Creditor.getFilterModel = function() {
     var app = Tine.Tinebase.appMgr.get('Billing');
     return [
             {label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },
             {label: app.i18n._('Kreditor-Nr'),  field: 'creditor_nr',       operators: ['equals','contains','startswith','endswith'] },
             {app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
     ];
 };

 Tine.Billing.Model.DebitorArray = [
    {name: 'id'},	// (pk)
    {name: 'price_group_id'},
    {name: 'debitor_group_id'},
    {name: 'vat_id'},
    {name: 'contact_id'}, 	
    {name: 'debitor_nr'},
    {name: 'fibu_exp_date'},
    {name: 'is_order_locked'},
    {name: 'order_lock_comment'},
    {name: 'order_lock_date'},
    {name: 'is_monition_locked'},
    {name: 'monition_lock_comment'},
    {name: 'monition_lock_date'},
    {name: 'ust_id'}
  ];

  /**
  * @type {Tine.Tinebase.data.Record}
  * Contact record definition
  */
  Tine.Billing.Model.Debitor = Tine.Tinebase.data.Record.create(Tine.Billing.Model.DebitorArray, {
  	appName: 'Billing',
 	modelName: 'Debitor',
 	idProperty: 'id',
 	recordName: 'Debitor',
 	recordsName: 'Debitoren',
 	containerProperty: null,
 	titleProperty: 'debitor_title',
 	getContact: function(){
    	var contact = this.get('contact_id');
    	var contactId = contact.id;
    	contact.jpegphoto = null;
    	return new Tine.Addressbook.Model.Contact(contact,contactId);
    },
    getVat: function(){
    	return this.getForeignRecord(Tine.Billing.Model.Vat, 'vat_id');
    },
    getVatValue: function(){
    	return this.getVat().getValue();
    },
    hasVatZero: function(){
    	return this.getVatValue()==0;
    },
	  relations:[{
			name: 'debitor_contact',
			model: Tine.Addressbook.Model.Contact,
			fkey: 'contact_id',
			embedded:true,
			emissions:[
			    {dest: {
			    	name: 'n_fileas'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('n_fileas');
			    		}else{
			    			return '';
			    		}
			    	}
			    },{dest: {
			    	name: 'org_name'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('org_name');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_street'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_street');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_postalcode'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_postalcode');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_locality'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_locality');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'adr_one_countryname'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('adr_one_countryname');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'contact_nr'}, 
			    	source: function(contact){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('id');
			    		}else{
			    			return contact;
			    		}
			    	}
			    },{dest: {
			    	name: 'debitor_title'}, 
			    	source: function(contact, debitor){
			    		if(typeof(contact) === 'object'){
			    			return debitor.get('debitor_nr') + ' ' + contact.getTitle() + debitor.get('adr_one_locality');
			    		}else{
			    			return contact;
			    		}
			    	}
			    }
			]
		}]
  });

 Tine.Billing.Model.Debitor.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.Debitor.getFilterModel = function() {
     var app = Tine.Tinebase.appMgr.get('Billing');
     return [
             {label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },
             {label: app.i18n._('Debitor-Nr'),  field: 'debitor_nr',       operators: ['equals','contains','startswith','endswith'] },
             {app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'contact_id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'},
             {label: app.i18n._('Kundengruppe'),  field: 'debitor_group_id',  valueType: 'combo', valueField:'id', displayField:'name',
              	store:Tine.Billing.getSimpleStore('DebitorGroup')}
     ];
 };
 
Tine.Billing.Model.VatArray = [
   {name: 'id'}, 	// (pk)
   {name: 'name'}, 
   {name: 'value'},
   {name: 'is_default'},
   {name: 'credit_account'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.Vat = Tine.Tinebase.data.Record.create(Tine.Billing.Model.VatArray, {
 	appName: 'Billing',
	modelName: 'Vat',
	idProperty: 'id',
	recordName: 'MwSt-Satz',
	recordsName: 'MwSt-Sätze',
	containerProperty: null,
	titleProperty: 'name',
	getValue: function(){
		return this.get('value');
	}
 });

Tine.Billing.Model.Vat.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.Vat.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
    ];
};

Tine.Billing.Model.PriceGroupArray = [
  {name: 'id'}, 	// (pk)
  {name: 'name'}, 
  {name: 'comment'},
  {name: 'is_default'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.PriceGroup = Tine.Tinebase.data.Record.create(Tine.Billing.Model.PriceGroupArray, {
	appName: 'Billing',
	modelName: 'PriceGroup',
	idProperty: 'id',
	recordName: 'Preisgruppe',
	recordsName: 'Preisgruppen',
	containerProperty: null,
	titleProperty: 'name'
    });

   Tine.Billing.Model.PriceGroup.getDefaultData = function(){
   	return {};
   };
    
   Tine.Billing.Model.PriceGroup.getFilterModel = function() {
       var app = Tine.Tinebase.appMgr.get('Billing');
   return [
           {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
       ];
   };

Tine.Billing.Model.DebitorGroupArray = 
[
 {name: 'id'}, 	// (pk)
 {name: 'name'}, 
 {name: 'comment'},
 {name: 'is_default'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
Tine.Billing.Model.DebitorGroup = Tine.Tinebase.data.Record.create(Tine.Billing.Model.DebitorGroupArray, {
   	appName: 'Billing',
   	modelName: 'DebitorGroup',
   	idProperty: 'id',
   	recordName: 'Kundengruppe',
   	recordsName: 'Kundengruppen',
   	containerProperty: null,
   	titleProperty: 'name'
   });

Tine.Billing.Model.DebitorGroup.getDefaultData = function(){
  	return {};
  };
   
Tine.Billing.Model.DebitorGroup.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
  return [
          {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
};   
   
   
   
   
   Tine.Billing.Model.PaymentMethodArray = 
   [
     {name: 'id'}, 	// (pk)
     {name: 'invoice_template_id'},
     {name: 'name'}, 
     {name: 'processor_class'},
     {name: 'text1'}, 
     {name: 'text2'},
     {name: 'sort_order'},
     {name: 'is_default'},
     {name: 'due_in_days'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.PaymentMethod = Tine.Tinebase.data.Record.create(Tine.Billing.Model.PaymentMethodArray, {
   	appName: 'Billing',
   	modelName: 'PaymentMethod',
   	idProperty: 'id',
   	recordName: 'Zahlungsmethode',
   	recordsName: 'Zahlungsmethodeen',
   	containerProperty: null,
   	titleProperty: 'name'
       });

      Tine.Billing.Model.PaymentMethod.getDefaultData = function(){
      	return {};
      };
       
      Tine.Billing.Model.PaymentMethod.getFilterModel = function() {
          var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
          ];
      };
   
Tine.Billing.Model.ArticleGroupArray = [
   {name: 'id'}, 	// (pk)
   {name: 'name'}, 
   {name: 'comment'},
   {name: 'image'},
   {name: 'credit_account'},
   {name: 'pos_permitted'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.ArticleGroup = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleGroupArray, {
 	appName: 'Billing',
	modelName: 'ArticleGroup',
	idProperty: 'id',
	recordName: 'Artikelgruppe',
	recordsName: 'Artikelgruppen',
	containerProperty: null,
	titleProperty: 'name'
 });

Tine.Billing.Model.ArticleGroup.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.ArticleGroup.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
    ];
};

Tine.Billing.Model.StockLocationArray = [
   {name: 'id'}, 	// (pk)
   {name: 'location'},
   {name: 'is_default'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.StockLocation = Tine.Tinebase.data.Record.create(Tine.Billing.Model.StockLocationArray, {
 	appName: 'Billing',
	modelName: 'StockLocation',
	idProperty: 'id',
	recordName: 'Lager',
	recordsName: 'Lager',
	containerProperty: null,
	titleProperty: 'location'
 });

Tine.Billing.Model.StockLocation.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.StockLocation.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Ort'),  field: 'query',       operators: ['contains'] }
    ];
};

Tine.Billing.Model.ArticleSupplyArray = 
[
     {name: 'id'}, 	// (pk)
     {name: 'stock_location_id'}, 
     {name: 'article_id'}, 
     {name: 'amount'},
     {name: 'last_inventory_date'},
     {name: 'last_order_date'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.ArticleSupply = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSupplyArray, {
   	appName: 'Billing',
  	modelName: 'ArticleSupply',
  	idProperty: 'id',
  	recordName: 'Artikelbestand',
  	recordsName: 'Artikelbestände',
  	containerProperty: null,
  	titleProperty: 'amount'
   });
   
   Tine.Billing.Model.ArticleSupply.getFilterModel = function() {
	    var app = Tine.Tinebase.appMgr.get('Billing');
	    return [
	            {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['contains'] }
	    ];
	};   

  Tine.Billing.Model.ArticleSupply.getDefaultData = function(){
  	return {};
  };
  
  Tine.Billing.Model.ArticleUnitArray = 
  [
     {name: 'id'}, 	// (pk)
     {name: 'name'}, 
     {name: 'factor'}, 
     {name: 'data'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.ArticleUnit = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleUnitArray, {
   	appName: 'Billing',
  	modelName: 'ArticleUnit',
  	idProperty: 'id',
  	recordName: 'Artikeleinheit',
  	recordsName: 'Artikeleinheiten',
  	containerProperty: null,
  	titleProperty: 'name'
   });

  Tine.Billing.Model.ArticleUnit.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.ArticleUnit.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };
  
  Tine.Billing.Model.ArticleSeriesKindArray = 
  [
     {name: 'id'}, 	// (pk)
     {name: 'name'}//, 
     //ame: 'factor'}, 
     //ame: 'data'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.ArticleSeriesKind = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSeriesKindArray, {
   	appName: 'Billing',
  	modelName: 'ArticleSeriesKind',
  	idProperty: 'id',
  	recordName: 'Artikelserienart',
  	recordsName: 'Artikelserienarten',
  	containerProperty: null,
  	titleProperty: 'name'
   });

  Tine.Billing.Model.ArticleSeriesKind.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.ArticleSeriesKind.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };
  Tine.Billing.Model.ArticleSeriesArray = 
  [
	 {name: 'id'}, 	// (pk)
     {name: 'name'}, 
     {name: 'article_series_kind_id'}, 
     {name: 'begin_date'},
     {name: 'end_date'},
     {name: 'is_closed'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.ArticleSeries = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSeriesArray, {
   	appName: 'Billing',
  	modelName: 'ArticleSeries',
  	idProperty: 'id',
  	recordName: 'Artikelserie',
  	recordsName: 'Artikelserien',
  	containerProperty: null,
  	titleProperty: 'name'
   });

  Tine.Billing.Model.ArticleSeries.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.ArticleSeries.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };
 
  Tine.Billing.Model.ArticleArray = [
     {name: 'id'}, 	// (pk)
     {name: 'article_nr'},
     {name: 'article_group_id'}, 
     {name: 'article_series_id'}, 
     {name: 'vat_id'},
     {name: 'article_unit_id'},
     {name: 'article_ext_nr'},
     {name: 'name'},
     {name: 'description'},
     {name: 'comment'},
     {name: 'image'},
     {name: 'weight'},
     {name: 'dimensions'},
     {name: 'is_stock_article'},
     {name: 'stock_amount_total'},
     {name: 'stock_amount_min'},
     {name: 'rev_account_vat_in'},
     {name: 'rev_account_vat_ex'},
     {name: 'locked'},
     {name: 'hidden'},
     {name: 'prices'},
     {name: 'pos_permitted'},
     {name: 'simple_article'},
     {name: 'creates_donation'},
     {name: 'add_calculation'},
     {name: 'price_netto'},
     {name: 'price2_netto'},
     {name: 'price_brutto'},
     {name: 'price2_brutto'},
     {name: 'price2_vat_id'},
     {name: 'donation_amount'},
     {name: 'donation_campaign_id'},
     {name: 'ek1'},
     {name: 'ek2'},
     {name: 'price2_vat_id'},
     {name: 'rev_account_price2_vat_in'},
     {name: 'rev_account_price2_vat_ex'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.Article = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleArray, {
   	appName: 'Billing',
  	modelName: 'Article',
  	idProperty: 'id',
  	recordName: 'Artikel',
  	recordsName: 'Artikel',
  	containerProperty: null,
  	titleProperty: 'article_title',
    relations:[{
			name: 'article_group',
			model: Tine.Billing.Model.ArticleGroup,
			fkey: 'article_group_id',
			embedded:true,
			emissions:[
			    {dest: {
			    	name: 'article_title'}, 
			    	source: function(articleGroup, article){
			    		if(typeof(article) === 'object'){
			    			var articleTitle = article.get('name');
			    			var articleNr = article.get('article_nr');
			    			/*var articleNr2 = article.get('article_ext_nr');
			    			var articleExt = '';
			    			if(articleNr2){
			    				articleExt = '/<_2#'+ articleNr2 + '>';
			    			}*/
			    			if(articleNr){
			    				articleTitle = '<#'+ articleNr + '> ' + articleTitle;
			    			}
			    			return  articleTitle;
			    		}else{
			    			return '';
			    		}
			    	},
	}]}],
	isSimpleArticle: function(){
		return this.get('simple_article') == 1;
	},
  	getPriceByDebitorId: function(debitorId){
  		var prices = this.get('prices')['debitors'];
  		if(prices[debitorId] !== undefined){
  			return prices[debitorId];
  		}else{
  			return false;
  		}
  	},
  	getPriceByPriceGroup: function(priceGroupId){
  		var prices = this.get('prices')['pricegroups'];
  		if(prices[priceGroupId] !== undefined){
  			return prices[priceGroupId];
  		}else{
  			return false;
  		}
  	},
  	getPrices: function(debitorId, priceGroupId){
  		var prices = null;
  		if(this.isSimpleArticle()){
  			return this.get('prices')['simple'];
  		}
  		if(debitorId && (prices = this.getPriceByDebitorId(debitorId))){
  			return prices;
  		}else if(priceGroupId && (prices = this.getPriceByPriceGroup(priceGroupId))){
  			return prices;
  		}
  		return {price_netto: 0, price_brutto:0};
  	},
  	getPricesForCreditor: function(creditorId){
  		var prices = this.get('prices')['creditors'];
  		if(prices[creditorId] !== undefined){
  			return prices[creditorId];
  		}else{
  			return {price_netto: 0, price_brutto:0};
  		}
  	},
  	getVatValue: function(){
  		var vat = this.get('vat_id');
			
  		if(typeof(vat)==='object'){
  			if(vat.value !== undefined){
  				return parseFloat(vat.value);
  			}else if(vat.data !== undefined && vat.data.value !== undefined){
  				return parseFloat(vat.data.value);
  			}
  		}
  		return 0;
  	}
   });

  Tine.Billing.Model.Article.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.Article.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains','equals','startswith','endswith'] },
              {label: app.i18n._('Bezeichnung'),  field: 'name',       operators: ['equals','contains','startswith','endswith'] },
              {label: app.i18n._('Beschreibung'),  field: 'description',       operators: ['equals','contains','startswith','endswith'] },
              {label: app.i18n._('Bemerkung'),  field: 'comment',       operators: ['equals','contains','startswith','endswith'] },
              {label: app.i18n._('Artikel-Nr'),  field: 'article_nr',       operators: ['equals','contains','startswith','endswith'] },
              {label: app.i18n._('Artikel-Nr2'),  field: 'article_ext_nr',       operators: ['equals','contains','startswith','endswith'] },
              {label: app.i18n._('Artikelgruppe'),  field: 'article_group_id',  valueType: 'combo', valueField:'id', displayField:'name',
                 	store:Tine.Billing.getSimpleStore('ArticleGroup')},
              {label: app.i18n._('Serie'),  field: 'article_series_id',  valueType: 'combo', valueField:'id', displayField:'name',
                   	store:Tine.Billing.getSimpleStore('ArticleSeries')}
                   
              
      ];
  };

  
  Tine.Billing.Model.SellPriceArray = [
   {name: 'id'},				// (pk)
   {name: 'price_group_id'},  	// fk	
   {name: 'article_id'}, 		// fk
   {name: 'price_netto'},
   {name: 'price_brutto'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.SellPrice = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SellPriceArray, {
 	appName: 'Billing',
	modelName: 'SellPrice',
	idProperty: 'id',
	recordName: 'Verkaufspreis',
	recordsName: 'Verkaufspreise',
	containerProperty: null,
	titleProperty: 'price_netto',
	calculateBaseNetto: function(vatValue){
		var priceNetto = this.get('price_netto');
		priceBrutto = priceNetto * (1+vatValue);
		this.set('price_brutto',priceBrutto);
	},
	calculateBaseBrutto: function(vatValue){
		var priceBrutto = this.get('price_brutto');
		priceNetto = priceBrutto / (1+vatValue);
		this.set('price_netto', priceNetto);
	}
 });

Tine.Billing.Model.SellPrice.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.SellPrice.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
    ];
};


Tine.Billing.Model.ArticleSupplierArray = [
   {name: 'id'}, 	// (pk)
   {name: 'creditor_id'}, 
   // TODO: emissions
   // contact_name
   {name: 'article_id'},
   {name: 'price'},
   {name: 'last_order_date'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.ArticleSupplier = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSupplierArray, {
 	appName: 'Billing',
	modelName: 'ArticleSupplier',
	idProperty: 'id',
	recordName: 'Lieferantendaten Artikel',
	recordsName: 'Lieferantendaten Artikel',
	containerProperty: null,
	titleProperty: 'contact_name'
 });

Tine.Billing.Model.ArticleSupplier.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.ArticleSupplier.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
    ];
};

Tine.Billing.Model.StockFlowArray = [
     {name: 'id'}, 	// (pk)
     {name: 'article_id'}, 
     {name: 'creditor_id'}, 
     {name: 'debitor_id'}, 
     {name: 'stock_location_id'},
     {name: 'price_netto'},
     {name: 'direction'},
     {name: 'booking_date',      type: 'date', dateFormat: Date.patterns.ISO8601Short},
     {name: 'amount'},
     {name: 'reason'}
   ];

   /**
    * @type {Tine.Tinebase.data.Record}
    * Contact record definition
    */
   Tine.Billing.Model.StockFlow = Tine.Tinebase.data.Record.create(Tine.Billing.Model.StockFlowArray, {
   	appName: 'Billing',
  	modelName: 'StockFlow',
  	idProperty: 'id',
  	recordName: 'Artikelbewegung',
  	recordsName: 'Artikelbewegungen',
  	containerProperty: null,
  	titleProperty: 'article_id'
   });

  Tine.Billing.Model.StockFlow.getDefaultData = function(){
  	return {};
  };
  
  Tine.Billing.Model.StockFlow.getDefaultDataInc = function(){
	  	return {
	  		direction: 'IN',
	  		booking_date: new Date(),
	  		amount: 1
	  	};
  };
	  
  Tine.Billing.Model.StockFlow.getDefaultDataDec = function(){
	  	return {
	  		direction: 'OUT',
	  		booking_date: new Date(),
	  		amount: 1
	  	};
  };
   
  Tine.Billing.Model.StockFlow.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };

  Tine.Billing.Model.ArticleCustomerArray = 
  [
     {name: 'id'}, 	// (pk)
     {name: 'article_id'}, 
     {name: 'debitor_id'},
     {name: 'vat_id'},
     {name: 'price_netto'},
     {name: 'price_brutto'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.ArticleCustomer = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleCustomerArray, {
   	appName: 'Billing',
  	modelName: 'ArticleCustomer',
  	idProperty: 'id',
  	recordName: 'Kunden-Artikeldaten',
  	recordsName: 'Kunden-Artikeldaten',
  	containerProperty: null,
  	titleProperty: 'name'
   });

  Tine.Billing.Model.ArticleCustomer.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.ArticleCustomer.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
      return [
              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };
  
  
  Tine.Billing.Model.ArticleSeriesArray = 
	  [
	     {name: 'id'}, 	// (pk)
	     {name: 'name'}, 
	     {name: 'description'},
	     {name: 'begin_date'},
	     {name: 'end_date'}
	   ];

	   /**
	   * @type {Tine.Tinebase.data.Record}
	   * Contact record definition
	   */
	   Tine.Billing.Model.ArticleSeries = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSeriesArray, {
	   	appName: 'Billing',
	  	modelName: 'ArticleSeries',
	  	idProperty: 'id',
	  	recordName: 'Artikelserie',
	  	recordsName: 'Artikelserien',
	  	containerProperty: null,
	  	titleProperty: 'name'
	   });

	  Tine.Billing.Model.ArticleSeries.getDefaultData = function(){
	  	return {};
	  };
	   
	  Tine.Billing.Model.ArticleSeries.getFilterModel = function() {
	      var app = Tine.Tinebase.appMgr.get('Billing');
	      return [
	              {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
	      ];
	  };
  
  // Job: container for customer orders (Order) and supplier orders (SupplyOrder)
  Tine.Billing.Model.JobArray = [
   {name: 'id'}, 	// (pk)
   {name: 'contact_id'},
   {name: 'job_nr'},
   {name: 'name'}, 
   {name: 'description'},
   {name: 'budget_amount'},
   {name: 'budget_unit_id'}, // fk: article_unit
   {name: 'finish_date'},
   {name: 'billing_state'},    
   {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'created_by',         type: 'int'                  },
   {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'last_modified_by',   type: 'int'                  },
   {name: 'is_deleted',         type: 'boolean'              },
   {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'deleted_by',         type: 'int'                  },
   {name: 'tags'},
   {name: 'notes'},
   {name: 'customfields'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.Job = Tine.Tinebase.data.Record.create(Tine.Billing.Model.JobArray, {
 	appName: 'Billing',
	modelName: 'Job',
	idProperty: 'id',
	recordName: 'Job',
	recordsName: 'Jobs',
	containerProperty: null,
	titleProperty: 'name'
 });

Tine.Billing.Model.Job.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.Job.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] },
            {app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
    ];
};
  
  // Order: customer order
  Tine.Billing.Model.OrderArray = [
   {name: 'id'}, 	// (pk)
   {name: 'debitor_id'},
   {name: 'job_id'},
   {name: 'price_group_id'}, 
   {name: 'account_id'},
   {name: 'payment_method_id'},
   {name: 'erp_context_id'},
   {name: 'order_nr'},    
   {name: 'cust_order_nr'},    
   {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'created_by',         type: 'int'                  },
   {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'last_modified_by',   type: 'int'                  },
   {name: 'is_deleted',         type: 'boolean'              },
   {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'deleted_by',         type: 'int'                  },
   {name: 'payment_until_date',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'confirm_date',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'confirm_state'},
   {name: 'delivery_state'},
   {name: 'bill_state'},
   {name: 'payment_state'},
   {name: 'op_netto'},
   {name: 'op_brutto'},
   {name: 'tags'},
   {name: 'notes'},
   {name: 'customfields'},
   {name: 'context'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.Order = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OrderArray, {
 	appName: 'Billing',
	modelName: 'Order',
	idProperty: 'id',
	recordName: 'Auftrag',
	recordsName: 'Aufträge',
	containerProperty: null,
	containerName: 'Auftrag',
	containersName: 'Aufträge',
	titleProperty: 'order_nr'
 });

Tine.Billing.Model.Order.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.Order.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },
            
            {app: app, filtertype: 'foreignrecord', label: 'Job', field: 'job_id', foreignRecordClass: Tine.Billing.Model.Job, ownField:'job_id'},
            {app: app, filtertype: 'foreignrecord', label: 'Kunde', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'},
             {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]}
    ];
};

// -->>>>>>>>>>>>>>>>>
// TODO HH: implement Abstract Factory pattern for concrete receipts!

Tine.Billing.Model.ReceiptArray = [
   {name: 'id'}, 	// (pk)
   {name: 'order_id'},
   {name: 'payment_method_id'},
   {name: 'payment_id'},
   {name: 'booking_id'},
   {name: 'donation_id'},
   {name: 'erp_context_id'},
   {name: 'type'},
   {name: 'calc_nr'}, 
   {name: 'bid_nr'},
   {name: 'confirm_nr'}, 
   {name: 'part_ship_nr'},
   {name: 'ship_nr'}, 
   {name: 'part_invoice_nr'},
   {name: 'invoice_nr'}, 
   {name: 'credit_nr'}, 
   {name: 'monition_nr'}, 
   {name: 'monition_fee'}, 
   {name: 'monition_level'}, 
   {name: 'discount_percentage'},
   {name: 'add_percentage'},
   {name: 'discount_total'}, 
   {name: 'bid_date'},
   {name: 'bid_shipping_date'}, 
   {name: 'confirm_shipping_date'},
   {name: 'order_in_date'}, 
   {name: 'order_confirm_date'},
   {name: 'shipping_date'}, 
   {name: 'invoice_date'},
   {name: 'fibu_exp_date'},
   {name: 'due_date'},
   {name: 'upper_textblock'}, 
   {name: 'lower_textblock'},
   {name: 'shipping_conditions'}, 
   {name: 'payment_conditions'},    
   {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'created_by'},
   {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'last_modified_by'},
   {name: 'is_deleted',         type: 'boolean'              },
   {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
   {name: 'deleted_by'},
   {name: 'tags'},
   {name: 'notes'},
   {name: 'customfields'},
   {name: 'template_id'},
   {name: 'print_date'},
   {name: 'preview_template_id'},
   {name: 'total_netto'},
   {name: 'total_brutto'},
   {name: 'open_sum'},
   {name: 'payed_sum'},
   {name: 'total_weight'},
   {name: 'pos_count'},
   {name: 'usage'},
   {name: 'payment_state'},
   {name: 'receipt_state'},
   {name: 'reversion_record_id'},
   {name: 'is_cancelled'},
   {name: 'is_cancellation'},
   {name: 'is_member'},
   {name: 'fee_group_id'},
   {name: 'period'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.Receipt = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ReceiptArray, {
 	appName: 'Billing',
	modelName: 'Receipt',
	idProperty: 'id',
	recordName: 'Beleg',
	recordsName: 'Belege',
	containerProperty: null,
	titleProperty: 'receipt_title',
	  relations:[{
			name: 'receipt_order',
			model: Tine.Billing.Model.Order,
			fkey: 'order_id',
			embedded:true,
			emissions:[
			    {dest: {
			    	name: 'order_nr'}, 
			    	source: function(order){
			    		if(typeof(contact) === 'object'){
			    			return contact.get('id');
			    		}else{
			    			return '';
			    		}
	    	}},{dest: {
		    	name: 'receipt_title'}, 
		    	source: function(order, receipt){
		    		//console.log('recnunge');
		    		//console.log(receipt);
		    		var type = receipt.get('type');
		    		var str = null;
		    		switch(type){
		    		case 'INVOICE':
		    			str = "# " + receipt.get('invoice_nr') + '  EUR ' + receipt.get('total_brutto');
		    			break;
		    		default: 
		    				str = receipt.get('id');
		    				break;
		    		}
		    		return str;
    	}}]
	  }]
 });

Tine.Billing.Model.Receipt.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.Receipt.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
        {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['contains'] },
        {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
        	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
        {label: app.i18n._('Rechnung-Nr'),  field: 'invoice_nr', operators: ['equals','startswith','endswith','greater','less']},
        {label: app.i18n._('Lieferschein-Nr'),  field: 'ship_nr', operators: ['equals','startswith','endswith','greater','less']},
        {label: app.i18n._('Angebot-Nr'),  field: 'bid_nr', operators: ['equals','startswith','endswith','greater','less']},
        {label: _('Gesamt-Betrag netto'),          field: 'total_netto',       operators: ['greater','less','equals']},
        {label: _('Gesamt-Betrag brutto'),          field: 'total_brutto',       operators: ['greater','less','equals']},
        {label: _('Betrag offen'),          field: 'open_sum',       operators: ['greater','less','equals']},
        {label: _('Betrag bezahlt'),          field: 'payed_sum',       operators: ['greater','less','equals']},
		{label: app.i18n._('Zahlungsstatus'),  field: 'payment_state',  valueType: 'combo', valueField:'id', displayField:'name', 
           	store:[['TOBEPAYED', 'unbezahlt'],['PARTLYPAYED','teilbezahlt'],['PAYED','bezahlt']]},
        {label: app.i18n._('Zahlungsmethode'),  field: 'payment_method_id',  valueType: 'combo', valueField:'id', displayField:'name',
              	store:Tine.Billing.getSimpleStore('PaymentMethod')},
        {label: app.i18n._('Rechnungs-Datum'),         field: 'invoice_date', valueType: 'date'},
        {label: app.i18n._('Liefer-Datum'),         field: 'shipping_date', valueType: 'date'},
        {label: _('Zeitpunkt Erfassung'),         field: 'creation_time', valueType: 'date'},
        {label: _('Zeitpunkt letzte Änderung'),         field: 'last_modified_time', valueType: 'date'},
        {label: _('Bearbeiter Erfassung'),   field: 'created_by',  valueType: 'user'},
        {label: _('Bearbeiter letzte Änderung'),   field: 'last_modified_by',  valueType: 'user'},
        {label: _('Nur meine'),   field: 'current_user_only',  valueType: 'bool'},
        {filtertype: 'tinebase.tag', app: app}
    ];
};
	 

Tine.Billing.Model.OrderPositionArray = [
   {name: 'id'}, 	// (pk)
   {name: 'order_id'},
   // virtual receipt id
   {name: 'receipt_id'},
   {name: 'article_id'},
   {name: 'price_group_id'}, 
   {name: 'unit_id'},
   {name: 'vat_id'}, 
   {name: 'position_nr'},
   {name: 'price_netto'}, 
   {name: 'price_brutto'}, 
   {name: 'price2_netto'}, 
   {name: 'price2_brutto'}, 
   {name: 'price2_vat_id'}, 
   {name: 'amount'},
   {name: 'invert_amount'},
   {name: 'factor'},
   {name: 'discount_percentage'}, 
   {name: 'discount_total'},
   {name: 'weight'}, 
   {name: 'name'},
   {name: 'description'}, 
   {name: 'comment'}, 
   {name: 'total_netto'},
   {name: 'total_brutto'}, 
   {name: 'total2_netto'},
   {name: 'total2_brutto'},
   {name: 'total1_netto'},
   {name: 'total1_brutto'},
   {name: 'total_weight'},
   {name: 'optional'},
   {name: 'add_percentage'}
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.OrderPosition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OrderPositionArray, {
 	appName: 'Billing',
	modelName: 'OrderPosition',
	idProperty: 'id',
	recordName: 'Auftragsposition',
	recordsName: 'Auftragspositionen',
	containerProperty: null,
	titleProperty: 'name',
	flatten: function(){
		if(typeof(this.data.vat_id) ==='object')
			this.set('vat_id',this.get('vat_id').id);
		if(typeof(this.data.price2_vat_id) ==='object')
			this.set('price2_vat_id',this.get('price2_vat_id').id);
		if(typeof(this.data.unit_id) ==='object')
			this.set('unit_id',this.get('unit_id').id);
		if(typeof(this.data.order_id)==='object')
			this.set('order_id',this.get('order_id').id);
		if(typeof(this.data.price_group_id)==='object')
			this.set('price_group_id',this.get('price_group_id').id);
//		if(typeof(this.data.article_id)==='object')
//			this.set('article_id',this.get('article_id').id);
		if(this.data.article_record){
			delete this.data.article_record;
		}
	},
	calculate: function(direction){
		if(!direction){
			direction = Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO;
		}
   		var vat = this.get('vat_id');
   		var vatValue;
   		if(vat === undefined){
   			vat = this.data.vat_id;
   		}
   		if(typeof(vat)!=='object'){
   			// get vat record from Store
   			var vatStore = Tine.Billing.getVatStore();
   			var vatIndex = vatStore.indexOfId(vat);
   			vat = vatStore.getAt(vatIndex);
   			//this.set('vat_id',vat);
   			
   			vatValue = parseFloat(vat.data.value,2);
   		}else{
   			if(vat.value !== undefined){
   				vatValue = parseFloat(vat.value,2);
   			}else if(vat.data !== undefined){
   				vatValue = parseFloat(vat.data.value,2);
   			}
   		}
   		
   		var vatCalc = 1+vatValue;
   		
   		var vat2 = this.get('price2_vat_id');
   		var vat2Value;
   		if(vat2 === undefined){
   			vat2 = this.data.price2_vat_id;
   		}
   		if(vat2){
	   		if(typeof(vat2)!=='object'){
	   			// get vat record from Store
	   			var vat2Store = Tine.Billing.getVatStore();
	   			var vat2Index = vat2Store.indexOfId(vat2);
	   			vat2 = vat2Store.getAt(vat2Index);
	   			//this.set('vat_id',vat);
	   			
	   			vat2Value = parseFloat(vat2.data.value,2);
	   		}else{
	   			if(vat2.value !== undefined){
	   				vat2Value = parseFloat(vat2.value,2);
	   			}else if(vat2.data !== undefined){
	   				vat2Value = parseFloat(vat2.data.value,2);
	   			}
	   		}
   		}else{
   			vat2Value = 0;
   		}
   		
   		var vat2Calc = 1+vat2Value;
   		
   		var amount = this.get('amount');
   		amount = (amount?amount:0);
   		var weight = this.get('weight');
   		weight = (weight?weight:0);
   		var price_netto = this.get('price_netto');
   		price_netto = (price_netto?price_netto:0);
   		
   		
   		
   		var price_brutto = this.get('price_brutto');
   		price_brutto = (price_brutto?price_brutto:0);
   		if(price_brutto == ''){
   			price_brutto = 0;
   		}
   		if(price_netto == ''){
   			price_netto= 0;
   		}
   		if(direction == Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO){
   			price_brutto = price_netto * vatCalc;
   			
   			//this.set('price_brutto', price_brutto);
   		}else{
   			price_netto = price_brutto/vatCalc;
   			//this.set('price_netto', price_netto);
   		}
   		this.data.price_brutto = price_brutto;
   		this.data.price_netto = price_netto;
   		
   		var price2_netto = this.get('price2_netto');
   		price2_netto = (price2_netto?price2_netto:0);
   		
   		var price2_brutto = this.get('price2_brutto');
   		price2_brutto = (price2_brutto?price2_brutto:0);
   		if(price2_brutto == ''){
   			price2_brutto = 0;
   		}
   		if(price2_netto == ''){
   			price2_netto= 0;
   		}
   		
   		
   		
   		if(direction == Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO){
   			price2_brutto = price2_netto * vat2Calc;
   			
   			//this.set('price_brutto', price_brutto);
   		}else{
   			price2_netto = price2_brutto/vat2Calc;
   			//this.set('price_netto', price_netto);
   		}
   		this.data.price2_brutto = price2_brutto;
   		this.data.price2_netto = price2_netto;
   		
   		
   		
   		var discPerc = this.get('discount_percentage');
   		discPerc = (discPerc?discPerc:0)/100;
   		var discTotal = this.get('discount_total');
   		discTotal = (discTotal?discTotal:0);
   		var totalWeight = weight * amount;
   		// calculate
   		var total1Netto = (price_netto * amount);
   		
   		discTotal = total1Netto * discPerc;
   		total1Netto -= discTotal;
   		
   		
   		var total1Brutto = total1Netto * vatCalc;
   		

   		
   		// price2
   		var total2Netto = (price2_netto * amount);
   		var addPerc = this.get('add_percentage');
   		addPerc = (addPerc?addPerc:0)/100;
   		total2Netto *= addPerc;
   		
   		
   		var total2Brutto = total2Netto * vat2Calc;

   		var totalNetto = total1Netto + total2Netto;
   		var totalBrutto = total1Brutto + total2Brutto;
   		  		
   		this.data.total_netto = totalNetto;
   		this.data.total_brutto = totalBrutto;
   		
   		this.data.total1_netto = total1Netto;
   		this.data.total1_brutto = total1Brutto;
   		
   		this.data.total2_netto = total2Netto;
   		this.data.total2_brutto = total2Brutto;
   		
   		this.data.discount_total = discTotal;
   		this.data.total_weight = totalWeight;
   		this.data.discount_percentage = discPerc * 100;
   		if(this.modified){
	   		this.modified.price_brutto = price_brutto;
	   		this.modified.price_netto = price_netto;
	   		this.modified.total_netto = totalNetto;
	   		this.modified.total_brutto = totalBrutto;
	   		
	   		this.modified.price2_brutto = price2_brutto;
	   		this.modified.price2_netto = price2_netto;
	   		this.modified.total1_netto = total1Netto;
	   		this.modified.total1_brutto = total1Brutto;
	   		this.modified.total2_netto = total2Netto;
	   		this.modified.total2_brutto = total2Brutto;
	   		
	   		this.modified.discount_total = discTotal;
	   		this.modified.total_weight = totalWeight;
	   		this.modified.discount_percentage = discPerc * 100;
	   		this.dirty = true;
   		}
   	}
 });

Tine.Billing.Model.OrderPosition.getFromArticle = function(article){
	return new Tine.Billing.Model.OrderPosition({
		article_id: article,
		vat_id: article.get('vat_id'),
		unit_id: article.get('article_unit_id'),
		name: article.get('name'),
		amount: 1,
		description: article.get('description'),
		weight: (article.get('weight')?article.get('weight'):0)
	},0);
};

Tine.Billing.Model.OrderPosition.setNewArticle = function(OrderPosition, newArticle){
	OrderPosition.set('article_id', newArticle);
	OrderPosition.set('vat_id', newArticle.get('vat_id'));
	OrderPosition.set('unit_id', newArticle.get('article_unit_id'));
	OrderPosition.set('name', newArticle.get('name'));
	OrderPosition.set('name', newArticle.get('name'));
	OrderPosition.set('weight',(newArticle.get('weight')?newArticle.get('weight'):0));
};

 
Tine.Billing.Model.OrderPosition.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.OrderPosition.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
    ];
};

//Tine.Billing.Model.ReceiptPosition = Ext.extend( Tine.Billing.Model.OrderPosition, {
// 	appName: 'Billing',
//	idProperty: 'id',
//	modelName: 'ReceiptPosition',
//	recordName: 'Belegposition',
//	recordsName: 'Belegpositionen',
//	containerProperty: null,
//	titleProperty: 'name'
//});

Tine.Billing.Model.OpenItemArray = [
    {name: 'id'}, 	// (pk)
    {name: 'order_id'},
    {name: 'op_nr'},
    {name: 'receipt_id'},
    {name: 'debitor_id'},
    // -> contact_id: level2 foreign record filter phantom
    {name: 'contact_id'},
    // <--
    {name: 'payment_id'},
	
	//joinfields of payment:
	{name: 'payment_date'},
    
	//<--
    {name: 'booking_id'},
    {name: 'donation_id'},
    {name: 'payment_method_id'},
    {name: 'receipt_date'}, 
    {name: 'receipt_nr'}, 
    {name: 'type'},
    {name: 'due_date'},
    {name: 'fibu_exp_date'}, 
    {name: 'total_netto'},
    {name: 'total_brutto'},
    {name: 'open_sum'},
    {name: 'payed_sum'},
    {name: 'erp_context_id'},
    {name: 'banking_exp_date'}, 
    {name: 'state'}, 
    {name: 'usage'},
    {name: 'reversion_record_id'},
    {name: 'is_cancelled'},
    {name: 'is_cancellation'},
    {name: 'due_days'},
    {name: 'monition_stage'}
  ];

  /**
  * @type {Tine.Tinebase.data.Record}
  * Contact record definition
  */
  Tine.Billing.Model.OpenItem = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OpenItemArray, {
  	appName: 'Billing',
 	modelName: 'OpenItem',
 	idProperty: 'id',
 	recordName: 'Offener Posten',
 	recordsName: 'Offene Posten',
 	containerProperty: null,
 	titleProperty: 'name'
  });

 Tine.Billing.Model.OpenItem.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.OpenItem.getFilterModel = function(withoutDebitor) {
     var app = Tine.Tinebase.appMgr.get('Billing');
     var aResult =  [
             {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['contains'] },
             {label: app.i18n._('Status'),  field: 'state',  valueType: 'combo', valueField:'id', displayField:'name', 
                	store:[['OPEN', 'offen'],['PARTLYOPEN', 'teilw.offen'],['DONE','erledigt/bezahlt']]},
        	 {label: app.i18n._('Typ'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name', 
            	store:[['DEBIT', 'Belastung'],['CREDIT','Gutschrift']]},
             
             {label: _('Gesamt-Betrag netto'),          field: 'total_netto',       operators: ['greater','less','equals']},
             {label: _('Gesamt-Betrag brutto'),          field: 'total_brutto',       operators: ['greater','less','equals']},
             {label: _('Betrag offen'),          field: 'open_sum',       operators: ['greater','less','equals']},
             {label: _('Betrag bezahlt'),          field: 'payed_sum',       operators: ['greater','less','equals']},
             {label: _('Tage fällig'),          field: 'due_days',       operators: ['greater','less','equals']},
                	
             {label: app.i18n._('Zahlungsmethode'),  field: 'payment_method_id',  valueType: 'combo', valueField:'id', displayField:'name',
                  	store:Tine.Billing.getSimpleStore('PaymentMethod')},
             
             {label: _('Belegdatum'),         field: 'receipt_date', valueType: 'date', pastOnly: true},
             {label: _('Fälligkeitsdatum'),         field: 'due_date', valueType: 'date'},
             {label: _('Zahlungsdatum'),         field: 'payment_date', valueType: 'date'},
             
			 {label: _('Datum Fibu Exp.'),         field: 'fibu_exp_date', valueType: 'date', pastOnly: true},
             {label: _('Datum Bank Exp.'),         field: 'banking_exp_date', valueType: 'date', pastOnly: true},
             {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
             	{app: app, filtertype: 'foreignrecord', label: 'Beleg', field: 'receipt_id', foreignRecordClass: Tine.Billing.Model.Receipt, ownField:'receipt_id'},
             	{app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'contact_id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
                
     ];
     
     if(!withoutDebitor){
		   return aResult.concat([{app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}]);
	   }else{
		   return aResult;
	   }
 };

 
 Tine.Billing.Model.OpenItem.getDebitExportFilterModel = function() {
     var app = Tine.Tinebase.appMgr.get('Billing');
     return [
             {label: _('Fälligkeitsdatum'),         field: 'due_date', valueType: 'date'},
             {label: _('Tage fällig'),          field: 'due_days',       operators: ['greater','less','equals']},
             
             //{label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             //  	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
             	{app: app, filtertype: 'foreignrecord', label: 'Beleg', field: 'receipt_id', foreignRecordClass: Tine.Billing.Model.Receipt, ownField:'receipt_id'},
             	{app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'contact_id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
     ];
 };
 
 Tine.Billing.Model.OpenItemMonitionArray = [
     {name: 'id'}, 	// (pk)
     {name: 'erp_context_id'},
     {name: 'monition_receipt_id'},
     {name: 'open_item_id'},
     {name: 'debitor_id'},
     {name: 'due_date'},
     {name: 'monition_date'},
     {name: 'monition_stage'},
     {name: 'monition_fee'},
     {name: 'open_sum'},
     {name: 'total_sum'}
   ];

/**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
Tine.Billing.Model.OpenItemMonition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OpenItemMonitionArray, {
   	appName: 'Billing',
  	modelName: 'OpenItemMonition',
  	idProperty: 'id',
  	recordName: 'Mahn OP',
  	recordsName: 'Mahn OPs',
  	containerProperty: null,
  	titleProperty: 'name'
});

Tine.Billing.Model.OpenItemMonition.getDefaultData = function(){
	return {};
};
   
Tine.Billing.Model.OpenItemMonition.getFilterModel = function(withoutDebitor) {
   var app = Tine.Tinebase.appMgr.get('Billing');
   var aResult =  [
      {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['contains'] },
      {label: _('Betrag offen'),          field: 'open_sum',       operators: ['greater','less','equals']},
      {label: _('Tage fällig'),          field: 'due_days',       operators: ['greater','less','equals']},
      //{label: _('Belegdatum'),         field: 'receipt_date', valueType: 'date', pastOnly: true},
      {label: _('Fälligkeitsdatum'),         field: 'due_date', valueType: 'date'},
      {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
      	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]}
             
    ];
   return aResult;
};
 
 
 Tine.Billing.Model.OpenItemPaymentArray = [
     {name: 'id'}, 	// (pk)
     {name: 'order_id'},
     {name: 'op_nr'},
     {name: 'receipt_id'},
     {name: 'debitor_id'},
     {name: 'payment_method_id'},
     {name: 'receipt_date'}, 
     {name: 'receipt_nr'}, 
     {name: 'type'},
     {name: 'due_date'},
     {name: 'fibu_exp_date'}, 
     {name: 'total_netto'},
     {name: 'total_brutto'},
     {name: 'proposal_payment_amount'},
     {name: 'payment_amount'},
     {name: 'state'}, 
     {name: 'usage'}
   ];

   /**
   * @type {Tine.Tinebase.data.Record}
   * Contact record definition
   */
   Tine.Billing.Model.OpenItemPayment = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OpenItemPaymentArray, {
   	appName: 'Billing',
  	modelName: 'OpenItemPayment',
  	idProperty: 'id',
  	recordName: 'Offener Posten',
  	recordsName: 'Offene Posten',
  	containerProperty: null,
  	titleProperty: 'name'
   });
   
Tine.Billing.Model.MT940PaymentArray = [
  {name: 'id'}, 	// (pk)
  {name: 'erp_context_id'},
  {name: 'op_nr'},
  {name: 'op_id'},
  {name: 'debitor_id'},
  {name: 'return_debit_base_payment_id'}, 
  {name: 'type'},
  {name: 'due_date'},
  {name: 'payment_date'}, 
  {name: 'op_amount'},
  {name: 'payment_amount'},
  {name: 'overpay_amount'},
  {name: 'state'}, 
  {name: 'usage'}, 
  {name: 'usage_payment'}, 
  {name: 'overpay'}, 
  {name: 'account_system_id'}, 
  {name: 'account_system_id_haben'}, 
  {name: 'multiple_ops'}, 
  {name: 'additional_data'},
  {name: 'return_inquiry_fee'},
  {name: 'is_return_debit'},
  {name: 'print_inquiry'},
  {name: 'set_accounts_banktransfer'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.MT940Payment = Tine.Tinebase.data.Record.create(Tine.Billing.Model.MT940PaymentArray, {
	appName: 'Billing',
	modelName: 'MT940Payment',
	idProperty: 'id',
	recordName: 'Bankdatei Zahlung',
	recordsName: 'Bankdatei Zahlung',
	containerProperty: null,
	//titleProperty: 'payment_amount',
 	useTitleMethod:true,
 	getTitle: function(){
 		var debitor = this.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
 		return this.get('id') + ' ' + this.get('payment_date') + ' EUR:' + this.get('payment_amount') + (debitor?' DEB:' + debitor.getTitle():'');
 	}
});



Tine.Billing.Model.MT940Payment.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.MT940Payment.getFilterModel = function() {
     var app = Tine.Tinebase.appMgr.get('Billing');
     return [
             {label: app.i18n._('Status'),  field: 'state',  valueType: 'combo', valueField:'id', displayField:'name', 
                	store:[['GREEN', 'grün'],['ORANGE','orange'],['RED','rot']]},
        	 {label: app.i18n._('Typ'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name', 
            	store:[['DEBIT', 'Eingang'],['CREDIT','Ausgang']]},
             {label: _('Zahlungsdatum'),         field: 'payment_date', valueType: 'date', pastOnly: true},
             {label: _('Fälligkeitsdatum'),         field: 'due_date', valueType: 'date'},
             {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
             	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]}
     ];
 };
 
 Tine.Billing.Model.MT940ImportJob = Tine.Tinebase.data.Record.create
 ([
   {name: 'files'                  },
   //{name: 'import_definition_id'   },
   //{name: 'model'                  },
   {name: 'import_function'        },
   //{name: 'container_id'           },
   //{name: 'dry_run'                },
   //{name: 'options'                }
], {
   appName: 'Billing',
   modelName: 'Import',
   idProperty: 'id',
   titleProperty: 'model',
   // ngettext('Import', 'Imports', n); gettext('Import');
   recordName: 'Import',
   recordsName: 'Imports',
   containerProperty: null
});
 
 Tine.Billing.Model.PaymentArray = [
    {name: 'id'}, 	// (pk)
    {name: 'debitor_id'},
    {name: 'order_id'},
    {name: 'erp_context_id'},
    {name: 'receipt_id'},
    {name: 'open_item_id'}, 
    {name: 'batch_job_dta_id'}, 
    {name: 'return_debit_base_payment_id'}, 
    {name: 'payment_type'},
    {name: 'type'},  // CREDIT/DEBIT
    {name: 'payment_date'},
    {name: 'amount'}, 
    {name: 'usage'},
    {name: 'account_system_id'},
    {name: 'account_system_id_haben'},
    {name: 'booking_id'},
    {name: 'donation_id'},
    {name: 'account_booking_id'},
    {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
    {name: 'created_by',         type: 'int'                  },
    {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
    {name: 'last_modified_by',   type: 'int'                  },
    {name: 'is_deleted',         type: 'boolean'              },
    {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
    {name: 'deleted_by',         type: 'int'                  },
    {name: 'reversion_record_id'},
    {name: 'is_cancelled'},
    {name: 'is_cancellation'},
    {name: 'return_inquiry_fee'},
    {name: 'inquiry_print_date'},
    {name: 'is_return_debit'},
    {name: 'print_inquiry'},
    {name: 'set_accounts_banktransfer'}
  ];

  /**
  * @type {Tine.Tinebase.data.Record}
  * Contact record definition
  */
  Tine.Billing.Model.Payment = Tine.Tinebase.data.Record.create(Tine.Billing.Model.PaymentArray, {
  	appName: 'Billing',
 	modelName: 'Payment',
 	idProperty: 'id',
 	recordName: 'Zahlung',
 	recordsName: 'Zahlungen',
 	containerProperty: null,
 	//titleProperty: 'amount',
 	useTitleMethod:true,
	getAmount: function(){
		return this.get('amount');
	},
	getAmountFormatted: function(){
		var type = this.get('type');
		var amount = this.get('amount');
		switch(type){
			case 'DEBIT': 
				break;
			case 'CREDIT':
				amount *=(-1);
				break;
		}
		return amount;
	},
 	getTitle: function(){
 		var debitor = this.getForeignRecord(Tine.Billing.Model.Debitor, 'debitor_id');
 		
 		return this.get('id') + ' ' + this.get('payment_date') + ' EUR:' + this.getAmountFormatted() + (debitor?' DEB:' + debitor.getTitle():'');
 	}
  });

 Tine.Billing.Model.Payment.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.Payment.getFilterModel = function(withoutDebitor) {
     var app = Tine.Tinebase.appMgr.get('Billing');
     var aResult =  [
             {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] },
             {label: app.i18n._('Zahlungsmethode'),  field: 'payment_method_id',  valueType: 'combo', valueField:'id', displayField:'name',
               	store:Tine.Billing.getSimpleStore('PaymentMethod')},
             {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
              	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
             {label: app.i18n._('Typ'),  field: 'type',  valueType: 'combo', valueField:'id', displayField:'name', 
               	store:[['CREDIT', 'Ausgang'],['DEBIT','Eingang']]},
             {label: _('Zahlungsdatum'),         field: 'payment_date', valueType: 'date', pastOnly: true},
             {label: _('Dat.Druck Rück-LS-Nachforsch.'),         field: 'inquiry_print_date', valueType: 'date', pastOnly: true},
             {label: _('Betrag'),          field: 'amount',     defaultOperator:'equals',  operators: ['greater','less','equals']},
             {label: _('Nachforsch. drucken'),   field: 'print_inquiry',  valueType: 'bool'},
             {label: _('ist Rück-LS'),   field: 'is_return_debit',  valueType: 'bool'},
             {label: _('Rück-LS -> Auf Überweis.setz.'),   field: 'set_accounts_banktransfer',  valueType: 'bool'}
                
     ];
     
     if(!withoutDebitor){
		   return aResult.concat([{app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}]);
	   }else{
		   return aResult;
	   }
 };
 
 Tine.Billing.Model.ProductionCostArray = [
    {name: 'id'}, 	// (pk)
    {name: 'receipt_position_id'},
    {name: 'supply_receipt_position_id'},
    {name: 'type'},
    {name: 'creditor_id'},
    {name: 'ek_netto'}, 
    {name: 'category'}
  ];

  /**
  * @type {Tine.Tinebase.data.Record}
  * Contact record definition
  */
  Tine.Billing.Model.ProductionCost = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ProductionCostArray, {
  	appName: 'Billing',
 	modelName: 'ProductionCost',
 	idProperty: 'id',
 	recordName: 'Herstellkosten',
 	recordsName: 'Herstellkosten',
 	containerProperty: null,
 	titleProperty: 'name'
  });

 Tine.Billing.Model.ProductionCost.getDefaultData = function(){
 	return {};
 };
  
 Tine.Billing.Model.ProductionCost.getFilterModel = function() {
     var app = Tine.Tinebase.appMgr.get('Billing');
     return [
             {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
     ];
 }; 
 
 Tine.Billing.Model.SupplyOrderArray = [
  {name: 'id'}, 	// (pk)
  {name: 'creditor_id'},
  {name: 'job_id'},
  {name: 'account_id'},
  {name: 'supply_order_nr'}, 
  {name: 'supplier_order_nr'},    
  {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
  {name: 'created_by',         type: 'int'                  },
  {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
  {name: 'last_modified_by',   type: 'int'                  },
  {name: 'is_deleted',         type: 'boolean'              },
  {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
  {name: 'deleted_by',         type: 'int'                  },
  {name: 'tags'},
  {name: 'notes'},
  {name: 'customfields'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.SupplyOrder = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SupplyOrderArray, {
	appName: 'Billing',
	modelName: 'SupplyOrder',
	idProperty: 'id',
	recordName: 'Lieferauftrag',
	recordsName: 'Lieferaufträge',
	containerProperty: null,
	titleProperty: 'id'
});

Tine.Billing.Model.SupplyOrder.getDefaultData = function(){
	return {};
};
    
   Tine.Billing.Model.SupplyOrder.getFilterModel = function() {
       var app = Tine.Tinebase.appMgr.get('Billing');
   return [
           {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] },
           {app: app, filtertype: 'foreignrecord', label: 'Job', field: 'id', foreignRecordClass: Tine.Billing.Model.Job, ownField:'job_id'},
           {app: app, filtertype: 'foreignrecord', label: 'Lieferant', field: 'id', foreignRecordClass: Tine.Billing.Model.Creditor, ownField:'creditor_id'}
       ];
   };
   
   Tine.Billing.Model.SupplyReceiptArray = [
      {name: 'id'}, 	// (pk)
      {name: 'supply_order_id'},
      {name: 'type'},
      {name: 'order_nr'}, 
      {name: 'supplier_order_nr'},
      {name: 'supply_request_nr'}, 
      {name: 'supply_offer_nr'},
      {name: 'supply_order_nr'}, 
      {name: 'supply_inc_inv_nr'},
      {name: 'discount_percentage'}, 
      {name: 'discount_total'},
      {name: 'request_date'}, 
      {name: 'offer_date'},
      {name: 'offer_shipping_date'}, 
      {name: 'order_shipping_date'},
      {name: 'shipping_date'}, 
      {name: 'order_confirm_date'},
      {name: 'order_date'}, 
      {name: 'inc_invoice_date'},
      {name: 'inc_invoice_postal_date'},
      {name: 'upper_textblock'}, 
      {name: 'lower_textblock'},
      {name: 'shipping_conditions'}, 
      {name: 'payment_conditions'},
      {name: 'shipping_address'},
      {name: 'order_state'},    
      {name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
      {name: 'created_by',         type: 'int'                  },
      {name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
      {name: 'last_modified_by',   type: 'int'                  },
      {name: 'is_deleted',         type: 'boolean'              },
      {name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
      {name: 'deleted_by',         type: 'int'                  },
      {name: 'tags'},
      {name: 'notes'},
      {name: 'customfields'},
      {name: 'template_id'},
      {name: 'preview_template_id'}
    ];

    /**
    * @type {Tine.Tinebase.data.Record}
    * Contact record definition
    */
    Tine.Billing.Model.SupplyReceipt = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SupplyReceiptArray, {
    	appName: 'Billing',
   	modelName: 'SupplyReceipt',
   	idProperty: 'id',
   	recordName: 'Beleg',
   	recordsName: 'Belege',
   	containerProperty: null,
   	titleProperty: 'order_id',
   	  relations:[{
   			name: 'receipt_order',
   			model: Tine.Billing.Model.SupplyOrder,
   			fkey: 'order_id',
   			embedded:true,
   			emissions:[
   			    {dest: {
   			    	name: 'supply_order_nr'}, 
   			    	source: function(order){
   			    		if(typeof(contact) === 'object'){
   			    			return contact.get('id');
   			    		}else{
   			    			return '';
   			    		}
   			    	}}]
   	  }]
    });

   Tine.Billing.Model.SupplyReceipt.getDefaultData = function(){
   	return {};
   };
    
   Tine.Billing.Model.SupplyReceipt.getFilterModel = function() {
       var app = Tine.Tinebase.appMgr.get('Billing');
       return [
           {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] },
           {app: app, filtertype: 'foreignrecord', label: 'Lieferauftrag', field: 'id', foreignRecordClass: Tine.Billing.Model.SupplyOrder, ownField:'supply_order_id'}
       ];
   };

   Tine.Billing.Model.SupplyOrderPositionArray = [
      {name: 'id'}, 	// (pk)
      {name: 'supply_receipt_id'},
      {name: 'article_id'},
      {name: 'unit_id'},
      {name: 'vat_id'}, 
      {name: 'position_nr'},
      {name: 'price_netto'}, 
      {name: 'amount'},
      {name: 'discount_percentage'}, 
      {name: 'discount_total'},
      {name: 'weight'}, 
      {name: 'name'},
      {name: 'description'}, 
      {name: 'total_netto'},
      {name: 'total_brutto'}, 
      {name: 'total_weight'},
      {name: 'optional'}
    ];

    /**
    * @type {Tine.Tinebase.data.Record}
    * Contact record definition
    */
    Tine.Billing.Model.SupplyOrderPosition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SupplyOrderPositionArray, {
    	appName: 'Billing',
   	modelName: 'SupplyOrderPosition',
   	idProperty: 'id',
   	recordName: 'Position Lieferauftrag',
   	recordsName: 'Positionen Lieferauftrag',
   	containerProperty: null,
   	titleProperty: 'name',
   	calculate: function(){
   		var vat = this.get('vat_id');
   		if(typeof(vat)!=='object'){
   			// get vat record from Store
   			var vatStore = Tine.Billing.getVatStore();
   			var vatIndex = vatStore.indexOfId(vat);
   			vat = vatStore.getAt(vatIndex);
   			//this.set('vat_id',vat);
   			vat = parseFloat(vat.data.value,2);
   		}else{
   			try{
   				vat = parseFloat(vat['value'],2);
   			}catch(e){
   				vat = parseFloat(vat.data.value,2);
   			}
   		}
   		
   		var vatCalc = 1+vat;
   		var amount = this.get('amount');
   		amount = (amount?amount:0);
   		var weight = this.get('weight');
   		weight = (weight?weight:0);
   		var price_netto = this.get('price_netto');
   		price_netto = (price_netto?price_netto:0);
   		var discPerc = this.get('discount_percentage');
   		discPerc = (discPerc?discPerc:0)/100;
   		var discTotal = this.get('discount_total');
   		discTotal = (discTotal?discTotal:0);
   		var totalWeight = weight * amount;
   		// calculate
   		var totalNetto = (price_netto * amount);
   		discTotal = totalNetto * discPerc;
   		totalNetto -= discTotal;
   		
   		var totalBrutto = totalNetto * vatCalc;

   		this.set('total_netto',totalNetto);
   		this.set('total_brutto',totalBrutto);
   		//this.set('discount_percentage',discPerc);
   		this.set('discount_total',discTotal);
   		this.set('total_weight',totalWeight);
   	}
    });

   Tine.Billing.Model.SupplyOrderPosition.getFromArticle = function(article){
   	return new Tine.Billing.Model.SupplyOrderPosition({
   		article_id: article,
   		vat_id: article.get('vat_id'),
   		unit_id: article.get('article_unit_id'),
   		name: article.get('name'),
   		amount: 1,
   		description: article.get('description'),
   		weight: (article.get('weight')?article.get('weight'):0)
   	},0);
  };
  
  Tine.Billing.Model.SupplyOrderPosition.getDefaultData = function(){
   	return {};
   };
	    
   Tine.Billing.Model.SupplyOrderPosition.getFilterModel = function() {
       var app = Tine.Tinebase.appMgr.get('Billing');
   return [
           {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
       ];
   };
  
   
Tine.Billing.Model.QuickOrderPositionArray = [
  {name: 'pos_nr'},    
  {name: 'comment'},
  {name: 'article_id'},
  {name: 'amount'},
  {name: 'vat_id'},
  {name: 'discount_percentage'},
  {name: 'add_percentage'},
  {name: 'price_group_id'},
  {name: 'total_netto'},
  {name: 'total_brutto'},
  {name: 'article_record'}
];
Tine.Billing.Model.QuickOrderPosition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.QuickOrderPositionArray, {
	appName: 'Billing',
	modelName: 'QuickOrderPosition',
	idProperty: 'pos_nr',
	recordName: 'Position',
	recordsName: 'Positionen',
	containerProperty: null,
	titleProperty: 'article_nr',
	calculate: function(direction){
		if(!direction){
			direction = Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO;
		}
   		var vat = this.get('vat_id');
   		var vatValue;
   		if(vat === undefined){
   			vat = this.data.vat_id;
   		}
   		if(typeof(vat)!=='object'){
   			// get vat record from Store
   			var vatStore = Tine.Billing.getVatStore();
   			var vatIndex = vatStore.indexOfId(vat);
   			vat = vatStore.getAt(vatIndex);
   			//this.set('vat_id',vat);
   			
   			vatValue = parseFloat(vat.data.value,2);
   		}else{
   			if(vat.value !== undefined){
   				vatValue = parseFloat(vat.value,2);
   			}else if(vat.data !== undefined){
   				vatValue = parseFloat(vat.data.value,2);
   			}
   		}
   		
   		var vatCalc = 1+vatValue;
   		
   		var vat2 = this.get('price2_vat_id');
   		var vat2Value;
   		if(vat2 === undefined){
   			vat2 = this.data.price2_vat_id;
   		}
   		if(vat2){
	   		if(typeof(vat2)!=='object'){
	   			// get vat record from Store
	   			var vat2Store = Tine.Billing.getVatStore();
	   			var vat2Index = vat2Store.indexOfId(vat2);
	   			vat2 = vat2Store.getAt(vat2Index);
	   			//this.set('vat_id',vat);
	   			
	   			vat2Value = parseFloat(va2t.data.value,2);
	   		}else{
	   			if(vat2.value !== undefined){
	   				vat2Value = parseFloat(vat2.value,2);
	   			}else if(vat2.data !== undefined){
	   				vat2Value = parseFloat(vat2.data.value,2);
	   			}
	   		}
   		}else{
   			vat2Value = 0;
   		}
   		
   		var vat2Calc = 1+vat2Value;
   		
   		
   		var amount = this.get('amount');
   		amount = (amount?amount:0);
   		var weight = this.get('weight');
   		weight = (weight?weight:0);
   		var price_netto = this.get('price_netto');
   		price_netto = (price_netto?price_netto:0);
   		var price_brutto = this.get('price_brutto');
   		price_brutto = (price_brutto?price_brutto:0);
   		
   		if(direction == Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO){
   			price_brutto = price_netto * vatCalc;
   			this.set('price_brutto', price_brutto);
   		}else{
   			price_netto = price_brutto/vatCalc;
   			this.set('price_netto', price_netto);
   		}
   		var discPerc = this.get('discount_percentage');
   		discPerc = (discPerc?discPerc:0)/100;
   		var discTotal = this.get('discount_total');
   		discTotal = (discTotal?discTotal:0);
   		var totalWeight = weight * amount;
   		// calculate
   		var total1Netto = (price_netto * amount);
   		discTotal = total1Netto * discPerc;
   		total1Netto -= discTotal;
   		
   		var total1Brutto = total1Netto * vatCalc;

   		
   		var price2_netto = this.get('price2_netto');
   		price2_netto = (price2_netto?price2_netto:0);
   		var price2_brutto = this.get('price2_brutto');
   		price2_brutto = (price2_brutto?price2_brutto:0);
   		if(price2_brutto == ''){
   			price2_brutto = 0;
   		}
   		if(price2_netto == ''){
   			price2_netto= 0;
   		}
   		
   		
   		if(direction == Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO){
   			price2_brutto = price2_netto * vat2Calc;
   			
   			//this.set('price_brutto', price_brutto);
   		}else{
   			price2_netto = price2_brutto/vat2Calc;
   			//this.set('price_netto', price_netto);
   		}
   		var total2Netto = (price2_netto * amount);
   		var addPerc = this.get('add_percentage');
   		addPerc = (addPerc?addPerc:0)/100;
   		total2Netto *= addPerc;
   		
   		var total2Brutto = total2Netto * vat2Calc;
   		
   		
   		var totalNetto = total1Netto + total2Netto;
   		var totalBrutto = total1Brutto + total2Brutto;
   		
   		this.set('total_netto',totalNetto);
   		this.set('total_brutto',totalBrutto);
   		this.set('total1_netto',total2Netto);
   		this.set('total1_brutto',total2Brutto);
   		this.set('total2_netto',total2Netto);
   		this.set('total2_brutto',total2Brutto);
   		//this.set('discount_percentage',discPerc);
   		this.set('discount_total',discTotal);
   		this.set('total_weight',totalWeight);
   	}
});

Tine.Billing.Model.QuickOrderPosition.getDefaultData = function(){
	return {
		article_id:null,
		amount:1
	};
};

Tine.Billing.Model.QuickOrderArray = [
  {name: 'id'},
  {name: 'with_shipping_doc'},                
  {name: 'contact_id'},
  {name: 'debitor_id'}
];
Tine.Billing.Model.QuickOrder = Tine.Tinebase.data.Record.create(Tine.Billing.Model.QuickOrderArray, {
	appName: 'Billing',
	modelName: 'QuickOrder',
	idProperty: 'id',
	recordName: 'Schnellauftrag',
	recordsName: 'Schnellaufträge',
	containerProperty: null,
	titleProperty: 'id'
});

Tine.Billing.Model.QuickOrder.getDefaultData = function(){
	return {
		with_shipping_doc:0
	};
};



// OrderTemplate: customer order
Tine.Billing.Model.OrderTemplateArray = [
    {name: 'id'}, 	// (pk)
 	{name: 'debitor_id'},
 	{name: 'job_id'},
 	{name: 'price_group_id'}, 
	{name: 'account_id'},
 	{name: 'name'}, 
	{name: 'description'}, 
	{name: 'with_calculation'}, 
	{name: 'width_bid'}, 
	{name: 'with_confirm'}, 
	{name: 'with_ship_doc'}, 
	{name: 'with_invoice'}, 
  
	{name: 'creation_time',      type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'created_by',         type: 'int'                  },
	{name: 'last_modified_time', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'last_modified_by',   type: 'int'                  },
	{name: 'is_deleted',         type: 'boolean'              },
	{name: 'deleted_time',       type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'deleted_by',         type: 'int'                  },
	{name: 'tags'},
	{name: 'notes'},
	{name: 'customfields'}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.OrderTemplate = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OrderTemplateArray, {
	appName: 'Billing',
	modelName: 'OrderTemplate',
	idProperty: 'id',
	recordName: 'Auftragsvorlage',
	recordsName: 'Auftragsvorlagen',
	containerProperty: null,
	titleProperty: 'name'
});

Tine.Billing.Model.OrderTemplate.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.OrderTemplate.getFilterModel = function() {
  var app = Tine.Tinebase.appMgr.get('Billing');
  return [
          {label: app.i18n._('Quicksearch'),  field: 'query',       operators: ['contains'] },
          
          {app: app, filtertype: 'foreignrecord', label: 'Job', field: 'id', foreignRecordClass: Tine.Billing.Model.Job, ownField:'job_id'},
          {app: app, filtertype: 'foreignrecord', label: 'Kunde', field: 'id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}
  ];
};

Tine.Billing.Model.OrderTemplatePositionArray = [
 {name: 'id'}, 	// (pk)
 {name: 'receipt_id'},
 {name: 'article_id'},
 {name: 'price_group_id'}, 
 {name: 'unit_id'},
 {name: 'vat_id'}, 
 {name: 'position_nr'},
 {name: 'price_netto'}, 
 {name: 'price_brutto'}, 
 {name: 'amount'},
 {name: 'factor'},
 {name: 'discount_percentage'}, 
 {name: 'discount_total'},
 {name: 'weight'}, 
 {name: 'name'},
 {name: 'description'}, 
 {name: 'total_netto'},
 {name: 'total_brutto'}, 
 {name: 'total_weight'},
 {name: 'optional'},
 {name: 'additional_data'},
 {name: 'active'},
 {name: 'single_usage'}
];

/**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
Tine.Billing.Model.OrderTemplatePosition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.OrderTemplatePositionArray, {
   	appName: 'Billing',
	modelName: 'OrderTemplatePosition',
	idProperty: 'id',
	recordName: 'Vorlagenposition',
	recordsName: 'Vorlagenpositionen',
	containerProperty: null,
	titleProperty: 'name',
	flatten: function(){
		if(typeof(this.data.vat_id) ==='object')
			this.set('vat_id',this.get('vat_id').id);
		if(typeof(this.data.unit_id) ==='object')
			this.set('unit_id',this.get('unit_id').id);
//		if(typeof(this.data.order_id)==='object')
//			this.set('order_id',this.get('order_id').id);
		if(typeof(this.data.price_group_id)==='object')
			this.set('price_group_id',this.get('price_group_id').id);
//		if(typeof(this.data.article_id)==='object')
//			this.set('article_id',this.get('article_id').id);
		if(this.data.article_record){
			delete this.data.article_record;
		}
	},
	calculate: function(direction){
		if(!direction){
			direction = Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO;
		}
   		var vat = this.get('vat_id');
   		var vatValue;
   		if(vat === undefined){
   			vat = this.data.vat_id;
   		}
   		if(typeof(vat)!=='object'){
   			// get vat record from Store
   			var vatStore = Tine.Billing.getVatStore();
   			var vatIndex = vatStore.indexOfId(vat);
   			vat = vatStore.getAt(vatIndex);
   			//this.set('vat_id',vat);
   			
   			vatValue = parseFloat(vat.data.value,2);
   		}else{
   			if(vat.value !== undefined){
   				vatValue = parseFloat(vat.value,2);
   			}else if(vat.data !== undefined){
   				vatValue = parseFloat(vat.data.value,2);
   			}
   		}
   		
   		var vatCalc = 1+vatValue;
   		var amount = this.get('amount');
   		amount = (amount?amount:0);
   		var weight = this.get('weight');
   		weight = (weight?weight:0);
   		var price_netto = this.get('price_netto');
   		price_netto = (price_netto?price_netto:0);
   		var price_brutto = this.get('price_brutto');
   		price_brutto = (price_brutto?price_brutto:0);
   		if(price_brutto == ''){
   			price_brutto = 0;
   		}
   		if(price_netto == ''){
   			price_netto= 0;
   		}
   		if(direction == Tine.Billing.Constants.Calculation.DIRECTION_NETTO_BRUTTO){
   			price_brutto = price_netto * vatCalc;
   			
   			//this.set('price_brutto', price_brutto);
   		}else{
   			price_netto = price_brutto/vatCalc;
   			//this.set('price_netto', price_netto);
   		}
   		this.data.price_brutto = price_brutto;
   		this.data.price_netto = price_netto;
   		
   		var discPerc = this.get('discount_percentage');
   		discPerc = (discPerc?discPerc:0)/100;
   		var discTotal = this.get('discount_total');
   		discTotal = (discTotal?discTotal:0);
   		var totalWeight = weight * amount;
   		// calculate
   		var totalNetto = (price_netto * amount);
   		discTotal = totalNetto * discPerc;
   		totalNetto -= discTotal;
   		
   		var totalBrutto = totalNetto * vatCalc;

   		this.data.total_netto = totalNetto;
   		this.data.total_brutto = totalBrutto;
   		this.data.discount_total = discTotal;
   		this.data.total_weight = totalWeight;
   		this.data.discount_percentage = discPerc * 100;
   		if(this.modified){
	   		this.modified.price_brutto = price_brutto;
	   		this.modified.price_netto = price_netto;
	   		this.modified.total_netto = totalNetto;
	   		this.modified.total_brutto = totalBrutto;
	   		this.modified.discount_total = discTotal;
	   		this.modified.total_weight = totalWeight;
	   		this.modified.discount_percentage = discPerc * 100;
	   		this.dirty = true;
   		}
   	}
});

Tine.Billing.Model.OrderTemplatePosition.getFromArticle = function(article){
	return new Tine.Billing.Model.OrderTemplatePosition({
		article_id: article,
		vat_id: article.get('vat_id'),
		unit_id: article.get('article_unit_id'),
		name: article.get('name'),
  		amount: 1,
  		description: article.get('description'),
  		weight: (article.get('weight')?article.get('weight'):0)
  	},0);
};

Tine.Billing.Model.OrderTemplatePosition.setNewArticle = function(OrderPosition, newArticle){
	OrderPosition.set('article_id', newArticle);
	OrderPosition.set('vat_id', newArticle.get('vat_id'));
	OrderPosition.set('unit_id', newArticle.get('article_unit_id'));
	OrderPosition.set('name', newArticle.get('name'));
	OrderPosition.set('weight',(newArticle.get('weight')?newArticle.get('weight'):0));
};
   
  Tine.Billing.Model.OrderTemplatePosition.getDefaultData = function(){
  	return {};
  };
   
  Tine.Billing.Model.OrderTemplatePosition.getFilterModel = function() {
      var app = Tine.Tinebase.appMgr.get('Billing');
  return [
          {label: app.i18n._('Bezeichnung'),  field: 'query',       operators: ['contains'] }
      ];
  };
  
Tine.Billing.Model.DebitorAccountArray = 
[
  {name: 'id'}, 	// (pk)
  {name: 'receipt_id'},
  {name: 'debitor_id'},
  {name: 'create_date'}, 
  {name: 'value_date'}, 
  {name: 'item_type'},
  {name: 'usage'},
  {name: 's_brutto'}, 
  {name: 'h_brutto'},
  {name: 'payment_id'},
  {name: 'erp_context_id'},
  {name: 'booking_id'},
  {name: 'donation_id'},
  {name: 'reversion_record_id'},
  {name: 'is_cancelled'},
  {name: 'is_cancellation'},
  {name: 'created_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long}
];

/**
* @type {Tine.Tinebase.data.Record}
* Contact record definition
*/
Tine.Billing.Model.DebitorAccount = Tine.Tinebase.data.Record.create(Tine.Billing.Model.DebitorAccountArray, {
	appName: 'Billing',
	modelName: 'DebitorAccount',
	idProperty: 'id',
	recordName: 'Buchung',
	recordsName: 'Buchungen',
	containerProperty: null,
	titleProperty: 'name'
});

   Tine.Billing.Model.DebitorAccount.getDefaultData = function(){
   	return {};
   };
    
   Tine.Billing.Model.DebitorAccount.getFilterModel = function(withoutDebitor) {
       var app = Tine.Tinebase.appMgr.get('Billing');
       var aResult =   [
       {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['contains'] },
       {label: _('Buchungsdatum'),         field: 'create_date', valueType: 'date', pastOnly: true},
       {label: _('Wertstellung Datum'),         field: 'value_date', valueType: 'date'},
       {label: app.i18n._('Typ'),  field: 'item_type',  valueType: 'combo', valueField:'id', displayField:'name', 
          	store:[['DISAGIO', 'Abschlag'],['PAYMENT','Zahlung'],['CREDIT','Gutschrift'],['DEBIT','Belastung'],['HISTORY','Historie DÜ']]},
       {label: app.i18n._('Kontext'),  field: 'erp_context_id',  valueType: 'combo', valueField:'id', displayField:'name', 
        	store:[['ERP', 'ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']]},
       ];
       
       if(!withoutDebitor){
  		   return aResult.concat([{app: app, filtertype: 'foreignrecord', label: 'Debitor', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'}]);
  	   }else{
  		   return aResult;
  	   }
   };
   
   
Tine.Billing.Model.ArticleSoldArray = 
[
   {name: 'unit_id'}, 	// (pk)
   {name: 'price_netto'}, 
   {name: 'price_brutto'},
   {name: 'min_price_netto'}, 
   {name: 'min_price_brutto'},
   {name: 'max_price_netto'}, 
   {name: 'max_price_brutto'},
   {name: 'amount'},
   {name: 'discount_total'},
   {name: 'name'}, 	
   {name: 'description'}, 
   {name: 'total_netto'},
   {name: 'total_brutto'},
   {name: 'total_weight'},
   {name: 'price2_netto'}, 
   {name: 'price2_brutto'},
   {name: 'total1_netto'},
   {name: 'total1_brutto'},
   {name: 'total2_netto'}, 
   
   {name: 'total2_brutto'},
   {name: 'article_nr'},
   {name: 'article_group_id'},
   {name: 'article_series_id'}, 
   {name: 'article_ext_nr'},
   {name: 'is_stock_article'},
   {name: 'stock_amount_total'},
   {name: 'stock_amount_min'},
   
   {name: 'date1'},
   {name: 'date2'}
   
 ];

 /**
 * @type {Tine.Tinebase.data.Record}
 * Contact record definition
 */
 Tine.Billing.Model.ArticleSold = Tine.Tinebase.data.Record.create(Tine.Billing.Model.ArticleSoldArray, {
 	appName: 'Billing',
	modelName: 'ArticleSold',
	idProperty: 'id',
	recordName: 'Verkaufter Artikel',
	recordsName: 'Verkaufte Artikel',
	containerProperty: null,
	titleProperty: 'name'
 });

Tine.Billing.Model.ArticleSold.getDefaultData = function(){
	return {};
};
 
Tine.Billing.Model.ArticleSold.getFilterModel = function() {
    var app = Tine.Tinebase.appMgr.get('Billing');
    return [
            {label: app.i18n._('Schnellsuche'),  field: 'query',       operators: ['equals','contains','startswith','endswith'] },
            {label: _('Verkaufsdatum'),         field: 'receipt_date', valueType: 'date', pastOnly: true},
            
            {label: app.i18n._('Bezeichnung'),  field: 'name',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Beschreibung'),  field: 'description',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Bemerkung'),  field: 'comment',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Artikel-Nr'),  field: 'article_nr',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Artikel-Nr2'),  field: 'article_ext_nr',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Artikelgruppe'),  field: 'article_group_id',  valueType: 'combo', valueField:'id', displayField:'name',
	       	store:Tine.Billing.getSimpleStore('ArticleGroup')},
	    {label: app.i18n._('Serie'),  field: 'article_series_id',  valueType: 'combo', valueField:'id', displayField:'name',
	         	store:Tine.Billing.getSimpleStore('ArticleSeries')},
	    {app: app, filtertype: 'foreignrecord', label: 'Kunde', field: 'debitor_id', foreignRecordClass: Tine.Billing.Model.Debitor, ownField:'debitor_id'},
	            
    ];
};

Tine.Billing.Model.BatchJobArray = 
	[
		{name: 'id'},
		{name: 'account_id'},
		{name: 'job_nr'},
		{name: 'job_name1'},
		{name: 'job_name2'},
		{name: 'job_category'},
		{name: 'job_type'},
		{name: 'job_data'},
		{name: 'job_state'},
		{name: 'job_result_state'},
		{name: 'on_error'},
		{name: 'process_info'},
		{name: 'error_info'},
		{name: 'ok_count'},
		{name: 'skip_count'},
		{name: 'error_count'},
		{name: 'create_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'schedule_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'start_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'end_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'modified_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'process_percentage'},
		{name: 'task_count'},
		{name: 'is_approved'},
		{name: 'approved_by_user'},
		{name: 'approved_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long}
	];

	Tine.Billing.Model.BatchJob = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BatchJobArray, {
		appName: 'Billing',
		modelName: 'BatchJob',
		idProperty: 'id',
		titleProperty: 'name',
		recordName: 'Batch-Auftrag',
		recordsName: 'Batch-Aufträge',
		containerProperty: null
	});

	Tine.Billing.Model.BatchJob.getDefaultData = function(){
		return {};
	};

	Tine.Billing.Model.BatchJob.getFilterModel = function() {
		var app = Tine.Tinebase.appMgr.get('Billing');
		return [
		    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
		];
	};
	
Tine.Billing.Model.BatchJobDtaArray = 
	[
		{name: 'id'},
		{name: 'job_id'},
		{name: 'contact_id'},
		{name: 'debitor_id'},
		{name: 'bank_valid'},
		{name: 'bank_account_number'},
		{name: 'bank_code'},
		{name: 'bank_account_name'},
		{name: 'bank_name'},
		{name: 'total_sum'},
		{name: 'total_saldation'},
		{name: 'diff_saldation'},
		{name: 'count_pos'},
		{name: 'skip'},
		{name: 'action_text'},
		{name: 'action_data'},
		{name: 'action_state'},
		{name: 'error_info'},
		{name: 'created_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'valid_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'to_process_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'process_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
		{name: 'created_by_user'},
		{name: 'processed_by_user'},
		{name: 'usage'}
	];

	Tine.Billing.Model.BatchJobDta = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BatchJobDtaArray, {
		appName: 'Billing',
		modelName: 'BatchJobDta',
		idProperty: 'id',
		titleProperty: 'name',
		recordName: 'DTA Transaktion',
		recordsName: 'DTA Transaktionen',
		containerProperty: null
	});

	Tine.Billing.Model.BatchJobDta.getDefaultData = function(){
		return {};
	};

	Tine.Billing.Model.BatchJobDta.getFilterModel = function() {
		var app = Tine.Tinebase.appMgr.get('Billing');
		return [
		    {label: _('Quick search'),          field: 'query',       operators: ['contains']},
		    {label: _('Betrag'),          field: 'total_sum',       operators: ['greater','less','equals']},
		    {label: _('Diff.Saldo'),          field: 'diff_saldation',       operators: ['greater','less','equals']},
		    {label: _('Zahlsaldo'),          field: 'total_saldation',       operators: ['greater','less','equals']},
		    
		    {label: _('Anz.Pos.'),          field: 'count_pos',       operators: ['greater','less','equals']},
		    {label: app.i18n._('Status'),  field: 'action_state',  valueType: 'combo', valueField:'id', displayField:'name',
		      	  store:[['OPEN', 'offen'],['DONE','erledigt'],['ERROR','Fehler']]},
		    {label: _('Benutzer (Erfassung)'),   field: 'created_by_user',  valueType: 'user'},
		    {label: _('Benutzer (Ausführung)'),   field: 'processed_by_user',  valueType: 'user'},
		    
		    {label: _('Angelegt am'),         field: 'created_datetime', valueType: 'date'},
	        {label: _('Gültig ab'),         field: 'valid_datetime', valueType: 'date'},
	        {label: _('Ausgeführt am'),         field: 'process_datetime', valueType: 'date'},
	        {label: app.i18n._('Kto. valide'),  field: 'bank_valid',  valueType: 'combo', valueField:'id', displayField:'name',
	      	  store:[['NO', 'Nein'],['UNKNOWN','unbekannt'],['YES','ja']]},
	      	{app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'contact_id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
	  ];
	};
	
	
	Tine.Billing.Model.BatchJobDtaItemArray = 
		[
			{name: 'id'},
			{name: 'batch_dta_id'},
			{name: 'erp_context_id'},
			{name: 'open_item_id'},
			{name: 'payment_id'},
			{name: 'skip'},
			{name: 'total_sum'},
			{name: 'usage'}
		];

		Tine.Billing.Model.BatchJobDtaItem = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BatchJobDtaItemArray, {
			appName: 'Billing',
			modelName: 'BatchJobDtaItem',
			idProperty: 'id',
			titleProperty: 'name',
			recordName: 'DTA Transaktion Komponente',
			recordsName: 'DTA Transaktion Komponente',
			containerProperty: null
		});

		Tine.Billing.Model.BatchJobDtaItem.getDefaultData = function(){
			return {};
		};

		Tine.Billing.Model.BatchJobDtaItem.getFilterModel = function() {
			var app = Tine.Tinebase.appMgr.get('Billing');
			return [
			    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
		  ];
		};	
		
		
		
Tine.Billing.Model.BatchJobMonitionArray = 
[
	{name: 'id'},
	{name: 'job_id'},
	{name: 'contact_id'},
	{name: 'debitor_id'},
	{name: 'monition_receipt_id'},
	{name: 'monition_stage'},
	{name: 'total_sum'},
	{name: 'open_sum'},
	{name: 'monition_fee'},
	{name: 'total_saldation'},
	{name: 'count_pos'},
	{name: 'monition_lock'},
	{name: 'skip'},
	{name: 'action_text'},
	{name: 'action_data'},
	{name: 'action_state'},
	{name: 'error_info'},
	{name: 'created_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'valid_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'to_process_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'process_datetime', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'created_by_user'},
	{name: 'processed_by_user'},
	{name: 'usage'}
];

Tine.Billing.Model.BatchJobMonition = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BatchJobMonitionArray, {
	appName: 'Billing',
	modelName: 'BatchJobMonition',
	idProperty: 'id',
	titleProperty: 'name',
	recordName: 'DTA Transaktion',
	recordsName: 'DTA Transaktionen',
	containerProperty: null
});

Tine.Billing.Model.BatchJobMonition.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.BatchJobMonition.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']},
	    {label: _('Betrag'),          field: 'total_sum',       operators: ['greater','less','equals']},
	    {label: _('Diff.Saldo'),          field: 'diff_saldation',       operators: ['greater','less','equals']},
	    {label: _('Zahlsaldo'),          field: 'total_saldation',       operators: ['greater','less','equals']},
	    
	    {label: _('Anz.Pos.'),          field: 'count_pos',       operators: ['greater','less','equals']},
	    {label: app.i18n._('Status'),  field: 'action_state',  valueType: 'combo', valueField:'id', displayField:'name',
	      	  store:[['OPEN', 'offen'],['DONE','erledigt'],['ERROR','Fehler']]},
	    {label: _('Benutzer (Erfassung)'),   field: 'created_by_user',  valueType: 'user'},
	    {label: _('Benutzer (Ausführung)'),   field: 'processed_by_user',  valueType: 'user'},
	    
	    {label: _('Angelegt am'),         field: 'created_datetime', valueType: 'date'},
        {label: _('Gültig ab'),         field: 'valid_datetime', valueType: 'date'},
        {label: _('Ausgeführt am'),         field: 'process_datetime', valueType: 'date'},
        //{label: app.i18n._('Kto. valide'),  field: 'bank_valid',  valueType: 'combo', valueField:'id', displayField:'name',
      	//  store:[['NO', 'Nein'],['UNKNOWN','unbekannt'],['YES','ja']]},
      	{app: app, filtertype: 'foreignrecord', label: 'Kontakt', field: 'contact_id', foreignRecordClass: Tine.Addressbook.Model.Contact, ownField:'contact_id'}
  ];
};


Tine.Billing.Model.BatchJobMonitionItemArray = 
[
	{name: 'id'},
	{name: 'batch_monition_id'},
	{name: 'erp_context_id'},
	{name: 'open_item_id'},
	{name: 'payment_id'},
	{name: 'skip'},
	{name: 'total_sum'},
	{name: 'open_sum'},
	{name: 'monition_stage'},
	{name: 'due_days'},
	{name: 'usage'}
];

Tine.Billing.Model.BatchJobMonitionItem = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BatchJobMonitionItemArray, {
	appName: 'Billing',
	modelName: 'BatchJobMonitionItem',
	idProperty: 'id',
	titleProperty: 'name',
	recordName: 'Mahnung Bestandteil',
	recordsName: 'Mahnung Bestandteile',
	containerProperty: null
});

Tine.Billing.Model.BatchJobMonitionItem.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.BatchJobMonitionItem.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
  ];
};	

Tine.Billing.Model.BankArray = 
[
	{name: 'id'},
	{name: 'country_code'},
	{name: 'code'},
	{name: 'att'},
	{name: 'name'},
	{name: 'postal_code'},
	{name: 'location'},
	{name: 'short_name'},
	{name: 'pan'},
	{name: 'bic'},
	{name: 'validate'},
	{name: 'record_number'},
	{name: 'change_sign'},
	{name: 'follow_code'},
	{name: 'created_by'},
	{name: 'creation_time'},
	{name: 'last_modified_by'},
	{name: 'last_modified_time'},
	{name: 'is_deleted'},
	{name: 'deleted_time'},
	{name: 'deleted_by'}
];

Tine.Billing.Model.Bank = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BankArray, {
	appName: 'Billing',
	modelName: 'Bank',
	idProperty: 'id',
	titleProperty: 'name',
	recordName: 'Bank',
	recordsName: 'Banks',
	containerProperty: null,
	useTitleMethod: true,
	getTitle: function(){
		return this.get('bic') + ' BLZ:' + this.get('code') + ' ' + this.get('name');
	}
});

Tine.Billing.Model.Bank.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.Bank.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
  ];
};

Tine.Billing.Model.BankAccountArray = 
[
	{name: 'id'},
	{name: 'contact_id'},
	{name: 'bank_id'},
	{name: 'iban'},
	{name: 'bic'},
	{name: 'number'},
	{name: 'name'},
	{name: 'bank_code'},
	{name: 'bank_name'},
	{name: 'last_validated'},
	{name: 'valid'},
	{name: 'has_sepa_mandate'},
	{name: 'created_by'},
	{name: 'creation_time'},
	{name: 'last_modified_by'},
	{name: 'last_modified_time'},
	{name: 'is_deleted'},
	{name: 'deleted_time'},
	{name: 'deleted_by'}
];

Tine.Billing.Model.BankAccount = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BankAccountArray, {
	appName: 'Billing',
	modelName: 'BankAccount',
	idProperty: 'id',
	//titleProperty: 'iban',
	recordName: 'Bank-Konto',
	recordsName: 'Bank-Konten',
	containerProperty: null,
	useTitleMethod: true,
	getTitle: function(){
		return this.get('iban') + ' BLZ: ' + this.get('bank_code') + ' ' + this.get('name');
	}
});

Tine.Billing.Model.BankAccount.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.BankAccount.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
  ];
};

Tine.Billing.Model.BankAccountUsageArray = 
[
	{name: 'id'},
	{name: 'bank_account_id'},
	{name: 'context_id'},
	{name: 'usage_type'},
	{name: 'sepa_mandate_id'},
	{name: 'membership_id'},
	{name: 'regular_donation_id'},
	{name: 'usage_from'},
	{name: 'usage_until'},
	{name: 'is_blocked'},
	{name: 'block_reason'},
	{name: 'created_by'},
	{name: 'creation_time'},
	{name: 'last_modified_by'},
	{name: 'last_modified_time'},
	{name: 'is_deleted'},
	{name: 'deleted_time'},
	{name: 'deleted_by'}
];

Tine.Billing.Model.BankAccountUsage = Tine.Tinebase.data.Record.create(Tine.Billing.Model.BankAccountUsageArray, {
	appName: 'Billing',
	modelName: 'BankAccountUsage',
	idProperty: 'id',
	titleProperty: 'name',
	recordName: 'Bankkto.Verwendung',
	recordsName: 'Bankkto.Verwendungen',
	containerProperty: null
});

Tine.Billing.Model.BankAccountUsage.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.BankAccountUsage.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
  ];
};	
		

Tine.Billing.Model.SepaCreditorArray = 
[
	{name: 'id'},
	{name: 'contact_id'},
	{name: 'bank_account_id'},
	{name: 'sepa_creditor_ident'},
	{name: 'creditor_name'}
];

Tine.Billing.Model.SepaCreditor = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SepaCreditorArray, {
	appName: 'Billing',
	modelName: 'SepaCreditor',
	idProperty: 'id',
	//titleProperty: 'name',
	recordName: 'SEPA-Kreditor',
	recordsName: 'SEPA-Kreditoren',
	containerProperty: null,
	useTitleMethod:true,
	getTitle: function(){
		return this.get('creditor_name') + ' ID: ' + this.get('sepa_creditor_ident');
	}
});

Tine.Billing.Model.SepaCreditor.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.SepaCreditor.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']}
  ];
};

Tine.Billing.Model.SepaMandateArray = 
[
	{name: 'id'},
	{name: 'contact_id'},
	{name: 'bank_account_id'},
	{name: 'sepa_creditor_id'},
	{name: 'mandate_ident'},
	{name: 'mandate_state'},
	
	{name: 'signature_date'},
	{name: 'last_usage_date', type: 'date', dateFormat: Date.patterns.ISO8601Long},
	{name: 'is_single'},
	{name: 'is_last'},
	{name: 'is_valid'},
	{name: 'comment'},
	
	{name: 'account_name'},
	
	{name: 'iban'},
	{name: 'bic'},
	{name: 'bank_code'},
	{name: 'bank_name'},
	{name: 'bank_country_code'},
	{name: 'bank_postal_code'},
	{name: 'bank_location'},
	
	{name: 'created_by'},
	{name: 'creation_time'},
	{name: 'last_modified_by'},
	{name: 'last_modified_time'},
	{name: 'is_deleted'},
	{name: 'deleted_time'},
	{name: 'deleted_by'}
];

Tine.Billing.Model.SepaMandate = Tine.Tinebase.data.Record.create(Tine.Billing.Model.SepaMandateArray, {
	appName: 'Billing',
	modelName: 'SepaMandate',
	idProperty: 'id',
	titleProperty: 'name',
	recordName: 'SEPA-Mandat',
	recordsName: 'SEPA-Mandate',
	containerProperty: null,
	useTitleFunc:true,
	getTitle: function(){
		return this.get('sepa_mandate_ident') + ' IBAN:' + this.get('iban');
	}
});

Tine.Billing.Model.SepaMandate.getDefaultData = function(){
	return {};
};

Tine.Billing.Model.SepaMandate.getFilterModel = function() {
	var app = Tine.Tinebase.appMgr.get('Billing');
	return [
	    {label: _('Quick search'),          field: 'query',       operators: ['contains']},
	    {label: app.i18n._('Mandat-ID'),  field: 'mandate_ident',       operators: ['equals','contains','startswith','endswith'] },
	    {label: app.i18n._('Bemerkung'),  field: 'name',       operators: ['equals','contains','startswith','endswith'] },
        {label: app.i18n._('Bearbeitungsstatus'),  field: 'mandate_state',  valueType: 'combo', valueField:'id', displayField:'name',
	    	store:[['GENERATED','zu bestätigen'], ['COMMUNICATION','in Bearbeitung'], ['CONFIRMED','bestätigt']]}
  ];
};

