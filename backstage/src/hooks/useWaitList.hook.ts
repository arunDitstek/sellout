import { useDispatch } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import { QueryHookOptions } from "@apollo/react-hooks";
import * as EventActions from "../redux/actions/event.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import SEARCH_WAIT_LIST from "@sellout/models/.dist/graphql/queries/waitList.query";




type UseWaitList = {
eventWaitList: IEventGraphQL[] | undefined;
  loading: boolean;
  error: any | undefined;
  fetchMore: Function | undefined;
  refetch: Function | undefined;
};

type UseWaitListHook = (params?: QueryHookOptions) => UseWaitList;

const useWaitListHook: UseWaitListHook = (params) => {
  /* Actions */
  const dispatch = useDispatch();
  const cacheEvents = (waitList: IEventGraphQL[]) =>dispatch(EventActions.cacheEvents(waitList));

  if (params && !params?.onCompleted) {
    params.onCompleted = (data) => {
      if (data?.eventQuery) {
        cacheEvents(data?.eventQuery?.waitList);
      }
    };
  }

  /** Query */
  const { data, loading, error, refetch, fetchMore } = useQuery(
    SEARCH_WAIT_LIST,
    params
  );
  //
  return {
    eventWaitList: data?.eventQuery.waitList,
    loading,
    error,
    fetchMore,
    refetch,
  };
};

export default useWaitListHook;
