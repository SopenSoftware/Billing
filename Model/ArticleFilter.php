<?php 
class Billing_Model_ArticleFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_ArticleFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'id'          => array('filter' => 'Tinebase_Model_Filter_Id'),
        'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('name','description','comment','article_nr','article_ext_nr'))
        ),
        'article_group_id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'article_series_id' => array('filter' => 'Tinebase_Model_Filter_Id'),
        'article_nr'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'article_ext_nr'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'name'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'description'          => array('filter' => 'Tinebase_Model_Filter_Text'),
        'comment'          => array('filter' => 'Tinebase_Model_Filter_Text')
    );
}
?>