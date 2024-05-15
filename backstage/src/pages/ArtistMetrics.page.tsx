import React from 'react';
import Masonry from 'react-masonry-component';
import AnalyticsCardSmall from '../components/AnalyticsCardSmall';
import AnalyticsCardLarge from '../components/AnalyticsCardLarge';
import IAnalytics, {
  AnalyticsTypeEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import GET_ANALYTICS from '@sellout/models/.dist/graphql/queries/analytics.query';
import { useQuery } from '@apollo/react-hooks';
import PageLoader from '../components/PageLoader';
import useArtist from "../hooks/useArtist.hook";
import { PaddedPage } from '../components/PageLayout';

type ArtistMetricsProps = {};

const ArtistMetrics: React.FC<ArtistMetricsProps> = () => {
  /* Hooks */
  const { artistId } = useArtist();
  const [query, setQuery] = React.useState({
    eventId: null,
    venueId: null,
    artistId,
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
      AnalyticsTypeEnum.UpgradeComps,
    ],
  });


  const { data } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    }
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
          />
          <Masonry
            options={{ horizontalOrder: true }}
            enableResizableChildren
          >
            {data?.orderAnalytics.slice(1).map((data: IAnalytics, index: number) => {
              return (
                <AnalyticsCardSmall
                  key={index}
                  data={data}
                />
              )
            })}
          </Masonry>
        </PaddedPage>
      )}
    </>
  );
};

export default ArtistMetrics;