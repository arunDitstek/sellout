import { useDispatch } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import * as EventActions from "../redux/actions/event.actions";
import * as VenueActions from "../redux/actions/venue.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import LIST_EVENTS from "@sellout/models/.dist/graphql/queries/events.query";
import { QueryHookOptions } from "@apollo/react-hooks";

interface EventsData {
  events: IEventGraphQL[];
}

interface EventsVars {}

type UseListEvents = {
  events: IEventGraphQL[] | undefined;
  loading: boolean;
  error: any | undefined;
};

type UseListEventsHook = (params?: QueryHookOptions) => UseListEvents;

const useListEventsHook: UseListEventsHook = (params) => {
  /* Actions */
  const dispatch = useDispatch();
  const cacheEvents = (events: IEventGraphQL[]) =>
    dispatch(EventActions.cacheEvents(events));

  const cacheVenues = (venues: IVenue[]) =>
    dispatch(VenueActions.cacheVenues(venues));

  if (params && !params?.onCompleted) {
    params.onCompleted = (data) => {
      if (data?.events) {
        cacheEvents(data.events);
        const venues = data?.events
          .map((event: any) => event.venue)
          .filter((venue: IVenue) => Boolean(venue));
        cacheVenues(venues);
      }
    };
  }

  /** Query */
  const { data, loading, error } = useQuery<EventsData, EventsVars>(LIST_EVENTS, params);

  return {
    events: data?.events,
    loading: loading,
    error: error,
  };
};

export default useListEventsHook;
