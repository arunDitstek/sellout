import { useDispatch } from "react-redux";
import { useQuery } from "@apollo/react-hooks";
import * as VenueActions from "../redux/actions/venue.actions";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import LIST_SEASONS from "@sellout/models/.dist/graphql/queries/seasons.query";
import { QueryHookOptions } from "@apollo/react-hooks";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import * as SeasonActions from "../redux/actions/season.actions";

interface SeasonsData {
  seasons: ISeasonGraphQL[];
}

interface SeasonsVars {}

type UseListSeasons = {
  seasons: ISeasonGraphQL[] | undefined;
  loading: boolean;
  error: any | undefined;
};

type UseListSeasonsHook = (params?: QueryHookOptions) => UseListSeasons;

const useListSeasonsHook: UseListSeasonsHook = (params) => {
  /* Actions */
  const dispatch = useDispatch();
  const cacheSeasons = (seasons: ISeasonGraphQL[]) =>
    dispatch(SeasonActions.cacheSeasons(seasons));

  const cacheVenues = (venues: IVenue[]) =>
    dispatch(VenueActions.cacheVenues(venues));

  if (params && !params?.onCompleted) {
    params.onCompleted = (data) => {
      if (data?.seasons) {
        cacheSeasons(data.seasons);
        const venues = data?.seasons
          .map((season: any) => season.venue)
          .filter((venue: IVenue) => Boolean(venue));
        cacheVenues(venues);
      }
    };
  }

  /** Query */
  const { data, loading, error } = useQuery<SeasonsData, SeasonsVars>(
    LIST_SEASONS,
    params
  );

  return {
    seasons: data?.seasons,
    loading: loading,
    error: error,
  };
};

export default useListSeasonsHook;
