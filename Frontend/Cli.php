 <?php
/**
 * Tine 2.0
 * @package     Billing
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Hans-Jürgen Hartl <hhartl@sopen.de>
 * @copyright   Copyright (c) 2010 sopen GmbH (http://www.sopen.de)
 * @version     $Id: Cli.php  $
 * 
 */

/**
 * cli server for Billing
 *
 * This class handles cli requests for the Billing
 *
 * @package     Billing
 */
class Billing_Frontend_Cli extends Tinebase_Frontend_Cli_Abstract
{
    /**
     * the internal name of the application
     *
     * @var string
     */
    protected $_applicationName = 'Billing';
    
    /**
     * import config filename
     *
     * @var string
     */
    protected $_configFilename = 'importconfig.inc.php';

    /**
     * help array with function names and param descriptions
     */
    
/**
     * import contacts
     *
     * @param Zend_Console_Getopt $_opts
     */
    public function importBanks($_opts)
    {
    	set_time_limit(0);
        parent::_import($_opts, Billing_Controller_Bank::getInstance());        
    }

    /**
     * import brevets
     *
     * @param Zend_Console_Getopt $_opts
     */
    public function importArticles($_opts)
    {
    	set_time_limit(0);
        parent::_import($_opts, Billing_Controller_Article::getInstance());        
    }
}
