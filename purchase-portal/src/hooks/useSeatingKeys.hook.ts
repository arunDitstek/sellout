import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import QUERY_SEATING_KEYS from '@sellout/models/.dist/graphql/queries/seatingKeys.query';

type useSeatingKeys = {
    secretKey?:any
  };

type UseSeatingKeysHook = (orgId?: any) => useSeatingKeys;

const useSeatingKeysHook: UseSeatingKeysHook = (orgId) => {
  /* State */

  /* Hooks */

  const { data } = useQuery(QUERY_SEATING_KEYS, {
    variables: {
        orgId,
    },
  });

  return {
    secretKey:data?.seating?.secretKey
  };
};

export default useSeatingKeysHook;
