import { all } from "redux-saga/effects";
import appSaga from './app.saga';
import app from './app.saga';
import order from './order.saga';
import user from './user.saga';

export default function* rootSaga() {
  try {
    yield all([
      app(),
      order(),
      user(),
    ]);
  } catch (e) {
    console.error(e);
  }
}
