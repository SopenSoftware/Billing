Ext.namespace('Tine.Billing');
Ext.namespace('Tine.Billing.renderer');

Tine.Billing.renderer.contactRenderer =  function(_recordData) {
	if(!_recordData){
		return null;
	}
	_record = new Tine.Addressbook.Model.Contact(_recordData,_recordData.id);
	if(typeof(_record) === 'object' && !Ext.isEmpty(_record)){
		try{
			// focus organisation -> true
			return _record.getTitle(true);
		}catch(e){
			return "";
		}
	}
};

Tine.Billing.renderer.jobRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var creditor = new Tine.Billing.Model.Job(obj, obj.id);
			var contact = creditor.getContact();
			// focus organisation -> true
			return creditor.get('job_nr') + ' ' + creditor.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.batchJobRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var job = new Tine.Billing.Model.BatchJob(obj, obj.id);
			
			// focus organisation -> true
			return job.get('job_nr') + ' ' + job.get('job_name1');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.openItemRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var op = new Tine.Billing.Model.OpenItem(obj, obj.id);
			// focus organisation -> true
			return op.get('op_nr') + ' ' + op.get('total_brutto');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.orderRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var order = new Tine.Billing.Model.Order(obj, obj.id);
			return order.get('order_nr');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.receiptRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var r = new Tine.Billing.Model.Receipt(obj, obj.id);
			var t = '';
			switch(r.get('type')){
			case 'INVOICE':
				t = 'Rech. ' + r.get('invoice_nr');
				break;
			case 'CREDIT':
				t = 'Gutschr. ' + r.get('credit_nr');
			}
			
			return t;
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.creditorRenderer =  function(obj, meta, record) {

	if(!obj){
		return null;
	}
	//_record = new Tine.Billing.Model.Creditor(_recordData,_recordData.id);
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var creditor = new Tine.Billing.Model.Creditor(obj, obj.id);
			var contact = creditor.getContact();
			// focus organisation -> true
			return creditor.get('creditor_nr') + ' ' + contact.getTitle();
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.debitorRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var debitor = new Tine.Billing.Model.Debitor(obj, obj.id);
			var contact = debitor.getContact();
			// focus organisation -> true
			return debitor.get('debitor_nr') + ' ' + contact.getTitle();
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.articleRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	//_record = new Tine.Billing.Model.Creditor(_recordData,_recordData.id);
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var article = new Tine.Billing.Model.Article(obj, obj.id);
			//var contact = article.getContact();
			// focus organisation -> true
			var title = article.get('article_title');
			return title;
		}catch(e){
			alert(e.message);
			return "";
		}
	}else{
		 var articleStore = Tine.Billing.getStore(Tine.Billing.Model.Article, 'Billing.getAllArticles');
		 var article = articleStore.getById(parseInt(obj));
		 if(article){
			 article = new Tine.Billing.Model.Article(article.data, article.id);
			 return article.get('article_title');
		 }
		 return "";
	}
};

Tine.Billing.renderer.vatRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	var vRec = null;
	var data = null;
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		if(obj.data !== undefined){
			data = obj.data;
		}else{
			data = obj;
		}
		vRec = new Tine.Billing.Model.Vat(data, data.id);
	}else{
		vRec = Tine.Billing.getVatById(obj);
	}
	try{
		var vatResult = vRec.get('name');
		return  vatResult + ' %';
	}catch(e){
		alert(e.message);
		return "";
	}
};

Tine.Billing.renderer.priceGroupRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			if(obj.data !== undefined){
				obj = obj.data;
			}
			var vat = new Tine.Billing.Model.PriceGroup(obj, obj.id);
			return vat.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}else{
		 var priceGroupStore = Tine.Billing.getStore(Tine.Billing.Model.PriceGroup, 'Billing.getAllPriceGroups');
		 var priceGroup = priceGroupStore.getById(parseInt(obj));
		 if(priceGroup){
			 priceGroup = new Tine.Billing.Model.PriceGroup(priceGroup.data, priceGroup.id);
			 return priceGroup.get('name');
		 }
		 return "";
	}
};


Tine.Billing.renderer.debitorGroupRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			if(obj.data !== undefined){
				obj = obj.data;
			}
			var vat = new Tine.Billing.Model.DebitorGroup(obj, obj.id);
			return vat.get('name');
		}catch(e){
			alert(e.message);
			
		}
	}
	return "";
};

Tine.Billing.renderer.articleUnitRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var vat = new Tine.Billing.Model.ArticleUnit(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return vat.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.articleSeriesRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var vat = new Tine.Billing.Model.ArticleSeries(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return vat.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.accountClassRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.AccountClass(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.accountSystemRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.AccountSystem(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('number') + ' ' + obj.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.bookingRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.Booking(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('booking_nr') + ' ' + obj.get('booking_text');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.paymentRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.Payment(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('id') + ' ' + obj.getAmountFormatted();
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.bankRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.Bank(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('country_code') + ' BLZ: ' + obj.get('code') + ' ' + obj.get('name') + " BIC: " + obj.get('bic');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.bankAccountRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.BankAccount(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('iban') + ' BLZ: ' + obj.get('bank_code') + ' ' + obj.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.sepaCreditorRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.SepaCreditor(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.getTitle();
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};


Tine.Billing.renderer.batchJobDtaRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var obj = new Tine.Billing.Model.BatchJobDta(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return obj.get('id') + ' ' + obj.get('amount');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.paymentMethodRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			console.log(obj);
			var vat = new Tine.Billing.Model.PaymentMethod(obj, obj.id);
			//var contact = vat.getContact();
			// focus organisation -> true
			return vat.get('name');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.stockLocationRenderer =  function(obj, meta, record) {
	if(!obj){
		return null;
	}
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj)){
		try{
			var stockLocation = new Tine.Billing.Model.StockLocation(obj, obj.id);
			// focus organisation -> true
			return stockLocation.get('location');
		}catch(e){
			alert(e.message);
			return "";
		}
	}
};

Tine.Billing.renderer.articleGroup = function(v){
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj) && v.name!==undefined){
		return v.name;
	}else{
		return null;
	}
};

Tine.Billing.renderer.vat = function(v){
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj) && v.name!==undefined){
		return v.name + ' %';
	}else{
		return null;
	}
};

Tine.Billing.renderer.articleUnit = function(v){
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj) && v.name!==undefined){
		return v.name;
	}else{
		return null;
	}
};

Tine.Billing.renderer.articleSeries = function(v){
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj) && v.name!==undefined){
		return v.name;
	}else{
		return null;
	}
};

Tine.Billing.renderer.priceGroup = function(v){
	if(typeof(obj) === 'object' && !Ext.isEmpty(obj) && v.name!==undefined){
		return v.name;
	}else{
		return null;
	}
};

Tine.Billing.renderer.productionCostTypeRenderer = function(v){
	switch(v){
	case 'DELIVERY':
		return 'Lieferung';
	case 'OWNPRODUCTION':
		return 'Eigenleistung';
	case 'STOCK':
		return 'Lager';
	case 'MANUAL':
		return 'Manuell';
	}
};

Tine.Billing.renderer.stockFlowDirectionRenderer = function(v){
	switch(v){
	case 'IN':
		return 'Zugang';
	case 'OUT':
		return 'Abgang';
	}
};


Tine.Billing.renderer.accountClassTypeRenderer = function(v){
	switch(v){
	case 'ACTIVE':
		return 'Aktivkonto';
	case 'PASSIVE':
		return 'Passivkonto';
	}
};

Tine.Billing.renderer.accountAccountTypeRenderer = function(v){
	switch(v){
	case 'NOMINAL':
		return 'Erfolgskonto';
	case 'INVENTORY':
		return 'Bestandskonto';
	}
};


Tine.Billing.renderer.accountBookingTypeRenderer = function(v){
	switch(v){
	case 'CREDIT':
		return 'H';
	case 'DEBIT':
		return 'S';
	}
};

Tine.Billing.renderer.debitorAccountItemTypeRenderer = function(v){
	switch(v){
	case 'PAYMENT':
		return 'Zahlung';
	case 'DISAGIO':
		return 'Abschlag';
	case 'CREDIT':
		return 'Gutschrift';
	case 'DEBIT':
		return 'Belastung';
	}
};

Tine.Billing.renderer.paymentTypeRenderer = function(v){
	switch(v){
	case 'CREDIT':
		return 'Ausgang';
	case 'DEBIT':
		return 'Eingang';
	}
};

Tine.Billing.renderer.erpContextRenderer = function(v){
	switch(v){
	case 'ERP':
		return 'ERP allgemein';
	case 'MEMBERSHIP':
		return 'Mitglieder';
	case 'DONATOR':
		return 'Spenden';
	case 'FUNDPROJECT':
		return 'Förderprojekte';
	case 'EVENTMANAGER':
		return 'Veranstaltungen';
	}
};

Tine.Billing.renderer.overpayRenderer = function(v){
	switch(v){
	case 'DONATION':
		return 'Spende';
	case 'PREPAYMEMBERFEE':
		return 'Vorausz. Mitgl.beitr.';
	
	}
};

Tine.Billing.renderer.isDefault = function(v){
	switch(v){
	case '0':
		return '';
	case '1':
		return 'Ja';
	}
};

Tine.Billing.renderer.percentage = function(v){
	return v + ' %';
};

Tine.Billing.getOpenItemStateIcon = function(value, meta, record){
	var qtip, icon;
	var paymentState = record.get('state');
	switch(paymentState){
	case 'OPEN':
		qtip = 'offen';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-busy.png';
		
		break;
	case 'DONE':
		qtip = 'erledigt/bezahlt';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-online.png';

		break;
	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.getMT940PaymentStateIcon = function(value, meta, record){
	var qtip, icon;
	var paymentState = record.get('state');
	switch(paymentState){
	case 'RED':
		qtip = 'Keine Zuordnung möglich';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'agt_action_fail.png';
		break;
	case 'ORANGE':
		qtip = 'Debitor gefunden, aber kein offener Posten';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'status_unknown.png';
		break;
	case 'GREEN':
		qtip = 'Zudordnung vollständig';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'agt_action_success.png';
		break;
		
	}
	
		return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
	//return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.getReceiptStateIcon = function(value, meta, record){
	var qtip, icon;
	var paymentState = record.get('receipt_state');
	switch(paymentState){
	case 'VALID':
		qtip = 'aktiv';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'gg_offline.png';
	
		break;
	case 'REVERTED':
		qtip = 'storniert';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-busy.png';
		
		break;
	case 'PARTLYREVERTED':
		qtip = 'teilstorniert';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/dialog-warning.png';
		
		break;
	case 'ISREVERSION':
		qtip = 'ist Storno';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-online.png';

	case 'ISPARTREVERSION':
		qtip = 'ist Teilstorno';
		icon = Sopen.Config.runtime.resourceUrl.tine.images + 'oxygen/16x16/status/user-online.png';

		break;
	}
	return '<img class="TasksMainGridStatus" src="' + icon + '" ext:qtip="' + qtip + '">';
};

Tine.Billing.renderer.actionTypeRenderer = function(v){
	switch(v){
	case 'MANUAL':
		return 'manuell';
	case 'AUTO':
		return 'automatisch';
	default:
		return v;
	}
}

Tine.Billing.renderer.actionStateRenderer = function(v){
	switch(v){
	case 'OPEN':
		return 'offen';
	case 'DONE':
		return 'erledigt';	
	case 'ERROR':
		return 'Fehler';
	default:
		return v;
	}
}

Tine.Billing.renderer.bankAccountValidRenderer = function(v){
	switch(v){
	case 'YES':
		return 'Ja';
	case 'UNKNOWN':
		return 'Unbekannt';	
	case 'NO':
		return 'Nein';
	default:
		return v;
	}
}

Tine.Billing.renderer.sepaMandateStateRenderer = function(v){
	switch(v){
	case 'GENERATED':
		return 'zu bestätigen';
	case 'COMMUNICATION':
		return 'in Bearbeitung';	
	case 'CONFIRMED':
		return 'bestätigt';
	default:
		return v;
	}
}

Tine.Billing.renderer.ibanRenderer = function(v){
	var b = v.match(/(.{1,4})/g);
	return b.join(' ');
}

