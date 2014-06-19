Tine.Billing.QuickOrderWidget = function(config) {
    Ext.apply(this, config);
    Tine.Billing.QuickOrderWidget.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.QuickOrderWidget, Ext.Panel, {
	initComponent: function(){
        this.initTemplate();
       Tine.Billing.QuickOrderWidget.superclass.initComponent.call(this);
	},
    initTemplate: function() {
        this.tpl = new Ext.XTemplate(
            '<tpl for=".">',
        		 '<div class="contact-widget">',                
                 '<div class="bordercorner_1"></div>',
                 '<div class="bordercorner_2"></div>',
                 '<div class="bordercorner_3"></div>',
                 '<div class="bordercorner_4"></div>',
                 '<div class="contact-widget-contact">',
                	'<span class="preview-panel-bold">Auftrags-Nr: {[this.encode(values.order_nr, "mediumtext")]}</span><br/>',
                   	'<span class="preview-panel-bold">Rechnungs-Nr: {[this.encode(values.invoice_nr, "mediumtext")]}</span><br/>',
                   	'<span class="preview-panel-bold">Lieferschein-Nr: {[this.encode(values.invoice_nr, "mediumtext")]}</span><br/>',
                 '</div>',
                 '<div class="contact-widget-contact">',
             		'<span class="preview-panel-bold">{[this.encode(values.n_fileas, "mediumtext")]}</span><br/>',
             		'<span class="preview-panel-bold">{[this.encode(values.org_name, "mediumtext")]}</span>',
                 '</div>',
         
                 '<div class="contact-widget-address">',
	              	  '{[this.encode(values.adr_one_street)]}<br/>',
	                  '{[this.encode(values.adr_one_postalcode, " ")]}{[this.encode(values.adr_one_locality)]}',
	                  ' {[this.encode(values.adr_one_countryname, "country")]}<br/>',
	              '</div>',
             '</div>',
         '</div>',
         '</tpl>',
         {
             /**
              * encode
              */
             encode: function(value, type, prefix) {
                 //var metrics = Ext.util.TextMetrics.createInstance('previewPanel');
                 if (value) {
                     if (type) {
                         switch (type) {
                             case 'country':
                                 value = Locale.getTranslationData('CountryList', value);
                                 break;
                             case 'longtext':
                                 value = Ext.util.Format.ellipsis(value, 135);
                                 break;
                             case 'mediumtext':
                                 value = Ext.util.Format.ellipsis(value, 30);
                                 break;
                             case 'shorttext':
                                 ////console.log(metrics.getWidth(value));
                                 value = Ext.util.Format.ellipsis(value, 18);
                                 break;
                             case 'prefix':
                                 if (prefix) {
                                     value = prefix + value;
                                 }
                                 break;
                             default:
                                 value += type;
                         }                           
                     }
                     value = Ext.util.Format.htmlEncode(value);
                     return Ext.util.Format.nl2br(value);
                 } else {
                     return '';
                 }
             }        }
        );
    },
    /**
     * update template
     * 
     * @param {Tine.Tinebase.data.Record} record
     * @param {Mixed} body
     */
    updateRecord: function(record, body) {
        this.tpl.overwrite(body, record.data);
    },
    
    onLoadQuickOrder: function(record){
    	this.onRecordUpdate(record);
    },
    
    onRecordUpdate: function(record){
    	this.record = record;
    	this.updateRecord(this.record, this.body);
    }
});

Ext.reg('quickorderwidget',Tine.Billing.QuickOrderWidget);