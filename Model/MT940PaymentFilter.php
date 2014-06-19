<?php 
class Billing_Model_MT940PaymentFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_MT940PaymentFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
     	'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),
        'due_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'payment_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'state' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'type' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('payment_amount'))
        ),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text')
    );
}
?>