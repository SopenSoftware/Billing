Ext.ns('Tine.Billing');

Tine.Billing.MT940ImportDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * @private
     */
    windowNamePrefix: 'MT940ImportWindow_',
    loadRecord: false,
    tbarItems: [],
    evalGrants: false,
    sendRequest: true,
    
    //private
    initComponent: function(){
        this.recordClass = Tine.Billing.Model.MT940ImportJob;
        Tine.Billing.MT940ImportDialog.superclass.initComponent.call(this);
    },
    
    /**
     * executed when record gets updated from form
     * - add files to record here
     * 
     * @private
     */
    onRecordUpdate: function() {

        this.record.data.files = [];
        this.uploadGrid.store.each(function(record) {
            this.record.data.files.push(record.data);
        }, this);
        
        Tine.Billing.MT940ImportDialog.superclass.onRecordUpdate.call(this);
    },
    
    /**
     * returns dialog
     */
    getFormItems: function() {
        this.uploadGrid = new Tine.widgets.grid.FileUploadGrid({
            fieldLabel: _('Files'),
            record: this.record,
            hideLabel: true,
            height: 150,
            frame: true
        });
        
        //var containerName = this.app.i18n.n_hidden(this.record.get('model').getMeta('containerName'), this.record.get('model').getMeta('containersName'), 1);
        
        return {
            bodyStyle: 'padding:5px;',
            buttonAlign: 'right',
            labelAlign: 'top',
            border: false,
            layout: 'form',
            defaults: {
                anchor: '100%'
            },
            items: [
//            {
//                xtype: 'combo',
//                fieldLabel: _('Import definition'), 
//                name:'import_definition_id',
//                store: this.definitionsStore,
//                displayField:'name',
//                mode: 'local',
//                triggerAction: 'all',
//                editable: false,
//                allowBlank: false,
//                forceSelection: true,
//                valueField:'id'
//            }, new Tine.widgets.container.selectionComboBox({
//                id: this.app.appName + 'EditDialogContainerSelector',
//                fieldLabel: String.format(_('Import into {0}'), containerName),
//                width: 300,
//                name: 'container_id',
//                stateful: false,
//                containerName: containerName,
//                containersName: this.app.i18n._hidden(this.record.get('model').getMeta('containersName')),
//                appName: this.app.appName,
//                requiredGrant: false
//            }), {
//                xtype: 'checkbox',
//                name: 'dry_run',
//                fieldLabel: _('Dry run'),
//                checked: true
//            },
                this.uploadGrid
            ]
        };
    },
    
    /**
     * apply changes handler
     */
    onApplyChanges: function(button, event, closeWindow) {
        var form = this.getForm();
        if(form.isValid()) {
            this.onRecordUpdate();
            
            if (this.record.get('files').length == 0) {
                Ext.MessageBox.alert(_('No files added'), _('You need to add files to import.'));
                return;
            }
            
            if (this.sendRequest) {
                this.loadMask.show();
                
                var params = {
                    method: this.appName + '.importMT940',
                    files: this.record.get('files'),
                    importOptions: {
                    }
                };
                
                Ext.Ajax.request({
                    params: params,
                    scope: this,
                    timeout: 1800000, // 30 minutes
                    success: function(_result, _request){
                        this.loadMask.hide();
                        
                        var response = Ext.util.JSON.decode(_result.responseText);
                            Ext.MessageBox.alert(
                                _('Import results'), 
                                String.format(_('Import successful for {0} records / import failed for {1} records / {2} duplicates found'),
                                    response.totalcount, response.failcount, response.duplicatecount),
                                function() {
                                    // import done
                                    this.fireEvent('update', response);
                                    if (closeWindow) {
                                        this.purgeListeners();
                                        this.window.close();
                                    }                                    
                                },
                                this
                            );                            
                        }
                });
            } else {
                this.fireEvent('update', values);
                this.window.close();
            }
            
        } else {
            Ext.MessageBox.alert(_('Errors'), _('Please fix the errors noted.'));
        }
    }
});

/**
 * credentials dialog popup / window
 */
Tine.Billing.MT940ImportDialog.openWindow = function (config) {
    var window = Tine.WindowFactory.getWindow({
        width: 400,
        height: 500,
        title: 'MT940 Datei importieren',
        name: Tine.Billing.MT940ImportDialog.windowNamePrefix + Ext.id(),
        contentPanelConstructor: 'Tine.Billing.MT940ImportDialog',
        contentPanelConstructorConfig: config,
        modal: true
    });
    return window;
};
