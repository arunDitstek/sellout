import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { EventPromotionTypeEnum } from "@sellout/models/.dist/interfaces/IEventPromotion";
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import PromotionCodeInput from "../components/PromotionCodeInput";
import ScreenHeader from "../components/ScreenHeader";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import * as Time from "@sellout/utils/.dist/time";
import * as AppActions from "../redux/actions/app.actions";
import GlobalError from "./../components/GlobalError";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import { TextButton } from "@sellout/ui";
import CreateWaitListInfo, { Spacer } from "./CreateWaitListInfo";
import { TextButtonSizes } from "@sellout/ui/build/components/TextButton";
import NotifiyMeEmail from "./NotifiyMeEmail";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import { FadeIn } from "@sellout/ui/build/components/Motion";
import * as Polished from "polished";


export const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  height: 505px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;

const Text = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-top: 16px;
`;

const InputContainer = styled.div`
  width: fill-available;
  margin-top: 16px;
`;

export const IconContainer = styled.div`
  text-align: center;
  &.hide {
    display: none;
  }
`;
type EventUnavailableProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};
export const Emoji = styled.div`
  font-size: 4.8rem;
  margin-bottom: 16px;
`;
export const Title = styled.div`
  font-size: 2.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-bottom: 10px;
`;
export const EventTitle = styled.div`
  font-size: 2.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-bottom: 5px;

`;
export const ConfirmText = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 5px;
  text-align: center;
  line-height: 140%;
`;
const ButtonContainer = styled(FadeIn)`
  position: absolute;
  bottom: 0px;
  width: calc(100% - 60px);
  padding: 0px 30px 20px;
  background-color: ${Polished.rgba(Colors.White, 0.7)};
`;

const EventUnavailable: React.FC<EventUnavailableProps> = ({
  event,
  season,
}) => {
  const { waitList,fisrtScreen,waitingInfoMessage } = useSelector((state: PurchasePortalState) => state.app);

  /** State **/
const [userName,setUserName]=useState("")

  const {
    order: { createOrderParams },
  } = useSelector((state: PurchasePortalState) => state);
  const { promotionCode } = createOrderParams;
  const hasEnded = event
    ? EventUtil.hasEnded(event)
    : SeasonUtil.hasEnded(season);
  const isNotPublished = event ? !event.published : !season?.published;
  const isSoldOut = event? !EventUtil.isSoldOut(event): !SeasonUtil.isSoldOut(season);
  const isNotOnSale = event
    ? !EventUtil.isOnSale(event)
    : !SeasonUtil.isOnSale(season);
  const allTicketsAreLocked = event
    ? EventUtil.allTicketsAreLocked(event)
    : SeasonUtil.allTicketsAreLocked(season);
  const hasPreSalePromotions = event
    ? EventUtil.activePromotions(event, EventPromotionTypeEnum.PreSale).length >
      0
    : SeasonUtil.activePromotions(season, EventPromotionTypeEnum.PreSale)
        .length > 0;

  const [untilAnnounced, setUntilAnnounced] = React.useState(
    Time.formattedCountDown(
      Time.now(),
      event
        ? (event?.schedule?.ticketsAt as number)
        : (season?.schedule?.ticketsAt as number)
    )
  );

  const { venue } = event ? event : (season as ISeasonGraphQL);
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : event?.venue?.address?.timezone
      ? event?.venue?.address?.timezone
      : "America/Denver";
  const diffInMinutes = Time.getTimezoneMindifference(timezone);
  const aa = Time.now();
  const currentTime = aa - diffInMinutes * 60;
  /** Actions **/
  const dispatch = useDispatch();
  const navigateForward = () => {
    if (event) {
      dispatch(AppActions.navigateForward());
    } else if (season) {
      dispatch(AppActions.seasonNavigateForward());
    }
  };
  /** Effects **/
  React.useEffect(() => {
    const interval = setInterval(() => {
      setUntilAnnounced(
        Time.formattedCountDown(
          Time.now(),
          event
            ? (event?.schedule?.ticketsAt as number)
            : (season?.schedule?.ticketsAt as number)
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (promotionCode) {
      navigateForward();
    }
  }, [promotionCode]);
  let icon: any = Icons.Warning;
 let  title = event
  ? "This event is currently unavailable"
  : "This season is currently unavailable";
  let content: any = null;
  if (hasEnded && !event?.cancel) {
    icon = Icons.Warning;
    title = event ? "This event has ended" : "This season has ended";
    content = null;
  } else if (event?.cancel) {
    icon = Icons.Warning;
    title = event ? "This event has cancelled" : "This season has cancelled";
    content = null;
  } else if (isNotPublished) {
    icon = Icons.Warning;
    title = event
      ? "This event is currently unavailable"
      : "This season is currently unavailable";
    content = null;
  } else if (isSoldOut ) {
    icon = Icons.Warning;
    title = event ? "This event is sold out" : "This season is sold out";
    content = event && !waitList && (
      <TextButton
        size={TextButtonSizes.Large}
        children="Join the Wait List"
        margin="0px 5px 0px 0px"
        onClick={() => dispatch(AppActions.setWaitList(true))}
      />
    );
  }
  else if (isNotOnSale) {
    if (event) {
      if (
        event?.schedule?.ticketsEndAt &&
        event?.schedule?.ticketsEndAt < currentTime
      ) {
        title = `Sales for this event have ended.`;
      } else {
        icon = Icons.Clock;
        title = `Ticket sales begin in ${untilAnnounced}`;
        content = event && (
          <div style={{ width: "100%" }}>
            <Spacer/>
            <NotifiyMeEmail event={event} height={"270px"}/>{" "}
          </div>
        );
      }
    } else if (season) {
      if (
        season?.schedule?.ticketsEndAt &&
        season?.schedule?.ticketsEndAt < currentTime
      ) {
        title = `Sales for this season have ended.`;
      } else {
        icon = Icons.Clock;
        title = `Ticket sales begin in ${untilAnnounced}`;
        content = null;
      }
    }
    if (hasPreSalePromotions) {
      icon = Icons.Clock;
      title = `Ticket sales begin in ${untilAnnounced}`;
      content = (
        <>
          <InputContainer>
            <PromotionCodeInput open={true} />
            <GlobalError margin />
          </InputContainer>
          <Spacer />
          <NotifiyMeEmail event={event} />
        </>
      );
    }
  } else if (allTicketsAreLocked) {
    icon = Icons.Lock;
    title = event
      ? `This event requires a password`
      : `This season requires a password`;
    content = (
      <><InputContainer>
        <PromotionCodeInput open={true} />
      <GlobalError margin />
      </InputContainer>
      </>


    );
  }
  const closeApp = () => {
    dispatch(AppActions.SetWaitingInfo(false));
    dispatch(AppActions.setWaitList(false));
    dispatch(AppActions.setScreen(fisrtScreen));

  };
  /** Render **/
  return (
    <Container>
      <ScreenHeader blank={true} />
      <Content>
        <IconContainer className={`${waitList ? "hide" : ""}`}>
          <Icon icon={icon} color={Colors.Orange} size={48} />
          <Text>{title}</Text>
        </IconContainer>
        {content}
      </Content>
      {waitList && !waitingInfoMessage && (
        <Content>
          <CreateWaitListInfo
            event={event}
            setUserName={setUserName}
          />
        </Content>
      )}
       {waitingInfoMessage &&(
        <>
        
        <Content>
          <Emoji>🤘</Emoji>
          <Title>{userName ? `Thanks, ${userName}!` : "Thanks!"}</Title>
          <ConfirmText>
          You have been added to the wait list for
          </ConfirmText>
           <EventTitle>{event?.name}</EventTitle>
           <ConfirmText>
           Please check your email for further information.
           </ConfirmText>
        </Content>
        <ButtonContainer>
            <Button
              type={ButtonTypes.Next}
              text="Close Window"
              onClick={() => closeApp()}
              bgColor={Colors.Grey6}
              textColor={Colors.Grey3} />
          </ButtonContainer></>

      )}
    </Container>
  );
};

export default EventUnavailable;
