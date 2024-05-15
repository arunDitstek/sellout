import IUser from '@sellout/models/.dist/interfaces/IUser';
import {
  CustomerActionTypes,
  CustomerActionCreatorTypes,
  // Customer Id
  SetCustomerIdAction,
  // Cache Venues
  CacheCustomersAction,
} from "../actions/customer.actions";
import UrlParams from "../../models/interfaces/UrlParams";
import * as UrlUtil from "@sellout/utils/.dist/UrlUtil";
import customerState from "../../models/states/customer.state";
import * as ReduxUtil from "@sellout/utils/.dist/ReduxUtil";

export const NEW_CUSTOMER_ID: string = "new";

export interface ICustomerCache {
  [customerId: string]: any;
}

export type CustomerReducerState = {
  customerId: string;
  customersCache: ICustomerCache;
  saving: boolean;
  errorMsg: string;
};

function customerReducerState(): CustomerReducerState {
  const { query } = UrlUtil.parse(window.location.toString());
  const { customerId = "" }: UrlParams = query;

  return {
    customerId,
    customersCache: {
      [NEW_CUSTOMER_ID]: customerState(),
    },
    saving: false,
    errorMsg: "",
  };
}

export default function reducer(
  state = customerReducerState(),
  action: CustomerActionCreatorTypes,
) {
  const { type, payload } = action;

  switch (type) {
    /********************************************************************************
     *  General Customer Reducers
     *******************************************************************************/

    case CustomerActionTypes.SET_CUSTOMER_ID:
      return setCustomerId(state, payload as SetCustomerIdAction["payload"]);

    /********************************************************************************
     *  Customer Cache
     *******************************************************************************/

    case CustomerActionTypes.CACHE_CUSTOMERS:
      return cacheCustomers(state, payload as CacheCustomersAction["payload"]);

    default:
      return state;
  }
};

/********************************************************************************
 *  Set Venue ID
 *******************************************************************************/

function setCustomerId(
  state: CustomerReducerState,
  { customerId, replace = false }: { customerId: string; replace?: boolean }
): CustomerReducerState {
  UrlUtil.setQueryString({ customerId }, replace);

  return {
    ...state,
    customerId,
  };
}

/********************************************************************************
 *  Cache Customer
 *******************************************************************************/

function cacheCustomers(
  state: CustomerReducerState,
  { customers }: { customers: any[] }
): CustomerReducerState {
  return {
    ...state,
    customersCache: ReduxUtil.makeCache(customers, "userId", state.customersCache),
  };
}