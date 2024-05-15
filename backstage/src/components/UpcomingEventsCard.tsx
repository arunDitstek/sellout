import React from 'react';
import styled from 'styled-components';
import { Colors, Icons } from '@sellout/ui';
import DetailsCard from '../elements/DetailsCard';
import EventPreview from './EventPreview';
import IEvent from '@sellout/models/.dist/interfaces/IEvent';

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const NoContentBody = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
`;

const NoContentContainer = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const EventPreviewContainer = styled.div`
  border-bottom: 1px solid ${Colors.Grey6};
  transition: all 0.2s;
  padding: 16px;

  &:last-of-type {
    border-bottom: 0;
    border-radius: 0 0 10px 10px;
  }

  &:hover {
    background: ${Colors.Grey7};
  }
`;

type UpcomingEventsProps = {
  events: any;
};
const UpcomingEventsCard: React.FC<UpcomingEventsProps> = ({ events }) => {
  /* Render */
  return (
    <DetailsCard
      title="Upcoming Events"
      headerIcon={Icons.CalendarStarLight}
      width="600px"
      padding="0px"
    >
      {events && events?.map((event: IEvent, i: number) => {
        if(event.cancel) return false
        return (
          <EventPreviewContainer key={i}>
            <EventPreview event={event} showProgressCircle />
          </EventPreviewContainer>
        )
      })}
      {events && events?.length <= 0 &&
        <NoContentContainer>
          <NoContentHead>
            No upcoming events
          </NoContentHead>
        </NoContentContainer>
      }
    </DetailsCard>
  );
};

export default UpcomingEventsCard;