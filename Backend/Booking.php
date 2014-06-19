<?php
class Billing_Backend_Booking extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_booking';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_Booking';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
        $recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	return $recordSet;
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	return $record;
    }
	
	 protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {        
        
    	
    	$select = $this->_db->select();
        
        if (is_array($_cols) && isset($_cols['count'])) {
            $cols = array(
                'count'                => 'COUNT(*)'
            );
            
        } 
		
		if(!is_array($_cols)){
			$cols = (array) $_cols;
		}
        
        $addCols =  array(
			'booking_nr' => "(booking_nr)+0"
        );			
        $cols = array_merge(
                $cols, 
               $addCols
		    );
        
        $select->from(array($this->_tableName => $this->_tablePrefix . $this->_tableName), $cols);
       
        if (!$_getDeleted && $this->_modlogActive) {
            // don't fetch deleted objects
            $select->where($this->_db->quoteIdentifier($this->_tableName . '.is_deleted') . ' = 0');                        
        }
        
        //echo $select->assemble();
        return $select;
    }
}
?>