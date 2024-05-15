import { all, takeLatest, select, call, put } from "redux-saga/effects";
import { AppActionTypes } from "../actions/app.actions";
import * as AppActions from "../actions/app.actions";
import client from "../../graphql/client";
import OrderReducerState from "../reducers/order.reducer";
import MULTIPLE_BREAK_APART_ORDER from "@sellout/models/.dist/graphql/mutations/multipleBreakApartOrder.mutation";
import { OrderActionCreatorTypes, OrderActionTypes } from "../actions/order.actions";
import * as OrderActions from "../actions/order.actions";

export default function* orderSaga() {
  try {
    yield all([
      setBatchPrintOrderIdsWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}


/************************************************************
 *  Multiple Break Apart Order Api
 ***********************************************************/

function* setBatchPrintOrderIdsWatch() {
  yield takeLatest(
    OrderActionTypes.SET_BATCH_PRINT_ORDER_IDS,
    setBatchPrintOrderSaga
  );
}

function* setBatchPrintOrderSaga(action: OrderActions.SetBatchPrintOrderIdsAction) {
  
  const { orderIds }: { orderIds : any } = action.payload;

  //   const { eventId, eventsCache } = eventState;

  try {
    const res = yield call(async () => {
      return await client.mutate({
        mutation: MULTIPLE_BREAK_APART_ORDER,
        variables: {
          orderId: [""],
        },
      });
    });

    // const { updateEvent }: { updateEvent: IEventGraphQL } = res.data;

    // yield put(EventActions.updateEventSuccess(updateEvent));
  } catch (error) {
    // HANDLE ERROR
    // const errorMsg = ErrorUtil.getErrorMessage(error);
    // yield put(EventActions.updateEventFailure(errorMsg));
  }
}
