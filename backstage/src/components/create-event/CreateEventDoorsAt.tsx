import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Input from "@sellout/ui/build/components/Input";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
import DatePicker from '../../elements/DatePicker';
import * as Time from "@sellout/utils/.dist/time";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import * as AppActions from "../../redux/actions/app.actions";
import { useMobileMedia } from '@sellout/ui/build/utils/MediaQuery';

const Container = styled.div`
  position: relative;
`;

type CreateEventPerformanceDateProps = { index: number };

const CreateEventPerformanceDate: React.FC<CreateEventPerformanceDateProps> = ({ index }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const isEvent = window.location.href.includes("eventId");

  const performance = event.performances?.[0];
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = event?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone = venue && venue.address && venue.address.timezone != '' ? venue.address.timezone : event?.venue?.address?.timezone
  const diffInMinutes = Time.getTimezoneMindifference(timezone)

  let doorsAt = performance?.schedule?.[index].doorsAt;

  /* Sold Tickets */
  const isSeated = isEvent && event?.hasOrders;

  /* Actions */
  const dispatch = useDispatch();

  const setPerformanceScheduleDoorsAt = (doorsAt: number) =>
    dispatch(EventActions.setPerformanceScheduleDoorsAt(eventId, performance?._id as string,
      Time.changeTimeZone(doorsAt * 1000, timezone),
      index
    ));

  const isMobile = useMobileMedia();

  /** Render */
  return (
    <Container>
      <DatePicker
        label="Doors open"
        width={isMobile ? '220px' : '190px'}
        value={
          Time.convertToDate(Time.convertToLocal(doorsAt, timezone))
        }
        onChange={(value: any) => {
          const date = Time.fromDate(value);
          setPerformanceScheduleDoorsAt(date);
        }}
        minDate={isSeated ?
          Time.convertToDate(
            Time.convertToLocal(doorsAt, timezone)) : null}
        maxDate={isSeated ? Time.convertToDate(
          Time.convertToLocal(doorsAt, timezone)) : null}
      />
    </Container>
  );
};

export default CreateEventPerformanceDate;
