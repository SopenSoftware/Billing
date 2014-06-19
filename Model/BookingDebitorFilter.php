<?php 
class Billing_Model_BookingDebitorFilter extends Tinebase_Model_Filter_Abstract
{
    
	 protected $_operators = array(
        'contains','equals'
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
	    	$filter = array(array(
	    		'field' => 'debitor_id',
	    		'operator' => 'AND',
	    		'value' => array(array(
	    			'field' => 'id',
	    			'operator' => 'equals',
	    			'value' => $this->_value
	    		))
	    	));
	    	/*$filter = array(array(
	    		'field' => 'debitor_id',
	    		'operator' => $this->_operator,
	    		'value' => $this->_value
	    	));*/
	    	$abFilter = new Billing_Model_AccountBookingFilter($filter, 'AND');
	    	$abs = Billing_Controller_AccountBooking::getInstance()->search($abFilter);
	    	$bookingIds = $abs->__getFlattened('booking_id');
	    	//print_r($bookingIds);
	    	if(!is_array($bookingIds) || count($bookingIds)==0){
	    		$bookingIds = array('0',null);
	    	}
	    	$filter1 = new Billing_Model_BookingFilter(array(), 'AND');
	        	
		    $filter1->addFilter(new Tinebase_Model_Filter_Id('id', 'in', $bookingIds));
		       	
	    	Tinebase_Backend_Sql_Filter_FilterGroup::appendFilters($_select, $filter1, $_backend);
    	
	       //	echo $_select->assemble();
    	}
    
    }
}
?>