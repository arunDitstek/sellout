import React from 'react';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as CustomerActions from '../redux/actions/customer.actions';

type NavigateToCustomerDetails = (customerId?: string, path?: string) => void;

type NavigateToCustomerDetailsHook = () => NavigateToCustomerDetails;

const useNavigateToCustomerDetails: NavigateToCustomerDetailsHook = () => {
  /** Routing */
  const history = useHistory();

  /* Actions */
  const dispatch = useDispatch();
  const setCustomerId = (customerId: string) => dispatch(CustomerActions.setCustomerId(customerId));

  const customerDetails = React.useCallback((customerId, path = '/overview') => {
    setCustomerId(customerId);
    history.push(`/admin/dashboard/customers/details${path}?customerId=${customerId}`);
  }, []);

  /** Return */
  return customerDetails;
};

export default useNavigateToCustomerDetails;
