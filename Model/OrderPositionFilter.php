<?php 
class Billing_Model_OrderPositionFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_OrderPositionFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'article_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_ArticleFilter', 
                'controller'        => 'Billing_Controller_Article'
            )
        ),
        'order_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_OrderFilter', 
                'controller'        => 'Billing_Controller_Order'
            )
        ),
    	'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('id'))
        )
    );
}
?>