/*
 * Tine 2.0
 * 
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Application.js 18009 2010-12-22 09:14:58Z p.schuele@metaways.de $
 */
 
Ext.ns('Tine.Billing');

/**
 * @namespace   Tine.Billing
 * @class       Tine.Billing.Application
 * @extends     Tine.Tinebase.Application
 * 
 * @author      Philipp Schüle <p.schuele@metaways.de>
 * @version     $Id: Application.js 18009 2010-12-22 09:14:58Z p.schuele@metaways.de $
 */
Tine.Billing.Application = Ext.extend(Tine.Tinebase.Application, {
    
    hasMainScreen: true,
    addressbookPlugin: null,
    
	init: function(){
		Tine.Tinebase.appMgr.on('initall',this.onInitAll,this);
	},
	
	onInitAll: function(){
		this.addressbookPlugin = new Tine.Billing.AddressbookPlugin();
		Tine.Tinebase.appMgr.get('Addressbook').registerPlugin(this.addressbookPlugin);
		this.registerPlugin(this.addressbookPlugin);
	},
    /**
     * Get translated application title of this application
     * 
     * @return {String}
     */
    getTitle: function() {
        return this.i18n.gettext('ERP');
    }
});
