<?php
/**
 * 
 * Controller ReceiptPosition
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_ReceiptPosition extends Tinebase_Controller_Record_Abstract
{
    /**
     * config of courses
     *
     * @var Zend_Config
     */
    protected $_config = NULL;
    
    protected $updateReceiptAtOnce = true;
    
    /**
     * the constructor
     *
     * don't use the constructor. use the singleton
     */
    private function __construct() {
        $this->_applicationName = 'Billing';
        $this->_backend = new Billing_Backend_ReceiptPosition();
        $this->_modelName = 'Billing_Model_ReceiptPosition';
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
    
	public function setUpdateReceiptAtOnce($updateReceiptAtOnce=true){
    	$this->updateReceiptAtOnce = $updateReceiptAtOnce;
    }
    
    public function mustUpdateReceiptAtOnce(){
    	return $this->updateReceiptAtOnce;
    }
    
    /**
     * Get empty record
     * @return Billing_Model_ReceiptPosition
     */
    public function getEmptyReceiptPosition(){
     	$emptyReceiptPosition = new Billing_Model_ReceiptPosition(null,true);
     	return $emptyReceiptPosition;
    }
    
    public function getByReceiptId($receiptId){
    	return $this->_backend->getByReceiptId($receiptId);
    }
    
    public function getPositionsByReceiptId($ReceiptId){
    	return $this->_backend->getByReceiptId($ReceiptId);
    }
    
    public function getByOrderPositionId($orderPositionId){
    	return $this->_backend->getByProperty($orderPositionId, 'order_position_id');
    }
    
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::create()
	 */
	public function create(Tinebase_Record_Interface $_record){
		parent::create($_record);
		// after create
		if($this->mustUpdateReceiptAtOnce()){
			$this->updateReceipt($receiptPosition->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance()));
		}
		return $this->get($_record->getId());
	}
	
	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::_inspectCreate()
	 */
	public function _inspectCreate(Billing_Model_ReceiptPosition $record){
		$receiptId = $record->getForeignId('receipt_id');
		$positions = $this->getPositionsByReceiptId($receiptId);
		$count = count($positions);
		$record->__set('position_nr', ++$count);
	}

	/**
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::update()
	 */
	public function update(Tinebase_Record_Interface $_record){
		parent::update($_record);
		// after update
		if($this->mustUpdateReceiptAtOnce($receiptPosition->getForeignRecord('receipt_id', Billing_Controller_Receipt::getInstance()))){
			$this->updateReceipt($_record);
		}
		return $this->get($_record->getId());
	}
	
	public function updateReceipt($receipt){
		$aCalc = $this->getCalculationByReceiptId($receipt->getId());
		$receipt->__set('total_netto', $aCalc['total_netto']);
		$receipt->__set('total_brutto', $aCalc['total_brutto']);
		$receipt->__set('total_weight', $aCalc['total_weight']);
		
		$receipt = Billing_Controller_Receipt::getInstance()->update($receipt);
	}
    
    public function getCalculationByReceiptId($receiptId){
    	$positions = $this->getPositionsByReceiptId($receiptId);
    	//print_r($positions->toArray());
    	$totalNetto = $totalBrutto = $totalWeight = 0;
    	foreach($positions as $pos){
    		$totalNetto += $pos->__get('total_netto');
    		$totalBrutto += $pos->__get('total_brutto');
    		$totalWeight += $pos->__get('total_weight');
    	}
    	return array(
    		'total_netto' => $totalNetto,
    		'total_brutto' => $totalBrutto,
    		'total_weight' => $totalWeight
    	);
    }
    
    private function inspectAddOrderPosition($receipt, $oPosition){
    	// if its an invoice -> decrease stock amount
    	if($receipt->isInvoice() || $receipt->isCredit()){
    		$stfController = Billing_Controller_StockFlow::getInstance();
    		$sf = new Billing_Model_StockFlow(null,true);
    		$stockLocation = Billing_Controller_StockLocation::getInstance()->getDefaultStockLocation();
 
    		$stockLocationId = $stockLocation->getId();
    		$article = $oPosition->getForeignRecord('article_id', Billing_Controller_Article::getInstance());
    		if($article->__get('is_stock_article')){
	    		$articleId = $article->getId();
	    		$priceNetto = $oPosition->__get('price_netto');
	    		$direction = 'OUT';
	    		$bookingDate = strftime('%Y-%m-%d');
	    		$amount = $oPosition->__get('amount');
	    		$reason = 'Lieferung';
	    		$sf->__set('article_id',$articleId);
	    		$sf->__set('stock_location_id',$stockLocationId);
	    		$sf->__set('price_netto',$priceNetto);
	    		$sf->__set('direction',$direction);
	    		$sf->__set('booking_date',$bookingDate);
	    		$sf->__set('amount',$amount);
	    		$sf->__set('reason',$reason);
	    		$stfController->create($sf);
    		}
    	}	
    }
    
    /**
     * 
     * Add receipt positions
     * @param unknown_type $receipt
     * @param array $positions	Array of objects: Billing_Model_Receipt
     */
    public function addOrderPositions($receipt, $orderPositions){
    	$receiptId = $receipt->getId();
    	$i = 0;
    	$this->setUpdateReceiptAtOnce(false);
    	foreach($orderPositions as $oPosition){
    		$oPositionId = $oPosition->getId();
    		$this->inspectAddOrderPosition($receipt, $oPosition);
    		$rPosition = $this->getEmptyReceiptPosition();
    		$rPosition->__set('receipt_id',$receiptId);
    		$rPosition->__set('order_position_id', $oPositionId);
    		$rPosition->__set('position_nr', ++$i);
    		$pos = $this->create($rPosition);
    	}
    	$this->updateReceipt($receipt);
    }    
}
?>