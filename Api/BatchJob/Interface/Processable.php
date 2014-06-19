<?php 

interface Billing_Api_BatchJob_Interface_Processable{
	public function setBatchJob(Billing_Model_BatchJob $job);
	public function getActionState();
} 