<?php 
class Billing_Model_BookingTemplateFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_BookingTemplateFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'booking_template_nr'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'name'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'booking_text'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'erp_context_id'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('id','name','booking_text'))
        )
    );
}
?>