<?php
class Billing_Backend_Payment extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'bill_payment';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Billing_Model_Payment';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = true;
    
	public function search(Tinebase_Model_Filter_FilterGroup $_filter = NULL, Tinebase_Model_Pagination $_pagination = NULL, $_onlyIds = FALSE){
        $recordSet = parent::search($_filter,$_pagination,$_onlyIds);
    	if( ($recordSet instanceof Tinebase_Record_RecordSet) && ($recordSet->count()>0)){
    		$it = $recordSet->getIterator();
    		foreach($it as $key => $record){
				$this->appendDependentRecords($record);				
    		}
    	}
    	return $recordSet;
    }
    
    protected function appendDependentRecords($record){
    	 if($record->__get('debitor_id')){
    		$this->appendForeignRecordToRecord($record, 'debitor_id', 'debitor_id', 'id', new Billing_Backend_Debitor());
        	$debitor = $record->__get('debitor_id');
    		try{
    			if(is_object($debitor)){
    				$contactId = $debitor->__get('contact_id');
    			}else{
    				$contactId = $debitor->contact_id;
    			}
    			$contact = Addressbook_Controller_Contact::getInstance()->get($contactId);
    			if(is_object($debitor)){
    				$debitor->__set('contact_id',$contact->toArray());
    			}else{
    				$debitor->contact_id = $contact->toArray();
    			}
    		}catch(Exception $e){
    		}
			$record->__set('debitor_id',$debitor);
        }
    	if($record->__get('order_id')){
    		$this->appendForeignRecordToRecord($record, 'order_id', 'order_id', 'id', new Billing_Backend_Order());
        	$order = $record->__get('order_id');
    		try{
    			if($order instanceof Billing_Model_Order){
    				$debitorId = $order->__get('debitor_id');
    			}else{
    				$debitorId = $order->debitor_id;
    			}
    			$debitor = Billing_Controller_Debitor::getInstance()->get($debitorId);
    			if($order instanceof Billing_Model_Order){
    				$order->__set('debitor_id',$debitor->toArray());
    			}else{
    				$order->debitor_id = $debitor->toArray();
    			}
    		}catch(Exception $e){
    		}
			$record->__set('order_id',$order);
        }
        if($record->__get('receipt_id')){
    		$this->appendForeignRecordToRecord($record, 'receipt_id', 'receipt_id', 'id', new Billing_Backend_Receipt());
    		$receipt = $record->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
			if($receipt){
				try{
					if($receipt instanceof Billing_Model_Order){
						$orderId = $receipt->__get('order_id');
					}else{
						$orderId = $receipt->order_id;
					}
					$order = Billing_Controller_Order::getInstance()->get($orderId);
					if($order instanceof Billing_Model_Order){
						$receipt->__set('order_id',$order->toArray());
					}else{
						$receipt->order_id = $order->toArray();
					}
				}catch(Exception $e){
				}
				$record->__set('receipt_id',$receipt);
			}
        }
     	if($record->__get('account_system_id')){
    		$this->appendForeignRecordToRecord($record, 'account_system_id', 'account_system_id', 'id', new Billing_Backend_AccountSystem());
         }
 		if($record->__get('account_system_id_haben')){
    		$this->appendForeignRecordToRecord($record, 'account_system_id_haben', 'account_system_id_haben', 'id', new Billing_Backend_AccountSystem());
         }
    
         if($record->__get('booking_id')){
    		$this->appendForeignRecordToRecord($record, 'booking_id', 'booking_id', 'id', new Billing_Backend_Booking());
         }
    	 if($record->__get('account_booking_id')){
    		$this->appendForeignRecordToRecord($record, 'account_booking_id', 'account_booking_id', 'id', new Billing_Backend_AccountBooking());
         }
         if($record->__get('payment_method_id')){
    		$this->appendForeignRecordToRecord($record, 'payment_method_id', 'payment_method_id', 'id', new Billing_Backend_PaymentMethod());
        }  
        if($record->__get('open_item_id')){
    		$this->appendForeignRecordToRecord($record, 'open_item_id', 'open_item_id', 'id', new Billing_Backend_OpenItem());
        }  
        if($record->__get('return_debit_base_payment_id')){
    		$this->appendForeignRecordToRecord($record, 'return_debit_base_payment_id', 'return_debit_base_payment_id', 'id', new Billing_Backend_Payment());
        } 
        /*if($record->__get('batch_job_dta_id')){
    		$this->appendForeignRecordToRecord($record, 'batch_job_dta_id', 'batch_job_dta_id', 'id', new Billing_Backend_BatchJobDta());
        } */ 
    }
    
    public function get($id, $_getDeleted = FALSE){
    	$record = parent::get($id, $_getDeleted);
    	$this->appendDependentRecords($record);
    	return $record;
    }
}
?>