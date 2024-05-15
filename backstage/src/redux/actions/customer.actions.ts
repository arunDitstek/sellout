import IUser from '@sellout/models/.dist/interfaces/IUser';


export const CustomerActionTypes = {
  // Customer Id
  SET_CUSTOMER_ID: 'SET_CUSTOMER_ID',
  // Cache Customers
  CACHE_CUSTOMERS: 'CACHE_CUSTOMERS',
}

/********************************************************************************
 *  Customer Action Creators
 *******************************************************************************/

export type CustomerActionCreatorTypes =
  // Customer Id
  | SetCustomerIdAction
  | CacheCustomersAction;

/********************************************************************************
 *  Set Customer ID
 *******************************************************************************/

export interface SetCustomerIdAction {
  type: typeof CustomerActionTypes.SET_CUSTOMER_ID;
  payload: {
    customerId: string;
  };
}

export function setCustomerId(customerId: string): SetCustomerIdAction {
  return {
    type: CustomerActionTypes.SET_CUSTOMER_ID,
    payload: {
      customerId,
    },
  };
}

/********************************************************************************
 *  Cache Customers
 *******************************************************************************/

export interface CacheCustomersAction {
  type: typeof CustomerActionTypes.CACHE_CUSTOMERS;
  payload: {
    customers: any[];
  };
}

export function cacheCustomers(customers: any[]): CacheCustomersAction {
  return {
    type: CustomerActionTypes.CACHE_CUSTOMERS,
    payload: {
      customers,
    },
  };
}