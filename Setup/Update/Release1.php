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

class Billing_Setup_Update_Release1 extends Setup_Update_Abstract{
	/**
	 * Add column is_default to price_group
	 */
	public function update_0(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_default</name>
	                <type>boolean</type>
					<default>false</default>
	            </field>');
		$this->_backend->addCol('bill_price_group', $declaration);
		$this->setApplicationVersion('Billing', '1.1');
	}

	/**
	 * Add column article_nr to article
	 */
	public function update_1(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>article_nr</name>
                    <type>text</type>
                    <length>64</length>
                </field>');
		$this->_backend->addCol('bill_article', $declaration);
		$this->setApplicationVersion('Billing', '1.2');
	}

	/**
	 * Add column article_nr to article
	 */
	public function update_2(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>template_id</name>
                    <type>text</type>
					<length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>');
		$this->_backend->addCol('bill_receipt', $declaration);
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>preview_template_id</name>
                    <type>text</type>
					<length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>'
		);
        $this->_backend->addCol('bill_receipt', $declaration);
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>template_id</name>
                    <type>text</type>
					<length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>');
         $this->_backend->addCol('bill_supply_receipt', $declaration);
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>preview_template_id</name>
                    <type>text</type>
					<length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_supply_receipt', $declaration);
         
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>additional_data</name>
                    <type>clob</type>
                    <notnull>false</notnull>
                </field>');
         $this->_backend->addCol('bill_receipt_position', $declaration);
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>additional_data</name>
                    <type>clob</type>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_supply_receipt_position', $declaration);

	     $this->setApplicationVersion('Billing', '1.3');
	}
	
	public function update_3(){
		$tableDefinition = '
		<table>
			<name>bill_order_template</name>	
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
                    <name>debitor_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>account_id</name>
                    <type>text</type>
                    <length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>price_group_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>job_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>name</name>
                    <type>text</type>
                    <notnull>256</notnull>
			    </field>
				<field>
                    <name>description</name>
                    <type>text</type>
					<default>null</default>
			    </field>
				<field>
                    <name>with_calculation</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<field>
                    <name>with_bid</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<field>
                    <name>with_confirm</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<field>
                    <name>with_shipdoc</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<field>
                    <name>with_invoice</name>
                    <type>boolean</type>
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
		
		$tableDefinition = '
		<table>
			<name>bill_order_template_position</name>	
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
                    <name>order_template_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>article_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>price_group_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>unit_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>vat_id</name>
                    <type>integer</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>position_nr</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>				

				<field>
                    <name>price_netto</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>amount</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>discount_percentage</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>discount_total</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>weight</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>name</name>
                    <type>text</type>
                    <length>256</length>
					<notnull>false</notnull>
                </field>
				<field>
                    <name>description</name>
                    <type>text</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>total_netto</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>total_brutto</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>total_weight</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>optional</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<field>
                    <name>additional_data</name>
                    <type>clob</type>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
                    <name>active</name>
                    <type>boolean</type>
                    <default>true</default>
			    </field>
				<field>
                    <name>single_usage</name>
                    <type>boolean</type>
                    <default>false</default>
			    </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_pos_order_template</name>
                    <foreign>true</foreign>
                    <field>
                        <name>order_template_id</name>
                    </field>
 					<reference>
                        <table>bill_order_template</table>
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
		 $this->setApplicationVersion('Billing', '1.4');
	}
	
	public function update_4(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>vat_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);

	     $this->setApplicationVersion('Billing', '1.5');
	}
	
	public function update_5(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>op_nr</name>
                    <type>text</type>
					<length>24</length>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_open_item', $declaration);

	     $this->setApplicationVersion('Billing', '1.6');
	}
	
	public function update_6(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>creditor_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_stock_flow', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>debitor_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_stock_flow', $declaration);

         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>article_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_article_supply', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_default</name>
	                <type>boolean</type>
					<default>false</default>
	            </field>'
         );
         $this->_backend->addCol('bill_stock_location', $declaration);
         					
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
         );
         $this->_backend->alterCol('bill_article_supply', $declaration);
	     $this->setApplicationVersion('Billing', '1.7');
	}
	
	public function update_7(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>factor</name>
	                <type>float</type>
					<notnull>true</notnull>
					<default>1</default>
	            </field>'
         );
         $this->_backend->addCol('bill_article_unit', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>factor</name>
	                <type>float</type>
					<notnull>true</notnull>
					<default>1</default>
	            </field>'
         );
         $this->_backend->addCol('bill_order_position', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>factor</name>
	                <type>float</type>
					<notnull>true</notnull>
					<default>1</default>
	            </field>'
         );
         $this->_backend->addCol('bill_order_template_position', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price_brutto</name>
                    <type>float</type>
					<default>0</default>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_order_template_position', $declaration);
         				
         $this->setApplicationVersion('Billing', '1.8');
	}
	
	public function update_8(){
		 
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>additional_template_data</name>
                    <type>text</type>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         				
         $this->setApplicationVersion('Billing', '1.81');
	}
	
	public function update_81(){
		 
         $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>article_nr</name>
                    <field>
                        <name>article_nr</name>
                    </field>
                </index>'
         );
         $this->_backend->addIndex('bill_article', $declaration);
         
         $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>article_ext_nr</name>
                    <field>
                        <name>article_ext_nr</name>
                    </field>
                </index>'
         );
         $this->_backend->addIndex('bill_article', $declaration);
         
         $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>name</name>
                    <field>
                        <name>name</name>
                    </field>
                </index>'
         );
         $this->_backend->addIndex('bill_article', $declaration);
         	
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_sell_price', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_sell_price', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_stock_flow', $declaration);
         
         $this->setApplicationVersion('Billing', '1.82');
	}
	
	public function update_82(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>factor</name>
                    <type>float</type>
					<unsigned>false</unsigned>					
                    <notnull>true</notnull>
					<default>1</default>
                </field>'
         );
         if(!$this->_backend->columnExists('factor', 'bill_order_position')){
         	$this->_backend->addCol('bill_order_position', $declaration);
         }
         
         if(!$this->_backend->columnExists('factor', 'bill_order_position')){
         	$this->_backend->addCol('bill_receipt_position', $declaration);
         }
         
         if(!$this->_backend->columnExists('factor', 'bill_order_position')){
         	$this->_backend->addCol('bill_order_template_position', $declaration);
         }
         
         $this->setApplicationVersion('Billing', '1.83');
		
		
						
	}
	
	public function update_83(){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>fibu_exp_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>'
         );
         if(!$this->_backend->columnExists('fibu_exp_date', 'bill_debitor')){
         	$this->_backend->addCol('bill_debitor', $declaration);
         }
		
         
         $this->setApplicationVersion('Billing', '1.84');
				
	}
	
	public function update_84(){
			$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>due_date</name>
                    <type>date</type>
					<default>null</default>
                    <notnull>false</notnull>
			    </field>'
         );
         if(!$this->_backend->columnExists('due_date', 'bill_receipt')){
         	$this->_backend->addCol('bill_receipt', $declaration);
         }
		 
         $this->setApplicationVersion('Billing', '1.85');
				
	}
	
	public function update_85(){
		$declaration = new Setup_Backend_Schema_Table_Xml('
		<table>
			<name>bill_payment_method</name>
			<version>1</version>
			<engine>InnoDB</engine>
	     	<charset>utf8</charset>
			<declaration>
                <field>
                    <name>id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>true</notnull>
                </field>
                <field>
                    <name>invoice_template_id</name>
                    <type>text</type>
					<length>40</length>
					<default>null</default>
                    <notnull>false</notnull>
                </field>
				<field>
	                <name>name</name>
	                <type>text</type>
					<length>64</length>
					<notnull>true</notnull>
	            </field>
				<field>
	                <name>processor_class</name>
	                <type>text</type>
					<length>16</length>
					<notnull>false</notnull>
					<default>null</default>
	            </field>
				<field>
	                <name>text1</name>
	                <type>text</type>
					<notnull>false</notnull>
					<default>null</default>
	            </field>
				<field>
	                <name>text2</name>
	                <type>text</type>
					<notnull>false</notnull>
					<default>null</default>
	            </field>
				<field>
	                <name>is_default</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>
                <index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>name</name>
                    <field>
                        <name>name</name>
                    </field>
                </index>
     		</declaration>
		</table>'
         );
        $this->_backend->createTable($declaration);
        
        $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_payment_method</name>
			</table>
			<field>
				<name>id</name>
				<value>NOVALUE</value>
			</field>
			<field>
				<name>name</name>
				<value>keine Auswahl</value>
			</field>
			<field>
				<name>text1</name>
				<value></value>
			</field>			
		</record>'));
        
        $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_payment_method</name>
			</table>
			<field>
				<name>id</name>
				<value>CASH</value>
			</field>
			<field>
				<name>name</name>
				<value>Barzahlung</value>
			</field>
			<field>
				<name>text1</name>
				<value>Betrag dankend erhalten</value>
			</field>			
		</record>'));
        
        $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_payment_method</name>
			</table>
			<field>
				<name>id</name>
				<value>DEBIT</value>
			</field>
			<field>
				<name>name</name>
				<value>Lastschrift</value>
			</field>
			<field>
				<name>text1</name>
				<value>Wir werden den Rechnungsbetrag von Ihrem Bankkonto einziehen.</value>
			</field>			
		</record>'));
                
        $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_payment_method</name>
			</table>
			<field>
				<name>id</name>
				<value>BANKTRANSFER</value>
			</field>
			<field>
				<name>name</name>
				<value>Lastschrift</value>
			</field>
			<field>
				<name>text1</name>
				<value>Der Rechnungsbetrag ist zahlbar binnen 14 Tagen ohne Abzug.</value>
			</field>			
		</record>'));
		$this->setApplicationVersion('Billing', '1.86');
				
	}
	
	public function update_86(){
		 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_method_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>true</notnull>
                </field>'
         );
         
         $indexDeclaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>payment_method_id</name>
                    <field>
                        <name>payment_method_id</name>
                    </field>
                </index>'
         );
         
         
         if(!$this->_backend->columnExists('payment_method_id', 'bill_order')){
         		$this->_backend->addCol('bill_order', $declaration);
         		$this->_backend->addIndex('bill_order', $indexDeclaration);
         }
		 if(!$this->_backend->columnExists('payment_method_id', 'bill_receipt')){
         		$this->_backend->addCol('bill_receipt', $declaration);
         		$this->_backend->addIndex('bill_receipt', $indexDeclaration);
         }
         
         $this->setApplicationVersion('Billing', '1.87');
				
	}
	
	
	public function update_87(){
	     $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>sort_order</name>
                    <type>integer</type>
                    <length>4</length>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_payment_method', $declaration);
         				
         $this->setApplicationVersion('Billing', '1.88');
	}
	
	public function update_88(){
	     $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>comment</name>
                    <type>text</type>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_order_position', $declaration);
         				
         $this->setApplicationVersion('Billing', '1.89');
	}
	
	public function update_89(){
	     $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);

         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>debitor_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);
         				
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>order_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_type</name>
                    <type>enum</type>
					<value>PAYMENT</value>
					<value>DISAGIO</value>
					<default>PAYMENT</default>
			    </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>created_by</name>
                    <type>text</type>
                    <length>40</length>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>creation_time</name>
                    <type>datetime</type>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>last_modified_by</name>
                    <type>text</type>
                    <length>40</length>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>last_modified_time</name>
                    <type>datetime</type>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_deleted</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>deleted_by</name>
                    <type>text</type>
                    <length>40</length>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>deleted_time</name>
                    <type>datetime</type>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $this->setApplicationVersion('Billing', '1.90');
	}
	
	public function update_90(){
				
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>order_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>open_item_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);
         
         $this->setApplicationVersion('Billing', '1.91');
	}
	
	public function update_91(){

		$this->_backend->dropForeignKey('bill_payment', 'fk_bill_payment_debitor');
		
		$declaration = new Setup_Backend_Schema_Index_Xml('
		 	<index>
                    <name>fk_bill_payment_debitor</name>
                    <foreign>true</foreign>
                    <field>
                        <name>debitor_id</name>
                    </field>
 					<reference>
                        <table>bill_debitor</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index>
		');
		
		$this->_backend->addForeignKey('bill_payment', $declaration);
		
		$this->setApplicationVersion('Billing', '1.92');
	}
	
	public function update_92(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_state</name>
                    <type>enum</type>
                    <value>TOBEPAYED</value>
                    <value>PARTLYPAYED</value>
					<value>PAYED</value>
                    <default>TOBEPAYED</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>context</name>
                    <type>enum</type>
                    <value>BILLING</value>
                    <value>MEMBERSHIP</value>
					<value>BREVETATION</value>
					<value>DONATOR</value>
                    <default>BILLING</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>context</name>
                    <type>enum</type>
                    <value>BILLING</value>
                    <value>MEMBERSHIP</value>
					<value>CERTIFICATION</value>
					<value>DONATOR</value>
                    <default>BILLING</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_order', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>context</name>
                    <type>enum</type>
                    <value>BILLING</value>
                    <value>MEMBERSHIP</value>
					<value>CERTIFICATION</value>
					<value>DONATOR</value>
                    <default>BILLING</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_open_item', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>context</name>
                    <type>enum</type>
                    <value>BILLING</value>
                    <value>MEMBERSHIP</value>
					<value>CERTIFICATION</value>
					<value>DONATOR</value>
                    <default>BILLING</default>
                    <notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $this->setApplicationVersion('Billing', '1.93');
	}
	
	public function update_93(){
		$tableDefinition = '
		<table>
			<name>bill_debitor_account</name>	
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
                    <name>debitor_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>item_type</name>
                    <type>enum</type>
					<value>PAYMENT</value>
					<value>DISAGIO</value>
					<value>CREDIT</value>
					<value>DEBIT</value>
					<default>DEBIT</default>
			    </field>
				<field>
                    <name>create_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>value_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>s_brutto</name>
                    <type>float</type>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>h_brutto</name>
                    <type>float</type>
                    <notnull>false</notnull>
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
				<index>
                    <name>fk_bill_debitor_acount_debitor</name>
                    <foreign>true</foreign>
                    <field>
                        <name>debitor_id</name>
                    </field>
 					<reference>
                        <table>bill_debitor</table>
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
		 $this->setApplicationVersion('Billing', '1.94');
	}
	
	public function update_94(){
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                    <default>0</default>
                </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                    <default>0</default>
			    </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total_weight</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                    <default>0</default>
			    </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
         $this->setApplicationVersion('Billing', '1.95');
	}	

	public function update_95(){
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor_account', $declaration);
         $this->setApplicationVersion('Billing', '1.951');
	}
	
	public function update_951(){
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_order_locked</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>'
         );
        $this->_backend->addCol('bill_debitor', $declaration);
  		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>order_lock_comment</name>
                    <type>text</type>
                    <length>512</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);
  		
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>order_lock_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);
  		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_monition_locked</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);
  		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>monition_lock_comment</name>
                    <type>text</type>
                    <length>512</length>
					<notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);
  		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>monition_lock_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);                                             
         $this->setApplicationVersion('Billing', '1.952');
	}
	
	public function update_952(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
		    	<name>due_in_days</name>
		        <type>integer</type>
		        <notnull>true</notnull>
				<default>0</default>
		    </field>'
         );
         $this->_backend->addCol('bill_payment_method', $declaration);                                             
         $this->setApplicationVersion('Billing', '1.953');
	}        

	public function update_953(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                <name>ust_id</name>
                <type>text</type>
                <length>48</length>
				<notnull>false</notnull>
				<default>null</default>
             </field>'
         );
         $this->_backend->addCol('bill_debitor', $declaration);                                             
         $this->setApplicationVersion('Billing', '1.954');
	}   
	
	public function update_954(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>amount</name>
                    <type>float</type>
                    <notnull>true</notnull>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_payment', $declaration);                                             
         $this->setApplicationVersion('Billing', '1.955');
	}
	
	public function update_955(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>s_brutto</name>
                    <type>float</type>
                    <notnull>false</notnull>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_debitor_account', $declaration);  

         $declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>h_brutto</name>
                    <type>float</type>
                    <notnull>false</notnull>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_debitor_account', $declaration);    
         $this->setApplicationVersion('Billing', '1.956');
	}
	
	public function update_956(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
			    </field>'
         );
         $this->_backend->alterCol('bill_stock_flow', $declaration);  

         $this->setApplicationVersion('Billing', '1.957');
	}
	
	public function update_957(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>pos_permitted</name>
                    <type>boolean</type>
					<default>false</default>
			    </field>'
         );
         $this->_backend->addCol('bill_article_group', $declaration);  

         $declaration = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>pos_permitted</name>
                    <type>boolean</type>
					<default>false</default>
			    </field>'
         );
         $this->_backend->addCol('bill_article', $declaration);  
         
         
         $this->setApplicationVersion('Billing', '1.958');
	}
	
	public function update_958(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>banking_exp_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
			    </field>'
         );
         $this->_backend->addCol('bill_open_item', $declaration);  
         
		$declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>state</name>
                    <type>enum</type>
					<value>OPEN</value>
					<value>DONE</value>
					<default>OPEN</default>
					<notnull>true</notnull>
			    </field>'
         );
         
         $this->_backend->addCol('bill_open_item', $declaration);  
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_method_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>true</notnull>
                </field>'
         );
         
         $this->_backend->addCol('bill_open_item', $declaration);  
         
         $this->setApplicationVersion('Billing', '1.959');
         
	}
	/**
	 * 
	 * add fibu account classes and bookings
	 * add global ERP context: by context we can separate
	 * the source of a booking or an order (ERP, DONATOR, MEMBERSHIP,...)
	 */
	public function update_959(){
		$tableDefinition = '
		<table>
			<name>bill_context</name>	
			<version>1</version>
			<engine>InnoDB</engine>
	     	<charset>utf8</charset>
			<declaration>
                <field>
                    <name>id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>name</name>
                    <type>text</type>
					<length>48</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>application_name</name>
                    <type>text</type>
					<length>64</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>model_name</name>
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
		
		$tableDefinition = '
		<table>
			<name>bill_account_class</name>	
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
                    <name>key</name>
                    <type>text</type>
					<length>12</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>name</name>
                    <type>text</type>
					<length>48</length>
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
		
		$tableDefinition = '
		<table>
			<name>bill_account_system</name>	
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
                    <name>vat_account_id</name>
                    <type>integer</type>
					<notnull>false</notnull>
                </field>
				<field>
                    <name>number</name>
                    <type>text</type>
					<length>16</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>name</name>
                    <type>text</type>
					<length>48</length>
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
		
		$tableDefinition = '
		<table>
			<name>bill_booking</name>	
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
                    <name>receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
				<field>
                    <name>booking_nr</name>
                    <type>text</type>
					<length>24</length>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>receipt_unique_nr</name>
                    <type>text</type>
					<length>24</length>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>booking_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
				<field>
                    <name>booking_text</name>
                    <type>text</type>
					<length>256</length>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
                </field>
				<field>
                    <name>object_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_booking_context_id</name>
                    <foreign>true</foreign>
                    <field>
                        <name>erp_context_id</name>
                    </field>
   					<reference>
                        <table>bill_context</table>
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
		
		$tableDefinition = '
		<table>
			<name>bill_account_booking</name>	
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
                    <name>account_system_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>booking_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>value</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>type</name>
                    <type>enum</type>
					<value>CREDIT</value>
					<value>DEBIT</value>
			    </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_ab_account_system</name>
                    <foreign>true</foreign>
                    <field>
                        <name>account_system_id</name>
                    </field>
 					<reference>
                        <table>bill_account_system</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index>
				<index>
                    <name>fk_ab_booking</name>
                    <foreign>true</foreign>
                    <field>
                        <name>booking_id</name>
                    </field>
 					<reference>
                        <table>bill_booking</table>
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
		/*
		 $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>fk_rp_receipt</name>
                    <foreign>true</foreign>
                    <field>
                        <name>receipt_id</name>
                    </field>
 					<reference>
                        <table>bill_receipt</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index>'
         );
         $this->_backend->addIndex('bill_receipt_position', $declaration);
         
          $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>fk_rp_order_position</name>
                    <foreign>true</foreign>
                    <field>
                        <name>order_position_id</name>
                    </field>
 					<reference>
                        <table>bill_order_position</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index> '
         );
         $this->_backend->addIndex('bill_receipt_position', $declaration);
         */
		
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>number_base</name>
			</table>
			<field>
				<name>key</name>
				<value>booking_nr</value>
			</field>
			<field>
				<name>formula</name>
				<value>N1</value>
			</field>
			<field>
				<name>number1</name>
				<value>0</value>
			</field>
			<field>
				<name>number2</name>
				<value>0</value>
			</field>
			<field>
				<name>number3</name>
				<value>0</value>
			</field>
			<field>
				<name>last_generated</name>
				<value>0</value>
			</field>			
		</record>'));
		
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_context</name>
			</table>
			<field>
				<name>id</name>
				<value>ERP</value>
			</field>
			<field>
				<name>name</name>
				<value>ERP</value>
			</field>
			<field>
				<name>application_name</name>
				<value>Billing</value>
			</field>
			<field>
				<name>model_name</name>
				<value>Billing_Model_Receipt</value>
			</field>
		</record>'));
		
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_context</name>
			</table>
			<field>
				<name>id</name>
				<value>DONATOR</value>
			</field>
			<field>
				<name>name</name>
				<value>Spenden</value>
			</field>
			<field>
				<name>application_name</name>
				<value>Donator</value>
			</field>
			<field>
				<name>model_name</name>
				<value>Donator_Model_Donation</value>
			</field>
		</record>'));
		
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_context</name>
			</table>
			<field>
				<name>id</name>
				<value>MEMBERSHIP</value>
			</field>
			<field>
				<name>name</name>
				<value>Mitglieder</value>
			</field>
			<field>
				<name>application_name</name>
				<value>Membership</value>
			</field>
			<field>
				<name>model_name</name>
				<value>Membership_Model_SoMember</value>
			</field>
		</record>'));
		 $this->setApplicationVersion('Billing', '1.960');
		 
	}
	
	public function update_960(){
	     
/*
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>account_class_id</name>
                    <type>integer</type>
					<notnull>false</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_account_system', $declaration);

         $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>fk_as_account_class_id</name>
                    <foreign>true</foreign>
                    <field>
                        <name>account_class_id</name>
                    </field>
   					<reference>
                        <table>bill_account_class</table>
                        <field>id</field>
                    </reference>
				</index>'
         );
         $this->_backend->addIndex('bill_account_system', $declaration);
         	*/
         $this->setApplicationVersion('Billing', '1.961');
	}
	
	public function update_961(){
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>'
         );
         $this->_backend->addCol('bill_order', $declaration);

		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>'
         );
         $this->_backend->addCol('bill_receipt', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>'
         );
         $this->_backend->addCol('bill_payment', $declaration);
         
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>'
         );
         $this->_backend->addCol('bill_open_item', $declaration);
         
          $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>type</name>
                    <type>enum</type>
					<value>ACTIVE</value>
					<value>PASSIVE</value>
					<notnull>true</notnull>
                </field>'
         );
         $this->_backend->addCol('bill_account_system', $declaration);
         
         $this->setApplicationVersion('Billing', '1.962');
	}
	
	public function update_962(){
	   /*$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>simple_article</name>
                    <type>boolean</type>
					<default>false</default>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
        
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>add_calculation</name>
                    <type>boolean</type>
					<default>false</default>
			    </field>
				'
       );
       $this->_backend->addCol('bill_article', $declaration);

       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>ek1</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>ek2</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_vat_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>rev_account_price2_vat_in</name>
                    <type>text</type>
					<length>24</length>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>rev_account_price2_vat_ex</name>
                    <type>text</type>
					<length>24</length>
			    </field>'
       );
       $this->_backend->addCol('bill_article', $declaration);
      
       $tableDefinition = '
		<table>
			<name>bill_article_series_kind</name>	
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
	                <name>name</name>
	                <type>text</type>
					<length>48</length>
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
       
       $tableDefinition = '
		<table>
			<name>bill_article_series</name>	
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
	                <name>name</name>
	                <type>text</type>
					<length>48</length>
					<notnull>true</notnull>
	            </field>
	            <field>
	                <name>description</name>
	                <type>text</type>
					<length>1024</length>
					<notnull>false</notnull>
	            </field>
				<field>
                    <name>begin_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
			    </field>
			    <field>
                    <name>end_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
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
      
    
	   $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>article_series_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_stock_flow', $declaration);
		
        $tableDefinition = '
		<table>
			<name>bill_series_article</name>	
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
                    <name>article_series_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>article_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_series_article_series</name>
                    <foreign>true</foreign>
                    <field>
                        <name>article_series_id</name>
                    </field>
 					<reference>
                        <table>bill_article_series</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
                    </reference>				
                </index>	
				<index>
                    <name>fk_series_article_article</name>
                    <foreign>true</foreign>
                    <field>
                        <name>article_id</name>
                    </field>
 					<reference>
                        <table>bill_article</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
                    </reference>				
                </index>
			</declaration>
		</table>
		';
		$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
		$this->_backend->createTable($table);
       
		
       $this->setApplicationVersion('Billing', '1.963');*/
	}	

	public function update_963(){
	   $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_vat_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total2_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total2_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
			    </field>'
       );
       $this->_backend->addCol('bill_order_position', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>article_series_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       
       $this->_backend->addCol('bill_article', $declaration);
       
     
       $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>price_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_article', $declaration);
      
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_article', $declaration);
				
	 	$this->setApplicationVersion('Billing', '1.964');
	}	
	
	public function update_964(){
	  
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total1_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_order_position', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total1_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_order_position', $declaration);
				
	 	$this->setApplicationVersion('Billing', '1.965');
	}	
	
	public function update_965(){
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>add_percentage</name>
                    <type>float</type>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_order_position', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>add_percentage</name>
                    <type>float</type>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>'
       );
       
       $this->_backend->addCol('bill_receipt', $declaration);
				
	   $this->setApplicationVersion('Billing', '1.966');
	   
	}
	
	public function update_966(){
		 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
                    <default>0</default>
                </field>'
       );
       $this->_backend->alterCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>price2_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
                     <default>0</default>
                </field>'
       );
       $this->_backend->alterCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total2_netto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                     <default>0</default>
                </field>'
       );
       $this->_backend->alterCol('bill_order_position', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total2_brutto</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
                     <default>0</default>
			    </field>'
       );
       $this->_backend->alterCol('bill_order_position', $declaration);
		
		$this->setApplicationVersion('Billing', '1.967');
	}
	
	public function update_967(){
		
		$declaration = new Setup_Backend_Schema_Table_Xml('
		<table>
			<name>bill_debitor_group</name>	
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
	                <name>name</name>
	                <type>text</type>
					<length>64</length>
					<notnull>true</notnull>
	            </field>	
				<field>
	                <name>comment</name>
	                <type>text</type>
					<notnull>false</notnull>
	            </field>
				<field>
	                <name>is_default</name>
	                <type>boolean</type>
					<default>false</default>
	            </field>					
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>	
				<index>
                    <name>name</name>
                    <field>
                        <name>name</name>
                    </field>
                </index>		
			</declaration>
		</table>'
       );
       	$this->_backend->createTable($declaration);

       $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_debitor_group</name>
			</table>
			<field>
				<name>id</name>
				<value>1</value>
			</field>
			<field>
				<name>name</name>
				<value>Standard</value>
			</field>
			<field>
				<name>is_default</name>
				<value>1</value>
			</field>			
		</record>'));
       	
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>debitor_group_id</name>
                    <type>integer</type>
					<notnull>true</notnull>
                    <default>1</default>
			    </field>'
       );
       $this->_backend->addCol('bill_debitor', $declaration);
       
       /*
        $declaration = new Setup_Backend_Schema_Index_Xml('
			<index>
                <name>fk_debitor_debitor_group</name>
                <foreign>true</foreign>
                <field>
                    <name>debitor_group_id</name>
                </field>
 				<reference>
                    <table>bill_debitor_group</table>
                    <field>id</field>
                </reference>				
            </index>'
       );
       $this->_backend->addIndex('bill_debitor', $declaration);
       
       	
       	
       */
       	
       $this->setApplicationVersion('Billing', '1.968');
	}
	
	public function update_968(){	
		
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>value</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);
       
		 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>account_type</name>
                    <type>enum</type>
					<value>NOMINAL</value>
					<value>INVENTORY</value>
					<notnull>true</notnull>
					<default>NOMINAL</default>
                </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>last_termination_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
       
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>termination_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>status</name>
                    <type>enum</type>
					<value>OPEN</value>
					<value>TERMINATED</value>
					<default>OPEN</default>
					<notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
       
       $this->setApplicationVersion('Billing', '1.969');
	}
	
	public function update_969(){	
		
         $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>credit_value</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
       
	   $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>debit_value</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>begin_credit_saldo</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>begin_debit_saldo</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
       
       $this->setApplicationVersion('Billing', '1.970');
	}
	
	public function update_970(){	
		
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_bank_account</name>
                    <type>boolean</type>
                    <notnull>true</notnull>
                    <default>false</default>
                </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
       
	   $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_default_bank_account</name>
                    <type>boolean</type>
					<notnull>true</notnull>
                    <default>false</default>
                </field>'
       );
       $this->_backend->addCol('bill_account_system', $declaration);
              
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>account_system_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>account_booking_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				 <field>
                    <name>type</name>
                    <type>enum</type>
					<value>CREDIT</value>
					<value>DEBIT</value>
			    </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_debitor_account', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>usage</name>
                    <type>text</type>
                    <length>512</length>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_receipt_nr</name>
                    <type>text</type>
					<length>64</length>
                    <notnull>false</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_receipt_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
      		
       $this->setApplicationVersion('Billing', '1.971');
	}

	public function update_971(){
 		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>debitor_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_account_booking', $declaration);
      		
       $this->setApplicationVersion('Billing', '1.972');
	}
				
	
	public function update_972(){
		$tableDef = '
		<table>
			<name>bill_booking_template</name>	
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
                    <name>booking_template_nr</name>
                    <type>text</type>
					<length>24</length>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>key</name>
                    <type>text</type>
					<length>64</length>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
				<field>
                    <name>event_name</name>
                    <type>text</type>
					<length>64</length>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
				<field>
                    <name>name</name>
                    <type>text</type>
					<length>256</length>
                    <notnull>true</notnull>
			    </field>
				<field>
                    <name>booking_text</name>
                    <type>text</type>
					<length>256</length>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
				<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>
				<field>
                    <name>booking_type</name>
                    <type>enum</type>
					<value>UNSPECIFIED</value>
					<value>PAYOUTSTANDING</value>
					<value>PAYCOMMITMENT</value>
					<value>BILLOUTSTANDING</value>
					<value>BILLCOMMITMENT</value>
					<default>UNSPECIFIED</default>
			    </field>
				<field>
                    <name>has_vat</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
				<field>
                    <name>is_auto_possible</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_bt_ct_id</name>
                    <foreign>true</foreign>
                    <field>
                        <name>erp_context_id</name>
                    </field>
   					<reference>
                        <table>bill_context</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>
				</index>	
			</declaration>
		</table>';
       
    	$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDef);
		$this->_backend->createTable($table);
		
       	$tableDef = 
       	'<table>
			<name>bill_booking_template_account</name>	
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
                    <name>account_system_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>booking_template_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>type</name>
                    <type>enum</type>
					<value>CREDIT</value>
					<value>DEBIT</value>
					<default>DEBIT</default>
			    </field>
				<field>
                    <name>percentage</name>
                    <type>float</type>
                    <notnull>true</notnull>
					<default>1</default>
			    </field>
				<field>
                    <name>input_value</name>
                    <type>enum</type>
					
					<value>NETTO_TOTAL</value>
					<value>BRUTTO_TOTAL</value>
					
					<value>NETTO_VAT_ZERO</value>
					<value>NETTO_VAT_REDUCED</value>
					<value>NETTO_VAT_FULL</value>
					<value>NETTO_P1_TOTAL</value>
					<value>NETTO_P2_TOTAL</value>
					
					<value>BRUTTO_VAT_ZERO</value>
					<value>BRUTTO_VAT_REDUCED</value>
					<value>BRUTTO_VAT_FULL</value>
					<value>BRUTTO_P1_TOTAL</value>
					<value>BRUTTO_P2_TOTAL</value>
					
					<value>NETTO_EK_VAT_ZERO</value>
					<value>NETTO_EK_VAT_REDUCED</value>
					<value>NETTO_EK_VAT_FULL</value>
					<value>NETTO_EK_TOTAL</value>
					
					<value>BRUTTO_EK_VAT_ZERO</value>
					<value>BRUTTO_EK_VAT_REDUCED</value>
					<value>BRUTTO_EK_VAT_FULL</value>
					<value>BRUTTO_EK_TOTAL</value>
					
					<default>BRUTTO_TOTAL</default>
			    </field>
				<field>
                    <name>multiply</name>
                    <type>enum</type>
					<value>SPLITOPOS</value>
					<value>NOSPLIT</value>
					<default>NOSPLIT</default>
			    </field>
				<field>
                    <name>has_customer</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
				<field>
                    <name>has_supplier</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_abt_account_system</name>
                    <foreign>true</foreign>
                    <field>
                        <name>account_system_id</name>
                    </field>
 					<reference>
                        <table>bill_account_system</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index>
				<index>
                    <name>fk_booking_template</name>
                    <foreign>true</foreign>
                    <field>
                        <name>booking_template_id</name>
                    </field>
 					<reference>
                        <table>bill_booking_template</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
						<onupdate>CASCADE</onupdate>
                    </reference>				
                </index>
			</declaration>
		</table>';
       
    	$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDef);
		$this->_backend->createTable($table);
		
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>number_base</name>
			</table>
			<field>
				<name>key</name>
				<value>booking_template_nr</value>
			</field>
			<field>
				<name>formula</name>
				<value>N1</value>
			</field>
			<field>
				<name>number1</name>
				<value>0</value>
			</field>
			<field>
				<name>number2</name>
				<value>0</value>
			</field>
			<field>
				<name>number3</name>
				<value>0</value>
			</field>
			<field>
				<name>last_generated</name>
				<value>0</value>
			</field>			
		</record>'));
		
       $this->setApplicationVersion('Billing', '1.973');
	}
	
	public function update_973(){
 		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
      		
       $this->setApplicationVersion('Billing', '1.974');
	}
	
	public function update_974(){
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>item_type</name>
                    <type>enum</type>
					<value>HISTORY</value>
					<value>PAYMENT</value>
					<value>DISAGIO</value>
					<value>CREDIT</value>
					<value>DEBIT</value>
					<default>DEBIT</default>
			    </field>
		');
		$this->_backend->alterCol('bill_debitor_account', $dec);
				
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>erp_context_id</name>
                    <type>text</type>
					<length>24</length>
					<notnull>true</notnull>
					<default>ERP</default>
                </field>
		');
		$this->_backend->addCol('bill_debitor_account', $dec);
		
		$this->setApplicationVersion('Billing', '1.975');
	}	
	
	public function update_975(){
				
		/*$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>account_system_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
			*/	
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>account_system_id_haben</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.976');
	}	
	
	public function update_976(){
			/*	
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>account_class_id</name>
                    <type>integer</type>
					<notnull>false</notnull>
					<default>null</default>
                </field>'
         );
         $this->_backend->addCol('bill_account_system', $declaration);
 
        $declaration = new Setup_Backend_Schema_Index_Xml('
				<index>
                    <name>fk_as_account_class_id</name>
                    <foreign>true</foreign>
                    <field>
                        <name>account_class_id</name>
                    </field>
   					<reference>
                        <table>bill_account_class</table>
                        <field>id</field>
                    </reference>
				</index>'
         );
         $this->_backend->addIndex('bill_account_system', $declaration);*/
		
		$this->setApplicationVersion('Billing', '1.977');
	}	
	
	public function update_977(){
		$tableDef = 
       	'<table>
			<name>bill_mt940_payment</name>	
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
                    <name>op_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				
				<field>
                    <name>debitor_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				
				<field>
                    <name>op_nr</name>
                    <type>text</type>
					<length>24</length>
                    <notnull>false</notnull>
                </field>
				<field>
	                <name>type</name>
	                <type>enum</type>
					<value>CREDIT</value>
					<value>DEBIT</value>
					<default>DEBIT</default>
					<notnull>true</notnull>
	            </field>
				<field>
                    <name>due_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>payment_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
			    </field>
				<field>
                    <name>op_amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>
				<field>
                    <name>payment_amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>
				<field>
                    <name>state</name>
                    <type>enum</type>
					<value>GREEN</value>
					<value>ORANGE</value>
					<value>RED</value>
					<default>RED</default>
					<notnull>true</notnull>
			    </field>			
				<field>
                    <name>usage</name>
                    <type>text</type>
                    <length>512</length>
                    <notnull>false</notnull>
                    <default>null</default>
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
       
    	$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDef);
		$this->_backend->createTable($table);
		
		$this->setApplicationVersion('Billing', '1.978');
	}
	
	public function update_978(){
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
            	<name>op_id</name>
                <type>integer</type>
                <notnull>false</notnull>
				<default>null</default>
            </field>
		');
		$this->_backend->alterCol('bill_mt940_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.979');
	}	
	
	public function update_979(){
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
            	<name>debitor_id</name>
                <type>integer</type>
                <notnull>false</notnull>
				<default>null</default>
            </field>
		');
		$this->_backend->alterCol('bill_mt940_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.980');
	}	
	
	public function update_980(){
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>true</notnull>
                </field>
		');
		$this->_backend->alterCol('bill_mt940_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.981');
	}	
	
	public function update_981(){
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>usage</name>
                    <type>text</type>
                    <length>1024</length>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->alterCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>usage_payment</name>
                    <type>text</type>
                    <length>1024</length>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);	

		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>overpay</name>
                    <type>enum</type>
					<value>DONATION</value>
					<value>PREPAYMEMBERFEE</value>
					<default>DONATION</default>
					<notnull>true</notnull>
			    </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);	
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>account_system_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>account_system_id_haben</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			 <field>
                    <name>overpay_amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.982');
	}	 
	
	public function update_982(){
		
		/*$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>multiple_ops</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>additional_data</name>
                    <type>text</type>
                    <notnull>false</notnull>
                </field>
						
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		*/
		
	 if(!$this->_backend->tableExists('bill_article_series')){
       	
     	$tableDefinition = '
		<table>
			<name>bill_article_series</name>	
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
	                <name>name</name>
	                <type>text</type>
					<length>48</length>
					<notnull>true</notnull>
	            </field>
	            <field>
	                <name>description</name>
	                <type>text</type>
					<length>1024</length>
					<notnull>false</notnull>
	            </field>
				<field>
                    <name>begin_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
			    </field>
			    <field>
                    <name>end_date</name>
                    <type>date</type>
					<notnull>false</notnull>
					<default>null</default>
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
      
	 
	   $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>article_series_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_stock_flow', $declaration);
	 }
      
	 if(!$this->_backend->tableExists('bill_series_article')){
        $tableDefinition = '
		<table>
			<name>bill_series_article</name>	
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
                    <name>article_series_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<field>
                    <name>article_id</name>
                    <type>integer</type>
                    <notnull>true</notnull>
                </field>
				<index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
				<index>
                    <name>fk_series_article_series</name>
                    <foreign>true</foreign>
                    <field>
                        <name>article_series_id</name>
                    </field>
 					<reference>
                        <table>bill_article_series</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
                    </reference>				
                </index>	
				<index>
                    <name>fk_series_article_article</name>
                    <foreign>true</foreign>
                    <field>
                        <name>article_id</name>
                    </field>
 					<reference>
                        <table>bill_article</table>
                        <field>id</field>
                        <ondelete>CASCADE</ondelete>
                    </reference>				
                </index>
			</declaration>
		</table>
		';
		$table = Setup_Backend_Schema_Table_Factory::factory('String', $tableDefinition);
		$this->_backend->createTable($table);
	 }
		
		
		$this->setApplicationVersion('Billing', '1.983');
	}	 
	
	public function update_983(){
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>object_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>
		');
		$this->_backend->addCol('bill_debitor_account', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>object_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>
						
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.984');
	}
	
public function update_984(){
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>receipt_state</name>
                    <type>enum</type>
                    <value>VALID</value>
                    <value>REVERTED</value>
					<value>PARTLYREVERTED</value>
                    <default>VALID</default>
                    <notnull>true</notnull>
                </field>
		');
		$this->_backend->addCol('bill_receipt', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>receipt_state</name>
                    <type>enum</type>
                    <value>VALID</value>
                    <value>REVERTED</value>
					<value>PARTLYREVERTED</value>
                    <default>VALID</default>
                    <notnull>true</notnull>
                </field>
						
		');
		$this->_backend->addCol('bill_receipt_position', $dec);
		
		$this->setApplicationVersion('Billing', '1.985');
	}
			
	
	public function update_985(){
		
		 if(!$this->_backend->tableExists('bill_batch_job')){
	        $tableDefinition = '
			<table>
				<name>bill_batch_job</name>	
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
					    <notnull>false</notnull>
						<default>null</default>
	                </field>
					<field>
	                    <name>account_id</name>
	                    <type>text</type>
	                    <length>40</length>
	                    <notnull>false</notnull>
	                    <default>null</default>
	                </field>
					<field>
		                <name>job_nr</name>
		                <type>text</type>
						<length>16</length>
		                <notnull>false</notnull>
					</field>
					<field>
		                <name>job_name1</name>
		                <type>text</type>
						<length>64</length>
		                <notnull>false</notnull>
					</field>
					<field>
		                <name>job_name2</name>
		                <type>text</type>
						<length>128</length>
		                <notnull>false</notnull>
					</field>
					<field>
						<name>job_category</name>
						<type>enum</type>
						<value>DTAEXPORT</value>
						<value>PAYMENT</value>
						<value>MANUALEXPORT</value>
						<value>PREDEFINEDEXPORT</value>
						<value>PRINT</value>
						<value>DUETASKS</value>
					</field>
					<field>
						<name>job_type</name>
						<type>enum</type>
						<value>RUNTIME</value>
						<value>SCHEDULER</value>
					</field>
					<field>
		                <name>job_data</name>
		                <type>text</type>
						<notnull>false</notnull>
			        </field>
					<field>
						<name>job_state</name>
						<type>enum</type>
						<value>TOBEPROCESSED</value>
						<value>RUNNING</value>
						<value>PROCESSED</value>
						<value>ABANDONED</value>
						<value>USERCANCELLED</value>
					</field>
					<field>
						<name>job_result_state</name>
						<type>enum</type>
						<value>UNDEFINED</value>
						<value>OK</value>
						<value>PARTLYERROR</value>
						<value>ERROR</value>
					</field>
					<field>
						<name>on_error</name>
						<type>enum</type>
						<value>STOP</value>
						<value>PROCEED</value>
					</field>
					<field>
		                <name>process_info</name>
		                <type>text</type>
						<notnull>false</notnull>
			        </field>
					<field>
		                <name>error_info</name>
		                <type>text</type>
						<notnull>false</notnull>
			        </field>
					<field>
		                <name>ok_count</name>
		                <type>integer</type>
						<default>0</default>
						<notnull>true</notnull>
			        </field>
					<field>
		                <name>error_count</name>
		                <type>integer</type>
						<default>0</default>
						<notnull>true</notnull>
			        </field>
					<field>
						<name>create_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
						<name>schedule_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
						<name>start_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
						<name>end_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
	                    <name>process_percentage</name>
	                    <type>integer</type>
	                    <length>4</length>
						<default>0</default>
	                </field>
					<field>
	                    <name>task_count</name>
	                    <type>integer</type>
	                    <length>11</length>
						<default>0</default>
	                </field>
					<field>
	                    <name>tasks_done</name>
	                    <type>integer</type>
	                    <length>11</length>
						<default>0</default>
	                </field>
					<field>
						<name>modified_datetime</name>
						<type>datetime</type>
						<notnull>false</notnull>
						<default>null</default>
					</field>
					<field>
	                    <name>skip_count</name>
	                    <type>integer</type>
	                    <length>11</length>
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
			
		if(!$this->_backend->tableExists('bill_batch_dta')){
	        $tableDefinition = '
			<table>
				<name>bill_batch_dta</name>
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
						<name>bank_valid</name>
						<type>enum</type>
						<value>YES</value>
						<value>UNKNOWN</value>
						<value>NO</value>
						<default>UNKNOWN</default>
					</field>
					<field>
						<name>bank_account_number</name>
						<type>text</type>
						<length>12</length>
					</field>
					<field>
						<name>bank_code</name>
						<type>text</type>
						<length>8</length>
					</field>
					<field>
						<name>bank_account_name</name>
						<type>text</type>
						<length>64</length>
					</field>
					<field>
						<name>bank_name</name>
						<type>text</type>
						<length>64</length>
					</field>
					<field>
	                    <name>total_sum</name>
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
		 
		if(!$this->_backend->tableExists('bill_batch_dta_item')){
	        $tableDefinition = '
			<table>
				<name>bill_batch_dta_item</name>
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
	                    <name>batch_dta_id</name>
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
		
		$this->setApplicationVersion('Billing', '1.986');
	}	 
	
	
	public function update_986(){
 		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>open_item_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_batch_dta_item', $declaration);
      		
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_batch_dta_item', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>'
       );
       $this->_backend->addCol('bill_batch_dta', $declaration);
       
       $this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>number_base</name>
			</table>
			<field>
				<name>key</name>
				<value>billing_batch_job_nr</value>
			</field>
			<field>
				<name>formula</name>
				<value>N1</value>
			</field>
			<field>
				<name>number1</name>
				<value>0</value>
			</field>
			<field>
				<name>number2</name>
				<value>0</value>
			</field>
			<field>
				<name>number3</name>
				<value>0</value>
			</field>
			<field>
				<name>last_generated</name>
				<value>0</value>
			</field>			
		</record>'));
       
       $this->setApplicationVersion('Billing', '1.987');
	}
		
	public function update_987(){
	/*	 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>bank_code</name>
					<type>text</type>
					<length>24</length>
				</field>'
       );
       $this->_backend->addCol('bill_batch_dta_item', $declaration);
       */
       $this->setApplicationVersion('Billing', '1.988');
	}
	
	public function update_988(){
		 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payment_method_id</name>
                   	<type>text</type>
					<length>40</length>
                    <notnull>true</notnull>
                    <default>BANKTRANSFER</default>
                </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
       
       $this->setApplicationVersion('Billing', '1.989');
	}
		
	public function update_989(){
		
		 $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>total_saldation</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_batch_dta', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>diff_saldation</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>true</notnull>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_batch_dta', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>state</name>
                    <type>enum</type>
					<value>OPEN</value>
					<value>PARTLYOPEN</value>
					<value>DONE</value>
					<default>OPEN</default>
					<notnull>true</notnull>
			    </field>'
       );
       $this->_backend->alterCol('bill_open_item', $declaration);
       
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>open_sum</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
                </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payed_sum</name>
                     <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>revision_receipt_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>open_sum</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
                </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
       
        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>payed_sum</name>
                     <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
       
       $this->setApplicationVersion('Billing', '1.990');
	}
		

	public function update_990(){
	  $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>reversion_record_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancelled</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancellation</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_payment', $declaration);

$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>reversion_record_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_debitor_account', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancelled</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_debitor_account', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancellation</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_debitor_account', $declaration);       

$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>reversion_record_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancelled</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancellation</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);  

        $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_open_item', $declaration);
       
	$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>reversion_record_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancelled</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
       
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancellation</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_receipt', $declaration);       
       
	$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>reversion_record_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancelled</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);
	  
       $declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
	                <name>is_cancellation</name>
	                <type>boolean</type>
	                <notnull>true</notnull>
					<default>false</default>
	            </field>'
       );
       $this->_backend->addCol('bill_booking', $declaration);       
       
       $this->setApplicationVersion('Billing', '1.991');
	}	
	
	public function update_991(){
		
		$dec = new Setup_Backend_Schema_Field_Xml('
			<field>
                    <name>receipt_state</name>
                    <type>enum</type>
                    <value>VALID</value>
                    <value>REVERTED</value>
					<value>PARTLYREVERTED</value>
					<value>ISREVERSION</value>
					<value>ISPARTREVERSION</value>
					<default>VALID</default>
                    <notnull>true</notnull>
                </field>
		');
		$this->_backend->alterCol('bill_receipt', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>receipt_state</name>
                    <type>enum</type>
                    <value>VALID</value>
                    <value>REVERTED</value>
					<value>PARTLYREVERTED</value>
					<value>ISREVERSION</value>
					<value>ISPARTREVERSION</value>
					<default>VALID</default>
                    <notnull>true</notnull>
                </field>
						
		');
		$this->_backend->alterCol('bill_receipt_position', $dec);
		
		$this->setApplicationVersion('Billing', '1.992');
	}
	
	public function update_992(){
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>created_datetime</name>
					<type>datetime</type>
					<notnull>false</notnull>
					<default>null</default>
				</field>
		');
		$this->_backend->addCol('bill_debitor_account', $dec);
		
		$this->setApplicationVersion('Billing', '1.993');
	}
	
	public function update_993(){
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_receipt', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_open_item', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_debitor_account', $dec);
		
		$declaration = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>booking_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>'
       );
       $this->_backend->addCol('bill_debitor_account', $declaration);
		
		$this->setApplicationVersion('Billing', '1.994');
	}
	
	public function update_994(){
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
                </field>
	
		');
		$this->_backend->addCol('bill_booking', $dec);
		
		$this->setApplicationVersion('Billing', '1.995');
	}
	
	public function update_995(){
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>batch_job_dta_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
                    <default>null</default>
                </field>
	
		');
		$this->_backend->addCol('bill_payment', $dec);

		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>allow_booking</name>
                    <type>boolean</type>
                    <default>true</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$this->setApplicationVersion('Billing', '1.996');
	}
	
	public function update_996(){
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>creates_donation</name>
                    <type>boolean</type>
					<default>false</default>
			    </field>
		');
		$this->_backend->addCol('bill_article', $dec);

		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>donation_amount</name>
                    <type>float</type>
					<unsigned>false</unsigned>
					<default>0</default>
			    </field>
		');
		$this->_backend->addCol('bill_article', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
					<name>donation_campaign_id</name>
                    <type>text</type>
					<length>40</length>
                    <notnull>false</notnull>
				</field>
		');
		$this->_backend->addCol('bill_article', $dec);
		
		$this->setApplicationVersion('Billing', '1.997');
	}
	
	public function update_997(){
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_context</name>
			</table>
			<field>
				<name>id</name>
				<value>EVENTMANAGER</value>
			</field>
			<field>
				<name>name</name>
				<value>Veranstaltungen</value>
			</field>
			<field>
				<name>application_name</name>
				<value>Eventmanager</value>
			</field>
			<field>
				<name>model_name</name>
				<value>Eventmanager_Model_Event</value>
			</field>
		</record>'));
		 
		$this->_backend->execInsertStatement(new SimpleXMLElement('
		<record>
			<table>
				<name>bill_context</name>
			</table>
			<field>
				<name>id</name>
				<value>FUNDPROJECT</value>
			</field>
			<field>
				<name>name</name>
				<value>Förderprojekte</value>
			</field>
			<field>
				<name>application_name</name>
				<value>FundProject</value>
			</field>
			<field>
				<name>model_name</name>
				<value>FundProject_Model_Project</value>
			</field>
		</record>'));
		
		 $this->setApplicationVersion('Billing', '1.998');
	}
	
	public function update_998(){
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>return_inquiry_fee</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>
		');
		$this->_backend->addCol('bill_payment', $dec);

		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>inquiry_print_date</name>
                    <type>date</type>
                    <notnull>false</notnull>
					<default>null</default>
			    </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_return_debit</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>print_inquiry</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>set_accounts_banktransfer</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>return_debit_base_payment_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_payment', $dec);
		
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>return_inquiry_fee</name>
                    <type>float</type>
					<unsigned>false</unsigned>
                    <notnull>false</notnull>
					<default>0</default>
			    </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);

		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>is_return_debit</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>print_inquiry</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>set_accounts_banktransfer</name>
                    <type>boolean</type>
                    <default>false</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		$dec = new Setup_Backend_Schema_Field_Xml('
				<field>
                    <name>return_debit_base_payment_id</name>
                    <type>integer</type>
                    <notnull>false</notnull>
					<default>null</default>
                </field>
		');
		$this->_backend->addCol('bill_mt940_payment', $dec);
		
		
		$this->setApplicationVersion('Billing', '1.999');
	}
	
	public function update_999(){
		$this->setApplicationVersion('Billing', '2.0');
	}
				
}
?>