Ext.ns('Tine.Billing');

Tine.Billing.Constants = {
	Calculation:{
		DIRECTION_NETTO_BRUTTO: 1,		
		DIRECTION_BRUTTO_NETTO: 2
	},
	ArticleSupplier: {
		PERSPECTIVE_ARTICLE: 1,
		PERSPECTIVE_CREDITOR: 2
	},
	ArticleCustomer: {
		PERSPECTIVE_ARTICLE: 1,
		PERSPECTIVE_DEBITOR: 2
	}
};

Tine.Billing.Config = {
	QuickOrder:{
		Strategy:{
			// method for debitor used in quick order
			Debitor:{
				//method: 'Billing.getDebitorByContactId'
				method: 'Billing.getDebitorByContactOrCreate'
				// alternative: 'Billing.getDebitorByContactOrCreate' -> creates debitor instantly if not existent
				// to be overridden in custom.js
			}
		}
	}
};