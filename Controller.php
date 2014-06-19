<?php
/**
 * Tine 2.0
 *
 * MAIN controller for Billing, does event and container handling
 *
 * @package     Billing
 * @subpackage  Controller
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2010-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Controller.php 18044 2010-12-22 23:05:24Z l.kneschke@metaways.de $
 *
 */

/**
 * main controller for Billing
 *
 * @package     Billing
 * @subpackage  Controller
 */
class Billing_Controller extends Tinebase_Controller_Abstract implements Tinebase_Event_Interface, Tinebase_Container_Interface
{
	/**
	 * holds the instance of the singleton
	 *
	 * @var Filemamager_Controller
	 */
	private static $_instance = NULL;

	/**
	 * constructor (get current user)
	 */
	private function __construct() {
		$this->_currentAccount = Tinebase_Core::getUser();
	}

	/**
	 * don't clone. Use the singleton.
	 *
	 */
	private function __clone()
	{
	}

	/**
	 * the singleton pattern
	 *
	 * @return Addressbook_Controller
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new Billing_Controller;
		}

		return self::$_instance;
	}

	/**
	 * event handler function
	 *
	 * all events get routed through this function
	 *
	 * @param Tinebase_Event_Abstract $_eventObject the eventObject
	 *
	 * @todo    write test
	 */
	public function handleEvents(Tinebase_Event_Abstract $_eventObject)
	{
		try{
			if($_eventObject instanceof Billing_Events_BillableReceiptCreated){
				// create open item out of invoice or credit
				$db = Tinebase_Core::getDb();
				$tm = Tinebase_TransactionManager::getInstance();
				$tId = $tm->startTransaction($db);
				try{
					$receipt = Billing_Controller_Receipt::getInstance()->get($_eventObject->receipt->getId());
					// set payed and open sum
					Billing_Controller_Receipt::getInstance()->onBillableReceiptCreated($receipt);
					// create according open item
					Billing_Controller_OpenItem::getInstance()->onBillableReceiptCreated($receipt);
					
					if(Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::FIBU_INSTANT_BOOK_BILLABLE)){
						// do fibu booking -> fire event: BillableReceiptBooked
						Billing_Controller_Booking::getInstance()->onBillableReceiptCreated($receipt);
					}
				
					$tm->commitTransaction($tId);
				}catch(Exception $e){
					$tm->rollback($tId);
					throw $e;
				}
				
			}
			 
			 
			if($_eventObject instanceof Billing_Events_PaymentReverted){
				// TODO: NRW

				//Billing_Controller_OpenItem::getInstance()->onOpenItemPayed($_eventObject->payment);
			}
			 
			if($_eventObject instanceof Billing_Events_PaymentCreated){
				// TODO: NRW
				try{
					$payment = $_eventObject->payment;
					Billing_Controller_Booking::getInstance()->onPaymentCreated($payment);
					 
					if($payment->__get('receipt_id')){
						$receipt = $payment->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance());
						 
						$openItem = Billing_Controller_OpenItem::getInstance()->getByReceiptId($receipt->getId());
						 
						Billing_Controller_OpenItem::getInstance()->payOpenItem($openItem->getId(), $payment);
					}
					 
					if($payment->isReturnDebit()){
						Tinebase_Event::fireEvent(new Billing_Events_PaymentDebitReturnCreated($payment));
					}
				}catch(Exception $e){
					echo $e->__toString();
				}

				//Billing_Controller_OpenItem::getInstance()->onOpenItemPayed($_eventObject->payment);
			}
			 
			
			if($_eventObject instanceof Billing_Events_PaymentDebitReturnCreated){
				// TODO: NRW
				try{
					$payment = $_eventObject->payment;
					
					Billing_Controller_OpenItem::getInstance()->onPaymentDebitReturnCreated($payment);
					
				}catch(Exception $e){
					echo $e->__toString();
				}

				//Billing_Controller_OpenItem::getInstance()->onOpenItemPayed($_eventObject->payment);
			}
			
			if($_eventObject instanceof Billing_Events_PaymentBooked){
				// TODO: NRW
				try{
					$payment = $_eventObject->payment;
					$booking = $_eventObject->booking;
					Billing_Controller_DebitorAccount::getInstance()->onPaymentBooked($payment,$booking);
				}catch(Exception $e){
					echo $e->__toString();
				}
			}
			 
			if($_eventObject instanceof Billing_Events_PaymentDonationDetected){
				// TODO: NRW
				try{
					$payment = $_eventObject->payment;
					Billing_Controller_DebitorAccount::getInstance()->onPaymentDonationDetected($payment);
				}catch(Exception $e){
					echo $e->__toString();
				}
			}
			 
			if($_eventObject instanceof Billing_Events_BillableReceiptBooked){
				try{
				// TODO: NRW
				$receipt = Billing_Controller_Receipt::getInstance()->get($_eventObject->receipt->getId());
				$openItem = $_eventObject->openItem;
				$booking = $_eventObject->booking;

				
				// after booking -> debitor account gets  created
				Billing_Controller_DebitorAccount::getInstance()->onBillableReceiptBooked($receipt,$openItem,$booking);

				$receipt->__set('booking_id', $booking->getId());
				$openItem->__set('booking_id', $booking->getId());

				
				Billing_Controller_Receipt::getInstance()->update($receipt);
				Billing_Controller_OpenItem::getInstance()->update($openItem);

				}catch(Exception $e){
					echo $e->__toString();
				}
			}
			 
			 
			if($_eventObject instanceof Billing_Events_BillableReceiptReverted){
				try{
					// TODO: NRW
					$receipt = $_eventObject->revertedReceipt;
					$reversionReceipt = $_eventObject->reversionReceipt;

					// after booking -> debitor account gets  created
					Billing_Controller_DebitorAccount::getInstance()->onBillableReceiptReverted($receipt,$reversionReceipt);
				}catch(Exception $e){
					echo $e->__toString();
				}
			}
			
			 
		}catch(Exception $e){
			Tinebase_Core::getLogger()->warn($e->__toString());
			echo $e->__toString();
		}
	}

	/**
	 * creates the initial folder for new accounts
	 *
	 * @param mixed[int|Tinebase_Model_User] $_account   the accountd object
	 * @return Tinebase_Record_RecordSet of subtype Tinebase_Model_Container
	 */
	public function createPersonalFolder($_account)
	{
	}

	/**
	 * delete all personal user folders and the contacts associated with these folders
	 *
	 * @param Tinebase_Model_User $_account the accountd object
	 * @todo implement and write test
	 */
	public function deletePersonalFolder($_account)
	{
	}
}
