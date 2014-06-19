Tine.Billing.ArticleWidget = function(config) {
    Ext.apply(this, config);
    Tine.Billing.ArticleWidget.superclass.constructor.call(this);
};

Ext.extend(Tine.Billing.ArticleWidget, Ext.Panel, {
	editDialog: null,
	ddConfig:{
    	ddGroupArticle: 'ddGroupArticle',
    	ddGroupGetArticle: 'ddGroupGetArticle'
    },
	initComponent: function(){
        // init templates
        this.initTemplate();
        this.initDefaultTemplate();
		this.on('afterrender',this.onAfterRender,this);
		Tine.Billing.ArticleWidget.superclass.initComponent.call(this);
		//this.editDialog.on('loadarticle',this.onLoadArticle,this);
	},
    /**
     * init default template
     */
    initDefaultTemplate: function() {
        this.defaultTpl = new Ext.XTemplate(
                '<div class="preview-panel-timesheet-nobreak">',    
                '<!-- Preview contacts -->',
                '<div class="preview-panel preview-panel-timesheet-left">',
                    '<div class="preview-panel-declaration">Articles</div>',
                    '<div class="preview-panel-timesheet-leftside preview-panel-left">',
                        '<span class="preview-panel-bold">',
                            '<br/>',
                            '<br/>',
                            '<br/>',
                            '<br/>',
                        '</span>',
                    '</div>',
                '</div>',
            '</div>'  		
        );
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
                	'<span class="preview-panel-bold">Artikel-Nr: {[this.encode(values.id, "mediumtext")]}</span><br/>',
                   	'<span class="preview-panel-bold">Bezeichung: {[this.encode(values.name, "mediumtext")]}</span><br/>',
                 '</div>',
                 '<div class="contact-widget-contact">',
             		'<span class="preview-panel-bold">{[this.encode(values.article_ext_nr, "mediumtext")]}</span><br/>',
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
             },
             
             /**
              * get tags
              * 
              * TODO make it work
              */
             getTags: function(value) {
                 var result = '';
                 for (var i=0; i<value.length; i++) {
                     result += value[i].name + ' ';
                 }
                 return result;
             },
             
             /**
              * get image url
              */
             getImageUrl: function(url, width, height) {
                 if (url.match(/&/)) {
                     url = Ext.ux.util.ImageURL.prototype.parseURL(url);
                     url.width = width;
                     url.height = height;
                     url.ratiomode = 0;
                 }
                 return url;
             },

             /**
              * get email link
              */
             getMailLink: function(email, felamimail) {
                 if (! email) {
                     return '';
                 }
                 
                 var link = (felamimail === true) ? '#' : 'mailto:' + email;
                 var id = Ext.id() + ':' + email;
                 
                 return '<a href="' + link + '" class="tinebase-email-link" id="' + id + '">'
                     + Ext.util.Format.ellipsis(email, 18) + '</a>';
             }
         }
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
    
    /**
     * show default template
     * 
     * @param {Mixed} body
     */
    showDefault: function(body) {
        if (this.defaultTpl) {
            this.defaultTpl.overwrite(body);
        }
    },
    
    onLoadArticle: function(record){
    	this.onRecordUpdate(record);
    },
    
    onRecordUpdate: function(record){
    	this.record = record;
    	this.updateRecord(this.record, this.body);
    },
    
    onAfterRender: function(){
    	this.initDropZone();
    },
    
    initDropZone: function(){
    	if(!this.ddConfig){
    		return;
    	}
		this.dd = new Ext.dd.DropTarget(this.el, {
			scope: this,
			ddGroup     : this.ddConfig.ddGroupArticle,
			notifyEnter : function(ddSource, e, data) {
				this.scope.el.stopFx();
				this.scope.el.highlight();
			},
			notifyDrop  : function(ddSource, e, data){
				var result = this.scope.editDialog.onDrop(ddSource,e,data);
				var record = this.scope.editDialog.extractRecordFromDrop(ddSource,e,data);
				this.scope.onRecordUpdate(record);
				return result;
			}
		});
		
		this.dd.addToGroup(this.ddConfig.ddGroupGetArticle);
	}
});

Ext.reg('articlewidget',Tine.Billing.ArticleWidget);