import React, { Fragment } from 'react';
import { useQuery } from '@apollo/react-hooks';
import Masonry from 'react-masonry-component';
import ArtistCard from '../components/ArtistCard';
import IArtist from '@sellout/models/.dist/interfaces/IArtist';
import LIST_ARTISTS from '@sellout/models/.dist/graphql/queries/artists.query';
import { useDispatch } from "react-redux";
import * as ArtistActions from "../redux/actions/artist.actions";
import PageLoader from '../components/PageLoader';
import useNavigateToArtistDetails from '../hooks/useNavigateToArtistDetails.hook';
import NoPageContent, { NoPageContentTypes } from '../components/NoPageContent';
import { PaddedPage } from '../components/PageLayout';

type ArtistListProps = {
  match: any,
};

const ArtistList: React.FC<ArtistListProps> = ({ match }) => {
  /* Hooks */
  const navigateToArtistDetails = useNavigateToArtistDetails();
  const dispatch = useDispatch();

    /* Actions */
  const cacheArtists = (artists: IArtist[]) =>
      dispatch(ArtistActions.cacheArtists(artists));

  /** Query */
  const { data, loading, error } = useQuery(LIST_ARTISTS, {
    variables: {
      query: {}
    },
    onCompleted: (data) => {
      if (data.artists) {
        cacheArtists(data.artists);
      }
    }
  });

  /** Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={!loading}/>
      <PaddedPage>
        {data?.artists?.length > 0 ? (
          <Masonry
            options={{ horizontalOrder: true }}
            enableResizableChildren
          >
            {data?.artists.map((artist: IArtist) => {
              return (
                <ArtistCard
                  key={artist._id}
                  artist={artist}
                  margin="0 24px 24px 0"
                  onClick={() => navigateToArtistDetails(artist._id)}
                />
              );
            })}
          </Masonry>
        ) : (
          <>
            {!loading && <NoPageContent type={NoPageContentTypes.Artist} />}
          </>
        )}
      </PaddedPage>
    </Fragment>
  );
};

export default ArtistList;
