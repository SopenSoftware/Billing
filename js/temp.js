Ext.ns('Tine.Billing','Tine.Billing.Model');

/**
* sopen docmanager models
*/

Tine.Billing.Model.VatArray = [
   {name: 'id'}, 	// (pk)
   {name: 'name'}, 
   {name: 'value'}
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
	titleProperty: 'name'
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

// backend
Ext.ns('Tine.Billing');

Tine.Billing.vatBackend = new Tine.Tinebase.data.RecordProxy({
	   appName: 'Billing',
	   modelName: 'Vat',
	   recordClass: Tine.Billing.Model.Vat
});