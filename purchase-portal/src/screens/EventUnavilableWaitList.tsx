import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import ScreenHeader from "../components/ScreenHeader";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import * as AppActions from "../redux/actions/app.actions";
import { TextButton } from "@sellout/ui";
import CreateWaitListInfo from "./CreateWaitListInfo";
import { TextButtonSizes } from "@sellout/ui/build/components/TextButton";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import { FadeIn } from "@sellout/ui/build/components/Motion";
import * as Polished from "polished";
import { EventTitle } from "./EventUnavailable";

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
`;
const Container = styled.div`
  position: relative;
  top: 0px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  height: 505px;
`;
const Text = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-top: 16px;
`;


export const IconContainer = styled.div`
  text-align: center;
  &.hide {
    display: none;
  }
`;
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
type EventUnavailableProps = {
    event?: Required<IEventGraphQL>;
  };
const EventUnavilableWaitList: React.FC<EventUnavailableProps> = ({
  event,
}) => {
  /* State */
  const {
    app: {waitList,fisrtScreen,waitingInfoMessage },} = useSelector((state: PurchasePortalState) => state);
    const [userName,setUserName]=useState("")

    const dispatch = useDispatch();

    const closeApp = () => {
    dispatch(AppActions.SetWaitingInfo(false));
    dispatch(AppActions.setWaitList(false));
    dispatch(AppActions.setScreen(fisrtScreen));
};
    const allTicketsVisible: any =
    event?.ticketTypes?.filter(
      (ticket: any) =>  ticket.remainingQty > 0
    );
    const allUpgradeVisible: any =
    event?.upgrades?.filter(
      (upgrade: any) =>  upgrade.remainingQty > 0
    );

    const isSoldOut = !EventUtil.isSoldOut(event as any )
    let icon: any = null;
     let  title = ""
      let content: any = null;
      if (isSoldOut) {
        icon = Icons.Warning;
        title = event && allTicketsVisible.length == 0 && allUpgradeVisible.length !== 0
      ? "Tickets are sold out"
      : event && allTicketsVisible.length == 0 && allUpgradeVisible.length == 0
        ? "Event is sold out"
        : "";
        content = event && !waitList && (
          <TextButton
            size={TextButtonSizes.Large}
            children="Join the Wait List"
            margin="0px 5px 0px 0px"
            onClick={() => dispatch(AppActions.setWaitList(true))}
          />
        );
      }
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

export default EventUnavilableWaitList;
