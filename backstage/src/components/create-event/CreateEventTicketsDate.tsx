import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import DatePicker from "../../elements/DatePicker";
import * as Time from "@sellout/utils/.dist/time";
import { useMobileMedia } from "@sellout/ui/build/utils/MediaQuery";
import * as SeasonActions from "../../redux/actions/season.actions";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";

const Container = styled.div`
  position: relative;
`;

type CreateEventTicketsDateProps = { type: string };

const CreateEventTicketsDate: React.FC<CreateEventTicketsDateProps> = ({
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const isEvent = window.location.href.includes("eventId");
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { season, seasonId } = useSeason();

  const { venuesCache } = venueState;
  const venueId = eventId
    ? (event?.venueId as string)
    : (season?.venueId as string);
  const venue = venuesCache[venueId];
  const timezoneEvent =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : event?.venue?.address?.timezone;

  const timezoneSeason =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : season?.venue?.address?.timezone;

  let ticketsAtEvent =
    event && event.schedule && event.schedule.ticketsAt
      ? event.schedule.ticketsAt
      : undefined;

  let ticketsAtSeason =
    season && season.schedule && season.schedule.ticketsAt
      ? season.schedule.ticketsAt
      : undefined;

  /* Sold Tickets */
  const isSeated = isEvent && event?.hasOrders;

  /* Actions */
  const dispatch = useDispatch();
  const setEventScheduleTicketsAt = (ticketsAt: number) =>
    dispatch(
      EventActions.setEventScheduleTicketsAt(
        eventId,
        Time.changeTimeZone(ticketsAt * 1000, timezoneEvent)
      )
    );

  const setSeasonScheduleTicketsAt = (ticketsAt: number) =>
    dispatch(
      SeasonActions.setSeasonScheduleTicketsAt(
        seasonId,
        Time.changeTimeZone(ticketsAt * 1000, timezoneSeason)
      )
    );

  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label="Sales begin"
        width={isMobile ? "220px" : "200px"}
        value={
          type === VariantEnum.Event
            ? Time.convertToDate(
              Time.convertToLocal(ticketsAtEvent, timezoneEvent)
            )
            : Time.convertToDate(
              Time.convertToLocal(ticketsAtSeason, timezoneSeason)
            )}
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          if (type === VariantEnum.Event) {
            setEventScheduleTicketsAt(date);
          } else {
            setSeasonScheduleTicketsAt(date);
          }
        }}
        minDate={isSeated ?
          Time.convertToDate(
            Time.convertToLocal(ticketsAtEvent, timezoneEvent)) : null}
        maxDate={isSeated ? Time.convertToDate(
          Time.convertToLocal(ticketsAtEvent, timezoneEvent)) : null}
      />
    </Container>
  );
};

export default CreateEventTicketsDate;
