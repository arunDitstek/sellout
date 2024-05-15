import React, { Fragment, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Colors, Dropdown, Flex, Icon, Icons, Validation } from "@sellout/ui";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { BackstageState } from "../../redux/store";
import SALES_REPORT from "@sellout/models/.dist/graphql/mutations/salesReport.mutation";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
} from "../ScrollableTable";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import GET_EVENT from "@sellout/models/.dist/graphql/queries/event.query";
import DELETE_SUBSCRIPTION from "@sellout/models/.dist/graphql/mutations/deleteSubscription.mutation";
import Error from "../../elements/Error";
import { Container } from "./AddTicketBlockModal";

const Spacer = styled.div`
  margin: 10px;
`;

const Content = styled.div<any>`
  overflow: scroll;
  box-sizing: border-box;
  border-radius: 0px 0px 10px 10px;
  height: ${(props) => props.heightLength && "420px"};
`;

const SubscriptionList: React.FC<any> = ({
  setShowConfirm,
  getSubscriptions,
  setSubscriptionId,
  setEmailId,
}) => {
  return (
    <>
      <Fragment>
        <ScrollTable>
          <ScrollTableBody>
            <ScrollTableHeader>
              <ScrollTableHeaderCell width="180px">Email</ScrollTableHeaderCell>
              <ScrollTableHeaderCell width="100px">
                Frequency
              </ScrollTableHeaderCell>
            </ScrollTableHeader>
          </ScrollTableBody>
          <Content heightLength={getSubscriptions.length > 9}>
            <ScrollTableBody>
              {getSubscriptions?.map((subscription: any, ind: number) => {
                return (
                  <ScrollTableBodyRow key={ind} height="40px">
                    <ScrollTableBodyCell width="180px" style={true}>
                      {" "}
                      {subscription.email}{" "}
                    </ScrollTableBodyCell>
                    <ScrollTableBodyCell width="100px" style={true}>
                      {" "}
                      {subscription.frequency}{" "}
                    </ScrollTableBodyCell>
                    <ScrollTableBodyCell>
                      <Icon
                        icon={Icons.Cancel}
                        color={Colors.Red}
                        hoverColor={Colors.Red}
                        size={16}
                        onClick={(e) => {
                          setShowConfirm(true);
                          setSubscriptionId(subscription._id);
                          setEmailId(subscription.email);
                        }}
                      />
                    </ScrollTableBodyCell>
                  </ScrollTableBodyRow>
                );
              })}
            </ScrollTableBody>
          </Content>
        </ScrollTable>
      </Fragment>
    </>
  );
};

const SubscribeSalesReportModal: React.FC = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState();
  const [validationError, setValidationError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = React.useState(false as boolean);
  const [subscriptionId, setSubscriptionId] = React.useState("");
  const [emailId, setEmailId] = React.useState("");
  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  /* GraphQl */
  const { data } = useQuery(GET_EVENT, {
    variables: {
      eventId,
    },
    fetchPolicy: "network-only",
  });

  const getSubscriptions = data?.event.subscription;

  const [addSubscription, { loading: subscriptionLoading }] = useMutation(
    SALES_REPORT,
    {
      refetchQueries: [
        {
          query: GET_EVENT,
          variables: {
            eventId,
          },
        },
      ],
      onError(error) {
        setErrorMsg(getErrorMessage(error));
      },
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Your subscription has been updated successfully.",
            AppNotificationTypeEnum.Success
          )
        );
        popModal();
      },
    }
  );

  const [removeSubscription, { loading: deleteLoading }] = useMutation(
    DELETE_SUBSCRIPTION,
    {
      refetchQueries: [
        {
          query: GET_EVENT,
          variables: {
            eventId,
          },
        },
      ],
      onError(error) {
        setErrorMsg(getErrorMessage(error));
      },
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Your subscription has been removed successfully.",
            AppNotificationTypeEnum.Success
          )
        );
        popModal();
      },
    }
  );

  /* Render */
  return (
    <>
      <ModalContainer width="450px" display={showConfirm ? "none" : "block"}>
        <ModalHeader title={"Subscribe"} close={popModal} />
        <ModalContent>
          <Container>
            <Input
              label="Email address"
              type="email"
              placeholder="Enter an email address"
              size={InputSizes.Large}
              value={email}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                const email = event.currentTarget.value;
                const message =
                  Validation.email.validate(email)?.error?.message || "";
                setValidationError(message);
                if (!email) setValidationError("");
                if (errorMsg) setErrorMsg("");
                setEmail(email);
              }}
              icon={Icons.EnvelopeLight}
              onClear={() => {
                setEmail("");
                setValidationError("");
              }}
              margin="0px 0px 10px 0px"
              validationError={validationError}
              autoFocus
            />
            <Dropdown
              value={frequency ? frequency : "Select a frequency"}
              width="100%"
              items={[
                { text: "Daily", value: "Daily" },
                { text: "Weekly", value: "Weekly" },
              ]}
              onChange={(item: any) => setFrequency(item)}
              label="Frequency"
            />
            <Spacer />
            <ModalFooter padding={"10px 0 0 0"}>
              {errorMsg && <Error children={errorMsg} />}
              <div />
              <Button
                type={ButtonTypes.Thin}
                state={
                  !validationError ? ButtonStates.Active : ButtonStates.Disabled
                }
                text={"Add Subscription"}
                loading={subscriptionLoading}
                onClick={() => {
                  addSubscription({
                    variables: {
                      params: {
                        eventId,
                        email,
                        frequency,
                      },
                    },
                  });
                }}
              />
            </ModalFooter>
          </Container>
          {getSubscriptions && getSubscriptions.length > 0 && (
            <SubscriptionList
              setShowConfirm={setShowConfirm}
              getSubscriptions={getSubscriptions}
              setSubscriptionId={setSubscriptionId}
              setEmailId={setEmailId}
            />
          )}

          <ModalFooter style={{ margin: "7px 0 0 0" }}>
            <div />
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={"Cancel"}
              onClick={() => {
                popModal();
              }}
            />
          </ModalFooter>
        </ModalContent>
      </ModalContainer>

      {showConfirm && (
        <ConfirmActionModal
          title="Deleting Confirmation"
          message={`Are you sure you want to delete this subscription for ${emailId} ?`}
          cancel={() => {
            setShowConfirm(false);
            setSubscriptionId("");
          }}
          loading={false}
          confirm={() => {
            removeSubscription({
              variables: {
                eventId,
                subscriptionId,
              },
            });
          }}
        />
      )}
    </>
  );
};

const ConfirmActionModal = ({
  title = "",
  message,
  confirm,
  confirmText = "CONFIRM",
  cancel,
  cancelText = "CANCEL",
  loading = false,
}) => {
  return (
    <ModalContainer display="block">
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

export default SubscribeSalesReportModal;
