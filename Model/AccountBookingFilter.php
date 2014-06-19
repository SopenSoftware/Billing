<?php 
class Billing_Model_AccountBookingFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_AccountBookingFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'type'          => array('filter' => 'Tinebase_Model_Filter_Text'),
		'erp_context_id'          => array('filter' => 'Tinebase_Model_Filter_Text', alias => 'bk'),
    	'value'          => array('filter' => 'Tinebase_Model_Filter_Int'),
    	'booking_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_BookingFilter', 
                'controller'        => 'Billing_Controller_Booking'
            )
        ),
         'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),
        'account_system_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_AccountSystemFilter', 
                'controller'        => 'Billing_Controller_AccountSystem'
            )
        ),
//		'contra_account_system_id' => array('filter' => 'ContraAccountBookingFilter' 
            /*'options' => array(
                'filtergroup'       => 'Billing_Model_AccountSystemFilter', 
                'controller'        => 'Billing_Controller_AccountSystem'
            )*/
//        ),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('id'))
        ),
        'booking_date' => array('filter' => 'Tinebase_Model_Filter_Date')
    );
}
?>