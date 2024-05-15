import React, { useEffect, useState } from "react";
import { ModalContainer, ModalHeader, ModalContent } from "./Modal";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import { Button, Colors, Input } from "@sellout/ui";
import { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import * as ChangeUtil from "../../utils/ChangeUtil";
import ITicketHold from "@sellout/models/.dist/interfaces/ITicketHold";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";
import { useMutation, useQuery } from "@apollo/react-hooks";
import useEventHook from "../../hooks/useEvent.hook";
import UPDATE_HOLD_TICKET from "@sellout/models/.dist/graphql/mutations/holdTicket.mutation";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { Container, RowWrapper } from "./AddTicketBlockModal";
import Error from "../../elements/Error";

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

const UpdateTicketBlockModal: React.FC = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache, ticketHoldId } = eventState;
  useEventHook(eventId, true);
  const event = eventsCache[eventId];
  const [errorMsg, setErrorMsg] = useState("");
  const [disableButton, setDisableButton] = useState(false);

  /*  */
  const title = "Update Hold Block";
  const ticketHold: ITicketHold = EventUtil.ticketHold(event, ticketHoldId);
  const totalHeld =
    ticketHold?.totalCheckedIn +
    ticketHold?.totalReleased +
    ticketHold?.totalOutstanding;

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  const closeTicketHoldModal = async () => {
    popModal();
    dispatch(EventActions.setTicketHoldId(""));
  };

  /* GraphQl */
  const { data } = useQuery(GET_EVENT, {
    variables: {
      eventId,
    },
    fetchPolicy: "network-only",
  });

  const holdTicket: any = data?.event?.holds?.filter(
    (hold: ITicketHold) => hold._id === ticketHoldId
  );

  /* Hooks */
  const handleIncrement = (checkIn, released) => {
    if (ticketHold.totalOutstanding > 0) {
      const totalOutstanding =
        ticketHold.totalOutstanding > 0 ? ticketHold.totalOutstanding - 1 : 0;
      if (checkIn >= 0 && checkIn !== "") {
        const totalCheckedIn = Number(checkIn + 1);
        setTicketHold({ totalCheckedIn, totalOutstanding });
      } else {
        const totalReleased = Number(released + 1);
        setTicketHold({ totalReleased, totalOutstanding });
      }
    }
  };

  const handleDecrement = (checkIn, released) => {
    const totalOutstanding =
      ticketHold.totalOutstanding >= 0 ? ticketHold.totalOutstanding + 1 : 0;
    if (
      checkIn > 0 &&
      checkIn !== "" &&
      holdTicket[0].totalCheckedIn !== checkIn
    ) {
      const totalCheckedIn = Number(checkIn - 1);
      setTicketHold({ totalCheckedIn, totalOutstanding });
    } else if (released > 0 && holdTicket[0].totalReleased !== released) {
      const totalReleased = Number(released - 1);
      setTicketHold({ totalReleased, totalOutstanding });
    }
  };

  const saveChanges = async () => {
    const ticketHold: ITicketHold = EventUtil.ticketHold(event, ticketHoldId);
    const validate = EventUtil.validateTicketHoldName(
      ticketHold as ITicketHold,
    );
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
    const hasChanged = await ChangeUtil.hasTicketHoldsChanged(
      event,
      ticketHoldId
    );
    if (hasChanged) {
      dispatch(EventActions.setIsHoldTicket(eventId, false));
      updateHoldTicket();
      closeTicketHoldModal();
    }
  };

  const [updateHoldTicket] = useMutation(UPDATE_HOLD_TICKET, {
    variables: {
      eventId,
      params: ticketHold,
    },
    refetchQueries: [{ query: GET_EVENT, variables: { eventId } }],
    onCompleted(data) {
      dispatch(
        AppActions.showNotification(
          "Hold ticket updated successfully",
          AppNotificationTypeEnum.Success
        )
      );
      setErrorMsg("");
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
  });

  const setTicketHold = (holdTicket: Partial<ITicketHold>) =>
    dispatch(EventActions.setTicketHold(eventId, ticketHoldId, holdTicket));

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasToRemoveTicketHolds(
      event,
      ticketHoldId
    );
    if (hasToRemoved)
      dispatch(EventActions.removeTicketHold(eventId, ticketHoldId as string));
    dispatch(EventActions.setTicketHoldId(""));
    popModal();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasTicketHoldsChanged(
      event,
      ticketHoldId
    );
    const hasToRemoved = await ChangeUtil.hasToRemoveTicketHolds(
      event,
      ticketHoldId
    );
    if (hasChanged && !hasToRemoved) {
      dispatch(
        AppActions.pushModalConfirmAction({
          title: "Unsaved Changes",
          message: `You have unsaved changes. What would you like to do?`,
          confirm: () => popModal(),
          confirmText: "SAVE CHANGES",
          cancel: () => discardChanges(),
          cancelText: "DISCARD CHANGES",
        })
      );
    } else {
      if (hasToRemoved)
        dispatch(
          EventActions.removeTicketHold(eventId, ticketHoldId as string)
        );
      closeTicketHoldModal();
    }
  };

  useEffect(() => {
    const gethasChanged = async () => {
      const hasChanged = await ChangeUtil.hasTicketHoldsChanged(
        event,
        ticketHoldId
      );
      hasChanged ? setDisableButton(false) : setDisableButton(true);
    };

    gethasChanged();
  }, [disableButton, event]);

  return (
    <>
      <ModalContainer width={ticketHoldId ? "825px" : "560px"}>
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
                label="Type of ticket"
                width="100%"
                value={ticketHold?.ticketType}
                disabled
              />
              <Input
                label="Total Held"
                placeholder="0"
                width="100%"
                type="number"
                value={totalHeld.toString()}
                disabled
              />
            </RowWrapper>
            <RowWrapper>
              <Input
                label="Total Checked In"
                placeholder="0"
                width="100%"
                type="number"
                value={ticketHold?.totalCheckedIn.toString()}
                incrementButton
                handleIncrement={() =>
                  handleIncrement(ticketHold?.totalCheckedIn, "")
                }
                handleDecrement={() =>
                  handleDecrement(ticketHold?.totalCheckedIn, "")
                }
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  // console.log("e,target.value");
                }}
              />
              <Input
                label="Total Released"
                placeholder="0"
                width="100%"
                type="number"
                value={ticketHold?.totalReleased.toString()}
                incrementButton
                handleIncrement={() =>
                  handleIncrement("", ticketHold?.totalReleased)
                }
                handleDecrement={() =>
                  handleDecrement("", ticketHold?.totalReleased)
                }
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  // console.log("e,target.value");
                }}
              />
              <Input
                label="Total Outstanding."
                placeholder="0"
                width="100%"
                type="number"
                value={ticketHold?.totalOutstanding.toString()}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  const totalOutstanding =
                    parseInt(e?.currentTarget?.value) || 0;
                  setTicketHold({ totalOutstanding });
                }}
                disabled
              />
            </RowWrapper>
            <Error children={errorMsg} margin="10px 0px 0px 0px" />
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
              state={
                disableButton ? ButtonStates.Disabled : ButtonStates.Active
              }
            />
          </div>
        </ModalFooter>
      </ModalContainer>
    </>
  );
};
export default UpdateTicketBlockModal;
