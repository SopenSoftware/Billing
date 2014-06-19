<?php
class Billing_Model_ReceiptTypeCombiFilter extends Tinebase_Model_Filter_Abstract
{
    /**
     * @var array list of allowed operators
     */
    protected $_operators = array(
        'in','notin'
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
            	array('field' => 'type',   'operator' => $this->_operator, 'value' => $this->_value)
        	);
        	
	    	$filter = new Billing_Model_ReceiptFilter($filterData, 'AND');
	    	
	    	Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter, $_backend);
    	}
    }
}