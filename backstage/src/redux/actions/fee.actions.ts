import IFee from "@sellout/models/.dist/interfaces/IFee";

export const FeeActionTypes = {
  // Fee Id
  SET_FEE_ID: "SET_FEE_ID",
  // Save Fee
  SAVE_FEE: "SAVE_FEE",
  // Delete Fee
  DELETE_FEE: "DELETE_FEE",
  // Create Fee Modal
  CREATE_HEADLINING_FEE: "CREATE_HEADLINING_FEE",
  CREATE_OPENING_FEE: "CREATE_OPENING_FEE",
  // Create Fee
  CREATE_FEE_REQUEST: "CREATE_FEE_REQUEST",
  CREATE_FEE_SUCCESS: "CREATE_FEE_SUCCESS",
  CREATE_FEE_FAILURE: "CREATE_FEE_FAILURE",
  // Update Fee
  UPDATE_FEE_REQUEST: "UPDATE_FEE_REQUEST",
  UPDATE_FEE_SUCCESS: "UPDATE_FEE_SUCCESS",
  UPDATE_FEE_FAILURE: "UPDATE_FEE_FAILURE",
  // Cache Fees
  CACHE_FEES: "CACHE_FEES",
  RE_CACHE_FEE: "RE_CACHE_FEE",
  // Fee Fields
  SET_FEE: "SET_FEE",
  APPLY_PLATFORM_FEE: "APPLY_PLATFORM_FEE"
};

/********************************************************************************
 *  Fee Action Creators
 *******************************************************************************/

export type FeeActionCreatorTypes =
  // Fee Id
  | SetFeeIdAction
  // Save Fee
  | SaveFeeAction
  // Delete Fee
  | DeleteFeeAction
  // Create Fee
  | CreateFeeRequestAction
  | CreateFeeSuccessAction
  | CreateFeeFailureAction
  // Update Fee
  | UpdateFeeRequestAction
  | UpdateFeeSuccessAction
  | UpdateFeeFailureAction
  // Cache Fees
  | CacheFeesAction
  | ReCacheFeeAction
  // Fee Fields
  | SetFeeAction
  | SetPlatformFeeAction;


  /********************************************************************************
 *  Apply Platform Fees To All Organization 
 *******************************************************************************/

export interface SetPlatformFeeAction {
  type: typeof FeeActionTypes.APPLY_PLATFORM_FEE;
  payload: {
    platformFee: boolean;
  };
}

export function SetPlatformFee(platformFee: boolean): SetPlatformFeeAction {
  return {
    type: FeeActionTypes.APPLY_PLATFORM_FEE,
    payload: {
      platformFee,
    },
  };
}

/********************************************************************************
 *  Set Fee ID
 *******************************************************************************/

export interface SetFeeIdAction {
  type: typeof FeeActionTypes.SET_FEE_ID;
  payload: {
    feeId: string;
  };
}

export function setFeeId(feeId: string): SetFeeIdAction {
  return {
    type: FeeActionTypes.SET_FEE_ID,
    payload: {
      feeId,
    },
  };
}

/********************************************************************************
 *  Save Fee
 *******************************************************************************/

export interface SaveFeeAction {
  type: typeof FeeActionTypes.SAVE_FEE;
  payload: {
    id?: string;
    type?: string;
  };
}

export function saveFee(id?: string, type?: string): SaveFeeAction {
  return {
    type: FeeActionTypes.SAVE_FEE,
    payload: {
      id,
      type,
    },
  };
}

/********************************************************************************
 *  Delete Fee
 *******************************************************************************/

export interface DeleteFeeAction {
  type: typeof FeeActionTypes.DELETE_FEE;
  payload: {
    feeId: string;
    eventId?: string;
    seasonId?:string
  };
}

export function deleteFee(feeId: string, eventId?: string,seasonId?:string): DeleteFeeAction {
  return {
    type: FeeActionTypes.DELETE_FEE,
    payload: {
      feeId,
      eventId,
      seasonId
    },
  };
}

/********************************************************************************
 *  Create Fee
 *******************************************************************************/

// Request

export interface CreateFeeRequestAction {
  type: typeof FeeActionTypes.CREATE_FEE_REQUEST;
  payload: {};
}

export function createFeeRequest(): CreateFeeRequestAction {
  return {
    type: FeeActionTypes.CREATE_FEE_REQUEST,
    payload: {},
  };
}

// Success

export interface CreateFeeSuccessAction {
  type: typeof FeeActionTypes.CREATE_FEE_SUCCESS;
  payload: {
    fee: IFee;
  };
}

export function createFeeSuccess(fee: IFee): CreateFeeSuccessAction {
  return {
    type: FeeActionTypes.CREATE_FEE_SUCCESS,
    payload: {
      fee,
    },
  };
}

// Failure

export interface CreateFeeFailureAction {
  type: typeof FeeActionTypes.CREATE_FEE_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createFeeFailure(errorMsg: string): CreateFeeFailureAction {
  return {
    type: FeeActionTypes.CREATE_FEE_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Update Fee
 *******************************************************************************/

// Request

export interface UpdateFeeRequestAction {
  type: typeof FeeActionTypes.UPDATE_FEE_REQUEST;
  payload: {};
}

export function updateFeeRequest(): UpdateFeeRequestAction {
  return {
    type: FeeActionTypes.UPDATE_FEE_REQUEST,
    payload: {},
  };
}

// Success

export interface UpdateFeeSuccessAction {
  type: typeof FeeActionTypes.UPDATE_FEE_SUCCESS;
  payload: {
    fee: IFee;
  };
}

export function updateFeeSuccess(fee: IFee): UpdateFeeSuccessAction {
  return {
    type: FeeActionTypes.UPDATE_FEE_SUCCESS,
    payload: {
      fee,
    },
  };
}

// Failure

export interface UpdateFeeFailureAction {
  type: typeof FeeActionTypes.UPDATE_FEE_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function updateFeeFailure(errorMsg: string): UpdateFeeFailureAction {
  return {
    type: FeeActionTypes.UPDATE_FEE_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/********************************************************************************
 *  Cache Fees
 *******************************************************************************/

export interface CacheFeesAction {
  type: typeof FeeActionTypes.CACHE_FEES;
  payload: {
    fees: IFee[];
  };
}

export function cacheFees(fees: IFee[]): CacheFeesAction {
  return {
    type: FeeActionTypes.CACHE_FEES,
    payload: {
      fees,
    },
  };
}

/********************************************************************************
 *  Re-cache Fee
 *******************************************************************************/

export interface ReCacheFeeAction {
  type: typeof FeeActionTypes.RE_CACHE_FEE;
  payload: {
    feeId: string;
  };
}

export function reCacheFee(feeId: string): ReCacheFeeAction {
  return {
    type: FeeActionTypes.RE_CACHE_FEE,
    payload: {
      feeId,
    },
  };
}

/********************************************************************************
 *  Fee Fields
 *******************************************************************************/

export interface SetFeeAction {
  type: typeof FeeActionTypes.SET_FEE;
  payload: {
    feeId: string;
    fee: Partial<IFee>;
  };
}

export function setFee(feeId: string, fee: Partial<IFee>): SetFeeAction {
  return {
    type: FeeActionTypes.SET_FEE,
    payload: {
      feeId,
      fee,
    },
  };
}
