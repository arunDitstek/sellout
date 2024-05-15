import { all } from "redux-saga/effects";
import app from "./app.saga";
import event from "./event.saga";
import venue from "./venue.saga";
import artist from "./artist.saga";
import fee from "./fee.saga";
import season from "./season.saga";

export default function* rootSaga() {
  try {
    yield all([app(), event(), venue(), artist(), fee(), season()]);
  } catch (e) {
    console.error(e);
  }
}
