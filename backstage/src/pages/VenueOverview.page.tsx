import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import useVenue from '../hooks/useVenue.hook';
import VenueInformationCard from '../components/VenueInformationCard';
import VenueDescriptionCard from '../components/VenueDescriptionCard';
import UpcomingEventsCard from '../components/UpcomingEventsCard';
import PageLoader from '../components/PageLoader';
import useListEventsHook from '../hooks/useListEvents.hook';
import AnalyticsCardMedium from '../components/AnalyticsCardMedium';
import { useQuery } from '@apollo/react-hooks';
import {
  AnalyticsTypeEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import GET_ANALYTICS from '@sellout/models/.dist/graphql/queries/analytics.query';
import * as Time from '@sellout/utils/.dist/time';
import { PaddedPage, PageTitle } from '../components/PageLayout';
import { media } from '@sellout/ui/build/utils/MediaQuery';

const ColumnContainer = styled.div`
  display: flex;
  transition: all 5s linear;
  flex-wrap: wrap;

  .svgGraphImage{
    ${media.mobile`
    width: 100%;
    box-sizing: border-box;
  `};
  }
`;

const Column = styled.div`
  &.dateWrapper{
    ${media.mobile`
      width: 100%;
      box-sizing: border-box;      
    `};
  }
`;

const ColumnWrapper = styled.div`
  overflow: auto;
`;

type VenueOverviewProps = {};

const VenueOverview: React.FC<VenueOverviewProps> = () => {
  /* Hooks */
  const { venueId, venue } = useVenue();
  const [timeZone, setTimeZone] = useState('')
  const [query, setQuery] = React.useState({
    eventId: null,
    venueId,
    artistId: null,
    startDate: null,
    endDate: null,
    interval: null,
    types: [
      AnalyticsTypeEnum.Overview,
    ],
  });

  useEffect(() => {
    if (venue?.address?.timezone) {
      setTimeZone(venue?.address?.timezone);
    }
  }, [venue])

  const { data: AnalyticsData } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });

  // Fixed issue SELLOUT-17
  const { events } = useListEventsHook({
    fetchPolicy: "network-only",
    variables: {
      query: {
        venueIds: [venueId],
        startDate: Time.getStartOfCurrentDay(),
      },
      pagination: {
        pageSize: 3,
      },
    },
  });


  const hideDescription = !venue?.description || venue?.description === '<p> </p>';

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(events && AnalyticsData?.orderAnalytics)} />
      {events && AnalyticsData?.orderAnalytics && (
        <PaddedPage>
          <PageTitle>
            Overview
          </PageTitle>
          <ColumnWrapper>
            <ColumnContainer>
              <Column className="svgGraphImage">
                <AnalyticsCardMedium
                  query={query}
                  setQuery={setQuery}
                  data={AnalyticsData?.orderAnalytics[0]}
                  timezone={timeZone}
                />
                <UpcomingEventsCard events={events} />
                {!hideDescription && (<VenueDescriptionCard />)}
              </Column>
              <Column className="dateWrapper">
                <VenueInformationCard />
              </Column>
            </ColumnContainer>
          </ColumnWrapper>
        </PaddedPage>
      )}
    </>
  );
};

export default VenueOverview;