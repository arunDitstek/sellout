import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from '@apollo/react-hooks';
import * as OrderActions from "../redux/actions/order.actions";
import { ApolloError } from "apollo-client";
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import IOrder from "@sellout/models/.dist/interfaces/IOrder";

type UseOrder = {
  order: IOrder | undefined;
  orderId: string;
  loading: boolean;
  error: any | undefined
};

type UseOrderHook = (orderId?: string) => UseOrder;

const useOrderHook: UseOrderHook = (orderId) => {
  /* State */
  const {
    orderId: stateOrderId,
    ordersCache,
  } = useSelector(
    (state: BackstageState) => state.order
  );

  orderId = (stateOrderId || orderId) as string;

  const order = ordersCache[orderId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheOrders = (order: IOrder) =>
    dispatch(OrderActions.cacheOrders([order]));

  /* Hooks */
  const { loading, error } = useQuery(GET_ORDER, {
    variables: {
      orderId
    },
    onCompleted: (data) => {
      if (data.order && !order) {
        cacheOrders(data.order);
      }
    }
  });

  return {
    order: order,
    orderId: orderId,
    loading: order ? false : loading,
    error: error,
  };
};

export default useOrderHook;
