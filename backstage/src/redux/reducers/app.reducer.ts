import {
  AppActionTypes,
  AppActionCreatorTypes,
  SetSearchQueryAction,
  PushModalAction,
  PopModalAction,
  PushModalConfirmActionAction,
  SetRoleIdAction,
  SetOrgIdAction,
  SetChartKeyAction,
  SetFileUploadAction,
  StartFileUploadAction,
  FinishFileUploadAction,
  SetSaveChangesAction,
  SetPaginationMapAction,
  ShowNotificationAction,
  HideNotificationAction,
  SetEventQueryAction,
  SetPushModalConfirmLoading,
  DeleteModalAction,
} from "../actions/app.actions";
import { ModalTypes, urlSafeModalTypes } from "../../components/modal/Modal";
import UrlParams from "../../models/interfaces/UrlParams";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import IConfirmAction from "../../models/interfaces/IConfirmAction";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import IFileUpload from "../../models/interfaces/IFileUpload";
import IModal from "../../models/interfaces/IModal";
import IAppNotification, {
  AppNotificationTypeEnum,
} from "../../models/interfaces/IAppNotification";
import saveChangesState from "../../models/states/saveChanges.state";
import fileUploadState from "../../models/states/fileUpload.state";
import modalState from "../../models/states/modal.state";
import appNotificationState from "../../models/states/appNotification.state";
import IPagination, {
  PaginationTypes,
  PaginationMap,
} from "@sellout/models/.dist/interfaces/IPagination";
import {
  ModalPropTypes,
} from "../../models/interfaces/IModalProps";
import IEventQuery from "@sellout/models/.dist/interfaces/IEventQuery";
import { EventQueryEnum } from "../../models/enums/EventQueryEnum";
import { EventQueryHash } from "../../models/types/EventQueryHash";
import * as Time from "@sellout/utils/.dist/time";
import {
  EventQueryOrderByEnum,
  EventQuerySortByEnum,
} from "@sellout/models/.dist/interfaces/IEventQuery";
import { SeasonQueryEnum } from "../../models/enums/SeasonQueryEnum";
import { SeasonQueryHash } from "../../models/types/SeasonQueryHash";
import ISeasonQuery from "@sellout/models/.dist/interfaces/ISeasonQuery";

const confirmActionState = (): IConfirmAction => {
  return {
    title: "",
    message: "",
    confirm: null,
    cancel: null,
  };
};

const eventQueryHash = () => {
  return {
    [EventQueryEnum.MainEventListUpComing]: {
      startDate: Time.getStartOfCurrentDay(),
      cancel: false,
    },
    [EventQueryEnum.MainEventListPast]: {
      endDate: Time.getStartOfCurrentDay(),
      cancel: false,
    },
    [EventQueryEnum.DashboardUpComingEvents]: {
      startDate: Time.getStartOfCurrentDay(),
      sortBy: EventQuerySortByEnum.StartsAt,
      orderBy: EventQueryOrderByEnum.Descending,
      published: true,
      cancel: false,
    },
    [EventQueryEnum.MainEventListCancelled]: {
      cancel: true,
    },
  } as EventQueryHash;
};

const seasonQueryHash = () => {
  return {
    [SeasonQueryEnum.MainSeasonListUpComing]: {
      startDate: Time.getStartOfCurrentDay(),
    },
    [SeasonQueryEnum.MainSeasonListPast]: {
      endDate: Time.getStartOfCurrentDay(),
    },
    [SeasonQueryEnum.DashboardUpComingSeasons]: {
      startDate: Time.getStartOfCurrentDay(),
      sortBy: EventQuerySortByEnum.StartsAt,
      orderBy: EventQueryOrderByEnum.Descending,
      published: true,
    },
    [SeasonQueryEnum.DashboardUpComingSeasons]: {
      cancel: true,
    },
  } as SeasonQueryHash;
};

const paginationMapState = () => {
  return new Map<PaginationTypes, IPagination>([
    [
      PaginationTypes.Orders,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.EventOrders,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.CustomerOrders,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.Events,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.Venues,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.Artists,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.Customers,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
    [
      PaginationTypes.Organizations,
      {
        pageSize: 60,
        pageNumber: 1,
      },
    ],
  ]);
};

export type AppReducerState = {
  intercomEnabled: boolean;
  searchOpen: boolean;
  searchQuery: string;
  sideBarQuery: string;
  modal: IModal;
  fileUpload: IFileUpload;
  saveChanges: ISaveChanges;
  confirmAction: IConfirmAction;
  loadingConfirm: boolean;
  roleId: string;
  orgId: string;
  chartKey: string;
  paginationMap: PaginationMap;
  isOnboarding: boolean;
  notification: IAppNotification;
  eventQueryHash: EventQueryHash;
  seasonQueryHash: SeasonQueryHash;
  discardChanges: boolean;
};

function appReducerState(): AppReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const {
    modalType = "",
    chartKey = "",
    onboarding = "",
    orgId = "",
    roleId = "",
  }: UrlParams = query;

  const isSafeModal = Object.values(urlSafeModalTypes).includes(
    modalType as ModalTypes
  );
  const modals = modalType && isSafeModal ? [modalType as ModalTypes] : [];

  if (modalType && !isSafeModal) {
    UrlUtil.setQueryString({ modalType: null });
  }

  return {
    intercomEnabled: false,
    searchOpen: false,
    searchQuery: "",
    sideBarQuery: "",
    roleId,
    orgId,
    chartKey,
    loadingConfirm: false,
    isOnboarding: Boolean(onboarding),
    modal: modalState(modals),
    fileUpload: fileUploadState(),
    saveChanges: saveChangesState(),
    confirmAction: confirmActionState(),
    paginationMap: paginationMapState(),
    notification: appNotificationState(),
    eventQueryHash: eventQueryHash(),
    seasonQueryHash: seasonQueryHash(),
    discardChanges: false,
  };
}

export default function reducer(
  state = appReducerState(),
  action: AppActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    
    case AppActionTypes.SET_SEARCH_QUERY:
      return setSearchQuery(state, payload as SetSearchQueryAction["payload"]);

    case AppActionTypes.PUSH_MODAL:
      return pushModal(state, payload as PushModalAction["payload"]);

    case AppActionTypes.POP_MODAL:
      return popModal(state, payload as PopModalAction["payload"]);

    case AppActionTypes.DELETE_MODAL:
      return deleteModal(state, payload as DeleteModalAction["payload"]);

    case AppActionTypes.PUSH_MODAL_CONFIRM_ACTION:
      return pushModalConfirmAction(
        state,
        payload as PushModalConfirmActionAction["payload"]
      );

    case AppActionTypes.SET_PUSH_MODAL_CONFIRM_LOADING:
      return pushModalConfirmActionLoading(
        state,
        payload as SetPushModalConfirmLoading["payload"]
      );

    case AppActionTypes.SET_ROLE_ID:
      return setRoleId(state, payload as SetRoleIdAction["payload"]);

    case AppActionTypes.SET_ORG_ID:
      return setOrgId(state, payload as SetOrgIdAction["payload"]);

    case AppActionTypes.SET_CHART_KEY:
      return setChartKey(state, payload as SetChartKeyAction["payload"]);

    case AppActionTypes.SET_FILE_UPLOAD:
      return setFileUpload(state, payload as SetFileUploadAction["payload"]);

    case AppActionTypes.SET_PAGINATION_MAP:
      return setPaginationMap(
        state,
        payload as SetPaginationMapAction["payload"]
      );

    case AppActionTypes.START_FILE_UPLOAD:
      return startFileUpload(
        state,
        payload as StartFileUploadAction["payload"]
      );

    case AppActionTypes.FINISH_FILE_UPLOAD:
      return finishFileUpload(
        state,
        payload as FinishFileUploadAction["payload"]
      );

    case AppActionTypes.SET_SAVE_CHANGES:
      return setSaveChanges(state, payload as SetSaveChangesAction["payload"]);

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

    case AppActionTypes.SET_EVENT_QUERY:
      return setEventQuery(state, payload as SetEventQueryAction["payload"]);

    default:
      return state;
  }
}

/********************************************************************************
 *  Set Search Query
 *******************************************************************************/

function setSearchQuery(
  state: AppReducerState,
  { searchQuery }: { searchQuery: string }
): AppReducerState {
  return {
    ...state,
    searchQuery,
  };
}

/********************************************************************************
 *  Modal
 *******************************************************************************/

function setModal(
  state: AppReducerState,
  modal: Partial<IModal>
): AppReducerState {
  return {
    ...state,
    modal: {
      ...state.modal,
      ...modal,
    },
  };
}

function pushModal(
  state: AppReducerState,
  {
    modalType,
    props = {},
    onClose = () => {},
  }: {
    modalType: ModalTypes;
    props: ModalPropTypes;
    onClose?: Function;
  }
): AppReducerState {
  let modals = [...state.modal.modals];
  let modalProps = { ...state.modal.modalProps };
  let stateModalTypeProps = [...(modalProps[modalType] ?? [])];

  let onCloseModal = [...state.modal.onClose];
  UrlUtil.setQueryString({ modalType });
  modals.push(modalType);
  stateModalTypeProps.push(props);
  modalProps[modalType] = stateModalTypeProps;
  onCloseModal.push(onClose);

  return setModal(state, { modals, modalProps, onClose: onCloseModal });
}

function popModal(
  state: AppReducerState,
  payload: PopModalAction["payload"]
): AppReducerState {
  UrlUtil.setQueryString({ modalType: null });
  let modals = [...state.modal.modals];
  // Pop Modal
  let poppedModalType = modals.pop();

  // Pop Modal Props
  let modalProps = { ...state.modal.modalProps };
  if (poppedModalType) {
    let stateModalTypeProps = [...(modalProps[poppedModalType] ?? [])];
    stateModalTypeProps.pop();
    modalProps[poppedModalType] = stateModalTypeProps;
  }

  // Pop onClose
  let onCloseModal = [...state.modal.onClose];
  let onClose = onCloseModal.pop();
  if (onClose) onClose();
  return setModal(state, { modals, modalProps, onClose: onCloseModal });
}

function deleteModal(
  state: AppReducerState,
  payload: DeleteModalAction["payload"]
): AppReducerState {
  UrlUtil.setQueryString({ modalType: null });
  let modals = [...state.modal.modals];

  // Pop Modal
  let poppedModalType = modals;
  modals.length = 0;
  // Pop Modal Props
  let modalProps = { ...state.modal.modalProps };
  if (modals.length === 0) {
    modalProps = {} as any;
  }
  // Pop onClose
  let onCloseModal = [...state.modal.onClose];
  onCloseModal.length = 0;
  return setModal(state, { modals, modalProps, onClose: onCloseModal });
}

function pushRoleIdModal(
  state: AppReducerState,
  { roleId }: { roleId: string }
): AppReducerState {
  const modalType = ModalTypes.ChangeRole;
  state = pushModal(state, { modalType, props: {} });
  state = setRoleId(state, { roleId });
  return state;
}

function pushModalConfirmAction(
  state: AppReducerState,
  { confirmAction }: { confirmAction: IConfirmAction }
): AppReducerState {
  const modalType = ModalTypes.ChangeRole;
  state = pushModal(state, { modalType: ModalTypes.ConfirmAction, props: {} });
  state.confirmAction = confirmAction;
  return state;
}

function pushModalConfirmActionLoading(
  state: AppReducerState,
  { loadingConfirm }: { loadingConfirm: boolean }
) {
  state.loadingConfirm = loadingConfirm;
  return state;
}

/********************************************************************************
 *  Set Role ID
 *******************************************************************************/

function setRoleId(
  state: AppReducerState,
  { roleId }: { roleId: string }
): AppReducerState {
  return {
    ...state,
    roleId,
  };
}

/********************************************************************************
 *  Set Org ID
 *******************************************************************************/

function setOrgId(
  state: AppReducerState,
  { orgId }: { orgId: string }
): AppReducerState {
  return {
    ...state,
    orgId,
  };
}

/********************************************************************************
 *  Set Pagination
 *******************************************************************************/

function setPaginationMap(
  state: AppReducerState,
  { paginationMap }: { paginationMap: PaginationMap }
): AppReducerState {
  return {
    ...state,
    paginationMap,
  };
}

/********************************************************************************
 *  Set Chart Key
 *******************************************************************************/

function setChartKey(
  state: AppReducerState,
  { chartKey }: { chartKey: string }
): AppReducerState {
  return {
    ...state,
    chartKey,
  };
}

/********************************************************************************
 *  File Upload
 *******************************************************************************/

function setFileUpload(
  state: AppReducerState,
  fileUpload: Partial<IFileUpload>
): AppReducerState {
  return {
    ...state,
    fileUpload: {
      ...state.fileUpload,
      ...fileUpload,
    },
  };
}

function startFileUpload(
  state: AppReducerState,
  {
    blob,
    mimetype,
    key,
    aspect,
  }: { blob: string; mimetype: string; key: string; aspect?: number }
): AppReducerState {
  const modalType = ModalTypes.ImageCropper;
  state = pushModal(state, { modalType, props: {} });
  const fileUpload = { ...state.fileUpload };
  fileUpload.keys.push(key);
  fileUpload.blob = blob;
  fileUpload.mimetype = mimetype;
  fileUpload.aspect = aspect;

  return {
    ...state,
    fileUpload: {
      ...state.fileUpload,
      ...fileUpload,
    },
  };
}

function finishFileUpload(
  state: AppReducerState,
  { key }: { key: string }
): AppReducerState {
  const fileUpload = {
    keys: state.fileUpload.keys.filter((stateKey) => stateKey !== key),
  };

  return {
    ...state,
    fileUpload: {
      ...state.fileUpload,
      ...fileUpload,
    },
  };
}

/********************************************************************************
 *  Save Changes
 *******************************************************************************/

function setSaveChanges(
  state: AppReducerState,
  saveChanges: Partial<ISaveChanges>
): AppReducerState {
  return {
    ...state,
    saveChanges: {
      ...state.saveChanges,
      ...saveChanges,
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
 *  Set Event Query
 *******************************************************************************/

function setEventQuery(
  state: AppReducerState,
  { key, query }: { key: EventQueryEnum; query: IEventQuery }
): AppReducerState {
  state = { ...state };
  const newQuery = { ...state.eventQueryHash[key], ...query };
  state.eventQueryHash[key] = newQuery;
  return state;
}

/********************************************************************************
 *  Set Season Query
 *******************************************************************************/

function setSeasonQuery(
  state: AppReducerState,
  { key, query }: { key: SeasonQueryEnum; query: ISeasonQuery }
): AppReducerState {
  state = { ...state };
  const newQuery = { ...state.seasonQueryHash[key], ...query };
  state.seasonQueryHash[key] = newQuery;
  return state;
}
