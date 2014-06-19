Ext.namespace('Tine.Billing');

Tine.Billing.ArticleSeriesEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priarticleUnite
	 */
	windowNamePrefix: 'ArticleSeriesEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.ArticleSeries,
	recordProxy: Tine.Billing.articleSeriesBackend,
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
				 	{
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 150,
		    			allowBlank:false
					},{
						xtype:'datefield',
				 		fieldLabel: 'Beginn',
					    id:'begin_date',
					    name:'begin_date',
					    width: 150
					},{
						xtype:'datefield',
				 		fieldLabel: 'Ende',
					    id:'end_date',
					    name:'end_date',
					    width: 150
					}
				 ],[
				 	{
				 		fieldLabel: 'Beschreibung',
					    id:'description',
					    name:'description',
					    height:80,
					    width: 450
					}
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.ArticleSeriesEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 120,
        name: Tine.Billing.ArticleSeriesEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ArticleSeriesEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};