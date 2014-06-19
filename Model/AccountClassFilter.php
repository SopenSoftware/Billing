<?php 
class Billing_Model_AccountClassFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_AccountClassFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'key'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'name'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
        /*'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('job_nr'))
        )*/
    );
}
?>