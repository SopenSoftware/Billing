<?php 
class Billing_Model_OrderFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_OrderFilter';
    
    protected $_modelName = 'Billing_Model_Order';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'job_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_JobFilter', 
                'controller'        => 'Billing_Controller_Job'
            )
        ),
        'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),        
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('order_nr'))
        ),
        
        'order_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text')
    );
    
 	public function toArray($_valueToJson = false)
    {
        $result = parent::toArray($_valueToJson);
        
        foreach ($result as &$filterData) {
            if ($filterData['field'] == 'id' && $_valueToJson == true && ! empty($filterData['value'])) {
                //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' value:' . print_r($filterData['value'], true));
                try {
                    $filterData['value'] = Billing_Controller_Order::getInstance()->get($filterData['value'])->toArray();
                } catch (Tinebase_Exception_NotFound $nfe) {
                    if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->INFO(__METHOD__ . '::' . __LINE__ . " could not find and resolve timeaccount {$filterData['value']}");
                }
            }
        }
        
        return $result;
    }
}
?>