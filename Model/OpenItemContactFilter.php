<?php

class Billing_Model_OpenItemContactFilter extends Tinebase_Model_Filter_ForeignId
{
    /**
     * @var array list of allowed operators
     */
    protected $_operators = array(
        0 => 'AND',
        1 => 'OR',
        2 => 'equals'
    );
    
    /**
     * @var Tinebase_Model_Filter_FilterGroup
     */
    protected $_filterGroup = NULL;
    
    /**
     * 
     * Level 1 upward: Foreign Record FilterGroup
     * @var unknown_type
     */
    protected $_filterGroupP1 = NULL;
    
    /**
     * @var Tinebase_Controller_Record_Abstract
     */
    protected $_controller = NULL;
    
    protected $_controllerP1 = NULL;
    
    /**
     * @var array
     */
    protected $_foreignIds = NULL;
    
    protected $_foreignIdsP1 = null;
    
    /**
     * creates corresponding filtergroup
     *
     * @param array $_value
     */
    public function setValue($_value) {
        //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($_value, true));
        
        //$this->_filterGroup = new $this->_options['filtergroup']((array)$_value, $this->_operator, $this->_options);
        
    	$this->_filterGroupP1 = new $this->_options['filtergroup_p1']((array)$_value, $this->_operator, $this->_options);
 		$this->_controller = call_user_func($this->_options['controller'] . '::getInstance');
       	$this->_controllerP1 = call_user_func($this->_options['controller_p1'] . '::getInstance');
        
        $this->_foreignIds = $this->_foreignIdsP1 = NULL;
        
        $this->_value = $_value;
    }
    
    /**
     * set options 
     *
     * @param array $_options
     */
    protected function _setOptions(array $_options)
    {
        if (! array_key_exists('controller', $_options) || ! array_key_exists('filtergroup', $_options)) {
            throw new Tinebase_Exception_InvalidArgument('a controller and a filtergroup must be specified in the options');
        }
        $this->_options = $_options;
    }
    
    /**
     * appends sql to given select statement
     *
     * @param Zend_Db_Select                $_select
     * @param Tinebase_Backend_Sql_Abstract $_backend
     */
    public function appendFilterSql($_select, $_backend)
    {
        $db = Tinebase_Core::getDb();
        
        if (! is_array($this->_foreignIdsP1)) {
            $this->_foreignIdsP1 = $this->_controllerP1->search($this->_filterGroupP1, new Tinebase_Model_Pagination(), FALSE, TRUE);
        }
        
        $filters = array(array(
        	'field' => 'contact_id',
        	'operator' => 'AND',
        	'value' => array(array(
        		'field' => 'id',
        		'operator' => 'in',
        		'value'	=> $this->_foreignIdsP1
        	))
        ));
        $this->_filterGroup = new $this->_options['filtergroup']($filters);
        
     	if (! is_array($this->_foreignIds)) {
            $this->_foreignIds = $this->_controller->search($this->_filterGroup, new Tinebase_Model_Pagination(), FALSE, TRUE);
        }
        
        $_select->where('bill_open_item.debitor_id' . ' IN (?)', empty($this->_foreignIds) ? array('') : $this->_foreignIds);
    }
    
    public function setRequiredGrants(array $_grants)
    {
        $this->_filterGroup->setRequiredGrants($_grants);
    }
    
    /**
     * returns array with the filter settings of this filter
     *
     * @param  bool $_valueToJson resolve value for json api?
     * @return array
     */
    public function toArray($_valueToJson = false)
    {
    	//return $this->_value;
    	
    	$aRes = array(
        		'field' => 'contact_id',
        		'operator' => 'AND',
        		'value'	=> $this->_value
        );
        return $aRes;
    	
        $aRes = array(array(
        		'field' => 'id',
        		'operator' => 'in',
        		'value'	=> $this->_foreignIdsP1
        ));
        Zend_Json::encode($aRes);
        $result = array(
            'field'     => $this->_field,
            'operator'  => $this->_operator,
            'value'     => $aRes
        );
        return $result;
    }    
}
