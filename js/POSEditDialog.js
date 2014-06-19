Ext.namespace('Tine.Billing');

Tine.Billing.POSEditDialog = Ext
		.extend(
				Ext.form.FormPanel,
				{
					windowNamePrefix : 'POSEditWindow_',
					title : 'Kasse',
					// mode: 'local',
					appName : 'Billing',
					recordClass : Tine.Billing.Model.QuickOrder,
					loadRecord : false,
					evalGrants : false,
					isSaving : false,
					isClosing : false,
					contactRecord : null,
					initialContactRecord : null,
					/**
					 * {Tine.Billing.QuickOrderGridPanel} positions grid
					 */
					grid : null,
					/**
					 * initialize component
					 */
					initComponent : function() {
						this.addEvents('contactchanged', 'dropcontact',
								'debitorchanged');
						this.initActions();
						// this.initToolbar();
						var contactRecord = (this.contactRecord !== undefined) ? this.contactRecord
								: null;
						var debitorRecord = (this.debitorRecord !== undefined) ? this.debitorRecord
								: null;
						this.record = new Tine.Billing.Model.QuickOrder({
							contact_id : contactRecord,
							debitor_id : debitorRecord
						}, 0);
						this.tbar = new Ext.Toolbar([ this.action_addContact ]);
						this.items = [ this.getFormItems() ];
						this.on('afterrender', this.onAfterRender, this);
						Tine.Billing.POSEditDialog.superclass.initComponent
								.call(this);
						Ext.getCmp('billing_contact_id').on('change',
								this.onChangeContact, this);
						Ext.getCmp('billing_contact_id').on('select',
								this.onChangeContact, this);
						Ext.getCmp('billing_contact_id').on('afterdrop',
								this.onDropContact, this);

						this.getForm().loadRecord(this.record);
						this.getForm().clearInvalid();
					},
					onAfterRender : function() {
						if (this.initialContactRecord) {
							Ext.getCmp('billing_contact_id').setValue(
									this.initialContactRecord);
							Ext.getCmp('billing_contact_person_id').setContactRecord(
									this.initialContactRecord);
							this.onDropContact(
									Ext.getCmp('billing_contact_id'),
									this.initialContactRecord);

							// this.checkDebitor(this.initialContactRecord.get('id'));
							// this.fireEvent('contactchanged', this,
							// this.initialContactRecord);
						}
					},
					setInitialContactRecord : function(initialContactRecord) {

						this.initialContactRecord = initialContactRecord;
					},
					initActions : function() {
						this.action_addContact = new Ext.Action({
							actionType : 'edit',
							handler : this.onAddContact,
							iconCls : 'actionAdd',
							text : 'Neuen Kontakt anlegen und verwenden',
							scope : this
						});
					},
					resetDialog : function() {
						this.contactRecord = new Tine.Addressbook.Model.Contact(
								{id:0, n_given:'',n_family:'',n_fn:''}, 0);
						//this.contactRecord = null;
						this.debitorRecord = null;
						this.record = new Tine.Billing.Model.QuickOrder({
							contact_id : this.contactRecord,
							debitor_id : this.debitorRecord
						}, 0);
						this.getForm().reset();
						//this.grid.getStore().removeAll();
						//this.getContactWidget().onLoadContact(
						//		this.contactRecord);

						this.onDropContact(
								Ext.getCmp('billing_contact_id'),
								this.contactRecord);

						Ext.getCmp('billing_contact_id').setValue(
								this.contactRecord);
						this.fireEvent('contactchanged', this,
								this.contactRecord);
					},
					setDefaultConfigs : function(mode) {
						this.mode = mode;
						if (!this.rendered) {
							this.setDefaultConfigs.defer(250, this, [ mode ]);
							return;
						}
						// set default configs depending on mode of main panel
						// STANDARD or POS by now
						switch (mode) {
						case 'POS':
							Ext.getCmp('billing_print_at_once').setValue(true);
							Ext.getCmp('billing_print_with_copy')
									.setValue(true);
							Ext.getCmp('billing_payment_method').setValue(
									'CASH');
							Ext.getCmp('billing_payment_state').setValue(
									'PAYED');

							break;
						}
					},
					onRender : function(ct, position) {
						Tine.Billing.POSEditDialog.superclass.onRender.call(
								this, ct, position);
						this.loadMask = new Ext.LoadMask(ct, {
							msg : 'Versuche Debitor zu laden'
						});
						if (this.contactRecord) {
							this.checkDebitor(this.contactRecord.id);
						}
					},
					onChangeContact : function(sel) {
						this.contactRecord = sel.selectedRecord;
						Ext.getCmp('billing_contact_person_id').setContactRecord(this.contactRecord);
						this.fireEvent('contactchanged', this,
								this.contactRecord);
						// this.getContactWidget().onLoadContact(this.contactRecord);
						this.checkDebitor(this.contactRecord.id);
					},
					onUpdateContact : function(contact) {
						var data = Ext.util.JSON.decode(contact);
						//this.onChangeContact({selectedRecord: });
						this.contactRecord = new Tine.Addressbook.Model.Contact(data, data.id);
						this.onDropContact(
								Ext.getCmp('billing_contact_id'),
								this.contactRecord
								);
						Ext.getCmp('billing_contact_id').setValue(this.contactRecord);
						/*if (this.contactRecord
								&& (this.contactRecord.id !== undefined)
								&& (this.bufferContact.id == this.contactRecord.id)) {
							return true;
						}
						this.bufferContact = Ext.util.JSON.decode(contact);
						
						if (this.grid.getStore().getCount() > 0) {
							Ext.MessageBox
									.show({
										title : 'Auftragserfassung aktiv',
										msg : 'Möchten Sie den aktuellen Auftrag hiermit speichern, um dann mit dem neuen Debitor fortzufahren?',
										buttons : Ext.Msg.YESNOCANCEL,
										scope : this,
										fn : this.intermediateOrder,
										icon : Ext.MessageBox.QUESTION
									});
						} else {
							this.reloadExternally();
						}*/
					},
					intermediateOrder : function(btn, text) {
						if (btn == 'yes') {
							this.saveQuickOrder();
						} else if (btn == 'cancel') {
							return;
						}
						this.reloadExternally.defer(500, this);
					},
					reloadExternally : function() {
						if (this.isSaving) {
							this.reloadExternally.defer(200, this);
						}
						this.resetDialog();
						contact = this.bufferContact;
						if (contact.id == 0) {
							return true;
						}
						this.contactRecord = new Tine.Addressbook.Model.Contact(
								contact, contact.id);
						this.contactSelector.setValue(this.contactRecord);
						this.contactPersonSelector.setContactRecord(this.contactRecord);
						// maybe contact widget is not initialized
						try {
							this.getContactWidget().onLoadContact(
									this.contactRecord);
						} catch (e) {
							// silent failure ok
						}
						this.checkDebitor(this.contactRecord.id);
					},
					onDropContact : function(el, contactRecord) {
						this.contactRecord = contactRecord;
						this.contactPersonSelector.setContactRecord(contactRecord);
						this.fireEvent('contactchanged', this,
								this.contactRecord);
						// this.getContactWidget().onLoadContact(this.contactRecord);
						this.checkDebitor(this.contactRecord.id);
						if (!Ext.getCmp('billing_payment_method').getValue()) {
							Ext.getCmp('billing_payment_method')
									.selectDefault();
						}
					},
					onAddContact : function() {
						var debitorFields = Tine.Billing.DebitorFormFields.get();
						this.contactWin = Tine.Addressbook.ContactQuickEditDialog
								.openWindow({
									simpleDialog : true,
									additionalFieldNames:[
									    'debitor_group_id'
									],
									additionalFields:[
									   [debitorFields.debitor_group_id]
									],
								
									listeners : {
										update : {
											scope : this,
											fn : this.onUpdateContact
										}
									}
								});
						// this.contactWin.on('close',this.onReloadSelectionGrid,this);
					},
					/**
					 * load contact from widget
					 */
					onLoadContact : function(el, contactRecord) {
						this.onDropContact(el, contactRecord);
					},
					checkDebitor : function(contactId) {
						if(contactId==0){
							return;
						}
						var additionalData = null;
						if(this.contactWin){
							additionalData = this.contactWin.items.itemAt(0).getAdditionalValues();
							this.contactWin = null;
						}
						this.loadMask.show();
						Ext.Ajax
								.request({
									scope : this,
									params : {
										method : Tine.Billing.Config.QuickOrder.Strategy.Debitor.method,
										contactId : contactId,
										additionalData: Ext.util.JSON.encode(additionalData)
									},
									success : function(response) {
										var result = Ext.util.JSON
												.decode(response.responseText);
										if (result.success) {
											this.loadMask.hide();
											var data = {
												contactRecord : this.contactRecord,
												debitorRecord : new Tine.Billing.Model.Debitor(
														result.result,
														result.result.id)
											};
											var debitorNrField = Ext
													.getCmp('debitor_debitor_nr');
											debitorNrField
													.setValue(result.result.debitor_nr);
											var debitorPGField = Ext
													.getCmp('debitor_price_group_id');
											debitorPGField
													.setValue(new Tine.Billing.Model.PriceGroup(
															result.result.price_group_id));
											this.fireEvent('debitorchanged',
													data);
										} else {
											Ext.Msg
													.alert('Fehler',
															'Kunde konnte nicht abgefragt werden');
										}
									},
									failure : function(response) {
										var result = Ext.util.JSON
												.decode(response.responseText);
										Ext.Msg
												.alert('Fehler',
														'Kunde konnte nicht abgefragt werden');
									}
								});
					},

					/**
					 * returns dialog
					 * 
					 * NOTE: when this method gets called, all initalisation is
					 * done.
					 */
					getFormItems : function() {
						// use some fields from brevetation edit dialog
						var debitorFormFields = Tine.Billing.DebitorFormFields
								.get();
						this.contactSelector = Tine.Addressbook.Custom
								.getRecordPicker(
										'Contact',
										'billing_contact_id',
										{
											width : 300,
											name : 'contact_id',
											blurOnSelect : true,
											allowBlank : false,
											ddConfig : {
												ddGroup : 'ddGroupContact',
												ddGroupGetForeign : {
													group : 'ddGroupGetContact',
													method : 'getContact'
												}
											}
										});
						this.contactPersonSelector = Tine.Addressbook.Custom
						.getRecordPicker(
								'ContactPerson',
								'billing_contact_person_id',
								{
									fieldLabel: 'Anpsprechpartner',
									width : 300,
									name : 'contact_person_id',
									blurOnSelect : true,
									allowBlank : true
								});

						return {
							xtype : 'panel',
							region : 'center',
							border : false,
							items : [ {
								xtype : 'columnform',
								items : [
										[
												{
													xtype : 'checkbox',
													disabledClass : 'x-item-disabled-view',
													id : 'billing_with_shipping_doc',
													name : 'with_shipping_doc',
													hideLabel : true,
													value : false,
													boxLabel : 'mit Lieferschein',
													width : 140
												},
												{
													xtype : 'checkbox',
													disabledClass : 'x-item-disabled-view',
													id : 'billing_print_at_once',
													name : 'print_at_once',
													hideLabel : true,
													value : false,
													boxLabel : 'sofort drucken',
													width : 140
												},
												{
													xtype : 'checkbox',
													disabledClass : 'x-item-disabled-view',
													id : 'billing_print_with_copy',
													name : 'print_with_copy',
													hideLabel : true,
													value : false,
													boxLabel : 'mit Kopie',
													width : 140
												}
										],[
												{
													xtype: 'combo',
													id:'billing_erp_context_id',
													name:'erp_context_id',
													fieldLabel: 'Kontext',
													store:[['ERP','ERP'],['MEMBERSHIP','Mitglieder'],['DONATOR','Spenden'],['EVENTMANAGER','Veranstaltungen'],['FUNDPROJECT','Förderprojekte']],
												    value: 'ERP',
													mode: 'local',
													displayField: 'name',
												    valueField: 'id',
												    triggerAction: 'all',
												    width:140
												},{
											 		xtype: 'extuxpercentcombo',
											    	fieldLabel: 'Satz Zuschlag %', 
												    id:'billing_add_percentage',
												    name:'add_percentage',
											    	disabledClass: 'x-item-disabled-view',
											    	blurOnSelect: true,
											 	    width:140
											 	},
											 	new Tine.widgets.tags.TagCombo({
										            fieldLabel: 'Tag/Schlagwort',
										            disabledClass : 'x-item-disabled-view',
										            id : 'billing_receipt_tag',
													name : 'receipt_tag',
										            anchor: '100%',
										            width:160,
										            onlyUsableTags: true,
										            app: Tine.Tinebase.appMgr.get('Billing'),
										            listeners: {
										                scope: this,
										                select: function() {
										                    this.onSelectTag();
										                }
										            }
										        }) ],
										[
												Tine.Billing.Custom
														.getRecordPicker(
																'PaymentMethod',
																'billing_payment_method',
																{
																	fieldLabel : 'Zahlungsart',
																	id : 'billing_payment_method',
																	name : 'payment_method',
																	width : 200
																}),
												{
													fieldLabel : 'Zahlungsstatus',
													disabledClass : 'x-item-disabled-view',
													id : 'billing_payment_state',
													name : 'payment_state',
													width : 140,
													xtype : 'combo',
													// disabled: true,
													// hidden: true,
													store : [
															[ 'TOBEPAYED',
																	'unbezahlt' ],
															[ 'PAYED',
																	'bezahlt' ] ],
													value : 'TOBEPAYED',
													mode : 'local',
													displayField : 'name',
													valueField : 'id',
													triggerAction : 'all'
												} ],
										[ {
											xtype : 'textarea',
											disabledClass : 'x-item-disabled-view',
											id : 'billing_special_payment_condition',
											name : 'special_payment_condition',
											fieldLabel : 'Alternative Zahlungsbedingungen',
											width : 400,
											height : 40
										} ],
										[ {
											xtype : 'fieldset',
											title : 'Kontakt',
											width : 400,
											items : [ 
											          this.contactSelector,
											          this.contactPersonSelector
											]
										} ],
										[ {
											xtype : 'fieldset',
											checkBoxToggle : true,
											name : 'Debitor',
											header : 'Debitor',
											title : 'Debitor',
											width : 400,
											items : [
													Ext
															.apply(
																	debitorFormFields.debitor_nr,
																	{
																		disabled : true
																	}),
													Ext
															.apply(
																	debitorFormFields.price_group_id,
																	{
																		disabled : true
																	}) ]
										} ] ]
							} ]
						};
					}
				});

Tine.Billing.POSCashEditHandler = function(config) {
	config = config || {};
	Ext.apply(this, config);

	Tine.Billing.POSCashEditHandler.superclass.constructor.call(this);
};

Ext
		.extend(
				Tine.Billing.POSCashEditHandler,
				Ext.util.Observable,
				{
					parentPanel : null,
					initialize : function(parentPanel) {
						this.parentPanel = parentPanel;
						this.addEvents('beforecalculate', 'calculate',
								'calculatecheckin', 'changearticle');

						Ext.getCmp('receipt_position_article_search')
								.addListener('specialkey',
										this.requestArticleOnScanner, this);
						Ext.getCmp('receipt_position_article_search')
								.addListener('afterdrop', this.onDropArticle,
										this);

						Ext.getCmp('receipt_position_price_group_id')
								.addListener('select', this.decideChangePrice,
										this);
						Ext.getCmp('receipt_position_price_group_id')
								.addListener('change', this.decideChangePrice,
										this);
						Ext.getCmp('receipt_position_amount').addListener(
								'change', this.calculate, this);
						Ext.getCmp('receipt_position_amount').addListener(
								'specialkey', this.calculateCheckin, this);

						Ext.getCmp('receipt_position_discount_percentage')
								.addListener('select', this.calculate, this);
						Ext.getCmp('receipt_position_discount_percentage')
								.addListener('change', this.calculate, this);
						Ext.getCmp('receipt_position_vat_id').addListener(
								'select', this.calculate, this);
						Ext.getCmp('receipt_position_price_netto').addListener(
								'change', this.calculate, this);
						Ext
								.getCmp('receipt_position_price_brutto')
								.addListener(
										'change',
										this.calculate
												.createDelegate(
														this,
														[ Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO ]));
						Ext.getCmp('receipt_position_price_brutto')
								.addListener('specialkey',
										this.calculateCheckinDirBrutto, this);
						this.focusFirst();
					},
					focusFirst : function() {
						Ext.getCmp('receipt_position_article_search').focus();
					},
					getDebitorRecord : function() {
						if (this.parentPanel) {
							return this.parentPanel.getDebitorRecord();
						}
						return null;
					},
					isValidForCalculation : function() {
						// if at least amount, price_brutto, article and
						// price_group are filled
						if (Ext.getCmp('receipt_position_amount').getValue()
								//&& Ext.getCmp('receipt_position_price_brutto')
								//		.getValue()
								&& Ext.getCmp('receipt_position_article_id')
										.getValue()
								&& Ext
										.getCmp(
												'receipt_position_price_group_id')
										.getValue()) {
							return true;
						}
						return false;
					},
					calculate : function(direction) {
						if (!this.isValidForCalculation()) {
							return true;
						}
						if (this.fireEvent('beforecalculate', this)) {
							this.fireEvent('calculate', direction);
						}
					},
					calculateCheckin : function(field, ev) {
						if (!this.isValidForCalculation()) {
							return true;
						}
						if (ev.getKey() == ev.ENTER) {
							if (this.fireEvent('beforecalculate', this)) {
								this.fireEvent('calculatecheckin');
							}
						} else {
							this.calculate();
						}
					},
					calculateCheckinDirBrutto : function(field, ev) {
						if (!this.isValidForCalculation()) {
							return true;
						}
						if (ev.getKey() == ev.ENTER) {
							if (this.fireEvent('beforecalculate', this)) {
								this
										.fireEvent(
												'calculatecheckin',
												Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
							}
						} else {
							this
									.calculate(Tine.Billing.Constants.Calculation.DIRECTION_BRUTTO_NETTO);
						}
					},
					decideChangePrice : function() {
						Ext.MessageBox
								.show({
									title : 'Hinweis: Preisänderung',
									msg : 'Soll mit dieser Änderung ein <br/>anderer Nettopreis für diese Position übernommen werden?',
									buttons : Ext.Msg.YESNO,
									scope : this,
									fn : this.setPriceFromArticle,
									icon : Ext.MessageBox.QUESTION
								});
					},
					decideChangeArticle : function() {
						Ext.MessageBox
								.show({
									title : 'Hinweis: Änderung des Artikels',
									msg : 'Mit dieser Änderung wird die Position überschrieben.<br/>Soll dies erfolgen?',
									buttons : Ext.Msg.YESNO,
									scope : this,
									fn : this.changeArticle,
									icon : Ext.MessageBox.QUESTION
								});
					},
					/**
					 * get article record from article recordchooser
					 * 
					 * @return {Tine.Billing.Model.Article}
					 * 
					 */
					getArticleRecord : function() {
						return this.articleRecord;
					},
					_sleep : function() {
						// do nothing
					},
					loadArticleFromRequest : function(articleRecord) {
						this.articleRecord = articleRecord;
						this.onLoadArticle();
					},
					onDropArticle : function(el, articleRecord) {
						if (articleRecord.store !== undefined) {
							delete articleRecord.store;
						}
						this.loadArticleFromRequest(articleRecord);
					},
					onLoadArticle : function() {
						this.articleLoaded = true;
						var prices = this.getPriceFromArticle();
						if (this.fireEvent('changearticle', this.articleRecord,
								prices, this.getDebitorRecord())) {
							// no before calculate here: this would take the old
							// values from the form and override the ones, just
							// set.
							this.fireEvent('calculate');
						}
					},
					getSelectedPriceGroup : function() {
						var priceGroupRecord = null;
						var priceGroupCombo = Ext
								.getCmp('receipt_position_price_group_id');
						var priceGroupRecord = priceGroupCombo.selectedRecord;
						if (!priceGroupRecord) {
							priceGroupRecord = priceGroupCombo.store.getAt(0);
						}
						if (!priceGroupRecord) {
							priceGroupRecord = this.getDebitorRecord()
									.getForeignRecord(
											Tine.Billing.Model.PriceGroup,
											'price_group_id');
						}
						try {
							if (priceGroupRecord.store !== undefined) {
								delete priceGroupRecord.store;
							}
						} catch (e) {
							//
						}
						return priceGroupRecord;
					},
					getPriceFromArticle : function() {
						var articleRecord = this.getArticleRecord();
						var priceGroupRecord = this.getSelectedPriceGroup();
						if(articleRecord.isSimpleArticle()){
							return articleRecord.get('prices')['simple'];
						}
						if (priceGroupRecord) {
							var priceGroupId = priceGroupRecord.data.id;
							return articleRecord
									.getPriceByPriceGroup(priceGroupId);
						} else {
							throw 'No price available';
						}

					},
					setPriceFromArticle : function(btn, text) {
						if (btn != 'yes') {
							return;
						}
						try {
							var prices = this.getPriceFromArticle();
			
							if (prices) {
								Ext.getCmp('receipt_position_price_netto')
										.setValue(prices.price_netto);
								var addPercentage = Ext.getCmp('billing_add_percentage').getValue();
								var price2_netto = prices.price2_netto;
								/*if(noAdd){
									price2_netto = 0;
								}*/
								Ext.getCmp('receipt_position_price2_netto')
										.setValue(price2_netto);
								Ext.getCmp('receipt_position_add_percentage').setValue(addPercentage);
								// this.fireEvent('calculate');
								this.calculate();
							}
						} catch (e) {
							Ext.Msg
									.alert('Preis konnte nicht ermittelt werden');
						}
					},
					changeArticle : function(btn, text) {
						if (btn != 'yes') {
							return;
						}
						var articleRecord = this.getArticleRecord();
						var prices = this.getPriceFromArticle();
						if (this.fireEvent('changearticle', articleRecord,
								prices, this.getDebitorRecord())) {
							// no before calculate here: this would take the old
							// values from the form and override the ones, just
							// set.
							this.fireEvent('calculate');
						}
					},
					requestArticleOnScanner : function(field, e) {
						if (e.getKey() == e.ENTER) {
							this.requestArticleByNumber();
						}
					},

					requestArticleByNumber : function() {
						var articleNr = Ext.getCmp(
								'receipt_position_article_search').getValue();

						Ext.Ajax
								.request({
									scope : this,
									params : {
										method : 'Billing.getArticleByNumber',
										articleNr : articleNr
									},
									success : function(response) {
										var result = Ext.util.JSON
												.decode(response.responseText);
										if (result.success) {
											this
													.loadArticleFromRequest(new Tine.Billing.Model.Article(
															result.data,
															result.data.id));
										} else {
											Ext.MessageBox
													.show({
														title : 'Fehler: Artikelabfrage',
														msg : 'Der Artikel konnte nicht gefunden werden.',
														buttons : Ext.Msg.OK,
														scope : this,
														fn : function() {
															this.focusFirst();
														},
														icon : Ext.MessageBox.ERROR
													});
										}
									},
									failure : function(response) {
										var result = Ext.util.JSON
												.decode(response.responseText);
										Ext.MessageBox
												.show({
													title : 'Fehler: Artikelabfrage',
													msg : 'Der Artikel konnte nicht gefunden werden.',
													buttons : Ext.Msg.OK,
													scope : this,
													fn : function() {
														this.focusFirst()
													},
													icon : Ext.MessageBox.ERROR
												});
									}
								});
					}
				});

Tine.Billing.POSCashPanel = Ext
		.extend(
				Ext.form.FormPanel,
				{
					appName : 'Billing',
					layout : 'fit',

					/**
					 * {Tine.Billing.QuickOrderGridPanel} positions grid
					 */
					grid : null,
					debitorRecord : null,
					record : null,
					immediateCheckin : false,
					/**
					 * initialize component
					 */
					initComponent : function() {
						this.addEvents('positionready');
						this.initRecord();
						this.initActions();
						this.initToolbar();
						this.preloadStores();
						this.items = this.getFormItems();
						Tine.Billing.POSCashPanel.superclass.initComponent
								.call(this);
						this.on('afterrender', this.onAfterRender, this);
					},
					setImmediateCheckin : function(fImmediate) {
						this.immediateCheckin = fImmediate;
					},
					getImmediateCheckin : function() {
						return this.immediateCheckin;
					},
					resetForm : function() {
						this.getForm().reset();
						this.initRecord();
						Ext.getCmp('receipt_position_article_search').focus();
					},
					initRecord : function() {
						var opData = {
								// Position amount by default
								// @todo: make configurable
							//amount : 1
						};
						this.record = new Tine.Billing.Model.OrderPosition(
								opData);
					},
					focusFirst : function() {
						this.editHandler.focusFirst();
					},
					onRecordLoad : function() {
						this.editHandler.un('beforecalculate',
								this.onBeforeCalculate, this);
						this.editHandler
								.un('calculate', this.onCalculate, this);
						this.editHandler.un('calculatecheckin',
								this.onCalculateCheckin, this);
						this.editHandler.un('changearticle',
								this.onChangeArticle, this);
						this.getForm().loadRecord(this.record);
						this.getForm().clearInvalid();
						this.editHandler.on('beforecalculate',
								this.onBeforeCalculate, this);
						this.editHandler
								.on('calculate', this.onCalculate, this);
						this.editHandler.on('calculatecheckin',
								this.onCalculateCheckin, this);
						this.editHandler.on('changearticle',
								this.onChangeArticle, this);
					},
					/**
					 * executed when record gets updated from form
					 */
					onRecordUpdate : function() {
						var form = this.getForm();

						// merge changes from form into record
						form.updateRecord(this.record);

						// TODO: remove hack
						try {
							if (this.record.data.article_id.store !== undefined) {
								delete this.record.data.article_id.store;
							}
						} catch (e) {

						}
					},
					setDebitorRecord : function(debitor) {
						this.debitorRecord = debitor;
					},
					getDebitorRecord : function() {
						return this.debitorRecord;
					},
					preloadStores : function() {
						// preload vat store
						Tine.Billing.getVatStore();
					},
					onAfterRender : function() {
						this.editHandler = new Tine.Billing.POSCashEditHandler(
								{});
						this.editHandler.initialize(this);
						this.editHandler.on('beforecalculate',
								this.onBeforeCalculate, this);
						this.editHandler
								.on('calculate', this.onCalculate, this);
						this.editHandler.on('calculatecheckin',
								this.onCalculateCheckin, this);
						this.editHandler.on('changearticle',
								this.onChangeArticle, this);
					},
					onChangeArticle : function(newArticle, prices, debitor) {
						Tine.Billing.Model.OrderPosition.setNewArticle(
								this.record, newArticle);
						var selectedPriceGroup = this.editHandler
								.getSelectedPriceGroup();
						if (debitor.hasVatZero()) {
							this.record.set('vat_id', debitor.getVat());
						}
						this.record.set('price_group_id', selectedPriceGroup);
						this.record.set('price_netto', prices.price_netto);
						
						var addPercentage = Ext.getCmp('billing_add_percentage').getValue();
						var price2_netto = prices.price2_netto;
						/*if(noAdd){
							price2_netto = 0;
						}*/
						this.record.set('add_percentage',addPercentage);
						this.record.set('price2_netto', price2_netto);
						
						if(newArticle.get('price2_vat_id')){
							this.record.set('price2_vat_id', newArticle.getForeignRecord(Tine.Billing.Model.Vat, 'price2_vat_id'));
						}else{
							var zeroVat = Tine.Billing.getZeroVat();
							this.record.set('price2_vat_id', zeroVat.data);
						}
						Ext.getCmp('receipt_position_amount').setValue(1);
						
						this.onRecordLoad();
						return true;
					},
					getArticleRecord : function() {
						return this.editHandler.getArticleRecord();
					},
					onBeforeCalculate : function() {
						this.onRecordUpdate();
						return true;
					},
					onCalculate : function(direction) {
						this.record.calculate(direction);
						this.onRecordLoad();
						if (this.immediateCheckin) {
							this.checkin.defer(250, this);
						} else {
							Ext.getCmp('receipt_position_amount').focus();
						}
					},
					onCalculateCheckin : function(direction) {
						this.onCalculate(direction);
						if (!this.immediateCheckin) {
							this.checkin.defer(250, this);
						}
					},
					checkin : function() {
						this.fireEvent('positionready', this.record);
					},
					/**
					 * init bottom toolbar
					 */
					initToolbar : function() {

					},
					/**
					 * init toolbar (button) actions
					 */
					initActions : function() {

						this.action_addContact = new Ext.Action({
							actionType : 'edit',
							handler : this.onAddContact,
							iconCls : 'actionAdd',
							text : 'Neuen Kontakt anlegen und verwenden',
							scope : this
						});
					},

					/**
					 * returns dialog
					 * 
					 * NOTE: when this method gets called, all initalisation is
					 * done.
					 */
					getFormItems : function() {
						var fields = Tine.Billing.OrderPositionFormFields.get();

						return {
							xtype : 'panel',
							region : 'center',
							border : false,
							frame : true,
							items : [ {
								xtype : 'columnform',
								items : [
										[
												Ext
														.apply(
																fields.article_search,
																{
																	width : 300,
																	initComponent : function() {
																		Ext.form.TextField.superclass.initComponent
																				.call(this);
																		this
																				.on(
																						'afterrender',
																						this.onAfterRender,
																						this);
																	},
																	ddConfig : {
																		ddGroup : 'ddGroupArticle'
																	},
																	onAfterRender : function() {
																		this
																				.initDropZone();
																	},
																	initDropZone : function() {
																		if (!this.ddConfig) {
																			return;
																		}
																		this.dd = new Ext.dd.DropTarget(
																				this.el,
																				{
																					scope : this,
																					ddGroup : this.ddConfig.ddGroup,
																					notifyEnter : function(
																							ddSource,
																							e,
																							data) {
																						this.scope.el
																								.stopFx();
																						this.scope.el
																								.highlight();
																					},
																					notifyDrop : function(
																							ddSource,
																							e,
																							data) {
																						return this.scope
																								.onDrop(
																										ddSource,
																										e,
																										data);
																					}
																				});
																	},
																	onDrop : function(
																			ddSource,
																			e,
																			data) {
																		var source = data.selections[0];
																		var record = null;
																		if (ddSource.ddGroup == this.ddConfig.ddGroup) {
																			record = source;
																		}
																		if (!record) {
																			return false;
																		}
																		if (record
																				.get('article_nr')) {
																			this
																					.setValue(record
																							.get('article_nr'));
																		} else if (record
																				.get('article_ext_nr')) {
																			this
																					.setValue(record
																							.get('article_ext_nr'));
																		}

																		return this
																				.fireEvent(
																						'afterdrop',
																						this,
																						record,
																						ddSource,
																						e,
																						data);
																	}
																}),
												Ext.apply(fields.amount_big, {
													width : 60
												}),
												Ext
														.apply(
																fields.price_brutto_big,
																{
																	width : 90
																}) ],
										[ Ext.apply(fields.price_group_id, {
											width : 150
										}), Ext.apply(fields.price_netto, {
											width : 150
										}), Ext.apply(fields.vat_id, {
											width : 150
										})

										],
										[  Ext.apply(fields.price2_netto, {
											width : 150
										}), Ext.apply(fields.price2_brutto, {
											width : 150
										}), Ext.apply(fields.price2_vat_id, {
											width : 150
										})

										],
										[ Ext.apply(fields.name, {
											width : 450
										}) ],
										[
												Ext
														.apply(
																fields.discount_percentage,
																{
																	width : 150
																}),
												Ext.apply(
														fields.discount_total,
														{
															width : 150
														}),
												Ext.apply(fields.unit_id, {
													width : 150
												}) ],
										[ Ext.apply(fields.description, {
											width : 450
										}) ],
										[  Ext.apply(fields.add_percentage, {
											width : 150
										})
										], [ Ext.apply(fields.weight, {
											xtype : 'hidden'
										}), Ext.apply(fields.position_nr, {
											xtype : 'hidden'
										}), Ext.apply(fields.total_netto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total_brutto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total1_netto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total1_brutto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total2_netto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total2_brutto, {
											xtype : 'hidden'
										}), Ext.apply(fields.total_weight, {
											xtype : 'hidden'
										}), Ext.apply(fields.position_nr, {
											xtype : 'hidden'
										}), Ext.apply(fields.article_id, {
											xtype : 'hidden'
										}) ] ]
							} ]
						};
					}
				});

Tine.Billing.POSPanel = Ext
		.extend(
				Ext.Panel,
				{
					appName : 'Billing',
					layout : 'fit',
					/**
					 * {Tine.Billing.QuickOrderGridPanel} positions grid
					 */
					grid : null,
					pdfViewer : null,
					cashingState : null,
					stateMessage : null,
					defaultDebitorId : null,
					mode : 'STANDARD',
					/**
					 * initialize component
					 */
					initComponent : function() {
						this.initActions();
						this.setupStateField();
						this.setCashingState('INACTIVE');
						this.items = this.getFormItems();
						Tine.Billing.POSPanel.superclass.initComponent
								.call(this);
						this.on('afterrender', this.onAfterRender, this);

					},
					onRender: function(ct, position){
						Tine.Billing.POSPanel.superclass.onRender.call(this, ct, position);
						this.loadMask = new Ext.LoadMask(ct, {msg: 'Auftrag wird übertragen...'});
					},
					setupStateField : function() {
						this.stateField = new Ext.form.TextField({
							hideLabel : true,
							id : 'cash_control_state',
							name : 'state',
							disabledClass : 'x-item-disabled-view',
							disabled : true,
							width : 150,
							value : this.stateMessage,
							height : 20,
							style : {
								fontSize : '12px',
								color : this.stateColor,
								textWeight : 'bold'
							}
						});

					},
					setStateMessage : function(msg) {
						this.stateMessage = msg;
					},
					setCashingState : function(state) {
						switch (state) {
						case 'ACTIVE':
							this.setStateMessage('AKTIV');
							this.stateColor = '#ff0000';
							if (this.rendered) {
								this.cashPanel.enable();
								this.grid.enable();
							}
							this.stateField.setValue(this.stateMessage);
							break;
						case 'INACTIVE':
							this.setStateMessage('INAKTIV');
							this.stateColor = '#aaaaaa';
							if (this.rendered) {
								this.cashPanel.disable();
								this.grid.disable();
							}
							this.stateField.setValue(this.stateMessage);
							break;
						case 'PAYING':
							this.setStateMessage('BEZAHLEN - BON');
							this.stateColor = '#005500';
							this.stateField.setValue(this.stateMessage);
							if (this.rendered) {
								this.cashPanel.disable();
								this.grid.disable();
							}
							break;
						}
						this.cashingState = state;
						if (this.rendered) {
							this.stateField.getEl().setStyle('color',
									this.stateColor);
						}
					},
					isStateInactive : function() {
						return this.cashingState == 'INACTIVE';
					},
					isStateActive : function() {
						return this.cashingState == 'ACTIVE';
					},
					isStatePaying : function() {
						return this.cashingState == 'PAYING';
					},
					beginCashing : function() {
						if (!this.cashPanel.getDebitorRecord()) {
							if (this.defaultDebitorId !== null) {
								Ext.MessageBox
										.show({
											title : 'Hinweis',
											msg : 'Es wird versucht, den Standardkunden für die Kassenerfassung zu laden!',
											buttons : Ext.Msg.OK,
											icon : Ext.MessageBox.INFO
										});
								this.loadDefaultDebitor();
							} else {
								Ext.MessageBox
										.show({
											title : 'Kein Debitor gewählt',
											msg : 'Bitte wählen Sie zunächst einen Kunden, indem Sie einen </br>Kontakt oder Debitor aus der Auswahlübersicht in</br>das Auswahlfeld "Kontakt" ziehen!',
											buttons : Ext.Msg.OK,
											icon : Ext.MessageBox.INFO
										});
							}
							Ext.getCmp('pos-panel-tabs').setActiveTab(0);
							Ext.getCmp('cash-panel-record-choosers').expand();
							return;
						}
						if (!this.isStateActive()) {
							this.resetDialog();
							this.setCashingState('ACTIVE');
							this.action_resetDialog.enable();
							this.action_usePosition.enable();
							this.action_clearPosition.enable();
							this.action_createOrder.enable();
							this.action_createFutureOrder.enable();
							this.beginButton.setText('Abbrechen');
							this.cashPanel.focusFirst();
						} else {
							Ext.MessageBox
									.show({
										title : 'Auftragserfassung abbrechen',
										msg : 'Möchten Sie die aktuelle Erfassung abbrechen?',
										buttons : Ext.Msg.YESNO,
										scope : this,
										fn : this.breakCashing,
										icon : Ext.MessageBox.QUESTION
									});
						}

					},
					breakCashing : function(btn, text) {
						if (btn == 'yes') {
							this.endCashing();
						} else {
							try {
								this.cashDialog.focusFirst();
							} catch (e) {
							}
						}
					},
					endCashing : function() {
						this.resetDialog();
						this.setCashingState('INACTIVE');
						this.action_resetDialog.enable();
						this.action_usePosition.disable();
						this.action_clearPosition.disable();
						this.action_createOrder.disable();
						this.action_createFutureOrder.disable();
						
						this.beginButton.setText('Beginn Kasse');
						
						this.quickOrderPanel.resetDialog();
					},
					doPaying : function() {
						this.setCashingState('PAYING');
						this.action_resetDialog.enable();
						this.action_usePosition.disable();
						this.action_clearPosition.disable();
						this.action_createOrder.disable();
						this.action_createFutureOrder.disable();
						
						this.quickOrderPanel.resetDialog();
						this.beginButton.setText('Beginn Kasse');
					},
					resetDialog : function() {
						this.grid.getStore().removeAll();
						this.cashPanel.resetForm();
						Ext.getCmp('cash_control_total_brutto').setValue(0);
					},
					clearPosition : function() {
						this.cashPanel.resetForm();
					},
					usePosition : function() {
						this.cashPanel.onCalculateCheckin();
					},
					createOrder : function() {
						this.saveQuickOrder();
					},
					createFutureOrder : function() {
						this.saveQuickOrder(true);
					},
					onToggleImmediateCheckin : function() {
						var buttonState = this.immediateCheckinButton.pressed;
						if (buttonState == true) {
							this.cashPanel.setImmediateCheckin(true);
							this.immediateCheckinButton
									.setText('Reihenscan an');
						} else {
							this.cashPanel.setImmediateCheckin(false);
							this.immediateCheckinButton
									.setText('Reihenscan aus');
						}
					},
					onAfterRender : function() {
						this.action_resetDialog.enable();
						this.action_usePosition.disable();
						this.action_clearPosition.disable();
						this.action_createOrder.disable();
						this.action_createFutureOrder.disable();
						
						this.setStateMessage('inaktiv');

						this.quickOrderPanel.setDefaultConfigs(this.mode);
					},
					loadDefaultDebitor : function() {

						if (this.defaultDebitorId !== null) {
							var debitorPhantom = new Tine.Billing.Model.Debitor(
									{
										id : this.defaultDebitorId
									}, this.defaultDebitorId);

							Tine.Billing.debitorBackend
									.loadRecord(
											debitorPhantom,
											{
												scope : this,
												success : function(record) {
													this
															.onLoadDefaultDebitor(record);
												},
												failure : function(response) {
													alert('debitor konnte nicht geladen werden');
												}
											});
						}
					},
					onLoadDefaultDebitor : function(debitor) {
						// var contactId = debitor.getForeignId('contact_id');
						var contact = debitor.getForeignRecord(
								Tine.Addressbook.Model.Contact, 'contact_id');
						Ext.getCmp('billing_contact_id').setValue(contact);
						this.quickOrderPanel.onDropContact(Ext
								.getCmp('billing_contact_id'), contact);
						// this.quickOrderPanel.checkDebitor(contact.get('id'));
					},
					loadPDF : function(url) {
						// this.pdfContainer.removeAll();
						// var pdfViewer = this.getPDFViewer(url);
						// this.pdfContainer.add(pdfViewer);
						// this.pdfContainer.on('afterlayout', this.onPrintPDF,
						// this);
						// this.pdfViewer.mediaCfg.url = url;
						// this.pdfViewer.refreshMedia();
						// this.pdfContainer.doLayout();
					},

					onPrintPDF : function() {
						// setTimeout('objPdf.print()',400);
					},
					/**
					 * init bottom toolbar
					 */
					initToolbar : function() {

					},
					/**
					 * init toolbar (button) actions
					 */
					initActions : function() {
						this.action_resetDialog = new Ext.Action({
							actionType : 'edit',
							handler : this.beginCashing,
							iconCls : '',
							text : 'Start Kasse',
							scope : this
						});
						this.action_clearPosition = new Ext.Action({
							actionType : 'edit',
							handler : this.clearPosition,
							iconCls : '',
							text : 'Position leeren',
							scope : this
						});
						this.action_useImmediateCheckin = new Ext.Action({
							actionType : 'edit',
							iconCls : '',
							text : 'Reihenscan aus',
							scope : this
						});
						this.action_usePosition = new Ext.Action({
							actionType : 'edit',
							handler : this.usePosition,
							iconCls : '',
							text : 'Position verwenden',
							scope : this
						});
						this.action_createOrder = new Ext.Action({
							actionType : 'edit',
							handler : this.createOrder,
							iconCls : '',

							scope : this
						});
						this.action_createFutureOrder = new Ext.Action({
							actionType : 'edit',
							handler : this.createFutureOrder,
							iconCls : '',

							scope : this
						});
					},

					previewQuickOrder : function() {
						this.saveQuickOrder(true);
					},
					saveQuickOrderAndClose : function() {
						this.isClosing = true;
						this.saveQuickOrder();
					},
					/**
					 * save the order including positions
					 */
					saveQuickOrder : function(futureOrder) {
						
						this.loadMask.show();
						if(!futureOrder){
							futureOrder = 0;
						}else{
							futureOrder = 1;
						}
						if (this.validate()) {
							var posData = this.grid.getFromStoreAsFlatArray();
							// var articleId;
							// var posDataCopy = [];
							// for(var i in posData){
							// posDataCopy[i] = posData[i].getFlatData();
							// posDataCopy[i].additionalData = {
							// COMMENT: posData[i].comment
							// };
							// }
							// var templateId =
							// Tine.Billing.registry.get('preferences').get('templatePOSInvoice');
							var data = {
								contactId : Ext.getCmp('billing_contact_id')
										.getValue(),
								withShippingDoc : Ext.getCmp(
										'billing_with_shipping_doc').getValue(),
								paymentMethodId : Ext.getCmp(
										'billing_payment_method').getValue(),
								paymentState : Ext.getCmp(
										'billing_payment_state').getValue(),
								paymentConditions : Ext.getCmp(
										'billing_special_payment_condition')
										.getValue(),
								confirmation: futureOrder,
								contactPersonId: Ext.getCmp('billing_contact_person_id').getValue(),
								addPercentage: Ext.getCmp('billing_add_percentage').getValue(),
								positions : posData,
								erpContextId: Ext.getCmp('billing_erp_context_id').getValue(),
								tag: Ext.getCmp('billing_receipt_tag').getValue()
							// ,
							// templateId: templateId
							}
							this.isSaving = true;
							this.isFutureOrder = futureOrder;
							Ext.Ajax
									.request({
										scope : this,
										params : {
											method : 'Billing.createQuickOrder',
											data : data
										},
										success : function(response) {
											
											var result = Ext.util.JSON
													.decode(response.responseText);
											if (result.success) {
												if(!this.isFutureOrder){
													var invoices = result.data.invoices;
													var shippings = result.data.shippings;
													var invoiceId = invoices[0].id;
													var shipDocId;
													if (typeof (shippings) == 'object') {
														if (shippings[0] !== undefined) {
															shipDocId = shippings[0].id;
														}
													}
	
													var receiptIds = [ invoiceId ];
													if (shipDocId) {
														receiptIds.push(shipDocId);
													}
												}else{
													var confirmations = result.data.confirmations;
													var confirmationId = confirmations[0].id;
													var receiptIds = [ confirmationId ];
												}
												var withCopy = '';
												if (Ext
														.getCmp(
																'billing_print_with_copy')
														.getValue() == true) {
													withCopy = '&withCopy=1';
												}

												var receiptParam = Ext.util.JSON
														.encode(receiptIds);
												if (Ext
														.getCmp(
																'billing_print_at_once')
														.getValue() == true) {
													// this.loadPDF(Sopen.Config.runtime.requestURI
													// +
													// '?method=Billing.printReceipt&id='+invoiceId);
													var win = window
															.open(
																	Sopen.Config.runtime.requestURI
																			+ '?method=Billing.printReceipts&ids='
																			+ receiptParam
																			+ withCopy,
																	"receiptsPDF",
																	"menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,width=300,height=400");
												}

												this.doPaying();

												this.loadMask.hide();
												// --> reload invoice/credit
												// combi grid
												this.invoiceCreditPanel.grid
														.getStore().reload();
											} else {
												Ext.Msg
														.alert('Fehler',
																'Der Auftrag kann nicht angelegt werden.');
											}
										},
										failure : function(response) {
											this.loadMask.hide();
											var result = Ext.util.JSON
													.decode(response.responseText);
											Ext.Msg
													.alert(
															'Fehler',
															'Der Auftrag kann nicht angelegt werden.<br/>Geben Sie bitte Positionen ein.<br/>'
																	+ result);
										}
									});
						} else {
							this.loadMask.hide();
							Ext.Msg
									.alert('Fehler',
											'Der Auftrag kann nicht angelegt werden.<br/>Geben Sie bitte Positionen ein.');
						}
					},
					/**
					 * Cancel and close window
					 */
					cancel : function() {
						this.purgeListeners();
						this.window.close();
					},
					/**
					 * Validate the order -> check whether positions are there
					 * other validation necessary? -> implement -preValidation
					 * is done already when adding a position -formFields of
					 * this dialog are validated instantly
					 */
					validate : function() {
						return this.validatePositions();
					},
					/**
					 * check whether positions are put in
					 */
					validatePositions : function() {
						if (this.grid.getRowCount() == 0) {
							return false;
						}
						return true;
					},
					// onDrop: function(el, contactRecord){
					// // pass thru to quickorder panel
					// this.quickOrderPanel.onDropContact(el, contactRecord);
					// },
					onChangeDebitor : function(data) {
						this.debitorRecord = data.debitorRecord;
						this.contactRecord = data.contactRecord;
						this.getContactWidget().onLoadContact(
								this.contactRecord);
						this.cashPanel.setDebitorRecord(this.debitorRecord);
						this.grid.loadDebitorData(data);
					},
					onPositionReady : function(orderPosition) {
						// var articleRecord =
						// orderPosition.getForeignRecord(Tine.Billing.Model.Article,
						// 'article_id');
						var articleRecord = this.cashPanel.getArticleRecord();

						orderPosition.set('article_id', articleRecord.data);
						this.grid.addNewItem(orderPosition.data);
						this.cashPanel.resetForm();
						this.updateSumField();
					},
					updateSumField : function() {
						var values = this.grid.getValues();
						Ext.getCmp('cash_control_total_brutto').setValue(
								values.sumBrutto);
					},
					onAfterEditGrid : function(obj) {
						this.updateSumField();
					},
					getPDFViewer : function(url) {
						/*
						 * if(!this.pdfViewer){ this.pdfViewer = new
						 * Ext.ux.Media.Panel({ xtype:'mediapanel', id:
						 * 'pdfViewer', region:'center', height: 500, width:
						 * 700, loadMask : {msg:'Bon wird erzeugt'},
						 * 
						 * mediaCfg: { id:'objPdf', mediaType: 'PDF', autoSize :
						 * true, url: url, unsupportedText: 'Acrobat Viewer ist
						 * nicht installiert' } }); } return this.pdfViewer;
						 */
					},
					getControlPanel : function() {
						this.immediateCheckinButton = Ext.apply(new Ext.Button(
								this.action_useImmediateCheckin), {
							scale : 'large',
							width : 150,
							rowspan : 3,
							enableToggle : true,
							text : 'Reihenscan aus',
							iconAlign : 'left',
							arrowAlign : 'right'
						});
						this.immediateCheckinButton.on('toggle',
								this.onToggleImmediateCheckin, this);
						this.beginButton = Ext.apply(new Ext.Button(
								this.action_resetDialog), {
							scale : 'medium',
							width : 150,
							rowspan : 2,
							text : 'Beginn Kasse',
							iconAlign : 'left',
							arrowAlign : 'right'
						});
						this.controlPanel = new Ext.Panel(
								{
									layout : 'fit',
									region : 'center',
									frame : true,
									border : false,
									width : 150,
									items : [ {
										xtype : 'columnform',
										items : [
												[ this.stateField ],
												[ {
													xtype : 'sopencurrencyfield',
													fieldLabel : 'Gesamtsumme',
													id : 'cash_control_total_brutto',
													name : 'total_brutto',
													disabledClass : 'x-item-disabled-view',
													blurOnSelect : true,
													disabled : true,
													width : 150,
													height : 40,
													style : {
														fontSize : '14px',
														textAlign : 'right',
														textWeight : 'bold'
													}
												}
												/*
												 * ],[ { xtype:
												 * 'sopencurrencyfield',
												 * fieldLabel: 'gegeben',
												 * id:'cash_control_cash_given',
												 * name:'cash_given',
												 * disabledClass:
												 * 'x-item-disabled-view',
												 * blurOnSelect: true,
												 * width:150, height: 40,
												 * style:{ fontSize:'14px',
												 * textAlign:'right' } } ],[ {
												 * xtype: 'sopencurrencyfield',
												 * fieldLabel: 'Rückgeld',
												 * id:'cash_control_back',
												 * name:'back', disabledClass:
												 * 'x-item-disabled-view',
												 * blurOnSelect: true,
												 * width:150, height: 40,
												 * style:{ fontSize:'14px',
												 * textAlign:'right' } }
												 */
												],
												[ {
													xtype : 'hidden',
													width : 180,
													height : 20
												} ],
												[ this.beginButton
												// ],[
												// this.immediateCheckinButton
												],
												[ Ext
														.apply(
																new Ext.Button(
																		this.action_clearPosition),
																{
																	scale : 'large',
																	width : 150,
																	rowspan : 3,
																	text : 'Position leeren',
																	iconAlign : 'left',
																	arrowAlign : 'right'
																}) ],
												[ Ext
														.apply(
																new Ext.Button(
																		this.action_usePosition),
																{
																	scale : 'large',
																	width : 150,
																	rowspan : 3,
																	text : 'Position verwenden',
																	iconAlign : 'left',
																	arrowAlign : 'right'
																})

												],
												[ Ext
														.apply(
																new Ext.Button(
																		this.action_createOrder),
																{
																	scale : 'large',
																	rowspan : 3,
																	width : 150,
																	text : 'Fertig/Bezahlen',
																	iconAlign : 'left',
																	arrowAlign : 'right'
																}) ],
												[ Ext
													.apply(
															new Ext.Button(
																	this.action_createFutureOrder),
															{
																scale : 'large',
																rowspan : 3,
																width : 150,
																text : 'Bestellen',
																disabled:true,
																iconAlign : 'left',
																arrowAlign : 'right'
															}) ]  ]
									} ]
								});
						return this.controlPanel;
					},
					onChangePosPanelTab : function(tabPanel, activeTab) {
						var activeTabIndex = tabPanel.items.findIndex('id',
								activeTab.id);
						switch (activeTabIndex) {
						case 0:
						case 2:
							this.grid.collapse();
							break;
						default:
							this.grid.expand();
						}
					},
					/**
					 * returns dialog
					 * 
					 * NOTE: when this method gets called, all initalisation is
					 * done.
					 */
					getFormItems : function() {
						this.controlPanel = this.getControlPanel();

						// use some fields from brevetation edit dialog
						this.quickOrderPanel = new Tine.Billing.POSEditDialog({
							layout : 'border',
							title : 'Vorgaben',
							frame : true,
							border : false,
							deferLayout:false,
							deferredRender:false
						});
						this.quickOrderPanel.on('debitorchanged',
								this.onChangeDebitor, this);
						

						this.invoiceCreditPanel = new Tine.Billing.InvoiceCreditCombiGridPanel(
								{
									title : 'Belege',
									layout : 'border',
									frame : true,
									additionalFilters : [ {
										field : 'current_user_only',
										operator : 'equals',
										value : true
									} ],
									defaultFilter : [ {
										field : 'creation_time',
										operator : 'within',
										value : 'today'
									} ],

									displayCountInTitle : true,
									app : Tine.Tinebase.appMgr.get('Billing')
								});

						this.cashPanel = new Tine.Billing.POSCashPanel({
							layout : 'border',
							region : 'west',
							width : 480,
							border : false,
							disabled : true
						});

						this.cashPanel.on('positionready',
								this.onPositionReady, this);
						this.pdfContainer = new Ext.Panel({
							region : 'east',
							id : 'pos-edit-cash-doc',
							title : "Kassenbon",
							width : 400,
							height : 400,
							layout : 'border',
							border : false,
							items : []
						});

						this.posPanelTabs = {
							xtype:'tabpanel',
							activeTab : 1,
							id : 'pos-panel-tabs',
							region : 'center',
							border : false,
							deferLayout:false,
							deferredRender:false,
							layoutOnTabChange : true,
							items : [ this.quickOrderPanel, {
								xtype : 'panel',
								layout : 'border',
								frame : true,
								border : false,
								title : 'Kassieren',

								items : [ this.cashPanel, this.controlPanel // ,
								]
							}, this.invoiceCreditPanel ],
							listeners:{
								scope:this,
								tabchange: this.onChangePosPanelTab
							}
						};

						/*this.posPanelTabs.on('tabchange',
								this.onChangePosPanelTab, this);*/

					
						var panel = {
							xtype : 'panel',
							border : false,
							region : 'center',
							layout : 'border',
							frame : true,
							items : [ this.posPanelTabs ]
						};

						this.grid = new Tine.Billing.DirectOrderPositionGridPanel(
								{
									region : 'south',
									border : false,
									storeAtOnce : false,
									split : true,
									height : 300
								});
						this.grid.on('afteredit', this.onAfterEditGrid, this);

						var wrapper = {
							xtype : 'panel',
							layout : 'border',
							border : false,
							frame : true,
							items : [ panel, this.grid ]

						};
						return wrapper;
					},
					getQuickOrderPanel : function() {
						return this.quickOrderPanel;
					},
					loadDebitorByContactId : function(contactId) {
						this.getQuickOrderPanel().checkDebitor(contactId);
					},
					getPositionGrid : function() {
						return this.grid;
					},
					getContactWidget : function() {
						if (!this.contactWidget) {
							this.contactWidget = new Tine.Addressbook.ContactWidget(
									{
										region : 'north',
										layout : 'fit',
										height : 40,
										contactEditDialog : this
									});
						}
						return this.contactWidget;
					}
				});

// extended content panel constructor
Tine.Billing.POSEditPanel = Ext.extend(Ext.Panel, {
	panelManager : null,
	windowNamePrefix : 'QuickOrderEditWindow_',
	appName : 'Billing',
	layout : 'fit',
	bodyStyle : 'padding:0px;padding-top:5px',
	//forceLayout : true,
	contactRecord : null,
	initComponent : function() {
		Ext.apply(this.initialConfig, {
			region : 'center'// ,
		// title:'Kreditor'
		});
		this.posPanel = new Tine.Billing.POSPanel(this.initialConfig);
		if (this.contactRecord) {
			this.posPanel.getQuickOrderPanel().setInitialContactRecord(
					this.contactRecord);
		}
		this.posPanel.doLayout();
		this.items = this.getItems(this.posPanel);
		this.on('afterrender', this.onAfterRender, this);
		Tine.Billing.POSEditPanel.superclass.initComponent.call(this);
	},
	onAfterRender : function() {
		/*
		 * if(this.contactRecord){
		 * Ext.getCmp('billing_contact_id').setValue(this.contactRecord);
		 * this.posPanel.getQuickOrderPanel().onDropContact(Ext.getCmp('billing_contact_id'),
		 * this.contactRecord);
		 * this.posPanel.getQuickOrderPanel().setInitialContactRecord(this.contactRecord); }
		 */

		/*
		 * if(this.contactRecord){
		 * this.posPanel.loadDebitorByContactId(this.contactRecord.get('id')); }
		 */
	},

	getItems : function(regularDialog) {
		var recordChoosers = [ {
			xtype : 'contactselectiongrid',
			title : 'Kontakte',
			layout : 'border',
			app : Tine.Tinebase.appMgr.get('Addressbook')
		}/*, {
			xtype : 'debitorselectiongrid',
			gridConfig : {
				enableDragDrop : true,
				ddGroup : 'ddGroupGetContact'
			},
			title : 'Kunden',
			layout : 'border',
			app : Tine.Tinebase.appMgr.get('Billing')
		}*/, {
			xtype : 'articleselectiongrid',
			title : 'Artikel',
			layout : 'border',
			app : Tine.Tinebase.appMgr.get('Billing')
		} ];

		// use some fields from brevetation edit dialog
		var recordChooserPanel = {
			xtype : 'panel',
			layout : 'accordion',
			region : 'east',
			id : 'cash-panel-record-choosers',
			title : 'Auswahlübersicht',
			width : 540,
			collapsible : true,
			collapsed : true,
			bodyStyle : 'padding:8px;',
			split : true,
			items : recordChoosers
		};
		return [ {
			xtype : 'panel',
			layout : 'border',
			items : [
			// display debitor widget north
			regularDialog.getContactWidget(),
			// tab panel containing debitor master data
			// + dependent panels
			regularDialog,
			// place record chooser east
			recordChooserPanel ]
		} ];
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.POSPanel.openWindow = function(config) {
	// TODO: this does not work here, because of missing record
	var id = (config.record && config.record.id) ? config.record.id : 0;
	var window = Tine.WindowFactory.getWindow({
		width : 1280,
		height : 768,
		name : Tine.Billing.POSPanel.prototype.windowNamePrefix + id,
		contentPanelConstructor : 'Tine.Billing.POSEditPanel',
		contentPanelConstructorConfig : config
	});
	return window;
};

Tine.Billing.POSPanel.getAsCardView = function(config) {
	try {
		return new Ext.Panel({
			xtype : 'panel',
			layout : 'card',
			flex : 1,
			activeItem : 0,
			items : [ new Tine.Billing.POSEditPanel({
				mode : 'POS',
				defaultDebitorId : Tine.Billing.registry.get('preferences')
						.get('posDefaultDebitor')
			}) ]
		});
	} catch (e) {
		return {
			xtype : 'panel',
			layout : 'fit',
			region : 'center',
			items : []
		};
	}

}
