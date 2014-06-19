<?php
/**
 * 
 * Controller OrderPosition
 * 
 * @copyright sopenGmbH Herzogenrath, www.sopen.de (2011)
 * @author hhartl <hhartl@sopen.de>
 *
 */
class Billing_Controller_OrderPosition extends Tinebase_Controller_Record_Abstract
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
        $this->_backend = new Billing_Backend_OrderPosition();
        $this->_modelName = 'Billing_Model_OrderPosition';
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
	 * (non-PHPdoc)
	 * @see Tinebase_Controller_Record_Abstract::update()
	 */
	public function update(Tinebase_Record_Interface $_record){
		
		parent::update($_record);
		
		// after update
		if($this->mustUpdateReceiptAtOnce()){
			
			try{
				
				$receiptPosition = Billing_Controller_ReceiptPosition::getInstance()->getByOrderPositionId($_record->getId());
				$receipt = $receiptPosition->getForeignRecordBreakNull('receipt_id', Billing_Controller_Receipt::getInstance());
				
				if($receipt){
					Billing_Controller_ReceiptPosition::getInstance()->updateReceipt($receipt);
				}
				
			}catch(Tinebase_Exception_NotFound $e){
				// no receipt to be updated
			}
		}
		
		return $this->get($_record->getId());
	}
    
    
    /**
     * Get empty record
     * @return Billing_Model_OrderPosition
     */
    public function getEmptyOrderPosition(){
     	$emptyOrderPosition = new Billing_Model_OrderPosition(null,true);
     	return $emptyOrderPosition;
    }
    
    public function invert($receiptPosition){
    	$receiptPosition->__set('amount', $receiptPosition->__get('amount') * (-1));
    	$this->calculate($receiptPosition);
    }
    
    /**
     * 
     * Create new receipt position based on an article object
     * @param {Billing_Model_Article} $article
     */
    public function getPositionFromArticle($article, $debitor, $posData){
   		$article = Billing_Controller_Article::getInstance()->get($article->getId());
    	$discountPercentage = 0;
    	$addPercentage = 0;
    	
    	$vatId = $article->__get('vat_id');
    	$vat2Id = $article->__get('price2_vat_id');
    	
    	if(is_object($debitor) && is_object($debitor->__get('vat_id')) &&  ($debitor->__get('vat_id')->__get('value')==0)){
    		$vatId = $debitor->__get('vat_id');
    	}
    	
    	if(array_key_exists('amount', $posData)){
    		$amount = $posData['amount'];
    	}
    	if(array_key_exists('discount_percentage', $posData)){
    		$discountPercentage = $posData['discount_percentage'];
    	}
    	if(array_key_exists('add_percentage', $posData)){
    		$addPercentage = $posData['add_percentage'];
    	}
        if(array_key_exists('vat_id', $posData)){
    		$vatId = $posData['vat_id'];
    	}
    	
     	if(array_key_exists('price2_vat_id', $posData)){
    		$vat2Id = $posData['price2_vat_id'];
    	}
    	
    	$priceGroupId = $debitor->__get('price_group_id');
    	
    	if(array_key_exists('price_group_id', $posData)){
    		$priceGroupId = $posData['price_group_id'];
    	}
    	
    	if(!$vat2Id){
    		$vat2Id = Billing_Controller_Vat::getInstance()->getByName('0');
    	}
    	
    	$articleId = $article->__get('id');
    	
    	$receiptPosition = $this->getEmptyOrderPosition();
		// add data to receipt position
		$receiptPosition->__set('article_id', $articleId);
		$receiptPosition->__set('price_group_id', $priceGroupId);
		$receiptPosition->__set('vat_id', $vatId);
		$receiptPosition->__set('price2_vat_id', $vat2Id);
		
		$name = $article->__get('name');
		if(array_key_exists('name', $posData) && $posData['name']){
			$name = $posData['name'];
		}
		$receiptPosition->__set('name', $article->__get('name'));
		
		$desc = $article->__get('description');
		if(array_key_exists('description', $posData) && $posData['description']){
			$desc = $posData['description'];
		}
		$receiptPosition->__set('description',$desc);
		
		$comment = $article->__get('comment');
		if(array_key_exists('comment', $posData) &&  $posData['comment']){
			$comment = $posData['comment'];
		}
		$receiptPosition->__set('comment', $comment);
		
		$debPrice = $article->getPriceForDebitor($debitor);
		
		$priceNetto = $debPrice['price_netto'];
		$price2Netto = $debPrice['price2_netto'];
		
		if(array_key_exists('price_netto',$posData) && $posData['price_netto'] <> $priceNetto){
			$priceNetto = $posData['price_netto'];
		}

		$receiptPosition->__set('price_netto', $priceNetto);
		$receiptPosition->__set('price2_netto', $price2Netto);
		$receiptPosition->__set('amount', $amount);
		$receiptPosition->__set('unit_id', $article->__get('article_unit_id')->id);
		$receiptPosition->__set('discount_percentage',$discountPercentage);
		$receiptPosition->__set('add_percentage',$addPercentage);
		// calculate the position
		//$this->calculate($receiptPosition);
		
		//$receiptPosition->__set('vat_id', $article->__get('vat_id')->id);
		$receiptPosition->flatten();
		
		return $receiptPosition;
    }
    
    public function calculate($receiptPosition){
    	$this->validate($receiptPosition);
    	//$vatValue = $receiptPosition->__get('vat_id')->value + 1;
    	$vatValue = $receiptPosition->getForeignRecord('vat_id', Billing_Controller_Vat::getInstance())->__get('value') + 1;
    	
      	if(!$receiptPosition->getForeignIdBreakNull('price2_vat_id')){
    		$vat2 = Billing_Controller_Vat::getInstance()->getByName('0');
    		$receiptPosition->__set('price2_vat_id', $vat2);
    	}
    	$vat2Value = $receiptPosition->getForeignRecord('price2_vat_id', Billing_Controller_Vat::getInstance())->__get('value') + 1;
    	
    	$priceNetto = $receiptPosition->__get('price_netto');
    	$price2Netto = $receiptPosition->__get('price2_netto');
    	
    	$amount = $receiptPosition->__get('amount');
    	$factor = $receiptPosition->__get('factor');
    	$weight = $receiptPosition->__get('weight');
    	$discountPercentage = $receiptPosition->__get('discount_percentage');
    	$addPercentage = $receiptPosition->__get('add_percentage');
    	
    	if(!$weight){
    		$weight = 0;
    	}
    	if(!$discountPercentage){
    		$discountPercentage = 0;
    	}
    	
    	if(!$addPercentage){
    		$addPercentage = 0;
    	}
    	
    	$discountPercentage = ($discountPercentage/100);
    	$addPercentage = ($addPercentage/100);
    	
    	
    	$totalWeight = $weight * $amount * $factor;
    	
    	$total1Netto = $priceNetto * $amount * $factor;
    	$total2Netto = $price2Netto * $amount * $addPercentage;
    	
    	$discountTotal = $total1Netto * $discountPercentage;
    	$total1Netto -= $discountTotal;
    	
    	
    	$totalNetto = $total1Netto + $total2Netto;
    	
    	
    	
    	
    	$total1Brutto = $totalNetto * $vatValue;
    	$total2Brutto = $total2Netto * $vat2Value;
    	
    	$totalBrutto = $total1Brutto + $total2Brutto;
    	
      	
    	$receiptPosition->__set('weight',$weight);
    	$receiptPosition->__set('discount_percentage',$discountPercentage);
    	$receiptPosition->__set('discount_total',$discountTotal);
    	
    	$receiptPosition->__set('total_netto',$totalNetto);
    	$receiptPosition->__set('total_brutto',$totalBrutto);
    	
    	$receiptPosition->__set('total1_netto',$total1Netto);
    	$receiptPosition->__set('total1_brutto',$total1Brutto);
    	
    	$receiptPosition->__set('total2_netto',$total2Netto);
    	$receiptPosition->__set('total2_brutto',$total2Brutto);
    	$receiptPosition->__set('total_weight',$totalWeight);
    	
    
    }
    
   	public function getVatSum($orderPosition){
   		return $orderPosition->getForeignRecord('vat_id', Billing_Controller_Vat::getInstance())->__get('value') * $orderPosition->__get('total_netto');
   	}
   	
   	public function getRevenueAccountAccordingToVat($orderPosition){
   		$vatValue = $orderPosition->getForeignRecord('vat_id', Billing_Controller_Vat::getInstance())->__get('value');
   		$article = $orderPosition->getForeignRecord('article_id', Billing_Controller_Article::getInstance());
   		if($vatValue>0){
   			$acc = $article->__get('rev_account_vat_in');
   		}else{
   			$acc = $article->__get('rev_account_vat_ex');
   		}
   		return $acc;
   	}
    
    public function validate($receiptPosition){
    	$valid = false;
    	
    	$vat = $receiptPosition->__get('vat_id');
    	if(($vat instanceof Billing_Model_Vat)){
    		;
    	}elseif(is_numeric($vat)){
    		$vat = Billing_Controller_Vat::getInstance()->get($vat);
    	}elseif(is_array($vat) && array_key_exists('id', $vat)){
    		$vat = Billing_Controller_Vat::getInstance()->get($vat['id']);
    	}else{
    		throw new Billing_Exception_OrderPosition('Invalid vat');
    	}
    	
    	$vatValue = $vat->__get('value');
    	
    	if( is_numeric($vatValue) ){
    		$valid = true;
    	}
    		
    	$priceNetto = $receiptPosition->__get('price_netto');
    	if(!is_numeric($priceNetto)){
    		$valid = false;
    		//throw new Billing_Exception_OrderPosition('No netto price');
    	}
    	
    	$amount = $receiptPosition->__get('amount');
	    if(!is_numeric($amount)){
	    	//throw new Billing_Exception_OrderPosition('Missing amount');
	    	$valid = false;
	    }
	    
	    if(!$valid){
	    	throw new Billing_Exception_OrderPosition('Receipt position is invalid'. print_r($receiptPosition,true));
	    }
    }
    
    public function getByReceiptId($receiptId){
    	return $this->_backend->getByReceiptId($receiptId);
    }
    
    public function getPositionsByOrderId($orderId){
    	return $this->_backend->getByOrderId($orderId);
    }
    
    /**
     * 
     * Add receipt positions
     * @param unknown_type $receipt
     * @param array $positions	Array of objects: Billing_Model_Order
     */
    public function addReceiptPositions($receipt, $positions){
    	$rpController = Billing_Controller_ReceiptPosition::getInstance();
    	$rpController->addOrderPositions($receipt, $positions);
    }
    
}
?>