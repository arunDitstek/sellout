import { EPurchasePortalStatus } from "@sellout/models/.dist/enums/EPurchasePortalStatus";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { ScreenEnum, ErrorKeyEnum } from "../reducers/app.reducer";

export const AppActionTypes = {
  // Status
  SET_PURCHASE_PORTAL_STATUS: "SET_PURCHASE_PORTAL_STATUS",
  // Screen
  SET_SCREEN: "SET_SCREEN",
  NAVIGATE_FORWARD: "NAVIGATE_FORWARD",
  NAVIGATE_BACKWARD: "NAVIGATE_BACKWARD",
  // Events
  SET_EVENT_ID: "SET_EVENT_ID",
  CACHE_EVENTS: "CACHE_EVENTS",
  // Seasons
  SET_SEASON_ID: "SET_SEASON_ID",
  CACHE_SEASONS: "CACHE_SEASONS",
  // Errors
  SET_ERROR: "SET_ERROR",
  // Loading
  SET_LOADING: "SET_LOADING",
  // Reset App
  RESET_APP: "RESET_APP",
  // Close Purchase Portal
  CLOSE_APP: "CLOSE_APP",
  // Set Available Seating Category
  Set_Available_Seating: "Set_Available_Seating",
  // Set First Time Reload Screen
  SET_FIRST_SCREEN: "SET_FIRST_SCREEN",
  // Set Seating Plan Timer
  SET_SEATING_PLAN_TIMER: "SET_SEATING_PLAN_TIMER",
  // Season Screen
  SEASON_NAVIGATE_FORWARD: "SEASON_NAVIGATE_FORWARD",
  SEASON_NAVIGATE_BACKWARD: "SEASON_NAVIGATE_BACKWARD",
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  SET_WAITLIST: "SET_WAITLIST",
  SET_WAITING_INFO:"SET_WAITING_INFO",
  HIDE_NOTIFICATION: "HIDE_NOTIFICATION",
};

/********************************************************************************
 *  App Action Creators
 *******************************************************************************/

export type AppActionCreatorTypes =
  | SetPurchasePortalStatusAction
  | SetScreenAction
  | NavigateForwardAction
  | NavigateBackwardAction
  | SeasonNavigateForwardAction
  | SeasonNavigateBackwardAction
  | SetEventIdAction
  | CacheEventsAction
  | SetErrorAction
  | ResetAppAction
  | CloseAppAction
  | SetFirstScreenAction
  | SetSeatTimerAction
  | ShowNotificationAction
  | SetWaitListAction
  |SetWaitListAction
  | HideNotificationAction;

/********************************************************************************
 *  Set Purchase Portal Status
 *******************************************************************************/

export interface SetPurchasePortalStatusAction {
  type: typeof AppActionTypes.SET_PURCHASE_PORTAL_STATUS;
  payload: {
    status: EPurchasePortalStatus;
  };
}

export function setPurchasePortalStatus(
  status: EPurchasePortalStatus
): SetPurchasePortalStatusAction {
  return {
    type: AppActionTypes.SET_PURCHASE_PORTAL_STATUS,
    payload: {
      status,
    },
  };
}

/********************************************************************************
 *  Set Screen
 *******************************************************************************/

export interface SetScreenAction {
  type: typeof AppActionTypes.SET_SCREEN;
  payload: {
    screen: ScreenEnum;
  };
}

export function setScreen(screen: ScreenEnum): SetScreenAction {
  return {
    type: AppActionTypes.SET_SCREEN,
    payload: {
      screen,
    },
  };
}
/********************************************************************************
 *  Set First Screen
 *******************************************************************************/

export interface SetFirstScreenAction {
  type: typeof AppActionTypes.SET_FIRST_SCREEN;
  payload: {
    fisrtScreen: ScreenEnum;
  };
}

export function setFirstScreen(fisrtScreen: ScreenEnum): SetFirstScreenAction {
  return {
    type: AppActionTypes.SET_FIRST_SCREEN,
    payload: {
      fisrtScreen,
    },
  };
}
/********************************************************************************
 *  Navigate Forward
 *******************************************************************************/

export interface NavigateForwardAction {
  type: typeof AppActionTypes.NAVIGATE_FORWARD;
  payload: {};
}

export function navigateForward(): NavigateForwardAction {
  return {
    type: AppActionTypes.NAVIGATE_FORWARD,
    payload: {},
  };
}

/********************************************************************************
 *  Navigate Backward
 *******************************************************************************/

export interface NavigateBackwardAction {
  type: typeof AppActionTypes.NAVIGATE_BACKWARD;
  payload: {};
}

export function navigateBackward(): NavigateBackwardAction {
  return {
    type: AppActionTypes.NAVIGATE_BACKWARD,
    payload: {},
  };
}

/********************************************************************************
 *  Season Navigate Forward
 *******************************************************************************/

export interface SeasonNavigateForwardAction {
  type: typeof AppActionTypes.SEASON_NAVIGATE_FORWARD;
  payload: {};
}

export function seasonNavigateForward(): SeasonNavigateForwardAction {
  return {
    type: AppActionTypes.SEASON_NAVIGATE_FORWARD,
    payload: {},
  };
}

/********************************************************************************
 * Season Navigate Backward
 *******************************************************************************/

export interface SeasonNavigateBackwardAction {
  type: typeof AppActionTypes.SEASON_NAVIGATE_BACKWARD;
  payload: {};
}

export function seasonNavigateBackward(): SeasonNavigateBackwardAction {
  return {
    type: AppActionTypes.SEASON_NAVIGATE_BACKWARD,
    payload: {},
  };
}
/********************************************************************************
 *  Set Event ID
 *******************************************************************************/
export interface SetEventIdAction {
  type: typeof AppActionTypes.SET_EVENT_ID;
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
    type: AppActionTypes.SET_EVENT_ID,
    payload: {
      eventId,
      replace,
    },
  };
}

/********************************************************************************
 *  Cache Events
 *******************************************************************************/

export interface CacheEventsAction {
  type: typeof AppActionTypes.CACHE_EVENTS;
  payload: {
    events: IEventGraphQL[];
  };
}

export function cacheEvents(events: IEventGraphQL[]): CacheEventsAction {
  return {
    type: AppActionTypes.CACHE_EVENTS,
    payload: {
      events,
    },
  };
}

/********************************************************************************
 *  Set Season ID
 *******************************************************************************/
export interface SetSeasonIdAction {
  type: typeof AppActionTypes.SET_SEASON_ID;
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
    type: AppActionTypes.SET_SEASON_ID,
    payload: {
      seasonId,
      replace,
    },
  };
}

/********************************************************************************
 *  Cache Seasons
 *******************************************************************************/

export interface CacheSeasonsAction {
  type: typeof AppActionTypes.CACHE_SEASONS;
  payload: {
    seasons: ISeasonGraphQL[];
  };
}

export function cacheSeasons(seasons: ISeasonGraphQL[]): CacheSeasonsAction {
  return {
    type: AppActionTypes.CACHE_SEASONS,
    payload: {
      seasons,
    },
  };
}

/********************************************************************************
 *  Set Error
 *******************************************************************************/

export interface SetErrorAction {
  type: typeof AppActionTypes.SET_ERROR;
  payload: {
    key: ErrorKeyEnum;
    errorMsg: string;
  };
}

export function setError(key: ErrorKeyEnum, errorMsg: string): SetErrorAction {
  return {
    type: AppActionTypes.SET_ERROR,
    payload: {
      key,
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Set Loading
 *******************************************************************************/

export interface SetLoadingAction {
  type: typeof AppActionTypes.SET_LOADING;
  payload: {
    loading: boolean;
  };
}

export function setLoading(loading: boolean): SetLoadingAction {
  return {
    type: AppActionTypes.SET_LOADING,
    payload: {
      loading,
    },
  };
}


/********************************************************************************
 *  Set Wait list param
 *******************************************************************************/

export interface SetWaitListAction {
  type: typeof AppActionTypes.SET_WAITLIST;
  payload: {
    waitList: boolean;
  };
}

export function setWaitList(waitList: boolean): SetWaitListAction {
  return {
    type: AppActionTypes.SET_WAITLIST,
    payload: {
      waitList,
    },
  };
}

/********************************************************************************
 *  Set Wait list User Message
 *******************************************************************************/

export interface SetWaitingInfoAction {
  type: typeof AppActionTypes.SET_WAITING_INFO;
  payload: {
    waitingInfoMessage: boolean;
  };
}

export function SetWaitingInfo(waitingInfoMessage: boolean): SetWaitingInfoAction {
  return {
    type: AppActionTypes.SET_WAITING_INFO,
    payload: {
      waitingInfoMessage,
    },
  };
}

/********************************************************************************
 *  App Notification
 *******************************************************************************/

export interface ShowNotificationAction {
  type: typeof AppActionTypes.SHOW_NOTIFICATION;
  payload: {
    message: string;
    type: AppNotificationTypeEnum;
  }
}

export function showNotification(message: string, type: AppNotificationTypeEnum): ShowNotificationAction {
  return {
    type: AppActionTypes.SHOW_NOTIFICATION,
    payload: {
      message,
      type,
    },
  };
}

export interface HideNotificationAction {
  type: typeof AppActionTypes.HIDE_NOTIFICATION;
  payload: {}
}

export function hideNotification(): HideNotificationAction {
  return {
    type: AppActionTypes.HIDE_NOTIFICATION,
    payload: {},
  };
}

/********************************************************************************
 *  Reset App State Action
 *******************************************************************************/

export interface ResetAppAction {
  type: typeof AppActionTypes.RESET_APP;
  payload: {};
}

export function resetApp(): ResetAppAction {
  return {
    type: AppActionTypes.RESET_APP,
    payload: {},
  };
}

/********************************************************************************
 *  Close Purchase Portal Action
 *******************************************************************************/

export interface CloseAppAction {
  type: typeof AppActionTypes.CLOSE_APP;
  payload: {};
}

export function closeApp(): CloseAppAction {
  return {
    type: AppActionTypes.CLOSE_APP,
    payload: {},
  };
}

/********************************************************************************
 *  Set Available Seating Category
 *******************************************************************************/

export interface SetAvailableSeatingAction {
  type: typeof AppActionTypes.Set_Available_Seating;
  payload: {};
}

export function setAvailableSeatingAction(
  availablseatingCategories: any
): SetAvailableSeatingAction {
  return {
    type: AppActionTypes.Set_Available_Seating,
    payload: availablseatingCategories,
  };
}

/********************************************************************************
 *  Set Seating Plan Timer
 *******************************************************************************/

export interface SetSeatTimerAction {
  type: typeof AppActionTypes.SET_SEATING_PLAN_TIMER;
  payload: {};
}

export function setSeatTimer(SeatingPlanTimer: any): SetSeatTimerAction {
  return {
    type: AppActionTypes.SET_SEATING_PLAN_TIMER,
    payload: SeatingPlanTimer,
  };
}
