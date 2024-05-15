import React, { Fragment } from "react";
import { Route } from "react-router-dom";
import VenueOverview from "../pages/VenueOverview.page";
import VenueMetrics from "../pages/VenueMetrics.page";
import VenueEvents from "../pages/VenueEvents.page";
import VenueSeating from "../pages/VenueSeating.page";
import VenueSeatingCreator from "../pages/VenueSeatingCreator.page";
import SubSideNavigation from "../components/SubSideNavigation";
import VenueSideNavButtons from "../components/VenueSideNavButtons";
import VenueCard from "../components/VenueCard";
import PageLoader from "../components/PageLoader";
import useVenue from '../hooks/useVenue.hook';
import { DetailsContainer, Page } from '../components/PageLayout';

type VenueDetailsContainerProps = {
  match: any;
};

const VenueDetailsContainer: React.FC<VenueDetailsContainerProps> = ({ match }) => {
  /* Hooks */
  const { venue } = useVenue();

  /* Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(venue)} />
      {venue && (
        <DetailsContainer>
          <SubSideNavigation>
            <VenueCard
              venue={venue}
              margin="0 0 16px 0" />
            <VenueSideNavButtons />
          </SubSideNavigation>
          <>
            <Route
              path={`${match.url}/overview`}
              component={VenueOverview}
            />
            <Route
              path={`${match.url}/metrics`}
              component={VenueMetrics}
            />
            <Route
              path={`${match.url}/events`}
              component={VenueEvents}
            />
            <Route
              exact
              path={`${match.url}/seating`}
              component={VenueSeating}
            />
            <Route
              path={`${match.url}/seating/create`}
              component={VenueSeatingCreator}
            />
          </>
        </DetailsContainer>
      )}
    </Fragment>
  );
};

export default VenueDetailsContainer;
