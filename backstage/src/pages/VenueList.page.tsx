import React, { Fragment } from "react";
import styled from "styled-components";
import { useQuery } from "@apollo/react-hooks";
import Masonry from "react-masonry-component";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import VenueCard from "../components/VenueCard";
import * as VenueActions from "../redux/actions/venue.actions";
import LIST_VENUES from "@sellout/models/.dist/graphql/queries/venues.query";
import PageLoader from "../components/PageLoader";
import useNavigateToVenueDetails from "../hooks/useNavigateToVenueDetails.hook";
import { useDispatch } from "react-redux";
import NoPageContent, { NoPageContentTypes } from "../components/NoPageContent";
import { PaddedPage } from "../components/PageLayout";

type VenueListProps = {
  match: any;
};

const VenueList: React.FC<VenueListProps> = ({ match }) => {
  /* Hooks */
  const navigateToVenueDetails = useNavigateToVenueDetails();

  /** Actions */
  const dispatch = useDispatch();
  const cacheVenues = (venues: IVenue[]) =>
    dispatch(VenueActions.cacheVenues(venues));

  /** Query */
  const { data, loading, error } = useQuery(LIST_VENUES, {
    variables: {
      query: {},
    },
    onCompleted: (data) => {
      if (data.venues) {
        cacheVenues(data.venues);
      }
    },
  });

  /** Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={!loading} />
      <PaddedPage>
        {data?.venues?.length > 0 ? (
          <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
            {data.venues.map((venue: IVenue) => {
              return (
                <VenueCard
                  key={venue._id}
                  venue={venue}
                  margin="0 24px 24px 0"
                  onClick={() => navigateToVenueDetails(venue._id)}
                />
              );
            })}
          </Masonry>
        ) : (
          <>{!loading && <NoPageContent type={NoPageContentTypes.Venue} />}</>
        )}
      </PaddedPage>
    </Fragment>
  );
};

export default VenueList;
