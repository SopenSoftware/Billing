<?php
class Billing_Model_OpenItemDueDaysFilter extends Tinebase_Model_Filter_Int
{
	
	/**
     * Due date for queries (for some queries, like for age (calculated) values
     * we need an input parameter Date as basis. This can be the actual date (default)
     * or any other set by the controller from outside
     */
    private $dueDate = null;
    
    public function __construct($_field, $_operator, $_value, array $_options = array()){
    	parent::__construct($_field, $_operator, $_value, $_options);
    	$this->setDueDate();	
    }
    
/**
     * 
     * Set due date
     */
    public function setDueDate( $date ){
    	if(!$date instanceof Zend_Date){
    		$date = new Zend_Date($date);
    	}
    	$this->dueDate = $date;
    }
    
    public function getDueDate(){
    	return $this->dueDate;
    }
    
    public function getDueYear(){
    	return $this->dueDate->get(Zend_Date::YEAR);
    }
    
	public function getDueMonth(){
    	return $this->dueDate->get(Zend_Date::MONTH);
    }
    
	public function getDueDay(){
    	return $this->dueDate->get(Zend_Date::DAY);
    }
    
 	public function appendFilterSql($_select, $_backend)
    {
           	// transfer backends due date
    	$this->setDueDate($_backend->getDueDate());
    	
        // quote field identifier, set action and replace wildcards
        //$field = $this->_getQuotedFieldName($_backend);
        $baseYear = $this->getDueYear();
    	
    	$field = 'DATEDIFF('.$_backend->getAdapter()->quote($this->getDueDate()->toString('yyyy-MM-dd')).',rc.due_date)+0';
        
        $action = $this->_opSqlMap[$this->_operator];
        $value = $this->_replaceWildcards($this->_value);
        
        if (in_array($this->_operator, array('in', 'notin')) && ! is_array($value)) {
            $value = explode(' ', $this->_value);
        }
        
        if (in_array($this->_operator, array('equals', 'greater', 'less', 'in', 'notin'))) {
            $value = str_replace(array('%', '\\_'), '', $value);
            
            if (is_array($value) && empty($value)) {
                $_select->where('1=' . (substr($this->_operator, 0, 3) == 'not' ? '1/* empty query */' : '0/* impossible query */'));
            } elseif ($this->_operator == 'equals' && ($value === '' || $value === NULL || $value === false)) {
                $_select->where($field . 'IS NULL');
            } else {
                // finally append query to select object
                $_select->where($field . $action['sqlop'], $value, Zend_Db::INT_TYPE);
            }
        } else {
            // finally append query to select object
            $_select->where($field . $action['sqlop'], $value);
        }
        
        if ($this->_operator == 'not' || $this->_operator == 'notin') {
            $_select->orWhere($field . ' IS NULL');
        }
    }
}