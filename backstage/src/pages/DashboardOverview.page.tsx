import React from "react";
import UpcomingEventsCard from "../components/UpcomingEventsCard";
import PageLoader from "../components/PageLoader";
import useListEventsHook from "../hooks/useListEvents.hook";
import Masonry from "react-masonry-component";
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import AnalyticsCardMedium from "../components/AnalyticsCardMedium";
import {
  AnalyticsTypeEnum,
  AnalyticsDurationEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import GET_ANALYTICS from "@sellout/models/.dist/graphql/queries/analytics.query";
import { PaddedPage, PageTitle } from "../components/PageLayout";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import { EventQueryEnum } from "../models/enums/EventQueryEnum";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import styled from "styled-components";

type DashboardOverviewProps = {
  match: any;
};

const PageWrapper = styled.div`
  width: 100%;
`;  

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ match }) => {
  /* State */
  const { eventQueryHash } = useSelector((state: BackstageState) => state.app);
  const eventsQuery = eventQueryHash[EventQueryEnum.DashboardUpComingEvents];

  /* Hooks */
  const { data } = useQuery(GET_PROFILE);
  const { events } = useListEventsHook({
    variables: {
      query: eventsQuery,
      pagination: {
        pageSize: 3,
      },
    },
  });
  const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.Today);
  const [query, setQuery] = React.useState({
    eventId: null,
    venueId: null,
    artistId: null,
    startDate: duration.startsAt,
    endDate: duration.endsAt,
    interval: null,
    types: [AnalyticsTypeEnum.Overview],
  });

  const { data: AnalyticsData } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });

  return (
    <>
      <PageLoader
        nav={true}
        fade={Boolean(
          events && data?.user && AnalyticsData?.orderAnalytics.length > 0
        )}
      />
      {events && data?.user && AnalyticsData?.orderAnalytics.length > 0 && (
        <PaddedPage>
          <PageTitle>{`Welcome, ${data?.user?.firstName}`}</PageTitle>
          <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
            <PageWrapper>
              <AnalyticsCardMedium
                query={query}
                setQuery={setQuery}
                data={AnalyticsData?.orderAnalytics[0]}
              />
              <UpcomingEventsCard events={events} />
              </PageWrapper>
          </Masonry>
        </PaddedPage>
      )}
    </>
  );
};

export default DashboardOverview;
