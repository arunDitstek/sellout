import React, { Fragment, useState, useEffect } from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import useSeason from "../hooks/useSeason.hook";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import TicketType from "../components/TicketType";
import SeasonDatesCard from "../components/SeasonDatesCard";
import PageLoader from "../components/PageLoader";
import UpgradeType from "../components/UpgradeType";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import AnalyticsCardMedium from "../components/AnalyticsCardMedium";
import { useQuery } from "@apollo/react-hooks";
import { AnalyticsTypeEnum } from "@sellout/models/.dist/interfaces/IAnalytics";
import GET_ANALYTICS from "@sellout/models/.dist/graphql/queries/analytics.query";
import { PaddedPage, PageTitle } from "../components/PageLayout";
import Promotion from "../components/Promotion";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import GET_SEASON from "@sellout/models/.dist/graphql/queries/publicSeason.query";
import SeasonEventCard from "../components/SeasonEventCard";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const TicketsContainer = styled.div`
  margin: 0px 24px 24px 0px;
  ${media.mobile`
    width: 100%;
    box-sizing: border-box;
    margin: 0px 0 24px 0px;
  `};
`;

const Spacer = styled.div`
  height: 30px;
`;

const TicketText = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 1.8rem;
  margin-bottom: 16px;
`;

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

type SeasonOverviewProps = {};

const SeasonOverview: React.FC<SeasonOverviewProps> = () => {
  /* Hooks */
  const { season, seasonId } = useSeason();
  const [timeZone, setTimeZone] = useState("");
  const [query, setQuery] = React.useState({
    seasonId,
    venueId: null,
    artistId: null,
    startDate: null,
    endDate: null,
    interval: null,
    types: [AnalyticsTypeEnum.Overview],
  });
  useEffect(() => {
    if (season?.venue?.address?.timezone) {
      setTimeZone(season?.venue?.address?.timezone);
    }
  }, [season, timeZone]);
  const { data: AnalyticsData } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });
  var { data: seasonData } = useQuery(GET_SEASON, {
    variables: {
      seasonId,
    },
    fetchPolicy: "network-only",
  });
  /* Render */
  return (
    <Fragment>
      <PageLoader nav sideNav fade={Boolean(season)} />
      {season && AnalyticsData?.orderAnalytics && (
        <PaddedPage>
          <PageTitle>Overview</PageTitle>
          <ColumnContainer>
            <Column className="svgGraphImage">
              <AnalyticsCardMedium
                query={query}
                setQuery={setQuery}
                data={AnalyticsData?.orderAnalytics[0]}
                timezone={timeZone}
              />
              <TicketsContainer>
                {Boolean(season?.ticketTypes?.length ?? 0 > 0) && (
                  <TicketText>Tickets</TicketText>
                )}
                {season?.ticketTypes?.map((ticketType: ITicketType) => {
                  return (
                    <Fragment key={ticketType._id}>
                      <TicketType
                        ticketType={ticketType}
                        saveOnChanges={true}
                      />
                      <Spacer />
                    </Fragment>
                  );
                })}
                {Boolean(season?.upgrades?.length ?? 0 > 0) && (
                  <TicketText>Upgrades</TicketText>
                )}
                {season?.upgrades?.map((upgrade: IEventUpgrade) => {
                  return (
                    <Fragment key={upgrade._id}>
                      <UpgradeType upgradeType={upgrade} saveOnChanges={true} />
                      <Spacer />
                    </Fragment>
                  );
                })}
                {Boolean(season?.promotions?.length ?? 0 > 0) && (
                  <TicketText>Secret Codes</TicketText>
                )}
                {season?.promotions?.map((promotion: IEventPromotion) => {
                  return (
                    <Fragment key={promotion._id}>
                      <Promotion promotion={promotion} saveOnChanges={true} />
                      <Spacer />
                    </Fragment>
                  );
                })}
              </TicketsContainer>
            </Column>
            <div>
              <Column className='dateWrapper'>
                <SeasonDatesCard season={season} />
              </Column>
              {seasonData?.season?.events.length > 0 && (
                <Column>
                  <SeasonEventCard events={seasonData?.season?.events} />
                </Column>
              )}
            </div>
          </ColumnContainer>
        </PaddedPage>
      )}
    </Fragment>
  );
};

export default SeasonOverview;
