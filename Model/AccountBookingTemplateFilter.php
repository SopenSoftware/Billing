<?php 
class Billing_Model_AccountBookingTemplateFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_AccountBookingTemplateFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'type'          => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'input_value'          => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'booking_template_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_BookingTemplateFilter', 
                'controller'        => 'Billing_Controller_BookingTemplate'
            )
        ),
        'account_system_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_AccountSystemFilter', 
                'controller'        => 'Billing_Controller_AccountSystem'
            )
        )
    );
}
?>