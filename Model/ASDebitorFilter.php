<?php 
class Billing_Model_ASDebitorFilter extends Tinebase_Model_Filter_Abstract
{
    
	protected $_operators = array(
        0 => 'AND',
        1 => 'OR',
        2 => 'equals'
    );
    /**
     * appends sql to given select statement
     *
     * @param Zend_Db_Select                $_select
     * @param Tinebase_Backend_Sql_Abstract $_backend
     */
    public function appendFilterSql($_select, $_backend)
    {
        	$filterData = 
            	array(	'field' => $this->_field,   'operator' => $this->_operator, 'value' => array($this->_value))
        	;
        	//print_r($filterData);
        	
        	$oFilter = new Billing_Model_OrderFilter(array(), 'AND');
        	$oFilter->addFilter($oFilter->createFilter($this->_field, $this->_operator, $this->_value));
        	
        	/*Filter = $oFilter->toArray();
        	print_r($aFilter);
        	*/
	    	$orderIds = Billing_Controller_Order::getInstance()->search($oFilter, null, false, true);
	    	//print_r($orderIds);
	    	$filter = new Billing_Model_ReceiptFilter(array(), 'AND');
	    	if(count($orderIds)>0){
	    		$filter->addFilter(new Tinebase_Model_Filter_Id('order_id', 'in', $orderIds));
	    	}else{
	    		$filter->addFilter(new Tinebase_Model_Filter_Id('order_id', 'in', array(0=>null)));
	    	}
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
?>