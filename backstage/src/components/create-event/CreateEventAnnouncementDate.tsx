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

type CreateEventAnnouncementDateProps = { type: string };
const CreateEventAnnouncementDate: React.FC<
  CreateEventAnnouncementDateProps
> = ({ type }) => {
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
  let announceAtEvent =
    event && event.schedule && event.schedule.announceAt
      ? event.schedule.announceAt
      : undefined;

  let announceAtSeason =
    season && season.schedule && season.schedule.announceAt
      ? season.schedule.announceAt
      : undefined;

  /* Sold Tickets */
  const isSeated = isEvent && event?.hasOrders; 

  /* Actions */
  const dispatch = useDispatch();
  const setEventScheduleAnnounceAt = (announceAt: number) =>
    dispatch(
      EventActions.setEventScheduleAnnounceAt(
        eventId,
        Time.changeTimeZone(announceAt * 1000, timezoneEvent)
      )
    );

  const setSeasonScheduleAnnounceAt = (announceAt: number) =>
    dispatch(
      SeasonActions.setSeasonScheduleAnnounceAt(
        seasonId,
        Time.changeTimeZone(announceAt * 1000, timezoneSeason)
      )
    );

  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label="Announcement date"
        width={isMobile ? "220px" : "200px"}
        value={
          type === VariantEnum.Event
            ? Time.convertToDate(
              Time.convertToLocal(announceAtEvent, timezoneEvent)
            )
            : Time.convertToDate(
              Time.convertToLocal(announceAtSeason, timezoneSeason)
            )
        }
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          if (type === VariantEnum.Event) {
            setEventScheduleAnnounceAt(date);
          } else {
            setSeasonScheduleAnnounceAt(date);
          }
        }}
        minDate={isSeated ?
          Time.convertToDate(
            Time.convertToLocal(announceAtEvent, timezoneEvent)) : null}
        maxDate={isSeated ? Time.convertToDate(
          Time.convertToLocal(announceAtEvent, timezoneEvent)) : null}
      />
    </Container>
  );
};

export default CreateEventAnnouncementDate;
