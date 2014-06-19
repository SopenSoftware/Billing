<?php
class Billing_Model_DtaDiffSaldationFilter extends Tinebase_Model_Filter_Int
{
    
    protected function _getQuotedFieldName($_backend) {
    	$field = $_backend->getAdapter()->quoteIdentifier(
            $_backend->getTableName() . '.'.$this->_field
        );
        return ' ROUND(ABS('.$field.'),2)';
    }
    
    
}