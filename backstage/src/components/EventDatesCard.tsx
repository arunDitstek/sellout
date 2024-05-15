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

type EventDatesCardProps = {
  event: IEventGraphQL;
};
const EventDatesCard: React.FC<EventDatesCardProps> = ({ event }) => {
  /* Hooks */
  const [timeUntilString, setTimeUntilString] = React.useState("");
  const [totalSecondsType, setTotalSecondsType] = React.useState("");
  const [timezone, setTimezone] = React.useState("");

  React.useEffect(() => {
    let interval: any;
    const schedule: IEventSchedule = event.schedule as IEventSchedule;
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
        totalSecondsTypeLocal = "Until Event Starts";
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
    if (event?.venue?.address?.timezone) {
      setTimezone(event?.venue?.address?.timezone);
    }
    return () => {
      clearInterval(interval);
    };
  }, [event]);

  // console.log(event?.venue?.address?.timezone,venue,'.....')
  // const timezone = venue && venue.address && venue.address.timezone != '' ? venue.address.timezone : event?.venue?.address?.timezone
  /* Render */
  const schedule: IEventSchedule = event.schedule as IEventSchedule;
  const announceAt = schedule.announceAt as number;
  const ticketsAt = schedule.ticketsAt as number;
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
    event?.performances?.[0].schedule && event?.performances?.[0].schedule;
  
  return (
    <DetailsCard
      title="Dates"
      headerIcon={Icons.CalendarStarSolid}
      width="325px"
      padding="0px 20px"
    >
      <Section>
        <Title>{timeUntilString}</Title>
        <Text>{totalSecondsType}</Text>
      </Section>
      <Section>
        <Subtitle>Event</Subtitle>
        {performance &&
          performance.map((a, i) => {
            return (
              <EventDays key={i}>
                <Text>
                  {Time.format(a.startsAt, "ddd, MMM Do [at] h:mma", timezone)}
                </Text>
                <Text margin>
                  {" "}
                  Doors at{" "}
                  {Time.format(a.doorsAt, "ddd, MMM Do [at] h:mma", timezone)}
                </Text>{" "}
              </EventDays>
            );
          })}
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

export default EventDatesCard;
