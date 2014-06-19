Ext.namespace('Tine.Billing');

Tine.Billing.BatchJobDtaItemEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
	
	/**
	 * @private
	 */
	windowNamePrefix: 'BatchJobDtaItemEditWindow_',
	appName: 'Billing',
	recordClass: Tine.Billing.Model.BatchJobDtaItem,
	recordProxy: Tine.Billing.batchJobDtaItemBackend,
	loadRecord: false,
	evalGrants: false,
	batchJobDtaRecord: null,
	initComponent: function(){
		this.on('load',this.onLoadBatchJobDtaItem, this);
		Tine.Billing.BatchJobDtaItemEditDialog.superclass.initComponent.call(this);
	},
	onLoadBatchJobDtaItem: function(){
		if(!this.rendered){
			this.onLoadBatchJobDtaItem.defer(250,this);
		}
		if(this.batchJobDtaRecord){
			Ext.getCmp('workflow_sub_elem_workflow_elem_id').setValue(this.batchJobDtaRecord.get('id'));
			this.record.set('workflow_elem_id', this.batchJobDtaRecord.get('id'));
		}
	},
	/**
	 * returns dialog
	 * 
	 * NOTE: when this method gets called, all initalisation is done.
	 */
	getFormItems: function() {
	    return {
	        xtype: 'panel',
	        border: false,
	        frame:true,
	        items:[{xtype:'columnform',items:[
	             [
					{
						xtype:'hidden',
						id: 'workflow_sub_elem_workflow_elem_id',
					    name:'workflow_elem_id'
					},{
						fieldLabel: 'BatchJobDtaItement-Nr',
					    //emptyText: '<automatisch>',
					    disabledClass: 'x-item-disabled-view',
					    id:'workflow_sub_elem_workflow_sub_elem_nr',
					    name:'workflow_sub_elem_nr',
					    value:null,
					    //disabled:true,
					    width: 150
					},{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'workflow_sub_elem_is_active',
						name: 'is_active',
						hideLabel:true,
					    boxLabel: 'aktiv',
					    width: 250
					}				 
				],[
					{
						xtype: 'checkbox',
						disabledClass: 'x-item-disabled-view',
						id: 'workflow_false_blocks_followers',
						name: 'false_blocks_followers',
						hideLabel:true,
					    boxLabel: 'Nachfolger inaktiv, wenn Element inaktiv',
					    width: 300
					}
//					{
//						xtype: 'checkbox',
//						disabledClass: 'x-item-disabled-view',
//						id: 'workflow_sub_elem_reversable',
//						name: 'reversable',
//						hideLabel:true,
//					    boxLabel: 'stornierbar',
//					    width: 250
//					},{
//					    fieldLabel: 'Datumsfeld Storno',
//					    disabledClass: 'x-item-disabled-view',
//					    id:'workflow_sub_elem_reverse_datefield',
//					    name:'reverse_datefield',
//					    width: 150,
//					    xtype:'combo',
//					    store:[['add_ev1_cancel_date','Zusatzveranst. 1'],['add_ev2_cancel_date','Zusatzveranst. 2'],['add_ev3_cancel_date','Zusatzveranst. 3']],
//					    value: 'add_ev1_cancel_date',
//						mode: 'local',
//						displayField: 'name',
//					    valueField: 'id',
//					    triggerAction: 'all'
//					}
				 ],[
					{
					    fieldLabel: 'Datenfeld',
					    disabledClass: 'x-item-disabled-view',
					    id:'workflow_sub_elem_datafield',
					    name:'datafield',
					    width: 150,
					    xtype:'combo',
					    store:[
					    ['additional_event1','Zusatzveranst. 1'],
					    ['additional_event2','Zusatzveranst. 2'],
					    ['additional_event3','Zusatzveranst. 3'],
					    ['additional_event1','Zusatzveranst. 4'],
					    ['track1','Track 1'],
					    ['track2','Track 2'],
					    ['track3','Track 3'],
					    ['track4','Track 4'],
					    ['track5','Track 5'],
					    ['track6','Track 6'],
					    ['info1','Info 1'],
					    ['info2','Info 2'],
					    ['info3','Info 3'],
					    ['info4','Info 4'],
					    ['info5','Info 5'],
					    ['info6','Info 6'],
					    ['hotel_acco','Hotelbuchung'],
					    ['hotel_select11','Hotel Auswahl 1.1'],
					    ['hotel_select12','Hotel Auswahl 1.2'],
					    ['hotel_select13','Hotel Auswahl 1.3'],
					    ['hotel_select21','Hotel Auswahl 2.1'],
					    ['hotel_select32','Hotel Auswahl 2.2'],
					    ['hotel_select43','Hotel Auswahl 2.3']
					    ],
						mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					},{
						fieldLabel: 'Wert',
					    disabledClass: 'x-item-disabled-view',
					    id:'workflow_sub_elem_valuefield',
					    name:'valuefield',
					    width: 150,
					    xtype:'combo',
					    store:[
					    ['0','True'],
					    ['1','False']],
					    mode: 'local',
						displayField: 'name',
					    valueField: 'id',
					    triggerAction: 'all'
					}
				 ],[
					{
						fieldLabel: 'Bezeichnung',
					    id:'workflow_sub_elem_name',
					    name:'name',
					    value:null,
					    width: 500
					} 
	             ],[
					{
						xtype:'textarea',
						fieldLabel: 'Beschreibung',
					    id:'workflow_sub_elem_description',
					    name:'description',
					    value:null,
					    width: 500,
					    height:80
					} 
				],[
					{
						xtype:'textarea',
						fieldLabel: 'Statusmitteilung',
					    id:'workflow_sub_elem_state_message',
					    name:'state_message',
					    value:null,
					    width: 500,
					    height:80
					} 
	             ]
	        ]}]
	    };
	}
});

/**
 * Billing Edit Popup
 */
Tine.Billing.BatchJobDtaItemEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 560,
        name: Tine.Billing.BatchJobDtaItemEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Billing.BatchJobDtaItemEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};