import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Loader from "@sellout/ui/build/components/Loader";
import { Colors } from '@sellout/ui';
import Error from '../../elements/Error';
import useEvent from "../../hooks/useEvent.hook";
import EventCard, { EventCardTypes } from '../../components/EventCard';
import TextArea from "../../elements/TextArea";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from '@sellout/ui/build/components/Dropdown';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { BackstageState } from "../../redux/store";
import IConfirmActionState from '../../models/interfaces/IConfirmAction';

const Container = styled.div`
  /* width: 375px; */
`;

type BodyTextProps = {
  margin?: boolean;
}

const BodyText = styled.div<BodyTextProps>`
  font-weight: 500;
  color: ${Colors.Grey2};
  font-size: 1.4rem;
  margin-bottom: ${props => props.margin ? '24px' : null};
`;

const ButtonContainer = styled.div`
  display: flex;
`;
const Required = styled.span`
    color: ${Colors.Red};
    position: absolute;
    top: 51%;
    left: 28%;
    transform: translateY(50%);
`;

enum Preference {
  WithRefund = 'Cancel event by refunding all orders',
  WithoutRefund = 'Cancel event only',
}

const CancelEventModal: React.FC = () => {
  /* Hooks */
  const { event } = useEvent();
  /* State */
  const hasOrders = event?.hasOrders ?? false;
  const [cancel, setCancel] = React.useState("");
  const [refundReason, setRefundReason] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [selectType, setSelectType] = React.useState('Select Refund Preference');
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  const deleteEvent = () => {
    dispatch(AppActions.pushModalConfirmAction({
      title: "Cancel Event Confirmation", 
      message: "Are you sure you want to cancel this event?",
      cancel: popModal,
      confirm: () => cancelEvent()
    } as IConfirmActionState));
  }
  const cancelEvent = () => {
    dispatch(EventActions.deleteEvent(eventId,false,refundReason,selectType === Preference.WithoutRefund? "WithoutRefund" : "WithRefund"));
  }

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  let title = "CANCEL EVENT";
  let confirmText = 'Cancel EVENT';
  let cancelText = 'DON\'T Cancel';

  if (hasOrders) {
    title = 'Cancel event';
    confirmText = 'CANCEL EVENT';
    cancelText = 'DON\'T CANCEL';
  }

  const items =
    [
      {
        "text": Preference.WithoutRefund,
        "value": Preference.WithoutRefund,
      },
      {
        "text": Preference.WithRefund,
        "value": Preference.WithRefund,
      }]

  /* Render */
  return (
    <ModalContainer width="450px">
      <ModalHeader title={title} close={popModal} />
      {event ? (
        <ModalContent>
          <Container>
            <EventCard
              event={event}
              margin="0 0 24px 0"
              footer={false}
              type={EventCardTypes.Modal}
            />
            {event?.hasOrders
              ? (
                <Fragment>
                  <BodyText margin>
                    You can cancel this event and either provide refunds or not. If you choose to provide refunds, then your account will be auto-debited to cover the payment processing fees. 
                  </BodyText>
                  <BodyText margin>
                    Select your choice from the dropdown below.
                  </BodyText>

                  <Dropdown
                    value={selectType}
                    items={items}
                    onChange={(value) => { setSelectType(value) }}
                    label="Refund Preference"
                  />
                  <Required>*</Required>

                  <TextArea
                    label="Reason for Cancellation"
                    subLabel="(optional)"
                    placeholder="Enter a reason for cancellation"
                    width="100%"
                    height="100px"
                    margin="0px 0px 24px 0px"
                    value={refundReason}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setRefundReason(e.currentTarget.value)
                    }
                  />
                </Fragment>
              ) : (
                <BodyText>
                  If you cancel this event, this event will be cancelled forever.
                </BodyText>
              )}
            {hasOrders && (
              <Input
                label="Please type CANCEL to cancel this event."
                type="text"
                placeholder="CANCEL"
                size={InputSizes.Large}
                value={cancel}
                width="100%"
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (validationError) setValidationError('');
                  if (errorMsg) setErrorMsg('');
                  setCancel(event.currentTarget.value);
                }}
                onClear={() => {
                  setCancel('');
                }}
              />
            )}
            {errorMsg && (
              <Error
                children={errorMsg}
                margin="10px 0px 0px 0px"
              />
            )}
          </Container>
        </ModalContent>
      ) : (
        <ModalContent>
          <Loader />
        </ModalContent>
      )}
      <ModalFooter>
        <div />
        <ButtonContainer>
          <Button
            type={ButtonTypes.Thin}
            text={cancelText}
            state={ButtonStates.Warning}
            margin="0px 10px 0px 0px"
            onClick={() => popModal()}
          />
          {hasOrders && <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            state={(cancel === "CANCEL" && ((selectType === Preference.WithRefund || selectType === Preference.WithoutRefund) ? true : false))? ButtonStates.Active : ButtonStates.Disabled}
            onClick={() => {
              deleteEvent()
            }}
          />}
          {!hasOrders && <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            state={ButtonStates.Active}
            onClick={() => {
              deleteEvent()
            }}
          />}
        </ButtonContainer>
      </ModalFooter>
    </ModalContainer>
  );
};

export default CancelEventModal;