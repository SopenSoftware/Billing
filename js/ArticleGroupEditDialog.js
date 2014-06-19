Ext.namespace('Tine.Billing');

Tine.Billing.ArticleGroupEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @priarticleGroupe
	 */
	windowNamePrefix: 'ArticleGroupEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.ArticleGroup,
	recordProxy: Tine.Billing.articleGroupBackend,
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
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'article_pos_permitted',
						name: 'pos_permitted',
						hideLabel:true,
					    boxLabel: 'für Kassenerfassung',
					    width: 150
					}
				 ],[
					{
				 		fieldLabel: 'Bezeichnung',
					    id:'name',
					    name:'name',
					    width: 150,
		    			allowBlank:false
					},{
			    		fieldLabel: 'Erlöskonto',
					    disabledClass: 'x-item-disabled-view',
					    id:'article_group_credit_account',
					    name:'credit_account',
					    value:null
					}
					  
				 ],[
					{
						xtype: 'textarea',
						fieldLabel: 'Bemerkung zur Artikelgruppe',
						disabledClass: 'x-item-disabled-view',
						id:'comment',
						name:'comment',
						width: 450,
						height: 80
					}    
				 ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.ArticleGroupEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 160,
        name: Tine.Billing.ArticleGroupEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.ArticleGroupEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};