<?php 
class Billing_Model_ProductionCostFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_ProductionCostFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'receipt_position_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_OrderPositionFilter', 
                'controller'        => 'Billing_Controller_OrderPosition'
            )
        ),
    	'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('type'))
        )
    );
}
?>