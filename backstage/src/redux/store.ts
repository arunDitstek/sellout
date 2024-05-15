import { createStore, compose, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import rootSaga from './sagas/root.saga'
import appReducer from './reducers/app.reducer';
import eventReducer from "./reducers/event.reducer";
import venueReducer from "./reducers/venue.reducer";
import artistReducer from "./reducers/artist.reducer";
import feeReducer from "./reducers/fee.reducer";
import customerReducer from './reducers/customer.reducer';
import orderReducer from "./reducers/order.reducer";
import seasonReducer from "./reducers/season.reducer";
// import { composeWithDevTools } from 'redux-devtools-extension';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  app: appReducer,
  event: eventReducer,
  artist: artistReducer,
  venue: venueReducer,
  fee: feeReducer,
  order: orderReducer,
  customer: customerReducer,
  season:seasonReducer,
});

export type BackstageState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  compose(
//     composeWithDevTools(applyMiddleware(sagaMiddleware)),

   applyMiddleware(sagaMiddleware),
    applyMiddleware(logger as any)
  ),
);

sagaMiddleware.run(rootSaga);

export default store;
