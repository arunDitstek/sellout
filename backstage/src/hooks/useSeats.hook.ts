import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { ApolloError } from "apollo-client";
import GET_SEATING from "@sellout/models/.dist/graphql/queries/seating.query";
import { SeatsioClient, Region } from "seatsio";
import DeepProxy from "proxy-deep";

type UseSeats = {
  client?: any;
  secretKey?: string;
  publicKey?: string;
  designerKey?: string;
  initializing: boolean;
  loading: boolean;
  error: any | undefined;
};

type UseSeatsHook = () => UseSeats;

const useSeatsHook: UseSeatsHook = () => {
  /* State */
  const [client, setClient] = React.useState();
  const [requestLoading, setRequestLoading] = React.useState(false);

  /* Hooks */
  // const makeClientProxy = React.useCallback((secretKey: string): any => {
  //   const client = new SeatsioClient(secretKey);

  //   return new DeepProxy(client, {
  //     get(target, prop) {
  //       const field = target[prop];

  //       console.log(typeof field)

  //       // if(typeof field !== 'function') {
  //       //   return field;
  //       // }

  //       return (...args: any): Promise<any> => {
  //         return new Promise(async (resolve, reject) => {
  //           console.log("hit");
  //           setRequestLoading(true);
  //           const result = await field.apply(target, args);
  //           setRequestLoading(false);
  //           resolve(result);
  //         });

  //       }
  //     }
  //   });
  // }, []);

  const { data, loading, error } = useQuery(GET_SEATING, {
    onCompleted: ({ organization }) => {
      const secretKey: string = organization?.seating?.secretKey;

      // if(secretKey && !client) {
      setClient(new SeatsioClient(Region.EU(), secretKey));
      //  }
    },
  });

  return {
    client,
    secretKey: data?.organization?.seating?.secretKey,
    publicKey: data?.organization?.seating?.publicKey,
    designerKey: data?.organization?.seating?.designerKey,
    initializing: loading,
    loading: requestLoading,
    error: error,
  };
};

export default useSeatsHook;
