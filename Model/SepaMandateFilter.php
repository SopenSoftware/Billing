<?php 
class Billing_Model_SepaMandateFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_DebitorAccountFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'contact_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Addressbook_Model_ContactFilter', 
                'controller'        => 'Addressbook_Controller_Contact'
            )
        ),
        'bank_account_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_BankAccountFilter', 
                'controller'        => 'Billing_Controller_BankAccount'
            )
        ),
        'mandate_ident' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'mandate_state' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'comment' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('mandate_ident','comment'))
        ),
        'signature_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'last_usage_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'valid_from_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'valid_until_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'print_info_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'creation_time' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'last_modified_time' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'created_by'     => array('filter' => 'Tinebase_Model_Filter_User'),
        'last_modified_by'     => array('filter' => 'Tinebase_Model_Filter_User')
    );
}
?>