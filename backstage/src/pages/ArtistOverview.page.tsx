import React from 'react';
import useArtist from "../hooks/useArtist.hook";
import ArtistDescriptionCard from '../components/ArtistDescriptionCard';
import UpcomingEventsCard from '../components/UpcomingEventsCard';
import PageLoader from '../components/PageLoader';
import Masonry from 'react-masonry-component';
import useListEventsHook from '../hooks/useListEvents.hook';
import AnalyticsCardMedium from '../components/AnalyticsCardMedium';
import { useQuery } from '@apollo/react-hooks';
import {
  AnalyticsTypeEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import GET_ANALYTICS from '@sellout/models/.dist/graphql/queries/analytics.query';
import * as Time from '@sellout/utils/.dist/time';
import { PaddedPage, PageTitle } from '../components/PageLayout';

type ArtistOverviewProps = {};

const ArtistOverview: React.FC<ArtistOverviewProps> = () => {
  /* Hooks */
  const { artistId, artist } = useArtist();
  const [query, setQuery] = React.useState({
    eventId: null,
    venueId: null,
    artistId,
    startDate: null,
    endDate: null,
    interval: null,
    types: [
      AnalyticsTypeEnum.Overview,
    ],
  });
  const { data: AnalyticsData } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });

  const { events } = useListEventsHook({
    variables: {
      query: {
        artistIds: [artistId],
        startDate: Time.getStartOfCurrentDay(),
      },
      pagination: {
        pageSize: 3,
      },
    },
  });

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(events && AnalyticsData?.orderAnalytics)} />
      {events && AnalyticsData?.orderAnalytics && (
        <PaddedPage>
          <PageTitle>
            Overview
          </PageTitle>
          <Masonry
            options={{ horizontalOrder: true }}
            enableResizableChildren
          >
            <AnalyticsCardMedium
              query={query}
              setQuery={setQuery}
              data={AnalyticsData?.orderAnalytics[0]}
            />
            <UpcomingEventsCard events={events} />
            {artist?.pressKits[0]?.description && <ArtistDescriptionCard />}
          </Masonry>
        </PaddedPage>
      )}
    </>
  );
};

export default ArtistOverview;