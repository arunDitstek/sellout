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

type CreateEventTicketsEndDateProps = { type: string };

const CreateEventTicketsEndDate: React.FC<CreateEventTicketsEndDateProps> = ({
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
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
  let ticketsEndAtEvent =
    event && event.schedule && event.schedule.ticketsEndAt
      ? event.schedule.ticketsEndAt
      : undefined;

  let ticketsEndAtSeason =
    season && season.schedule && season.schedule.ticketsEndAt
      ? season.schedule.ticketsEndAt
      : undefined;

  /* Actions */
  const dispatch = useDispatch();
  const setEventScheduleTicketsEndAt = (ticketsEndAt: number) =>
    dispatch(
      EventActions.setEventScheduleTicketsEndAt(
        eventId,
        Time.changeTimeZone(ticketsEndAt * 1000, timezoneEvent)
      )
    );

  const setSeasonScheduleTicketsEndAt = (ticketsEndAt: number) =>
    dispatch(
      SeasonActions.setSeasonScheduleTicketsEndAt(
        seasonId,
        Time.changeTimeZone(ticketsEndAt * 1000, timezoneSeason)
      )
    );

  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label="Sales end"
        width={isMobile ? "220px" : "200px"}
        value={
          type === VariantEnum.Event
            ? // ? Time.date(ticketsEndAtEvent)
            // : Time.date(ticketsEndAtSeason)
            Time.convertToDate(
              Time.convertToLocal(ticketsEndAtEvent, timezoneEvent)
            )
            : Time.convertToDate(
              Time.convertToLocal(ticketsEndAtSeason, timezoneSeason)
            )
        }
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          if (type === VariantEnum.Event) {
            setEventScheduleTicketsEndAt(date);
          } else {
            setSeasonScheduleTicketsEndAt(date);
          }
        }}
      />
    </Container>
  );
};

export default CreateEventTicketsEndDate;
