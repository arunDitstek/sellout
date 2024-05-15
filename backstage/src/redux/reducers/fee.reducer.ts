import IFee from "@sellout/models/.dist/interfaces/IFee";
import {
  FeeActionTypes,
  FeeActionCreatorTypes,
  // Fee Id
  SetFeeIdAction,
  SetPlatformFeeAction,
  // Sagas
  CreateFeeRequestAction,
  CreateFeeSuccessAction,
  CreateFeeFailureAction,
  UpdateFeeRequestAction,
  UpdateFeeSuccessAction,
  UpdateFeeFailureAction,
  // Cache Fees
  CacheFeesAction,
  // Fee Fields
  SetFeeAction,
} from "../actions/fee.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import feeState from "../../models/states/fee.state";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";

export const NEW_FEE_ID: string = "new";

export interface IFeeCache {
  [feeId: string]: IFee;
}

export type FeeReducerState = {
  feeId: string;
  feesCache: IFeeCache;
  saving: boolean;
  errorMsg: string;
  platformFee: boolean;
};

function feeReducerState(): FeeReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const { feeId = "" }: UrlParams = query;

  return {
    feeId,
    feesCache: {
      [NEW_FEE_ID]: feeState(),
    },
    saving: false,
    errorMsg: "",
    platformFee: false
  };
}

export default function reducer(
  state = feeReducerState(),
  action: FeeActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    /********************************************************************************
     *  General Fee Reducers
     *******************************************************************************/

     case FeeActionTypes.APPLY_PLATFORM_FEE:
      return SetPlatformFee(state, payload as SetPlatformFeeAction["payload"]);

    case FeeActionTypes.SET_FEE_ID:
      return setFeeId(state, payload as SetFeeIdAction["payload"]);

    /********************************************************************************
     *  Fee Sagas
     *******************************************************************************/

    case FeeActionTypes.CREATE_FEE_REQUEST:
      return createFeeRequest(
        state
        // payload as CreateFeeRequestAction["payload"]
      );

    case FeeActionTypes.CREATE_FEE_SUCCESS:
      return createFeeSuccess(
        state,
        payload as CreateFeeSuccessAction["payload"]
      );

    case FeeActionTypes.CREATE_FEE_FAILURE:
      return createFeeFailure(
        state,
        payload as CreateFeeFailureAction["payload"]
      );

    case FeeActionTypes.UPDATE_FEE_REQUEST:
      return updateFeeRequest(
        state
        // payload as UpdateFeeRequestAction["payload"]
      );

    case FeeActionTypes.UPDATE_FEE_SUCCESS:
      return updateFeeSuccess(
        state,
        payload as UpdateFeeSuccessAction["payload"]
      );

    case FeeActionTypes.UPDATE_FEE_FAILURE:
      return updateFeeFailure(
        state,
        payload as UpdateFeeFailureAction["payload"]
      );

    /********************************************************************************
     *  Fee Cache
     *******************************************************************************/

    case FeeActionTypes.CACHE_FEES:
      return cacheFees(state, payload as CacheFeesAction["payload"]);

    /********************************************************************************
     *  Fee Fields
     *******************************************************************************/

    case FeeActionTypes.SET_FEE:
      return setFee(state, payload as SetFeeAction["payload"]);

    default:
      return state;
  }
}

/********************************************************************************
 *  Apply Platform Fees To All Organization 
 *******************************************************************************/

function SetPlatformFee(
  state: FeeReducerState,
  { platformFee }: { platformFee: boolean }
): FeeReducerState {
  UrlUtil.setQueryString({ platformFee });

  return {
    ...state,
    platformFee,
  };
}

/********************************************************************************
 *  Set Fee ID
 *******************************************************************************/

function setFeeId(
  state: FeeReducerState,
  { feeId, replace = false }: { feeId: string; replace?: boolean }
): FeeReducerState {
  UrlUtil.setQueryString({ feeId }, replace);

  return {
    ...state,
    feeId,
  };
}

/********************************************************************************
 *  Fee Sagas
 *******************************************************************************/

function createFeeRequest(state: FeeReducerState): FeeReducerState {
  return {
    ...state,
    saving: true,
  };
}

function createFeeSuccess(
  state: FeeReducerState,
  { fee }: { fee: IFee }
): FeeReducerState {
  state = { ...state };
  const feeId = fee._id as string;

  state.saving = false;
  state.feesCache[feeId] = fee;
  state.feesCache[NEW_FEE_ID] = feeState();
  state.feeId = feeId;
  return state;
}

function createFeeFailure(
  state: FeeReducerState,
  { errorMsg }: { errorMsg: string }
): FeeReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  };
}

function updateFeeRequest(state: FeeReducerState): FeeReducerState {
  return {
    ...state,
    saving: true,
  };
}

function updateFeeSuccess(
  state: FeeReducerState,
  { fee }: { fee: IFee }
): FeeReducerState {
  state = { ...state };
  const feeId = fee._id as string;

  state.saving = false;
  state.feesCache[feeId] = fee;
  state.feesCache[NEW_FEE_ID] = feeState();
  return state;
}

function updateFeeFailure(
  state: FeeReducerState,
  { errorMsg }: { errorMsg: string }
): FeeReducerState {
  return {
    ...state,
    errorMsg,
    saving: false,
  };
}

/********************************************************************************
 *  Cache Fees
 *******************************************************************************/

function cacheFees(
  state: FeeReducerState,
  { fees }: { fees: IFee[] }
): FeeReducerState {
  return {
    ...state,
    feesCache: ReduxUtil.makeCache(fees, "_id", state.feesCache),
  };
}

/********************************************************************************
 *  Fee Fields
 *******************************************************************************/

function setFee(
  state: FeeReducerState,
  { feeId, fee }: { feeId?: string; fee: Partial<IFee> }
): FeeReducerState {
  state = { ...state };

  state.feesCache[feeId as string] = {
    ...state.feesCache[feeId as string],
    ...fee,
  };

  return state;
}
