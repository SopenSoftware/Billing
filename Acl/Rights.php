<?php
/**
 * Tine 2.0
 * 
 * @package     Addressbook
 * @subpackage  Acl
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @version     $Id: Rights.php 17856 2010-12-14 16:08:21Z l.kneschke@metaways.de $
 * 
 */

/**
 * this class handles the rights for the Addressbook application
 * 
 * a right is always specific to an application and not to a record
 * examples for rights are: admin, run
 * 
 * to add a new right you have to do these 3 steps:
 * - add a constant for the right
 * - add the constant to the $addRights in getAllApplicationRights() function
 * . add getText identifier in getTranslatedRightDescriptions() function
 * 
 * @package     Addressbook
 * @subpackage  Acl
 */
class Billing_Acl_Rights extends Tinebase_Acl_Rights_Abstract
{
	const MANAGE_MANDATORS = 'manage_mandators';
	const MANAGE_ARTICLE_GROUPS = 'manage_article_groups';
	const MANAGE_PRICE_GROUPS = 'manage_price_groups';
	const MANAGE_ARTICLES = 'manage_articles';
	const MANAGE_DEBITORS = 'manage_debitors';
	const MANAGE_CREDITORS = 'manage_creditors';
	const MANAGE_ORDERS = 'manage_orders';
	
	const RESET_RECEIPT = 'reset_receipt';
	const EDITRECEIPT_AFTERPRINT = 'editreceipt_afterprint';
	
	const POS_VIEW_RESTRICTED = 'pos_view_restricted';
	
    /**
     * holds the instance of the singleton
     *
     * @var Billing_Acl_Rights
     */
    private static $_instance = NULL;
    
    /**
     * the clone function
     *
     * disabled. use the singleton
     */
    private function __clone() 
    {        
    }
    
    /**
     * the constructor
     *
     */
    private function __construct()
    {
        
    }    
    
    /**
     * the singleton pattern
     *
     * @return Addressbook_Acl_Rights
     */
    public static function getInstance() 
    {
        if (self::$_instance === NULL) {
            self::$_instance = new Billing_Acl_Rights;
        }
        
        return self::$_instance;
    }
    
    /**
     * get all possible application rights
     *
     * @return  array   all application rights
     */
    public function getAllApplicationRights()
    {
        
        $allRights = parent::getAllApplicationRights();
        
        $addRights = array(
            self::MANAGE_MANDATORS,
            self::MANAGE_ARTICLE_GROUPS,
            self::MANAGE_PRICE_GROUPS,
            self::MANAGE_ARTICLES,
            self::MANAGE_DEBITORS,
            self::MANAGE_CREDITORS,
            self::MANAGE_ORDERS,
            self::RESET_RECEIPT,
            self::EDITRECEIPT_AFTERPRINT,
            self::POS_VIEW_RESTRICTED
        );
        $allRights = array_merge($allRights, $addRights);
        
        return $allRights;
    }

    /**
     * get translated right descriptions
     * 
     * @return  array with translated descriptions for this applications rights
     */
    private function getTranslatedRightDescriptions()
    {
        $translate = Tinebase_Translation::getTranslation('Billing');
        
        $rightDescriptions = array(
            self::MANAGE_MANDATORS => array(
                'text'          => $translate->_('Mandanten verwalten'),
                'description'   => $translate->_('Neue Mandanten anlegen'),
            ),
            self::MANAGE_ARTICLE_GROUPS => array(
                'text'          => $translate->_('Artikelgruppen verwalten'),
                'description'   => $translate->_('Neue Artikelgruppen anlegen'),
            ),
            self::MANAGE_PRICE_GROUPS => array(
                'text'          => $translate->_('Preisgruppen verwalten'),
                'description'   => $translate->_('Neue Preisgruppen anlegen'),
            ),
            self::MANAGE_ARTICLES => array(
                'text'          => $translate->_('Artikel verwalten'),
                'description'   => $translate->_('Neue Artikel anlegen'),
            ),
            self::MANAGE_DEBITORS => array(
                'text'          => $translate->_('Lieferanten verwalten'),
                'description'   => $translate->_('Neue Lieferanten anlegen'),
            ),
            self::MANAGE_CREDITORS => array(
                'text'          => $translate->_('Kreditoren verwalten'),
                'description'   => $translate->_('Neue Kreditoren anlegen'),
            ),
            self::MANAGE_ORDERS => array(
                'text'          => $translate->_('Aufträge verwalten'),
                'description'   => $translate->_('Neue Aufträge anlegen'),
            ),
            self::RESET_RECEIPT => array(
                'text'          => $translate->_('Beleg zurücksetzen'),
                'description'   => $translate->_('Ermöglicht einen bereits gedruckten Beleg zurückzusetzen (und damit erneut druckbar), indem das Druckdatum geleert wird.'),
            ),
            self::EDITRECEIPT_AFTERPRINT => array(
                'text'          => $translate->_('Beleg nach Druck editieren'),
                'description'   => $translate->_('Ermöglicht das Bearbeiten eines Beleges, nachdem dieser bereits gedruckt wurde'),
            ),
            self::POS_VIEW_RESTRICTED => array(
                'text'          => $translate->_('Nur Kassenansicht'),
                'description'   => $translate->_('Der Client stellt nur die Kassenansicht dar'),
            )      
        );
        
        return $rightDescriptions;
    }

    /**
     * get right description
     * 
     * @param   string right
     * @return  array with text + description
     */
    public function getRightDescription($_right)
    {        
        $result = parent::getRightDescription($_right);
        
        $rightDescriptions = self::getTranslatedRightDescriptions();
        
        if ( isset($rightDescriptions[$_right]) ) {
            $result = $rightDescriptions[$_right];
        }

        return $result;
    }
}
