import React from "react";
import styled from "styled-components";
import moment from "moment-timezone";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { Colors } from "@sellout/ui/build/Colors";
import * as Time from "@sellout/utils/.dist/time";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as Polished from "polished";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import { time } from "console";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { PurchasePortalState } from "../redux/store";
import { SeatsioClient, Region } from "seatsio";
import useSeatingKeysHook from "../hooks/useSeatingKeys.hook";

type ContainerProps = {
  image: string;
};

const Container = styled.div<ContainerProps>`
  position: absolute;
  top: 0px;
  /* z-index: 1000; */
  display: flex;
  align-items: center;
  width: calc(100% - 48px);
  background-image: url(${(props) => props.image});
  background-color: ${Colors.Blue};
  background-size: cover;
  background-position: center;
  background-origin: unset;
  padding: 16px 24px 70px;
  height: 80px;

  ${media.tablet`
    border-radius: 15px 15px 0 0;
  `};

  /* ${media.largeDesktop`
    padding: 20px 20px 70px;
    height: 195px;
  `}; */
`;

const Info = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  min-width: 0;
  z-index: 1000;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Gradient = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4));

  /* ${media.largeDesktop`
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 38.95%, rgba(0, 0, 0, 0.7) 100%);
  `}; */
`;

const Name = styled.div`
  font-size: 1.8rem;
  color: ${Colors.White};
  font-weight: 600;
  line-height: 2.4rem;
`;

const Subtitle = styled.div`
  font-size: 1.4rem;
  color: ${Colors.White};
  margin-bottom: 4px;
  font-weight: 600;
  line-height: 1.6rem;
`;

const InfoText = styled.div`
  font-size: 1.4rem;
  color: ${Colors.White};
  line-height: 2rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  line-height: 2rem;

  * {
    line-height: 2rem;
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Exit = styled.div`
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 10000;
`;

const Text = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Red};
  margin-top: 5px;
  align-items: right;
`;

const Timer = styled.div`
  position: absolute;
  top: 70px;
  right: 9px;
  ${media.handheld`
  top: 52px;
  `};
`;

type EventInfoProps = {
  event: Required<IEventGraphQL>;
};

const EventInfo: React.FC<EventInfoProps> = ({ event }) => {
  /** State **/
  const [timer, setTimer] = React.useState(0 as number);
  const [untilAnnounced, setUntilAnnounced] = React.useState(
    Time.formattedCountDown(Time.now(), timer as number)
  );
  const [session, setSession] = React.useState(false as boolean);

  const { venue } = event as any;
  const address = venue?.address;
  const venueLocation = `${venue?.name || ""}${
    address ? `, ${address.city}, ${address.state}` : ""
  }`;
  let timezone = address?.timezone ? address?.timezone : "America/Denver";
  //
  const startsAt = moment(Time.date(event?.schedule?.startsAt))
    .tz(timezone)
    .format("ddd, MMM D [at] h:mmA");

  const isOnSale = event && EventUtil.isOnSale(event);
  const { app } = useSelector((state: PurchasePortalState) => state);
  const { fisrtScreen } = app;
  /** State **/
  const dispatch = useDispatch();
  const {
    app: { mode, SeatingPlanTimer, screen },
    order,
  } = useSelector((state: PurchasePortalState) => state);
  const {
    createOrderParams: { tickets },
  } = order;

  //////////////// For seating plan seats release /////////////
  let seats = [] as any;
  tickets && tickets.map((a) => a.seat && seats.push(a.seat));
  const { secretKey } = useSeatingKeysHook(event?.orgId as any);

  const closeApp = () => {
    dispatch(AppActions.closeApp());
    dispatch(AppActions.setScreen(fisrtScreen));
    if (seats.length > 0 && screen !== ScreenEnum.OrderConfirmed) {
      seatsRelease();
      const SeatingPlanTimer = 0;
      dispatch(AppActions.setSeatTimer({ SeatingPlanTimer }));
    }
  };

  const seatsRelease = async () => {
    const seatingId = EventUtil.seatingId(event);
    let seatsIOClient = new SeatsioClient(secretKey);
    return await seatsIOClient.events.release(seatingId, seats);
  };

  React.useEffect(() => {
    setTimer(SeatingPlanTimer);
    const interval = setInterval(() => {
      setUntilAnnounced(
        Time.formattedCountDown(Time.now(), SeatingPlanTimer as number)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [SeatingPlanTimer]);

  React.useEffect(() => {
    const timers = Time.now();
    if (SeatingPlanTimer === timers) {
      const SeatingPlanTimer = 1;
      dispatch(AppActions.setSeatTimer({ SeatingPlanTimer }));
      setSession(true);
    }
  }, [untilAnnounced]);

  ///////////////// For Multidays ////////////////
  const firstDay =
    event?.schedule &&
    moment(Time.date(event?.schedule?.startsAt))
      .tz(timezone)
      .format("ddd, MMM D");
  const lastDay =
    event?.schedule &&
    moment(Time.date(event?.schedule?.endsAt))
      .tz(timezone)
      .format("ddd, MMM D");

  /** Render **/
  return (
    <Container image={event.posterImageUrl}>
      <Gradient />
      <Info>
        <Name>{event.name || "Unnamed Event"}</Name>
        {event.subtitle && <Subtitle>{event.subtitle}</Subtitle>}
        <Row>
          <IconContainer>
            <Icon
              icon={Icons.CalendarDayLight}
              color={Colors.White}
              size={12}
              margin="0px 10px 0px 0px"
              top="-1px"
            />
          </IconContainer>
          <InfoText>
            {event?.isMultipleDays ? firstDay + " - " + lastDay : startsAt}
          </InfoText>
        </Row>
        {venueLocation && (
          <Row>
            <IconContainer>
              <Icon
                icon={Icons.MapPinLight}
                margin="0px 10px 0px 0px"
                color={Colors.White}
                size={12}
              />
            </IconContainer>
            <InfoText>
              {venueLocation ? venueLocation : "Unknown Venue"}
            </InfoText>
          </Row>
        )}
      </Info>

      <Exit>
        <Icon
          icon={Icons.CancelCircle}
          color={Polished.rgba(Colors.White, 0.5)}
          onClick={() => closeApp()}
          size={18}
        />
      </Exit>
      <Timer>
        {!session && untilAnnounced.length < 11 && (
          <Text>{untilAnnounced.slice(3)}</Text>
        )}
      </Timer>
    </Container>
  );
};

export default EventInfo;
