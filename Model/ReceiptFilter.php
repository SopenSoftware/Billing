<?php 
class Billing_Model_ReceiptFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_ReceiptFilter';
    
    protected $_modelName = 'Billing_Model_Receipt';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'type'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'combi_type' => array('filter' => 'Billing_Model_ReceiptTypeCombiFilter'),
    	'payment_method_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'ship_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'invoice_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'bid_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'invoice_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
    	'credit_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
    	'shipping_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
    	'order_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
    	    'options' => array(
                'filtergroup'       => 'Billing_Model_OrderFilter', 
                'controller'        => 'Billing_Controller_Order'
            )
        ),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('invoice_nr','ship_nr','bid_nr', 'usage'))
        ),
        'tag'                  => array('filter' => 'Tinebase_Model_Filter_Tag', 'options' => array('idProperty' => 'bill_receipt.id')),
        'payment_state'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'creation_time' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'last_modified_time' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'created_by'     => array('filter' => 'Tinebase_Model_Filter_User'),
        'last_modified_by'     => array('filter' => 'Tinebase_Model_Filter_User'),
        'current_user_only' => array('filter' => 'Billing_Model_CurrentUserOnlyFilter'),
        'total_netto' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'total_brutto' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'open_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'payed_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
    	'booking_id'          => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'fee_group_id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'period' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'is_member' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancelled' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancellation'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    );
}
?>