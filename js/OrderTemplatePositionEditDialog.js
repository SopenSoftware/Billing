Ext.namespace('Tine.Billing');

Tine.Billing.OrderTemplatePositionEditHandler = function(config){
	config = config || {};
    Ext.apply(this, config);

    Tine.Billing.OrderTemplatePositionEditHandler.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.OrderTemplatePositionEditHandler, Ext.util.Observable, {
	
	initialize: function(){
		this.addEvents(
			'beforecalculate',
			'calculate',
			'changearticle'
		);
		
		Ext.getCmp('order_template_position_article_id').addListener('select', this.decideChangeArticle, this);
		Ext.getCmp('order_template_position_article_id').addListener('change', this.decideChangeArticle, this);
		Ext.getCmp('order_template_position_price_group_id').addListener('select', this.decideChangePrice, this);
		Ext.getCmp('order_template_position_price_group_id').addListener('change', this.decideChangePrice, this);
		Ext.getCmp('order_template_position_amount').addListener('change', this.calculate, this);
		Ext.getCmp('order_template_position_discount_percentage').addListener('select', this.calculate, this);
		Ext.getCmp('order_template_position_discount_percentage').addListener('change', this.calculate, this);
		Ext.getCmp('order_template_position_weight').addListener('change', this.calculate, this);
		Ext.getCmp('order_template_position_vat_id').addListener('select', this.calculate, this);
		Ext.getCmp('order_template_position_price_netto').addListener('change', this.calculate, this);
	},
	calculate: function(){
		if(this.fireEvent('beforecalculate',this)){
			this.fireEvent('calculate');
		}
	},
	decideChangePrice: function(){
		Ext.MessageBox.show({
            title: 'Hinweis: Preisänderung', 
            msg: 'Soll mit dieser Änderung ein <br/>anderer Nettopreis für diese Position übernommen werden?',
            buttons: Ext.Msg.YESNO,
            scope: this,
            fn: this.setPriceFromArticle,
            icon: Ext.MessageBox.QUESTION
        });
	},
	decideChangeArticle: function(){
		Ext.MessageBox.show({
            title: 'Hinweis: Änderung des Artikels', 
            msg: 'Mit dieser Änderung wird die Position überschrieben.<br/>Soll dies erfolgen?',
            buttons: Ext.Msg.YESNO,
            scope: this,
            fn: this.changeArticle,
            icon: Ext.MessageBox.QUESTION
        });
	},
	/**
	 * get article record from article recordchooser
	 * 
	 * @return {Tine.Billing.Model.Article}
	 *
	 */
	getArticleRecord: function(){
		if(!this.articleLoaded){
			this.loadArticle();
//			this.getArticleRecord.defer(200,this);
//			return;
		}
		/*while(!this.articleLoaded){
			this._sleep.defer(200,this);
		}*/
		return this.articleRecord;
	},
	_sleep: function(){
		// do nothing
	},
	loadArticle: function(){
		// if there had been a selection by user, selectedRecord should exist,
		// otherwise we fetch the single record being set by loadRecord
		var articleCombo = Ext.getCmp('order_template_position_article_id');
		var articleRecord = articleCombo.selectedRecord;
		// if selected record does not exist, this means the store just contains the one embedded record
		if(!articleRecord){
			articleRecord = articleCombo.store.getAt(0);
		}
		// reload article here, to get priceInfo
		articleRecord = new Tine.Billing.Model.Article(articleRecord.data,articleRecord.data.id);
		Tine.Billing.articleBackend.loadRecord(
			articleRecord,
			{
				scope:this,
				success: function(record) {
				    this.articleRecord = record;
	                this.onLoadArticle();
	            }
			}
		);
	},
	onLoadArticle: function(){
		this.articleLoaded = true;
	},
	getPriceFromArticle: function(){
		var articleRecord = this.getArticleRecord();
		
		var priceGroupCombo = Ext.getCmp('order_template_position_price_group_id');
		var priceGroupRecord = priceGroupCombo.selectedRecord;
		// if selected record does not exist, this means the store just contains the one embedded record
		if(!priceGroupRecord){
			priceGroupRecord = priceGroupCombo.store.getAt(0);
		}
		
		var priceGroupId = priceGroupRecord.data.id;
		return articleRecord.getPriceByPriceGroup(priceGroupId);
	},
	setPriceFromArticle: function(btn, text){
		if(btn!='yes'){
			return;
		}
		var prices = this.getPriceFromArticle();
		if(prices){
			Ext.getCmp('order_template_position_price_netto').setValue(prices.price_netto);
			//this.fireEvent('calculate');
			this.calculate();
		}
	},
	changeArticle: function(btn, text){
		if(btn!='yes'){
			return;
		}
		var articleRecord = this.getArticleRecord();
		var prices = this.getPriceFromArticle();
		if(this.fireEvent('changearticle', articleRecord, prices)){
			// no before calculate here: this would take the old values from the form and override the ones, just set.
			this.fireEvent('calculate');
		}
	}
});

Tine.Billing.OrderTemplatePositionEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockLocatione
	 */
	windowNamePrefix: 'OrderTemplatePositionEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.OrderTemplatePosition,
	recordProxy: Tine.Billing.orderTemplatePositionBackend,
	loadRecord: false,
	evalGrants: false,
	initComponent: function(){
		// preload stores: vatStore -> to handle calculation within 
		this.preloadStores();
		Tine.Billing.OrderTemplatePositionEditDialog.superclass.initComponent.call(this);
		this.on('afterrender',this.onAfterRender,this);
	},
	preloadStores: function(){
		// preload vat store
		Tine.Billing.getVatStore();
	},
	onAfterRender: function(){
		this.editHandler = new Tine.Billing.OrderTemplatePositionEditHandler({});
		this.editHandler.initialize();
		this.editHandler.on('beforecalculate', this.onBeforeCalculate, this);
		this.editHandler.on('calculate', this.onCalculate, this);
		this.editHandler.on('changearticle', this.onChangeArticle, this);
	},
	onChangeArticle: function(newArticle, prices){
		Tine.Billing.Model.OrderTemplatePosition.setNewArticle(this.record, newArticle);
		this.record.set('price_netto', prices.price_netto);
		return true;
	},
	onBeforeCalculate: function(){
		this.onRecordUpdate();
		return true;
	},
	onCalculate: function(){
		this.record.calculate();
		this.onRecordLoad();
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
		// use some fields from brevetation edit dialog
		return Tine.Billing.getOrderTemplatePositionFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.OrderTemplatePositionEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 500,
        height: 480,
        name: Tine.Billing.OrderTemplatePositionEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.OrderTemplatePositionEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getOrderTemplatePositionFormItems = function(){
	var fields = Tine.Billing.OrderTemplatePositionFormFields.get();
	return {
        xtype: 'panel',
        border: false,
        frame:true,
        items:[{xtype:'columnform',items:[
			[
			   fields.id, fields.factor, fields.order_template_id
			],[
			   fields.optional,
			   fields.active,
			   fields.single_usage
			],[
			   fields.position_nr,
			   fields.article_id,
			   fields.price_group_id,
			   fields.price_netto
			],[
			   fields.name,
			   fields.vat_id
			],[
			   fields.unit_id,
			   fields.amount,
			   fields.weight
		    ],[
			   fields.description	   
			],[
			   fields.discount_percentage,
			   fields.discount_total
			],[
			   fields.total_netto,
			   fields.total_brutto,
			   fields.total_weight
			]
        ]}]
    };
};

Ext.ns('Tine.Billing.OrderTemplatePositionFormFields');

Tine.Billing.OrderTemplatePositionFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		factor: 
			{xtype: 'hidden',id:'factor',name:'factor'},
		order_template_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 1,
				fieldLabel: 'Beleg',
			    id:'order_template_position_order_template_id',
			    name:'order_template_id',
			    disabled: true,
			    hidden:true,
			    onAddEditable: false,	// only has effect in class:DependentEditForm
			    onEditEditable: false,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.OrderTemplate
			}),
		position_nr:
    	{
    		fieldLabel: 'Pos-Nr',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_template_position_position_nr',
		    name:'position_nr',
		    value:null,
		    width: 40
    	},			
		article_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Artikel',
			    id:'order_template_position_article_id',
			    name:'article_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Article,
			    allowBlank:false
			}),
		price_group_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Preisgruppe',
			    id:'order_template_position_price_group_id',
			    name:'price_group_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.PriceGroup,
			    allowBlank:false
			}),
		vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt',
			    id:'order_template_position_vat_id',
			    name:'vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:false
			}),			
		unit_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Einheit',
			    id:'order_template_position_unit_id',
			    name:'unit_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.ArticleUnit,
			    allowBlank:false
			}),				
	 	discount_percentage:
		{
	 		xtype: 'extuxpercentcombo',
	    	fieldLabel: 'Rabatt auf Gesamtsumme %', 
		    id:'order_template_position_discount_percentage',
		    name:'discount_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	discount_total:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Rabatt auf Gesamtsumme', 
		    id:'order_template_position_discount_total',
		    name:'discount_total',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		weight:
    	{
			xtype:'numberfield',
			decimalPrecision: 4,
			decimalSeparator:',',
    		fieldLabel: 'Gewicht (kg)',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_template_position_weight',
		    name:'weight',
		    value:null,
		    width: 150
    	},
		amount:
    	{
    		fieldLabel: 'Menge',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_template_position_amount',
		    name:'amount',
		    value:null,
		    width: 150
    	},
    	price_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Preis netto', 
		    id:'order_template_position_price_netto',
		    name:'price_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		name:
    	{
    		fieldLabel: 'Bezeichnung',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_template_position_name',
		    name:'name',
		    value:null,
		    width: 320
    	},
    	description:
		{
			xtype: 'textarea',
			fieldLabel: 'Beschreibung',
			disabledClass: 'x-item-disabled-view',
			id:'order_template_position_description',
			name:'description',
			width: 320,
			height: 60
		}, 
		total_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt netto', 
		    id:'order_template_position_total_netto',
		    name:'total_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt brutto', 
		    id:'order_template_position_total_brutto',
		    name:'total_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
		total_weight:
    	{
			xtype:'numberfield',
			decimalPrecision: 4,
			decimalSeparator:',',
    		fieldLabel: 'Gesamtgewicht (kg)',
		    disabledClass: 'x-item-disabled-view',
		    id:'order_template_position_total_weight',
		    name:'total_weight',
		    value:null,
		    width: 150
    	},
	   	optional:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'order_template_position_optional',
			name: 'optional',
			hideLabel:true,
		    boxLabel: 'ist optionale Position',
		    width: 150
		},
		active:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'order_template_position_active',
			name: 'active',
			hideLabel:true,
		    boxLabel: 'aktiv',
		    width: 150
		},
		single_usage:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'order_template_position_single_usage',
			name: 'single_usage',
			hideLabel:true,
		    boxLabel: 'einmalige Verwendung',
		    width: 150
		}		
	};
};