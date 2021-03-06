<?php

/**
 * class to hold Brevet data
 *
 * @package     Billing
 */
class Billing_Model_SupplyReceipt extends Tinebase_Record_Abstract
{
    /**
     * key in $_validators/$_properties array for the filed which
     * represents the identifier
     *
     * @var string
     */
    protected $_identifier = 'id';
    
    /**
     * application the record belongs to
     *
     * @var string
     */
    protected $_application = 'Billing';
    
    /**
     * list of zend validator
     *
     * this validators get used when validating user generated content with Zend_Input_Filter
     *
     * @var array
     *
     */
    protected $_validators = array(
        'id'                    => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => NULL),
    	'supply_order_id'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'type'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supplier_order_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supply_request_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supply_offer_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supply_order_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'supply_inc_inv_nr'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_percentage'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'discount_total'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'request_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'offer_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'offer_shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'shipping_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_confirm_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'order_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'inc_invoice_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'inc_invoice_postal_date'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'upper_textblock'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'lower_textblock'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'shipping_conditions'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
	    'payment_conditions'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'shipping_address'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'order_state'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// modlog
       	'created_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'creation_time'         => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_by'      => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'last_modified_time'    => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'is_deleted'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_time'          => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'deleted_by'            => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	// tags, notes etc.
    	'tags'                  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'notes'                 => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        //'relations'             => array(Zend_Filter_Input::ALLOW_EMPTY => true),
        'customfields'          => array(Zend_Filter_Input::ALLOW_EMPTY => true, Zend_Filter_Input::DEFAULT_VALUE => array()),
    	'preview_template_id'  => array(Zend_Filter_Input::ALLOW_EMPTY => true),
    	'template_id'          => array(Zend_Filter_Input::ALLOW_EMPTY => true)
    );
    protected $_dateFields = array(
     	// modlog
     	'creation_time',
        'last_modified_time',
        'deleted_time',
        //
	    'request_date',
	    'offer_date',
	    'offer_shipping_date',
	    'order_shipping_date',
	    'shipping_date',
	    'order_confirm_date',
	    'order_date',
	    'inc_invoice_date',
	    'inc_invoice_postal_date'
    );
    
	public function setFromArray(array $_data)
	{
		if(empty($_data['order_nr']) || $_data['order_nr']==""){
			unset($_data['order_nr']);
		}
		if(empty($_data['supplier_order_nr']) || $_data['supplier_order_nr']==""){
			unset($_data['supplier_order_nr']);
		}
		if(empty($_data['supply_request_nr']) || $_data['supply_request_nr']==""){
			unset($_data['supply_request_nr']);
		}
		if(empty($_data['supply_offer_nr']) || $_data['supply_offer_nr']==""){
			unset($_data['supply_offer_nr']);
		}		
		if(empty($_data['supply_order_nr']) || $_data['supply_order_nr']==""){
			unset($_data['supply_order_nr']);
		}				
		
		if(empty($_data['supply_inc_inv_nr']) || $_data['supply_inc_inv_nr']==""){
			unset($_data['supply_inc_inv_nr']);
		}				

		if(empty($_data['request_date']) || $_data['request_date']==""){
			unset($_data['request_date']);
		}
		if(empty($_data['offer_date']) || $_data['offer_date']==""){
			unset($_data['offer_date']);
		}
		if(empty($_data['offer_shipping_date']) || $_data['offer_shipping_date']==""){
			unset($_data['offer_shipping_date']);
		}
		if(empty($_data['order_shipping_date']) || $_data['order_shipping_date']==""){
			unset($_data['order_shipping_date']);
		}
		
		if(empty($_data['shipping_date']) || $_data['shipping_date']==""){
			unset($_data['shipping_date']);
		}
		if(empty($_data['order_confirm_date']) || $_data['order_confirm_date']==""){
			unset($_data['order_confirm_date']);
		}
		
		if(empty($_data['order_date']) || $_data['order_date']==""){
			unset($_data['order_date']);
		}
		if(empty($_data['inc_invoice_date']) || $_data['inc_invoice_date']==""){
			unset($_data['inc_invoice_date']);
		}
		
		if(empty($_data['inc_invoice_postal_date']) || $_data['inc_invoice_postal_date']==""){
			unset($_data['inc_invoice_postal_date']);
		}
		
		parent::setFromArray($_data);
	}

	protected function _setFromJson(array &$_data)
	{
	if(empty($_data['order_nr']) || $_data['order_nr']==""){
			unset($_data['order_nr']);
		}
		if(empty($_data['supplier_order_nr']) || $_data['supplier_order_nr']==""){
			unset($_data['supplier_order_nr']);
		}
		if(empty($_data['supply_request_nr']) || $_data['supply_request_nr']==""){
			unset($_data['supply_request_nr']);
		}
		if(empty($_data['supply_offer_nr']) || $_data['supply_offer_nr']==""){
			unset($_data['supply_offer_nr']);
		}		
		if(empty($_data['supply_order_nr']) || $_data['supply_order_nr']==""){
			unset($_data['supply_order_nr']);
		}				
		
		if(empty($_data['supply_inc_inv_nr']) || $_data['supply_inc_inv_nr']==""){
			unset($_data['supply_inc_inv_nr']);
		}				

		if(empty($_data['request_date']) || $_data['request_date']==""){
			unset($_data['request_date']);
		}
		if(empty($_data['offer_date']) || $_data['offer_date']==""){
			unset($_data['offer_date']);
		}
		if(empty($_data['offer_shipping_date']) || $_data['offer_shipping_date']==""){
			unset($_data['offer_shipping_date']);
		}
		if(empty($_data['order_shipping_date']) || $_data['order_shipping_date']==""){
			unset($_data['order_shipping_date']);
		}
		
		if(empty($_data['shipping_date']) || $_data['shipping_date']==""){
			unset($_data['shipping_date']);
		}
		if(empty($_data['order_confirm_date']) || $_data['order_confirm_date']==""){
			unset($_data['order_confirm_date']);
		}
		
		if(empty($_data['order_date']) || $_data['order_date']==""){
			unset($_data['order_date']);
		}
		if(empty($_data['inc_invoice_date']) || $_data['inc_invoice_date']==""){
			unset($_data['inc_invoice_date']);
		}
		
		if(empty($_data['inc_invoice_postal_date']) || $_data['inc_invoice_postal_date']==""){
			unset($_data['inc_invoice_postal_date']);
		}
	}
}





