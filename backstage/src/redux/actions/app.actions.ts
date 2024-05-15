import { ModalTypes } from "../../components/modal/Modal";
import IConfirmAction from '../../models/interfaces/IConfirmAction';
import { PaginationMap } from '@sellout/models/.dist/interfaces/IPagination';
import ISaveChanges from '../../models/interfaces/ISaveChanges';
import IFileUpload from "../../models/interfaces/IFileUpload";
import { AppNotificationTypeEnum } from '../../models/interfaces/IAppNotification';
import IModalProps, { ModalPropTypes } from "../../models/interfaces/IModalProps";
import { EventQueryEnum } from "../../models/enums/EventQueryEnum";
import IEventQuery from "@sellout/models/.dist/interfaces/IEventQuery";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import { SeasonQueryEnum } from "../../models/enums/SeasonQueryEnum";
import ISeasonQuery from "@sellout/models/.dist/interfaces/ISeasonQuery";

export const AppActionTypes = {
  SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
  PUSH_MODAL: "PUSH_MODAL",
  POP_MODAL: "POP_MODAL",
  PUSH_MODAL_CONFIRM_ACTION: "PUSH_MODAL_CONFIRM_ACTION",
  SET_PUSH_MODAL_CONFIRM_LOADING: "SET_PUSH_MODAL_CONFIRM_LOADING",
  SET_ROLE_ID: "SET_ROLE_ID",
  SET_ORG_ID: "SET_ORG_ID",
  SET_PAGINATION_MAP: "SET_PAGINATION_MAP",
  SET_CHART_KEY: "SET_CHART_KEY",
  SET_FILE_UPLOAD: "SET_FILE_UPLOAD",
  START_FILE_UPLOAD: "START_FILE_UPLOAD",
  FINISH_FILE_UPLOAD: "FINISH_FILE_UPLOAD",
  SET_SAVE_CHANGES: "SET_SAVE_CHANGES",
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  HIDE_NOTIFICATION: "HIDE_NOTIFICATION",
  SET_EVENT_QUERY: "SET_EVENT_QUERY",
  DELETE_MODAL: "DELETE_MODAL",
  SET_SEASON_QUERY: "SET_SEASON_QUERY",
};

/********************************************************************************
 *  App Action Creators
 *******************************************************************************/

export type AppActionCreatorTypes =
  | SetSearchQueryAction
  | PushModalAction
  | PopModalAction
  | PushModalConfirmActionAction
  | SetFileUploadAction
  | StartFileUploadAction
  | FinishFileUploadAction
  | SetSaveChangesAction
  | SetPaginationMapAction
  | ShowNotificationAction
  | HideNotificationAction
  | SetEventQueryAction
  | SetPushModalConfirmLoading
  | DeleteModalAction
  | SetSeasonQueryAction
/********************************************************************************
 *  Set Search Query
 *******************************************************************************/

export interface SetSearchQueryAction {
  type: typeof AppActionTypes.SET_SEARCH_QUERY;
  payload: {
    searchQuery: string;
  };
}

export function setSearchQuery(searchQuery: string): SetSearchQueryAction {
  return {
    type: AppActionTypes.SET_SEARCH_QUERY,
    payload: {
      searchQuery,
    },
  };
}

/********************************************************************************
 *  Push Modal
 *******************************************************************************/

export interface PushModalAction {
  type: typeof AppActionTypes.PUSH_MODAL;
  payload: {
    modalType: ModalTypes;
    props: ModalPropTypes,
    onClose?: Function
  };
}

export function pushModal(modalType: ModalTypes, props: ModalPropTypes = {}, onClose?: Function): PushModalAction {
  return {
    type: AppActionTypes.PUSH_MODAL,
    payload: {
      modalType,
      props,
      onClose,
    },
  };
}

export interface PushModalConfirmActionAction {
  type: typeof AppActionTypes.PUSH_MODAL_CONFIRM_ACTION;
  payload: {
    confirmAction: IConfirmAction
  };
}

export function pushModalConfirmAction(confirmAction: IConfirmAction): PushModalConfirmActionAction {
  return {
    type: AppActionTypes.PUSH_MODAL_CONFIRM_ACTION,
    payload: {
      confirmAction,
    },
  };
}


export interface SetPushModalConfirmLoading {
  type: typeof AppActionTypes.SET_PUSH_MODAL_CONFIRM_LOADING;
  payload: {
    loadingConfirm: boolean;
  };
}

export function SetPushModalConfirmLoading(loadingConfirm: boolean): SetPushModalConfirmLoading {
  return {
    type: AppActionTypes.SET_PUSH_MODAL_CONFIRM_LOADING,
    payload: {
      loadingConfirm,
    },
  };
}


/********************************************************************************
 *  Pop Modal
 *******************************************************************************/
export interface PopModalAction {
  type: typeof AppActionTypes.POP_MODAL;
  payload: {};
}

export function popModal(): PopModalAction {
  return {
    type: AppActionTypes.POP_MODAL,
    payload: {},
  };
}

/********************************************************************************
 *  Delete All Modal
 *******************************************************************************/
 export interface DeleteModalAction {
  type: typeof AppActionTypes.DELETE_MODAL;
  payload: {};
}

export function deleteModal(): DeleteModalAction {
  return {
    type: AppActionTypes.DELETE_MODAL,
    payload: {},
  };
}

/********************************************************************************
 *  Set Role ID
 *******************************************************************************/

export interface SetRoleIdAction {
  type: typeof AppActionTypes.SET_ROLE_ID;
  payload: {
    roleId: string;
  };
}

export function setRoleId(roleId: string): SetRoleIdAction {
  return {
    type: AppActionTypes.SET_ROLE_ID,
    payload: {
      roleId,
    },
  };
}

/********************************************************************************
 *  Set Organization ID
 *******************************************************************************/

export interface SetOrgIdAction {
  type: typeof AppActionTypes.SET_ORG_ID;
  payload: {
    orgId: string;
  };
}

export function setOrgId(orgId: string): SetOrgIdAction {
  return {
    type: AppActionTypes.SET_ORG_ID,
    payload: {
      orgId,
    },
  };
}

/********************************************************************************
 *  Pagination
 *******************************************************************************/
export interface SetPaginationMapAction {
  type: typeof AppActionTypes.SET_PAGINATION_MAP;
  payload: {
    paginationMap: PaginationMap;
  }
}

export function setPaginationMap(paginationMap: PaginationMap) {
  return {
    type: AppActionTypes.SET_PAGINATION_MAP,
    payload: {
      paginationMap
    }
  }
}


/********************************************************************************
 *  Set Chart Key
 *******************************************************************************/

export interface SetChartKeyAction {
  type: typeof AppActionTypes.SET_CHART_KEY;
  payload: {
    chartKey: string;
  };
}

export function setChartKey(chartKey: string): SetChartKeyAction {
  return {
    type: AppActionTypes.SET_CHART_KEY,
    payload: {
      chartKey,
    },
  };
}

/********************************************************************************
 *  File Upload
 *******************************************************************************/

export interface SetFileUploadAction {
  type: typeof AppActionTypes.SET_FILE_UPLOAD;
  payload: Partial<IFileUpload>
}

export function setFileUpload(
  fileUpload: Partial<IFileUpload>
): SetFileUploadAction {
  return {
    type: AppActionTypes.SET_FILE_UPLOAD,
    payload: fileUpload,
  };
}

export interface StartFileUploadAction {
  type: typeof AppActionTypes.START_FILE_UPLOAD;
  payload: {
   blob: string;
   mimetype: string;
   key: string;
   aspect?: number;
  }
}

export function startFileUpload(
  blob: string,
  mimetype: string,
  key: string,
  aspect?: number,
): StartFileUploadAction {
  return {
    type: AppActionTypes.START_FILE_UPLOAD,
    payload: {
      blob,
      mimetype,
      key,
      aspect,
    }
  };
}

export interface FinishFileUploadAction {
  type: typeof AppActionTypes.FINISH_FILE_UPLOAD;
  payload: {
    key: string,
  }
}

export function finishFileUpload(
  key: string,
): FinishFileUploadAction {
  return {
    type: AppActionTypes.FINISH_FILE_UPLOAD,
    payload: {
      key,
    }
  };
}

/********************************************************************************
 *  Set Save Changes
 *******************************************************************************/

 export interface SetSaveChangesAction {
   type: typeof AppActionTypes.SET_SAVE_CHANGES;
   payload: Partial<ISaveChanges>
 }

 export function setSaveChanges(saveChanges: Partial<ISaveChanges>): SetSaveChangesAction {
   return {
     type: AppActionTypes.SET_SAVE_CHANGES,
     payload: saveChanges,
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
 *  Set Event Query
 *******************************************************************************/

export interface SetEventQueryAction {
  type: typeof AppActionTypes.SET_EVENT_QUERY;
  payload: {
    key: EventQueryEnum;
    query: IEventQuery;
  }
}

export function setEventQuery(key: EventQueryEnum, query: IEventQuery): SetEventQueryAction {
  return {
    type: AppActionTypes.SET_EVENT_QUERY,
    payload: {
      key,
      query,
    },
  };
}

/********************************************************************************
 *  Set Season Query
 *******************************************************************************/

export interface SetSeasonQueryAction {
  type: typeof AppActionTypes.SET_SEASON_QUERY;
  payload: {
    key: SeasonQueryEnum;
    query: ISeasonQuery;
  };
}

export function setSeasonQuery(
  key: SeasonQueryEnum,
  query: ISeasonQuery
): SetSeasonQueryAction {
  return {
    type: AppActionTypes.SET_SEASON_QUERY,
    payload: {
      key,
      query,
    },
  };
}