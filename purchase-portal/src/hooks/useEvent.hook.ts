import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import * as AppActions from "../redux/actions/app.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import GET_PUBLIC_EVENT from "@sellout/models/.dist/graphql/queries/publicEvent.query";
import * as OrderActions from "../redux/actions/order.actions";
import * as ClientTrackingUtil from "@sellout/utils/.dist/ClientTrackingUtil";
import purchasePortalModeToOrderChannel from "../utils/purchasePortalModeToOrderChannel";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";

function preloadImages(imageUrls: string[]) {
  imageUrls.forEach((imageUrl) => {
    new Image().src = imageUrl;
  });
}

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

type UseEventHook = (
  eventId?: string,
  foreCallAPI?: boolean,
  seasonId?: string
) => UseEvent;

const useEventHook: UseEventHook = (eventId, foreCallAPI = false) => {
  /* State */
  const {
    mode,
    isComplimentary,
    eventId: stateEventId,
    eventsCache,
    screen,
  } = useSelector((state: PurchasePortalState) => state.app);
  const channel: OrderChannelEnum = purchasePortalModeToOrderChannel(mode);
  let eventLoading = false;

  eventId = (stateEventId || eventId) as string;

  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheEvent = (event: IEventGraphQL) =>
    dispatch(AppActions.cacheEvents([event]));
  const setScreen = (screen: ScreenEnum) => {
    dispatch(AppActions.setScreen(screen));
    dispatch(AppActions.setFirstScreen(screen));
  };

  const setInitialCreateOrderParams = (event: IEventGraphQL) =>
    dispatch(
      OrderActions.setInitialCreateOrderParams(event, channel, isComplimentary)
    );

  /* Hooks */
  if (eventId) {
    var { loading, error } = useQuery<EventData, EventVars>(GET_PUBLIC_EVENT, {
      variables: {
        eventId,
      },
      skip: !eventId,
      fetchPolicy: foreCallAPI ? "network-only" : undefined,
      onCompleted: (data) => {
        cacheEvent(data.event);

        if (data.event && !event) {
          setInitialCreateOrderParams(data.event);
          ClientTrackingUtil.initialize({
            googleAnalyticsId: data?.event?.organization?.googleAnalyticsId,
            facebookPixelId: data?.event?.organization?.facebookPixelId,
          });
          const allTicketsVisible: any =
            data?.event?.ticketTypes &&
            data?.event?.ticketTypes?.filter(
              (a: any) => a.visible && a.remainingQty > 0
            );

          if (
            mode === EPurchasePortalModes.Checkout &&
            screen !== ScreenEnum.OrderConfirmed
          ) {
            if (allTicketsVisible.length === 0) {
              setScreen(ScreenEnum.EventUnavailable);
            } else if (
              EventUtil.isUnavailable(data.event) &&
              allTicketsVisible.length > 0
            ) {
              setScreen(ScreenEnum.EventUnavailable);
            }
          }
          if (data.event.cancel) {
            setScreen(ScreenEnum.EventUnavailable);
          }
          if (data?.event?.posterImageUrl) {
            preloadImages([data.event.posterImageUrl]);
          }
        }
      },
    });
    eventLoading = loading;
  }

  return {
    event: event,
    eventId: eventId,
    loading: event ? false : eventLoading,
    error: error,
  };
};

export default useEventHook;
