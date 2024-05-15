import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import * as CustomerActions from "../redux/actions/customer.actions";
import GET_CUSTOMER_PROFILE from "@sellout/models/.dist/graphql/queries/customerProfile.query";

type UseCustomer = {
  customer: any | undefined;
  customerId: string;
  loading: boolean;
  error: any | undefined;
};

type UseCustomerHook = (customerId?: string) => UseCustomer;

const useCustomerHook: UseCustomerHook = (customerId) => {
  /* State */
  const { orgId } = useSelector((state: BackstageState) => state.app);
  const { customerId: stateCustomerId, customersCache } = useSelector(
    (state: BackstageState) => state.customer
  );

  customerId = (stateCustomerId || customerId) as string;

  const customer = customersCache[customerId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheCustomer = (customer: any) => {
    dispatch(CustomerActions.cacheCustomers([customer]));
  };

  /* Hooks */
  const { data, loading, error } = useQuery(GET_CUSTOMER_PROFILE, {
    variables: {
      query: {
        userIds: [customerId],
        orgId
      },
    },
    onCompleted: (data) => {
      if (data.userProfiles && !customer) {
        cacheCustomer(data.userProfiles[0]);
      }
    },
  });

  return {
    customer: customerId ? data?.userProfiles[0] : customer,
    customerId: customerId,
    loading: customer ? false : loading,
    error: error,
  };
};

export default useCustomerHook;
