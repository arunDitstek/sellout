import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';
import useEvent from "../hooks/useEvent.hook";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import TicketType from "../components/TicketType";
import EventDatesCard from '../components/EventDatesCard';
import PageLoader from "../components/PageLoader";
import UpgradeType from '../components/UpgradeType';
import IEventUpgrade from '@sellout/models/.dist/interfaces/IEventUpgrade';
import AnalyticsCardMedium from '../components/AnalyticsCardMedium';
import { useQuery } from '@apollo/react-hooks';
import {
  AnalyticsTypeEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import GET_ANALYTICS from '@sellout/models/.dist/graphql/queries/analytics.query';
import { PaddedPage, PageTitle } from '../components/PageLayout';
import Promotion from '../components/Promotion';
import IEventPromotion from '@sellout/models/.dist/interfaces/IEventPromotion';
import { media } from '@sellout/ui/build/utils/MediaQuery';

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

const ColumnWrapper = styled.div`
  overflow: auto;
`;


type EventOverviewProps = {};

const EventOverview: React.FC<EventOverviewProps> = () => {
  /* Hooks */
  const { event, eventId } = useEvent("", true);
  const [timeZone, setTimeZone] = useState('')
  const [query, setQuery] = React.useState({
    eventId,
    venueId: null,
    artistId: null,
    startDate: null,
    endDate: null,
    interval: null,
    types: [
      AnalyticsTypeEnum.Overview,
    ],
  });
  useEffect(() => {
    if (event?.venue?.address?.timezone) {
      setTimeZone(event?.venue?.address?.timezone);
    }
  }, [event])
  const { data: AnalyticsData } = useQuery(GET_ANALYTICS, {
    variables: {
      query,
    },
  });

  /* Render */
  return (
    <Fragment>
      <PageLoader nav sideNav fade={Boolean(event && AnalyticsData?.orderAnalytics)} />
      {event && AnalyticsData?.orderAnalytics && (
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
                <TicketsContainer>
                  {Boolean(event?.ticketTypes?.length ?? 0 > 0) && (
                    <TicketText>
                      Tickets
                    </TicketText>
                  )}
                  {event?.ticketTypes?.map((ticketType: ITicketType) => {
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
                  {Boolean(event?.upgrades?.length ?? 0 > 0) && (
                    <TicketText>
                      Upgrades
                    </TicketText>
                  )}
                  {event?.upgrades?.map((upgrade: IEventUpgrade) => {
                    return (
                      <Fragment key={upgrade._id}>
                        <UpgradeType
                          upgradeType={upgrade}
                          saveOnChanges={true}
                        />
                        <Spacer />
                      </Fragment>
                    );
                  })}
                  {Boolean(event?.promotions?.length ?? 0 > 0) && (
                    <TicketText>
                      Secret Codes
                    </TicketText>
                  )}
                  {event?.promotions?.map((promotion: IEventPromotion) => {
                    return (
                      <Fragment key={promotion._id}>
                        <Promotion
                          promotion={promotion}
                          saveOnChanges={true}
                        />
                        <Spacer />
                      </Fragment>
                    );
                  })}
                </TicketsContainer>
              </Column>
              <Column className='dateWrapper'>
                <EventDatesCard event={event} />
              </Column>
            </ColumnContainer>
          </ColumnWrapper>
        </PaddedPage>
      )}
    </Fragment>
  );
};

export default EventOverview;