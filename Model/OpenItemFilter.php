<?php 
class Billing_Model_OpenItemFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_OpenItemFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
     	'payment_method_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'order_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_OrderFilter', 
                'controller'        => 'Billing_Controller_Order'
            )
        ),
        'receipt_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_ReceiptFilter', 
                'controller'        => 'Billing_Controller_Receipt'
            )
        ),
        'monition_receipt_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_ReceiptFilter', 
                'controller'        => 'Billing_Controller_Receipt'
            )
        ),
        'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),
        'contact_id' => array('filter' => 'Billing_Model_OpenItemContactFilter',
        	'options' => array(
                'filtergroup_p1'       => 'Addressbook_Model_ContactFilter', 
        		'filtergroup'       => 'Billing_Model_DebitorFilter', 
        	    'controller_p1'     => 'Addressbook_Controller_Contact',
        		'controller'		=> 'Billing_Controller_Debitor'
            )
        ),
        'payment_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Billing_Model_PaymentFilter', 
                'controller'        => 'Billing_Controller_Payment'
            )
        ),
        'donation_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId',
            'options' => array(
                'filtergroup'       => 'Donator_Model_DonationFilter', 
                'controller'        => 'Donator_Controller_Donation'
            )
        ),
        'receipt_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'fibu_exp_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'due_date' => array('filter' => 'Tinebase_Model_Filter_Date', 'alias' => 'rc'),
		'payment_date' => array('filter' => 'Tinebase_Model_Filter_Date', 'alias' => 'pay'),
        'banking_exp_date' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'state' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'type' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('op_nr'))
        ),
        'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        'total_netto' => array('filter' => 'Tinebase_Model_Filter_Int', 'alias' => 'rc'),
        'total_brutto' => array('filter' => 'Tinebase_Model_Filter_Int', 'alias' => 'rc'),
        'open_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'payed_sum' => array('filter' => 'Tinebase_Model_Filter_Int'),
    	'op_nr' => array('filter' => 'Tinebase_Model_Filter_Int'),
        'due_days' => array('filter' => 'Billing_Model_OpenItemDueDaysFilter'),
        'monition_stage' => array('filter' => 'Tinebase_Model_Filter_Int'),
    	'is_cancelled' => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_cancellation'		  => array('filter' => 'Tinebase_Model_Filter_Bool'),
        'is_member'		  => array('filter' => 'Tinebase_Model_Filter_Bool', 'alias' => 'rc'),
		'period'		  => array('filter' => 'Tinebase_Model_Filter_Int', 'alias' => 'rc'),
		'fee_group_id'		  => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'rc')
    );
}
?>