<?php 
class Billing_Model_ArticleSoldFilter extends Tinebase_Model_Filter_FilterGroup
{
    /**
     * @var string application of this filter group
     */
    protected $_applicationName = 'Billing';
    
    protected $_className = 'Billing_Model_ArticleSoldFilter';
    
    /**
     * @var array filter model fieldName => definition
     */
    protected $_filterModel = array(
    	'query'                => array(
            'filter' => 'Tinebase_Model_Filter_Query', 
            'options' => array('fields' => array('name'))
        ),
        'receipt_date' => array('filter' => 'Billing_Model_ReceiptDateFilter'),
        //'receipt_id' => array('filter' =>  'Tinebase_Model_Filter_Id'),
        'receipt_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_ReceiptFilter', 
                'controller'        => 'Billing_Controller_Receipt'
            )
        ),
       /* 'debitor_id' => array('filter' => 'Tinebase_Model_Filter_ForeignId', 
            'options' => array(
                'filtergroup'       => 'Billing_Model_ASDebitorFilter', 
                'controller'        => 'Billing_Controller_ArticleSold'
            )
        ),*/
        'debitor_id' => array('filter' => 'Billing_Model_ASDebitorFilter'),
        
      	'debitor_group_id' => array('filter' => 'Billing_Model_ASDebitorFilter'),
      	'name'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa'),
        'article_group_id' => array('filter' => 'Tinebase_Model_Filter_Id', 'alias' => 'sa'),
        'article_series_id' => array('filter' => 'Tinebase_Model_Filter_Id', 'alias' => 'sa'),
        'article_nr'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa'),
        'article_ext_nr'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa'),
        'name'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa'),
        'description'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa'),
        'comment'          => array('filter' => 'Tinebase_Model_Filter_Text', 'alias' => 'sa')
    );
}
?>