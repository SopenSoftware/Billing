<?php
/**
 *
 *
 * @author hhartl
 *
 */

/**
 * Migration of Brevetation app
 */

class Billing_Setup_Update_Release2 extends Setup_Update_Abstract{
	/**
	 * Add column is_default to price_group
	 */
	public function update_0(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>valid</name>
                    <type>boolean</type>
					<default>true</default>
                    <notnull>true</notnull>
                </field>');
		$this->_backend->addCol('bill_booking', $declaration);
		$this->setApplicationVersion('Billing', '2.1');
	}
	
	public function update_1(){

		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_member</name>
                    <type>boolean</type>
					<notnull>true</notnull>
					<default>false</default>
			    </field>	');
		$this->_backend->addCol('bill_receipt', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>period</name>
                    <type>integer</type>
					<notnull>false</notnull>
					<default>0</default>
			    </field>	');
		$this->_backend->addCol('bill_receipt', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>fee_group_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
					<default>null</default>
                </field>	');
		$this->_backend->addCol('bill_receipt', $declaration);
		$this->setApplicationVersion('Billing', '2.11');
	}
	
	public function update_11(){

		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>job_category</name>
					<type>enum</type>
					<value>DTAEXPORT</value>
					<value>MONITION</value>
					<value>PAYMENT</value>
					<value>MANUALEXPORT</value>
					<value>PREDEFINEDEXPORT</value>
					<value>PRINT</value>
					<value>DUETASKS</value>
				</field>	');
		$this->_backend->alterCol('bill_batch_job', $declaration);
		
		 
		if(!$this->_backend->tableExists('bill_batch_monition')){
		    $tableDefinition = '
			<table>
				<name>bill_batch_monition</name>
				<version>1</version>
				<engine>InnoDB</engine>
		     	<charset>utf8</charset>
				<declaration>
					<field>
	                    <name>id</name>
	                    <type>integer</type>
						<autoincrement>true</autoincrement>
	                    <notnull>true</notnull>
	                </field>
					<field>
	                    <name>job_id</name>
	                    <type>integer</type>
						<notnull>true</notnull>
	                </field>
					<field>
	                    <name>contact_id</name>
	                    <type>integer</type>
						<notnull>true</notnull>
	                </field>
					<field>
	                    <name>debitor_id</name>
	                    <type>integer</type>
						<notnull>true</notnull>
	                </field>
					<field>
	                    <name>monition_receipt_id</name>
	                   	<type>text</type>
						<length>40</length>
	                    <notnull>false</notnull>
	                </field>
					<field>
						<name>monition_stage</name>
						<type>enum</type>
						<value>1</value>
						<value>2</value>
						<value>3</value>
						<value>4</value>
						<default>1</default>
					</field>
					<field>
	                    <name>total_sum</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
	                    <name>open_sum</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
	                    <name>monition_fee</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
	                    <name>total_saldation</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
	                    <name>count_pos</name>
	                    <type>integer</type>
						<notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
						<name>monition_lock</name>
						<type>boolean</type>
						<notnull>true</notnull>
						<default>0</default>
					</field>
					<field>
						<name>skip</name>
						<type>boolean</type>
						<notnull>true</notnull>
						<default>0</default>
					</field>
					<field>
						<name>action_text</name>
						<type>text</type>
						<length>2048</length>
		                <notnull>false</notnull>
					</field>
					<field>
						<name>action_data</name>
						<type>clob</type>
						<notnull>false</notnull>
					</field>
					<field>
						<name>action_type</name>
						<type>enum</type>
						<value>DRYRUN</value>
						<value>REAL</value>
						<default>DRYRUN</default>
					</field>
					<field>
						<name>action_state</name>
						<type>enum</type>
						<value>OPEN</value>
						<value>DONE</value>
						<value>ERROR</value>
						<default>DONE</default>
					</field>
					<field>
						<name>usage</name>
						<type>text</type>
						<notnull>false</notnull>
					</field>
					<field>
						<name>error_info</name>
						<type>text</type>
						<notnull>false</notnull>
					</field>
					<field>
						<name>created_datetime</name>
						<type>datetime</type>
						<notnull>true</notnull>
					</field>
					<field>
						<name>valid_datetime</name>
						<type>datetime</type>
						<notnull>true</notnull>
					</field>
					<field>
						<name>to_process_datetime</name>
						<type>datetime</type>
						<notnull>true</notnull>
					</field>
					<field>
						<name>process_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
	                    <name>created_by_user</name>
	                    <type>text</type>
	                    <length>40</length>
	                </field>
					<field>
	                    <name>processed_by_user</name>
	                    <type>text</type>
	                    <length>40</length>
	                </field>
					<index>
	                    <name>id</name>
	                    <primary>true</primary>
	                    <field>
	                        <name>id</name>
	                    </field>
	                </index>
				</declaration>
			</table>';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }
		 
		if(!$this->_backend->tableExists('bill_batch_monition_item')){
		        $tableDefinition = '
				<table>
				<name>bill_batch_monition_item</name>
				<version>1</version>
				<engine>InnoDB</engine>
		     	<charset>utf8</charset>
				<declaration>
				    <field>
	                    <name>id</name>
	                    <type>integer</type>
						<autoincrement>true</autoincrement>
	                    <notnull>true</notnull>
	                </field>
					<field>
	                    <name>batch_monition_id</name>
	                    <type>integer</type>
						<notnull>true</notnull>
	                </field>
					<field>
	                    <name>erp_context_id</name>
	                    <type>text</type>
						<length>24</length>
						<notnull>true</notnull>
						<default>ERP</default>
	                </field>
					<field>
	                    <name>open_item_id</name>
	                    <type>integer</type>
	                    <notnull>false</notnull>
						<default>null</default>
	                </field>
					<field>
	                    <name>payment_id</name>
	                   	<type>text</type>
						<length>40</length>
	                    <notnull>false</notnull>
	                </field>
					<field>
						<name>skip</name>
						<type>boolean</type>
						<notnull>true</notnull>
						<default>0</default>
					</field>
					<field>
	                    <name>total_sum</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
					<field>
						<name>usage</name>
						<type>text</type>
						<notnull>false</notnull>
					</field>
					<index>
	                    <name>id</name>
	                    <primary>true</primary>
	                    <field>
	                        <name>id</name>
	                    </field>
	                </index>
				</declaration>
			</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }
		 
		$this->setApplicationVersion('Billing', '2.12');
	}
	
	public function update_12(){

		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>monition_stage</name>
					<type>enum</type>
					<value>0</value>
					<value>1</value>
					<value>2</value>
					<value>3</value>
					<value>4</value>
					<default>0</default>
				</field>	');
		$this->_backend->addCol('bill_open_item', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>monition_receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>	');
		$this->_backend->addCol('bill_open_item', $declaration);
		
		$this->setApplicationVersion('Billing', '2.13');
	}
	
	public function update_13(){
		if(!$this->_backend->tableExists('bill_open_item_monition')){
		        $tableDefinition = '
				<table>
					<name>bill_open_item_monition</name>	
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
						<field>
		                    <name>erp_context_id</name>
		                    <type>text</type>
							<length>24</length>
							<notnull>true</notnull>
							<default>ERP</default>
		                </field>
						<field>
		                    <name>monition_receipt_id</name>
		                    <type>integer</type>
		                    <notnull>true</notnull>
		                </field>
						<field>
		                    <name>open_item_id</name>
		                    <type>integer</type>
		                    <notnull>true</notnull>
		                </field>
						<field>
		                    <name>debitor_id</name>
		                    <type>integer</type>
		                    <notnull>true</notnull>
		                </field>
						<field>
		                    <name>due_date</name>
		                    <type>date</type>
		                    <notnull>false</notnull>
					    </field>
						<field>
		                    <name>monition_date</name>
		                    <type>date</type>
		                    <notnull>false</notnull>
					    </field>	
						<field>
							<name>monition_stage</name>
							<type>enum</type>
							<value>1</value>
							<value>2</value>
							<value>3</value>
							<value>4</value>
							<default>1</default>
						</field>
						<field>
		                    <name>monition_fee</name>
		                    <type>float</type>
							<unsigned>false</unsigned>
		                    <notnull>false</notnull>
							<default>0</default>
		                </field>
						<field>
		                    <name>open_sum</name>
		                     <type>float</type>
							<unsigned>false</unsigned>
		                    <notnull>false</notnull>
							<default>0</default>
					    </field>	
					    <field>
		                    <name>total_sum</name>
		                     <type>float</type>
							<unsigned>false</unsigned>
		                    <notnull>false</notnull>
							<default>0</default>
					    </field>									
						<index>
							<name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
					</declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }
		 
		$this->setApplicationVersion('Billing', '2.14');
	}
	
	public function update_14(){
		if(!$this->_backend->tableExists('bill_bank')){
		        $tableDefinition = '
				<table>
					<name>bill_bank</name>
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
		                <field>
		                    <name>country_code</name>
		                    <type>text</type>
							<length>12</length>
							<notnull>true</notnull>
							<default>DE</default>
		                </field>
		                <field>
		                    <name>code</name>
		                    <type>text</type>
							<length>12</length>
							<notnull>true</notnull>
		                </field>
		                <field>
		                    <name>att</name>
		                    <type>text</type>
							<length>4</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>name</name>
		                    <type>text</type>
							<length>256</length>
		                    <notnull>true</notnull>
						</field>
		 				<field>
		                    <name>postal_code</name>
		                    <type>text</type>
							<length>12</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>location</name>
		                    <type>text</type>
							<length>128</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>short_name</name>
		                    <type>text</type>
							<length>32</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>pan</name>
		                    <type>text</type>
							<length>12</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>bic</name>
		                    <type>text</type>
							<length>12</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>validate</name>
		                    <type>text</type>
							<length>12</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>record_number</name>
		                    <type>integer</type>
							<length>11</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>change_sign</name>
		                    <type>text</type>
							<length>4</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>follow_code</name>
		                    <type>text</type>
							<length>12</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>created_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>creation_time</name>
		                    <type>datetime</type>
		                </field> 
		                <field>
		                    <name>last_modified_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>last_modified_time</name>
		                    <type>datetime</type>
		                </field>
		                <field>
		                    <name>is_deleted</name>
		                    <type>boolean</type>
		                    <default>false</default>
		                </field>
		                <field>
		                    <name>deleted_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>            
		                <field>
		                    <name>deleted_time</name>
		                    <type>datetime</type>
		                </field>
						<index>
		                    <name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
		                <index>
		                    <name>code</name>
		                    <field>
		                        <name>code</name>
		                    </field>
		                </index>
						<index>
		                    <name>name</name>
		                    <field>
		                        <name>name</name>
		                    </field>
		                </index>
						<index>
		                    <name>postal_code</name>
		                    <field>
		                        <name>postal_code</name>
		                    </field>
		                </index>
						<index>
		                    <name>location</name>
		                    <field>
		                        <name>location</name>
		                    </field>
		                </index>
						<index>
		                    <name>short_name</name>
		                    <field>
		                        <name>short_name</name>
		                    </field>
		                </index>
						<index>
		                    <name>pan</name>
		                    <field>
		                        <name>pan</name>
		                    </field>
		                </index>
						<index>
		                    <name>bic</name>
		                    <field>
		                        <name>bic</name>
		                    </field>
		                </index>
					</declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }
		 
		if(!$this->_backend->tableExists('bill_bank_account')){
		        $tableDefinition = '
				<table>
					<name>bill_bank_account</name>
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
						<field>
		                    <name>contact_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>bank_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
		               <field>
		                    <name>iban</name>
		                    <type>text</type>
							<length>64</length>
							<notnull>true</notnull>
		                </field>
		                <field>
		                    <name>number</name>
		                    <type>text</type>
							<length>24</length>
							<notnull>true</notnull>
		                </field>
		                <field>
		                    <name>name</name>
		                    <type>text</type>
							<length>128</length>
							<notnull>true</notnull>
		                </field>
					    <field>
		                    <name>bank_code</name>
		                    <type>text</type>
							<length>24</length>
		                    <notnull>true</notnull>
						</field>
						<field>
		                    <name>bank_name</name>
		                    <type>text</type>
							<length>256</length>
		                    <notnull>true</notnull>
						</field>
		 				
						<field>
		                    <name>last_validated</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>valid</name>
		                    <type>boolean</type>
							<notnull>true</notnull>
							<default>false</default>
						</field>
						<field>
		                    <name>has_sepa_mandate</name>
		                    <type>boolean</type>
							<notnull>true</notnull>
							<default>false</default>
						</field>
						<field>
		                    <name>sepa_mandate_id</name>
		                    <type>text</type>
							<length>64</length>
		                    <notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>sepa_mandate_from</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>sepa_mandate_until</name>
		                    <type>boolean</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>sepa_last_usage_date</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>created_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>creation_time</name>
		                    <type>datetime</type>
		                </field> 
		                <field>
		                    <name>last_modified_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>last_modified_time</name>
		                    <type>datetime</type>
		                </field>
		                <field>
		                    <name>is_deleted</name>
		                    <type>boolean</type>
		                    <default>false</default>
		                </field>
		                <field>
		                    <name>deleted_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>            
		                <field>
		                    <name>deleted_time</name>
		                    <type>datetime</type>
		                </field>
						<index>
		                    <name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
						<index>
		                    <name>fk_bankaccount_contact</name>
							<foreign>true</foreign>
		                    <field>
		                        <name>contact_id</name>
		                    </field>
		 					<reference>
		                        <table>addressbook</table>
		                        <field>id</field>
		                        <ondelete>CASCADE</ondelete>
								<onupdate>CASCADE</onupdate>
		                    </reference>
		                </index>
						<index>
		                    <name>fk_bankaccount_bank</name>
							<foreign>true</foreign>
		                    <field>
		                        <name>bank_id</name>
		                    </field>
		 					<reference>
		                        <table>bill_bank</table>
		                        <field>id</field>
		                        <ondelete>CASCADE</ondelete>
								<onupdate>CASCADE</onupdate>
		                    </reference>
		                </index>
		                <index>
		                    <name>number</name>
		                    <field>
		                        <name>number</name>
		                    </field>
		                </index>
						<index>
		                    <name>name</name>
		                    <field>
		                        <name>name</name>
		                    </field>
		                </index>
						<index>
		                    <name>bank_code</name>
		                    <field>
		                        <name>bank_code</name>
		                    </field>
		                </index>
						<index>
		                    <name>bank_name</name>
		                    <field>
		                        <name>bank_name</name>
		                    </field>
		                </index>
						<index>
		                    <name>sepa_mandate_id</name>
		                    <field>
		                        <name>sepa_mandate_id</name>
		                    </field>
		                </index>
						<index>
		                    <name>iban</name>
		                    <field>
		                        <name>iban</name>
		                    </field>
		                </index>
					</declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }

		if(!$this->_backend->tableExists('bill_bank_account_usage')){
		        $tableDefinition = '
				<table>
					<name>bill_bank_account_usage</name>
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
						<field>
		                    <name>bank_account_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>context_id</name>
		                    <type>integer</type>
							<notnull>false</notnull>
							<default>null</default>
		                </field>
						<field>
		                    <name>usage_type</name>
		                    <type>enum</type>
							<value>ALLPURPOSE</value>
							<value>APPONLY</value>
							<value>APPCONTEXTONLY</value>
							<notnull>true</notnull>
							<default>ALLPURPOSE</default>
		                </field>
						<field>
		                    <name>application_name</name>
		                    <type>text</type>
							<length>64</length>
							<notnull>false</notnull>
							<default>null</default>
		                </field>
						<field>
		                    <name>usage_from</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>usage_until</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
						</field>
						<field>
		                    <name>is_blocked</name>
		                    <type>boolean</type>
							<default>false</default>
						</field>
						<field>
		                    <name>block_reason</name>
		                    <type>text</type>
							<length>256</length>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>created_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>creation_time</name>
		                    <type>datetime</type>
		                </field> 
		                <field>
		                    <name>last_modified_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>last_modified_time</name>
		                    <type>datetime</type>
		                </field>
		                <field>
		                    <name>is_deleted</name>
		                    <type>boolean</type>
		                    <default>false</default>
		                </field>
		                <field>
		                    <name>deleted_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>            
		                <field>
		                    <name>deleted_time</name>
		                    <type>datetime</type>
		                </field>
						<index>
		                    <name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
						<index>
		                    <name>fk_ba_usage_bankaccount</name>
							<foreign>true</foreign>
		                    <field>
		                        <name>bank_account_id</name>
		                    </field>
		 					<reference>
		                        <table>bill_bank_account</table>
		                        <field>id</field>
		                        <ondelete>CASCADE</ondelete>
								<onupdate>CASCADE</onupdate>
		                    </reference>
		                </index>
					</declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		 }
		 
		$this->setApplicationVersion('Billing', '2.15');
	}
	
	public function update_15(){
		 Setup_Controller::getInstance()->createImportExportDefinitions(Tinebase_Application::getInstance()->getApplicationByName('Billing'));
		 $this->setApplicationVersion('Billing', '2.16');
	}
	
	
	public function update_16(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>to_be_deleted</name>
                    <type>boolean</type>
					<default>false</default>
				</field>	');
		$this->_backend->addCol('bill_bank', $declaration);
		$this->setApplicationVersion('Billing', '2.17');
	}
	
	public function update_17(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_approved</name>
                    <type>boolean</type>
                   <default>false</default>
                </field>	');
		$this->_backend->addCol('bill_batch_job', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>approved_by_user</name>
                    <type>text</type>
                    <length>40</length>
                </field>	');
		$this->_backend->addCol('bill_batch_job', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>approved_datetime</name>
					<type>datetime</type>
					<notnull>false</notnull>
					<default>null</default>
				</field>	');
		$this->_backend->addCol('bill_batch_job', $declaration);
		
		
		$this->setApplicationVersion('Billing', '2.18');
	}
	
	public function update_18(){
		$this->_backend->dropCol('bill_bank_account', 'has_sepa_mandate');
		$this->_backend->dropCol('bill_bank_account', 'sepa_mandate_from');
		$this->_backend->dropCol('bill_bank_account', 'sepa_mandate_until');
		$this->_backend->dropCol('bill_bank_account', 'sepa_last_usage_date');
		
		// keep iban nullable as long there are bank accounts allowed 
		// to have the old declaration number, bank_code
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>iban</name>
                    <type>text</type>
					<length>64</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>	');
		$this->_backend->alterCol('bill_bank_account', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_iban_improved</name>
                    <type>boolean</type>
					<default>false</default>
                </field>	');
		$this->_backend->addCol('bill_bank_account', $declaration);
		
		if(!$this->_backend->tableExists('bill_sepa_mandate')){
			$tableDefinition = '
				<table>
					<name>bill_sepa_mandate</name>
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
						<field>
		                    <name>contact_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>bank_account_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
		                <field>
		                    <name>sepa_creditor_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>mandate_ident</name>
		                    <type>text</type>
							<length>64</length>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>signature_date</name>
		                    <type>date</type>
							<notnull>true</notnull>
		                </field> 
						<field>
		                    <name>last_usage_date</name>
		                    <type>date</type>
							<notnull>false</notnull>
							<default>null</default>
		                </field> 
						<field>
		                    <name>is_single</name>
		                    <type>boolean</type>
							<notnull>true</notnull>
							<default>true</default>
		                </field>
						<field>
		                    <name>is_last</name>
		                    <type>boolean</type>
							<notnull>true</notnull>
							<default>false</default>
		                </field>  
						<field>
		                    <name>is_valid</name>
		                    <type>boolean</type>
							<notnull>true</notnull>
							<default>false</default>
		                </field> 
		                <field>
		                    <name>created_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
						<field>
		                    <name>creation_time</name>
		                    <type>datetime</type>
		                </field> 
		                <field>
		                    <name>last_modified_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>
		                <field>
		                    <name>last_modified_time</name>
		                    <type>datetime</type>
		                </field>
		                <field>
		                    <name>is_deleted</name>
		                    <type>boolean</type>
		                    <default>false</default>
		                </field>
		                <field>
		                    <name>deleted_by</name>
		                    <type>text</type>
		                    <length>40</length>
		                </field>            
		                <field>
		                    <name>deleted_time</name>
		                    <type>datetime</type>
		                </field>
						<index>
		                    <name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
					</declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		}
		
		if(!$this->_backend->tableExists('bill_sepa_creditor')){
			$tableDefinition = '
				<table>
					<name>bill_sepa_creditor</name>
					<version>1</version>
					<engine>InnoDB</engine>
			     	<charset>utf8</charset>
					<declaration>
		                <field>
		                    <name>id</name>
		                    <type>integer</type>
		                    <autoincrement>true</autoincrement>
		                </field>
						<field>
		                    <name>contact_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
		                 <field>
		                    <name>bank_account_id</name>
		                    <type>integer</type>
							<notnull>true</notnull>
		                </field>
						<field>
		                    <name>sepa_creditor_ident</name>
		                    <type>text</type>
							<length>64</length>
							<notnull>true</notnull>
		                </field>
		                <field>
		                    <name>creditor_name</name>
		                    <type>text</type>
							<length>64</length>
							<notnull>true</notnull>
		                </field>
						<index>
		                    <name>id</name>
		                    <primary>true</primary>
		                    <field>
		                        <name>id</name>
		                    </field>
		                </index>
		              </declaration>
				</table>
			';
			$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
			$this->_backend->createTable($table);
		}
		 
		$this->setApplicationVersion('Billing', '2.19');
	}

	public function update_19(){
		// add to sepa creditor
		if(!$this->_backend->columnExists('bank_account_id', 'bill_sepa_creditor')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>bank_account_id</name>
                    <type>integer</type>
					<notnull>true</notnull>
                </field>	');
			$this->_backend->addCol('bill_sepa_creditor', $declaration);
		}
		
		$this->setApplicationVersion('Billing', '2.20');
		
	}
	
	public function update_20(){
		// drop application name
		if($this->_backend->columnExists('application_name', 'bill_bank_account_usage')){
			$this->_backend->dropCol('bill_bank_account_usage', 'application_name');
		}
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                <name>usage_type</name>
                <type>enum</type>
				<value>ALLPURPOSE</value>
				<value>APPONLY</value>
				<value>APPCONTEXTONLY</value>
				<value>APPRECORDONLY</value>
				<notnull>true</notnull>
				<default>ALLPURPOSE</default>
             </field>');
		$this->_backend->alterCol('bill_bank_account_usage', $declaration);
		// add sepa_mandate id
		
		if(!$this->_backend->columnExists('sepa_mandate_id', 'bill_bank_account_usage')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>sepa_mandate_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>');
			$this->_backend->addCol('bill_bank_account_usage', $declaration);
		}
		// add membership id
		if(!$this->_backend->columnExists('membership_id', 'bill_bank_account_usage')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>membership_id</name>
                    <type>text</type>
					<length>40</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>');
			$this->_backend->addCol('bill_bank_account_usage', $declaration);
		}
		// add regular donaton id
		if(!$this->_backend->columnExists('regular_donation_id', 'bill_bank_account_usage')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>regular_donation_id</name>
                    <type>text</type>
					<length>40</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>');
			$this->_backend->addCol('bill_bank_account_usage', $declaration);
		}
		$this->setApplicationVersion('Billing', '2.21');
	}
	
	public function update_21(){
		// drop application name
		if($this->_backend->columnExists('contact_id', 'bill_sepa_mandate')){
			$this->_backend->dropCol('bill_sepa_mandate', 'contact_id');
		}
		$this->setApplicationVersion('Billing', '2.22');
	}
	
	public function update_22(){
		// drop application name
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>block_reason</name>
                    <type>text</type>
					<length>256</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>');
			$this->_backend->alterCol('bill_bank_account_usage', $declaration);
		$this->setApplicationVersion('Billing', '2.23');
	}
	
	public function update_23(){
		// drop application name
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>');
			$this->_backend->alterCol('bill_bank_account_usage', $declaration);
		$this->setApplicationVersion('Billing', '2.24');
	}
	
	public function update_24(){
		// drop application name
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>signature_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
                </field> ');
		$this->_backend->alterCol('bill_sepa_mandate', $declaration);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>mandate_state</name>
                    <type>enum</type>
					<value>GENERATED</value>
					<value>COMMUNICATION</value>
					<value>CONFIRMED</value>
					<default>GENERATED</default>
                </field>');
		$this->_backend->addCol('bill_sepa_mandate', $declaration);	
			
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>comment</name>
                    <type>text</type>
					<length>1024</length>
					<notnull>false</notnull>
                </field>');
		$this->_backend->addCol('bill_sepa_mandate', $declaration);	
		 
			
		$this->setApplicationVersion('Billing', '2.25');
	}
	
	
	public function update_25(){
		
		if($this->_backend->columnExists('bank_code', 'bill_bank_account')){
			$this->_backend->dropCol('bill_bank_account', 'bank_code');
		}
		if($this->_backend->columnExists('bank_name', 'bill_bank_account')){
			$this->_backend->dropCol('bill_bank_account', 'bank_name');
		}
		
		$this->setApplicationVersion('Billing', '2.26');
		
	}
	
	public function update_26(){
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>last_monition_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>');
		$this->_backend->addCol('bill_open_item', $declaration);	
		 
			
		$this->setApplicationVersion('Billing', '2.27');
		
	}
	
	public function update_27(){
		
		if(!$this->_backend->columnExists('open_sum', 'bill_batch_monition_item')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
					<field>
	                    <name>open_sum</name>
	                    <type>float</type>
						<unsigned>false</unsigned>
	                    <notnull>true</notnull>
						<default>0</default>
				    </field>
				    ');
			$this->_backend->addCol('bill_batch_monition_item', $declaration);	
		 
		}	
		$this->setApplicationVersion('Billing', '2.28');
	}
	
	public function update_28(){
		
		if(!$this->_backend->columnExists('monition_stage', 'bill_batch_monition_item')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>monition_stage</name>
					<type>enum</type>
					<value>1</value>
					<value>2</value>
					<value>3</value>
					<value>4</value>
					<default>1</default>
				</field>
				    ');
			$this->_backend->addCol('bill_batch_monition_item', $declaration);	
		 
		}	
		if(!$this->_backend->columnExists('due_days', 'bill_batch_monition_item')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>due_days</name>
                    <type>integer</type>
                    <notnull>true</notnull>
					<default>0</default>
                </field>
				   ');
			$this->_backend->addCol('bill_batch_monition_item', $declaration);	
		 
		}	
		$this->setApplicationVersion('Billing', '2.29');
	}
	
	public function update_29(){
		if(!$this->_backend->columnExists('bank_account_usage_id', 'bill_receipt')){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>bank_account_usage_id</name>
                    <type>integer</type>
					<notnull>false</notnull>
					<default>null</default>
                </field>
				   ');
			$this->_backend->addCol('bill_receipt', $declaration);	
		 
		}	
		$this->setApplicationVersion('Billing', '2.30');
	}
	
	public function update_30(){
		 Setup_Controller::getInstance()->createImportExportDefinitions(Tinebase_Application::getInstance()->getApplicationByName('Billing'));
		 $this->setApplicationVersion('Billing', '2.31');
	}
	
	public function update_31(){
// silly empty update
		
		$this->setApplicationVersion('Billing', '2.32');
	}
	
	public function update_32(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>bank_account_id</name>
                    <type>integer</type>
					<notnull>true</notnull>
                </field>
				   ');
			$this->_backend->addCol('bill_batch_dta', $declaration);
				
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>bank_account_usage_id</name>
                    <type>integer</type>
					<notnull>true</notnull>
                </field>
				   ');
			$this->_backend->addCol('bill_batch_dta', $declaration);	
			
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>sepa_mandate_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
				   ');
			$this->_backend->addCol('bill_batch_dta', $declaration);	
		
		$this->setApplicationVersion('Billing', '2.33');
	}
				
	public function update_33(){

		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                <name>bank_account_id</name>
                <type>integer</type>
				<notnull>false</notnull>
				<default>null</default>
            </field>
		');
		$this->_backend->alterCol('bill_batch_dta', $declaration);
				
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                <name>bank_account_usage_id</name>
                <type>integer</type>
				<notnull>false</notnull>
				<default>null</default>
             </field>
		');
		$this->_backend->alterCol('bill_batch_dta', $declaration);	
				
		
		$this->setApplicationVersion('Billing', '2.34');
	}
	
	public function update_34(){

		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
					<name>action_state</name>
					<type>enum</type>
					<value>OPEN</value>
					<value>EXPORTED</value>
					<value>DONE</value>
					<value>ERROR</value>
					<default>DONE</default>
				</field>
		');
		$this->_backend->alterCol('bill_batch_dta', $declaration);
				
		$this->setApplicationVersion('Billing', '2.35');
	}
	
	
	
}
?>