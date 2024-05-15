import { all, takeLatest, select, call, put, take } from "redux-saga/effects";
import { FeeActionTypes } from "../actions/fee.actions";
import client from "../../graphql/client";
import GET_FEE from "@sellout/models/.dist/graphql/queries/fee.query";
import CREATE_FEE from "@sellout/models/.dist/graphql/mutations/createFee.mutation";
import UPDATE_FEE from "@sellout/models/.dist/graphql/mutations/updateFee.mutation";
import DELETE_FEE from "@sellout/models/.dist/graphql/mutations/deleteFee.mutation";
import { BackstageState } from "../store";
import * as FeeActions from "../actions/fee.actions";
import * as EventActions from "../actions/event.actions";
import * as ErrorUtil from "@sellout/ui/build/utils/ErrorUtil";
import * as RemoveUtil from "../../utils/RemoveUtil";
import { FeeReducerState } from "../reducers/fee.reducer";
import IFee from "@sellout/models/.dist/interfaces/IFee";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import { NEW_EVENT_ID } from "../reducers/event.reducer";
import * as SeasonActions from "../../redux/actions/season.actions";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import * as AppActions from "../../redux/actions/app.actions";

export default function* feeSaga() {
  try {
    yield all([
      saveFeeWatch(),
      deleteFeeWatch(),
      reCacheFeeWatch(),
      createFeeRequestWatch(),
      updateFeeRequestWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

function cleanFee(fee: any): IFee {
  fee = RemoveUtil.removeEmpty(fee);
  fee = RemoveUtil.removeField(fee, "_id", (_id) => _id === "");
  delete fee.orgId;
  delete fee.createdBy;
  delete fee.createdAt;
  delete fee.updatedBy;
  delete fee.updatedAt;
  delete fee.disabled;
  return fee;
}

/********************************************************************************
 *  Fee Caching
 *******************************************************************************/
function* reCacheFeeWatch() {
  yield takeLatest(FeeActionTypes.RE_CACHE_FEE, reCacheFeeSaga);
}

function* reCacheFeeSaga(action: FeeActions.ReCacheFeeAction) {
  const { feeId }: { feeId: string } = action.payload;

  try {
    const res = yield call(async () => {
      return await client.query({
        query: GET_FEE,
        variables: {
          feeId,
        },
      });
    });

    const { fee }: { fee: IFee } = res.data;

    yield put(FeeActions.cacheFees([fee]));
  } catch (error) {
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(FeeActions.createFeeFailure(errorMsg));
  }
}

/********************************************************************************
 *  Save Fee
 *******************************************************************************/

function* saveFeeWatch() {
  yield takeLatest(FeeActionTypes.SAVE_FEE, saveFeeSaga);
}

function* saveFeeSaga(action: FeeActions.SaveFeeAction) {
  let { id, type }: { id?: string; type?: string } = action.payload;

  if (id === NEW_EVENT_ID) {
    if (type === VariantEnum.Event) {
      yield put(EventActions.createEventRequest());
      yield take(EventActions.EventActionTypes.CREATE_EVENT_SUCCESS);
    }
    if (type === VariantEnum.Season) {
      yield put(SeasonActions.createSeasonRequest());
      yield take(SeasonActions.SeasonActionTypes.CREATE_SEASON_SUCCESS);
    }
    yield saveFee();
  } else {
    if (type === VariantEnum.Event) {
      yield put(EventActions.updateEventRequest());
      yield take(EventActions.EventActionTypes.UPDATE_EVENT_SUCCESS);
    }
    if (type === VariantEnum.Season) {
      yield put(SeasonActions.updateSeasonRequest());
      yield take(SeasonActions.SeasonActionTypes.UPDATE_SEASON_SUCCESS);
    }
    yield saveFee();
  }

  function* saveFee() {
    const feeState: FeeReducerState = yield select(
      (state: BackstageState) => state.fee
    );

    const { feeId, feesCache } = feeState;
    const fee = feesCache[feeId];

    if (id && !fee.eventId && type === VariantEnum.Event) {
      const { eventId: newEventId } = yield select(
        (state: BackstageState) => state.event
      );

      id = newEventId;
      fee.eventId = id;
    }

    if (id && !fee.seasonId && type !== VariantEnum.Event) {
      const { seasonId: newSeasonId } = yield select(
        (state: BackstageState) => state.season
      );
      id = newSeasonId;
      fee.seasonId = id;
    }

    // HANDLE ERROR
    if (fee.createdAt) {
      yield put(FeeActions.updateFeeRequest());
      yield takeLatest(
        FeeActionTypes.UPDATE_FEE_SUCCESS,
        function* (action: FeeActions.UpdateFeeSuccessAction) {}
      );
    } else {
      yield put(FeeActions.createFeeRequest());
      yield takeLatest(
        FeeActionTypes.CREATE_FEE_SUCCESS,
        function* (action: FeeActions.CreateFeeSuccessAction) {
          const feeId = action.payload.fee._id;
          UrlUtil.setQueryString({ feeId }, true);
          if (fee.eventId) {
            yield put(EventActions.reCacheEvent(fee.eventId, true));
          }
          if (fee.seasonId) {
            yield put(SeasonActions.reCacheSeason(fee.seasonId, true));
          }
        }
      );
    }
  }
}

/********************************************************************************
 *  Delete Fee
 *******************************************************************************/

function* deleteFeeWatch() {
  yield takeLatest(FeeActionTypes.DELETE_FEE, deleteFeeSaga);
}

function* deleteFeeSaga(action: FeeActions.DeleteFeeAction) {
  const {
    feeId,
    eventId,
    seasonId,
  }: { feeId: string; eventId?: string; seasonId?: string } = action.payload;

  try {
    yield call(async () => {
      return await client.mutate({
        mutation: DELETE_FEE,
        variables: {
          feeId,
        },
      });
    });
    
    if (eventId) {
      yield put(EventActions.reCacheEvent(eventId, true));
    }
    if (seasonId) {
      yield put(SeasonActions.reCacheSeason(seasonId, true));
    }
  } catch (error) {
    // HANDLE ERROR
    // const errorMsg = ErrorUtil.getErrorMessage(error);
    // yield put(FeeActions.createFeeFailure(errorMsg));
  }
}

/********************************************************************************
 *  Create Fee
 *******************************************************************************/

function* createFeeRequestWatch() {
  yield takeLatest(FeeActionTypes.CREATE_FEE_REQUEST, createFeeRequestSaga);
}

function* createFeeRequestSaga(action: FeeActions.CreateFeeRequestAction) {
  const { event: eventState, fee: feeState } = yield select(
    (state: BackstageState) => state
  );

  const { feeId, feesCache } = feeState;
  const fee = cleanFee(feesCache[feeId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_FEE,
        variables: {
          fee,
        },
      });
    });
    const { createFee }: { createFee: IFee } = res.data;
    yield put(FeeActions.createFeeSuccess(createFee));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(FeeActions.createFeeFailure(errorMsg));
  }
}

/********************************************************************************
 *  Update Fee
 *******************************************************************************/

function* updateFeeRequestWatch() {
  yield takeLatest(FeeActionTypes.UPDATE_FEE_REQUEST, updateFeeRequestSaga);
}

function* updateFeeRequestSaga(action: FeeActions.UpdateFeeRequestAction) {
  const feeState: FeeReducerState = yield select(
    (state: BackstageState) => state.fee
  );
  const { feeId, feesCache } = feeState;
  const fee = cleanFee(feesCache[feeId]);

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: UPDATE_FEE,
        variables: {
          fee,
        },
      });
    });

    const { updateFee }: { updateFee: IFee } = res.data;

    yield put(FeeActions.updateFeeSuccess(updateFee));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(FeeActions.updateFeeFailure(errorMsg));
  }
}
