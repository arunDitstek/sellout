import React, { useState, useEffect } from "react";
import Masonry from "react-masonry-component";
import AnalyticsCardSmall from "../components/AnalyticsCardSmall";
import AnalyticsCardLarge from "../components/AnalyticsCardLarge";
import IAnalytics, {
  AnalyticsTypeEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import GET_ANALYTICS from "@sellout/models/.dist/graphql/queries/analytics.query";
import { useQuery } from "@apollo/react-hooks";
import PageLoader from "../components/PageLoader";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import { PaddedPage } from "../components/PageLayout";
import styled from "styled-components";

const CustomPaddedPage = styled(PaddedPage)`
  /* width: calc(100% - 300px); */
`;

type EventMetricsProps = {};

const EventMetrics: React.FC<EventMetricsProps> = () => {
  /** Hooks */
  const { eventId, event } = useEvent();
  const { seasonId, season } = useSeason();
  const [timeZone, setTimeZone] = useState("");
  const [query, setQuery] = React.useState({
    eventId,
    venueId: null,
    artistId: null,
    startDate: null,
    seasonId,
    endDate: null,
    interval: null,
    types: [
      AnalyticsTypeEnum.TotalSales,
      AnalyticsTypeEnum.TicketSales,
      AnalyticsTypeEnum.TicketsSold,
      AnalyticsTypeEnum.TicketsScanned,
      AnalyticsTypeEnum.UpgradeSales,
      AnalyticsTypeEnum.UpgradesSold,
      AnalyticsTypeEnum.UpgradesScanned,
      AnalyticsTypeEnum.TicketComps,
      AnalyticsTypeEnum.TotalOrders,
      AnalyticsTypeEnum.Promotions,

    ],
  });

  useEffect(() => {
    if (event?.venue?.address?.timezone) {
      setTimeZone(event?.venue?.address?.timezone);
    }
    if (season?.venue?.address?.timezone) {
      setTimeZone(season?.venue?.address?.timezone);
    }
  }, [event, season]);
  const { data } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });
  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(data?.orderAnalytics)} />
      {data?.orderAnalytics && (
        <CustomPaddedPage maxWidth="1100px">
          <AnalyticsCardLarge
            query={query}
            setQuery={setQuery}
            data={data?.orderAnalytics[0]}
            timezone={timeZone}
          />
          <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
            {data?.orderAnalytics
              .slice(1)
              .map((data: any, index: number) => {
                return (
                  <AnalyticsCardSmall
                    key={index}
                    data={data}
                    timezone={timeZone}
                  />
                );
              })}
          </Masonry>
        </CustomPaddedPage>
      )}
    </>
  );
};

export default EventMetrics;
