import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import * as EventActions from "../redux/actions/event.actions";
import * as ArtistActions from "../redux/actions/artist.actions";
import * as FeeActions from "../redux/actions/fee.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IArtist from "@sellout/models/.dist/interfaces/IArtist";
import IFee from "@sellout/models/.dist/interfaces/IFee";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";

interface EventData {
  event: IEventGraphQL;
}

interface EventVars {
  eventId: string;
}

type UseEvent = {
  event: IEventGraphQL | undefined;
  eventId: string;
  loading: boolean;
  error: any | undefined;
};

type UseEventHook = (eventId?: string, foreCallAPI?: boolean) => UseEvent;

const useEventHook: UseEventHook = (eventId, foreCallAPI = false) => {
  /* State */
  const { eventId: stateEventId, eventsCache } = useSelector(
    (state: BackstageState) => state.event
  );

  eventId = (stateEventId || eventId) as string;

  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheEvent = (event: IEventGraphQL) =>
    dispatch(EventActions.cacheEvents([event]));
  const cacheArtists = (artists: IArtist[]) =>
    dispatch(ArtistActions.cacheArtists(artists));
  const cacheFees = (fees: IFee[]) => dispatch(FeeActions.cacheFees(fees));

  /* Hooks */
  const { loading, error } = useQuery<EventData, EventVars>(GET_EVENT, {
    variables: {
      eventId,
    },
    skip: !eventId,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      if (foreCallAPI) {
        cacheEvent(data?.event);
      } else if (data?.event && !event) {
        cacheEvent(data?.event);
        cacheArtists(data?.event.artists);
        cacheFees(data?.event.fees);
      }
    },
  });
  return {
    event: event,
    eventId: eventId,
    loading: event ? false : loading,
    error: error,
  };
};

export default useEventHook;
