Ext.namespace('Tine.Billing');

Tine.Billing.ArticleUnitEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priarticleUnite
	 */
	windowNamePrefix: 'ArticleUnitEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.ArticleUnit,
	recordProxy: Tine.Billing.articleUnitBackend,
	loadRecord: false,
	evalGrants: false,
	
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
				[
				 	{xtype: 'hidden',id:'id',name:'id'},
				 	{xtype: 'hidden',id:'data',name:'data'},
					{
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 150,
		    			allowBlank:false
					}
				 ],[
				 	{
				 		fieldLabel: 'Faktor',
					    id:'factor',
					    name:'factor',
					    value:1,
					    width: 150
					}
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.ArticleUnitEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 120,
        name: Tine.Billing.ArticleUnitEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ArticleUnitEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};