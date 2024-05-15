import React, { useEffect } from "react";
import { Flex, Icon, Icons, Colors } from "@sellout/ui";
import CreateEventPerformanceDate from "../../components/create-event/CreateEventPerformanceDate";
import CreateEventDoorsAt from "../../components/create-event/CreateEventDoorsAt";
import CreateEventEndsAt from "../../components/create-event/CreateEventEndsAt";
import CreateEventAnnouncementDate from "../../components/create-event/CreateEventAnnouncementDate";
import CreateEventTicketsDate from "../../components/create-event/CreateEventTicketsDate";
import CreateEventTicketsEndDate from "../../components/create-event/CreateEventTicketsEndDate";
import CreateEventSendQRCode from "../../components/create-event/CreateEventSendQRCode";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import BooleanInput from "../../elements/BooleanInput";
import Input from "@sellout/ui/build/components/Input";
import * as Time from "@sellout/utils/.dist/time";
import AnimateHeight from "../../components/AnimateHeight";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
  RowToColumn,
  RowToColumnSpacer,
} from "../../components/create-flow/CreateFlowStyles";
import { useDispatch, useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import { IPerformanceSchedule } from "@sellout/models/.dist/interfaces/IPerformance";
import { VariantEnum } from "../../models/enums/VariantEnum";
import CreateEventTicketDelivery from "../../components/create-event/CreateEventTicketDelivery";
import { EventTicketDelivery } from "@sellout/models/.dist/interfaces/IEvent";

type CreateEventDatesTimesProps = {};

type CreateEventPerformanceDate = {
  index?: number;
};

const CreateEventDatesTimes: React.FC<CreateEventDatesTimesProps> = () => {
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event: any = eventsCache[eventId];
  const performance = event?.performances?.[0];

  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = event?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : event?.venue?.address?.timezone
      ? event?.venue?.address?.timezone
      : "America/Denver";
  const diffInMinutes = Time.getTimezoneMindifference(timezone);
  const [salesBeginImmediately, setSalesBeginImmediately] = React.useState(
    event.salesBeginImmediately ?? true
  );
  const [isMultipleDays, setIsMultipleDays] = React.useState(
    event.isMultipleDays ?? false
  );
  const [totalDays, setTotalDays] = React.useState(event.totalDays ?? "2");
  const [days, setDays] = React.useState([
    {
      doorsAt: 0,
      startsAt: 0,
      endsAt: 0,
    },
  ]);

  const eventStartsAt = () =>
    Time.fromStartOfDay(20 * Time.HOUR) + 30 * Time.DAY;
  const eventEndsAt = () => eventStartsAt() + 3 * Time.HOUR;

  /* Actions */
  const dispatch = useDispatch();
  const setEventSalesBeginImmediately = (salesBeginImmediately) => {
    setSalesBeginImmediately(salesBeginImmediately);
    dispatch(
      EventActions.setEventSalesBeginImmediately(eventId, salesBeginImmediately)
    );
    const date = Time.now();
    console.log(date, timezone, diffInMinutes);
    dispatch(EventActions.setEventScheduleAnnounceAt(eventId, date));
    dispatch(EventActions.setEventScheduleTicketsAt(eventId, date));
  };

  const setMultipleDays = (isMultipleDays) => {
    setIsMultipleDays(isMultipleDays);
    dispatch(EventActions.setMultiDays(eventId, isMultipleDays));
    if (isMultipleDays) {
      setEventTotalDays("2" as string);
    } else {
      setTotalDays("1" as string);
      dispatch(EventActions.setEventTotalDays(eventId, "1"));
      const singleDay = performance?.schedule && performance?.schedule[0];
      dispatch(
        EventActions.setMultipleDaysEvent(
          eventId,
          performance?._id as string,
          [singleDay] as any
        )
      );
      setDays([days[0]]);
    }
  };

  const setEventTotalDays = (totalDays: string) => {
    const last = totalDays.charAt(totalDays.length - 1);
    const isNumberValid = parseInt(last) < 8 && parseInt(last) >= 2;
    const previousdays = performance?.schedule?.length as number;

    if (isNumberValid) {
      if (Number(last)) {
        let updatedDays = performance?.schedule as IPerformanceSchedule[];
        let count = 1 as number;

        if (Number(last) > previousdays) {
          while (
            count <= (((Number(last) as number) - previousdays) as number)
          ) {
            updatedDays = [
              ...updatedDays,
              {
                doorsAt: eventStartsAt() - 1 * Time.HOUR,
                startsAt: eventStartsAt(),
                endsAt: eventEndsAt(),
              },
            ];
            count++;
          }
        } else {
          const positionOfDays = Number(last) as number;
          const removeDays =
            (previousdays as number) - (Number(last) as number);
          updatedDays.splice(positionOfDays, removeDays);
        }
        setDays([...updatedDays]);
        dispatch(
          EventActions.setMultipleDaysEvent(
            eventId,
            performance?._id as string,
            [...updatedDays] as any
          )
        );
      } else {
        setDays([]);
      }
      setTotalDays(last);
      dispatch(EventActions.setEventTotalDays(eventId, last));
    }
  };

  if (event) {
    event.performances[0].schedule[0].endsAt =
      event?.performances[0]?.schedule[0].endsAt === 0
        ? event?.schedule.endsAt
        : event?.performances[0]?.schedule[0].endsAt;
  }

  const isSeatingPlan =
    event?.seatingChartKey && event?.seatingChartKey.length > 0 ? true : false;
  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Dates & times</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() =>
                window.open(
                  "https://help.sellout.io/en/articles/4436286-dates-times",
                  "_blank"
                )
              }
            />
          </Flex>
          <Subtitle>
            Select the important dates & times related to this event.
          </Subtitle>
        </TitleContainer>
        {!isSeatingPlan && (
          <BooleanInput
            active={isMultipleDays}
            onChange={() => setMultipleDays(!isMultipleDays)}
            label="Is this a multi-day event with separate ticketing required for each day?"
          />
        )}
        <Spacer />
        <AnimateHeight open={isMultipleDays} height="auto">
          <Input
            label="Number of days"
            placeholder="0"
            width="90px"
            disabled={isSeatingPlan}
            type="number"
            value={totalDays}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setEventTotalDays(e.currentTarget.value)
            }
          />
          {performance?.schedule?.map((item, index) => {
            return (
              <RowToColumn key={index}>
                <p style={{ whiteSpace: "nowrap", margin: "0" }}>
                  Day {index + 1}
                </p>
                <RowToColumnSpacer />
                <CreateEventPerformanceDate
                  index={index}
                  type={VariantEnum.Event}
                />
                <RowToColumnSpacer />
                <CreateEventDoorsAt index={index} />
                <RowToColumnSpacer />
                <CreateEventEndsAt index={index} type={VariantEnum.Event} />
              </RowToColumn>
            );
          })}
        </AnimateHeight>
        {performance?.schedule?.length === 1 &&
          performance?.schedule?.map((item, index) => {
            return (
              <RowToColumn key={index}>
                <CreateEventPerformanceDate
                  index={index}
                  type={VariantEnum.Event}
                />
                <RowToColumnSpacer />
                <CreateEventDoorsAt index={index} />
                <RowToColumnSpacer />
                <CreateEventEndsAt index={index} type={VariantEnum.Event} />
              </RowToColumn>
            );
          })}
        <Spacer />
        <BooleanInput
          active={salesBeginImmediately}
          onChange={() => setEventSalesBeginImmediately(!salesBeginImmediately)}
          label="Will sales begin immediately?"
        />
        <Spacer />
        <AnimateHeight open={!salesBeginImmediately} height="190px">
          <CreateEventAnnouncementDate type={VariantEnum.Event} />
          <Spacer />
          <CreateEventTicketsDate type={VariantEnum.Event} />
          <Spacer />
        </AnimateHeight>
        <CreateEventTicketsEndDate type={VariantEnum.Event} />
        <Spacer />
        <CreateEventTicketDelivery />
        <Spacer />
        {event?.ticketDeliveryType !== EventTicketDelivery.Physical && (
          <>
            {" "}
            <CreateEventSendQRCode type={VariantEnum.Event} />
            <Spacer />
          </>
        )}
        <CreateEventSaveButton event={event} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventDatesTimes;