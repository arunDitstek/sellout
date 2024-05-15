import React from "react";
import styled from "styled-components";
import { Colors, Icons } from "@sellout/ui";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import DetailsCard from "../elements/DetailsCard";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import IVenue from "@sellout/models/.dist/interfaces/IVenue";
import * as Time from "@sellout/utils/.dist/time";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const Section = styled.div`
  margin: 30px 0px;
`;

const Title = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 1.4rem;
`;
const EventDays = styled.div``;

type TextProps = {
  margin?: boolean;
};

const Text = styled.div<TextProps>`
  color: ${Colors.Grey2};
  font-weight: 500;
  font-size: 1.4rem;
  margin-bottom: ${(props) => (props.margin ? "20px" : "0px")};
`;
interface IEventGraphQL extends IEvent {
  venue?: IVenue;
}

type SeasonDatesCardProps = {
  season: ISeasonGraphQL;
};
const SeasonDatesCard: React.FC<SeasonDatesCardProps> = ({ season }) => {

  /* Hooks */
  const [timeUntilString, setTimeUntilString] = React.useState("");
  const [totalSecondsType, setTotalSecondsType] = React.useState("");
  const [timezone, setTimezone] = React.useState("");

  React.useEffect(() => {
    let interval: any;
    const schedule: IEventSchedule = season.schedule as IEventSchedule;
    const announceAt = schedule.announceAt as number;
    const ticketsAt = schedule.ticketsAt as number;
    const startsAt = schedule.startsAt as number;

    let timeUntilStringLocal;
    let totalSecondsTypeLocal;

    const tick = () => {
      if (announceAt - Time.now() > 0) {
        timeUntilStringLocal = Time.formattedCountDown(Time.now(), announceAt);
        totalSecondsTypeLocal = "Until Announcement";
      } else if (ticketsAt - Time.now() > 0) {
        timeUntilStringLocal = Time.formattedCountDown(Time.now(), ticketsAt);
        totalSecondsTypeLocal = "Until Tickets Go On Sale";
      } else if (startsAt - Time.now() > 0) {
        timeUntilStringLocal = Time.formattedCountDown(Time.now(), startsAt);
        totalSecondsTypeLocal = "Until Season Starts";
      } else {
        return null;
      }
      setTimeUntilString(timeUntilStringLocal);
      setTotalSecondsType(totalSecondsTypeLocal);
    };

    // Initial Tick
    tick();

    // Set initial state and start countdown.
    if (timeUntilStringLocal && totalSecondsTypeLocal) {
      setTimeUntilString(timeUntilStringLocal);
      setTotalSecondsType(totalSecondsTypeLocal);
      clearInterval(interval);
      interval = setInterval(() => tick(), 1000);
    }

    if (season?.venue?.address?.timezone) {
      setTimezone(season?.venue?.address?.timezone);
    }
    return () => {
      clearInterval(interval);
    };
  }, [season]);

  // console.log(event?.venue?.address?.timezone,venue,'.....')
  // const timezone = venue && venue.address && venue.address.timezone != '' ? venue.address.timezone : event?.venue?.address?.timezone
  /* Render */
  const schedule: IEventSchedule = season.schedule as IEventSchedule;
  const announceAt = schedule.announceAt as number;
  const ticketsAt = schedule.ticketsAt as number;
  const startsAt = schedule.startsAt as number;
  const endsAt = schedule.endsAt as number;
  const announceDate = Time.format(
    announceAt,
    "ddd, MMM DD, YYYY [at] h:mma",
    timezone
  );
  const onSaleDate = Time.format(
    ticketsAt,
    "ddd, MMM DD, YYYY [at] h:mma",
    timezone
  );
  const performance =
    season?.performances?.[0].schedule && season?.performances?.[0].schedule;

  const format = (timestamp) => {
    const local = Time.convertToLocal(timestamp, timezone);
    return Time.formatWithoutTz(local * 1000, "ddd, MMM Do [at] h:mma");
  };


  return (
    <DetailsCard
      title="Dates"
      headerIcon={Icons.CalendarStarSolid}
      width="360px"
      padding="0px 20px"
    >
      <Section>
        <Title>{timeUntilString}</Title>
        <Text>{totalSecondsType}</Text>
      </Section>
      <Section>
        <Subtitle>Season</Subtitle>
        <Text>
          {format(startsAt)}
          {" - "}
          {format(endsAt)}
        </Text>
      </Section>
      <Section>
        <Subtitle>On Sale</Subtitle>
        <Text>{onSaleDate}</Text>
      </Section>
      <Section>
        <Subtitle>Announcement</Subtitle>
        <Text>{announceDate}</Text>
      </Section>
    </DetailsCard>
  );
};

export default SeasonDatesCard;
