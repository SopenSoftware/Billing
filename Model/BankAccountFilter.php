<?php 
class Billing_Model_BankAccountFilter extends Tinebase_Model_Filter_FilterGroup
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
        'bank_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_Bank', 
                'controller'        => 'Billing_Controller_Bank'
            )
        ),
        
        'iban' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'bic' => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'ba'),
        'number' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'name' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'bank_code' => array('filter' => 'Tinebase_Model_Filter_Text' ),
        'bank_name' => array('filter' => 'Tinebase_Model_Filter_Text'),
          'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('iban','number',/*'bank_code','bank_name','sepa_mandate_id',*/'name'))
        ),
    
    	'has_sepa_mandate' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'valid'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    );
}
?>