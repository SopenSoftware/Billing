<?php 
class Billing_Model_AccountSystemFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_AccountSystemFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
    	'name'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'number'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'account_type'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
    	'type'		  => array('filter' => 'Tinebase_Model_Filter_Text'),
      	'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('number','name'))
        ),
        'account_class_id' =>      array('filter' => 'Tinebase_Model_Filter_Id')   
    );
}
?>