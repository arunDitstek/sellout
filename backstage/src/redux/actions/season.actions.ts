import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import {
  ISeasonGraphQL,
  SeasonAgeEnum,
  SendQRCodeEnum,
} from "@sellout/models/.dist/interfaces/ISeason";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
export const SeasonActionTypes = {
  // Active Ids
  SET_SEASON_ID: "SET_SEASON_ID",
  SET_SEASON_NAME: "SET_SEASON_NAME",
  SET_SEASON_SUBTITLE: "SET_SEASON_SUBTITLE",
  SET_SEASON_VENUE_ID: "SET_SEASON_VENUE_ID",
  SET_SEASON_DESCRIPTION: "SET_SEASON_DESCRIPTION",
  SET_SEASON_AGE: "SET_SEASON_AGE",
  SET_SEASON_PERFORMANCE_SONG_LINK: "SET_SEASON_PERFORMANCE_SONG_LINK",
  SET_SEASON_PERFORMANCE_VIDEO_LINK: "SET_SEASON_PERFORMANCE_VIDEO_LINK",
  SET_SEASON_PUBLISHABLE: "SET_SEASON_PUBLISHABLE",
  SET_SEASON_POSTER_IMAGE_URL: "SET_SEASON_POSTER_IMAGE_URL",
  SET_SEASON_SCHEDULE_ANNOUNCE_AT: "SET_SEASON_SCHEDULE_ANNOUNCE_AT",
  SET_SEASON_SCHEDULE_TICKETS_AT: "SET_SEASON_SCHEDULE_TICKETS_AT",
  SET_SEASON_SCHEDULE_TICKETS_END_AT: "SET_SEASON_SCHEDULE_TICKETS_END_AT",
  SET_SEASON_SCHEDULE_STARTS_AT: "SET_SEASON_SCHEDULE_STARTS_AT",
  SET_SEASON_SCHEDULE_ENDS_AT: "SET_SEASON_SCHEDULE_ENDS_AT",
  SET_SEASON_SEND_QR_CODE: "SET_SEASON_SEND_QR_CODE",
  SET_SEASON_SEATING_CHART_FIELDS: "SET_SEASON_SEATING_CHART_FIELDS",
  SELECT_SEASON_SEATING_CHART: "SELECT_SEASON_SEATING_CHART",
  SELECT_CREATE_SEASON_SEATING_CHART: "SELECT_CREATE_SEASON_SEATING_CHART",
  SET_SEASON_SEATING_CHART_KEY: "SET_SEASON_SEATING_CHART_KEY",
  CLEAR_SEASON_SEATING_CHART_FIELDS: "CLEAR_SEASON_SEATING_CHART_FIELDS",
  SET_SEASON_TAX_DEDUCTION: "SET_SEASON_TAX_DEDUCTION",
  SET_SEASON_SALES_BEGIN_IMMEDIATELY: "SET_SEASON_SALES_BEGIN_IMMEDIATELY",
  // Ticket Type
  SET_SEASON_TICKET_TYPE_ID: "SET_SEASON_TICKET_TYPE_ID",
  SET_SEASON_TICKET_TYPE: "SET_SEASON_TICKET_TYPE",
  ADD_SEASON_TICKET_TYPE: "ADD_SEASON_TICKET_TYPE",
  REMOVE_SEASON_TICKET_TYPE: "REMOVE_SEASON_TICKET_TYPE",
  SET_SEASON_TICKET_TYPE_VISIBLE: "SET_SEASON_TICKET_TYPE_VISIBLE",
  MOVE_SEASON_TICKET_TYPE_UP: "MOVE_SEASON_TICKET_TYPE_UP",
  MOVE_SEASON_TICKET_TYPE_DOWN: "MOVE_SEASON_TICKET_TYPE_DOWN",
  SET_SEASON_TICKET_TYPE_NAME: "SET_SEASON_TICKET_TYPE_NAME",
  SET_SEASON_TICKET_TYPE_QTY: "SET_SEASON_TICKET_TYPE_QTY",
  SET_SEASON_TICKET_TYPE_PURCHASE_LIMIT:
    "SET_SEASON_TICKET_TYPE_PURCHASE_LIMIT",
  SET_SEASON_TICKET_TYPE_DESCRIPTION: "SET_SEASON_TICKET_TYPE_DESCRIPTION",
  SET_SEASON_TICKET_TYPE_VALUES: "SET_SEASON_TICKET_TYPE_VALUES",
  ADD_SEASON_DAYS_ON_TICKET_TYPE: "ADD_SEASON_DAYS_ON_TICKET_TYPE",
  REMOVE_SEASON_DAYS_ON_TICKET_TYPE: "REMOVE_SEASON_DAYS_ON_TICKET_TYPE",
  // Upgrade
  SET_UPGRADE_TYPE_ID: "SET_UPGRADE_TYPE_ID",
  ADD_UPGRADE_TYPE: "ADD_UPGRADE_TYPE",
  REMOVE_UPGRADE_TYPE: "REMOVE_UPGRADE_TYPE",
  SET_UPGRADE_TYPE_VISIBLE: "SET_UPGRADE_TYPE_VISIBLE",
  MOVE_UPGRADE_TYPE_UP: "MOVE_UPGRADE_TYPE_UP",
  MOVE_UPGRADE_TYPE_DOWN: "MOVE_UPGRADE_TYPE_DOWN",
  SET_UPGRADE_TYPE: "SET_UPGRADE_TYPE",
  ADD_UPGRADE_TYPE_TICKET_TYPE_ID: "ADD_UPGRADE_TYPE_TICKET_TYPE_ID",
  REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID: "REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID",
  // Promotion
  SET_PROMOTION_ID: "SET_PROMOTION_ID",
  ADD_PROMOTION: "ADD_PROMOTION",
  REMOVE_PROMOTION: "REMOVE_PROMOTION",
  SET_PROMOTION_ACTIVE: "SET_PROMOTION_ACTIVE",
  MOVE_PROMOTION_UP: "MOVE_PROMOTION_UP",
  MOVE_PROMOTION_DOWN: "MOVE_PROMOTION_DOWN",
  SET_PROMOTION: "SET_PROMOTION",
  ADD_PROMOTION_TICKET_TYPE_ID: "ADD_PROMOTION_TICKET_TYPE_ID",
  REMOVE_PROMOTION_TICKET_TYPE_ID: "REMOVE_PROMOTION_TICKET_TYPE_ID",
  // Custom Field
  ADD_CUSTOM_FIELD: "ADD_CUSTOM_FIELD",
  REMOVE_SEASON_CUSTOM_FIELD: "REMOVE_SEASON_CUSTOM_FIELD",
  SET_CUSTOM_FIELD_ACTIVE: "SET_CUSTOM_FIELD_ACTIVE",
  MOVE_CUSTOM_FIELD_UP: "MOVE_CUSTOM_FIELD_UP",
  MOVE_CUSTOM_FIELD_DOWN: "MOVE_CUSTOM_FIELD_DOWN",
  SET_CUSTOM_FIELD: "SET_CUSTOM_FIELD",
  ADD_CUSTOM_FIELD_OPTION: "ADD_CUSTOM_FIELD_OPTION",
  REMOVE_CUSTOM_FIELD_OPTION: "REMOVE_CUSTOM_FIELD_OPTION",
  SET_CUSTOM_FIELD_OPTION: "SET_CUSTOM_FIELD_OPTION",
  SET_CUSTOM_FIELD_ID: "SET_CUSTOM_FIELD_ID",

  SET_SEASON_USER_AGREEMENT: "SET_SEASON_USER_AGREEMENT",
  // Save Event
  SAVE_SEASON: "SAVE_SEASON",
  NAVIGATE_PREVIOUS_STEP: "NAVIGATE_PREVIOUS_STEP",
  NAVIGATE_NEXT_STEP: "NAVIGATE_NEXT_STEP",
  // Create Season
  CREATE_SEASON_REQUEST: "CREATE_SEASON_REQUEST",
  CREATE_SEASON_SUCCESS: "CREATE_SEASON_SUCCESS",
  CREATE_SEASON_FAILURE: "CREATE_SEASON_FAILURE",
  // Update Season
  UPDATE_SEASON_REQUEST: "UPDATE_SEASON_REQUEST",
  UPDATE_SEASON_SUCCESS: "UPDATE_SEASON_SUCCESS",
  UPDATE_SEASON_FAILURE: "UPDATE_SEASON_FAILURE",
  // Publish Season
  PUBLISH_SEASON: "PUBLISH_SEASON",
  PUBLISH_SEASON_REQUEST: "PUBLISH_SEASON_REQUEST",
  PUBLISH_SEASON_SUCCESS: "PUBLISH_SEASON_SUCCESS",
  PUBLISH_SEASON_FAILURE: "PUBLISH_SEASON_FAILURE",
  // Cache Seasons
  CACHE_SEASONS: "CACHE_SEASONS",
  RE_CACHE_SEASON: "RE_CACHE_SEASON",
  RE_CACHE_TICKET_TYPE: "RE_CACHE_TICKET_TYPE",
  RE_CACHE_UPGRADE_TYPE: "RE_CACHE_UPGRADE_TYPE",
  RE_CACHE_PROMOTION: "RE_CACHE_PROMOTION",
  RE_CACHE_CUSTOM_FIELD: "RE_CACHE_CUSTOM_FIELD",
  // CREATE_SEASON_SUCCESS: "CREATE_SEASON_SUCCESS",
  // CREATE_SEASON_FAILURE: "CREATE_SEASON_FAILURE",
  // REMOVE_SEASON_DAYS_ON_TICKET_TYPE: "REMOVE_SEASON_DAYS_ON_TICKET_TYPE",
  // ADD_SEASON_DAYS_ON_TICKET_TYPE: "ADD_SEASON_DAYS_ON_TICKET_TYPE",
  // Ticket Type Tier
  SET_SEASON_TICKET_TYPE_TIER: "SET_SEASON_TICKET_TYPE_TIER",
  SET_SEASON_IS_USING_PRICING_TIERS: "SET_SEASON_IS_USING_PRICING_TIERS",
  SET_SEASON_TICKET_TYPE_TIER_ENDS_AT: "SET_SEASON_TICKET_TYPE_TIER_ENDS_AT",
  ADD_SEASON_TICKET_TYPE_TIER: "ADD_SEASON_TICKET_TYPE_TIER",
  REMOVE_SEASON_TICKET_TYPE_TIER: "REMOVE_SEASON_TICKET_TYPE_TIER",
};

/********************************************************************************
 *  Season Action Creators
 *******************************************************************************/

export type SeasonActionCreatorTypes =
  // Active Ids
  | SetSeasonIdAction
  | SetSeasonNameAction
  | SetSeasonSubtitleAction
  | SetSeasonVenueIdAction
  | SetSeasonDescriptionAction
  | SetSeasonAgeAction
  | SetSeasonPerformanceSongLinkAction
  | setSeasonPerformanceVideoLinkAction
  | setSeasonPublishableAction
  | SetSeasonPosterImageUrlAction
  | SetSeasonScheduleAnnounceAtAction
  | SetSeasonScheduleTicketsAtAction
  | SetSeasonScheduleTicketsEndAtAction
  | SetSeasonScheduleStartsAtAction
  | SetSeasonScheduleEndsAtAction
  | SetSeasonSendQRCodeAction
  | SetUpgradeTypeIdAction
  | SetSeasonSeatingChartFieldsAction
  | SelectSeasonSeatingChartAction
  | SetSeasonSeatingChartKeyAction
  | ClearSeasonSeatingChartFieldsAction
  | SetTicketTypeIdAction
  | SetSeasonUserAgreementAction
  | SetSeasonTaxDeductionAction
  | SetSeasonSalesBeginImmediatelyAction
  // Promotion
  | SetPromotionIdAction
  | SetPromotionAction
  | AddPromotionAction
  | RemovePromotionAction
  | SetPromotionActiveAction
  | MovePromotionUpAction
  | MovePromotionDownAction
  | AddPromotionTicketTypeIdAction
  | RemovePromotionTicketTypeIdAction
  // Create Event
  | CreateSeasonRequestAction
  | CreateSeasonSuccessAction
  | CreateSeasonFailureAction
  // Update Event
  | UpdateSeasonRequestAction
  | UpdateSeasonSuccessAction
  | UpdateSeasonFailureAction
  // Publish Event
  | PublishSeasonAction
  | PublishSeasonRequestAction
  | PublishSeasonSuccessAction
  | PublishSeasonFailureAction
  // Custom Field
  | SetCustomFieldAction
  | AddCustomFieldAction
  | RemoveSeasonCustomFieldAction
  | SetCustomFieldActiveAction
  | MoveCustomFieldUpAction
  | MoveCustomFieldDownAction
  | AddCustomFieldOptionAction
  | RemoveCustomFieldOptionAction
  | SetCustomFieldOptionAction
  | SetCustomFieldIdAction
  // Cache Season
  | ReCacheSeasonAction
  | ReCacheTicketTypeAction
  | ReCacheUpgradeTypeAction
  | ReCacheCustomFieldAction
  | CacheSeasonsAction
  // Ticket Type
  | SetTicketTypeAction
  | AddSeasonTicketTypeAction
  | RemoveTicketTypeAction
  | SetTicketTypeVisibleAction
  | MoveTicketTypeUpAction
  | MoveTicketTypeDownAction
  | SetTicketTypeNameAction
  | SetTicketTypeQtyAction
  | SetTicketTypePurchaseLimitAction
  | SetTicketTypeDescriptionAction;

/********************************************************************************
 *  Set Season ID
 *******************************************************************************/
export interface SetSeasonIdAction {
  type: typeof SeasonActionTypes.SET_SEASON_ID;
  payload: {
    seasonId: string;
    replace: boolean;
  };
}

export function setSeasonId(
  seasonId: string,
  replace: boolean = false
): SetSeasonIdAction {
  return {
    type: SeasonActionTypes.SET_SEASON_ID,
    payload: {
      seasonId,
      replace,
    },
  };
}

/********************************************************************************
 *  Set Custom Field ID
 *******************************************************************************/
export interface SetCustomFieldIdAction {
  type: typeof SeasonActionTypes.SET_CUSTOM_FIELD_ID;
  payload: {
    customFieldId: string;
  };
}

export function setCustomFieldId(
  customFieldId: string
): SetCustomFieldIdAction {
  return {
    type: SeasonActionTypes.SET_CUSTOM_FIELD_ID,
    payload: {
      customFieldId,
    },
  };
}
/************************************************************
 *  Season Name
 ***********************************************************/
export interface SetSeasonNameAction {
  type: typeof SeasonActionTypes.SET_SEASON_NAME;
  payload: {
    seasonId: string;
    name: string;
  };
}

export function setSeasonName(
  seasonId: string,
  name: string
): SetSeasonNameAction {
  return {
    type: SeasonActionTypes.SET_SEASON_NAME,
    payload: {
      seasonId,
      name,
    },
  };
}

/************************************************************
 *  Season Subtitle
 ***********************************************************/
export interface SetSeasonSubtitleAction {
  type: typeof SeasonActionTypes.SET_SEASON_SUBTITLE;
  payload: {
    seasonId: string;
    subtitle: string;
  };
}

export function setSeasonSubtitle(
  seasonId: string,
  subtitle: string
): SetSeasonSubtitleAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SUBTITLE,
    payload: {
      seasonId,
      subtitle,
    },
  };
}

/************************************************************
 *  Season Venue ID
 ***********************************************************/
export interface SetSeasonVenueIdAction {
  type: typeof SeasonActionTypes.SET_SEASON_VENUE_ID;
  payload: {
    seasonId: string;
    venueId: string;
  };
}

export function setSeasonVenueId(
  seasonId: string,
  venueId: string
): SetSeasonVenueIdAction {
  return {
    type: SeasonActionTypes.SET_SEASON_VENUE_ID,
    payload: {
      seasonId,
      venueId,
    },
  };
}

/************************************************************
 *  Season Description
 ***********************************************************/
export interface SetSeasonDescriptionAction {
  type: typeof SeasonActionTypes.SET_SEASON_DESCRIPTION;
  payload: {
    seasonId: string;
    description: string;
  };
}

export function setSeasonDescription(
  seasonId: string,
  description: string
): SetSeasonDescriptionAction {
  return {
    type: SeasonActionTypes.SET_SEASON_DESCRIPTION,
    payload: {
      seasonId,
      description,
    },
  };
}

/************************************************************
 *  Season Age
 ***********************************************************/
export interface SetSeasonAgeAction {
  type: typeof SeasonActionTypes.SET_SEASON_AGE;
  payload: {
    seasonId: string;
    age: SeasonAgeEnum;
  };
}

export function setSeasonAge(
  seasonId: string,
  age: SeasonAgeEnum
): SetSeasonAgeAction {
  return {
    type: SeasonActionTypes.SET_SEASON_AGE,
    payload: {
      seasonId,
      age,
    },
  };
}

/************************************************************
 Performance Song Link
 ***********************************************************/

export interface SetSeasonPerformanceSongLinkAction {
  type: typeof SeasonActionTypes.SET_SEASON_PERFORMANCE_SONG_LINK;
  payload: {
    seasonId: string;
    performanceId: string;
    songLink: string;
  };
}

export function setSeasonPerformanceSongLink(
  seasonId: string,
  performanceId: string,
  songLink: string
): SetSeasonPerformanceSongLinkAction {
  return {
    type: SeasonActionTypes.SET_SEASON_PERFORMANCE_SONG_LINK,
    payload: {
      seasonId,
      performanceId,
      songLink,
    },
  };
}

/************************************************************
 Performance Video Link
 ***********************************************************/

export interface setSeasonPerformanceVideoLinkAction {
  type: typeof SeasonActionTypes.SET_SEASON_PERFORMANCE_VIDEO_LINK;
  payload: {
    seasonId: string;
    performanceId: string;
    videoLink: string;
  };
}

export function setSeasonPerformanceVideoLink(
  seasonId: string,
  performanceId: string,
  videoLink: string
): setSeasonPerformanceVideoLinkAction {
  return {
    type: SeasonActionTypes.SET_SEASON_PERFORMANCE_VIDEO_LINK,
    payload: {
      seasonId,
      performanceId,
      videoLink,
    },
  };
}



/************************************************************
 Publish on Sellout.io website
***********************************************************/

export interface setSeasonPublishableAction {
  type: typeof SeasonActionTypes.SET_SEASON_PUBLISHABLE;
  payload: {
    seasonId: string;
    publishable: boolean;
  };
}

export function setSeasonPublishable(
  seasonId: string,
  publishable: boolean
): setSeasonPublishableAction {
  return {
    type: SeasonActionTypes.SET_SEASON_PUBLISHABLE,
    payload: {
      seasonId,
      publishable
    },
  };
}

/************************************************************
 *  Season Poster Image Url
 ***********************************************************/
export interface SetSeasonPosterImageUrlAction {
  type: typeof SeasonActionTypes.SET_SEASON_POSTER_IMAGE_URL;
  payload: {
    seasonId: string;
    posterImageUrl: string;
  };
}

export function setSeasonPosterImageUrl(
  seasonId: string,
  posterImageUrl: string
): SetSeasonPosterImageUrlAction {
  return {
    type: SeasonActionTypes.SET_SEASON_POSTER_IMAGE_URL,
    payload: {
      seasonId,
      posterImageUrl,
    },
  };
}

/************************************************************
 *  Season Annouce At
 ***********************************************************/

export interface SetSeasonScheduleAnnounceAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_SCHEDULE_ANNOUNCE_AT;
  payload: {
    seasonId: string;
    announceAt: number;
  };
}

export function setSeasonScheduleAnnounceAt(
  seasonId: string,
  announceAt: number
): SetSeasonScheduleAnnounceAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SCHEDULE_ANNOUNCE_AT,
    payload: {
      seasonId,
      announceAt,
    },
  };
}

/************************************************************
 *  Season Tickets At
 ***********************************************************/

export interface SetSeasonScheduleTicketsAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_AT;
  payload: {
    seasonId: string;
    ticketsAt: number;
  };
}

export function setSeasonScheduleTicketsAt(
  seasonId: string,
  ticketsAt: number
): SetSeasonScheduleTicketsAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_AT,
    payload: {
      seasonId,
      ticketsAt,
    },
  };
}

/************************************************************
 *  Season Tickets End At
 ***********************************************************/

export interface SetSeasonScheduleTicketsEndAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_END_AT;
  payload: {
    seasonId: string;
    ticketsEndAt: number;
  };
}

export function setSeasonScheduleTicketsEndAt(
  seasonId: string,
  ticketsEndAt: number
): SetSeasonScheduleTicketsEndAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_END_AT,
    payload: {
      seasonId,
      ticketsEndAt,
    },
  };
}

/************************************************************
 *  Season Starts At
 ***********************************************************/

export interface SetSeasonScheduleStartsAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_SCHEDULE_STARTS_AT;
  payload: {
    seasonId: string;
    startsAt: number;
  };
}

export function setSeasonScheduleStartsAt(
  seasonId: string,
  startsAt: number
): SetSeasonScheduleStartsAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SCHEDULE_STARTS_AT,
    payload: {
      seasonId,
      startsAt,
    },
  };
}

/************************************************************
 *  Season Ends At
 ***********************************************************/

export interface SetSeasonScheduleEndsAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_SCHEDULE_ENDS_AT;
  payload: {
    seasonId: string;
    endsAt: number;
  };
}

export function setSeasonScheduleEndsAt(
  seasonId: string,
  endsAt: number
): SetSeasonScheduleEndsAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SCHEDULE_ENDS_AT,
    payload: {
      seasonId,
      endsAt,
    },
  };
}

/************************************************************
 *  Season Send QR Code
 ***********************************************************/
export interface SetSeasonSendQRCodeAction {
  type: typeof SeasonActionTypes.SET_SEASON_SEND_QR_CODE;
  payload: {
    seasonId: string;
    sendQRCode: SendQRCodeEnum;
  };
}

export function setSeasonSendQRCode(
  seasonId: string,
  sendQRCode: SendQRCodeEnum
): SetSeasonSendQRCodeAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SEND_QR_CODE,
    payload: {
      seasonId,
      sendQRCode,
    },
  };
}
/********************************************************************************
 *  Set Upgrade Type ID
 *******************************************************************************/
export interface SetUpgradeTypeIdAction {
  type: typeof SeasonActionTypes.SET_UPGRADE_TYPE_ID;
  payload: {
    upgradeTypeId: string;
  };
}

export function setUpgradeTypeId(
  upgradeTypeId: string
): SetUpgradeTypeIdAction {
  return {
    type: SeasonActionTypes.SET_UPGRADE_TYPE_ID,
    payload: {
      upgradeTypeId,
    },
  };
}

/********************************************************************************
 *  Upgrade Type
 *******************************************************************************/

export interface SetUpgradeTypeAction {
  type: typeof SeasonActionTypes.SET_UPGRADE_TYPE;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
    upgradeType: Partial<IEventUpgrade>;
  };
}

export function setUpgradeType(
  seasonId: string,
  upgradeTypeId: string,
  upgradeType: Partial<IEventUpgrade>
): SetUpgradeTypeAction {
  return {
    type: SeasonActionTypes.SET_UPGRADE_TYPE,
    payload: {
      seasonId,
      upgradeTypeId,
      upgradeType,
    },
  };
}

/************************************************************
Add Upgrade Type
***********************************************************/

export interface AddUpgradeTypeAction {
  type: typeof SeasonActionTypes.ADD_UPGRADE_TYPE;
  payload: {
    seasonId: string;
  };
}

export function addUpgradeType(seasonId: string): AddUpgradeTypeAction {
  return {
    type: SeasonActionTypes.ADD_UPGRADE_TYPE,
    payload: {
      seasonId,
    },
  };
}

/************************************************************
 Remove Upgrade Type
 ***********************************************************/

export interface RemoveUpgradeTypeAction {
  type: typeof SeasonActionTypes.REMOVE_UPGRADE_TYPE;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
  };
}

export function removeUpgradeType(
  seasonId: string,
  upgradeTypeId: string
): RemoveUpgradeTypeAction {
  return {
    type: SeasonActionTypes.REMOVE_UPGRADE_TYPE,
    payload: {
      seasonId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Set Upgrade Type Visible
 ***********************************************************/

export interface SetUpgradeTypeVisibleAction {
  type: typeof SeasonActionTypes.SET_UPGRADE_TYPE_VISIBLE;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
    visible: boolean;
  };
}

export function setUpgradeTypeVisible(
  seasonId: string,
  upgradeTypeId: string,
  visible: boolean
): SetUpgradeTypeVisibleAction {
  return {
    type: SeasonActionTypes.SET_UPGRADE_TYPE_VISIBLE,
    payload: {
      seasonId,
      upgradeTypeId,
      visible,
    },
  };
}

/************************************************************
Move Upgrade Type Up
***********************************************************/

export interface MoveUpgradeTypeUpAction {
  type: typeof SeasonActionTypes.MOVE_UPGRADE_TYPE_UP;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
  };
}

export function moveUpgradeTypeUp(
  seasonId: string,
  upgradeTypeId: string
): MoveUpgradeTypeUpAction {
  return {
    type: SeasonActionTypes.MOVE_UPGRADE_TYPE_UP,
    payload: {
      seasonId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Move Upgrade Type Down
 ***********************************************************/

export interface MoveUpgradeTypeDownAction {
  type: typeof SeasonActionTypes.MOVE_UPGRADE_TYPE_DOWN;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
  };
}

export function moveUpgradeTypeDown(
  seasonId: string,
  upgradeTypeId: string
): MoveUpgradeTypeDownAction {
  return {
    type: SeasonActionTypes.MOVE_UPGRADE_TYPE_DOWN,
    payload: {
      seasonId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Add Upgrade Type Ticket Type Id
 ***********************************************************/

export interface AddUpgradeTypeTicketTypeIdAction {
  type: typeof SeasonActionTypes.ADD_UPGRADE_TYPE_TICKET_TYPE_ID;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  };
}

export function addUpgradeTypeTicketTypeId(
  seasonId: string,
  upgradeTypeId: string,
  ticketTypeId: string
): AddUpgradeTypeTicketTypeIdAction {
  return {
    type: SeasonActionTypes.ADD_UPGRADE_TYPE_TICKET_TYPE_ID,
    payload: {
      seasonId,
      upgradeTypeId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Upgrade Type Ticket Type Id
 ***********************************************************/

export interface RemoveUpgradeTypeTicketTypeIdAction {
  type: typeof SeasonActionTypes.REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  };
}

export function removeUpgradeTypeTicketTypeId(
  seasonId: string,
  upgradeTypeId: string,
  ticketTypeId: string
): RemoveUpgradeTypeTicketTypeIdAction {
  return {
    type: SeasonActionTypes.REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID,
    payload: {
      seasonId,
      upgradeTypeId,
      ticketTypeId,
    },
  };
}
/********************************************************************************
 *  Set Promotion ID
 *******************************************************************************/
export interface SetPromotionIdAction {
  type: typeof SeasonActionTypes.SET_PROMOTION_ID;
  payload: {
    promotionId: string;
  };
}

export function setPromotionId(promotionId: string): SetPromotionIdAction {
  return {
    type: SeasonActionTypes.SET_PROMOTION_ID,
    payload: {
      promotionId,
    },
  };
}
/********************************************************************************
 *  Promotion
 *******************************************************************************/

export interface SetPromotionAction {
  type: typeof SeasonActionTypes.SET_PROMOTION;
  payload: {
    seasonId: string;
    promotionId: string;
    promotion: Partial<IEventPromotion>;
  };
}

export function setPromotion(
  seasonId: string,
  promotionId: string,
  promotion: Partial<IEventPromotion>
): SetPromotionAction {
  return {
    type: SeasonActionTypes.SET_PROMOTION,
    payload: {
      seasonId,
      promotionId,
      promotion,
    },
  };
}

/************************************************************
Add Promotion
***********************************************************/

export interface AddPromotionAction {
  type: typeof SeasonActionTypes.ADD_PROMOTION;
  payload: {
    seasonId: string;
  };
}

export function addPromotion(seasonId: string): AddPromotionAction {
  return {
    type: SeasonActionTypes.ADD_PROMOTION,
    payload: {
      seasonId,
    },
  };
}

/************************************************************
 Remove Promotion
 ***********************************************************/

export interface RemovePromotionAction {
  type: typeof SeasonActionTypes.REMOVE_PROMOTION;
  payload: {
    seasonId: string;
    promotionId: string;
  };
}

export function removePromotion(
  seasonId: string,
  promotionId: string
): RemovePromotionAction {
  return {
    type: SeasonActionTypes.REMOVE_PROMOTION,
    payload: {
      seasonId,
      promotionId,
    },
  };
}

/************************************************************
 Set Promotion Active
 ***********************************************************/

export interface SetPromotionActiveAction {
  type: typeof SeasonActionTypes.SET_PROMOTION_ACTIVE;
  payload: {
    seasonId: string;
    promotionId: string;
    active: boolean;
  };
}

export function setPromotionActive(
  seasonId: string,
  promotionId: string,
  active: boolean
): SetPromotionActiveAction {
  return {
    type: SeasonActionTypes.SET_PROMOTION_ACTIVE,
    payload: {
      seasonId,
      promotionId,
      active,
    },
  };
}

/************************************************************
Move Promotion Up
***********************************************************/

export interface MovePromotionUpAction {
  type: typeof SeasonActionTypes.MOVE_PROMOTION_UP;
  payload: {
    seasonId: string;
    promotionId: string;
  };
}

export function movePromotionUp(
  seasonId: string,
  promotionId: string
): MovePromotionUpAction {
  return {
    type: SeasonActionTypes.MOVE_PROMOTION_UP,
    payload: {
      seasonId,
      promotionId,
    },
  };
}

/************************************************************
 Move Promotion Down
 ***********************************************************/

export interface MovePromotionDownAction {
  type: typeof SeasonActionTypes.MOVE_PROMOTION_DOWN;
  payload: {
    seasonId: string;
    promotionId: string;
  };
}

export function movePromotionDown(
  seasonId: string,
  promotionId: string
): MovePromotionDownAction {
  return {
    type: SeasonActionTypes.MOVE_PROMOTION_DOWN,
    payload: {
      seasonId,
      promotionId,
    },
  };
}

/************************************************************
 Add Promotion Ticket Type Id
 ***********************************************************/

export interface AddPromotionTicketTypeIdAction {
  type: typeof SeasonActionTypes.ADD_PROMOTION_TICKET_TYPE_ID;
  payload: {
    seasonId: string;
    promotionId: string;
    ticketTypeId: string;
  };
}

export function addPromotionTicketTypeId(
  seasonId: string,
  promotionId: string,
  ticketTypeId: string
): AddPromotionTicketTypeIdAction {
  return {
    type: SeasonActionTypes.ADD_PROMOTION_TICKET_TYPE_ID,
    payload: {
      seasonId,
      promotionId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Promotion Ticket Type Id
 ***********************************************************/

export interface RemovePromotionTicketTypeIdAction {
  type: typeof SeasonActionTypes.REMOVE_PROMOTION_TICKET_TYPE_ID;
  payload: {
    seasonId: string;
    promotionId: string;
    ticketTypeId: string;
  };
}

export function removePromotionTicketTypeId(
  seasonId: string,
  promotionId: string,
  ticketTypeId: string
): RemovePromotionTicketTypeIdAction {
  return {
    type: SeasonActionTypes.REMOVE_PROMOTION_TICKET_TYPE_ID,
    payload: {
      seasonId,
      promotionId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Add Event Days on Ticket type 
 ***********************************************************/

export interface AddEventDaysOnTicketTypeAction {
  type: typeof SeasonActionTypes.ADD_SEASON_DAYS_ON_TICKET_TYPE;
  payload: {
    seasonId: string;
    seasonDay: string;
    ticketTypeId: string;
  };
}

export function addEventDaysOnTicketType(
  seasonId: string,
  seasonDay: string,
  ticketTypeId: string
): AddEventDaysOnTicketTypeAction {
  return {
    type: SeasonActionTypes.ADD_SEASON_DAYS_ON_TICKET_TYPE,
    payload: {
      seasonId,
      seasonDay,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Event Days on Ticket type
 ***********************************************************/

export interface RemoveEventDaysOnTicketTypeAction {
  type: typeof SeasonActionTypes.REMOVE_SEASON_DAYS_ON_TICKET_TYPE;
  payload: {
    seasonId: string;
    seasonDay: string;
    ticketTypeId: string;
  };
}

export function removeEventDaysOnTicketType(
  seasonId: string,
  seasonDay: string,
  ticketTypeId: string
): RemoveEventDaysOnTicketTypeAction {
  return {
    type: SeasonActionTypes.REMOVE_SEASON_DAYS_ON_TICKET_TYPE,
    payload: {
      seasonId,
      seasonDay,
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Custom Field
 *******************************************************************************/

export interface SetCustomFieldAction {
  type: typeof SeasonActionTypes.SET_CUSTOM_FIELD;
  payload: {
    seasonId: string;
    customFieldId: string;
    customField: Partial<IEventCustomField>;
  };
}

export function setCustomField(
  seasonId: string,
  customFieldId: string,
  customField: Partial<IEventCustomField>
): SetCustomFieldAction {
  return {
    type: SeasonActionTypes.SET_CUSTOM_FIELD,
    payload: {
      seasonId,
      customFieldId,
      customField,
    },
  };
}

/************************************************************
Add Custom Field
***********************************************************/

export interface AddCustomFieldAction {
  type: typeof SeasonActionTypes.ADD_CUSTOM_FIELD;
  payload: {
    seasonId: string;
  };
}

export function addCustomField(seasonId: string): AddCustomFieldAction {
  return {
    type: SeasonActionTypes.ADD_CUSTOM_FIELD,
    payload: {
      seasonId,
    },
  };
}

/************************************************************
 Remove Custom Field
 ***********************************************************/

export interface RemoveSeasonCustomFieldAction {
  type: typeof SeasonActionTypes.REMOVE_SEASON_CUSTOM_FIELD;
  payload: {
    seasonId: string;
    customFieldId: string;
  };
}

export function removeSeasonCustomField(
  seasonId: string,
  customFieldId: string
): RemoveSeasonCustomFieldAction {
  return {
    type: SeasonActionTypes.REMOVE_SEASON_CUSTOM_FIELD,
    payload: {
      seasonId,
      customFieldId,
    },
  };
}

/************************************************************
Move Custom Field Up
***********************************************************/

export interface MoveCustomFieldUpAction {
  type: typeof SeasonActionTypes.MOVE_CUSTOM_FIELD_UP;
  payload: {
    seasonId: string;
    customFieldId: string;
  };
}

export function moveCustomFieldUp(
  seasonId: string,
  customFieldId: string
): MoveCustomFieldUpAction {
  return {
    type: SeasonActionTypes.MOVE_CUSTOM_FIELD_UP,
    payload: {
      seasonId,
      customFieldId,
    },
  };
}

/************************************************************
 Move Custom Field Down
 ***********************************************************/

export interface MoveCustomFieldDownAction {
  type: typeof SeasonActionTypes.MOVE_CUSTOM_FIELD_DOWN;
  payload: {
    seasonId: string;
    customFieldId: string;
  };
}

export function moveCustomFieldDown(
  seasonId: string,
  customFieldId: string
): MoveCustomFieldDownAction {
  return {
    type: SeasonActionTypes.MOVE_CUSTOM_FIELD_DOWN,
    payload: {
      seasonId,
      customFieldId,
    },
  };
}

/************************************************************
 Add Custom Field Option
 ***********************************************************/

export interface AddCustomFieldOptionAction {
  type: typeof SeasonActionTypes.ADD_CUSTOM_FIELD_OPTION;
  payload: {
    seasonId: string;
    customFieldId: string;
  };
}

export function addCustomFieldOption(
  seasonId: string,
  customFieldId: string
): AddCustomFieldOptionAction {
  return {
    type: SeasonActionTypes.ADD_CUSTOM_FIELD_OPTION,
    payload: {
      seasonId,
      customFieldId,
    },
  };
}

/************************************************************
 Remove Custom Field Option
 ***********************************************************/

export interface RemoveCustomFieldOptionAction {
  type: typeof SeasonActionTypes.REMOVE_CUSTOM_FIELD_OPTION;
  payload: {
    seasonId: string;
    customFieldId: string;
    optionIndex: number;
  };
}

export function removeCustomFieldOption(
  seasonId: string,
  customFieldId: string,
  optionIndex: number
): RemoveCustomFieldOptionAction {
  return {
    type: SeasonActionTypes.REMOVE_CUSTOM_FIELD_OPTION,
    payload: {
      seasonId,
      customFieldId,
      optionIndex,
    },
  };
}

/************************************************************
 Set Custom Field Active
 ***********************************************************/

export interface SetCustomFieldActiveAction {
  type: typeof SeasonActionTypes.SET_CUSTOM_FIELD_ACTIVE;
  payload: {
    seasonId: string;
    customFieldId: string;
    active: boolean;
  };
}

export function setCustomFieldActive(
  seasonId: string,
  customFieldId: string,
  active: boolean
): SetCustomFieldActiveAction {
  return {
    type: SeasonActionTypes.SET_CUSTOM_FIELD_ACTIVE,
    payload: {
      seasonId,
      customFieldId,
      active,
    },
  };
}

/************************************************************
 Set Custom Field Option
 ***********************************************************/

export interface SetCustomFieldOptionAction {
  type: typeof SeasonActionTypes.SET_CUSTOM_FIELD_OPTION;
  payload: {
    seasonId: string;
    customFieldId: string;
    optionIndex: number;
    option: string;
  };
}

export function setCustomFieldOption(
  seasonId: string,
  customFieldId: string,
  optionIndex: number,
  option: string
): SetCustomFieldOptionAction {
  return {
    type: SeasonActionTypes.SET_CUSTOM_FIELD_OPTION,
    payload: {
      seasonId,
      customFieldId,
      optionIndex,
      option,
    },
  };
}

/************************************************************
 *  Season Select Seating Chart
 ***********************************************************/
export interface SelectSeasonSeatingChartAction {
  type: typeof SeasonActionTypes.SELECT_SEASON_SEATING_CHART;
  payload: {
    seasonId: string;
    seatingChartKey: string;
  };
}

export function selectSeasonSeatingChart(
  seasonId: string,
  seatingChartKey: string
): SelectSeasonSeatingChartAction {
  return {
    type: SeasonActionTypes.SELECT_SEASON_SEATING_CHART,
    payload: {
      seasonId,
      seatingChartKey,
    },
  };
}

// For creating after season id is generated
export interface SelectCreateSeasonSeatingChartAction {
  type: typeof SeasonActionTypes.SELECT_CREATE_SEASON_SEATING_CHART;
  payload: {
    season;
  };
}

export function selectCreateSeasonSeatingChart(
  season
): SelectCreateSeasonSeatingChartAction {
  return {
    type: SeasonActionTypes.SELECT_CREATE_SEASON_SEATING_CHART,
    payload: {
      season,
    },
  };
}

/************************************************************
 *  Season Set Seating Chart Fields
 ***********************************************************/
export interface SetSeasonSeatingChartFieldsAction {
  type: typeof SeasonActionTypes.SET_SEASON_SEATING_CHART_FIELDS;
  payload: {
    seasonId: string;
    categories: any[];
  };
}

export function setSeasonSeatingChartFields(
  seasonId: string,
  categories: any[]
): SetSeasonSeatingChartFieldsAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SEATING_CHART_FIELDS,
    payload: {
      seasonId,
      categories,
    },
  };
}

/************************************************************
 *  Season Seating Chart Key
 ***********************************************************/
export interface SetSeasonSeatingChartKeyAction {
  type: typeof SeasonActionTypes.SET_SEASON_SEATING_CHART_KEY;
  payload: {
    seasonId: string;
    seatingChartKey: string;
  };
}

export function setSeasonSeatingChartKey(
  seasonId: string,
  seatingChartKey: string
): SetSeasonSeatingChartKeyAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SEATING_CHART_KEY,
    payload: {
      seasonId,
      seatingChartKey,
    },
  };
}

/************************************************************
 *  Season Clear Seating Chart Fields
 ***********************************************************/
export interface ClearSeasonSeatingChartFieldsAction {
  type: typeof SeasonActionTypes.CLEAR_SEASON_SEATING_CHART_FIELDS;
  payload: {
    seasonId: string;
  };
}

export function clearSeasonSeatingChartFields(
  seasonId: string
): ClearSeasonSeatingChartFieldsAction {
  return {
    type: SeasonActionTypes.CLEAR_SEASON_SEATING_CHART_FIELDS,
    payload: {
      seasonId,
    },
  };
}

/********************************************************************************
 *  Set Ticket Type ID
 *******************************************************************************/
export interface SetTicketTypeIdAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_ID;
  payload: {
    ticketTypeId: string;
  };
}

export function setTicketTypeId(ticketTypeId: string): SetTicketTypeIdAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_ID,
    payload: {
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Save season
 *******************************************************************************/

export interface SaveSeasonAction {
  type: typeof SeasonActionTypes.SAVE_SEASON;
  payload: {
    forward: boolean;
    next?: boolean;
  };
}

export function saveSeason(
  forward: boolean = true,
  next: boolean = false
): SaveSeasonAction {
  return {
    type: SeasonActionTypes.SAVE_SEASON,
    payload: {
      forward,
      next,
    },
  };
}

/********************************************************************************
 *  Create Season
 *******************************************************************************/

// Request

export interface CreateSeasonRequestAction {
  type: typeof SeasonActionTypes.CREATE_SEASON_REQUEST;
  payload: {};
}

export function createSeasonRequest(): CreateSeasonRequestAction {
  return {
    type: SeasonActionTypes.CREATE_SEASON_REQUEST,
    payload: {},
  };
}

// Success

export interface CreateSeasonSuccessAction {
  type: typeof SeasonActionTypes.CREATE_SEASON_SUCCESS;
  payload: {
    season: ISeasonGraphQL;
  };
}

export function createSeasonSuccess(
  season: ISeasonGraphQL
): CreateSeasonSuccessAction {
  return {
    type: SeasonActionTypes.CREATE_SEASON_SUCCESS,
    payload: {
      season,
    },
  };
}

// Failure

export interface CreateSeasonFailureAction {
  type: typeof SeasonActionTypes.CREATE_SEASON_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createSeasonFailure(
  errorMsg: string
): CreateSeasonFailureAction {
  return {
    type: SeasonActionTypes.CREATE_SEASON_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Update Season
 *******************************************************************************/

// Request

export interface UpdateSeasonRequestAction {
  type: typeof SeasonActionTypes.UPDATE_SEASON_REQUEST;
  payload: {};
}

export function updateSeasonRequest(): UpdateSeasonRequestAction {
  return {
    type: SeasonActionTypes.UPDATE_SEASON_REQUEST,
    payload: {},
  };
}

// Success

export interface UpdateSeasonSuccessAction {
  type: typeof SeasonActionTypes.UPDATE_SEASON_SUCCESS;
  payload: {
    season: ISeasonGraphQL;
  };
}

export function updateSeasonSuccess(
  season: ISeasonGraphQL
): UpdateSeasonSuccessAction {
  return {
    type: SeasonActionTypes.UPDATE_SEASON_SUCCESS,
    payload: {
      season,
    },
  };
}

// Failure

export interface UpdateSeasonFailureAction {
  type: typeof SeasonActionTypes.UPDATE_SEASON_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function updateSeasonFailure(
  errorMsg: string
): UpdateSeasonFailureAction {
  return {
    type: SeasonActionTypes.UPDATE_SEASON_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Publish Season
 *******************************************************************************/

export interface PublishSeasonAction {
  type: typeof SeasonActionTypes.PUBLISH_SEASON;
  payload: {
    published?: boolean;
  };
}

export function publishSeason(published?: boolean): PublishSeasonAction {
  return {
    type: SeasonActionTypes.PUBLISH_SEASON,
    payload: {
      published,
    },
  };
}

// Request

export interface PublishSeasonRequestAction {
  type: typeof SeasonActionTypes.PUBLISH_SEASON_REQUEST;
  payload: {
    isEdit?: boolean;
    published?: boolean;
  };
}

export function publishSeasonRequest(
  published?: boolean,
  isEdit?: boolean
): PublishSeasonRequestAction {
  return {
    type: SeasonActionTypes.PUBLISH_SEASON_REQUEST,
    payload: {
      published,
      isEdit,
    },
  };
}

// Success

export interface PublishSeasonSuccessAction {
  type: typeof SeasonActionTypes.PUBLISH_SEASON_SUCCESS;
  payload: {
    season: ISeasonGraphQL;
  };
}

export function publishSeasonSuccess(
  season: ISeasonGraphQL
): PublishSeasonSuccessAction {
  return {
    type: SeasonActionTypes.PUBLISH_SEASON_SUCCESS,
    payload: {
      season,
    },
  };
}

// Failure

export interface PublishSeasonFailureAction {
  type: typeof SeasonActionTypes.PUBLISH_SEASON_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function publishSeasonFailure(
  errorMsg: string
): PublishSeasonFailureAction {
  return {
    type: SeasonActionTypes.PUBLISH_SEASON_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/************************************************************
 *  Season User Agreement
 ***********************************************************/
export interface SetSeasonUserAgreementAction {
  type: typeof SeasonActionTypes.SET_SEASON_USER_AGREEMENT;
  payload: {
    seasonId: string;
    userAgreement: string;
  };
}

export function setSeasonUserAgreement(
  seasonId: string,
  userAgreement: string
): SetSeasonUserAgreementAction {
  return {
    type: SeasonActionTypes.SET_SEASON_USER_AGREEMENT,
    payload: {
      seasonId,
      userAgreement,
    },
  };
}

/********************************************************************************
 *  Navigate To Previous Step
 *******************************************************************************/

export interface NavigatePreviousStepAction {
  type: typeof SeasonActionTypes.NAVIGATE_PREVIOUS_STEP;
  payload: {};
}

export function navigatePreviousStep(): NavigatePreviousStepAction {
  return {
    type: SeasonActionTypes.NAVIGATE_PREVIOUS_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Navigate To Next Step
 *******************************************************************************/

export interface NavigateNextStepAction {
  type: typeof SeasonActionTypes.NAVIGATE_NEXT_STEP;
  payload: {};
}

export function navigateNextStep(): NavigateNextStepAction {
  return {
    type: SeasonActionTypes.NAVIGATE_NEXT_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Cache Seasons
 *******************************************************************************/

export interface CacheSeasonsAction {
  type: typeof SeasonActionTypes.CACHE_SEASONS;
  payload: {
    seasons: ISeasonGraphQL[];
  };
}

export function cacheSeasons(seasons: ISeasonGraphQL[]): CacheSeasonsAction {
  return {
    type: SeasonActionTypes.CACHE_SEASONS,
    payload: {
      seasons,
    },
  };
}

/********************************************************************************
 *  Re-cache Season
 *******************************************************************************/

export interface ReCacheSeasonAction {
  type: typeof SeasonActionTypes.RE_CACHE_SEASON;
  payload: {
    seasonId: string;
    fromRemote?: boolean;
  };
}

export function reCacheSeason(
  seasonId: string,
  fromRemote?: boolean
): ReCacheSeasonAction {
  return {
    type: SeasonActionTypes.RE_CACHE_SEASON,
    payload: {
      seasonId,
      fromRemote,
    },
  };
}
/************************************************************
Set Ticket Type Tier
***********************************************************/

export interface SetTicketTypeTierAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
    tier: Partial<ITicketTier>;
  };
}

export function setTicketTypeTier(
  seasonId: string,
  ticketTypeId: string,
  tierId: string,
  tier: Partial<ITicketTier>
): SetTicketTypeTierAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER,
    payload: {
      seasonId,
      ticketTypeId,
      tierId,
      tier,
    },
  };
}

/************************************************************
Is Using Pricing Tiers
***********************************************************/

export interface SetIsUsingPricingTiersAction {
  type: typeof SeasonActionTypes.SET_SEASON_IS_USING_PRICING_TIERS;
  payload: {
    isUsingPricingTiers: boolean;
  };
}

export function setIsUsingPricingTiers(
  isUsingPricingTiers: boolean
): SetIsUsingPricingTiersAction {
  return {
    type: SeasonActionTypes.SET_SEASON_IS_USING_PRICING_TIERS,
    payload: {
      isUsingPricingTiers,
    },
  };
}

/************************************************************
 Add Ticket Type Tier
 ***********************************************************/

export interface SetTicketTypeTierEndsAtAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER_ENDS_AT;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
    endsAt: number | null;
  };
}

export function setTicketTypeTierEndsAt(
  seasonId: string,
  ticketTypeId: string,
  tierId: string,
  endsAt: number | null
): SetTicketTypeTierEndsAtAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER_ENDS_AT,
    payload: {
      seasonId,
      ticketTypeId,
      tierId,
      endsAt,
    },
  };
}

/************************************************************
 Add Ticket Type Tier
 ***********************************************************/

export interface AddTicketTypeTierAction {
  type: typeof SeasonActionTypes.ADD_SEASON_TICKET_TYPE_TIER;
  payload: {
    seasonId: string;
    ticketTypeId: string;
  };
}

export function addTicketTypeTier(
  seasonId: string,
  ticketTypeId: string
): AddTicketTypeTierAction {
  return {
    type: SeasonActionTypes.ADD_SEASON_TICKET_TYPE_TIER,
    payload: {
      seasonId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Ticket Type Tier
 ***********************************************************/

export interface RemoveTicketTypeTierAction {
  type: typeof SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE_TIER;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
  };
}

export function removeTicketTypeTier(
  seasonId: string,
  ticketTypeId: string,
  tierId: string
): RemoveTicketTypeTierAction {
  return {
    type: SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE_TIER,
    payload: {
      seasonId,
      ticketTypeId,
      tierId,
    },
  };
}

/********************************************************************************
 *  Ticket Type
 *******************************************************************************/

export interface SetTicketTypeAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    ticketType: Partial<ITicketType>;
  };
}

export function setTicketType(
  seasonId: string,
  ticketTypeId: string,
  ticketType: Partial<ITicketType>
): SetTicketTypeAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE,
    payload: {
      seasonId,
      ticketTypeId,
      ticketType,
    },
  };
}

/************************************************************
Add Ticket Type
***********************************************************/

export interface AddSeasonTicketTypeAction {
  type: typeof SeasonActionTypes.ADD_SEASON_TICKET_TYPE;
  payload: {
    seasonId: string;
    setUrlParam: boolean;
  };
}

export function addSeasonTicketType(
  seasonId: string,
  setUrlParam: boolean = true
): AddSeasonTicketTypeAction {
  return {
    type: SeasonActionTypes.ADD_SEASON_TICKET_TYPE,
    payload: {
      seasonId,
      setUrlParam,
    },
  };
}

/************************************************************
 Remove Ticket Type
 ***********************************************************/

export interface RemoveTicketTypeAction {
  type: typeof SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE;
  payload: {
    seasonId: string;
    ticketTypeId: string;
  };
}

export function removeTicketType(
  seasonId: string,
  ticketTypeId: string
): RemoveTicketTypeAction {
  return {
    type: SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE,
    payload: {
      seasonId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Set Ticket Type Visible
 ***********************************************************/

export interface SetTicketTypeVisibleAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_VISIBLE;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    visible: boolean;
  };
}

export function setTicketTypeVisible(
  seasonId: string,
  ticketTypeId: string,
  visible: boolean
): SetTicketTypeVisibleAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_VISIBLE,
    payload: {
      seasonId,
      ticketTypeId,
      visible,
    },
  };
}

/************************************************************
Move Ticket Type Up
***********************************************************/

export interface MoveTicketTypeUpAction {
  type: typeof SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_UP;
  payload: {
    seasonId: string;
    ticketTypeId: string;
  };
}

export function moveTicketTypeUp(
  seasonId: string,
  ticketTypeId: string
): MoveTicketTypeUpAction {
  return {
    type: SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_UP,
    payload: {
      seasonId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Move Ticket Type Down
 ***********************************************************/

export interface MoveTicketTypeDownAction {
  type: typeof SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_DOWN;
  payload: {
    seasonId: string;
    ticketTypeId: string;
  };
}

export function moveTicketTypeDown(
  seasonId: string,
  ticketTypeId: string
): MoveTicketTypeDownAction {
  return {
    type: SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_DOWN,
    payload: {
      seasonId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Ticket Type Name
 ***********************************************************/

export interface SetTicketTypeNameAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_NAME;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    name: string;
  };
}

export function setTicketTypeName(
  seasonId: string,
  ticketTypeId: string,
  name: string
): SetTicketTypeNameAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_NAME,
    payload: {
      seasonId,
      ticketTypeId,
      name,
    },
  };
}

/************************************************************
 *  Ticket Type values
 ***********************************************************/
export interface SetTicketTypeValuesAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_VALUES;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    values: string;
  };
}

export function setTicketTypeValues(
  seasonId: string,
  ticketTypeId: string,
  values: string
): SetTicketTypeValuesAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_VALUES,
    payload: {
      seasonId,
      ticketTypeId,
      values,
    },
  };
}

/************************************************************
 Ticket Type Qty
 ***********************************************************/

export interface SetTicketTypeQtyAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_QTY;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    qty: number;
  };
}

export function setTicketTypeQty(
  seasonId: string,
  ticketTypeId: string,
  qty: number
): SetTicketTypeQtyAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_QTY,
    payload: {
      seasonId,
      ticketTypeId,
      qty,
    },
  };
}

/************************************************************
 Ticket Type Purchase Limit
 ***********************************************************/

export interface SetTicketTypePurchaseLimitAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_PURCHASE_LIMIT;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    purchaseLimit: number;
  };
}

export function setTicketTypePurchaseLimit(
  seasonId: string,
  ticketTypeId: string,
  purchaseLimit: number
): SetTicketTypePurchaseLimitAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_PURCHASE_LIMIT,
    payload: {
      seasonId,
      ticketTypeId,
      purchaseLimit,
    },
  };
}

/************************************************************
 Ticket Type Description
 ***********************************************************/

export interface SetTicketTypeDescriptionAction {
  type: typeof SeasonActionTypes.SET_SEASON_TICKET_TYPE_DESCRIPTION;
  payload: {
    seasonId: string;
    ticketTypeId: string;
    description: string;
  };
}

export function setTicketTypeDescription(
  seasonId: string,
  ticketTypeId: string,
  description: string
): SetTicketTypeDescriptionAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TICKET_TYPE_DESCRIPTION,
    payload: {
      seasonId,
      ticketTypeId,
      description,
    },
  };
}

/********************************************************************************
 *  Re-cache Ticket Type
 *******************************************************************************/

export interface ReCacheTicketTypeAction {
  type: typeof SeasonActionTypes.RE_CACHE_TICKET_TYPE;
  payload: {
    seasonId: string;
    ticketTypeId: string;
  };
}

export function reCacheTicketType(
  seasonId: string,
  ticketTypeId: string
): ReCacheTicketTypeAction {
  return {
    type: SeasonActionTypes.RE_CACHE_TICKET_TYPE,
    payload: {
      seasonId,
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Re-cache Upgrade Type
 *******************************************************************************/

export interface ReCacheUpgradeTypeAction {
  type: typeof SeasonActionTypes.RE_CACHE_UPGRADE_TYPE;
  payload: {
    seasonId: string;
    upgradeTypeId: string;
  };
}

export function reCacheUpgradeType(
  seasonId: string,
  upgradeTypeId: string
): ReCacheUpgradeTypeAction {
  return {
    type: SeasonActionTypes.RE_CACHE_UPGRADE_TYPE,
    payload: {
      seasonId,
      upgradeTypeId,
    },
  };
}

/********************************************************************************
 *  Re-cache Custom Field
 *******************************************************************************/

export interface ReCacheCustomFieldAction {
  type: typeof SeasonActionTypes.RE_CACHE_CUSTOM_FIELD;
  payload: {
    seasonId: string;
    customFieldId: string;
  };
}

export function reCacheCustomField(
  seasonId: string,
  customFieldId: string
): ReCacheCustomFieldAction {
  return {
    type: SeasonActionTypes.RE_CACHE_CUSTOM_FIELD,
    payload: {
      seasonId,
      customFieldId,
    },
  };
}

/************************************************************
 *  Season TaxDeduction
 ***********************************************************/
export interface SetSeasonTaxDeductionAction {
  type: typeof SeasonActionTypes.SET_SEASON_TAX_DEDUCTION;
  payload: {
    seasonId: string;
    taxDeduction: boolean;
  };
}

export function setSeasonTaxDeduction(
  seasonId: string,
  taxDeduction: boolean
): SetSeasonTaxDeductionAction {
  return {
    type: SeasonActionTypes.SET_SEASON_TAX_DEDUCTION,
    payload: {
      seasonId,
      taxDeduction,
    },
  };
}


/************************************************************
 *  Sales Begin Immediately
 ***********************************************************/

export interface SetSeasonSalesBeginImmediatelyAction {
  type: typeof SeasonActionTypes.SET_SEASON_SALES_BEGIN_IMMEDIATELY;
  payload: {
    seasonId: string;
    salesBeginImmediately: boolean;
  };
}

export function setSeasonSalesBeginImmediately(
  seasonId: string,
  salesBeginImmediately: boolean
): SetSeasonSalesBeginImmediatelyAction {
  return {
    type: SeasonActionTypes.SET_SEASON_SALES_BEGIN_IMMEDIATELY,
    payload: {
      seasonId,
      salesBeginImmediately,
    },
  };
}