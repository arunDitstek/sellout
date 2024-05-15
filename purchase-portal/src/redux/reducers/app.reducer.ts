import {
  AppActionTypes,
  AppActionCreatorTypes,
  SetPurchasePortalStatusAction,
  SetScreenAction,
  SetEventIdAction,
  CacheEventsAction,
  SetErrorAction,
  SetLoadingAction,
  ShowNotificationAction,
  HideNotificationAction,
  ResetAppAction,
  SetFirstScreenAction,
  SetAvailableSeatingAction,
  SetSeatTimerAction,
  SetSeasonIdAction,
  CacheSeasonsAction,
  SetWaitListAction,
  SetWaitingInfoAction
} from "../actions/app.actions";
import { EPurchasePortalStatus } from "@sellout/models/.dist/enums/EPurchasePortalStatus";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import UrlParams from "../../models/interfaces/UrlParams";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import IAppNotification, {
  AppNotificationTypeEnum,
} from "../../models/interfaces/IAppNotification";
import appNotificationState from "../../models/states/appNotification.state";

export enum ErrorKeyEnum {
  Global = "Global",
  UserEmail = "UserEmail",
  ConfirmUserEmail = "ConfirmUserEmail",
  UserFullName = "UserFullName",
  UserPhoneNumber = "UserPhoneNumber",
  ConFirmOrderError = "ConFirmOrderError",
  PromoCodeLimitError = "PromoCodeLimitError",
  PaymentCardError = "PaymentCardError",
  UserProfileError = "UserProfileError",
  GuestMemberError = "GuestMemberError",
  Tickets = "Tickets",
  Upgrades = "Upgrades",
  WaitList = "WaitList",
  NotifiyMe = "NotifiyMe",
}

export enum ScreenEnum {
  EventUnavailable = "EventUnavailable",
  Tickets = "Tickets",
  Upgrades = "Upgrades",
  LiabilityWaiver = "Liability Waiver",
  CustomFields = "Custom Fields",
  ConfirmOrder = "Confirm Order",
  OrderConfirmed = "Order Confirmed",
  // Checkout
  GuestMembers = "Guest Members",
  UserEmail = "User Email",
  UserInfo = "User Info",
  PhoneCode = "Phone Code",
  SelectPayment = "Select Payment",
  AddPayment = "Add Payment",
  // Box Office
  CustomerPhoneNumber = "Customer Phone Number",
  PaymentMethod = "Payment Method",
  CardReader = "CardReader",
  CashPayment = "Cash Payment",
}

export interface IEventCache {
  [eventId: string]: IEventGraphQL;
}

export interface ISeasonCache {
  [seasonId: string]: ISeasonGraphQL;
}

export type ErrorMap = {
  [key in ErrorKeyEnum]?: string;
};

export type AppReducerState = {
  status: EPurchasePortalStatus;
  mode: EPurchasePortalModes;
  memberId: string;
  isComplimentary: boolean;
  intercomEnabled: boolean;
  screen: ScreenEnum;
  eventId: string;
  eventsCache: IEventCache;
  seasonId: string;
  seasonsCache: ISeasonCache;
  errors: ErrorMap;
  loading: boolean;
  waitList: boolean;
  waitingInfoMessage:boolean;
  notification: IAppNotification;
  availablseatingCategories: [];
  fisrtScreen: ScreenEnum;
  SeatingPlanTimer: number;
  tieMembers: [];
};

function appReducerState(): AppReducerState {
  const { query } = UrlUtil.parse(window.location.toString());

  const {
    eventId = "",
    mode = EPurchasePortalModes.Checkout,
    complimentary = "false", // must be a string becuase it's in the url params
    seasonId = "",
    memberId = "",
  }: UrlParams = query;

  return {
    status: EPurchasePortalStatus.Initializing,
    mode: mode,
    memberId: memberId,
    isComplimentary: Boolean(complimentary === "true"),
    intercomEnabled: false,
    screen: ScreenEnum.Tickets,
    eventId: eventId,
    eventsCache: {},
    seasonId: seasonId,
    seasonsCache: {},
    errors: {},
    loading: false,
    waitList: false,
    waitingInfoMessage:false,
    availablseatingCategories: [],
    fisrtScreen: ScreenEnum.Tickets,
    SeatingPlanTimer: 0,
    tieMembers: [],
    notification: appNotificationState(),
  };
}

export default function reducer(
  state = appReducerState(),
  action: AppActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    case AppActionTypes.SET_PURCHASE_PORTAL_STATUS:
      return setPurchasPortalStatus(
        state,
        payload as SetPurchasePortalStatusAction["payload"]
      );

    case AppActionTypes.SET_SCREEN:
      return setScreen(state, payload as SetScreenAction["payload"]);

    /********************************************************************************
     * First Screen
     *******************************************************************************/

    case AppActionTypes.SET_FIRST_SCREEN:
      return setFirstScreen(state, payload as SetFirstScreenAction["payload"]);

    /********************************************************************************
     *  Event
     *******************************************************************************/

    case AppActionTypes.SET_EVENT_ID:
      return setEventId(state, payload as SetEventIdAction["payload"]);

    case AppActionTypes.CACHE_EVENTS:
      return cacheEvents(state, payload as CacheEventsAction["payload"]);

    /********************************************************************************
     *  Season
     *******************************************************************************/

    case AppActionTypes.SET_SEASON_ID:
      return setSeasonId(state, payload as SetSeasonIdAction["payload"]);

    case AppActionTypes.CACHE_SEASONS:
      return cacheSeasons(state, payload as CacheSeasonsAction["payload"]);

    /********************************************************************************
     *  Errors
     *******************************************************************************/

    case AppActionTypes.SET_ERROR:
      return setError(state, payload as SetErrorAction["payload"]);

    /********************************************************************************
     *  Loading
     *******************************************************************************/

    case AppActionTypes.SET_LOADING:
      return setLoading(state, payload as SetLoadingAction["payload"]);

    /********************************************************************************
     *  Set wait list param
     *******************************************************************************/

    case AppActionTypes.SET_WAITLIST:
      return setWaitList(state, payload as SetWaitListAction["payload"]);
          /********************************************************************************
     *  Set Wait list User Message
     *******************************************************************************/

    case AppActionTypes.SET_WAITING_INFO:
      return SetWaitingInfo(state, payload as SetWaitingInfoAction["payload"]);

    /********************************************************************************
     *  Notification
     *******************************************************************************/

    case AppActionTypes.SHOW_NOTIFICATION:
      return showNotification(
        state,
        payload as ShowNotificationAction["payload"]
      );

    case AppActionTypes.HIDE_NOTIFICATION:
      return hideNotification(
        state,
        payload as HideNotificationAction["payload"]
      );

    /********************************************************************************
     *  Reset App
     *******************************************************************************/

    case AppActionTypes.RESET_APP:
      return resetApp(state);

    /********************************************************************************
     *  Set Available Seating Category
     *******************************************************************************/

    case AppActionTypes.Set_Available_Seating:
      return setAvailableSeatingAction(
        state,
        payload as SetAvailableSeatingAction["payload"]
      );

    /********************************************************************************
     *  Set Seating Plan Timer
     *******************************************************************************/

    case AppActionTypes.SET_SEATING_PLAN_TIMER:
      return setSeatTimer(state, payload as SetSeatTimerAction["payload"]);

    default:
      return clearGlobalError(state, {});
  }
}

/********************************************************************************
 *  Set StatScreenEnume
 *******************************************************************************/
function clearGlobalError(
  state: AppReducerState,
  payload: Partial<AppReducerState>
): AppReducerState {
  state = setError(state, { key: ErrorKeyEnum.Global, errorMsg: "" });

  return {
    ...state,
    ...payload,
  };
}

/********************************************************************************
 *  Set Status
 *******************************************************************************/

function setPurchasPortalStatus(
  state: AppReducerState,
  payload: {
    status: EPurchasePortalStatus;
  }
): AppReducerState {
  return clearGlobalError(state, { status: payload.status });
}

/********************************************************************************
 *  Set Screen
 *******************************************************************************/

function setScreen(
  state: AppReducerState,
  { screen }: { screen: ScreenEnum }
): AppReducerState {
  return clearGlobalError(state, { screen });
}

/********************************************************************************
 *  Set First Screen
 *******************************************************************************/

function setFirstScreen(
  state: AppReducerState,
  { fisrtScreen }: { fisrtScreen: ScreenEnum }
): AppReducerState {
  return { ...state, fisrtScreen };
}

/********************************************************************************
 *  Set Event ID
 *******************************************************************************/

function setEventId(
  state: AppReducerState,
  { eventId, replace = false }: { eventId: string; replace?: boolean }
): AppReducerState {
  UrlUtil.setQueryString({ eventId }, replace);

  return clearGlobalError(state, { eventId });
}

/********************************************************************************
 *  Cache Events
 *******************************************************************************/

function cacheEvents(
  state: AppReducerState,
  { events }: { events: IEventGraphQL[] }
): AppReducerState {
  return clearGlobalError(state, {
    eventsCache: ReduxUtil.makeCache(events, "_id", state.eventsCache),
  });
}

/********************************************************************************
 *  Set Season ID
 *******************************************************************************/

function setSeasonId(
  state: AppReducerState,
  { seasonId, replace = false }: { seasonId: string; replace?: boolean }
): AppReducerState {
  UrlUtil.setQueryString({ seasonId }, replace);

  return clearGlobalError(state, { seasonId });
}

/********************************************************************************
 *  Cache Seasons
 *******************************************************************************/

function cacheSeasons(
  state: AppReducerState,
  { seasons }: { seasons: ISeasonGraphQL[] }
): AppReducerState {
  return clearGlobalError(state, {
    seasonsCache: ReduxUtil.makeCache(seasons, "_id", state.seasonsCache),
  });
}

/********************************************************************************
 *  Set Loading
 *******************************************************************************/

function setLoading(
  state: AppReducerState,
  { loading }: { loading: boolean }
): AppReducerState {
  return {
    ...state,
    loading,
  };
}

/********************************************************************************
 *  Set Error
 *******************************************************************************/

function setError(
  state: AppReducerState,
  { key, errorMsg }: { key: ErrorKeyEnum; errorMsg: string }
): AppReducerState {
  return {
    ...state,
    errors: {
      ...state.errors,
      [key]: errorMsg,
    },
  };
}

/********************************************************************************
 *  App Notification
 *******************************************************************************/

function showNotification(
  state: AppReducerState,
  { message, type }: { message: string; type: AppNotificationTypeEnum }
): AppReducerState {
  return {
    ...state,
    notification: {
      type,
      message,
      show: true,
    },
  };
}

function hideNotification(
  state: AppReducerState,
  payload: any
): AppReducerState {
  return {
    ...state,
    notification: {
      ...state.notification,
      show: false,
    },
  };
}

/********************************************************************************
 *  Reset App
 *******************************************************************************/

function resetApp(state: AppReducerState): AppReducerState {
  return {
    ...state,
    errors: {},
    screen: ScreenEnum.Tickets,
    waitList:false,
    waitingInfoMessage:false
  };
}

/********************************************************************************
 *  Set Available Seating Category
 *******************************************************************************/

function setAvailableSeatingAction(
  state: AppReducerState,
  { availablseatingCategories }: any
): AppReducerState {
  return {
    ...state,
    availablseatingCategories,
  };
}

/********************************************************************************
 *  Set Seating Plan Timer
 *******************************************************************************/

function setSeatTimer(
  state: AppReducerState,
  { SeatingPlanTimer }: any
): AppReducerState {
  return {
    ...state,
    SeatingPlanTimer,
  };
}

/********************************************************************************
 *  Set Wait list param
 *******************************************************************************/

function setWaitList(
  state: AppReducerState,
  { waitList }: { waitList: boolean }
): AppReducerState {
  return {
    ...state,
    waitList,
  };
}

/********************************************************************************
 * Set Wait list User Message
 *******************************************************************************/

function SetWaitingInfo(
  state: AppReducerState,
  { waitingInfoMessage }: { waitingInfoMessage: boolean }
): AppReducerState {
  return {
    ...state,
    waitingInfoMessage,
  };
}