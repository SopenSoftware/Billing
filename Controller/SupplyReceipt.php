<?php
/**
 *
 * Controller SupplyReceipt
 *
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_SupplyReceipt extends Tinebase_Controller_Record_Abstract
{
	/**
	 * config of courses
	 *
	 * @var Zend_Config
	 */
	protected $_config = NULL;

	/**
	 * the constructor
	 *
	 * don't use the constructor. use the singleton
	 */
	private function __construct() {
		$this->_applicationName = 'Billing';
		$this->_backend = new Billing_Backend_SupplyReceipt();
		$this->_modelName = 'Billing_Model_SupplyReceipt';
		$this->_currentAccount = Tinebase_Core::getUser();
		$this->_purgeRecords = FALSE;
		$this->_doContainerACLChecks = FALSE;
		$this->_config = isset(Tinebase_Core::getConfig()->billing) ? Tinebase_Core::getConfig()->billing : new Zend_Config(array());
	}

	private static $_instance = NULL;

	/**
	 * the singleton pattern
	 *
	 * @return SoEventManager_Controller_SoEvent
	 */
	public static function getInstance()
	{
		if (self::$_instance === NULL) {
			self::$_instance = new self();
		}

		return self::$_instance;
	}
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
    protected function _inspectCreate(Tinebase_Record_Interface $_record)
    {
    		$type = $_record->__get('type');
			switch($type){
				case SPQUERY:
						$_record->__set('supply_request_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('supply_request_nr'));
					break;
				case SPOFFER:
						$_record->__set('supply_offer_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('supply_offer_nr'));
					break;
				case SPORDER:
						$_record->__set('supply_order_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('supply_order_nr'));
					break;
				case SPINVOICE:
						$_record->__set('supply_inc_inv_nr', Tinebase_NumberBase_Controller::getInstance()->getNextNumber('supply_inc_inv_nr'));
					break;
					
			}
    }

	/**
	 * Get empty record
	 * @return Billing_Model_SupplyReceipt
	 */
	public function getEmptySupplyReceipt(){
		$emptyBrevet = new Billing_Model_SupplyReceipt(null,true);
		return $emptySupplyReceipt;
	}

	/**
	 * 
	 * Get the receipts positions by receiptId
	 * @param integer $receiptId
	 */
	public function getSupplyOrderPositions($receiptId){
		$backend = new Billing_Backend_SupplyOrderPosition();
		
		return $backend->getBySupplyReceiptId($receiptId);
	}
	
	public function getSupplyReceiptSumValues($receiptId){
		$positions = $this->getSupplyOrderPositions($receiptId)->toArray();
		$aPositions = array();
		foreach($positions as $pos){
			$aPositions[] = array(
					'nr' => $pos['position_nr'],
					'amount' => $pos['amount'],
					'unit' => $pos['unit_id']['name'],
					'article_nr' => $pos['article_id']['id'],
					'article_name' => $pos['name'],
					'article_desc' => $pos['description'],
					'unit_price_netto' => $pos['price_netto'],
					'price_netto' => $pos['total_netto'],
					'vat' => $pos['vat_id']['value'],
					'vat_index' => $pos['vat_id']['name']
				);
		}
		$aVatPos = array();
		$aVatTotal = array('sum' => array( 'netto' => 0, 'vat' => 0, 'brutto' => 0));
		$sumNetto = 0;
		$sumBrutto = 0;
		
		foreach($aPositions as $pos){
			if(!array_key_exists($pos['vat_index'],$aVatPos)){
				$aVatPos[$pos['vat_index']] = array('sum' => array('netto'=>0,'vat'=>0,'brutto'=>0));
			}
			$aVatPos[$pos['vat_index']]['sum']['netto'] += ($pos['amount'] * $pos['unit_price_netto']);
			$aVatPos[$pos['vat_index']]['sum']['vat'] = $aVatPos[$pos['vat_index']]['sum']['netto'] * $pos['vat'];
			$aVatPos[$pos['vat_index']]['sum']['brutto'] = $aVatPos[$pos['vat_index']]['sum']['netto'] + $aVatPos[$pos['vat_index']]['sum']['vat'];
		}
		
		foreach($aVatPos as $vatPos){
			$aVatTotal['sum']['netto'] += $vatPos['sum']['netto'];
			$aVatTotal['sum']['vat'] += $vatPos['sum']['vat'];
			$aVatTotal['sum']['brutto'] += $vatPos['sum']['brutto'];
		}
		
		return array(
			'vat_sums' => $aVatPos,
			'total' => $aVatTotal
		);
	}
}
?>