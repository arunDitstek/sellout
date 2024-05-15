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
  const dispatch = useDispatch();

  const { season, seasonId } = useSeason();
  const eventPerformance = event?.performances?.[0];
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

  const startAtEvent = eventPerformance?.schedule?.[index].startsAt;
  let startAtSeason = season?.schedule?.startsAt;

  /* Sold Tickets */
  const isSeated = isEvent && event?.hasOrders;
  
  /* Actions */
  const setSeasonScheduleStartsAt = (startsAt: number) =>
    dispatch(
      SeasonActions.setSeasonScheduleStartsAt(
        seasonId,
        Time.changeTimeZone(startsAt * 1000, timezoneSeason)
      )
    );

  const setPerformanceScheduleStartsAt = (startsAt: number) => {
    dispatch(
      EventActions.setPerformanceScheduleStartsAt(
        eventId,
        eventPerformance?._id as string,
        Time.changeTimeZone(startsAt * 1000, timezoneEvent),
        index
      )
    );
  };
  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label={type === VariantEnum.Event ? "Event begins" : "Season begins"}
        width={isMobile ? "220px" : "190px"}
        value={
          type === VariantEnum.Event
            ? Time.convertToDate(
              Time.convertToLocal(startAtEvent, timezoneEvent)
            )
            : Time.convertToDate(
              Time.convertToLocal(startAtSeason, timezoneSeason)
            )
        }
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          // startsAt is on both the event schedule
          // and the performance schedule
          // make sure to set it in both places
          if (type === VariantEnum.Event) {
            setPerformanceScheduleStartsAt(date);
          } else {
            setSeasonScheduleStartsAt(date);
          }
        }}
        minDate={isSeated ?
          Time.convertToDate(
            Time.convertToLocal(startAtEvent, timezoneEvent)) : null}
        maxDate={isSeated ? Time.convertToDate(
          Time.convertToLocal(startAtEvent, timezoneEvent)) : null}
      />
    </Container>
  );
};

export default CreateEventPerformanceDate;
