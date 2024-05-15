import React, { Fragment } from 'react';
import useVenue from '../hooks/useVenue.hook';
import Masonry from 'react-masonry-component';
import EventCard from '../components/EventCard';
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import useListEventsHook from '../hooks/useListEvents.hook';
import useNavigateToEventDetails from '../hooks/useNavigateToEventDetails.hook';
import PageLoader from '../components/PageLoader';
import { PaddedPage, PageTitle } from '../components/PageLayout';
import NoPageContent, { NoPageContentTypes } from '../components/NoPageContent';

type VenueEventsProps = {};

const VenueEvents: React.FC<VenueEventsProps> = () => {
  /* Hooks */
  const navigateToEventDetails = useNavigateToEventDetails();
  const { venue } = useVenue();
  // TODOD: get this query with venueIds to work
  // Fixed issue SELLOUT-17
  const { events } = useListEventsHook({
    fetchPolicy:"network-only",
    variables: {
      query: {
        venueIds: [venue?._id],
      },
    },
  });

  return (
    <Fragment>
      <PageLoader nav sideNav fade={Boolean(events)} />
      <PaddedPage>
        {(() => {
          // Fixed issue SELLOUT-21
          if (events?.length === 0) {
            return (
              <NoPageContent type={NoPageContentTypes.Event} />
            );
          }

          return (
            <Fragment>
              <PageTitle>
                Events
              </PageTitle>
              <Masonry
                options={{ horizontalOrder: true }}
                enableResizableChildren
              >
                {events?.map((event: IEventGraphQL) => {
                  return (
                    <EventCard
                      key={event._id}
                      event={event}
                      margin="0 20px 20px 0"
                      onClick={() => navigateToEventDetails(event._id)}
                    />
                  );
                })}
              </Masonry>
            </Fragment>
          );
        })()}
      </PaddedPage>
    </Fragment>
  );
};

export default VenueEvents;