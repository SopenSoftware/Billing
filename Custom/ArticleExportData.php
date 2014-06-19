<?php 
class Billing_Custom_ArticleExportData{

	// TODO later: use IteratorAggregate etc.
	// set multiple record sets according to applied grouping
	private $recordSets = array();
	
	private $recordSet = null;
	
	/*
	private $groupingMap = array();
	*/
	private $startDate = null;
	
	private $endDate = null;
	
	private $params = null;
	
	private $sumTotalNetto = 0;
	
	private $sumTotalBrutto = 0;
	
	private $groupingCustomer = false;
	private $groupingCustomerGroup = false;
	private $groupingArticleGroup = false;
	
	
	private $fieldLabels = array(
		'article_nr' => 'Artikel-Nr',
		'article_ext_nr' => 'Artikel-Nr2',
		'name' => 'Bezeichnung',
		'article_group_id' => 'Artikelgruppe',
		'article_series_id' => 'Serie',
		'unit_id' => 'Einheit',
		'amount' => 'verkaufte Menge',
		'price_netto' => 'Einzel netto',
		'price_brutto' => 'Einzel brutto',
		'total1_netto' => 'Preis netto',
		'total1_brutto' => 'Preis brutto',
		'total2_netto' => 'Zuschlag netto',
		'total2_brutto' => 'Zuschlag brutto',
		'total_netto' => 'Gesamt netto',
		'total_brutto' => 'Gesamt brutto',
		'total_weight' => 'Gesamtgewicht',
		'date1' => 'erster Verkaufstag',
		'date2' => 'letzter Verkaufstag'	
	);
	
	private $sumLabels = array(
		'totalsum_netto' => 'Summe Gesamt netto',
		'totalsum_brutto' => 'Summe Gesamt brutto'
	);
	
	private $fieldsSort = null;
	
	public function __construct(){}
	
	public static function create($params){
		$obj = new self();
		$obj->setParams($params);
		return $obj;
	}
	
	public function setParams($data){
		$this->params = $data;
		if(!is_array($this->params)){
			$this->params = Zend_Json::decode($this->params);
		}
		if(array_key_exists('timeframe', $this->params) && (array_key_exists('begin', $this->params['timeframe']))){
			$this->setStartDate($this->params['timeframe']['begin']);
		}
		if(array_key_exists('timeframe', $this->params) && (array_key_exists('end', $this->params['timeframe']))){
			$this->setEndDate($this->params['timeframe']['end']);
		}
		if(array_key_exists('fields', $this->params)){
			if(!is_array($this->params['fields'])){
				$this->params['fields'] = Zend_Json::decode($this->params['fields']);
			}
			if(is_array($this->params['fields'])){
				$this->setFieldsSort($this->params['fields']);
			}
		}
		if(array_key_exists('grouping', $this->params)){
			if(array_key_exists('debitor_group', $this->params['grouping']) && $this->params['grouping']['debitor_group']==true){
				$this->groupingCustomerGroup = true;
			}
			if(array_key_exists('debitor', $this->params['grouping']) && $this->params['grouping']['debitor']==true){
				$this->groupingCustomer = true;
			}
			if(array_key_exists('article_group', $this->params['grouping']) && $this->params['grouping']['article_group']==true){
				$this->groupingArticleGroup = true;
			}
		}
		return $this;
	}
	
	public function getParams(){
		if(is_null($this->params)){
			throw new Exception ('No params set');
		}
		return $this->params;
	}
	
	public function setStartDate($startDate){
		$this->startDate = $startDate;
		$this->getFilter()->addFilter($this->getFilter()->createFilter('receipt_date','afterOrAt', $startDate));
		return $this;
	}
	
	public function setEndDate($endDate){
		$this->endDate = $endDate;
		$this->getFilter()->addFilter($this->getFilter()->createFilter('receipt_date','beforeOrAt', $endDate));
		return $this;
	}
	
	public function getStartDate(){
		return $this->startDate;	
	}
	
	public function getEndDate(){
		return $this->endDate;
	}
	
	public function setRecordSet(Tinebase_Record_RecordSet $recSet){
		$this->recordSet = $recSet;
	
		return $this;
	}
	
	public function setRecordIdSet(array $recSet){
		$this->recordIdSet = $recSet;
	
		return $this;
	}
	
	public function addCustomerRecordSet(Tinebase_Record_RecordSet $recSet, $debitorId){
		$this->customerRecordSets[$debitorId] = $recSet;
	}
	
	public function getSumTotalNetto(){
		return $this->sumTotalNetto;
	}
	
	public function getSumTotalBrutto(){
		return $this->sumTotalBrutto;
	}
	
	public function getFilter(){
		if(!$this->articleFilter){
			$p = $this->getParams();
			$articleFilter = $p['articleFilter'];
			
			if(!is_array($articleFilter)){
				$articleFilter = Zend_Json::decode($articleFilter);
			}
			
			$this->articleFilter = new Billing_Model_ArticleSoldFilter($articleFilter, 'AND');
		}
		return $this->articleFilter;
	}
	
	public function getCustomerFilter($debitor){
		$filter = clone $this->getFilter();
		
		$filter->addFilter(
			$filter->createFilter(
				'debitor_id', 
				'AND', 
				array(
					array(
						'field' => 'id',
						'operator' => 'equals',
						'value' => $debitor->getId()
					)
				)
		));
		return $filter;
	}
	
	public function getCustomerGroupFilter($customerGroup){
		$filter = clone $this->getArticleFilter();
		
		$filter->addFilter(
			$filter->createFilter(
				'debitor_id', 
				'AND', 
				array(
					array(
						'field' => 'debitor_group_id',
						'operator' => 'equals',
						'value' => $customerGroup->getId()
					)
				)
		));
		return $filter;
	}
	
	public function getPagination(){
		$p = $this->getParams();
		$articleSort = $p['articleSort'];
		$paging = null;
		if($articleSort['field'] !== 'UNDEFINED'){
			$paging = new Tinebase_Model_Pagination(array('sort' => $articleSort['field'], 'dir' => $articleSort['dir'] ));
		}
		return $paging;
	}
	
	public function toArray($indexModeAssoc = false, $recordSet = null){
		$aResult = array();
		$this->sumTotalNetto = 0;
		$this->sumTotalBrutto = 0;
		if(is_null($recordSet)){
			$recordSet = $this->recordSet;
		}
		foreach($recordSet as $record){
			$aResult[] = $this->recordToArray($record, $indexModeAssoc);
		}
		return $aResult;
	}
	
	public function customerRecordsToArray($indexModeAssoc = false){
		$aResult = array();
		$this->sumTotalNetto = 0;
		$this->sumTotalBrutto = 0;
		foreach($this->customerRecordSets as $debitorId => $recordSet){
			if(!array_key_exists($debitorId, $aResult)){
				$aResult[$debitorId] = array();
			}
			$aResult[$debitorId]['data'] = $this->toArray( $indexModeAssoc, $recordSet);
			$aResult[$debitorId]['total_netto'] = $this->sumTotalNetto;
			$aResult[$debitorId]['total_brutto'] = $this->sumTotalBrutto;
			 
			
		}
		return $aResult;
	}
	
	
	private function recordtoArray(Billing_Model_ArticleSold $record, $indexModeAssoc){
		$extractFields = $this->getFieldsSort();
		$aRec = array();
		
		foreach($extractFields as $field){
			$item = $record->__get($field);
			if($item instanceof Tinebase_Record_Abstract){
				$item = $item->__get('name');
			}
			if($field == 'total_netto'){
				$this->sumTotalNetto += (float) $item;
			}
			if($field == 'total_brutto'){
				$this->sumTotalBrutto += (float) $item;
			}
			if(!$indexModeAssoc){
				$aRec[] = $item;
			}else{
				if($item instanceof Tinebase_Record_Abstract){
					$aRec[$field] = $item->__get('name');
				}else{
					if(in_array($field, array(
						'price_netto',
						'price_brutto',
						'min_price_netto',
						'min_price_brutto',
						'max_price_netto',
						'max_price_brutto',
						'total_netto',
						'total_brutto'
					))){
						$aRec[$field] = number_format($item,2,',','.');
					}else{
						$aRec[$field] = $item;
					}
				}
				
			}
		}
		return $aRec;
	}
	
	public function setFieldsSort(array $fields){
		$this->fieldsSort = $fields;
		return $this;
	}
	
	public function getFieldLabels(){
		$aSort = $this->getFieldsSort();
		$fieldLabels = array();
		foreach($aSort as $key){
			$fieldLabels[] = $this->fieldLabels[$key];
		}
		return $fieldLabels;
	}
	
	public function getSumLabels(){
		return array_values($this->sumLabels);
	}
	
	public function getFieldsSort(){
		if(is_null($this->fieldsSort)){
			$this->fieldsSort = array_keys($this->fieldLabels);
		}
		return $this->fieldsSort;
	}
	
	public function hasGroupingCustomerGroup(){
		return $this->groupingCustomerGroup;
	}
	
	public function hasGroupingCustomer(){
		return $this->groupingCustomer;
	}

	public function hasGroupingArticleGroup(){
		return $this->groupingArticleGroup;
	}
	
	public function hasNoGrouping(){
		if($this->hasGroupingCustomerGroup()==true || $this->hasGroupingCustomer()==true ||  $this->hasGroupingArticleGroup()==true){
			return false;
		}else{
			return true;
		}
	}
	
		
}


