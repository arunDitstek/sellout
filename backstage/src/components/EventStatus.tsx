import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import * as Time from '@sellout/utils/.dist/time';
import { Colors } from '@sellout/ui';
import ITicketType from '@sellout/models/.dist/interfaces/ITicketType';
import IEvent from '@sellout/models/.dist/interfaces/IEvent';
import IEventSchedule from '@sellout/models/.dist/interfaces/IEventSchedule';

type StatusProps = {
  color: string;
}
const Status = styled.div<StatusProps>`
  background: ${props => props.color};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  color: ${Colors.White};
  width: fit-content;
  padding: 4px 8px;
  font-weight: 600;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
`;

const pulse = keyframes`
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(230, 57, 70, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(230, 57, 70, 0);
	}
`;

const Circle = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 25px;
  background: ${Colors.Red};
  margin-left: 8px;
	box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
	transform: scale(1);
	animation: ${css`${pulse} 1.5s infinite`};
`;

export const EventStatusEnum = {
  OnSale: 'On sale',
  Live: 'Live',
  PastEvent: 'Past event',
  PreAnnouncement: 'Pre-announcement',
  Announced: 'Announced',
  SoldOut: 'Sold out',
  Cancelled: 'Cancelled',
  SalesHaveEnded: 'Sales have ended',
  Draft: 'Draft',
};

const getEventStatus = (event: IEvent) => {
  const now = Time.now();

  const s: IEventSchedule = event?.schedule as IEventSchedule;
  const announceAt = s?.announceAt as number;
  const ticketsAt = s?.ticketsAt as number;
  const ticketsEndAt = s?.ticketsEndAt as number;
  const startsAt = s?.startsAt as number;
  const endsAt = s?.endsAt as number;

  // if (!webFlowEntity || !webFlowEntity.webFlowIds || !webFlowEntity.webFlowIds.length) {
  //   return EventStatusEnum.Draft;
  // }

  // TODO: cancelled status
  if (startsAt < now && endsAt > now && !event?.cancel) {
    return {
      text: EventStatusEnum.Live,
      color: Colors.Green,
    };
  }

  if (!event?.published && !event?.cancel) {
    return {
      text: EventStatusEnum.Draft,
      color: Colors.Grey2,
    };
  }

  const remainingQty = event?.ticketTypes?.reduce((cur: number, next: ITicketType) => {
    return cur + next.remainingQty;
  }, 0);


  if (remainingQty !== undefined && remainingQty <= 0 && !event?.cancel) {
    return {
      text: EventStatusEnum.SoldOut,
      color: Colors.Orange,
    };
  }

  if (now < announceAt && !event?.cancel) {
    return {
      text: EventStatusEnum.PreAnnouncement,
      color: Colors.Grey2,
    };
  }

  if (announceAt < now && now < ticketsAt && !event?.cancel) {
    return {
      text: EventStatusEnum.Announced,
      color: Colors.Grey2,
    };
  }

  if (endsAt < now && !event?.cancel) {
    return {
      text: EventStatusEnum.PastEvent,
      color: Colors.Grey2,
    };
  }

  if (ticketsEndAt < now && !event?.cancel) {
    return {
      text: EventStatusEnum.SalesHaveEnded,
      color: Colors.Grey2,
    };
  }

  if (event?.published && !event?.cancel) {
    return {
      text: EventStatusEnum.OnSale,
      color: Colors.Green,
    };
  }

  if (event?.cancel) {
    return {
      text: EventStatusEnum.Cancelled,
      color: Colors.Red,
    };
  }


  // unknown status
  return {
    text: EventStatusEnum.Draft,
    color: Colors.Grey2,
  };
}

type EventStatusProps = {
  event: IEvent;
}
const EventStatus: React.FC<EventStatusProps> = ({ event }) => {
  const { text, color } = getEventStatus(event);
  return (
    <Status
      color={color}
    >
      {text}
      {text === EventStatusEnum.Live && (
        <Circle />
      )}
    </Status>
  );
};

export default EventStatus;
