import React, { useState } from "react";
import { ModalContainer, ModalHeader, ModalContent } from "./Modal";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import { Button, Colors, Dropdown, Input } from "@sellout/ui";
import { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import ITicketHold from "@sellout/models/.dist/interfaces/ITicketHold";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export const Container = styled.div`
  position: relative;
  width: 700px;
  ${media.tablet`
    width: 100% !important;
  `};
  ${media.mobile`
    width: 100% !important;
  `};
`;

export const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 15px;
  }
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
  width: 250px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }
`;

type ModalContentHeight = {
  height?: string;
  padding?: string;
  backgroundColor?: string;
};

const ModalFooter = styled.div<ModalContentHeight>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${(props) => (props.padding ? props.padding : "9px 20px")};
  background-color: ${Colors.White};
  border-top: 1px solid ${Colors.Grey6};
  border-radius: 0px 0px 10px 10px;
  justify-content: flex-end;
`;

export enum TicketTypeEnum {
  TicketType = "Select ticket type",
}

const TicketBlockModal: React.FC = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache, ticketHoldId } = eventState;
  const event = eventsCache[eventId];
  const title = "Create Hold Block";
  const dropdownTickets: any = event?.ticketTypes?.map((ticketTypesId: any) => {
    return {
      text: ticketTypesId.name as string,
      value: ticketTypesId._id as string,
      remainingQty: ticketTypesId.remainingQty as string,
    };
  });

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => dispatch(EventActions.saveEvent(false, false));

  const closeTicketHoldModal = async () => {
    popModal();
    dispatch(EventActions.setTicketHoldId(""));
  };

  /* Hooks */

  const handleClick = (events: any) => {
    const selectedTicketType = dropdownTickets.find(
      (ticket) => ticket.value === events
    );
    setTicketHold({
      ticketType: selectedTicketType.text,
      ticketTypeId: selectedTicketType.value,
      ticketRemaining: selectedTicketType.remainingQty
    });
  };

  const saveChanges = async () => {
    const ticketHold: ITicketHold = EventUtil.ticketHold(event, ticketHoldId);
    const validate = EventUtil.validateTicketHold(ticketHold as ITicketHold);
    const validationErrors =
      validate?.error?.details?.map((detail: any) => detail.message) ?? [];
    if (validationErrors.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationErrors.join("\n"),
          AppNotificationTypeEnum.Error
        )
      );
      return;
    }
    dispatch(EventActions.setIsHoldTicket(eventId, true));
    dispatch(
      AppActions.showNotification(
        "Hold ticket created successfully",
        AppNotificationTypeEnum.Success
      )
    );
    delete ticketHold?.ticketRemaining;
    saveEvent();

    closeTicketHoldModal();
  };

  const setTicketHold = (holdTicket: Partial<ITicketHold>) =>
    dispatch(EventActions.setTicketHold(eventId, ticketHoldId, holdTicket));

  const cancel = async () => {
    dispatch(EventActions.removeTicketHold(eventId, ticketHoldId as string));
    closeTicketHoldModal();
  };

  const ticketHold: ITicketHold = EventUtil.ticketHold(event, ticketHoldId);

  return (
    <>
      <ModalContainer width={"560px"}>
        <ModalHeader title={title} close={cancel} />
        <ModalContent>
          <Container>
            <RowWrapper>
              <Input
                width="100%"
                placeholder="Block name"
                value={ticketHold?.name}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setTicketHold({ name: e.currentTarget.value })
                }
                label="Block name"
              />
              <Input
                label="Total qty"
                placeholder="0"
                width="100%"
                type="number"
                disabled={!ticketHold?.ticketType}
                value={ticketHold?.qty.toString()}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  const qty = parseInt(e.currentTarget.value) || 0;
                  if (qty >= 0) {
                    setTicketHold({
                      qty,
                      totalHeld: qty,
                      totalOutstanding: qty,
                    });
                  }
                }}
              />
            </RowWrapper>
            <Row>
              <Dropdown
                value={ticketHold?.ticketType || TicketTypeEnum.TicketType}
                items={dropdownTickets as any}
                onChange={(events: any) => handleClick(events)}
                label="Type of ticket"
                width="100%"
              />
            </Row>
          </Container>
        </ModalContent>
        <ModalFooter>
          <div style={{ display: "flex" }}>
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={"Cancel"}
              margin="0 10px 0 0"
              onClick={() => {
                cancel();
              }}
            />
            <Button
              type={ButtonTypes.Thin}
              text="SAVE"
              onClick={() => saveChanges()}
            />
          </div>
        </ModalFooter>
      </ModalContainer>
    </>
  );
};
export default TicketBlockModal;
