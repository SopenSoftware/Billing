<?php
/**
 * Tine 2.0
 * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Csv.php 12800 2010-02-12 16:08:17Z p.schuele@metaways.de $
 * 
 *

/**
 * csv import class for the addressbook
 * 
 * @package     Addressbook
 * @subpackage  Import
 * 
 */
class Billing_Import_ArticleCsv extends Tinebase_Import_Csv_Abstract
{    
	const PRICE_GROUP_EMPF = 3;
	const PRICE_GROUP_MITGL = 1;
	const PRICE_GROUP_ENTN = 4;
	
    /**
     * the constructor
     *
     * @param Tinebase_Model_ImportExportDefinition $_definition
     * @param mixed $_controller
     * @param array $_options additional options
     */
    public function __construct(Tinebase_Model_ImportExportDefinition $_definition, $_controller = NULL, $_options = array())
    {
        parent::__construct($_definition, $_controller, $_options);
        $this->sellPriceController = Billing_Controller_SellPrice::getInstance();
    }

    
    /**
     * add some more values (container id)
     *
     * @return array
     */
    protected function _addData($recordData)
    {
    	$result = array();
    	$priceGroupId = 1;
    	$articleGroupId = null;
    	if($recordData['article_ext_nr']){
    		$isbn = $recordData['article_ext_nr'];
    		
    		if(strpos($isbn,'WS')){
    			$articleGroupId = 5;
    		}elseif(strpos($isbn,'WK')){
    			$articleGroupId = 4;
    		}elseif(strpos($isbn,'OG')){
    			$articleGroupId = 3;
    		}elseif(strpos($isbn,'FB')){
    			$articleGroupId = 2;
    		}elseif(strpos($isbn,'EB')){
    			$articleGroupId = 1;
    		}
    	}
    	if(!$articleGroupId){
    		$articleGroupId = 1;
    	}
    	$result['article_group_id'] = $articleGroupId;
    	
    	$pC = Billing_Controller_PriceGroup::getInstance();
		
    	$pGEmpf = $pC->getByName('Empfohlen');
    	$pGMitgl = $pC->getByName('Mitglied');
    	$pGEntn = $pC->getByName('Entnahme');
    	
    	$vatId =  Billing_Controller_Vat::getInstance()->getByName(7);
    	$articleUnit = Billing_Controller_ArticleUnit::getInstance()->getByName('Stück');
    	
    	$recordData['mitgl_preis'] = str_replace(',','.',$recordData['mitgl_preis']);
    	$recordData['entn_preis'] = str_replace(',','.',$recordData['entn_preis']);
    	$recordData['empf_preis'] = str_replace(',','.',$recordData['empf_preis']);
    	
    	
    	if(!is_numeric($recordData['mitgl_preis'])){
    		$recordData['mitgl_preis'] = 0;
    	}else{
    		$recordData['mitgl_preis'] = abs((float)$recordData['mitgl_preis']);
    	}
    	
        	if(!is_numeric($recordData['entn_preis'])){
    		$recordData['entn_preis'] = 0;
    	}else{
    		$recordData['entn_preis'] = abs((float)$recordData['entn_preis']);
    	}
        	if(!is_numeric($recordData['empf_preis'])){
    		$recordData['empf_preis'] = 0;
    	}else{
    		$recordData['empf_preis'] = abs((float)$recordData['empf_preis']);
    	}
    	$priceGroups['MITGL'] = array(
    		'id' => $pGMitgl->getId(),
    		'netto' => $recordData['mitgl_preis'],
    		'brutto' =>$recordData['mitgl_preis']*1.07
    	);
    	$priceGroups['ENTN'] = array(
    		'id' => $pGEntn->getId(),
    		'netto' => $recordData['entn_preis'],
    		'brutto' => $recordData['entn_preis']*1.07
    	);
    	$priceGroups['EMPF'] = array(
    		'id' => $pGEmpf->getId(),
    		'netto' => $recordData['empf_preis'],
    		'brutto' => $recordData['empf_preis']*1.07
    	);
    	
    	$result['prices'] = $priceGroups;
    	$result['vat_id'] = $vatId;
    	$result['article_unit_id'] = $articleUnit->getId();
    	
    	return $result;
    }
       
	protected function _importRecord($_recordData, &$_result)
    {
        $record = new $this->_modelName($_recordData, TRUE);
        
        if ($record->isValid()) {
            if (! $this->_options['dryrun']) {
				$record = $this->_controller->createArticleWithPriceGroupPrices($record, $_recordData['prices']);
               // $record = call_user_func(array($this->_controller, $this->_createMethod), $record);
            } else {
                $_result['results']->addRecord($record);
            }
            
            $_result['totalcount']++;
            
        } else {
            if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . ' ' . print_r($record->toArray(), true));
            throw new Tinebase_Exception_Record_Validation('Imported record is invalid.');
        }
    }
	
    
    /**
     * do conversions
     * -> sanitize account_id
     *
     * @param array $_data
     * @return array
     */
    protected function _doConversions($_data)
    {
        $result = parent::_doConversions($_data);
        
        return $result;
    }    
}
?>