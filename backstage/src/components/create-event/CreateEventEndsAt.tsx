import React, { useEffect } from "react";
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

type CreateEventPerformanceDateProps = { index: number; type: string };

const CreateEventPerformanceDate: React.FC<CreateEventPerformanceDateProps> = ({
  index,
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const isEvent = window.location.href.includes("eventId");

  const { season, seasonId } = useSeason();

  const performance = event?.performances?.[0];
  const venueState = useSelector((state: BackstageState) => state.venue);
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

  let endsAtEvent =
    event?.totalDays?.length === 0
      ? (event?.schedule?.endsAt as number)
      : performance?.schedule?.[index].endsAt
        ? (performance?.schedule?.[index].endsAt as number)
        : undefined;
  let endsAtSeason = (season?.schedule?.endsAt as number)
  
  /* Sold Tickets */
  const isSeated = isEvent && event?.hasOrders;

  /* Actions */
  const dispatch = useDispatch();
  const setEventScheduleEndsAt = (endsAt: number) =>
    dispatch(
      EventActions.setEventScheduleEndsAt(
        eventId,
        Time.changeTimeZone(endsAt * 1000, timezoneEvent)
      )
    );

  const setSeasonScheduleEndsAt = (endsAt: number) =>
    dispatch(
      SeasonActions.setSeasonScheduleEndsAt(
        seasonId,
        Time.changeTimeZone(endsAt * 1000, timezoneSeason)
      )
    );

  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label={type === VariantEnum.Event ? "Event ends" : "Season ends"}
        width={isMobile ? "220px" : "190px"}
        value={
          type === VariantEnum.Event
            ? Time.convertToDate(Time.convertToLocal(endsAtEvent, timezoneEvent))
            : Time.convertToDate(
              Time.convertToLocal(endsAtSeason, timezoneSeason)
            )
        }
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          if (type === VariantEnum.Event) {
            if (event?.totalDays?.length === 0 && !event?.isMultipleDays) {
              setEventScheduleEndsAt(date);
            }
            dispatch(
              EventActions.setPerformanceScheduleEndsAt(
                eventId,
                performance?._id as string,
                // date + diffInMinutes * 60,
                Time.changeTimeZone(date * 1000, timezoneEvent),
                index
              )
            );
          } else {
            setSeasonScheduleEndsAt(date);
          }
        }}
        minDate={isSeated ?
          Time.convertToDate(
            Time.convertToLocal(endsAtEvent, timezoneEvent)) : null}
        maxDate={isSeated ? Time.convertToDate(
          Time.convertToLocal(endsAtEvent, timezoneEvent)) : null}
      />
    </Container>
  );
};

export default CreateEventPerformanceDate;
