<?php 
class Billing_Model_BankFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_BankFilter';
    
    protected $_modelName = 'Billing_Model_Bank';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('code','name','postal_code','location','short_name','pan','bic'))
        ),
    	'code' => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'name' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'short_name' => array('filter' => 'Tinebase_Model_Filter_Text')
    );
}
?>