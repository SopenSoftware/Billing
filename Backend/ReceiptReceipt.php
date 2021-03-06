<?php
class Billing_Backend_ReceiptReceipt extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_receipt_receipt';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_ReceiptReceipt';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
    	return parent::search($_filter,$_pagination,false);
    }
}
?>