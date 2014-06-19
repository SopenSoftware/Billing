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
        'donation_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Donator_Model_DonationFilter', 
                'controller'        => 'Donator_Controller_Donation'
            )
        ),
        'booking_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_BookingFilter', 
                'controller'        => 'Billing_Controller_Booking'
            )
        ),
        'payment_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_PaymentFilter', 
                'controller'        => 'Billing_Controller_Payment'
            )
        ),
        'value_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'item_type' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'create_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('usage'))
        ),
    
    	'is_cancelled' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancellation'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    );
}
?>