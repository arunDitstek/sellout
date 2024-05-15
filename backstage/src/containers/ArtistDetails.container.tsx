import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';
import ArtistOverview from '../pages/ArtistOverview.page';
import ArtistMetrics from '../pages/ArtistMetrics.page';
import ArtistEvents from '../pages/ArtistEvents.page';
import SubSideNavigation from '../components/SubSideNavigation';
import ArtistSideNavButtons from '../components/ArtistSideNavButtons';
import ArtistCard from '../components/ArtistCard';
import PageLoader from "../components/PageLoader";
import useArtist from '../hooks/useArtist.hook';
import { DetailsContainer, Page } from '../components/PageLayout';

type ArtistDetailsContainerProps = {
  match: any
};

const ArtistDetailsContainer: React.FC<ArtistDetailsContainerProps> = ({ match }) => {
  /* Hooks */
  const { artist } = useArtist();

  /** Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(artist)}/>
      {artist && (
        <DetailsContainer>
          <SubSideNavigation>
            <ArtistCard
              artist={artist}
              margin="0 0 16px 0"
            />
            <ArtistSideNavButtons />
          </SubSideNavigation>
          <Page>
            <Route
              path={`${match.url}/overview`}
              component={ArtistOverview}
            />
            <Route
              path={`${match.url}/metrics`}
              component={ArtistMetrics}
            />
            <Route
              path={`${match.url}/events`}
              component={ArtistEvents}
            />
          </Page>
        </DetailsContainer>
      )}
    </Fragment>
  );
};

export default ArtistDetailsContainer;
