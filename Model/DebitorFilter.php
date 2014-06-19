<?php 
class Billing_Model_DebitorFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_DebitorFilter';
    
    protected $_modelName = 'Billing_Model_Debitor';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'contact_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Addressbook_Model_ContactFilter', 
                'controller'        => 'Addressbook_Controller_Contact'
            )
        ),
    	'debitor_nr' => array('filter' => 'Tinebase_Model_Filter_Text'),
        'query'                => array('filter' => 'Billing_Model_DebitorQueryFilter'),
        'debitor_group_id' => array('filter' => 'Tinebase_Model_Filter_Id')
    );
    
	public function toArray($_valueToJson = false)
    {
        $result = parent::toArray($_valueToJson);
        
       /* foreach ($result as &$filterData) {
            if ($filterData['field'] == 'id' && $_valueToJson == true && ! empty($filterData['value'])) {
                //if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' value:' . print_r($filterData['value'], true));
                try {
                    $filterData['value'] = Donator_Controller_Project::getInstance()->get($filterData['value'])->toArray();
                } catch (Tinebase_Exception_NotFound $nfe) {
                    if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->INFO(__METHOD__ . '::' . __LINE__ . " could not find and resolve timeaccount {$filterData['value']}");
                }
            }
        }*/
        
        return $result;
    }
}
?>