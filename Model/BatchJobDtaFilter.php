<?php
class Billing_Model_BatchJobDtaFilter extends Tinebase_Model_Filter_FilterGroup// implements Tinebase_Model_Filter_AclFilter
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_BatchJobDtaFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
     	'id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'contact_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
        	'options' => array(
                'filtergroup'       => 'Addressbook_Model_ContactFilter', 
                'controller'        => 'Addressbook_Controller_Contact'
            )
        ),
        'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
        	'options' => array(
                'filtergroup'       => 'Billing_Model_DebitorFilter', 
                'controller'        => 'Billing_Controller_Debitor'
            )
        ),
        'job_id' =>  array('filter' => 'Tinebase_Model_Filter_Id'),
        'total_sum' =>  array('filter' => 'Tinebase_Model_Filter_Int'),
        'diff_saldation' =>  array('filter' => 'Billing_Model_DtaDiffSaldationFilter'),
        'total_saldation' =>  array('filter' => 'Tinebase_Model_Filter_Int'),
        'count_pos' =>  array('filter' => 'Tinebase_Model_Filter_Int'),
        'bank_valid' => array('filter'=>'Tinebase_Model_Filter_Text'),
        'action_state' => array('filter'=>'Tinebase_Model_Filter_Text'),
        'created_datetime' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'valid_datetime' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'process_datetime' => array('filter' => 'Tinebase_Model_Filter_Date'),
        'created_by_user'     => array('filter' => 'Tinebase_Model_Filter_User'),
        'processed_by_user'     => array('filter' => 'Tinebase_Model_Filter_User')
    );
}
?>