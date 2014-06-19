<?php
class Billing_Model_CurrentUserOnlyFilter extends Tinebase_Model_Filter_Id
{
    /**
     * @var array list of allowed operators
     */
    protected $_operators = array(
        'equals'
    );
    
    
    /**
     * appends sql to given select statement
     *
     * @param Zend_Db_Select                $_select
     * @param Tinebase_Backend_Sql_Abstract $_backend
     */
    public function appendFilterSql($_select, $_backend)
    {
        if($this->_value){
        	$filterData = array(
            	array('field' => 'created_by',   'operator' => $this->_operator, 'value' => Tinebase_Core::getUser()->__get('accountId'))
        	);
        	
	    	$filter = new Billing_Model_ReceiptFilter($filterData, 'AND');
	    	
	    	Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter, $_backend);
    	}
    }
}