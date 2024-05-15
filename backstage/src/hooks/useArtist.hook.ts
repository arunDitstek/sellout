import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useQuery } from '@apollo/react-hooks';
import * as EventActions from "../redux/actions/artist.actions";
import { ApolloError } from "apollo-client";
import GET_ARTIST from '@sellout/models/.dist/graphql/queries/artist.query';
import IArtist from "@sellout/models/.dist/interfaces/IArtist";

type useArtist = {
  artist: IArtist | undefined;
  artistId: string;
  loading: boolean;
  error: any | undefined
};

type UseArtistHook = (artistId?: string) => useArtist;

const useArtistHook: UseArtistHook = (artistId) => {
  /* State */
  const {
    artistId: stateArtistId,
    artistsCache,
  } = useSelector(
    (state: BackstageState) => state.artist
  );

  artistId = (stateArtistId || artistId) as string;

  const artist = artistsCache[artistId];

  /* Actions */
  const dispatch = useDispatch();
  const cacheArtist = (artist: IArtist) =>
    dispatch(EventActions.cacheArtists([artist]));

  /* Hooks */
  const { loading, error } = useQuery(GET_ARTIST, {
    variables: {
      artistId
    },
    onCompleted: (data) => {
      if (data.artist && !artist) {
        cacheArtist(data.artist);
      }
    }
  });

  return {
    artist: artist,
    artistId: artistId,
    loading: artist ? false : loading,
    error: error,
  };
};

export default useArtistHook;
