import React from "react";
import styled, { keyframes, css } from "styled-components";
import * as Time from "@sellout/utils/.dist/time";
import { Colors } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ISeason from "@sellout/models/.dist/interfaces/ISeason";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";

type StatusProps = {
  color: string;
};
const Status = styled.div<StatusProps>`
  background: ${(props) => props.color};
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
  animation: ${css`
    ${pulse} 1.5s infinite
  `};
`;

export const SeasonStatusEnum = {
  OnSale: "On sale",
  Live: "Live",
  PastSeason: "Past season",
  PreAnnouncement: "Pre-announcement",
  Announced: "Announced",
  SoldOut: "Sold out",
  Cancelled: "Cancelled",
  SalesHaveEnded: "Sales have ended",
  Draft: "Draft",
};

const getSeasonStatus = (season: ISeason) => {
  const now = Time.now();

  const s: IEventSchedule = season.schedule as IEventSchedule;
  const announceAt = s.announceAt as number;
  const ticketsAt = s.ticketsAt as number;
  const ticketsEndAt = s.ticketsEndAt as number;
  const startsAt = s.startsAt as number;
  const endsAt = s.endsAt as number;

  // if (!webFlowEntity || !webFlowEntity.webFlowIds || !webFlowEntity.webFlowIds.length) {
  //   return SeasonStatusEnum.Draft;
  // }

  // TODO: cancelled status
  if (startsAt < now && endsAt > now && !season.cancel) {
    return {
      text: SeasonStatusEnum.Live,
      color: Colors.Green,
    };
  }

  if (!season.published && !season.cancel) {
    return {
      text: SeasonStatusEnum.Draft,
      color: Colors.Grey2,
    };
  }

  const remainingQty = season?.ticketTypes?.reduce(
    (cur: number, next: ITicketType) => {
      return cur + next.remainingQty;
    },
    0
  );

  if (remainingQty !== undefined && remainingQty <= 0 && !season.cancel) {
    return {
      text: SeasonStatusEnum.SoldOut,
      color: Colors.Orange,
    };
  }

  if (now < announceAt && !season.cancel) {
    return {
      text: SeasonStatusEnum.PreAnnouncement,
      color: Colors.Grey2,
    };
  }

  if (announceAt < now && now < ticketsAt && !season.cancel) {
    return {
      text: SeasonStatusEnum.Announced,
      color: Colors.Grey2,
    };
  }

  if (endsAt < now && !season.cancel) {
    return {
      text: SeasonStatusEnum.PastSeason,
      color: Colors.Grey2,
    };
  }

  if (ticketsEndAt < now && !season.cancel) {
    return {
      text: SeasonStatusEnum.SalesHaveEnded,
      color: Colors.Grey2,
    };
  }

  if (season.published && !season.cancel) {
    return {
      text: SeasonStatusEnum.OnSale,
      color: Colors.Green,
    };
  }

  if (season.cancel) {
    return {
      text: SeasonStatusEnum.Cancelled,
      color: Colors.Red,
    };
  }

  // unknown status
  return {
    text: SeasonStatusEnum.Draft,
    color: Colors.Grey2,
  };
};

type SeasonStatusProps = {
  season: ISeason;
};
const SeasonStatus: React.FC<SeasonStatusProps> = ({ season }) => {
  const { text, color } = getSeasonStatus(season);
  return (
    <Status color={color}>
      {text}
      {text === SeasonStatusEnum.Live && <Circle />}
    </Status>
  );
};

export default SeasonStatus;
