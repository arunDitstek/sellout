import url from "url";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import {
  OrderActionTypes,
  OrderActionCreatorTypes,
  SetOrderIdAction,
  CacheOrdersAction,
  setOrderRefundedAction,
  SetBatchPrintOrderIdsAction
} from "../actions/order.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";
import orderState from '../../models/states/order.state';

export const NEW_ORDER_ID: string = "new";

export interface IOrdersCache {
  [orderId: string]: IOrder;
}

type OrderReducerState = {
  orderId: string;
  ordersCache: IOrdersCache;
  refunded: boolean;
  orderIds?: any[];
};

function orderReducerState(): OrderReducerState {
  const { query } = url.parse(window.location.toString(), true);
  const { orderId = "" }: UrlParams = query;

  return {
    orderId,
    ordersCache: {
      [NEW_ORDER_ID]: orderState(),
    },
    refunded: false,
    orderIds:[]
  };
}

export default function reducer(
  state = orderReducerState(),
  action: OrderActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    /********************************************************************************
     *  General Order Reducers
     *******************************************************************************/
    case OrderActionTypes.SET_ORDER_ID:
      return setOrderId(state, payload as SetOrderIdAction["payload"]);

    /********************************************************************************
    *  Batch Print Order Ids Reducers
     *******************************************************************************/
    case OrderActionTypes.SET_BATCH_PRINT_ORDER_IDS:
      return setBatchPrintOrderIds(state, payload as unknown as SetBatchPrintOrderIdsAction["payload"]);

    /********************************************************************************
     *  Order Cache
     *******************************************************************************/

    case OrderActionTypes.CACHE_ORDERS:
      return cacheOrders(state, payload as CacheOrdersAction["payload"]);

    /********************************************************************************
     *  Order Refunded Success/Fails
     *******************************************************************************/

    case OrderActionTypes.ORDER_REFUNDED:
      return setOrderRefunded(state, payload as setOrderRefundedAction["payload"]);


    default:
      return state;
  }
}


/********************************************************************************
 *  Set Order ID
 *******************************************************************************/

function setOrderId(
  state: OrderReducerState,
  { orderId }: { orderId: string }
): OrderReducerState {
  UrlUtil.setQueryString({ orderId });

  return {
    ...state,
    orderId
  };
}


/********************************************************************************
 *  Set Batch Print Order ID'S
 *******************************************************************************/

 function setBatchPrintOrderIds(
  state: OrderReducerState,
  { orderIds }: { orderIds: any }
): OrderReducerState {
  UrlUtil.setQueryString({ orderIds });

  return {
    ...state,
    orderIds
  };
}

/********************************************************************************
 *  Cache Orders
 *******************************************************************************/

function cacheOrders(
  state: OrderReducerState,
  { orders }: { orders: IOrder[] }
): OrderReducerState {
  return {
    ...state,
    ordersCache: ReduxUtil.makeCache(orders, "_id", state.ordersCache),
  };
}

/********************************************************************************
 *  Cache Orders
 *******************************************************************************/

function setOrderRefunded(state: OrderReducerState, { refunded }: { refunded: boolean }): OrderReducerState {
  return {
    ...state,
    refunded
  };
}

