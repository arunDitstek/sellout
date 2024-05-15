import { all, takeLatest, select, call, put } from "redux-saga/effects";
import { AppActionTypes } from "../actions/app.actions";
import * as AppActions from "../actions/app.actions";
import wait from '@sellout/utils/.dist/wait';

export default function* eventSaga() {
  try {
    yield all([
      showNotificationWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}


/************************************************************
 *  App Notification
 ***********************************************************/

function* showNotificationWatch() {
  yield takeLatest(
    AppActionTypes.SHOW_NOTIFICATION,
    showNotificationSaga
  );
}

function* showNotificationSaga(
  action: AppActions.ShowNotificationAction
) {
  yield call(async () => await wait(7000));  
  yield put(AppActions.hideNotification()); 
}
