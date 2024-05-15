import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Masonry from "react-masonry-component";
import AnalyticsCardSmall from "../components/AnalyticsCardSmall";
import AnalyticsCardLarge from "../components/AnalyticsCardLarge";
import IAnalytics, {
  AnalyticsTypeEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import GET_ANALYTICS from "@sellout/models/.dist/graphql/queries/analytics.query";
import { useQuery } from "@apollo/react-hooks";
import PageLoader from "../components/PageLoader";
import useSeason from "../hooks/useSeason.hook";
import { PaddedPage } from "../components/PageLayout";

type SeasonMetricsProps = {};

const SeasonMetrics: React.FC<SeasonMetricsProps> = () => {
  /** Hooks */
  const { seasonId, season } = useSeason();
  const [timeZone, setTimeZone] = useState("");
  const [query, setQuery] = React.useState({
    seasonId,
    venueId: null,
    artistId: null,
    startDate: null,
    endDate: null,
    interval: null,
    types: [
      AnalyticsTypeEnum.TotalSales,
      AnalyticsTypeEnum.TicketSales,
      AnalyticsTypeEnum.UpgradeSales,
      AnalyticsTypeEnum.TicketsSold,
      AnalyticsTypeEnum.UpgradesSold,
      AnalyticsTypeEnum.Promotions,
      AnalyticsTypeEnum.TotalOrders,
      AnalyticsTypeEnum.TicketComps,
    ],
  });

  useEffect(() => {
    if (season?.venue?.address?.timezone) {
      setTimeZone(season?.venue?.address?.timezone);
    }
  }, [season]);
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
        <PaddedPage maxWidth="1100px">
          <AnalyticsCardLarge
            query={query}
            setQuery={setQuery}
            data={data?.orderAnalytics[0]}
            timezone={timeZone}
          />
          <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
            {data?.orderAnalytics
              .slice(1)
              .map((data: IAnalytics, index: number) => {
                return (
                  <AnalyticsCardSmall
                    key={index}
                    data={data}
                    timezone={timeZone}
                  />
                );
              })}
          </Masonry>
        </PaddedPage>
      )}
    </>
  );
};

export default SeasonMetrics;
