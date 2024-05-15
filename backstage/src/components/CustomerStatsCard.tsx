import React from "react";
import styled from "styled-components";
import { Colors, Icons } from "@sellout/ui";
import DetailsCard from "../elements/DetailsCard";
import * as Price from "@sellout/utils/.dist/price";
// import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
// import { UserAnalyticsSegmentsIndexEnum } from "@sellout/models/.dist/interfaces/IAnalytics";

const StatsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: wrap;
  gap: 15px;
`;

const StatText = styled.div`
  margin-bottom: 5px;
  font-size: 1.4rem;
`;

const Stat = styled.div`
  margin-right: 50px;
  color: ${Colors.Grey1};
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 2.4rem;
`;

type CustomerStatsCardProps = {
  customer: any;
};

// Metrics
const CustomerStatsCard: React.FC<CustomerStatsCardProps> = ({ customer }) => {
  // const eventsAttended = AnalyticsUtil.getTotalValue(
  //   customer.analytics.segments[
  //     UserAnalyticsSegmentsIndexEnum.EventsAttendedCount
  //   ].coordinates
  // );
  return (
    <DetailsCard
      title="Customer Stats"
      headerIcon={Icons.GraphGrowth}
      width="600px"
    >
      <StatsContainer>
        <Stat>
          <StatText>Lifetime Value</StatText>
          <StatValue>{`$${Price.output(customer.metrics[0]?.lifeTimeValue || 0 ,true)}`}</StatValue>
        </Stat>
        <Stat>
          <StatText>Tickets Purchased</StatText>
          <StatValue>{`${customer.metrics[0]?.lifeTimeTicketsPurchased || 0}`}</StatValue>
        </Stat>
        <Stat>
          <StatText>Events Attended</StatText>
          <StatValue>{`${customer.metrics[0] && customer.metrics[0]?.eventIds && customer.metrics[0]?.eventIds.length || 0}`}</StatValue>
        </Stat>
      </StatsContainer>
    </DetailsCard>
  );
};

export default CustomerStatsCard;
