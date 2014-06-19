<?php 
class Billing_Model_SepaCreditorFilter extends Tinebase_Model_Filter_FilterGroup
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
                'filtergroup'       => 'Billing_Model_BankAccount', 
                'controller'        => 'Billing_Controller_BankAccount'
            )
        ),
        'creditor_name' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'sepa_creditor_ident' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('sepa_creditor_ident','creditor_name'))
        )
    );
}
?>