import React, { Fragment } from 'react';
import useArtist from "../hooks/useArtist.hook";
import Masonry from 'react-masonry-component';
import EventCard from '../components/EventCard';
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import useListEventsHook from '../hooks/useListEvents.hook';
import useNavigateToEventDetails from '../hooks/useNavigateToEventDetails.hook';
import PageLoader from '../components/PageLoader';
import NoPageContent, { NoPageContentTypes } from '../components/NoPageContent';
import { PaddedPage, PageTitle } from '../components/PageLayout';

type ArtistEventsProps = {};

const ArtistEvents: React.FC<ArtistEventsProps> = () => {
  /* Hooks */
  const { artistId } = useArtist();
  const navigateToEventDetails = useNavigateToEventDetails();
  const { events } = useListEventsHook({
    variables: {
      query: {
        artistIds: [artistId],
      },
    },
  });

  /* Render */
  return (
    <Fragment>
      <PageLoader nav sideNav fade={Boolean(events)} />
      <PaddedPage>
        {(() => {
          if(events?.length ?? 0 === 0) {
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

export default ArtistEvents;