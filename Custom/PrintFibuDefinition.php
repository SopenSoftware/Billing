<?php 
class Billing_Custom_PrintFibuDefinition{
	
	private $filters = null;
	private $data = null;
	 
	private function __construct(){}
	
	public static function create($filters = null, $data = null, $accountBookingFilters = null){
		
		if(!$filters){
			throw new Exception('No filters specified');
		}
		
		if(!$data){
			throw new Exception('No data specified');
		}
		
		$obj = new self();
		$obj->setFilters($filters);
		$obj->setData($data);
		$obj->setAccountBookingFilters($accountBookingFilters);
		
		return $obj;
	}
	
	public function setFilters($filters){
		if(!is_array($filters)){
			$filters = Zend_Json::decode($filters);
		}
		$this->filters = $filters;
	}
	
	public function getFilters(){
		return $this->filters;
	}
	
	public function setAccountBookingFilters($filters){
		if(!is_array($filters)){
			$filters = Zend_Json::decode($filters);
		}
		$this->accountBookingFilters = $filters;
	}
	
	public function getAccountBookingFilters(){
		return $this->accountBookingFilters;
	}
	
	public function setData($data){
		if(!is_array($data)){
			$data = Zend_Json::decode($data);
		}
		$this->data = $data;
	}
	
	public function getData(){
		if(is_null($this->data)){
			throw new Exception('No data specified for printing');
		}
		return $this->data;
	}
	
	public function getOutputType(){
		if(!array_key_exists('outputType', $this->getData())){
			throw new Exception('outputType not specified for printing by AccountSystem');
		}
		$data = $this->getData();
		return $data['outputType'];
	}
	
	public function getPrintAction(){
		if(!array_key_exists('printAction', $this->getData())){
			throw new Exception('printAction not specified for printing by AccountSystem');
		}
		$data = $this->getData();
		return $data['printAction'];
	}
	
	public function getStartDate($defaultDate = null){
		if(!array_key_exists('beginDate', $this->data) && is_null($defaultDate)){
			throw new Exception('beginDate not specified for printing by AccountSystem');
		}elseif(!array_key_exists('beginDate', $this->data) && !is_null($defaultDate)){
			return $defaultDate;
		}else{
			$data = $this->getData();
			return new Zend_Date($data['beginDate']); 
		}
	}
	
	public function getEndDate($defaultDate = null){
		if(!array_key_exists('endDate', $this->data) && is_null($defaultDate)){
			throw new Exception('endDate not specified for printing by AccountSystem');
		}elseif(!array_key_exists('endDate', $this->data) && !is_null($defaultDate)){
			return $defaultDate;
		}else{
			$data = $this->getData();
			return new Zend_Date($data['endDate']); 
		}
	}
	
	public function getSusaBeginDate($defaultDate = null){
		if(!array_key_exists('susaBeginActual', $this->data) && is_null($defaultDate)){
			throw new Exception('susaBeginActual not specified for printing by AccountSystem');
		}elseif(!array_key_exists('susaBeginActual', $this->data) && !is_null($defaultDate)){
			return $defaultDate;
		}else{
			$data = $this->getData();
			return new Zend_Date($data['susaBeginActual']); 
		}
	}
	
	public function getSusaEndDate($defaultDate = null){
		if(!array_key_exists('susaEndActual', $this->data) && is_null($defaultDate)){
			throw new Exception('susaEndActual not specified for printing by AccountSystem');
		}elseif(!array_key_exists('susaEndActual', $this->data) && !is_null($defaultDate)){
			return $defaultDate;
		}else{
			$data = $this->getData();
			return new Zend_Date($data['susaEndActual']); 
		}
	}
	
	public function getTemplateId(){
		
		$printAction = $this->getPrintAction();
		
		switch($printAction){
			case Billing_Controller_AccountSystem::PRINT_ACTION_STATEMENT:
				
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_ACCOUNT_STATEMENT);
				
				break;
				
			case Billing_Controller_AccountSystem::PRINT_ACTION_SUMSALDATION:
				
				$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_SUM_SALDATION);
				
				break;
			
			case 'PRINT_ACTION_ADD1':
			
			$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_YEAR_TERMINATION1);
				
				break;
				
			case 'PRINT_ACTION_ADD2':
			
			$templateId = Tinebase_Core::getPreference('Billing')->getValue(Billing_Preference::TEMPLATE_YEAR_TERMINATION2);
				
				break;				
			default:
				throw new Exception('No known action and bound template');
		}
		
		return $templateId;
	}
	
}