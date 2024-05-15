import { createStore, compose, combineReducers, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import rootSaga from './sagas/root.saga'
import appReducer from './reducers/app.reducer';
import orderReducer from "./reducers/order.reducer";
import userReducer from "./reducers/user.reducer";
// import { composeWithDevTools } from '@redux-devtools/extension';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  app: appReducer,
  order: orderReducer,
  user: userReducer
});


export type PurchasePortalState = ReturnType<typeof rootReducer>;

const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(sagaMiddleware),
    applyMiddleware(logger as any),
  ) 
);

sagaMiddleware.run(rootSaga);

export default store;
