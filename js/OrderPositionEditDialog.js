Ext.namespace('Tine.Billing');

Tine.Billing.OrderPositionEditHandler = function(config){
	config = config || {};
    Ext.apply(this, config);

    Tine.Billing.OrderPositionEditHandler.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.OrderPositionEditHandler, Ext.util.Observable, {
	
	initialize: function(){
		this.addEvents(
			'beforecalculate',
			'calculate',
			'changearticle'
		);
		
		Ext.getCmp('receipt_position_article_id').addListener('select', this.decideChangeArticle, this);
		Ext.getCmp('receipt_position_article_id').addListener('change', this.decideChangeArticle, this);
		Ext.getCmp('receipt_position_price_group_id').addListener('select', this.decideChangePrice, this);
		Ext.getCmp('receipt_position_price_group_id').addListener('change', this.decideChangePrice, this);
		Ext.getCmp('receipt_position_amount').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_discount_percentage').addListener('select', this.calculate, this);
		Ext.getCmp('receipt_position_discount_percentage').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_weight').addListener('change', this.calculate, this);
		Ext.getCmp('receipt_position_vat_id').addListener('select', this.calculate, this);
		Ext.getCmp('receipt_position_price_netto').addListener('change', this.calculate, this);
		
		Ext.getCmp('receipt_position_price2_vat_id').addListener('select', this.calculate, this);
		Ext.getCmp('receipt_position_price2_netto').addListener('change', this.calculate, this);
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
		var articleCombo = Ext.getCmp('receipt_position_article_id');
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
		
		if(articleRecord.isSimpleArticle()){
			return articleRecord(null, null);
		}
		
		var priceGroupCombo = Ext.getCmp('receipt_position_price_group_id');
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
			Ext.getCmp('receipt_position_price_netto').setValue(prices.price_netto);
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

Tine.Billing.OrderPositionEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @pristockLocatione
	 */
	windowNamePrefix: 'OrderPositionEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.OrderPosition,
	recordProxy: Tine.Billing.orderPositionBackend,
	loadRecord: false,
	evalGrants: false,
	articleRecord: null,
	initComponent: function(){
		// preload stores: vatStore -> to handle calculation within 
		this.preloadStores();
		Tine.Billing.OrderPositionEditDialog.superclass.initComponent.call(this);
		this.on('afterrender',this.onAfterRender,this);
		this.on('load', this.onLoadPosition, this);
	},
	preloadStores: function(){
		// preload vat store
		Tine.Billing.getVatStore();
	},
	onLoadPosition: function(){
		if(!this.record.isNew()){
			this.articleRecord = this.record.getForeignRecord(Tine.Billing.Model.Article, 'article_id');
			if(this.articleRecord.get('add_calculation') == 1){
					Ext.getCmp('additionForm').expand();
			}
		}else{
			var zeroVat = Tine.Billing.getZeroVat();
			//var defaultVat = Tine.Billing.getVatDefault();
			
			Ext.getCmp('receipt_position_price2_vat_id').setValue(zeroVat);
			
		}
	},
	onAfterRender: function(){
		this.editHandler = new Tine.Billing.OrderPositionEditHandler({});
		this.editHandler.initialize();
		this.editHandler.on('beforecalculate', this.onBeforeCalculate, this);
		this.editHandler.on('calculate', this.onCalculate, this);
		this.editHandler.on('changearticle', this.onChangeArticle, this);
	},
	onChangeArticle: function(newArticle, prices){
		Tine.Billing.Model.OrderPosition.setNewArticle(this.record, newArticle);
		this.record.set('price_netto', prices.price_netto);
		return true;
	},
	onBeforeCalculate: function(){
		this.onRecordUpdate();
		
		// if this record is not new and articleRecord detected in onLoadPosition:
		// -> set whole articlerecord as foreign record and not only foreignid (article_id)
		// otherwise calculation cannot be done
		if(this.articleRecord){
			this.record.set('article_id', this.articleRecord);
		}
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
		return Tine.Billing.getOrderPositionFormItems();
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.OrderPositionEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 540,
        height: 550,
        name: Tine.Billing.OrderPositionEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.OrderPositionEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};

Tine.Billing.getOrderPositionFormItems = function(){
	var fields = Tine.Billing.OrderPositionFormFields.get();
	
	var additionFormComponents = 
	{
		xtype:'columnform',border:false,items:
		[[
		   fields.price2_netto,
		   fields.price2_brutto,
		   fields.price2_vat_id
		],[  		
			fields.total2_netto,
			fields.total2_brutto,
			fields.add_percentage
		]]
	};
	
	var additionForm  = {
    	xtype: 'panel',
    	id:'additionForm',
    	layout:'fit',
    	header:false,
    	width:520,
    	collapsible:true,
    	collapsed:true,
    	items:[
    	       additionFormComponents
    	]
    };
	
	
	
	return {
        xtype: 'panel',
        border: false,
        frame:true,
        items:[{xtype:'columnform',items:[
			[
			   fields.id, fields.factor, fields.receipt_id
			],[
			   fields.optional
			],[
			   fields.position_nr,
			   Ext.apply(fields.article_id,{width:470})
			],[
			    Ext.apply(fields.name,{width:510}),
			],[   
			   fields.price_group_id,
			   fields.discount_percentage,
			   fields.discount_total
		   ],[
		       Ext.apply(fields.unit_id,{width:180}),
		       Ext.apply(fields.amount,{width:180}),
		       Ext.apply(fields.weight,{width:150})
		   ],[
			   fields.price_netto,
			   fields.price_brutto,
			   fields.vat_id
		   ],[
		       additionForm
	       ],[
			   fields.total_netto,
			   fields.total_brutto,
			   fields.total_weight
		    ],[
			    Ext.apply(fields.description,{width:510}),
			    Ext.apply(fields.comment,{width:510})
			],[
			   Ext.apply(fields.total1_netto,{xtype: 'hidden', width:1, height:1}),
			   Ext.apply(fields.total1_brutto,{xtype: 'hidden', width:1, height:1})
			]
        ]}]
    };
};

Ext.ns('Tine.Billing.OrderPositionFormFields');

Tine.Billing.OrderPositionFormFields.get = function(){
	return{
		// hidden fields
		id: 
			{xtype: 'hidden',id:'id',name:'id'},
		factor: 
			{xtype: 'hidden',id:'factor',name:'factor'},
		receipt_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 1,
				fieldLabel: 'Beleg',
			    id:'receipt_position_receipt_id',
			    name:'receipt_id',
			    disabled: true,
			    hidden:true,
			    onAddEditable: false,	// only has effect in class:DependentEditForm
			    onEditEditable: false,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Receipt
			}),
		position_nr:
    	{
    		fieldLabel: 'Pos-Nr',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_position_nr',
		    name:'position_nr',
		    value:null,
		    width: 40
    	},		
    	article_search:
    	{
    		fieldLabel: 'Artikel',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_article_search',
		    name:'article_search',
		    value:null,
		    height: 40,
		    style:{
		    	fontSize:'14px'
		    },
		    width: 300
    	},
    	article_name:
    	{
    		fieldLabel: 'Bezeichnung',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_article_name',
		    name:'article_name',
		    value:null,
		    width: 300
    	},
		article_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Artikel',
			    id:'receipt_position_article_id',
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
			    id:'receipt_position_price_group_id',
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
			    id:'receipt_position_vat_id',
			    name:'vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:false
			}),	
		price2_vat_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'MwSt Zuschlag',
			    id:'receipt_position_price2_vat_id',
			    name:'price2_vat_id',
			    disabled: false,
			    onAddEditable: true,	// only has effect in class:DependentEditForm
			    onEditEditable: true,	// only has effect in class:DependentEditForm
			    blurOnSelect: true,
			    recordClass: Tine.Billing.Model.Vat,
			    allowBlank:true
			}),	
		unit_id:
			new Tine.Tinebase.widgets.form.RecordPickerComboBox({
				disabledClass: 'x-item-disabled-view',
				width: 150,
				fieldLabel: 'Einheit',
			    id:'receipt_position_unit_id',
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
	    	fieldLabel: 'Rabatt auf Position %', 
		    id:'receipt_position_discount_percentage',
		    name:'discount_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	discount_total:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Rabatt auf Position', 
		    id:'receipt_position_discount_total',
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
		    id:'receipt_position_weight',
		    name:'weight',
		    value:null,
		    width: 150
    	},
		amount:
    	{
    		fieldLabel: 'Menge',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_amount',
		    name:'amount',
		    value:null,
		    width: 150
    	},
    	amount_big:
    	{
    		fieldLabel: 'Menge',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_amount',
		    name:'amount',
		    value:null,
		    width: 150,
		    height: 40,
		    style:{
		    	fontSize:'14px',
		    	textAlign:'right'
		    }
    	},
    	price_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Einzelpreis netto', 
		    id:'receipt_position_price_netto',
		    name:'price_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	price2_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zuschlag(einzel) netto', 
		    id:'receipt_position_price2_netto',
		    name:'price2_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	price_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Einzelpreis brutto', 
		    id:'receipt_position_price_brutto',
		    name:'price_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	price2_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zuschlag(einzel) brutto', 
		    id:'receipt_position_price2_brutto',
		    name:'price2_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
    	price_brutto_big:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Einzel brutto', 
		    id:'receipt_position_price_brutto',
		    name:'price_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180,
	 	    height: 40,
		    style:{
		    	fontSize:'14px',
		    	textAlign:'right'
		    }
	 	},
	 	price2_brutto_big:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zuschlag', 
		    id:'receipt_position_price2_brutto',
		    name:'price2_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180,
	 	    height: 40,
		    style:{
		    	fontSize:'14px',
		    	textAlign:'right'
		    }
	 	},
		name:
    	{
    		fieldLabel: 'Bezeichnung',
		    disabledClass: 'x-item-disabled-view',
		    id:'receipt_position_name',
		    name:'name',
		    value:null,
		    width: 320
    	},
    	description:
		{
			xtype: 'textarea',
			fieldLabel: 'Beschreibung',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_position_description',
			name:'description',
			width: 320,
			height: 120
		}, 
		comment:
		{
			xtype: 'textarea',
			fieldLabel: 'zus. Beschreibung/Bemerkung',
			disabledClass: 'x-item-disabled-view',
			id:'receipt_position_comment',
			name:'comment',
			width: 320,
			height: 120
		}, 
		total_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt netto', 
		    id:'receipt_position_total_netto',
		    name:'total_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Gesamt brutto', 
		    id:'receipt_position_total_brutto',
		    name:'total_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total1_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Preis netto', 
		    id:'receipt_position_total1_netto',
		    name:'total1_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total1_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Preis brutto', 
		    id:'receipt_position_total1_brutto',
		    name:'total1_brutto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total2_netto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zuschlag netto', 
		    id:'receipt_position_total2_netto',
		    name:'total2_netto',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:180
	 	},
	 	total2_brutto:
		{
	 		xtype: 'sopencurrencyfield',
	    	fieldLabel: 'Zuschlag brutto', 
		    id:'receipt_position_total2_brutto',
		    name:'total2_brutto',
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
		    id:'receipt_position_total_weight',
		    name:'total_weight',
		    value:null,
		    width: 150
    	},
	   	optional:		    
		{
			xtype: 'checkbox',
			disabledClass: 'x-item-disabled-view',
			id: 'receipt_position_optional',
			name: 'optional',
			hideLabel:true,
		    boxLabel: 'ist optionale Position',
		    width: 150
		},
		add_percentage:
		{
	 		xtype: 'extuxpercentcombo',
	    	fieldLabel: 'Satz Zuschlag %', 
		    id:'receipt_position_add_percentage',
		    name:'add_percentage',
	    	disabledClass: 'x-item-disabled-view',
	    	blurOnSelect: true,
	 	    width:150
	 	}
	};
};