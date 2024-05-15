import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import * as Polished from "polished";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import { FadeIn } from "@sellout/ui/build/components/Motion";
import usePrintOrder from "../hooks/usePrintOrder.hook";
import SEND_ORDER_RECEIPT_EMAIL from "@sellout/models/.dist/graphql/mutations/sendOrderReceiptEmail.mutation";
import { useMutation } from "@apollo/react-hooks";
import useEventHook from "../hooks/useEvent.hook";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { ScreenEnum } from "../redux/reducers/app.reducer";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 200px;
`;

const Content = styled.div`
  padding: 0 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Emoji = styled.div`
  font-size: 4.8rem;
  margin-bottom: 16px;
`;

const Title = styled.div`
  font-size: 2.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-bottom: 10px;
`;

const Text = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 20px;
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

const AnchorText = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  color: ${Colors.Orange};
  display: inline;
  cursor: pointer;
  padding-left: 5px;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
  }
`;

type OrderConfirmedProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const OrderConfirmed: React.FC<OrderConfirmedProps> = ({ event, season }) => {
  /** State **/
  const { app, order, user } = useSelector(
    (state: PurchasePortalState) => state
  );
  useEventHook("", true);

  const { mode, isComplimentary, fisrtScreen } = app;
  const { userProfile } = user;
  const {
    order: confirmedOrder, guestCheckout, guestCheckoutEmail
  } = order;
  /** Hooks **/
  const customerName = userProfile?.user?.lastName || "Guest";
  const isEvent = event ? "event" : "season";
  const { printOrder, loading: printLoading } = usePrintOrder(
    confirmedOrder?._id as string,
    isEvent,
    customerName as string
  );
  /** Actions **/
  const dispatch = useDispatch();
  const resetApp = () => dispatch(AppActions.resetApp());
  const closeApp = () => {
    dispatch(AppActions.closeApp());
    dispatch(AppActions.setScreen(fisrtScreen));
  };

  const [sendOrderReceiptEmail] =
    useMutation(SEND_ORDER_RECEIPT_EMAIL, {
      variables: {
        orderId: confirmedOrder?._id,
      },
      onError(error) {
        console.error(error);
      },
      onCompleted(data) {
        dispatch(AppActions.setLoading(false));
      },
    });

  const onEmailReceipt = () => {
    dispatch(AppActions.setScreen(ScreenEnum.UserEmail));
  }

  /** Render **/
  const firstName = userProfile?.user?.firstName ?? null;
  return (
    <Container>
      <ScreenHeader blank={true} />
      <Content>
        {(() => {
          if (mode === EPurchasePortalModes.Checkout) {
            return (
              <Fragment>
                <Emoji>🤘</Emoji>
                <Title>{firstName ? `Thanks, ${firstName}!` : "Thanks!"}</Title>
                <Text>
                  You're going to {event ? event?.name : season?.name}.
                </Text>
                <Text>
                  Check for a confirmation of order {confirmedOrder?._id} in
                  your email inbox and on your phone.
                </Text>
                <Text>
                  If you do not receive a confirmation within 5 minutes, click
                  <AnchorText
                    onClick={() => {
                      dispatch(AppActions.setLoading(true));
                      sendOrderReceiptEmail();
                    }}
                  >
                    here
                  </AnchorText>
                </Text>
                <ButtonContainer>
                  <Button
                    type={ButtonTypes.Next}
                    text="Close Window"
                    onClick={() => closeApp()}
                    bgColor={Colors.Grey6}
                    textColor={Colors.Grey3}
                  />
                </ButtonContainer>
              </Fragment>
            );
          } else {
            return (
              <Fragment>
                <Emoji>🤘</Emoji>
                <Title>Order #{confirmedOrder?._id} Confirmed</Title>
                {!guestCheckout &&
                  <> <Text>
                    The customer should have just received a text message
                    confirmation of their ticket purchase
                  </Text>
                    <Text>
                      If they did not, check to confirm that their phone number is{" "}
                      {userProfile?.user?.phoneNumber}
                    </Text> </>}
                {guestCheckout && !guestCheckoutEmail && <>
                  <Text>
                    The customer's order has been completed. If the customer would like a receipt emailed to them, click the Email Receipt button below.
                  </Text>
                </>}
                {guestCheckout && guestCheckoutEmail && <>
                  <Text>
                    The customer should have just received an email receipt of their ticket purchase.
                  </Text>
                  <Text>
                    If they did not, check to confirm that their email is {guestCheckoutEmail}.
                  </Text>
                </>}
                <ButtonContainer>
                  {guestCheckout && <Button
                    type={ButtonTypes.Next}
                    text="Email Receipt"
                    onClick={() => onEmailReceipt()}
                    bgColor={Colors.Grey6}
                    textColor={Colors.Grey3}
                    margin="0 0 10px"
                  />}
                  {
                    <Button
                      type={ButtonTypes.Next}
                      text="Print Tickets"
                      onClick={() => printOrder()}
                      loading={printLoading}
                      bgColor={Colors.Grey6}
                      textColor={Colors.Grey3}
                      margin="0 0 10px"
                    />
                  }
                  <Button
                    type={ButtonTypes.Next}
                    text={`${isComplimentary ? "Comp" : "Sell"
                      } More Tickets To This Event`}
                    onClick={() => resetApp()}
                    bgColor={Colors.Grey6}
                    textColor={Colors.Grey3}
                  />
                </ButtonContainer>
              </Fragment>
            );
          }
        })()}
      </Content>
    </Container>
  );
};

export default OrderConfirmed;
