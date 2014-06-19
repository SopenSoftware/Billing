<?php 
class Billing_Model_DebitorAccountFilter extends Tinebase_Model_Filter_FilterGroup
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
        'bank_account_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_BankAccount', 
                'controller'        => 'Billing_Controller_BankAccount'
            )
        ),
        
        'context_id' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'usage_type' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'application_name' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'usage_from' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'usage_until' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'is_blocked' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'block_reason' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('iban','number','bank_code','bank_name','sepa_mandate_id','name'))
        ),
    
    	'has_sepa_mandate' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'valid'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    );
}
?>