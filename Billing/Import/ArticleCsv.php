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
    }

    
    /**
     * add some more values (container id)
     *
     * @return array
     */
    protected function _addData($recordData)
    {
    	$result = array();
		
    	$aC = Billing_Controller_ArticleGroup::getInstance();
    	$aGroup = $aC->getByName('Urkunden');
    	
    	$pC = Billing_Controller_PriceGroup::getInstance();
		
    	$pGDiver = $pC->getByName('Taucher');
    	$pGMember = $pC->getByName('Mitglied');
    	$pGMTI = $pC->getByName('MTI');
    	$pGMTA = $pC->getByName('MTA');
    	
    	$mwst = floor((($recordData['VK1']/$recordData['VK1EXKL'])-1)*100);
    	
    	if($mwst>8){
    		$mwst = 19;
    	}else if($mwst>0){
    		$mwst = 7;
    	}
    	if($mwst<0){
    		$mwst = 19;
    	}
    	$vatId =  Billing_Controller_Vat::getInstance()->getByName($mwst);
    	$articleUnit = Billing_Controller_ArticleUnit::getInstance()->getByName('Stück');
    	
    	if($mwst == 19){
    		$recordData['VK1EXKL'] = $recordData['VK1']/1.19;
    		$recordData['VK2EXKL'] = $recordData['VK2']/1.19;
    		$recordData['VK3EXKL'] = $recordData['VK3']/1.19;
    	}
    	
    	$priceGroups = array();
    	$priceGroups['DIVER'] = array(
    		'id' => $pGDiver->getId(),
    		'netto' => $recordData['VK3EXKL'],
    		'brutto' => $recordData['VK3']
    	);
    	$priceGroups['MEMBER'] = array(
    		'id' => $pGMember->getId(),
    		'netto' => $recordData['VK1EXKL'],
    		'brutto' => $recordData['VK1']
    	);
    	$priceGroups['MTI'] = array(
    		'id' => $pGMTI->getId(),
    		'netto' => $recordData['VK2EXKL'],
    		'brutto' => $recordData['VK2']
    	);
    	$priceGroups['MTA'] = array(
    		'id' => $pGMTA->getId(),
    		'netto' => $recordData['VK2EXKL'],
    		'brutto' => $recordData['VK2']
    	);
    	
    	$result['article_group_id'] = $aGroup->getId();
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
            	try{
            		$article = $this->_controller->getByArticleNumber($record->__get('article_nr'));
            	}catch(Exception $e){
            		$article = null;
            	}
				if(!($article instanceof Billing_Model_Article)){
            		$record = $this->_controller->createArticleWithPriceGroupPrices($record, $_recordData['prices']);
				}
				
				// $record = call_user_func(array($this->_controller, $this->_createMethod), $record);
            } else {
                //Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . ' ARTIKEL: ' . print_r($record,true));
				
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