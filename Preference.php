<?php
/**
 * Tine 2.0
 *
 * @package     DocManager
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: Preference.php 14258 2010-05-07 14:46:00Z g.ciyiltepe@metaways.de $
 */


/**
 * backend for DocManager preferences
 *
 * @package     DocManager
 */
class Billing_Preference extends Tinebase_Preference_Abstract
{
	/**************************** application preferences/settings *****************/

	/**
	 * default DocManager all newly created contacts are placed in
	 */
	const TEMPLATE_CALCULATION = 'templateCalcuation';
	const TEMPLATE_BID = 'templateBid';
	const TEMPLATE_CONFIRM = 'templateConfirm';
	const TEMPLATE_SHIPPING = 'templateShipping';
	const TEMPLATE_INVOICE = 'templateInvoice';
	const TEMPLATE_POSINVOICE = 'templatePOSInvoice';
	const TEMPLATE_CREDIT = 'templateCredit';
	const TEMPLATE_MONITION = 'templateMonition';
	const TEMPLATE_MONITION2 = 'templateMonition2';
	const TEMPLATE_MONITION3 = 'templateMonition3';
	
	const TEMPLATE_QUERY = 'templateQuery';
	const TEMPLATE_OFFER = 'templateOffer';
	const TEMPLATE_ORDER = 'templateOrder';
	const TEMPLATE_INCINVOICE = 'templateIncInvoice';
	const TEMPLATE_ARTICLE_SOLD = 'templateArticleSold';
	
	const TEMPLATE_DTA_DEBIT_PREPARE = 'templateDtaDebitPrepare';
	const TEMPLATE_MONITION_PREPARE = 'templateMonitionPrepare';
		
	const TEMPLATE_ACCOUNT_STATEMENT = 'templateAccountStatement';
	
	const POS_DEFAULT_DEBITOR = 'posDefaultDebitor';
	const FIBU_KTO_DEBITOR = 'fibuKtoDebitor';
	const FIBU_KTO_DTA_SETTLE = 'fibuKtoDtaSettle';
	
	const TEMPLATE_DEBIT_RETURN_INQUIRY = 'templateDebitReturnInquiry';
	const DEBIT_RETURN_FEE = 'debitReturnFee';
	const FIBU_KTO_DTA_RETURN_FEE = 'fibuKtoDtaReturnFee';
	const FIBU_INSTANT_BOOK_BILLABLE = 'fibuInstantBookBillable';
	const TEMPLATE_SUM_SALDATION = 'templateSumSaldation';
	
	const TEMPLATE_YEAR_TERMINATION1 = 'templateYearTermination1';
	const TEMPLATE_YEAR_TERMINATION2 = 'templateYearTermination2';

	const MONITION_STAGE1 = 'monitionStage1'; 
	const MONITION_STAGE2 = 'monitionStage2';
	const MONITION_STAGE3 = 'monitionStage3';
	
	const ACTIVE_CONTENT_TYPE = 'activeContentType';
	
	/**
	 * @var string application
	 */
	protected $_application = 'Billing';

	/**************************** public functions *********************************/

	/**
	 * get all possible application prefs
	 *
	 * @return  array   all application prefs
	 */
	public function getAllApplicationPreferences()
	{
		$allPrefs = array(
		self::TEMPLATE_CALCULATION,
		self::TEMPLATE_BID,
		self::TEMPLATE_CONFIRM,
		self::TEMPLATE_SHIPPING,
		self::TEMPLATE_INVOICE,
		self::TEMPLATE_POSINVOICE,
		self::TEMPLATE_CREDIT,
		self::TEMPLATE_MONITION,
		self::TEMPLATE_MONITION2,
		self::TEMPLATE_MONITION3,
		self::TEMPLATE_QUERY,
		self::TEMPLATE_OFFER,
		self::TEMPLATE_ORDER,
		self::TEMPLATE_INCINVOICE,
		self::POS_DEFAULT_DEBITOR,
		self::TEMPLATE_ARTICLE_SOLD,
		self::TEMPLATE_DTA_DEBIT_PREPARE,
		self::TEMPLATE_MONITION_PREPARE,
		self::FIBU_KTO_DEBITOR,
		self::FIBU_KTO_DTA_SETTLE,
		self::TEMPLATE_DEBIT_RETURN_INQUIRY,
		self::TEMPLATE_ACCOUNT_STATEMENT,
		self::DEBIT_RETURN_FEE,
		self::FIBU_KTO_DTA_RETURN_FEE,
		self::FIBU_INSTANT_BOOK_BILLABLE,
		self::TEMPLATE_SUM_SALDATION,
		self::TEMPLATE_YEAR_TERMINATION1,
		self::TEMPLATE_YEAR_TERMINATION2,
		self::MONITION_STAGE1,
		self::MONITION_STAGE2,
		self::MONITION_STAGE3,
		self::ACTIVE_CONTENT_TYPE
		);

		return $allPrefs;
	}

	/**
	 * get translated right descriptions
	 *
	 * @return  array with translated descriptions for this applications preferences
	 */
	public function getTranslatedPreferences()
	{
		//$translate = Tinebase_Translation::getTranslation($this->_application);

		$prefDescriptions = array(
		
		self::POS_DEFAULT_DEBITOR  => array(
                'label'         => 'Standarddebitor Kasse',
                'description'   => '',
		),
		self::TEMPLATE_CALCULATION  => array(
                'label'         => 'Vorlage für Kalkulation',
                'description'   => '',
		),
		self::TEMPLATE_DTA_DEBIT_PREPARE  => array(
                'label'         => 'Vorlage DTA Vorbereitung LS',
                'description'   => '',
		),
		self::TEMPLATE_BID  => array(
                'label'         => 'Vorlage für Angebot',
                'description'   => '',
		),
		self::TEMPLATE_CONFIRM  => array(
                'label'         => 'Vorlage für Auftragsbestätigung',
                'description'   => '',
		),
		self::TEMPLATE_SHIPPING  => array(
                'label'         => 'Vorlage für Lieferschein',
                'description'   => '',
		),
		self::TEMPLATE_INVOICE  => array(
                'label'         => 'Vorlage für Rechnung',
                'description'   => '',
		),
		self::TEMPLATE_POSINVOICE  => array(
                'label'         => 'Vorlage für Kassenbeleg',
                'description'   => '',
		),
		self::TEMPLATE_CREDIT  => array(
                'label'         => 'Vorlage für Gutschrift',
                'description'   => '',
		),
		self::TEMPLATE_MONITION => array(
                'label'         => 'Vorlage für Mahnung Stufe1',
                'description'   => '',
		),
		self::TEMPLATE_MONITION2 => array(
                'label'         => 'Vorlage für Mahnung Stufe2',
                'description'   => '',
		),
		self::TEMPLATE_MONITION3 => array(
                'label'         => 'Vorlage für Mahnung Stufe3',
                'description'   => '',
		),
		self::TEMPLATE_QUERY  => array(
                'label'         => 'Vorlage für Lieferantenanfrage',
                'description'   => '',
		),
		self::TEMPLATE_OFFER  => array(
                'label'         => 'Vorlage für Kostenangebot',
                'description'   => '',
		),
		self::TEMPLATE_ORDER  => array(
                'label'         => 'Vorlage für Lieferantenbestellung',
                'description'   => '',
		),
		self::TEMPLATE_INCINVOICE  => array(
                'label'         => 'Vorlage für Eingangsrechnung Lieferant',
                'description'   => '',
		),
		self::TEMPLATE_ARTICLE_SOLD  => array(
                'label'         => 'Vorlage Artikel-Verkaufsliste',
                'description'   => '',
		),
		self::FIBU_KTO_DEBITOR  => array(
                'label'         => 'FIBU-Kto Forderungen/Debitor',
                'description'   => '',
		),
		self::FIBU_KTO_DTA_SETTLE  => array(
                'label'         => 'FIBU-Kto Lastschriftverrechnung',
                'description'   => '',
		),
		self::FIBU_KTO_DTA_RETURN_FEE  => array(
                'label'         => 'FIBU-Kto Rücklastschriftgebühr',
                'description'   => '',
		),
		self::TEMPLATE_DEBIT_RETURN_INQUIRY  => array(
                'label'         => 'Vorlage LS-Nachforschung',
                'description'   => '',
		),
		self::TEMPLATE_ACCOUNT_STATEMENT  => array(
                'label'         => 'Vorlage Kontoauszüge',
                'description'   => '',
		),
		
		self::DEBIT_RETURN_FEE  => array(
                'label'         => 'Gebühr Rücklastschrift',
                'description'   => '',
		),
		
		self::FIBU_INSTANT_BOOK_BILLABLE  => array(
                'label'         => 'FIBU: Rechnung sofort buchen',
                'description'   => '',
		),
		
		self::TEMPLATE_SUM_SALDATION  => array(
                'label'         => 'FIBU: Template Susa',
                'description'   => '',
		),
		
		self::TEMPLATE_YEAR_TERMINATION1  => array(
                'label'         => 'FIBU: Template Auswertung Beiträge/Spenden',
                'description'   => '',
		),
		
		self::TEMPLATE_YEAR_TERMINATION2  => array(
                'label'         => 'FIBU: Template Auswertung OPs',
                'description'   => '',
		),
		
		self::TEMPLATE_MONITION_PREPARE  => array(
                'label'         => 'Vorlage Vorbereitung/Protokoll Mahnungen',
                'description'   => '',
		),
		
		self::MONITION_STAGE1  => array(
                'label'         => 'Mahnstufe 1 nach Tagen',
                'description'   => '',
		),
		
		self::MONITION_STAGE2  => array(
                'label'         => 'Mahnstufe 2 nach Tagen',
                'description'   => '',
		),
		
		self::MONITION_STAGE3  => array(
                'label'         => 'Mahnstufe 3 nach Tagen',
                'description'   => '',
		),
		
		self::ACTIVE_CONTENT_TYPE  => array(
                'label'         => 'Angezeigte Tabelle bei Start',
                'description'   => '',
		)
		
		);

		return $prefDescriptions;
	}

	/**
	 * get preference defaults if no default is found in the database
	 *
	 * @param string $_preferenceName
	 * @return Tinebase_Model_Preference
	 */
	public function getPreferenceDefaults($_preferenceName, $_accountId=NULL, $_accountType=Tinebase_Acl_Rights::ACCOUNT_TYPE_USER)
	{
		$preference = $this->_getDefaultBasePreference($_preferenceName);
		switch($_preferenceName) {
			case self::TEMPLATE_CALCULATION:
			case self::TEMPLATE_BID:
			case self::TEMPLATE_CONFIRM:
			case self::TEMPLATE_SHIPPING:
			case self::TEMPLATE_INVOICE:
			case self::TEMPLATE_POSINVOICE:
			case self::TEMPLATE_CREDIT:
			case self::TEMPLATE_MONITION:
			case self::TEMPLATE_MONITION2:
			case self::TEMPLATE_MONITION3:
			case self::TEMPLATE_QUERY:
			case self::TEMPLATE_OFFER:
			case self::TEMPLATE_ORDER:
			case self::TEMPLATE_INCINVOICE:	
			case self::POS_DEFAULT_DEBITOR:	
			case self::TEMPLATE_ARTICLE_SOLD:
			case self::TEMPLATE_DTA_DEBIT_PREPARE:
			case self::TEMPLATE_MONITION_PREPARE:
			case self::FIBU_KTO_DEBITOR:
			case self::FIBU_KTO_DTA_SETTLE:
			case self::TEMPLATE_DEBIT_RETURN_INQUIRY:
			case self::DEBIT_RETURN_FEE:
			case self::FIBU_KTO_DTA_RETURN_FEE:
			case self::TEMPLATE_ACCOUNT_STATEMENT:
			case self::FIBU_INSTANT_BOOK_BILLABLE:
			case self::TEMPLATE_SUM_SALDATION:
			case self::TEMPLATE_YEAR_TERMINATION1:
			case self::TEMPLATE_YEAR_TERMINATION2:
			case self::MONITION_STAGE1:
			case self::MONITION_STAGE2:
			case self::MONITION_STAGE3:
			case self::ACTIVE_CONTENT_TYPE:
				
				
				/*$accountId          = $_accountId ? $_accountId : Tinebase_Core::getUser()->getId();
				 $DocManagers       = Tinebase_Container::getInstance()->getPersonalContainer($accountId, 'DocManager', $accountId, 0, true);
				 $preference->value  = $DocManagers->getFirstRecord()->getId();
				 $preference->personal_only = TRUE;
				 */
				break;
			default:
				throw new Tinebase_Exception_NotFound('Default preference with name ' . $_preferenceName . ' not found.');
		}

		return $preference;
	}

	/**
	 * get special options
	 *
	 * @param string $_value
	 * @return array
	 */
	protected function _getSpecialOptions($_value)
	{
		$result = array();
		switch($_value) {
			case self::TEMPLATE_CALCULATION:
			case self::TEMPLATE_BID:
			case self::TEMPLATE_CONFIRM:
			case self::TEMPLATE_SHIPPING:
			case self::TEMPLATE_INVOICE:
			case self::TEMPLATE_POSINVOICE:
			case self::TEMPLATE_CREDIT:
			case self::TEMPLATE_MONITION:
			case self::TEMPLATE_MONITION2:
			case self::TEMPLATE_MONITION3:
			case self::TEMPLATE_QUERY:
			case self::TEMPLATE_OFFER:
			case self::TEMPLATE_ORDER:
			case self::TEMPLATE_INCINVOICE:		
			case self::TEMPLATE_ARTICLE_SOLD:	
			case self::TEMPLATE_DTA_DEBIT_PREPARE:	
			case self::TEMPLATE_MONITION_PREPARE:				
			case self::TEMPLATE_DEBIT_RETURN_INQUIRY:	
			case self::TEMPLATE_ACCOUNT_STATEMENT:
			case self::TEMPLATE_SUM_SALDATION:
			case self::TEMPLATE_YEAR_TERMINATION1:
			case self::TEMPLATE_YEAR_TERMINATION2:
				$templates = DocManager_Controller_Template::getInstance()->getAll();
				foreach ($templates as $template) {
					$result[] = array($template->getId(), $template->__get('name'));
				}
				break;
			case self::POS_DEFAULT_DEBITOR:
				$result[] = array();
				
				/*$debitors = Billing_Controller_Debitor::getInstance()->getAll();
				foreach ($debitors as $debitor) {
					$result[] = array($debitor->getId(), $debitor->__get('debitor_nr'));
				}*/
				break;
			case self::FIBU_KTO_DEBITOR:
			case self::FIBU_KTO_DTA_SETTLE:		
			case self::FIBU_KTO_DTA_RETURN_FEE:		
				$ktos = Billing_Controller_AccountSystem::getInstance()->getAll();
				foreach ($ktos as $kto) {
					$result[] = array($kto->getId(), $kto->__get('number').' '.$kto->__get('name'));
				}
				break;
			case self::DEBIT_RETURN_FEE:
				case self::MONITION_STAGE1:
				case self::MONITION_STAGE2:
				case self::MONITION_STAGE3:
				$result = array();
				break;
			case self::FIBU_INSTANT_BOOK_BILLABLE:
				$result = array(
					array(0, 'Nein'),
					array(1, 'Ja')
				);
				break;
			case self::ACTIVE_CONTENT_TYPE:
				$result = array(
					array('Invoice', 'Rechnungen'),
					array('OpenItem', 'Offene Posten'),
					array('SepaMandate', 'Sepa-Mandate')
				);
				break;	
			default:
				$result = parent::_getSpecialOptions($_value);
		}

		return $result;
	}
}
