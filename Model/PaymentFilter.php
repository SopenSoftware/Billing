<?php 
class Billing_Model_PaymentFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_PaymentFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'order_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_OrderFilter', 
                'controller'        => 'Billing_Controller_Order'
            )
        ),
        'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),      
        'receipt_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_ReceiptFilter', 
                'controller'        => 'Billing_Controller_Receipt'
            )
        ),  
        'booking_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_BookingFilter', 
                'controller'        => 'Billing_Controller_Booking'
            )
        ),
        'amount'          => array('filter' => 'Tinebase_Model_Filter_Int'),
        'usage'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'payment_date'          => array('filter' => 'Tinebase_Model_Filter_Date'),
        'payment_type'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'payment_method_id'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('usage','id','amount'))
        ),
    
    	'is_cancelled' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancellation'		  => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_return_debit'		  => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'print_inquiry'		  => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'inquiry_print_date'          => array('filter' => 'Tinebase_Model_Filter_Date'),
        'set_accounts_banktransfer'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    );
}
?>