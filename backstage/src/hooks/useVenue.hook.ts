import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useLazyQuery } from "@apollo/react-hooks";
import * as VenueActions from "../redux/actions/venue.actions";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import GET_VENUE from "@sellout/models/.dist/graphql/queries/venue.query";
import { useEffect } from "react";

type UseVenue = {
  venue: IVenue | undefined;
  venueId: string;
  loading: boolean;
  error: any | undefined;
};
type UseVenueHook = (venueId?: string) => UseVenue;

const useVenueHook: UseVenueHook = (venueId) => {
  const dispatch = useDispatch();
  /* State */
  const { venueId: stateVenueId, venuesCache } = useSelector(
    (state: BackstageState) => state.venue
  );
  venueId = (stateVenueId || venueId) as string;

  const venue = venuesCache[venueId];

  /* Actions */
  const cacheVenue = (venue: IVenue) =>
    dispatch(VenueActions.cacheVenues([venue]));

  useEffect(() => {
    if (venueId) {
      getVenue({
        variables: {
          venueId,
        }
      })
    }
  }, [venueId])

  /* Hooks */
  const [getVenue, { data, loading, error }] = useLazyQuery(GET_VENUE, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data.venue) {
        let tax = parseFloat(data.venue.tax).toFixed(2).toString();
        data.venue.tax = tax;
        cacheVenue(data.venue);
      }
    },
  });


  return {
    venue: venue,
    venueId: venueId,
    loading: venue ? false : loading,
    error: error,
  };
};

export default useVenueHook;
