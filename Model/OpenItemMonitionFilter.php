<?php 
class Billing_Model_OpenItemMonitionFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_OpenItemMonitionFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
     	'monition_receipt_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_ReceiptFilter', 
                'controller'        => 'Billing_Controller_Receipt'
            )
        ),
        'open_item_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_OpenItemFilter', 
                'controller'        => 'Billing_Controller_OpenItem'
            )
        ),
        'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),
        'due_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
		'monition_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('id'))
        ),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'total_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'open_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'due_days' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'monition_stage' => array('filter' => 'Tinebase_Model_Filter_Int')
    );
}
?>