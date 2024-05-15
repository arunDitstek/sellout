import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Loader from "@sellout/ui/build/components/Loader";
import { Colors, Flex } from '@sellout/ui';
import Error from '../../elements/Error';
import useEvent from "../../hooks/useEvent.hook";
import EventCard, { EventCardTypes } from '../../components/EventCard';
import TextArea from "../../elements/TextArea";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { BackstageState } from "../../redux/store";
import CANCEL_EVENT_ORDER from '@sellout/models/.dist/graphql/mutations/cancelOrder.mutation';
import IConfirmActionState from '../../models/interfaces/IConfirmAction';
import { useHistory } from 'react-router-dom';
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  width: 375px;
  ${media.mobile`
      width: auto;
    `};
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

const CancelOrderModal: React.FC = () => {
  /* Hooks */

  /* State */
  const orderState = useSelector((state: BackstageState) => state.order);
  const { orderId } = orderState;
  const [cancel, setCancel] = React.useState("");
  const [cancelReason, setCancelReason] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Confirm
  const [showConfirm, setShowConfirm] = React.useState(false as boolean)

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  const [cancelOrderConfirm, { loading: cancelOrderLoading }] = useMutation(CANCEL_EVENT_ORDER, {
    refetchQueries: [{query: GET_ORDER, variables: { orderId } }],
    awaitRefetchQueries: true,
    onError(error) {
      dispatch(AppActions.showNotification(getErrorMessage(error), AppNotificationTypeEnum.Error));
      console.error(getErrorMessage(error));
    },
    onCompleted() {
      dispatch(AppActions.showNotification("Your order has been cancelled successfully.", AppNotificationTypeEnum.Success));
      popModal();
    },
  });

  // HANDLE ERROR
  const [getOrder, { data, loading, error }] = useLazyQuery(GET_ORDER, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (orderId) {
      getOrder({
        variables: {
          orderId,
        },
      });
    }
  }, [orderId]);
  const { event } = useEvent(data?.order?.event?._id);
  const hasOrders = event?.hasOrders ?? false;
  let title = "CANCEL ORDER";
  let confirmText = 'Cancel ORDER';
  let cancelText = 'DON\'T Cancel';

  /* Render */
  return (
    <>
      <ModalContainer display={showConfirm ? "none" : "block"}>
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
                      You can cancel this order without providing a refund and that seats will be released.
                    </BodyText>

                    <TextArea
                      label="Reason for Cancellation"
                      subLabel="(optional)"
                      placeholder="Enter a reason for cancellation"
                      width="100%"
                      height="100px"
                      margin="0px 0px 24px 0px"
                      value={cancelReason}
                      onChange={(e: React.FormEvent<HTMLInputElement>) =>
                        setCancelReason(e.currentTarget.value)
                      }
                    />
                  </Fragment>
                ) : (
                  <BodyText>
                    If you cancel this order, this order will be cancelled forever.
                  </BodyText>
                )}
              {hasOrders && (
                <Input
                  label="Please type CANCEL to cancel this order."
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
            <Button
              type={ButtonTypes.Thin}
              text={confirmText}
              state={(cancel === "CANCEL" ? ButtonStates.Active : ButtonStates.Disabled)}
              onClick={() => setShowConfirm(true)}
              loading={cancelOrderLoading}
            />
          </ButtonContainer>
        </ModalFooter>
      </ModalContainer>
      {
        showConfirm &&
        <ConfirmActionModal
          title="Cancel Confirmation"
          message="Are you sure you want to cancel the order?"
          cancel={() => setShowConfirm(false)}
          loading={cancelOrderLoading || false}
          confirm={
            () => cancelOrderConfirm({
              variables: {
                orderId,
                cancelReason,
              },
            })
          }
        />
      }
    </>
  );
};
const ConfirmActionModal = ({
  title = 'Are you sure you want to cancel this order?',
  message,
  confirm,
  confirmText = 'CONFIRM',
  cancel,
  cancelText = 'CANCEL',
  loading = false
}) => {

  return (
    <ModalContainer display="block" position="absolute" left="40%" top="40%">
      <ModalHeader title={title} close={cancel} />
      <Container>
        <ModalContent padding="20px">{message}</ModalContent>
      </Container>
      <ModalFooter>
        <div />
        <Flex>
          {cancel && (
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={cancelText}
              margin="0 10px 0 0"
              onClick={() => {
                if (cancel) cancel();
              }}
            />
          )}
          <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            onClick={() => {
              if (confirm) confirm();
            }}
            loading={loading}
          />
        </Flex>
      </ModalFooter>
    </ModalContainer>
  );
};

export default CancelOrderModal;