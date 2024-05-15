import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import ISeason, {
  ISeasonGraphQL,
} from "@sellout/models/.dist/interfaces/ISeason";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/season.query";
import * as FeeActions from "../redux/actions/fee.actions";
import * as SeasonActions from "../redux/actions/season.actions";
import { useEffect } from "react";
import IFee from "@sellout/models/.dist/interfaces/IFee";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";

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
  const { seasonId: stateSeasonId, seasonCache } = useSelector(
    (state: BackstageState) => state.season
  );

  seasonId = (stateSeasonId || seasonId) as string;

  const season = seasonCache[seasonId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheSeason = (season: ISeasonGraphQL) =>
    dispatch(SeasonActions.cacheSeasons([season]));
  // const cacheArtists = (artists: IArtist[]) =>
  //   dispatch(ArtistActions.cacheArtists(artists));
  const cacheFees = (fees: IFee[]) => dispatch(FeeActions.cacheFees(fees));

  /* Hooks */
  const { loading, error } = useQuery<SeasonData, SeasonVars>(GET_SEASON, {
    variables: {
      seasonId,
    },
    skip: !seasonId,
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      if (foreCallAPI) {
        cacheSeason(data?.season);
      }
      else if (data?.season && !season) {
        cacheSeason(data?.season);
        cacheFees(data?.season.fees);
      }
    },
  });

  return {
    season: season,
    seasonId: seasonId,
    loading: season ? false : loading,
    error: error,
  };
};

export default useSeasonHook;
