import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { useQuery } from "@apollo/react-hooks";
import * as AppActions from "../redux/actions/app.actions";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { ApolloError } from "apollo-client";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/publicSeason.query";
import * as OrderActions from "../redux/actions/order.actions";
import * as ClientTrackingUtil from "@sellout/utils/.dist/ClientTrackingUtil";
import purchasePortalModeToOrderChannel from "../utils/purchasePortalModeToOrderChannel";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";

function preloadImages(imageUrls: string[]) {
  imageUrls.forEach((imageUrl) => {
    new Image().src = imageUrl;
  });
}

interface SeasonData {
  season: ISeasonGraphQL;
}

interface SeasonVars {
  seasonId: string;
}

type UseSeason = {
  season: ISeasonGraphQL | undefined;
  seasonId: string;
  loading: boolean;
  error: any | undefined;
};

type UseSeasonHook = (seasonId?: string, foreCallAPI?: boolean) => UseSeason;

const useSeasonHook: UseSeasonHook = (seasonId, foreCallAPI = false) => {
  /* State */
  const {
    mode,
    isComplimentary,
    seasonId: stateSeasonId,
    seasonsCache,
    screen,
  } = useSelector((state: PurchasePortalState) => state.app);
  const channel: OrderChannelEnum = purchasePortalModeToOrderChannel(mode);
  let seasonLoading = false;

  seasonId = (stateSeasonId || seasonId) as string;

  const season = seasonsCache[seasonId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheSeasons = (season: ISeasonGraphQL) =>
    dispatch(AppActions.cacheSeasons([season]));
  const setScreen = (screen: ScreenEnum) => {
    dispatch(AppActions.setScreen(screen));
    dispatch(AppActions.setFirstScreen(screen));
  };

  const setSeasonInitialCreateOrderParams = (season: any) =>
    dispatch(
      OrderActions.setSeasonInitialCreateOrderParams(
        season,
        channel,
        isComplimentary
      )
    );

  /* Hooks */
  if (seasonId) {
    var { loading, error } = useQuery<SeasonData, SeasonVars>(GET_SEASON, {
      variables: {
        seasonId,
      },
      skip: !seasonId,
      fetchPolicy: foreCallAPI ? "network-only" : undefined,
      onCompleted: (data: any) => {
        if (data.season && !season) {
          cacheSeasons(data.season);
          setSeasonInitialCreateOrderParams(data.season);
          ClientTrackingUtil.initialize({
            googleAnalyticsId: data?.season?.organization?.googleAnalyticsId,
            facebookPixelId: data?.season?.organization?.facebookPixelId,
          });


          const allTicketsVisible: any =
            data?.season?.ticketTypes &&
            data?.season?.ticketTypes?.filter(
              (a: any) => a.visible && a.remainingQty > 0
            );

          if (
            mode === EPurchasePortalModes.Checkout &&
            screen !== ScreenEnum.OrderConfirmed
          ) {

            if (allTicketsVisible.length === 0) {
              setScreen(ScreenEnum.EventUnavailable);
            } else if (
              SeasonUtil.isUnavailable(data.season) &&
              allTicketsVisible?.length > 0
            ) {
              setScreen(ScreenEnum.EventUnavailable);
            }
          }

          if (data?.season?.posterImageUrl) {
            preloadImages([data.season.posterImageUrl]);
          }
          if (data?.season?.events?.length === 0) {
            setScreen(ScreenEnum.EventUnavailable);
          }
        }
      },
    });
    seasonLoading = loading
  }

  return {
    season: season,
    seasonId: seasonId,
    loading: season ? false : seasonLoading,
    error: error,
  };
};

export default useSeasonHook;
