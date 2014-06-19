<?php
class Billing_Model_BatchJobMonitionItemFilter extends Tinebase_Model_Filter_FilterGroup// implements Tinebase_Model_Filter_AclFilter
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_BatchJobMonitionItemFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
     	'id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'batch_monition_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
        	'options' => array(
                'filtergroup'       => 'Billing_Model_BatchJobMonitionFilter', 
                'controller'        => 'Billing_Controller_BatchJobMonition'
            )
        ),
        'erp_context_id' =>  array('filter' => 'Tinebase_Model_Filter_Text'),
        'skip' =>  array('filter' => 'Tinebase_Model_Filter_Bool'),
        'total_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'open_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'monition_stage' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'due_days' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'usage' => array('filter' => 'Tinebase_Model_Filter_Text')
    );
}
?>