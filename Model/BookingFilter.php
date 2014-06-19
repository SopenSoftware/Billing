<?php 
class Billing_Model_BookingFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_BookingFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'booking_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'booking_receipt_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'booking_text'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'booking_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
   		'booking_receipt_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'value'		  => array('filter' => 'Tinebase_Model_Filter_Int'),
    	'debitor_id' => array('filter' => 'Billing_Model_BookingDebitorFilter'),
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
       'payment_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_PaymentFilter', 
                'controller'        => 'Billing_Controller_Payment'
            )
        ),
       	'valid' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        
    	'is_cancelled' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancellation'		  => array('filter' => 'Tinebase_Model_Filter_Bool')
    
        /*'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('job_nr'))
        )*/
    );
}
?>