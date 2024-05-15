import {
  SeasonActionTypes,
  SeasonActionCreatorTypes,
  SetSeasonIdAction,
  SetSeasonNameAction,
  SetSeasonSubtitleAction,
  SetSeasonVenueIdAction,
  SetSeasonDescriptionAction,
  SetSeasonAgeAction,
  SetSeasonPerformanceSongLinkAction,
  setSeasonPerformanceVideoLinkAction,
  setSeasonPublishableAction,
  SetSeasonPosterImageUrlAction,
  SetSeasonScheduleAnnounceAtAction,
  SetSeasonScheduleTicketsAtAction,
  SetSeasonScheduleTicketsEndAtAction,
  SetSeasonScheduleStartsAtAction,
  SetSeasonScheduleEndsAtAction,
  SetSeasonSendQRCodeAction,
  SetUpgradeTypeIdAction,
  SetSeasonSeatingChartFieldsAction,
  SetSeasonSeatingChartKeyAction,
  ClearSeasonSeatingChartFieldsAction,
  SetTicketTypeIdAction,
  SetSeasonUserAgreementAction,
  CreateSeasonSuccessAction,
  SetSeasonTaxDeductionAction,
  SetSeasonSalesBeginImmediatelyAction,
  // Upgrade Type
  SetUpgradeTypeAction,
  AddUpgradeTypeAction,
  RemoveUpgradeTypeAction,
  SetUpgradeTypeVisibleAction,
  MoveUpgradeTypeUpAction,
  MoveUpgradeTypeDownAction,
  AddUpgradeTypeTicketTypeIdAction,
  RemoveUpgradeTypeTicketTypeIdAction,
  // Promotion
  SetPromotionIdAction,
  SetPromotionAction,
  AddPromotionAction,
  RemovePromotionAction,
  SetPromotionActiveAction,
  MovePromotionUpAction,
  MovePromotionDownAction,
  AddPromotionTicketTypeIdAction,
  RemovePromotionTicketTypeIdAction,
  // Custom Field
  SetCustomFieldAction,
  AddCustomFieldAction,
  RemoveSeasonCustomFieldAction,
  SetCustomFieldActiveAction,
  MoveCustomFieldUpAction,
  MoveCustomFieldDownAction,
  AddCustomFieldOptionAction,
  RemoveCustomFieldOptionAction,
  SetCustomFieldOptionAction,
  SetCustomFieldIdAction,
  // Cache Season
  CacheSeasonsAction,
  PublishSeasonSuccessAction,
  PublishSeasonFailureAction,
  // Ticket Type Tier
  SetTicketTypeTierAction,
  SetIsUsingPricingTiersAction,
  SetTicketTypeTierEndsAtAction,
  AddTicketTypeTierAction,
  RemoveTicketTypeTierAction,
  //Ticket Type
  SetTicketTypeAction,
  AddSeasonTicketTypeAction,
  SetTicketTypeValuesAction,
  RemoveTicketTypeAction,
  SetTicketTypeVisibleAction,
  MoveTicketTypeUpAction,
  MoveTicketTypeDownAction,
  SetTicketTypeNameAction,
  SetTicketTypeQtyAction,
  SetTicketTypePurchaseLimitAction,
  SetTicketTypeDescriptionAction,
  // AddSeasonDaysOnTicketTypeAction,
  // RemoveSeasonDaysOnTicketTypeAction,
} from "../actions/season.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import ISeason, {
  ISeasonGraphQL,
  SendQRCodeEnum,
} from "@sellout/models/.dist/interfaces/ISeason";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import seasonState, {
  ticketTypeState,
  ticketTierState,
  seasonPromotionState,
  upgradeState,
  seasonCustomFieldState,
} from "../../models/states/season.state";
import { SeasonAgeEnum } from "@sellout/models/.dist/interfaces/ISeason";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
// import IseasonSchedule from "@sellout/models/.dist/interfaces/IseasonSchedule";
// import IseasonUpgrade from "@sellout/models/.dist/interfaces/IseasonUpgrade";
import shortid from "shortid";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";

export const NEW_SEASON_ID: string = "new";

export type SeasonReducerState = {
  seasonId: string;
  upgradeTypeId: string;
  promotionId: string;
  ticketTypeId: string;
  saving: boolean;
  errorMsg: string;
  customFieldId: string;
  seasonCache: ISeasonCache;
  isUsingPricingTiers: boolean;
  publishing: boolean;
  publishable: boolean;
};

export interface ISeasonCache {
  [seasonId: string]: ISeasonGraphQL;
}

function SeasonReducerState(): SeasonReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const {
    seasonId = "",
    upgradeTypeId = "",
    promotionId = "",
    ticketTypeId = "",
    customFieldId = "",
  }: UrlParams = query;
  return {
    seasonId,
    upgradeTypeId,
    promotionId,
    ticketTypeId,
    customFieldId,
    saving: false,
    errorMsg: "",
    publishing: false,
    publishable: false,
    isUsingPricingTiers: false,
    seasonCache: {
      [NEW_SEASON_ID]: seasonState(),
    },
  };
}

export default function reducer(
  state = SeasonReducerState(),
  action: SeasonActionCreatorTypes
) {
  const { type, payload } = action;
  switch (type) {
    /********************************************************************************
     *  General Season Reducers
     *******************************************************************************/

    case SeasonActionTypes.SET_SEASON_ID:
      return setSeasonId(state, payload as SetSeasonIdAction["payload"]);

    case SeasonActionTypes.SET_SEASON_NAME:
      return setSeasonName(state, payload as SetSeasonNameAction["payload"]);
    case SeasonActionTypes.SET_SEASON_SUBTITLE:
      return setSeasonSubtitle(
        state,
        payload as SetSeasonSubtitleAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_VENUE_ID:
      return setSeasonVenueId(
        state,
        payload as SetSeasonVenueIdAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_DESCRIPTION:
      return setSeasonDescription(
        state,
        payload as SetSeasonDescriptionAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_AGE:
      return setSeasonAge(state, payload as SetSeasonAgeAction["payload"]);
    case SeasonActionTypes.SET_SEASON_PERFORMANCE_SONG_LINK:
      return setSeasonPerformanceSongLink(
        state,
        payload as SetSeasonPerformanceSongLinkAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_PERFORMANCE_VIDEO_LINK:
      return setSeasonPerformanceVideoLink(
        state,
        payload as setSeasonPerformanceVideoLinkAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_PUBLISHABLE:
      return setSeasonPublishable(
        state,
        payload as setSeasonPublishableAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_POSTER_IMAGE_URL:
      return setSeasonPosterImageUrl(
        state,
        payload as SetSeasonPosterImageUrlAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_SCHEDULE_ANNOUNCE_AT:
      return setSeasonScheduleAnnounceAt(
        state,
        payload as SetSeasonScheduleAnnounceAtAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_AT:
      return setSeasonScheduleTicketsAt(
        state,
        payload as SetSeasonScheduleTicketsAtAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SCHEDULE_TICKETS_END_AT:
      return setSeasonScheduleTicketsEndAt(
        state,
        payload as SetSeasonScheduleTicketsEndAtAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SCHEDULE_STARTS_AT:
      return setSeasonScheduleStartsAt(
        state,
        payload as SetSeasonScheduleStartsAtAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SCHEDULE_ENDS_AT:
      return setSeasonScheduleEndsAt(
        state,
        payload as SetSeasonScheduleEndsAtAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SEND_QR_CODE:
      return setSeasonSendQRCode(
        state,
        payload as SetSeasonSendQRCodeAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SEATING_CHART_FIELDS:
      return setSeasonSeatingChartFields(
        state,
        payload as SetSeasonSeatingChartFieldsAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_SEATING_CHART_KEY:
      return setSeasonSeatingChartKey(
        state,
        payload as SetSeasonSeatingChartKeyAction["payload"]
      );
    case SeasonActionTypes.CLEAR_SEASON_SEATING_CHART_FIELDS:
      return clearSeasonSeatingChartFields(
        state,
        payload as ClearSeasonSeatingChartFieldsAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_ID:
      return setTicketTypeId(
        state,
        payload as SetTicketTypeIdAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_USER_AGREEMENT:
      return setSeasonUserAgreement(
        state,
        payload as SetSeasonUserAgreementAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_TAX_DEDUCTION:
      return setSeasonTaxDeduction(
        state,
        payload as SetSeasonTaxDeductionAction["payload"]
      );

    case SeasonActionTypes.SET_SEASON_SALES_BEGIN_IMMEDIATELY:
      return setSeasonSalesBeginImmediately(
        state,
        payload as SetSeasonSalesBeginImmediatelyAction["payload"]
      );
    /********************************************************************************
     *  Upgrade Type
     *******************************************************************************/

    case SeasonActionTypes.SET_UPGRADE_TYPE_ID:
      return setUpgradeTypeId(
        state,
        payload as SetUpgradeTypeIdAction["payload"]
      );

    case SeasonActionTypes.SET_UPGRADE_TYPE:
      return setUpgradeType(state, payload as SetUpgradeTypeAction["payload"]);
    case SeasonActionTypes.ADD_UPGRADE_TYPE:
      return addUpgradeType(state, payload as AddUpgradeTypeAction["payload"]);
    case SeasonActionTypes.REMOVE_UPGRADE_TYPE:
      return removeUpgradeType(
        state,
        payload as RemoveUpgradeTypeAction["payload"]
      );
    case SeasonActionTypes.SET_UPGRADE_TYPE_VISIBLE:
      return setUpgradeTypeVisible(
        state,
        payload as SetUpgradeTypeVisibleAction["payload"]
      );
    case SeasonActionTypes.MOVE_UPGRADE_TYPE_UP:
      return moveUpgradeTypeUp(
        state,
        payload as MoveUpgradeTypeUpAction["payload"]
      );
    case SeasonActionTypes.MOVE_UPGRADE_TYPE_DOWN:
      return moveUpgradeTypeDown(
        state,
        payload as MoveUpgradeTypeDownAction["payload"]
      );
    case SeasonActionTypes.ADD_UPGRADE_TYPE_TICKET_TYPE_ID:
      return addUpgradeTypeTicketTypeId(
        state,
        payload as AddUpgradeTypeTicketTypeIdAction["payload"]
      );
    case SeasonActionTypes.REMOVE_UPGRADE_TYPE_TICKET_TYPE_ID:
      return removeUpgradeTypeTicketTypeId(
        state,
        payload as RemoveUpgradeTypeTicketTypeIdAction["payload"]
      );

    /********************************************************************************
     *  Promotion
     *******************************************************************************/
    case SeasonActionTypes.SET_PROMOTION_ID:
      return setPromotionId(state, payload as SetPromotionIdAction["payload"]);

    case SeasonActionTypes.SET_PROMOTION:
      return setPromotion(state, payload as SetPromotionAction["payload"]);
    case SeasonActionTypes.ADD_PROMOTION:
      return addPromotion(state, payload as AddPromotionAction["payload"]);
    case SeasonActionTypes.REMOVE_PROMOTION:
      return removePromotion(
        state,
        payload as RemovePromotionAction["payload"]
      );
    case SeasonActionTypes.SET_PROMOTION_ACTIVE:
      return setPromotionActive(
        state,
        payload as SetPromotionActiveAction["payload"]
      );
    case SeasonActionTypes.MOVE_PROMOTION_UP:
      return movePromotionUp(
        state,
        payload as MovePromotionUpAction["payload"]
      );
    case SeasonActionTypes.MOVE_PROMOTION_DOWN:
      return movePromotionDown(
        state,
        payload as MovePromotionDownAction["payload"]
      );
    case SeasonActionTypes.ADD_PROMOTION_TICKET_TYPE_ID:
      return addPromotionTicketTypeId(
        state,
        payload as AddPromotionTicketTypeIdAction["payload"]
      );
    case SeasonActionTypes.REMOVE_PROMOTION_TICKET_TYPE_ID:
      return removePromotionTicketTypeId(
        state,
        payload as RemovePromotionTicketTypeIdAction["payload"]
      );
    /********************************************************************************
     *  Custom Field
     *******************************************************************************/
    case SeasonActionTypes.SET_CUSTOM_FIELD_ID:
      return setCustomFieldId(
        state,
        payload as SetCustomFieldIdAction["payload"]
      );
    case SeasonActionTypes.SET_CUSTOM_FIELD:
      return setCustomField(state, payload as SetCustomFieldAction["payload"]);
    case SeasonActionTypes.ADD_CUSTOM_FIELD:
      return addCustomField(state, payload as AddCustomFieldAction["payload"]);
    case SeasonActionTypes.REMOVE_SEASON_CUSTOM_FIELD:
      return removeSeasonCustomField(
        state,
        payload as RemoveSeasonCustomFieldAction["payload"]
      );
    case SeasonActionTypes.SET_CUSTOM_FIELD_ACTIVE:
      return setCustomFieldActive(
        state,
        payload as SetCustomFieldActiveAction["payload"]
      );
    case SeasonActionTypes.MOVE_CUSTOM_FIELD_UP:
      return moveCustomFieldUp(
        state,
        payload as MoveCustomFieldUpAction["payload"]
      );
    case SeasonActionTypes.MOVE_CUSTOM_FIELD_DOWN:
      return moveCustomFieldDown(
        state,
        payload as MoveCustomFieldDownAction["payload"]
      );
    case SeasonActionTypes.ADD_CUSTOM_FIELD_OPTION:
      return addCustomFieldOption(
        state,
        payload as AddCustomFieldOptionAction["payload"]
      );
    case SeasonActionTypes.REMOVE_CUSTOM_FIELD_OPTION:
      return removeCustomFieldOption(
        state,
        payload as RemoveCustomFieldOptionAction["payload"]
      );

    case SeasonActionTypes.SET_CUSTOM_FIELD_OPTION:
      return setCustomFieldOption(
        state,
        payload as SetCustomFieldOptionAction["payload"]
      );
    /********************************************************************************
     *  Create Event
     *******************************************************************************/

    case SeasonActionTypes.CREATE_SEASON_REQUEST:
      return createSeasonRequest(
        state
        // payload as CreateEventRequestAction["payload"]
      );

    case SeasonActionTypes.CREATE_SEASON_SUCCESS:
      return createSeasonSuccess(
        state,
        payload as CreateSeasonSuccessAction["payload"]
      );

    /********************************************************************************
     *  Season Cache
     *******************************************************************************/

    case SeasonActionTypes.CACHE_SEASONS:
      return cacheSeasons(state, payload as CacheSeasonsAction["payload"]);

    /********************************************************************************
     *  Publish Season
     *******************************************************************************/

    case SeasonActionTypes.PUBLISH_SEASON:
      return publishSeason(
        state
        // payload as CreateSeasonRequestAction["payload"]
      );

    case SeasonActionTypes.PUBLISH_SEASON_SUCCESS:
      return publishSeasonSuccess(
        state,
        payload as PublishSeasonSuccessAction["payload"]
      );

    case SeasonActionTypes.PUBLISH_SEASON_FAILURE:
      return publishSeasonFailure(
        state,
        payload as PublishSeasonFailureAction["payload"]
      );

    /********************************************************************************
     *  Ticket Type Tier
     *******************************************************************************/

    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER:
      return setTicketTypeTier(
        state,
        payload as SetTicketTypeTierAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_IS_USING_PRICING_TIERS:
      return setIsUsingPricingTiers(
        state,
        payload as SetIsUsingPricingTiersAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_TIER_ENDS_AT:
      return setTicketTypeTierEndsAt(
        state,
        payload as SetTicketTypeTierEndsAtAction["payload"]
      );
    case SeasonActionTypes.ADD_SEASON_TICKET_TYPE_TIER:
      return addTicketTypeTier(
        state,
        payload as AddTicketTypeTierAction["payload"]
      );
    case SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE_TIER:
      return removeTicketTypeTier(
        state,
        payload as RemoveTicketTypeTierAction["payload"]
      );

    /********************************************************************************
     *  Ticket Type Fields
     *******************************************************************************/

    case SeasonActionTypes.SET_SEASON_TICKET_TYPE:
      return setTicketType(state, payload as SetTicketTypeAction["payload"]);

    case SeasonActionTypes.ADD_SEASON_TICKET_TYPE:
      return addSeasonTicketType(
        state,
        payload as AddSeasonTicketTypeAction["payload"]
      );
    case SeasonActionTypes.REMOVE_SEASON_TICKET_TYPE:
      return removeTicketType(
        state,
        payload as RemoveTicketTypeAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_VISIBLE:
      return setTicketTypeVisible(
        state,
        payload as SetTicketTypeVisibleAction["payload"]
      );
    case SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_UP:
      return moveTicketTypeUp(
        state,
        payload as MoveTicketTypeUpAction["payload"]
      );
    case SeasonActionTypes.MOVE_SEASON_TICKET_TYPE_DOWN:
      return moveTicketTypeDown(
        state,
        payload as MoveTicketTypeDownAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_NAME:
      return setTicketTypeName(
        state,
        payload as SetTicketTypeNameAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_QTY:
      return setTicketTypeQty(
        state,
        payload as SetTicketTypeQtyAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_PURCHASE_LIMIT:
      return setTicketTypePurchaseLimit(
        state,
        payload as SetTicketTypePurchaseLimitAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_DESCRIPTION:
      return setTicketTypeDescription(
        state,
        payload as SetTicketTypeDescriptionAction["payload"]
      );
    case SeasonActionTypes.SET_SEASON_TICKET_TYPE_VALUES:
      return setTicketTypeValues(
        state,
        payload as SetTicketTypeValuesAction["payload"]
      );
    // case SeasonActionTypes.ADD_SEASON_DAYS_ON_TICKET_TYPE:
    //   return addSeasonDaysOnTicketType(
    //     state,
    //     payload as AddSeasonDaysOnTicketTypeAction["payload"]
    //   );
    // case SeasonActionTypes.REMOVE_SEASON_DAYS_ON_TICKET_TYPE:
    //   return removeSeasonDaysOnTicketType(
    //     state,
    //     payload as RemoveSeasonDaysOnTicketTypeAction["payload"]
    //   );
    default:
      return state;
  }
}

/********************************************************************************
 *  Publish Season
 *******************************************************************************/

function publishSeason(state: SeasonReducerState): SeasonReducerState {
  return {
    ...state,
    publishing: true,
  };
}

function publishSeasonSuccess(
  state: SeasonReducerState,
  { season }: { season: ISeasonGraphQL }
): SeasonReducerState {
  state = { ...state };
  const seasonId = season._id as string;
  state.seasonCache[seasonId] = season;
  state.publishing = false;
  return state;
}

function publishSeasonFailure(
  state: SeasonReducerState,
  { errorMsg }: { errorMsg: string }
): SeasonReducerState {
  return {
    ...state,
    errorMsg,
    publishing: false,
  };
}

/********************************************************************************
 *  Cache Seasons
 *******************************************************************************/

function cacheSeasons(
  state: SeasonReducerState,
  { seasons }: { seasons: ISeasonGraphQL[] }
): SeasonReducerState {
  return {
    ...state,
    seasonCache: ReduxUtil.makeCache(seasons, "_id", state.seasonCache),
  };
}
/********************************************************************************
 *  Set Season ID
 *******************************************************************************/

function setSeasonId(
  state: SeasonReducerState,
  { seasonId, replace = false }: { seasonId: string; replace?: boolean }
): SeasonReducerState {
  UrlUtil.setQueryString({ seasonId }, replace);

  return {
    ...state,
    seasonId,
  };
}

/************************************************************
 *  Season Name
 ***********************************************************/

function setSeasonName(
  state: SeasonReducerState,
  { seasonId, name }: { seasonId: string; name: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { name } });
}

/************************************************************
 *  Season Subtitle
 ***********************************************************/

function setSeasonSubtitle(
  state: SeasonReducerState,
  { seasonId, subtitle }: { seasonId: string; subtitle: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { subtitle } });
}

/************************************************************
 *  Season Venue ID
 ***********************************************************/

function setSeasonVenueId(
  state: SeasonReducerState,
  { seasonId, venueId }: { seasonId: string; venueId: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { venueId } });
}

/************************************************************
 *  Season Description
 ***********************************************************/

function setSeasonDescription(
  state: SeasonReducerState,
  { seasonId, description }: { seasonId: string; description: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { description } });
}

/************************************************************
 *  Season Age
 ***********************************************************/

function setSeasonAge(
  state: SeasonReducerState,
  { seasonId, age }: { seasonId: string; age: SeasonAgeEnum }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { age } });
}

/************************************************************
 *  Season TaxDeduction
 ***********************************************************/

function setSeasonTaxDeduction(
  state: SeasonReducerState,
  { seasonId, taxDeduction }: { seasonId: string; taxDeduction: boolean }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { taxDeduction } });
}

/************************************************************
 *  Performance Song Link
 ***********************************************************/

function setSeasonPerformanceSongLink(
  state: SeasonReducerState,
  {
    seasonId,
    performanceId,
    songLink,
  }: { seasonId: string; performanceId: string; songLink: string }
): SeasonReducerState {
  return setPerformance(state, {
    seasonId,
    performanceId,
    performance: { songLink },
  });
}

/************************************************************
 *  Performance Video Link
 ***********************************************************/

function setSeasonPerformanceVideoLink(
  state: SeasonReducerState,
  {
    seasonId,
    performanceId,
    videoLink,
  }: { seasonId: string; performanceId: string; videoLink: string }
): SeasonReducerState {
  return setPerformance(state, {
    seasonId,
    performanceId,
    performance: { videoLink },
  });
}

/************************************************************
 *   Publish on Sellout.io website
 ***********************************************************/

function setSeasonPublishable(
  state: SeasonReducerState,
  { seasonId, publishable }: { seasonId: string; publishable: boolean }
): SeasonReducerState {
  return setSeason(state, {
    seasonId,
    season: { publishable },
  });
}

/********************************************************************************
 *  Performance Fields
 *******************************************************************************/

function setPerformance(
  state: SeasonReducerState,
  {
    seasonId,
    performanceId,
    performance,
  }: {
    seasonId: string;
    performanceId: string;
    performance: Partial<IPerformance>;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  season.performances = [...(season.performances || [])]?.map(
    (statePerformance: IPerformance) => {
      if (statePerformance._id === performanceId) {
        return {
          ...statePerformance,
          ...performance,
        } as IPerformance;
      }

      return statePerformance;
    }
  );

  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Season Poster Image Url
 ***********************************************************/

function setSeasonPosterImageUrl(
  state: SeasonReducerState,
  { seasonId, posterImageUrl }: { seasonId: string; posterImageUrl: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { posterImageUrl } });
}

/************************************************************
 *  Season Schedule Announce At
 ***********************************************************/

function setSeasonScheduleAnnounceAt(
  state: SeasonReducerState,
  { seasonId, announceAt }: { seasonId: string; announceAt: number }
): SeasonReducerState {
  return setseasonSchedule(state, { seasonId, schedule: { announceAt } });
}

/************************************************************
 *  Season Schedule Tickets At
 ***********************************************************/

function setSeasonScheduleTicketsAt(
  state: SeasonReducerState,
  { seasonId, ticketsAt }: { seasonId: string; ticketsAt: number }
): SeasonReducerState {
  return setseasonSchedule(state, { seasonId, schedule: { ticketsAt } });
}

/************************************************************
 *  Season Schedule Tickets End At
 ***********************************************************/

function setSeasonScheduleTicketsEndAt(
  state: SeasonReducerState,
  { seasonId, ticketsEndAt }: { seasonId: string; ticketsEndAt: number }
): SeasonReducerState {
  return setseasonSchedule(state, { seasonId, schedule: { ticketsEndAt } });
}

/************************************************************
 *  Season Schedule Starts At
 ***********************************************************/

function setSeasonScheduleStartsAt(
  state: SeasonReducerState,
  { seasonId, startsAt }: { seasonId: string; startsAt: number }
): SeasonReducerState {
  return setseasonSchedule(state, { seasonId, schedule: { startsAt } });
}

/************************************************************
 *  Season Schedule End At
 ***********************************************************/

function setSeasonScheduleEndsAt(
  state: SeasonReducerState,
  { seasonId, endsAt }: { seasonId: string; endsAt: number }
): SeasonReducerState {
  return setseasonSchedule(state, { seasonId, schedule: { endsAt } });
}

/********************************************************************************
 *  Season Schedule Fields
 *******************************************************************************/

function setseasonSchedule(
  state: SeasonReducerState,
  {
    seasonId,
    schedule,
  }: { seasonId: string; schedule: Partial<IEventSchedule> }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  season.schedule = {
    ...season.schedule,
    ...schedule,
  };
  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Season Send QR Code
 ***********************************************************/

function setSeasonSendQRCode(
  state: SeasonReducerState,
  { seasonId, sendQRCode }: { seasonId: string; sendQRCode: SendQRCodeEnum }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { sendQRCode } });
}

/********************************************************************************
 *  Set Upgrade Type ID
 *******************************************************************************/

function setUpgradeTypeId(
  state: SeasonReducerState,
  { upgradeTypeId }: { upgradeTypeId: string }
): SeasonReducerState {
  UrlUtil.setQueryString({ upgradeTypeId });

  return {
    ...state,
    upgradeTypeId,
  };
}

/********************************************************************************
 *  Upgrade Type
 *******************************************************************************/

function setUpgradeType(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
    upgradeType,
  }: {
    seasonId: string;
    upgradeTypeId: string;
    upgradeType: Partial<IEventUpgrade>;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  season.upgrades = season.upgrades?.map((stateUpgradeType: IEventUpgrade) => {
    if (stateUpgradeType._id === upgradeTypeId) {
      return {
        ...stateUpgradeType,
        ...upgradeType,
      } as IEventUpgrade;
    }

    return stateUpgradeType;
  });

  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Add Upgrade Type
 ***********************************************************/

function addUpgradeType(
  state: SeasonReducerState,
  {
    seasonId,
  }: {
    seasonId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketTypeIds = season.ticketTypes?.map(
    (ticketType) => ticketType._id as string
  ) as string[];
  const upgradeTypes = [...(season?.upgrades || [])];
  const upgradeTypeId = shortid.generate();
  const newUpgradeType = upgradeState(
    upgradeTypeId,
    "New Upgrade",
    ticketTypeIds
  );
  upgradeTypes.push(newUpgradeType);

  state = setSeason(state, { seasonId, season: { upgrades: upgradeTypes } });
  return setUpgradeTypeId(state, { upgradeTypeId });
}

/************************************************************
 *  Remove Upgrade Type
 ***********************************************************/

function removeUpgradeType(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
  }: {
    seasonId: string;
    upgradeTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const upgradeTypes = [...(season?.upgrades || [])].filter(
    (upgradeType: IEventUpgrade) => {
      return upgradeType._id !== upgradeTypeId;
    }
  );
  return setSeason(state, { seasonId, season: { upgrades: upgradeTypes } });
}

/************************************************************
 *  Set Upgrade Type Visible
 ***********************************************************/

function setUpgradeTypeVisible(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
    visible,
  }: {
    seasonId: string;
    upgradeTypeId: string;
    visible: boolean;
  }
): SeasonReducerState {
  return setUpgradeType(state, {
    seasonId,
    upgradeTypeId,
    upgradeType: { visible },
  });
}

/************************************************************
 *  Move Upgrade Type Up
 ***********************************************************/

function moveUpgradeTypeUp(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
  }: {
    seasonId: string;
    upgradeTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.upgrades
    ?.map((upgradeType) => upgradeType._id)
    .indexOf(upgradeTypeId) as number;

  const desiredIndex = currentIndex - 1;
  const upgradeTypes = [...(season?.upgrades || [])];
  const upgradeType = upgradeTypes?.splice(currentIndex, 1);
  upgradeTypes.splice(desiredIndex, 0, upgradeType[0]);

  return setSeason(state, { seasonId, season: { upgrades: upgradeTypes } });
}

/************************************************************
 *  Move Upgrade Type Down
 ***********************************************************/

function moveUpgradeTypeDown(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
  }: {
    seasonId: string;
    upgradeTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.upgrades
    ?.map((upgradeType) => upgradeType._id)
    .indexOf(upgradeTypeId) as number;

  const desiredIndex = currentIndex + 1;
  const upgradeTypes = [...(season?.upgrades || [])];
  const upgradeType = upgradeTypes?.splice(currentIndex, 1);
  upgradeTypes.splice(desiredIndex, 0, upgradeType[0]);

  return setSeason(state, { seasonId, season: { upgrades: upgradeTypes } });
}

/************************************************************
 *  Add Upgrade Type Ticket Type Id
 ***********************************************************/

function addUpgradeTypeTicketTypeId(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
    ticketTypeId,
  }: {
    seasonId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const upgradeType = season.upgrades?.find(
    (upgradeType) => upgradeType._id === upgradeTypeId
  );
  const ticketTypeIds = [...(upgradeType?.ticketTypeIds || []), ticketTypeId];

  return setUpgradeType(state, {
    seasonId,
    upgradeTypeId,
    upgradeType: { ticketTypeIds },
  });
}

/************************************************************
 *  Remove Upgrade Type Ticket Type Id
 ***********************************************************/

function removeUpgradeTypeTicketTypeId(
  state: SeasonReducerState,
  {
    seasonId,
    upgradeTypeId,
    ticketTypeId,
  }: {
    seasonId: string;
    upgradeTypeId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const upgradeType = season.upgrades?.find(
    (upgradeType) => upgradeType._id === upgradeTypeId
  );
  const ticketTypeIds = upgradeType?.ticketTypeIds.filter(
    (stateTicketTypeId) => stateTicketTypeId !== ticketTypeId
  );

  return setUpgradeType(state, {
    seasonId,
    upgradeTypeId,
    upgradeType: { ticketTypeIds },
  });
}

/********************************************************************************
 *  Set Promotion ID
 *******************************************************************************/

function setPromotionId(
  state: SeasonReducerState,
  { promotionId }: { promotionId: string }
): SeasonReducerState {
  UrlUtil.setQueryString({ promotionId });

  return {
    ...state,
    promotionId,
  };
}

/********************************************************************************
 *  Promotion
 *******************************************************************************/

function setPromotion(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
    promotion,
  }: {
    seasonId: string;
    promotionId: string;
    promotion: Partial<IEventPromotion>;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  season.promotions = season?.promotions?.map(
    (statePromotion: IEventPromotion) => {
      if (statePromotion._id === promotionId) {
        return {
          ...statePromotion,
          ...promotion,
        } as IEventPromotion;
      }

      return statePromotion;
    }
  );

  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Add Promotion
 ***********************************************************/

function addPromotion(
  state: SeasonReducerState,
  {
    seasonId,
  }: {
    seasonId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const promotions = [...(season?.promotions || [])];
  const promotionId = shortid.generate();
  const newPromotion = seasonPromotionState(promotionId, "New Code");
  promotions.push(newPromotion);

  state = setSeason(state, { seasonId, season: { promotions: promotions } });
  return setPromotionId(state, { promotionId });
}

/************************************************************
 *  Remove Promotion
 ***********************************************************/

function removePromotion(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
  }: {
    seasonId: string;
    promotionId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const promotions = [...(season?.promotions || [])].filter(
    (promotion: IEventPromotion) => {
      return promotion._id !== promotionId;
    }
  );
  return setSeason(state, { seasonId, season: { promotions: promotions } });
}

/************************************************************
 *  Set Promotion Active
 ***********************************************************/

function setPromotionActive(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
    active,
  }: {
    seasonId: string;
    promotionId: string;
    active: boolean;
  }
): SeasonReducerState {
  return setPromotion(state, { seasonId, promotionId, promotion: { active } });
}

/************************************************************
 *  Move Promotion Up
 ***********************************************************/

function movePromotionUp(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
  }: {
    seasonId: string;
    promotionId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.promotions
    ?.map((promotion) => promotion._id)
    .indexOf(promotionId) as number;

  const desiredIndex = currentIndex - 1;
  const promotions = [...(season?.promotions || [])];
  const promotion = promotions?.splice(currentIndex, 1);
  promotions.splice(desiredIndex, 0, promotion[0]);

  return setSeason(state, { seasonId, season: { promotions: promotions } });
}

/************************************************************
 *  Move Promotion Down
 ***********************************************************/

function movePromotionDown(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
  }: {
    seasonId: string;
    promotionId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.promotions
    ?.map((promotion) => promotion._id)
    .indexOf(promotionId) as number;

  const desiredIndex = currentIndex + 1;
  const promotions = [...(season?.promotions || [])];
  const promotion = promotions?.splice(currentIndex, 1);
  promotions.splice(desiredIndex, 0, promotion[0]);

  return setSeason(state, { seasonId, season: { promotions: promotions } });
}

/************************************************************
 *  Add Promotion Ticket Type Id
 ***********************************************************/

function addPromotionTicketTypeId(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
    ticketTypeId,
  }: {
    seasonId: string;
    promotionId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const promotion = season.promotions?.find(
    (promotion) => promotion._id === promotionId
  );

  const ticketTypeIds = [...(promotion?.ticketTypeIds || []), ticketTypeId];

  return setPromotion(state, {
    seasonId,
    promotionId,
    promotion: { ticketTypeIds },
  });
}

/************************************************************
 *  Remove Promotion Ticket Type Id
 ***********************************************************/

function removePromotionTicketTypeId(
  state: SeasonReducerState,
  {
    seasonId,
    promotionId,
    ticketTypeId,
  }: {
    seasonId: string;
    promotionId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const promotion = season.promotions?.find(
    (promotion) => promotion._id === promotionId
  );
  const ticketTypeIds = promotion?.ticketTypeIds.filter(
    (stateTicketTypeId) => stateTicketTypeId !== ticketTypeId
  );

  return setPromotion(state, {
    seasonId,
    promotionId,
    promotion: { ticketTypeIds },
  });
}

/************************************************************
 *  Season Seating Chart Fields
 ***********************************************************/

function setSeasonSeatingChartFields(
  state: SeasonReducerState,
  { seasonId, categories }: { seasonId: string; categories: any[] }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  const ticketTypes = Object.entries(categories).map(([key, value]) => {
    const tableData = value.filter((a) => a.bookAsAWhole === true);
    const totalSeats = tableData.map((a) => a.numSeats);
    const removeSeats = totalSeats.reduce((acc, curr) => acc + curr, 0);
    return ticketTypeState(
      shortid.generate(),
      key,
      value.length === 1
        ? value[0].capacity
        : value.filter((a) => a.objectType === "seat").length -
            removeSeats +
            tableData.length
    );
  });

  const newTicketTypeIds = ticketTypes.map(
    (ticketType: ITicketType) => ticketType._id as string
  );

  const stateTicketTypeIds = season?.ticketTypes?.map(
    (ticketType: ITicketType) => ticketType._id as string
  );

  const upgrades = season?.upgrades?.map((upgrade: IEventUpgrade) => {
    if (upgrade.ticketTypeIds.length === stateTicketTypeIds?.length) {
      upgrade.ticketTypeIds = newTicketTypeIds;
    } else {
      upgrade.ticketTypeIds = [];
    }
    return upgrade;
  });

  return setSeason(state, { seasonId, season: { ticketTypes, upgrades } });
}

/************************************************************
 *  Season Seating Chart Key
 ***********************************************************/

function setSeasonSeatingChartKey(
  state: SeasonReducerState,
  { seasonId, seatingChartKey }: { seasonId: string; seatingChartKey: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { seatingChartKey } });
}

/************************************************************
 *  Clear Season Seating Chart Fields
 ***********************************************************/

function clearSeasonSeatingChartFields(
  state: SeasonReducerState,
  { seasonId }: { seasonId: string }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  season.ticketTypes = [];
  season.seatingChartKey = "";
  return setSeason(state, { seasonId, season });
}

/********************************************************************************
 *  Set Ticket Type ID
 *******************************************************************************/

function setTicketTypeId(
  state: SeasonReducerState,
  { ticketTypeId }: { ticketTypeId: string }
): SeasonReducerState {
  UrlUtil.setQueryString({ ticketTypeId });

  // let isUsingPricingTiers = state.isUsingPricingTiers;

  // if (!Boolean(ticketTypeId)) {
  //   isUsingPricingTiers = false;
  // }

  return {
    ...state,
    ticketTypeId,
    //  isUsingPricingTiers,
  };
}
/********************************************************************************
 *  Set Custom Field ID
 *******************************************************************************/

function setCustomFieldId(
  state: SeasonReducerState,
  { customFieldId }: { customFieldId: string }
): SeasonReducerState {
  UrlUtil.setQueryString({ customFieldId });

  return {
    ...state,
    customFieldId,
  };
}

/********************************************************************************
 *  CustomField
 *******************************************************************************/

function setCustomField(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
    customField,
  }: {
    seasonId: string;
    customFieldId: string;
    customField: Partial<IEventCustomField>;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  season.customFields = season.customFields?.map(
    (stateCustomField: IEventCustomField) => {
      if (stateCustomField._id === customFieldId) {
        return {
          ...stateCustomField,
          ...customField,
        } as IEventCustomField;
      }

      return stateCustomField;
    }
  );

  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Add CustomField
 ***********************************************************/

function addCustomField(
  state: SeasonReducerState,
  {
    seasonId,
  }: {
    seasonId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const customFields = [...(season?.customFields || [])];
  const customFieldId = shortid.generate();
  const newCustomField = seasonCustomFieldState(
    customFieldId,
    "New Survey Question"
  );
  customFields.push(newCustomField);

  state = setSeason(state, {
    seasonId,
    season: { customFields: customFields },
  });
  return setCustomFieldId(state, { customFieldId });
}

/************************************************************
 *  Remove CustomField
 ***********************************************************/

function removeSeasonCustomField(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
  }: {
    seasonId: string;
    customFieldId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const customFields = [...(season?.customFields || [])].filter(
    (customField: IEventCustomField) => {
      return customField._id !== customFieldId;
    }
  );

  return setSeason(state, { seasonId, season: { customFields: customFields } });
}

/************************************************************
 *  Set CustomField Active
 ***********************************************************/

function setCustomFieldActive(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
    active,
  }: {
    seasonId: string;
    customFieldId: string;
    active: boolean;
  }
): SeasonReducerState {
  return setCustomField(state, {
    seasonId,
    customFieldId,
    customField: { active },
  });
}

/************************************************************
 *  Move CustomField Up
 ***********************************************************/

function moveCustomFieldUp(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
  }: {
    seasonId: string;
    customFieldId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.customFields
    ?.map((customField) => customField._id)
    .indexOf(customFieldId) as number;

  const desiredIndex = currentIndex - 1;
  const customFields = [...(season?.customFields || [])];
  const customField = customFields?.splice(currentIndex, 1);
  customFields.splice(desiredIndex, 0, customField[0]);

  return setSeason(state, { seasonId, season: { customFields: customFields } });
}

/************************************************************
 *  Move CustomField Down
 ***********************************************************/

function moveCustomFieldDown(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
  }: {
    seasonId: string;
    customFieldId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.customFields
    ?.map((customField) => customField._id)
    .indexOf(customFieldId) as number;

  const desiredIndex = currentIndex + 1;
  const customFields = [...(season?.customFields || [])];
  const customField = customFields?.splice(currentIndex, 1);
  customFields.splice(desiredIndex, 0, customField[0]);

  return setSeason(state, { seasonId, season: { customFields: customFields } });
}

/************************************************************
 *  Add CustomField Option
 ***********************************************************/

function addCustomFieldOption(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
  }: {
    seasonId: string;
    customFieldId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const customField = season.customFields?.find(
    (customField) => customField._id === customFieldId
  );
  const options = [...(customField?.options || []), "New Option"];

  return setCustomField(state, {
    seasonId,
    customFieldId,
    customField: { options },
  });
}

/************************************************************
 *  Remove CustomField Option
 ***********************************************************/

function removeCustomFieldOption(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
    optionIndex,
  }: {
    seasonId: string;
    customFieldId: string;
    optionIndex: number;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const customField = season.customFields?.find(
    (customField) => customField._id === customFieldId
  );
  const options = customField?.options.filter(
    (_, index) => index !== optionIndex
  );

  return setCustomField(state, {
    seasonId,
    customFieldId,
    customField: { options },
  });
}

/************************************************************
 *  Set Custom Field Option
 ***********************************************************/

function setCustomFieldOption(
  state: SeasonReducerState,
  {
    seasonId,
    customFieldId,
    optionIndex,
    option,
  }: {
    seasonId: string;
    customFieldId: string;
    optionIndex: number;
    option: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const customField = season.customFields?.find(
    (customField) => customField._id === customFieldId
  );
  const options = [...(customField?.options || [])];
  options[optionIndex] = option;

  return setCustomField(state, {
    seasonId,
    customFieldId,
    customField: { options },
  });
}

/************************************************************
 *  Season User Agreement
 ***********************************************************/

function setSeasonUserAgreement(
  state: SeasonReducerState,
  { seasonId, userAgreement }: { seasonId: string; userAgreement: string }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { userAgreement } });
}

/********************************************************************************
 *  Season Fields
 *******************************************************************************/

function setSeason(
  state: SeasonReducerState,
  { seasonId, season }: { seasonId?: string; season: Partial<ISeason> }
): SeasonReducerState {
  state = {
    ...state,
  };

  state.seasonCache[seasonId as string] = {
    ...state.seasonCache[seasonId as string],
    ...season,
  };

  return state;
}

/********************************************************************************
 *  Create Season
 *******************************************************************************/

function createSeasonRequest(state: SeasonReducerState): SeasonReducerState {
  return {
    ...state,
    saving: true,
  };
}

function createSeasonSuccess(
  state: SeasonReducerState,
  { season }: { season: ISeasonGraphQL }
): SeasonReducerState {
  state = { ...state };
  const seasonId = season._id as string;

  state.saving = false;
  state.seasonCache[seasonId] = season;
  state.seasonCache[NEW_SEASON_ID] = seasonState();
  UrlUtil.setQueryString({ seasonId }, true);
  return setSeasonId(state, { seasonId, replace: true });
}

function createSeasonFailure(
  state: SeasonReducerState,
  { errorMsg }: { errorMsg: string }
): SeasonReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  };
}

/********************************************************************************
 *  Ticket Type Tier
 *******************************************************************************/

function setTicketTypeTier(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    tierId,
    tier,
  }: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
    tier: Partial<ITicketTier>;
  }
): SeasonReducerState {
  const event = { ...state.seasonCache[seasonId] };
  const ticketType = event.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  const tiers = ticketType?.tiers.map((stateTier: ITicketTier) => {
    if (stateTier._id === tierId) {
      return {
        ...stateTier,
        ...tier,
      };
    }
    return stateTier;
  });

  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { tiers },
  });
}

/************************************************************
 *  Is Using Pricing Tiers
 ***********************************************************/

function setIsUsingPricingTiers(
  state: SeasonReducerState,
  {
    isUsingPricingTiers,
  }: {
    isUsingPricingTiers: boolean;
  }
): SeasonReducerState {
  const { seasonId, ticketTypeId } = state;
  const season = { ...state.seasonCache[seasonId] };
  const ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );
  const tiersLength = ticketType?.tiers.length;

  if (isUsingPricingTiers) {
    if (tiersLength === 1) {
      state = addTicketTypeTier(state, {
        seasonId,
        ticketTypeId,
      });
    }
  } else {
    const tier = ticketTierState(
      shortid.generate(),
      "New Tier",
      0,
      season.schedule?.ticketsAt as number,
      season.schedule?.ticketsEndAt as number
    );

    state = setTicketType(state, {
      seasonId,
      ticketTypeId,
      ticketType: { tiers: [tier] },
    });
  }

  return {
    ...state,
    isUsingPricingTiers,
  };
}

/************************************************************
 *  Set Ticket Tier Starts At
 ***********************************************************/

function setTicketTypeTierStartsAt(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    tierId,
    startsAt,
  }: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
    startsAt: number | null;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  state = setTicketTypeTier(state, {
    seasonId: seasonId,
    ticketTypeId: ticketTypeId,
    tierId: tierId,
    tier: { startsAt },
  });

  const tierIndex = ticketType?.tiers.map((tier) => tier._id).indexOf(tierId);

  if (tierIndex) {
    const previousTierIndex = tierIndex - 1;
    const previousTier = ticketType?.tiers[previousTierIndex];

    if (previousTier) {
      state = setTicketTypeTier(state, {
        seasonId: seasonId,
        ticketTypeId: ticketTypeId,
        tierId: previousTier._id as string,
        tier: { endsAt: startsAt === null ? null : startsAt - 1 },
      });
    }
  }

  return state;
}

/************************************************************
 *  Set Ticket Tier Ends At
 ***********************************************************/

function setTicketTypeTierEndsAt(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    tierId,
    endsAt,
  }: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
    endsAt: number | null;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  state = setTicketTypeTier(state, {
    seasonId: seasonId,
    ticketTypeId: ticketTypeId,
    tierId: tierId,
    tier: { endsAt },
  });

  const tierIndex = ticketType?.tiers.map((tier) => tier._id).indexOf(tierId);

  if (typeof tierIndex === "number" && tierIndex > -1) {
    const nextTierIndex = tierIndex + 1;
    const nextTier = ticketType?.tiers[nextTierIndex];

    if (nextTier) {
      state = setTicketTypeTier(state, {
        seasonId: seasonId,
        ticketTypeId: ticketTypeId,
        tierId: nextTier._id as string,
        tier: { startsAt: endsAt === null ? null : endsAt + 1 },
      });
    }
  }

  return state;
}

/************************************************************
 *  Add Ticket Type Tier
 ***********************************************************/

function addTicketTypeTier(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
  }: {
    seasonId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  let season = { ...state.seasonCache[seasonId] };
  let ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  let tiers = [...(ticketType?.tiers || [])];
  const lastTier = tiers.pop();

  const newTier = ticketTierState(
    shortid.generate(),
    "New Tier",
    lastTier?.price,
    null,
    null
  );
  tiers.push(newTier);
  tiers.push(lastTier as ITicketTier);

  state = setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { tiers },
  });

  season = { ...state.seasonCache[seasonId] };
  ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  const tierIndex = ticketType?.tiers
    .map((tier) => tier._id)
    .indexOf(newTier._id);

  if (tierIndex && tierIndex > -1) {
    const previousTierIndex = tierIndex - 1;
    const previousTier = ticketType?.tiers[previousTierIndex];
    if (previousTier) {
      state = setTicketTypeTierEndsAt(state, {
        seasonId: seasonId,
        ticketTypeId: ticketTypeId,
        tierId: previousTier._id as string,
        endsAt: previousTier.endsAt,
      });
    }
  }

  if (tiers.length === 2) {
    state = setTicketTypeTierStartsAt(state, {
      seasonId: seasonId,
      ticketTypeId: ticketTypeId,
      tierId: newTier._id as string,
      startsAt: season?.schedule?.ticketsAt || null,
    });
  }

  state = setTicketTypeTierEndsAt(state, {
    seasonId: seasonId,
    ticketTypeId: ticketTypeId,
    tierId: newTier._id as string,
    endsAt: null,
  });

  return state;
}

/************************************************************
 *  Remove Ticket Type Tier
 ***********************************************************/

function removeTicketTypeTier(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    tierId,
  }: {
    seasonId: string;
    ticketTypeId: string;
    tierId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketType = season.ticketTypes?.find(
    (ticketType) => ticketType._id === ticketTypeId
  );

  const tiers = ticketType?.tiers.filter((stateTier: ITicketTier) => {
    return stateTier._id !== tierId;
  });

  state = setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { tiers },
  });

  const tierIndex = ticketType?.tiers.map((tier) => tier._id).indexOf(tierId);

  if (tierIndex && tierIndex > -1) {
    const previousTierIndex = tierIndex - 1;
    const previousTier = ticketType?.tiers[previousTierIndex];

    if (previousTier) {
      state = setTicketTypeTierEndsAt(state, {
        seasonId: seasonId,
        ticketTypeId: ticketTypeId,
        tierId: previousTier._id as string,
        endsAt: previousTier.endsAt,
      });
    }
  }

  return state;
}

/********************************************************************************
 *  Ticket Type
 *******************************************************************************/

function setTicketType(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    ticketType,
  }: {
    seasonId: string;
    ticketTypeId: string;
    ticketType: Partial<ITicketType>;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  season.ticketTypes = season.ticketTypes?.map(
    (stateTicketType: ITicketType) => {
      if (stateTicketType._id === ticketTypeId) {
        return {
          ...stateTicketType,
          ...ticketType,
        } as ITicketType;
      }

      return stateTicketType;
    }
  );

  return setSeason(state, { seasonId, season });
}

/************************************************************
 *  Add Ticket Type
 ***********************************************************/

function addSeasonTicketType(
  state: SeasonReducerState,
  {
    seasonId,
    setUrlParam = true,
  }: {
    seasonId: string;
    setUrlParam?: boolean;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketTypes = [...(season?.ticketTypes || [])];
  const ticketTypeId = shortid.generate();
  const newTicketType = ticketTypeState(ticketTypeId, "New Ticket");
  ticketTypes.push(newTicketType);

  const newTicketTypeIds = ticketTypes.map(
    (ticketType: ITicketType) => ticketType._id as string
  );

  const stateTicketTypeIds = season?.ticketTypes?.map(
    (ticketType: ITicketType) => ticketType._id as string
  );

  const upgrades = season?.upgrades?.map((upgrade: IEventUpgrade) => {
    if (upgrade.ticketTypeIds.length === stateTicketTypeIds?.length) {
      upgrade.ticketTypeIds = newTicketTypeIds;
    } else {
      upgrade.ticketTypeIds = [];
    }
    return upgrade;
  });

  state = setSeason(state, { seasonId, season: { ticketTypes, upgrades } });

  if (setUrlParam) {
    return setTicketTypeId(state, { ticketTypeId });
  } else {
    return state;
  }
}

/************************************************************
 *  Remove Ticket Type
 ***********************************************************/

function removeTicketType(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
  }: {
    seasonId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const ticketTypes = [...(season?.ticketTypes || [])].filter(
    (ticketType: ITicketType) => {
      return ticketType._id !== ticketTypeId;
    }
  );
  const upgrades = [...(season?.upgrades || [])].map(
    (upgrade: IEventUpgrade) => {
      upgrade.ticketTypeIds = upgrade.ticketTypeIds.filter(
        (stateTicketTypeId) => stateTicketTypeId !== ticketTypeId
      );
      return upgrade;
    }
  );

  return setSeason(state, { seasonId, season: { ticketTypes, upgrades } });
}

/************************************************************
 *  Set Ticket Type Visible
 ***********************************************************/

function setTicketTypeVisible(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    visible,
  }: {
    seasonId: string;
    ticketTypeId: string;
    visible: boolean;
  }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { visible },
  });
}

/************************************************************
 *  Move Ticket Type Up
 ***********************************************************/

function moveTicketTypeUp(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
  }: {
    seasonId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.ticketTypes
    ?.map((ticketType) => ticketType._id)
    .indexOf(ticketTypeId) as number;

  const desiredIndex = currentIndex - 1;
  const ticketTypes = [...(season?.ticketTypes || [])];
  const ticketType = ticketTypes?.splice(currentIndex, 1);
  ticketTypes.splice(desiredIndex, 0, ticketType[0]);

  return setSeason(state, { seasonId, season: { ticketTypes } });
}

/************************************************************
 *  Move Ticket Type Down
 ***********************************************************/

function moveTicketTypeDown(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
  }: {
    seasonId: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };
  const currentIndex = season?.ticketTypes
    ?.map((ticketType) => ticketType._id)
    .indexOf(ticketTypeId) as number;

  const desiredIndex = currentIndex + 1;
  const ticketTypes = [...(season?.ticketTypes || [])];
  const ticketType = ticketTypes?.splice(currentIndex, 1);
  ticketTypes.splice(desiredIndex, 0, ticketType[0]);

  return setSeason(state, { seasonId, season: { ticketTypes } });
}

/************************************************************
 *  Ticket Type Name
 ***********************************************************/

function setTicketTypeName(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    name,
  }: { seasonId: string; ticketTypeId: string; name: string }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { name },
  });
}

/************************************************************
 *  Ticket Type Qty
 ***********************************************************/

function setTicketTypeQty(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    qty,
  }: { seasonId: string; ticketTypeId: string; qty: number }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: {},
  });
}

/************************************************************
 *  Ticket Type Values
 ***********************************************************/

function setTicketTypeValues(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    values,
  }: { seasonId: string; ticketTypeId: string; values: string }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { values },
  });
}

/************************************************************
 *  Ticket Type Purchase Limit
 ***********************************************************/

function setTicketTypePurchaseLimit(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    purchaseLimit,
  }: { seasonId: string; ticketTypeId: string; purchaseLimit: number }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { purchaseLimit },
  });
}

/************************************************************
 *  Ticket Type Description
 ***********************************************************/

function setTicketTypeDescription(
  state: SeasonReducerState,
  {
    seasonId,
    ticketTypeId,
    description,
  }: { seasonId: string; ticketTypeId: string; description: string }
): SeasonReducerState {
  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { description },
  });
}

/************************************************************
 *  Sales Begin Immediately
 ***********************************************************/

function setSeasonSalesBeginImmediately(
  state: SeasonReducerState,
  {
    seasonId,
    salesBeginImmediately,
  }: { seasonId: string; salesBeginImmediately: boolean }
): SeasonReducerState {
  return setSeason(state, { seasonId, season: { salesBeginImmediately } });
}

/************************************************************
 *  Add Event Days on Ticket type
 ***********************************************************/

function addSeasonDaysOnTicketType(
  state: SeasonReducerState,
  {
    seasonId,
    seasonDay,
    ticketTypeId,
  }: {
    seasonId: string;
    seasonDay: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  const ticketTypes = season.ticketTypes?.find(
    (ticket) => ticket._id === ticketTypeId
  );
  const dayIds = [...(ticketTypes?.dayIds || []), seasonDay];

  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { dayIds },
  });
}

/************************************************************
 *  Remove Event Days on Ticket type
 ***********************************************************/

function removeSeasonDaysOnTicketType(
  state: SeasonReducerState,
  {
    seasonId,
    seasonDay,
    ticketTypeId,
  }: {
    seasonId: string;
    seasonDay: string;
    ticketTypeId: string;
  }
): SeasonReducerState {
  const season = { ...state.seasonCache[seasonId] };

  const ticketTypes = season.ticketTypes?.find(
    (ticket) => ticket._id === ticketTypeId
  );

  const dayIds =
    ticketTypes?.dayIds && ticketTypes?.dayIds.filter((a) => a !== seasonDay);

  return setTicketType(state, {
    seasonId,
    ticketTypeId,
    ticketType: { dayIds },
  });
}
