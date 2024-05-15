import {
  IEventGraphQL,
  EventTypeEnum,
  EventAgeEnum,
  EventProcessAsEnum,
  SendQRCodeEnum,
  EventTicketDelivery,
} from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import { IPerformanceSchedule } from "@sellout/models/.dist/interfaces/IPerformance";
import ITicketHold from "@sellout/models/.dist/interfaces/ITicketHold";

export const EventActionTypes = {
  // Active Ids
  SET_EVENT_ID: "SET_EVENT_ID",
  SET_TICKET_HOLD_ID: "SET_TICKET_HOLD_ID",
  SET_TICKET_TYPE_ID: "SET_TICKET_TYPE_ID",
  SET_UPGRADE_TYPE_ID: "SET_UPGRADE_TYPE_ID",
  SET_PROMOTION_ID: "SET_PROMOTION_ID",
  SET_CUSTOM_FIELD_ID: "SET_CUSTOM_FIELD_ID",
  // Save Event
  SAVE_EVENT: "SAVE_EVENT",
  NAVIGATE_TO_PREVIOUS_STEP: "NAVIGATE_TO_PREVIOUS_STEP",
  NAVIGATE_TO_NEXT_STEP: "NAVIGATE_TO_NEXT_STEP",
  // Create Event
  CREATE_EVENT_REQUEST: "CREATE_EVENT_REQUEST",
  CREATE_EVENT_SUCCESS: "CREATE_EVENT_SUCCESS",
  CREATE_EVENT_FAILURE: "CREATE_EVENT_FAILURE",
  // Update Event
  UPDATE_EVENT_REQUEST: "UPDATE_EVENT_REQUEST",
  UPDATE_EVENT_SUCCESS: "UPDATE_EVENT_SUCCESS",
  UPDATE_EVENT_FAILURE: "UPDATE_EVENT_FAILURE",
  // Publish Event
  PUBLISH_EVENT: "PUBLISH_EVENT",
  PUBLISH_EVENT_REQUEST: "PUBLISH_EVENT_REQUEST",
  PUBLISH_EVENT_SUCCESS: "PUBLISH_EVENT_SUCCESS",
  PUBLISH_EVENT_FAILURE: "PUBLISH_EVENT_FAILURE",
  // Cache Events
  CACHE_EVENTS: "CACHE_EVENTS",
  RE_CACHE_EVENT: "RE_CACHE_EVENT",
  RE_CACHE_TICKET_TYPE: "RE_CACHE_TICKET_TYPE",
  RE_CACHE_UPGRADE_TYPE: "RE_CACHE_UPGRADE_TYPE",
  RE_CACHE_PROMOTION: "RE_CACHE_PROMOTION",
  RE_CACHE_CUSTOM_FIELD: "RE_CACHE_CUSTOM_FIELD",
  // Event Fields
  SET_EVENT_TYPE: "SET_EVENT_TYPE",
  SET_EVENT_NAME: "SET_EVENT_NAME",
  SET_EVENT_SUBTITLE: "SET_EVENT_SUBTITLE",
  SET_EVENT_DESCRIPTION: "SET_EVENT_DESCRIPTION",
  SET_EVENT_POSTER_IMAGE_URL: "SET_EVENT_POSTER_IMAGE_URL",
  SET_EVENT_VENUE_ID: "SET_EVENT_VENUE_ID",
  SET_EVENT_SEATING_CHART_FIELDS: "SET_EVENT_SEATING_CHART_FIELDS",
  SELECT_EVENT_SEATING_CHART: "SELECT_EVENT_SEATING_CHART",
  SELECT_CREATE_EVENT_SEATING_CHART: "SELECT_CREATE_EVENT_SEATING_CHART",
  SET_EVENT_SEATING_CHART_KEY: "SET_EVENT_SEATING_CHART_KEY",
  CLEAR_EVENT_SEATING_CHART_FIELDS: "CLEAR_EVENT_SEATING_CHART_FIELDS",
  SET_EVENT_AGE: "SET_EVENT_AGE",
  SET_EVENT_TAX_DEDUCTION: "SET_EVENT_TAX_DEDUCTION",
  SET_EVENT_TEG_INTEGERATION: "SET_EVENT_TEG_INTEGERATION",
  SET_EVENT_USER_AGREEMENT: "SET_EVENT_USER_AGREEMENT",
  SET_EVENT_PROCESS_AS: "SET_EVENT_PROCESS_AS",
  SET_EVENT_SEND_QR_CODE: "SET_EVENT_SEND_QR_CODE",
  SET_EVENT_SALES_BEGIN_IMMEDIATELY: "SET_EVENT_SALES_BEGIN_IMMEDIATELY",
  SET_EVENT_Total_Days: "SET_EVENT_Total_Days",
  SET_EVENT_MULTI_DAYS: "SET_EVENT_MULTI_DAYS",
  SET_EVENT_SCHEDULE_ANNOUNCE_AT: "SET_EVENT_SCHEDULE_ANNOUNCE_AT",
  SET_EVENT_SCHEDULE_TICKETS_AT: "SET_EVENT_SCHEDULE_TICKETS_AT",
  SET_EVENT_SCHEDULE_TICKETS_END_AT: "SET_EVENT_SCHEDULE_TICKETS_END_AT",
  SET_EVENT_SCHEDULE_STARTS_AT: "SET_EVENT_SCHEDULE_STARTS_AT",
  SET_EVENT_SCHEDULE_ENDS_AT: "SET_EVENT_SCHEDULE_ENDS_AT",
  SET_EVENT_ADD_SEASON: "SET_EVENT_ADD_SEASON",
  SET_EVENT_TICKET_DELIVERY_TYPE: "SET_EVENT_TICKET_DELIVERY_TYPE",
  SET_EVENT_DELIVERY_INSTRUCTIONS: "SET_EVENT_DELIVERY_INSTRUCTIONS",
  SET_EVENT_GUEST_VALUE: "SET_EVENT_GUEST_VALUE",
  SET_EVENT_TICKET_HOLDS: "SET_EVENT_TICKET_HOLDS",
  SET_EVENT_URl_STUB: "SET_EVENT_URl_STUB",


  // Performance Fields
  ADD_PERFORMANCE_HEADLINING_ARTIST: "ADD_PERFORMANCE_HEADLINING_ARTIST",
  REMOVE_PERFORMANCE_HEADLINING_ARTIST: "REMOVE_PERFORMANCE_HEADLINING_ARTIST",
  ADD_PERFORMANCE_OPENING_ARTIST: "ADD_PERFORMANCE_OPENING_ARTIST",
  REMOVE_PERFORMANCE_OPENING_ARTIST: "REMOVE_PERFORMANCE_OPENING_ARTIST",
  SET_EVENT_PERFORMANCE_SONG_LINK: "SET_EVENT_PERFORMANCE_SONG_LINK",
  SET_EVENT_PERFORMANCE_VIDEO_LINK: "SET_EVENT_PERFORMANCE_VIDEO_LINK",
  SET_EVENT_PUBLISHABLE: "SET_EVENT_PUBLISHABLE",
  SET_PERFORMANCE_SCHEDULE_DOORS_AT: "SET_PERFORMANCE_SCHEDULE_DOORS_AT",
  SET_PERFORMANCE_SCHEDULE_STARTS_AT: "SET_PERFORMANCE_SCHEDULE_STARTS_AT",
  SET_PERFORMANCE_SCHEDULE_ENDS_AT: "SET_PERFORMANCE_SCHEDULE_ENDS_AT",
  ADD_MULTIPLE_DAYS_EVENT: "ADD_MULTIPLE_DAYS_EVENT",

  // Ticket Hold
  SET_TICKET_HOLD: "SET_TICKET_HOLD",
  ADD_TICKET_HOLD: "ADD_TICKET_HOLD",
  REMOVE_TICKET_HOLD: "REMOVE_TICKET_HOLD",
  SET_IS_HOLD: "SET_IS_HOLD",

  // Ticket Type
  SET_TICKET_TYPE: "SET_TICKET_TYPE",
  ADD_TICKET_TYPE: "ADD_TICKET_TYPE",
  REMOVE_TICKET_TYPE: "REMOVE_TICKET_TYPE",
  SET_TICKET_TYPE_VISIBLE: "SET_TICKET_TYPE_VISIBLE",
  MOVE_TICKET_TYPE_UP: "MOVE_TICKET_TYPE_UP",
  MOVE_TICKET_TYPE_DOWN: "MOVE_TICKET_TYPE_DOWN",
  SET_TICKET_TYPE_NAME: "SET_TICKET_TYPE_NAME",
  SET_TICKET_TYPE_QTY: "SET_TICKET_TYPE_QTY",
  SET_TICKET_TYPE_PURCHASE_LIMIT: "SET_TICKET_TYPE_PURCHASE_LIMIT",
  SET_TICKET_TYPE_DESCRIPTION: "SET_TICKET_TYPE_DESCRIPTION",
  SET_TICKET_TYPE_VALUES: "SET_TICKET_TYPE_VALUES",
  ADD_EVENT_DAYS_ON_TICKET_TYPE: "ADD_EVENT_DAYS_ON_TICKET_TYPE",
  REMOVE_EVENT_DAYS_ON_TICKET_TYPE: "REMOVE_EVENT_DAYS_ON_TICKET_TYPE",
  // Ticket Type Tier
  SET_TICKET_TYPE_TIER: "SET_TICKET_TYPE_TIER",
  SET_IS_USING_PRICING_TIERS: "SET_IS_USING_PRICING_TIERS",
  SET_TICKET_TYPE_TIER_ENDS_AT: "SET_TICKET_TYPE_TIER_ENDS_AT",
  ADD_TICKET_TYPE_TIER: "ADD_TICKET_TYPE_TIER",
  REMOVE_TICKET_TYPE_TIER: "REMOVE_TICKET_TYPE_TIER",
  // Upgrade Type
  ADD_UPGRADE_TYPE: "ADD_UPGRADE_TYPE",
  REMOVE_UPGRADE_TYPE: "REMOVE_UPGRADE_TYPE",
  SET_UPGRADE_TYPE_VISIBLE: "SET_UPGRADE_TYPE_VISIBLE",
  MOVE_UPGRADE_TYPE_UP: "MOVE_UPGRADE_TYPE_UP",
  MOVE_UPGRADE_TYPE_DOWN: "MOVE_UPGRADE_TYPE_DOWN",
  SET_UPGRADE_TYPE: "SET_UPGRADE_TYPE",
  ADD_UPGRADE_TYPE_TICKET_TYPE_ID: "ADD_UPGRADE_TYPE_TICKET_TYPE_ID",
  REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID: "REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID",
  // Promotion
  ADD_PROMOTION: "ADD_PROMOTION",
  REMOVE_PROMOTION: "REMOVE_PROMOTION",
  SET_PROMOTION_ACTIVE: "SET_PROMOTION_ACTIVE",
  MOVE_PROMOTION_UP: "MOVE_PROMOTION_UP",
  MOVE_PROMOTION_DOWN: "MOVE_PROMOTION_DOWN",
  SET_PROMOTION: "SET_PROMOTION",
  ADD_PROMOTION_TICKET_TYPE_ID: "ADD_PROMOTION_TICKET_TYPE_ID",
  ADD_PROMOTION_UPGRADE_TYPE_ID: "ADD_PROMOTION_UPGRADE_TYPE_ID",
  REMOVE_PROMOTION_TICKET_TYPE_ID: "REMOVE_PROMOTION_TICKET_TYPE_ID",
  REMOVE_PROMOTION_UPGRADE_TYPE_ID: "REMOVE_PROMOTION_UPGRADE_TYPE_ID",

  // Custom Field
  ADD_CUSTOM_FIELD: "ADD_CUSTOM_FIELD",
  REMOVE_CUSTOM_FIELD: "REMOVE_CUSTOM_FIELD",
  SET_CUSTOM_FIELD_ACTIVE: "SET_CUSTOM_FIELD_ACTIVE",
  MOVE_CUSTOM_FIELD_UP: "MOVE_CUSTOM_FIELD_UP",
  MOVE_CUSTOM_FIELD_DOWN: "MOVE_CUSTOM_FIELD_DOWN",
  SET_CUSTOM_FIELD: "SET_CUSTOM_FIELD",
  ADD_CUSTOM_FIELD_OPTION: "ADD_CUSTOM_FIELD_OPTION",
  REMOVE_CUSTOM_FIELD_OPTION: "REMOVE_CUSTOM_FIELD_OPTION",
  SET_CUSTOM_FIELD_OPTION: "SET_CUSTOM_FIELD_OPTION",

  //Delete Event
  DELETE_EVENT: "DELETE_EVENT",
  DELETE_EVENT_SUCCESS: "DELETE_EVENT_SUCCESS",
  DELETE_EVENT_FAILURE: "DELETE_EVENT_FAILURE",
};

/********************************************************************************
 *  Event Action Creators
 *******************************************************************************/

export type EventActionCreatorTypes =
  // Active Ids
  | SetEventIdAction
  | SetTicketHoldIdAction
  | SetTicketTypeIdAction
  | SetUpgradeTypeIdAction
  | SetPromotionIdAction
  | SetCustomFieldIdAction
  // Save Event
  | SaveEventAction
  | NavigateToPreviousStepAction
  // Create Event
  | CreateEventRequestAction
  | CreateEventSuccessAction
  | CreateEventFailureAction
  // Update Event
  | UpdateEventRequestAction
  | UpdateEventSuccessAction
  | UpdateEventFailureAction
  // Publish Event
  | PublishEventAction
  | PublishEventRequestAction
  | PublishEventSuccessAction
  | PublishEventFailureAction
  // Cache Events
  | CacheEventsAction
  | ReCacheEventAction
  | ReCacheTicketTypeAction
  | ReCacheUpgradeTypeAction
  | ReCacheCustomFieldAction
  // Event Fields
  | SetEventTypeAction
  | SetEventNameAction
  | SetEventSubtitleAction
  | SetEventDescriptionAction
  | SetEventPosterImageUrlAction
  | SetEventVenueIdAction
  | SetEventSeatingChartFieldsAction
  | SelectEventSeatingChartAction
  | SetEventSeatingChartKeyAction
  | ClearEventSeatingChartFieldsAction
  | SetEventAgeAction
  | SetEventTaxDeductionAction
  | SetEventUserAgreementAction
  | SetEventProcessAsAction
  | SetEventSendQRCodeAction
  | SetEventSalesBeginImmediatelyAction
  | SetEventScheduleAnnounceAtAction
  | SetEventScheduleTicketsAtAction
  | SetEventScheduleTicketsEndAtAction
  | SetEventScheduleStartsAtAction
  | SetEventScheduleEndsAtAction
  | SetEventAddSeasonAction
  | SetEventPhysicalDeliveryInstructionsAction
  | SetEventTicketDeliveryTypeAction
  | SetEventTegIntegerationAction
  | SetEventTicketHoldsAction

  // Performance Fields
  | AddPerformanceHeadliningArtistAction
  | RemovePerformanceHeadliningArtistAction
  | AddPerformanceOpeningArtistAction
  | RemovePerformanceOpeningArtistAction
  | SetEventPerformanceSongLinkAction
  | setEventPerformanceVideoLinkAction
  | setEventPublishableAction
  | SetPerformanceScheduleDoorsAtAction
  | SetPerformanceScheduleStartsAtAction

  // Ticket Hold
  | AddTicketHoldsAction
  | SetTicketHoldAction
  | RemoveTicketHoldAction
  | SetIsHoldAction

  // Ticket Type
  | SetTicketTypeAction
  | AddTicketTypeAction
  | RemoveTicketTypeAction
  | SetTicketTypeVisibleAction
  | MoveTicketTypeUpAction
  | MoveTicketTypeDownAction
  | SetTicketTypeNameAction
  | SetTicketTypeQtyAction
  | SetTicketTypePurchaseLimitAction
  | SetTicketTypeDescriptionAction
  // Ticket Type Tier
  | SetTicketTypeTierAction
  | SetIsUsingPricingTiersAction
  | SetTicketTypeTierEndsAtAction
  | AddTicketTypeTierAction
  | RemoveTicketTypeTierAction
  // Upgrade Type
  | SetUpgradeTypeAction
  | AddUpgradeTypeAction
  | RemoveUpgradeTypeAction
  | SetUpgradeTypeVisibleAction
  | MoveUpgradeTypeUpAction
  | MoveUpgradeTypeDownAction
  | AddUpgradeTypeTicketTypeIdAction
  | RemoveUpgradeTypeTicketTypeIdAction
  // Promotion
  | SetPromotionAction
  | AddPromotionAction
  | RemovePromotionAction
  | SetPromotionActiveAction
  | MovePromotionUpAction
  | MovePromotionDownAction
  | AddPromotionTicketTypeIdAction
  | RemovePromotionTicketTypeIdAction
  // Custom Field
  | SetCustomFieldAction
  | AddCustomFieldAction
  | RemoveCustomFieldAction
  | SetCustomFieldActiveAction
  | MoveCustomFieldUpAction
  | MoveCustomFieldDownAction
  | AddCustomFieldOptionAction
  | RemoveCustomFieldOptionAction
  | SetCustomFieldOptionAction
  // Delete Event
  | DeleteEventAction
  | DeleteEventSuccessAction
  | DeleteEventFailureAction;

/********************************************************************************
 *  Set Event ID
 *******************************************************************************/
export interface SetEventIdAction {
  type: typeof EventActionTypes.SET_EVENT_ID;
  payload: {
    eventId: string;
    replace: boolean;
  };
}

export function setEventId(
  eventId: string,
  replace: boolean = false
): SetEventIdAction {
  return {
    type: EventActionTypes.SET_EVENT_ID,
    payload: {
      eventId,
      replace,
    },
  };
}

/********************************************************************************
 *  Set Ticket Hold ID
 *******************************************************************************/
export interface SetTicketHoldIdAction {
  type: typeof EventActionTypes.SET_TICKET_HOLD_ID;
  payload: {
    ticketHoldId: string;
  };
}

export function setTicketHoldId(ticketHoldId: string): SetTicketHoldIdAction {
  return {
    type: EventActionTypes.SET_TICKET_HOLD_ID,
    payload: {
      ticketHoldId,
    },
  };
}

/********************************************************************************
 *  Set Ticket Type ID
 *******************************************************************************/
export interface SetTicketTypeIdAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_ID;
  payload: {
    ticketTypeId: string;
  };
}

export function setTicketTypeId(ticketTypeId: string): SetTicketTypeIdAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_ID,
    payload: {
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Set Upgrade Type ID
 *******************************************************************************/
export interface SetUpgradeTypeIdAction {
  type: typeof EventActionTypes.SET_UPGRADE_TYPE_ID;
  payload: {
    upgradeTypeId: string;
  };
}

export function setUpgradeTypeId(
  upgradeTypeId: string
): SetUpgradeTypeIdAction {
  return {
    type: EventActionTypes.SET_UPGRADE_TYPE_ID,
    payload: {
      upgradeTypeId,
    },
  };
}

/********************************************************************************
 *  Set Promotion ID
 *******************************************************************************/
export interface SetPromotionIdAction {
  type: typeof EventActionTypes.SET_PROMOTION_ID;
  payload: {
    promotionId: string;
  };
}

export function setPromotionId(promotionId: string): SetPromotionIdAction {
  return {
    type: EventActionTypes.SET_PROMOTION_ID,
    payload: {
      promotionId,
    },
  };
}

/********************************************************************************
 *  Set Custom Field ID
 *******************************************************************************/
export interface SetCustomFieldIdAction {
  type: typeof EventActionTypes.SET_CUSTOM_FIELD_ID;
  payload: {
    customFieldId: string;
  };
}

export function setCustomFieldId(
  customFieldId: string
): SetCustomFieldIdAction {
  return {
    type: EventActionTypes.SET_CUSTOM_FIELD_ID,
    payload: {
      customFieldId,
    },
  };
}

/********************************************************************************
 *  Save Event
 *******************************************************************************/

export interface SaveEventAction {
  type: typeof EventActionTypes.SAVE_EVENT;
  payload: {
    forward: boolean;
    next?: boolean;
  };
}

export function saveEvent(
  forward: boolean = true,
  next: boolean = false
): SaveEventAction {
  return {
    type: EventActionTypes.SAVE_EVENT,
    payload: {
      forward,
      next,
    },
  };
}

/********************************************************************************
 *  Navigate To Previous Step
 *******************************************************************************/

export interface NavigateToPreviousStepAction {
  type: typeof EventActionTypes.NAVIGATE_TO_PREVIOUS_STEP;
  payload: {};
}

export function navigateToPreviousStep(): NavigateToPreviousStepAction {
  return {
    type: EventActionTypes.NAVIGATE_TO_PREVIOUS_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Navigate To Next Step
 *******************************************************************************/

export interface NavigateToNextStepAction {
  type: typeof EventActionTypes.NAVIGATE_TO_NEXT_STEP;
  payload: {};
}

export function navigateToNextStep(): NavigateToNextStepAction {
  return {
    type: EventActionTypes.NAVIGATE_TO_NEXT_STEP,
    payload: {},
  };
}

/********************************************************************************
 *  Create Event
 *******************************************************************************/

// Request

export interface CreateEventRequestAction {
  type: typeof EventActionTypes.CREATE_EVENT_REQUEST;
  payload: {};
}

export function createEventRequest(): CreateEventRequestAction {
  return {
    type: EventActionTypes.CREATE_EVENT_REQUEST,
    payload: {},
  };
}

// Success

export interface CreateEventSuccessAction {
  type: typeof EventActionTypes.CREATE_EVENT_SUCCESS;
  payload: {
    event: IEventGraphQL;
  };
}

export function createEventSuccess(
  event: IEventGraphQL
): CreateEventSuccessAction {
  return {
    type: EventActionTypes.CREATE_EVENT_SUCCESS,
    payload: {
      event,
    },
  };
}

// Failure

export interface CreateEventFailureAction {
  type: typeof EventActionTypes.CREATE_EVENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createEventFailure(errorMsg: string): CreateEventFailureAction {
  return {
    type: EventActionTypes.CREATE_EVENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Update Event
 *******************************************************************************/

// Request

export interface UpdateEventRequestAction {
  type: typeof EventActionTypes.UPDATE_EVENT_REQUEST;
  payload: {};
}

export function updateEventRequest(): UpdateEventRequestAction {
  return {
    type: EventActionTypes.UPDATE_EVENT_REQUEST,
    payload: {},
  };
}

// Success

export interface UpdateEventSuccessAction {
  type: typeof EventActionTypes.UPDATE_EVENT_SUCCESS;
  payload: {
    event: IEventGraphQL;
  };
}

export function updateEventSuccess(
  event: IEventGraphQL
): UpdateEventSuccessAction {
  return {
    type: EventActionTypes.UPDATE_EVENT_SUCCESS,
    payload: {
      event,
    },
  };
}

// Failure

export interface UpdateEventFailureAction {
  type: typeof EventActionTypes.UPDATE_EVENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function updateEventFailure(errorMsg: string): UpdateEventFailureAction {
  return {
    type: EventActionTypes.UPDATE_EVENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Publish Event
 *******************************************************************************/

export interface PublishEventAction {
  type: typeof EventActionTypes.PUBLISH_EVENT;
  payload: {
    publishSiteIds: string[];
    unpublishSiteIds?: string[];
    published?: boolean;
  };
}

export function publishEvent(
  publishSiteIds: string[],
  unpublishSiteIds?: string[],
  published?: boolean
): PublishEventAction {
  return {
    type: EventActionTypes.PUBLISH_EVENT,
    payload: {
      publishSiteIds,
      unpublishSiteIds,
      published,
    },
  };
}

// Request

export interface PublishEventRequestAction {
  type: typeof EventActionTypes.PUBLISH_EVENT_REQUEST;
  payload: {
    publishSiteIds: string[];
    isEdit?: boolean;
    unpublishSiteIds?: string[];
    published?: boolean;
  };
}

export function publishEventRequest(
  publishSiteIds: string[],
  unpublishSiteIds?: string[],
  published?: boolean,
  isEdit?: boolean
): PublishEventRequestAction {
  return {
    type: EventActionTypes.PUBLISH_EVENT_REQUEST,
    payload: {
      publishSiteIds,
      unpublishSiteIds,
      published,
      isEdit,
    },
  };
}

// Success

export interface PublishEventSuccessAction {
  type: typeof EventActionTypes.PUBLISH_EVENT_SUCCESS;
  payload: {
    event: IEventGraphQL;
  };
}

export function publishEventSuccess(
  event: IEventGraphQL
): PublishEventSuccessAction {
  return {
    type: EventActionTypes.PUBLISH_EVENT_SUCCESS,
    payload: {
      event,
    },
  };
}

// Failure

export interface PublishEventFailureAction {
  type: typeof EventActionTypes.PUBLISH_EVENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function publishEventFailure(
  errorMsg: string
): PublishEventFailureAction {
  return {
    type: EventActionTypes.PUBLISH_EVENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Cache Events
 *******************************************************************************/

export interface CacheEventsAction {
  type: typeof EventActionTypes.CACHE_EVENTS;
  payload: {
    events: IEventGraphQL[];
  };
}

export function cacheEvents(events: IEventGraphQL[]): CacheEventsAction {
  return {
    type: EventActionTypes.CACHE_EVENTS,
    payload: {
      events,
    },
  };
}

/********************************************************************************
 *  Re-cache Event
 *******************************************************************************/

export interface ReCacheEventAction {
  type: typeof EventActionTypes.RE_CACHE_EVENT;
  payload: {
    eventId: string;
    fromRemote?: boolean;
  };
}

export function reCacheEvent(
  eventId: string,
  fromRemote?: boolean
): ReCacheEventAction {
  return {
    type: EventActionTypes.RE_CACHE_EVENT,
    payload: {
      eventId,
      fromRemote,
    },
  };
}

/********************************************************************************
 *  Re-cache Ticket Type
 *******************************************************************************/

export interface ReCacheTicketTypeAction {
  type: typeof EventActionTypes.RE_CACHE_TICKET_TYPE;
  payload: {
    eventId: string;
    ticketTypeId: string;
  };
}

export function reCacheTicketType(
  eventId: string,
  ticketTypeId: string
): ReCacheTicketTypeAction {
  return {
    type: EventActionTypes.RE_CACHE_TICKET_TYPE,
    payload: {
      eventId,
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Re-cache Upgrade Type
 *******************************************************************************/

export interface ReCacheUpgradeTypeAction {
  type: typeof EventActionTypes.RE_CACHE_UPGRADE_TYPE;
  payload: {
    eventId: string;
    upgradeTypeId: string;
  };
}

export function reCacheUpgradeType(
  eventId: string,
  upgradeTypeId: string
): ReCacheUpgradeTypeAction {
  return {
    type: EventActionTypes.RE_CACHE_UPGRADE_TYPE,
    payload: {
      eventId,
      upgradeTypeId,
    },
  };
}

/********************************************************************************
 *  Re-cache Promotion
 *******************************************************************************/

export interface ReCachePromotionAction {
  type: typeof EventActionTypes.RE_CACHE_PROMOTION;
  payload: {
    eventId: string;
    promotionId: string;
  };
}

export function reCachePromotion(
  eventId: string,
  promotionId: string
): ReCachePromotionAction {
  return {
    type: EventActionTypes.RE_CACHE_PROMOTION,
    payload: {
      eventId,
      promotionId,
    },
  };
}

/********************************************************************************
 *  Re-cache Custom Field
 *******************************************************************************/

export interface ReCacheCustomFieldAction {
  type: typeof EventActionTypes.RE_CACHE_CUSTOM_FIELD;
  payload: {
    eventId: string;
    customFieldId: string;
  };
}

export function reCacheCustomField(
  eventId: string,
  customFieldId: string
): ReCacheCustomFieldAction {
  return {
    type: EventActionTypes.RE_CACHE_CUSTOM_FIELD,
    payload: {
      eventId,
      customFieldId,
    },
  };
}

/********************************************************************************
 *  Event Fields
 *******************************************************************************/

/************************************************************
 *  Event Type
 ***********************************************************/
export interface SetEventTypeAction {
  type: typeof EventActionTypes.SET_EVENT_TYPE;
  payload: {
    eventId: string;
    eventType: EventTypeEnum;
  };
}

export function setEventType(
  eventId: string,
  eventType: EventTypeEnum
): SetEventTypeAction {
  return {
    type: EventActionTypes.SET_EVENT_TYPE,
    payload: {
      eventId,
      eventType,
    },
  };
}

/************************************************************
 *  Event Name
 ***********************************************************/
export interface SetEventNameAction {
  type: typeof EventActionTypes.SET_EVENT_NAME;
  payload: {
    eventId: string;
    name: string;
  };
}

export function setEventName(
  eventId: string,
  name: string
): SetEventNameAction {
  return {
    type: EventActionTypes.SET_EVENT_NAME,
    payload: {
      eventId,
      name,
    },
  };
}

/************************************************************
 *  Event Subtitle
 ***********************************************************/
export interface SetEventSubtitleAction {
  type: typeof EventActionTypes.SET_EVENT_SUBTITLE;
  payload: {
    eventId: string;
    subtitle: string;
  };
}

export function setEventSubtitle(
  eventId: string,
  subtitle: string
): SetEventSubtitleAction {
  return {
    type: EventActionTypes.SET_EVENT_SUBTITLE,
    payload: {
      eventId,
      subtitle,
    },
  };
}

/************************************************************
 *  Event Description
 ***********************************************************/
export interface SetEventDescriptionAction {
  type: typeof EventActionTypes.SET_EVENT_DESCRIPTION;
  payload: {
    eventId: string;
    description: string;
  };
}

export function setEventDescription(
  eventId: string,
  description: string
): SetEventDescriptionAction {
  return {
    type: EventActionTypes.SET_EVENT_DESCRIPTION,
    payload: {
      eventId,
      description,
    },
  };
}

/************************************************************
 *  Event Poster Image Url
 ***********************************************************/
export interface SetEventPosterImageUrlAction {
  type: typeof EventActionTypes.SET_EVENT_POSTER_IMAGE_URL;
  payload: {
    eventId: string;
    posterImageUrl: string;
  };
}

export function setEventPosterImageUrl(
  eventId: string,
  posterImageUrl: string
): SetEventPosterImageUrlAction {
  return {
    type: EventActionTypes.SET_EVENT_POSTER_IMAGE_URL,
    payload: {
      eventId,
      posterImageUrl,
    },
  };
}

/************************************************************
 *  Event Venue ID
 ***********************************************************/
export interface SetEventVenueIdAction {
  type: typeof EventActionTypes.SET_EVENT_VENUE_ID;
  payload: {
    eventId: string;
    venueId: string;
  };
}

export function setEventVenueId(
  eventId: string,
  venueId: string
): SetEventVenueIdAction {
  return {
    type: EventActionTypes.SET_EVENT_VENUE_ID,
    payload: {
      eventId,
      venueId,
    },
  };
}

/************************************************************
 *  Event Select Seating Chart
 ***********************************************************/
export interface SelectEventSeatingChartAction {
  type: typeof EventActionTypes.SELECT_EVENT_SEATING_CHART;
  payload: {
    eventId: string;
    seatingChartKey: string;
  };
}

export function selectEventSeatingChart(
  eventId: string,
  seatingChartKey: string
): SelectEventSeatingChartAction {
  return {
    type: EventActionTypes.SELECT_EVENT_SEATING_CHART,
    payload: {
      eventId,
      seatingChartKey,
    },
  };
}

// For creating after event id is generated
export interface SelectCreateEventSeatingChartAction {
  type: typeof EventActionTypes.SELECT_CREATE_EVENT_SEATING_CHART;
  payload: {
    event;
  };
}

export function selectCreateEventSeatingChart(
  event
): SelectCreateEventSeatingChartAction {
  return {
    type: EventActionTypes.SELECT_CREATE_EVENT_SEATING_CHART,
    payload: {
      event,
    },
  };
}

/************************************************************
 *  Event Set Seating Chart Fields
 ***********************************************************/
export interface SetEventSeatingChartFieldsAction {
  type: typeof EventActionTypes.SET_EVENT_SEATING_CHART_FIELDS;
  payload: {
    eventId: string;
    categories: any[];
  };
}

export function setEventSeatingChartFields(
  eventId: string,
  categories: any[]
): SetEventSeatingChartFieldsAction {
  return {
    type: EventActionTypes.SET_EVENT_SEATING_CHART_FIELDS,
    payload: {
      eventId,
      categories,
    },
  };
}

/************************************************************
 *  Event Seating Chart Key
 ***********************************************************/
export interface SetEventSeatingChartKeyAction {
  type: typeof EventActionTypes.SET_EVENT_SEATING_CHART_KEY;
  payload: {
    eventId: string;
    seatingChartKey: string;
  };
}

export function setEventSeatingChartKey(
  eventId: string,
  seatingChartKey: string
): SetEventSeatingChartKeyAction {
  return {
    type: EventActionTypes.SET_EVENT_SEATING_CHART_KEY,
    payload: {
      eventId,
      seatingChartKey,
    },
  };
}

/************************************************************
 *  Event Clear Seating Chart Fields
 ***********************************************************/
export interface ClearEventSeatingChartFieldsAction {
  type: typeof EventActionTypes.CLEAR_EVENT_SEATING_CHART_FIELDS;
  payload: {
    eventId: string;
  };
}

export function clearEventSeatingChartFields(
  eventId: string
): ClearEventSeatingChartFieldsAction {
  return {
    type: EventActionTypes.CLEAR_EVENT_SEATING_CHART_FIELDS,
    payload: {
      eventId,
    },
  };
}

/************************************************************
 *  Event Age
 ***********************************************************/
export interface SetEventAgeAction {
  type: typeof EventActionTypes.SET_EVENT_AGE;
  payload: {
    eventId: string;
    age: EventAgeEnum;
  };
}

export function setEventAge(
  eventId: string,
  age: EventAgeEnum
): SetEventAgeAction {
  return {
    type: EventActionTypes.SET_EVENT_AGE,
    payload: {
      eventId,
      age,
    },
  };
}

/************************************************************
 *  Event Season Id
 ***********************************************************/
export interface SetEventAddSeasonAction {
  type: typeof EventActionTypes.SET_EVENT_ADD_SEASON;
  payload: {
    eventId: string;
    seasonId: string;
  };
}

export function setEventAddSeason(
  eventId: string,
  seasonId: string
): SetEventAddSeasonAction {
  return {
    type: EventActionTypes.SET_EVENT_ADD_SEASON,
    payload: {
      eventId,
      seasonId,
    },
  };
}

/************************************************************
 *  Event TaxDeduction
 ***********************************************************/
export interface SetEventTaxDeductionAction {
  type: typeof EventActionTypes.SET_EVENT_TAX_DEDUCTION;
  payload: {
    eventId: string;
    taxDeduction: boolean;
  };
}

export function setEventTaxDeduction(
  eventId: string,
  taxDeduction: boolean
): SetEventTaxDeductionAction {
  return {
    type: EventActionTypes.SET_EVENT_TAX_DEDUCTION,
    payload: {
      eventId,
      taxDeduction,
    },
  };
}

/************************************************************
 *  Event Teg Integeration
 ***********************************************************/
export interface SetEventTegIntegerationAction {
  type: typeof EventActionTypes.SET_EVENT_TEG_INTEGERATION;
  payload: {
    eventId: string;
    isGuestTicketSale: boolean;
  };
}

export function setEventTegIntegeration(
  eventId: string,
  isGuestTicketSale: boolean
): SetEventTegIntegerationAction {
  return {
    type: EventActionTypes.SET_EVENT_TEG_INTEGERATION,
    payload: {
      eventId,
      isGuestTicketSale,
    },
  };
}

/************************************************************
 *  Event Guest Value
 ***********************************************************/
export interface SetEventGuestValueAction {
  type: typeof EventActionTypes.SET_EVENT_GUEST_VALUE;
  payload: {
    eventId: string;
    guestTicketPerMember: string;
  };
}

export function setEventGuestValue(
  eventId: string,
  guestTicketPerMember: string
): SetEventGuestValueAction {
  return {
    type: EventActionTypes.SET_EVENT_GUEST_VALUE,
    payload: {
      eventId,
      guestTicketPerMember,
    },
  };
}

/************************************************************
 *  Event User Agreement
 ***********************************************************/
export interface SetEventUserAgreementAction {
  type: typeof EventActionTypes.SET_EVENT_USER_AGREEMENT;
  payload: {
    eventId: string;
    userAgreement: string;
  };
}

export function setEventUserAgreement(
  eventId: string,
  userAgreement: string
): SetEventUserAgreementAction {
  return {
    type: EventActionTypes.SET_EVENT_USER_AGREEMENT,
    payload: {
      eventId,
      userAgreement,
    },
  };
}
/************************************************************
 *  Event Ticket Holds
 ***********************************************************/
export interface SetEventTicketHoldsAction {
  type: typeof EventActionTypes.SET_EVENT_TICKET_HOLDS;
  payload: {
    eventId: string;
    holds: ITicketHold[];
  };
}

export function SetEventTicketHolds(
  eventId: string,
  holds: ITicketHold[]
): SetEventTicketHoldsAction {
  return {
    type: EventActionTypes.SET_EVENT_TICKET_HOLDS,
    payload: {
      eventId,
      holds,
    },
  };
}
/************************************************************
 *  Event Process As
 ***********************************************************/
export interface SetEventProcessAsAction {
  type: typeof EventActionTypes.SET_EVENT_PROCESS_AS;
  payload: {
    eventId: string;
    processAs: EventProcessAsEnum;
  };
}

export function setEventProcessAs(
  eventId: string,
  processAs: EventProcessAsEnum
): SetEventProcessAsAction {
  return {
    type: EventActionTypes.SET_EVENT_PROCESS_AS,
    payload: {
      eventId,
      processAs,
    },
  };
}

/************************************************************
 *  Event Send QR Code
 ***********************************************************/
export interface SetEventSendQRCodeAction {
  type: typeof EventActionTypes.SET_EVENT_SEND_QR_CODE;
  payload: {
    eventId: string;
    sendQRCode: SendQRCodeEnum;
  };
}

export function setEventSendQRCode(
  eventId: string,
  sendQRCode: SendQRCodeEnum
): SetEventSendQRCodeAction {
  return {
    type: EventActionTypes.SET_EVENT_SEND_QR_CODE,
    payload: {
      eventId,
      sendQRCode,
    },
  };
}

/********************************************************************************
 *  Event Schedule
 *******************************************************************************/

/************************************************************
 *  Sales Begin Immediately
 ***********************************************************/

export interface SetEventSalesBeginImmediatelyAction {
  type: typeof EventActionTypes.SET_EVENT_SALES_BEGIN_IMMEDIATELY;
  payload: {
    eventId: string;
    salesBeginImmediately: boolean;
  };
}

export function setEventSalesBeginImmediately(
  eventId: string,
  salesBeginImmediately: boolean
): SetEventSalesBeginImmediatelyAction {
  return {
    type: EventActionTypes.SET_EVENT_SALES_BEGIN_IMMEDIATELY,
    payload: {
      eventId,
      salesBeginImmediately,
    },
  };
}

/************************************************************
 * Set Event Multi Days
 ***********************************************************/

export interface SetMultiDaysAction {
  type: typeof EventActionTypes.SET_EVENT_MULTI_DAYS;
  payload: {
    eventId: string;
    isMultipleDays: boolean;
  };
}

export function setMultiDays(
  eventId: string,
  isMultipleDays: boolean
): SetMultiDaysAction {
  return {
    type: EventActionTypes.SET_EVENT_MULTI_DAYS,
    payload: {
      eventId,
      isMultipleDays,
    },
  };
}

/************************************************************
 * Set Event TotalDays
 ***********************************************************/

export interface SetEventTotalDaysAction {
  type: typeof EventActionTypes.SET_EVENT_Total_Days;
  payload: {
    eventId: string;
    totalDays: string;
  };
}

export function setEventTotalDays(
  eventId: string,
  totalDays: string
): SetEventTotalDaysAction {
  return {
    type: EventActionTypes.SET_EVENT_Total_Days,
    payload: {
      eventId,
      totalDays,
    },
  };
}
/************************************************************
 * Set Event Ticket Delivery Type
 ***********************************************************/

export interface SetEventTicketDeliveryTypeAction {
  type: typeof EventActionTypes.SET_EVENT_TICKET_DELIVERY_TYPE;
  payload: {
    eventId: string;
    ticketDeliveryType: EventTicketDelivery;
  };
}

export function setEventTicketDeliveryType(
  eventId: string,
  ticketDeliveryType: EventTicketDelivery
): SetEventTicketDeliveryTypeAction {
  return {
    type: EventActionTypes.SET_EVENT_TICKET_DELIVERY_TYPE,
    payload: {
      eventId,
      ticketDeliveryType,
    },
  };
}
/************************************************************
 * Set Event Physical delivery instructions
 ***********************************************************/

export interface SetEventPhysicalDeliveryInstructionsAction {
  type: typeof EventActionTypes.SET_EVENT_DELIVERY_INSTRUCTIONS;
  payload: {
    eventId: string;
    physicalDeliveryInstructions: string;
  };
}

export function setEventphysicalDeliveryInstructions(
  eventId: string,
  physicalDeliveryInstructions: string
): SetEventPhysicalDeliveryInstructionsAction {
  return {
    type: EventActionTypes.SET_EVENT_DELIVERY_INSTRUCTIONS,
    payload: {
      eventId,
      physicalDeliveryInstructions,
    },
  };
}

/************************************************************
 * Add Multiple Days Event
 ***********************************************************/

export interface SetMultipleDaysEventAction {
  type: typeof EventActionTypes.ADD_MULTIPLE_DAYS_EVENT;
  payload: {
    eventId: string;
    performanceId: string;
    days: IPerformanceSchedule[];
  };
}

export function setMultipleDaysEvent(
  eventId: string,
  performanceId: string,
  days: IPerformanceSchedule[]
): SetMultipleDaysEventAction {
  return {
    type: EventActionTypes.ADD_MULTIPLE_DAYS_EVENT,
    payload: {
      eventId,
      performanceId,
      days,
    },
  };
}

/************************************************************
 *  Event Annouce At
 ***********************************************************/

export interface SetEventScheduleAnnounceAtAction {
  type: typeof EventActionTypes.SET_EVENT_SCHEDULE_ANNOUNCE_AT;
  payload: {
    eventId: string;
    announceAt: number;
  };
}

export function setEventScheduleAnnounceAt(
  eventId: string,
  announceAt: number
): SetEventScheduleAnnounceAtAction {
  return {
    type: EventActionTypes.SET_EVENT_SCHEDULE_ANNOUNCE_AT,
    payload: {
      eventId,
      announceAt,
    },
  };
}

/************************************************************
 *  Event Tickets At
 ***********************************************************/

export interface SetEventScheduleTicketsAtAction {
  type: typeof EventActionTypes.SET_EVENT_SCHEDULE_TICKETS_AT;
  payload: {
    eventId: string;
    ticketsAt: number;
  };
}

export function setEventScheduleTicketsAt(
  eventId: string,
  ticketsAt: number
): SetEventScheduleTicketsAtAction {
  return {
    type: EventActionTypes.SET_EVENT_SCHEDULE_TICKETS_AT,
    payload: {
      eventId,
      ticketsAt,
    },
  };
}

/************************************************************
 *  Event Tickets End At
 ***********************************************************/

export interface SetEventScheduleTicketsEndAtAction {
  type: typeof EventActionTypes.SET_EVENT_SCHEDULE_TICKETS_END_AT;
  payload: {
    eventId: string;
    ticketsEndAt: number;
  };
}

export function setEventScheduleTicketsEndAt(
  eventId: string,
  ticketsEndAt: number
): SetEventScheduleTicketsEndAtAction {
  return {
    type: EventActionTypes.SET_EVENT_SCHEDULE_TICKETS_END_AT,
    payload: {
      eventId,
      ticketsEndAt,
    },
  };
}

/************************************************************
 *  Event Starts At
 ***********************************************************/

export interface SetEventScheduleStartsAtAction {
  type: typeof EventActionTypes.SET_EVENT_SCHEDULE_STARTS_AT;
  payload: {
    eventId: string;
    startsAt: number;
  };
}

export function setEventScheduleStartsAt(
  eventId: string,
  startsAt: number
): SetEventScheduleStartsAtAction {
  return {
    type: EventActionTypes.SET_EVENT_SCHEDULE_STARTS_AT,
    payload: {
      eventId,
      startsAt,
    },
  };
}

/************************************************************
 *  Event Ends At
 ***********************************************************/

export interface SetEventScheduleEndsAtAction {
  type: typeof EventActionTypes.SET_EVENT_SCHEDULE_ENDS_AT;
  payload: {
    eventId: string;
    endsAt: number;
  };
}

export function setEventScheduleEndsAt(
  eventId: string,
  endsAt: number
): SetEventScheduleEndsAtAction {
  return {
    type: EventActionTypes.SET_EVENT_SCHEDULE_ENDS_AT,
    payload: {
      eventId,
      endsAt,
    },
  };
}

/********************************************************************************
 *  Performance Fields
 *******************************************************************************/

/************************************************************
Performance Add Headlining Artist
***********************************************************/

export interface AddPerformanceHeadliningArtistAction {
  type: typeof EventActionTypes.ADD_PERFORMANCE_HEADLINING_ARTIST;
  payload: {
    eventId: string;
    performanceId: string;
    artistId: string;
  };
}

export function addPerformanceHeadliningArtist(
  eventId: string,
  performanceId: string,
  artistId: string
): AddPerformanceHeadliningArtistAction {
  return {
    type: EventActionTypes.ADD_PERFORMANCE_HEADLINING_ARTIST,
    payload: {
      eventId,
      performanceId,
      artistId,
    },
  };
}

/************************************************************
 Performance Remove Headlining Artist
 ***********************************************************/

export interface RemovePerformanceHeadliningArtistAction {
  type: typeof EventActionTypes.REMOVE_PERFORMANCE_HEADLINING_ARTIST;
  payload: {
    eventId: string;
    performanceId: string;
    artistId: string;
  };
}

export function removePerformanceHeadliningArtist(
  eventId: string,
  performanceId: string,
  artistId: string
): RemovePerformanceHeadliningArtistAction {
  return {
    type: EventActionTypes.REMOVE_PERFORMANCE_HEADLINING_ARTIST,
    payload: {
      eventId,
      performanceId,
      artistId,
    },
  };
}

/************************************************************
 Performance Add Opening Artist
 ***********************************************************/

export interface AddPerformanceOpeningArtistAction {
  type: typeof EventActionTypes.ADD_PERFORMANCE_OPENING_ARTIST;
  payload: {
    eventId: string;
    performanceId: string;
    artistId: string;
  };
}

export function addPerformanceOpeningArtist(
  eventId: string,
  performanceId: string,
  artistId: string
): AddPerformanceOpeningArtistAction {
  return {
    type: EventActionTypes.ADD_PERFORMANCE_OPENING_ARTIST,
    payload: {
      eventId,
      performanceId,
      artistId,
    },
  };
}

/************************************************************
 Performance Remove Opening Artist
 ***********************************************************/

export interface RemovePerformanceOpeningArtistAction {
  type: typeof EventActionTypes.REMOVE_PERFORMANCE_OPENING_ARTIST;
  payload: {
    eventId: string;
    performanceId: string;
    artistId: string;
  };
}

export function removePerformanceOpeningArtist(
  eventId: string,
  performanceId: string,
  artistId: string
): RemovePerformanceOpeningArtistAction {
  return {
    type: EventActionTypes.REMOVE_PERFORMANCE_OPENING_ARTIST,
    payload: {
      eventId,
      performanceId,
      artistId,
    },
  };
}

/************************************************************
 Performance Song Link
 ***********************************************************/

export interface SetEventPerformanceSongLinkAction {
  type: typeof EventActionTypes.SET_EVENT_PERFORMANCE_SONG_LINK;
  payload: {
    eventId: string;
    performanceId: string;
    songLink: string;
  };
}

export function setEventPerformanceSongLink(
  eventId: string,
  performanceId: string,
  songLink: string
): SetEventPerformanceSongLinkAction {
  return {
    type: EventActionTypes.SET_EVENT_PERFORMANCE_SONG_LINK,
    payload: {
      eventId,
      performanceId,
      songLink,
    },
  };
}
/************************************************************
  Url Stub Link
 ***********************************************************/

 export interface SetEventUrlStubLinkAction {
  type: typeof EventActionTypes.SET_EVENT_URl_STUB;
  payload: {
    eventId: string;
    stub: string;
  };
}

export function setEventStubLink(
  eventId: string,
  stub: string
): SetEventUrlStubLinkAction {
  return {
    type: EventActionTypes.SET_EVENT_URl_STUB,
    payload: {
      eventId,
    stub
    },
  };
}

/************************************************************
 Performance Video Link
 ***********************************************************/

export interface setEventPerformanceVideoLinkAction {
  type: typeof EventActionTypes.SET_EVENT_PERFORMANCE_VIDEO_LINK;
  payload: {
    eventId: string;
    performanceId: string;
    videoLink: string;
  };
}

export function setEventPerformanceVideoLink(
  eventId: string,
  performanceId: string,
  videoLink: string
): setEventPerformanceVideoLinkAction {
  return {
    type: EventActionTypes.SET_EVENT_PERFORMANCE_VIDEO_LINK,
    payload: {
      eventId,
      performanceId,
      videoLink,
    },
  };
}

/************************************************************
 Publish on Sellout.io website
 ***********************************************************/

export interface setEventPublishableAction {
  type: typeof EventActionTypes.SET_EVENT_PUBLISHABLE;
  payload: {
    eventId: string;
    publishable: boolean;
  };
}

export function setEventPublishable(
  eventId: string,
  publishable: boolean
): setEventPublishableAction {
  return {
    type: EventActionTypes.SET_EVENT_PUBLISHABLE,
    payload: {
      eventId,
      publishable,
    },
  };
}

/************************************************************
 Performance Doors At
 ***********************************************************/

export interface SetPerformanceScheduleDoorsAtAction {
  type: typeof EventActionTypes.SET_PERFORMANCE_SCHEDULE_DOORS_AT;
  payload: {
    eventId: string;
    performanceId: string;
    doorsAt: number;
    index: number;
  };
}

export function setPerformanceScheduleDoorsAt(
  eventId: string,
  performanceId: string,
  doorsAt: number,
  index: number
): SetPerformanceScheduleDoorsAtAction {
  return {
    type: EventActionTypes.SET_PERFORMANCE_SCHEDULE_DOORS_AT,
    payload: {
      eventId,
      performanceId,
      doorsAt,
      index,
    },
  };
}

/************************************************************
 Performance Starts At
 ***********************************************************/

export interface SetPerformanceScheduleStartsAtAction {
  type: typeof EventActionTypes.SET_PERFORMANCE_SCHEDULE_STARTS_AT;
  payload: {
    eventId: string;
    performanceId: string;
    startsAt: number;
    index: number;
  };
}

export function setPerformanceScheduleStartsAt(
  eventId: string,
  performanceId: string,
  startsAt: number,
  index: number
): SetPerformanceScheduleStartsAtAction {
  return {
    type: EventActionTypes.SET_PERFORMANCE_SCHEDULE_STARTS_AT,
    payload: {
      eventId,
      performanceId,
      startsAt,
      index,
    },
  };
}

/************************************************************
 Performance Doors At
 ***********************************************************/

export interface SetPerformanceScheduleEndsAtAction {
  type: typeof EventActionTypes.SET_PERFORMANCE_SCHEDULE_ENDS_AT;
  payload: {
    eventId: string;
    performanceId: string;
    endsAt: number;
    index: number;
  };
}

export function setPerformanceScheduleEndsAt(
  eventId: string,
  performanceId: string,
  endsAt: number,
  index: number
): SetPerformanceScheduleEndsAtAction {
  return {
    type: EventActionTypes.SET_PERFORMANCE_SCHEDULE_ENDS_AT,
    payload: {
      eventId,
      performanceId,
      endsAt,
      index,
    },
  };
}
/********************************************************************************
 *  Ticket Type
 *******************************************************************************/

export interface SetTicketTypeAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE;
  payload: {
    eventId: string;
    ticketTypeId: string;
    ticketType: Partial<ITicketType>;
  };
}

export function setTicketType(
  eventId: string,
  ticketTypeId: string,
  ticketType: Partial<ITicketType>
): SetTicketTypeAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE,
    payload: {
      eventId,
      ticketTypeId,
      ticketType,
    },
  };
}

/************************************************************
Add Ticket Type
***********************************************************/

export interface AddTicketTypeAction {
  type: typeof EventActionTypes.ADD_TICKET_TYPE;
  payload: {
    eventId: string;
    setUrlParam: boolean;
  };
}

export function addTicketType(
  eventId: string,
  setUrlParam: boolean = true
): AddTicketTypeAction {
  return {
    type: EventActionTypes.ADD_TICKET_TYPE,
    payload: {
      eventId,
      setUrlParam,
    },
  };
}

/************************************************************
 Remove Ticket Type
 ***********************************************************/

export interface RemoveTicketTypeAction {
  type: typeof EventActionTypes.REMOVE_TICKET_TYPE;
  payload: {
    eventId: string;
    ticketTypeId: string;
  };
}

export function removeTicketType(
  eventId: string,
  ticketTypeId: string
): RemoveTicketTypeAction {
  return {
    type: EventActionTypes.REMOVE_TICKET_TYPE,
    payload: {
      eventId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Set Ticket Type Visible
 ***********************************************************/

export interface SetTicketTypeVisibleAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_VISIBLE;
  payload: {
    eventId: string;
    ticketTypeId: string;
    visible: boolean;
  };
}

export function setTicketTypeVisible(
  eventId: string,
  ticketTypeId: string,
  visible: boolean
): SetTicketTypeVisibleAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_VISIBLE,
    payload: {
      eventId,
      ticketTypeId,
      visible,
    },
  };
}

/************************************************************
Move Ticket Type Up
***********************************************************/

export interface MoveTicketTypeUpAction {
  type: typeof EventActionTypes.MOVE_TICKET_TYPE_UP;
  payload: {
    eventId: string;
    ticketTypeId: string;
  };
}

export function moveTicketTypeUp(
  eventId: string,
  ticketTypeId: string
): MoveTicketTypeUpAction {
  return {
    type: EventActionTypes.MOVE_TICKET_TYPE_UP,
    payload: {
      eventId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Move Ticket Type Down
 ***********************************************************/

export interface MoveTicketTypeDownAction {
  type: typeof EventActionTypes.MOVE_TICKET_TYPE_DOWN;
  payload: {
    eventId: string;
    ticketTypeId: string;
  };
}

export function moveTicketTypeDown(
  eventId: string,
  ticketTypeId: string
): MoveTicketTypeDownAction {
  return {
    type: EventActionTypes.MOVE_TICKET_TYPE_DOWN,
    payload: {
      eventId,
      ticketTypeId,
    },
  };
}

/************************************************************
Set Is Hold Ticket
***********************************************************/

export interface SetIsHoldAction {
  type: typeof EventActionTypes.SET_IS_HOLD;
  payload: {
    eventId: string;
    isHold: boolean;
  };
}

export function setIsHoldTicket(
  eventId: string,
  isHold: boolean
): SetIsHoldAction {
  return {
    type: EventActionTypes.SET_IS_HOLD,
    payload: {
      eventId,
      isHold,
    },
  };
}

/************************************************************
Set Ticket Hold
***********************************************************/

export interface SetTicketHoldAction {
  type: typeof EventActionTypes.SET_TICKET_HOLD;
  payload: {
    eventId: string;
    ticketHoldId: string;
    holds: any;
  };
}

export function setTicketHold(
  eventId: string,
  ticketHoldId: string,
  holds: any
): SetTicketHoldAction {
  return {
    type: EventActionTypes.SET_TICKET_HOLD,
    payload: {
      eventId,
      ticketHoldId,
      holds,
    },
  };
}

/************************************************************
Add Ticket Holds
***********************************************************/

export interface AddTicketHoldsAction {
  type: typeof EventActionTypes.ADD_TICKET_HOLD;
  payload: {
    eventId: string;
    setUrlParam: boolean;
  };
}

export function addTicketHolds(
  eventId: string,
  setUrlParam: boolean = true
): AddTicketHoldsAction {
  return {
    type: EventActionTypes.ADD_TICKET_HOLD,
    payload: {
      eventId,
      setUrlParam,
    },
  };
}

/************************************************************
 Remove Ticket Type
 ***********************************************************/

 export interface RemoveTicketHoldAction {
  type: typeof EventActionTypes.REMOVE_TICKET_HOLD;
  payload: {
    eventId: string;
    ticketHoldId: string;
  };
}

export function removeTicketHold(
  eventId: string,
  ticketHoldId: string
): RemoveTicketHoldAction {
  return {
    type: EventActionTypes.REMOVE_TICKET_HOLD,
    payload: {
      eventId,
      ticketHoldId,
    },
  };
}

/************************************************************
 Ticket Type Name
 ***********************************************************/

export interface SetTicketTypeNameAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_NAME;
  payload: {
    eventId: string;
    ticketTypeId: string;
    name: string;
  };
}

export function setTicketTypeName(
  eventId: string,
  ticketTypeId: string,
  name: string
): SetTicketTypeNameAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_NAME,
    payload: {
      eventId,
      ticketTypeId,
      name,
    },
  };
}

/************************************************************
 *  Ticket Type values
 ***********************************************************/
export interface SetTicketTypeValuesAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_VALUES;
  payload: {
    eventId: string;
    ticketTypeId: string;
    values: string;
  };
}

export function setTicketTypeValues(
  eventId: string,
  ticketTypeId: string,
  values: string
): SetTicketTypeValuesAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_VALUES,
    payload: {
      eventId,
      ticketTypeId,
      values,
    },
  };
}

/************************************************************
 Ticket Type Qty
 ***********************************************************/

export interface SetTicketTypeQtyAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_QTY;
  payload: {
    eventId: string;
    ticketTypeId: string;
    qty: number;
  };
}

export function setTicketTypeQty(
  eventId: string,
  ticketTypeId: string,
  qty: number
): SetTicketTypeQtyAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_QTY,
    payload: {
      eventId,
      ticketTypeId,
      qty,
    },
  };
}

/************************************************************
 Ticket Type Purchase Limit
 ***********************************************************/

export interface SetTicketTypePurchaseLimitAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_PURCHASE_LIMIT;
  payload: {
    eventId: string;
    ticketTypeId: string;
    purchaseLimit: number;
  };
}

export function setTicketTypePurchaseLimit(
  eventId: string,
  ticketTypeId: string,
  purchaseLimit: number
): SetTicketTypePurchaseLimitAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_PURCHASE_LIMIT,
    payload: {
      eventId,
      ticketTypeId,
      purchaseLimit,
    },
  };
}

/************************************************************
 Ticket Type Description
 ***********************************************************/

export interface SetTicketTypeDescriptionAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_DESCRIPTION;
  payload: {
    eventId: string;
    ticketTypeId: string;
    description: string;
  };
}

export function setTicketTypeDescription(
  eventId: string,
  ticketTypeId: string,
  description: string
): SetTicketTypeDescriptionAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_DESCRIPTION,
    payload: {
      eventId,
      ticketTypeId,
      description,
    },
  };
}

/********************************************************************************
 *  Ticket Type Tier
 *******************************************************************************/

/************************************************************
Set Ticket Type Tier
***********************************************************/

export interface SetTicketTypeTierAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_TIER;
  payload: {
    eventId: string;
    ticketTypeId: string;
    tierId: string;
    tier: Partial<ITicketTier>;
  };
}

export function setTicketTypeTier(
  eventId: string,
  ticketTypeId: string,
  tierId: string,
  tier: Partial<ITicketTier>
): SetTicketTypeTierAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_TIER,
    payload: {
      eventId,
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
  type: typeof EventActionTypes.SET_IS_USING_PRICING_TIERS;
  payload: {
    isUsingPricingTiers: boolean;
  };
}

export function setIsUsingPricingTiers(
  isUsingPricingTiers: boolean
): SetIsUsingPricingTiersAction {
  return {
    type: EventActionTypes.SET_IS_USING_PRICING_TIERS,
    payload: {
      isUsingPricingTiers,
    },
  };
}

/************************************************************
 Add Ticket Type Tier
 ***********************************************************/

export interface SetTicketTypeTierEndsAtAction {
  type: typeof EventActionTypes.SET_TICKET_TYPE_TIER_ENDS_AT;
  payload: {
    eventId: string;
    ticketTypeId: string;
    tierId: string;
    endsAt: number | null;
  };
}

export function setTicketTypeTierEndsAt(
  eventId: string,
  ticketTypeId: string,
  tierId: string,
  endsAt: number | null
): SetTicketTypeTierEndsAtAction {
  return {
    type: EventActionTypes.SET_TICKET_TYPE_TIER_ENDS_AT,
    payload: {
      eventId,
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
  type: typeof EventActionTypes.ADD_TICKET_TYPE_TIER;
  payload: {
    eventId: string;
    ticketTypeId: string;
  };
}

export function addTicketTypeTier(
  eventId: string,
  ticketTypeId: string
): AddTicketTypeTierAction {
  return {
    type: EventActionTypes.ADD_TICKET_TYPE_TIER,
    payload: {
      eventId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Ticket Type Tier
 ***********************************************************/

export interface RemoveTicketTypeTierAction {
  type: typeof EventActionTypes.REMOVE_TICKET_TYPE_TIER;
  payload: {
    eventId: string;
    ticketTypeId: string;
    tierId: string;
  };
}

export function removeTicketTypeTier(
  eventId: string,
  ticketTypeId: string,
  tierId: string
): RemoveTicketTypeTierAction {
  return {
    type: EventActionTypes.REMOVE_TICKET_TYPE_TIER,
    payload: {
      eventId,
      ticketTypeId,
      tierId,
    },
  };
}

/********************************************************************************
 *  Upgrade Type
 *******************************************************************************/

export interface SetUpgradeTypeAction {
  type: typeof EventActionTypes.SET_UPGRADE_TYPE;
  payload: {
    eventId: string;
    upgradeTypeId: string;
    upgradeType: Partial<IEventUpgrade>;
  };
}

export function setUpgradeType(
  eventId: string,
  upgradeTypeId: string,
  upgradeType: Partial<IEventUpgrade>
): SetUpgradeTypeAction {
  return {
    type: EventActionTypes.SET_UPGRADE_TYPE,
    payload: {
      eventId,
      upgradeTypeId,
      upgradeType,
    },
  };
}

/************************************************************
Add Upgrade Type
***********************************************************/

export interface AddUpgradeTypeAction {
  type: typeof EventActionTypes.ADD_UPGRADE_TYPE;
  payload: {
    eventId: string;
  };
}

export function addUpgradeType(eventId: string): AddUpgradeTypeAction {
  return {
    type: EventActionTypes.ADD_UPGRADE_TYPE,
    payload: {
      eventId,
    },
  };
}

/************************************************************
 Remove Upgrade Type
 ***********************************************************/

export interface RemoveUpgradeTypeAction {
  type: typeof EventActionTypes.REMOVE_UPGRADE_TYPE;
  payload: {
    eventId: string;
    upgradeTypeId: string;
  };
}

export function removeUpgradeType(
  eventId: string,
  upgradeTypeId: string
): RemoveUpgradeTypeAction {
  return {
    type: EventActionTypes.REMOVE_UPGRADE_TYPE,
    payload: {
      eventId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Set Upgrade Type Visible
 ***********************************************************/

export interface SetUpgradeTypeVisibleAction {
  type: typeof EventActionTypes.SET_UPGRADE_TYPE_VISIBLE;
  payload: {
    eventId: string;
    upgradeTypeId: string;
    visible: boolean;
  };
}

export function setUpgradeTypeVisible(
  eventId: string,
  upgradeTypeId: string,
  visible: boolean
): SetUpgradeTypeVisibleAction {
  return {
    type: EventActionTypes.SET_UPGRADE_TYPE_VISIBLE,
    payload: {
      eventId,
      upgradeTypeId,
      visible,
    },
  };
}

/************************************************************
Move Upgrade Type Up
***********************************************************/

export interface MoveUpgradeTypeUpAction {
  type: typeof EventActionTypes.MOVE_UPGRADE_TYPE_UP;
  payload: {
    eventId: string;
    upgradeTypeId: string;
  };
}

export function moveUpgradeTypeUp(
  eventId: string,
  upgradeTypeId: string
): MoveUpgradeTypeUpAction {
  return {
    type: EventActionTypes.MOVE_UPGRADE_TYPE_UP,
    payload: {
      eventId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Move Upgrade Type Down
 ***********************************************************/

export interface MoveUpgradeTypeDownAction {
  type: typeof EventActionTypes.MOVE_UPGRADE_TYPE_DOWN;
  payload: {
    eventId: string;
    upgradeTypeId: string;
  };
}

export function moveUpgradeTypeDown(
  eventId: string,
  upgradeTypeId: string
): MoveUpgradeTypeDownAction {
  return {
    type: EventActionTypes.MOVE_UPGRADE_TYPE_DOWN,
    payload: {
      eventId,
      upgradeTypeId,
    },
  };
}

/************************************************************
 Add Upgrade Type Ticket Type Id
 ***********************************************************/

export interface AddUpgradeTypeTicketTypeIdAction {
  type: typeof EventActionTypes.ADD_UPGRADE_TYPE_TICKET_TYPE_ID;
  payload: {
    eventId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  };
}

export function addUpgradeTypeTicketTypeId(
  eventId: string,
  upgradeTypeId: string,
  ticketTypeId: string
): AddUpgradeTypeTicketTypeIdAction {
  return {
    type: EventActionTypes.ADD_UPGRADE_TYPE_TICKET_TYPE_ID,
    payload: {
      eventId,
      upgradeTypeId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Upgrade Type Ticket Type Id
 ***********************************************************/

export interface RemoveUpgradeTypeTicketTypeIdAction {
  type: typeof EventActionTypes.REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID;
  payload: {
    eventId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  };
}

export function removeUpgradeTypeTicketTypeId(
  eventId: string,
  upgradeTypeId: string,
  ticketTypeId: string
): RemoveUpgradeTypeTicketTypeIdAction {
  return {
    type: EventActionTypes.REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID,
    payload: {
      eventId,
      upgradeTypeId,
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Promotion
 *******************************************************************************/

export interface SetPromotionAction {
  type: typeof EventActionTypes.SET_PROMOTION;
  payload: {
    eventId: string;
    promotionId: string;
    promotion: Partial<IEventPromotion>;
  };
}

export function setPromotion(
  eventId: string,
  promotionId: string,
  promotion: Partial<IEventPromotion>
): SetPromotionAction {
  return {
    type: EventActionTypes.SET_PROMOTION,
    payload: {
      eventId,
      promotionId,
      promotion,
    },
  };
}

/************************************************************
Add Promotion
***********************************************************/

export interface AddPromotionAction {
  type: typeof EventActionTypes.ADD_PROMOTION;
  payload: {
    eventId: string;
  };
}

export function addPromotion(eventId: string): AddPromotionAction {
  return {
    type: EventActionTypes.ADD_PROMOTION,
    payload: {
      eventId,
    },
  };
}

/************************************************************
 Remove Promotion
 ***********************************************************/

export interface RemovePromotionAction {
  type: typeof EventActionTypes.REMOVE_PROMOTION;
  payload: {
    eventId: string;
    promotionId: string;
  };
}

export function removePromotion(
  eventId: string,
  promotionId: string
): RemovePromotionAction {
  return {
    type: EventActionTypes.REMOVE_PROMOTION,
    payload: {
      eventId,
      promotionId,
    },
  };
}

/************************************************************
 Set Promotion Active
 ***********************************************************/

export interface SetPromotionActiveAction {
  type: typeof EventActionTypes.SET_PROMOTION_ACTIVE;
  payload: {
    eventId: string;
    promotionId: string;
    active: boolean;
  };
}

export function setPromotionActive(
  eventId: string,
  promotionId: string,
  active: boolean
): SetPromotionActiveAction {
  return {
    type: EventActionTypes.SET_PROMOTION_ACTIVE,
    payload: {
      eventId,
      promotionId,
      active,
    },
  };
}

/************************************************************
Move Promotion Up
***********************************************************/

export interface MovePromotionUpAction {
  type: typeof EventActionTypes.MOVE_PROMOTION_UP;
  payload: {
    eventId: string;
    promotionId: string;
  };
}

export function movePromotionUp(
  eventId: string,
  promotionId: string
): MovePromotionUpAction {
  return {
    type: EventActionTypes.MOVE_PROMOTION_UP,
    payload: {
      eventId,
      promotionId,
    },
  };
}

/************************************************************
 Move Promotion Down
 ***********************************************************/

export interface MovePromotionDownAction {
  type: typeof EventActionTypes.MOVE_PROMOTION_DOWN;
  payload: {
    eventId: string;
    promotionId: string;
  };
}

export function movePromotionDown(
  eventId: string,
  promotionId: string
): MovePromotionDownAction {
  return {
    type: EventActionTypes.MOVE_PROMOTION_DOWN,
    payload: {
      eventId,
      promotionId,
    },
  };
}

/************************************************************
 Add Promotion Ticket Type Id
 ***********************************************************/

export interface AddPromotionTicketTypeIdAction {
  type: typeof EventActionTypes.ADD_PROMOTION_TICKET_TYPE_ID;
  payload: {
    eventId: string;
    promotionId: string;
    ticketTypeId: string;

  };
}

export function addPromotionTicketTypeId(
  eventId: string,
  promotionId: string,
  ticketTypeId: string,
): AddPromotionTicketTypeIdAction {
  return {
    type: EventActionTypes.ADD_PROMOTION_TICKET_TYPE_ID,
    payload: {
      eventId,
      promotionId,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Promotion Ticket Type Id
 ***********************************************************/

export interface RemovePromotionTicketTypeIdAction {
  type: typeof EventActionTypes.REMOVE_PROMOTION_TICKET_TYPE_ID;
  payload: {
    eventId: string;
    promotionId: string;
    ticketTypeId: string;
  };
}

export function removePromotionTicketTypeId(
  eventId: string,
  promotionId: string,
  ticketTypeId: string
): RemovePromotionTicketTypeIdAction {
  return {
    type: EventActionTypes.REMOVE_PROMOTION_TICKET_TYPE_ID,
    payload: {
      eventId,
      promotionId,
      ticketTypeId,
    },
  };
}
/************************************************************
 Add Promotion Upgrade Type Id
 ***********************************************************/

 export interface AddPromotionUpgradeTypeIdAction {
  type: typeof EventActionTypes.ADD_PROMOTION_UPGRADE_TYPE_ID;
  payload: {
    eventId: string;
    promotionId: string;
    upgradeId:string

  };
}

export function addPromotionUpgradeTypeId(
  eventId: string,
  promotionId: string,
  upgradeId:string
): AddPromotionUpgradeTypeIdAction {
  return {
    type: EventActionTypes.ADD_PROMOTION_UPGRADE_TYPE_ID,
    payload: {
      eventId,
      promotionId,
      upgradeId
    },
  };
}

/************************************************************
 Remove Promotion Upgrade Type Id
 ***********************************************************/

export interface RemovePromotionUpgradeTypeIdAction {
  type: typeof EventActionTypes.REMOVE_PROMOTION_UPGRADE_TYPE_ID;
  payload: {
    eventId: string;
    promotionId: string;
    upgradeId: string;
  };
}

export function removePromotionUpgradeTypeId(
  eventId: string,
  promotionId: string,
  upgradeId:string
): RemovePromotionUpgradeTypeIdAction {
  return {
    type: EventActionTypes.REMOVE_PROMOTION_UPGRADE_TYPE_ID,
    payload: {
      eventId,
      promotionId,
      upgradeId
    },
  };
}
/************************************************************
 Add Event Days on Ticket type 
 ***********************************************************/

export interface AddEventDaysOnTicketTypeAction {
  type: typeof EventActionTypes.ADD_EVENT_DAYS_ON_TICKET_TYPE;
  payload: {
    eventId: string;
    eventDay: string;
    ticketTypeId: string;
  };
}

export function addEventDaysOnTicketType(
  eventId: string,
  eventDay: string,
  ticketTypeId: string
): AddEventDaysOnTicketTypeAction {
  return {
    type: EventActionTypes.ADD_EVENT_DAYS_ON_TICKET_TYPE,
    payload: {
      eventId,
      eventDay,
      ticketTypeId,
    },
  };
}

/************************************************************
 Remove Event Days on Ticket type
 ***********************************************************/

export interface RemoveEventDaysOnTicketTypeAction {
  type: typeof EventActionTypes.REMOVE_EVENT_DAYS_ON_TICKET_TYPE;
  payload: {
    eventId: string;
    eventDay: string;
    ticketTypeId: string;
  };
}

export function removeEventDaysOnTicketType(
  eventId: string,
  eventDay: string,
  ticketTypeId: string
): RemoveEventDaysOnTicketTypeAction {
  return {
    type: EventActionTypes.REMOVE_EVENT_DAYS_ON_TICKET_TYPE,
    payload: {
      eventId,
      eventDay,
      ticketTypeId,
    },
  };
}

/********************************************************************************
 *  Custom Field
 *******************************************************************************/

export interface SetCustomFieldAction {
  type: typeof EventActionTypes.SET_CUSTOM_FIELD;
  payload: {
    eventId: string;
    customFieldId: string;
    customField: Partial<IEventCustomField>;
  };
}

export function setCustomField(
  eventId: string,
  customFieldId: string,
  customField: Partial<IEventCustomField>
): SetCustomFieldAction {
  return {
    type: EventActionTypes.SET_CUSTOM_FIELD,
    payload: {
      eventId,
      customFieldId,
      customField,
    },
  };
}

/************************************************************
Add Custom Field
***********************************************************/

export interface AddCustomFieldAction {
  type: typeof EventActionTypes.ADD_CUSTOM_FIELD;
  payload: {
    eventId: string;
  };
}

export function addCustomField(eventId: string): AddCustomFieldAction {
  return {
    type: EventActionTypes.ADD_CUSTOM_FIELD,
    payload: {
      eventId,
    },
  };
}

/************************************************************
 Remove Custom Field
 ***********************************************************/

export interface RemoveCustomFieldAction {
  type: typeof EventActionTypes.REMOVE_CUSTOM_FIELD;
  payload: {
    eventId: string;
    customFieldId: string;
  };
}

export function removeCustomField(
  eventId: string,
  customFieldId: string
): RemoveCustomFieldAction {
  return {
    type: EventActionTypes.REMOVE_CUSTOM_FIELD,
    payload: {
      eventId,
      customFieldId,
    },
  };
}

/************************************************************
Move Custom Field Up
***********************************************************/

export interface MoveCustomFieldUpAction {
  type: typeof EventActionTypes.MOVE_CUSTOM_FIELD_UP;
  payload: {
    eventId: string;
    customFieldId: string;
  };
}

export function moveCustomFieldUp(
  eventId: string,
  customFieldId: string
): MoveCustomFieldUpAction {
  return {
    type: EventActionTypes.MOVE_CUSTOM_FIELD_UP,
    payload: {
      eventId,
      customFieldId,
    },
  };
}

/************************************************************
 Move Custom Field Down
 ***********************************************************/

export interface MoveCustomFieldDownAction {
  type: typeof EventActionTypes.MOVE_CUSTOM_FIELD_DOWN;
  payload: {
    eventId: string;
    customFieldId: string;
  };
}

export function moveCustomFieldDown(
  eventId: string,
  customFieldId: string
): MoveCustomFieldDownAction {
  return {
    type: EventActionTypes.MOVE_CUSTOM_FIELD_DOWN,
    payload: {
      eventId,
      customFieldId,
    },
  };
}

/************************************************************
 Add Custom Field Option
 ***********************************************************/

export interface AddCustomFieldOptionAction {
  type: typeof EventActionTypes.ADD_CUSTOM_FIELD_OPTION;
  payload: {
    eventId: string;
    customFieldId: string;
  };
}

export function addCustomFieldOption(
  eventId: string,
  customFieldId: string
): AddCustomFieldOptionAction {
  return {
    type: EventActionTypes.ADD_CUSTOM_FIELD_OPTION,
    payload: {
      eventId,
      customFieldId,
    },
  };
}

/************************************************************
 Remove Custom Field Option
 ***********************************************************/

export interface RemoveCustomFieldOptionAction {
  type: typeof EventActionTypes.REMOVE_CUSTOM_FIELD_OPTION;
  payload: {
    eventId: string;
    customFieldId: string;
    optionIndex: number;
  };
}

export function removeCustomFieldOption(
  eventId: string,
  customFieldId: string,
  optionIndex: number
): RemoveCustomFieldOptionAction {
  return {
    type: EventActionTypes.REMOVE_CUSTOM_FIELD_OPTION,
    payload: {
      eventId,
      customFieldId,
      optionIndex,
    },
  };
}

/************************************************************
 Set Custom Field Active
 ***********************************************************/

export interface SetCustomFieldActiveAction {
  type: typeof EventActionTypes.SET_CUSTOM_FIELD_ACTIVE;
  payload: {
    eventId: string;
    customFieldId: string;
    active: boolean;
  };
}

export function setCustomFieldActive(
  eventId: string,
  customFieldId: string,
  active: boolean
): SetCustomFieldActiveAction {
  return {
    type: EventActionTypes.SET_CUSTOM_FIELD_ACTIVE,
    payload: {
      eventId,
      customFieldId,
      active,
    },
  };
}

/************************************************************
 Set Custom Field Option
 ***********************************************************/

export interface SetCustomFieldOptionAction {
  type: typeof EventActionTypes.SET_CUSTOM_FIELD_OPTION;
  payload: {
    eventId: string;
    customFieldId: string;
    optionIndex: number;
    option: string;
  };
}

export function setCustomFieldOption(
  eventId: string,
  customFieldId: string,
  optionIndex: number,
  option: string
): SetCustomFieldOptionAction {
  return {
    type: EventActionTypes.SET_CUSTOM_FIELD_OPTION,
    payload: {
      eventId,
      customFieldId,
      optionIndex,
      option,
    },
  };
}

/********************************************************************************
 *  Delete Event
 *******************************************************************************/
export interface DeleteEventAction {
  type: typeof EventActionTypes.DELETE_EVENT;
  payload: {
    //orgId: string;
    eventId?: string;
    dryRun?: boolean;
    refundReason?: string;
    eventType?: string;
  };
}

export function deleteEvent(
  eventId?: string,
  dryRun?: boolean,
  refundReason?: string,
  eventType?: string
): DeleteEventAction {
  return {
    type: EventActionTypes.DELETE_EVENT,
    payload: {
      // orgId,
      eventId,
      dryRun,
      refundReason,
      eventType,
    },
  };
}

// Success
export interface DeleteEventSuccessAction {
  type: typeof EventActionTypes.DELETE_EVENT_SUCCESS;
  payload: {
    eventId: string;
  };
}

export function deleteEventSuccess(eventId: string): DeleteEventSuccessAction {
  return {
    type: EventActionTypes.DELETE_EVENT_SUCCESS,
    payload: {
      eventId,
    },
  };
}

// Failure
export interface DeleteEventFailureAction {
  type: typeof EventActionTypes.DELETE_EVENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function deleteEventFailure(errorMsg: string): DeleteEventFailureAction {
  return {
    type: EventActionTypes.DELETE_EVENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}
