import React from "react";
import styled from "styled-components";
import Masonry from "react-masonry-component";
import AnalyticsCardSmall from "../components/AnalyticsCardSmall";
import AnalyticsCardLarge from "../components/AnalyticsCardLarge";
import IAnalytics, {
  AnalyticsTypeEnum,
  AnalyticsDurationEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import GET_ANALYTICS from "@sellout/models/.dist/graphql/queries/analytics.query";
import { useMutation, useQuery } from "@apollo/react-hooks";
import PageLoader from "../components/PageLoader";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import FilterButton from "../elements/FilterButton";
import { Icons } from "@sellout/ui";
import GENERATE_ACTIVITY_REPORT from "@sellout/models/.dist/graphql/mutations/generateActivityReport.mutation";
import { media } from "@sellout/ui/build/utils/MediaQuery";

type AnalyticsProps = {
  match: any;
};

const FlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
  flex-direction: row;
  flex-flow: wrap;
  @media (max-width: 1402px) {
    flex-direction: column-reverse;
  }
`;

const FilterWrapper = styled.div`
  width: 200px;
  padding: 24px 15px;
  @media (max-width: 1402px) {
    position: relative;
    left: 70px;
    padding-bottom:0px;
  }
  ${media.mobile`
  left: 10px;
  `};
`;

const PaddedPage = styled.div<any>`
  height: 100%;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  max-width: ${(props) => props.maxWidth};
  position: relative;
  left: 60px;
  ${media.mobile`
  left: 0px;
  `};
`;

const Analytics: React.FC<AnalyticsProps> = ({ match }) => {
  /** Hooks */
  const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.Today);
  const [query, setQuery] = React.useState({
    eventId: null,
    venueId: null,
    artistId: null,
    startDate: duration.startsAt,
    endDate: duration.endsAt,
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
  const [disable, setDisable] = React.useState("false");
  const [generateAnalyticReport, { data: analyticData, loading }] = useMutation(
    GENERATE_ACTIVITY_REPORT,
    {
      variables: {
        query: {
          startDate: query.startDate,
          endDate: query.endDate,
        },
      },
      onCompleted(data) {
        handleDownloadCsv(data?.generateActivityReport?.url);
        setDisable("false");
      },
      onError(error) {
        console.error(error);
      },
    }
  );

  const { data } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });

  const handleDownloadCsv = (generateActivityReport) => {
    const tempLink = document.createElement("a");
    tempLink.href = generateActivityReport;
    tempLink.click();
  };

  /** Render */
  return (
    <>
      <PageLoader nav={true} fade={Boolean(data?.orderAnalytics)} />
      <FlexWrapper>
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
              {data?.orderAnalytics
                .slice(1)
                .map((data: IAnalytics, index: number) => {
                  return <AnalyticsCardSmall key={index} data={data} />;
                })}
            </Masonry>
          </PaddedPage>
        )}

        <FilterWrapper>
          <FilterButton
            text="Activity Report"
            icon={Icons.DownloadReport}
            loading={loading}
            onClick={() => {
              if (disable == "false") {
                setDisable("true");
                generateAnalyticReport();
              }
            }}
          ></FilterButton>
        </FilterWrapper>
      </FlexWrapper>
    </>
  );
};

export default Analytics;
