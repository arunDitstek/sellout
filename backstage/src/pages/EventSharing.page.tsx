import React from 'react';
import useEvent from "../hooks/useEvent.hook";
import EmbedBuyButtonCard from '../components/EmbedBuyButtonCard';
import EventPublishedCard from '../components/EventPublishedCard';
import PageLoader from "../components/PageLoader";
import { PaddedPage, PageTitle } from '../components/PageLayout';

type EventSharingProps = {}

const EventSharing: React.FC<EventSharingProps> = () => {
  /* Hooks */
  const { event } = useEvent();

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(event)} />
      {event && (
      <PaddedPage>
        <PageTitle>
          Sharing
        </PageTitle>
        <EventPublishedCard event={event} />
        <EmbedBuyButtonCard event={event} />
      </PaddedPage>
      )}
    </>
  );
};

export default EventSharing;