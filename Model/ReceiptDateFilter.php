<?php 
class Billing_Model_ReceiptDateFilter extends Tinebase_Model_Filter_Date
{
    
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
            	array(	'field' => 'creation_time',   'operator' => $this->_operator, 'value' => $this->_value)
            	//array(	'field' => 'credit_date',    'operator' => $this->_operator, 'value' => $this->_value)
        	);
        	
        	$filter = new Billing_Model_ReceiptFilter($filterData, 'AND');
	    	$receiptIds = Billing_Controller_Receipt::getInstance()->search($filter, null, false, true);
	    	
	    	if(count($receiptIds)>0){
	    		$filter1 = new Billing_Model_ArticleSoldFilter(array(), 'AND');
        	
	        	$filter1->addFilter(new Tinebase_Model_Filter_Id('receipt_id', 'in', $receiptIds));
	       		Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter1, $_backend);
	    	}else{
	    		$filter1 = new Billing_Model_ArticleSoldFilter(array(), 'AND');
        		
        	
	        	$filter1->addFilter(new Tinebase_Model_Filter_Id('receipt_id', 'in', array(0=>null)));
	       		Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter1, $_backend);
	    	}
	       //	echo $_select->assemble();
    	}
    }

}
?>