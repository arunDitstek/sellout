import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { Colors } from "@sellout/ui/build/Colors";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import * as Polished from "polished";
import useShowNext from "../hooks/useShowNext.hook";
import { FadeIn } from "@sellout/ui/build/components/Motion";
import * as AppActions from "../redux/actions/app.actions";
import { ErrorKeyEnum, ScreenEnum } from "../redux/reducers/app.reducer";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as Price from "@sellout/utils/.dist/price";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import isSeatingScreen from "../utils/isSeatingScreen";
import { Flex } from "@sellout/ui";
import { useTabletMedia } from "@sellout/ui/build/utils/MediaQuery";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import * as OrderActions from "../redux/actions/order.actions";
import * as UserActions from "../redux/actions/user.actions";
import BoxOffice from "../containers/BoxOffice";

type ContainerProps = {
  isSeating?: boolean;
};

const Container = styled.div<ContainerProps>`
  position: absolute;
  bottom: 0px;
  width: 100%;
  z-index: 2000;
  background-color: ${(props) =>
    props.isSeating ? Polished.rgba(Colors.White, 0.95) : null};
  border-top: ${(props) =>
    props.isSeating ? `1px solid ${Colors.Grey6}` : null};
`;

type ButtonContainerProps = {
  isSeating?: boolean;
};

const ButtonContainer = styled<ButtonContainerProps | any>(FadeIn)`
  width: ${(props) => (props.isSeating ? "390px" : "calc(100% - 48px)")};
  padding: ${(props) => (props.isSeating ? "12px 0" : "0 24px 24px")};
  background-color: ${(props) =>
    props.isSeating ? null : Polished.rgba(Colors.White, 1)};
  display: flex;
  justify-content: flex-end;
`;

const CheckoutInfo = styled.div`
  position: relative;
  background-color: ${Colors.Grey7};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 24px;
`;

const Logo = styled.img`
  height: 22px;
  width: auto;
`;

const ItemCount = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-bottom: 4px;
  width: 200px;
`;

const TotalText = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

const Total = styled.div`
  display: flex;
  align-items: center;
  background-color: ${Colors.Grey6};
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  padding: 7px 10px;
  border-radius: 10px;
`;

type ControlsProps = {
  event: Required<IEventGraphQL>;
};

const Controls: React.FC<ControlsProps> = ({ event }) => {
  /** Hooks **/
  const showNext = useShowNext(event);
  const isTablet = useTabletMedia();

  /** State **/
  const { app, order, user } = useSelector(
    (state: PurchasePortalState) => state
  );
  const { mode, isComplimentary, screen, errors, waitList } = app;

  const {
    guestCheckout,
    appliedDiscount,
    createOrderParams: { tickets, upgrades, paymentMethodType },
  } = order;
  const {
    createUserParams: { phoneNumber },
  } = user;

  const isGuest = guestCheckout && screen === ScreenEnum.CustomerPhoneNumber;
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const isCheckout = mode === EPurchasePortalModes.Checkout;

  const visibleUpgrades = event.upgrades.filter((upgrade) => upgrade.visible);

  const allUpgradeVisible: any = event?.upgrades?.filter(
    (upgrade: any) => upgrade.remainingQty > 0
  );
  const allTicketsVisible: any = event?.ticketTypes?.filter(
    (ticket: any) => ticket.remainingQty > 0
  );
  const onlyUpgrade =
    allTicketsVisible.length == 0 && allUpgradeVisible.length !== 0;
  const noUpgradeTicket =
    allTicketsVisible.length == 0 && allUpgradeVisible.length == 0;
  const upgradesOnly =
    event.upgrades.length > 0 &&
    allUpgradeVisible.length > 0 &&
    tickets.length === 0 &&
    screen === ScreenEnum.Tickets &&
    isBoxOffice &&
    visibleUpgrades.length > 0;

  /** Actions **/
  const dispatch = useDispatch();

  const setUserExists = (userExists: boolean) =>
    dispatch(UserActions.setUserExists(userExists));

  const onGuestCheckout = () => {
    dispatch(OrderActions.setGuestCheckout(true));
    dispatch(OrderActions.setCreateOrderParams({ userId: "" }));
    setUserExists(false);
    dispatch(AppActions.navigateForward());
  };

  const navigateForward = () => {
    if (
      screen === ScreenEnum.GuestMembers &&
      event?.organization?.validateMemberId
    ) {
      dispatch(OrderActions.getTicketRestrictionAction());
    } else if (screen === ScreenEnum.CustomerPhoneNumber && guestCheckout) {
      dispatch(OrderActions.setGuestCheckout(false));
    } else {
      upgradesOnly
        ? dispatch(OrderActions.setUpgradesOnly(true))
        : !upgradesOnly &&
          screen === ScreenEnum.Tickets &&
          dispatch(OrderActions.setUpgradesOnly(false));
      dispatch(AppActions.navigateForward());
    }
  };

  let buttonColor = Colors.Orange;
  let buttonText = upgradesOnly ? "Upgrades Only" : "Next";

  if (screen === ScreenEnum.ConfirmOrder) {
    const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
    const isCardReader = paymentMethodType === PaymentMethodTypeEnum.CardReader;
    buttonColor = Colors.Green;
    buttonText =
      isBoxOffice && isCardReader ? "Enter Payment" : "Confirm Order";
  }

  if (screen === ScreenEnum.LiabilityWaiver) {
    buttonText = "Agree to Waiver";
  }

  /** Render **/
  const totalParams = {
    tickets,
    upgrades,
    fees: event.fees,
    paymentMethodType,
    promotions: appliedDiscount,
  };

  const guestFeeForPromoter =
    PaymentUtil.calculatePaymentTotal(totalParams).guestFeeForPromoter || 0;
  const guestFeeForSellout =
    PaymentUtil.calculatePaymentTotal(totalParams).guestFeeForSellout || 0;
  const ticketUpgradeGuestFeeTotal =
    PaymentUtil.calculatePaymentTotal(totalParams).subTotal +
      guestFeeForPromoter +
      guestFeeForSellout || 0;
  const total =
    screen === ScreenEnum.ConfirmOrder || screen === ScreenEnum.CashPayment
      ? PaymentUtil.calculatePaymentTotal(totalParams).total || 0
      : ticketUpgradeGuestFeeTotal;

  const errorMsg: any =
    errors[ErrorKeyEnum.ConFirmOrderError] ||
    errors[ErrorKeyEnum.PromoCodeLimitError] ||
    errors[ErrorKeyEnum.PaymentCardError] ||
    errors[ErrorKeyEnum.UserProfileError] ||
    errors[ErrorKeyEnum.Tickets] ||
    errors[ErrorKeyEnum.UserEmail];

  if (isSeatingScreen(screen, event)) {
    return (
      <Container isSeating={true}>
        <Flex align="center" justify="space-between" margin="0 16px 0">
          <Flex direction="column">
            {isBoxOffice && allTicketsVisible.length !== 0 && (
              <ItemCount>
                {tickets.length} Seat{tickets.length === 1 ? "" : "s"} Selected
              </ItemCount>
            )}
            {isCheckout && (
              <ItemCount>
                {tickets.length} Seat{tickets.length === 1 ? "" : "s"} Selected
              </ItemCount>
            )}

            <TotalText>
              {(() => {
                if (isComplimentary) {
                  if (isBoxOffice && allTicketsVisible.length == 0) {
                    return false;
                  } else {
                    return "Comp";
                  }
                } else if (EventUtil.isRSVP(event)) {
                  return "RSVP";
                } else if (isBoxOffice && allTicketsVisible.length == 0) {
                  return false;
                } else {
                  return `$${Price.output(total, true)}`;
                }
              })()}
            </TotalText>
          </Flex>
          {(isBoxOffice && onlyUpgrade && waitList) ||
          (isBoxOffice && noUpgradeTicket) ? (
            ""
          ) : (
            <ButtonContainer isSeating={true}>
              <Button
                type={!isTablet ? ButtonTypes.Regular : ButtonTypes.Next}
                state={showNext ? ButtonStates.Active : ButtonStates.Disabled}
                icon={!isTablet ? Icons.LongRightArrow : undefined}
                text={!isTablet ? undefined : buttonText}
                onClick={() => navigateForward()}
                bgColor={buttonColor}
              />
            </ButtonContainer>
          )}
        </Flex>
      </Container>
    );
  }

  if (screen === ScreenEnum.OrderConfirmed) {
    return null;
  }
  return (
    <Container>
      {screen === ScreenEnum.GuestMembers ||
      screen === ScreenEnum.Tickets ||
      screen === ScreenEnum.AddPayment
        ? showNext && (
            <ButtonContainer>
              <Button
                type={ButtonTypes.Next}
                text={buttonText}
                onClick={() => navigateForward()}
                bgColor={buttonColor}
              />
            </ButtonContainer>
          )
        : showNext &&
          !errorMsg &&
          !isGuest && (
            <ButtonContainer>
              <Button
                type={ButtonTypes.Next}
                text={buttonText}
                onClick={() => navigateForward()}
                bgColor={buttonColor}
              />
            </ButtonContainer>
          )}
      {isBoxOffice && noUpgradeTicket ? (
        false
      ) : (
      <CheckoutInfo>
        {screen === ScreenEnum.CustomerPhoneNumber ? (
          <Button
            type={ButtonTypes.Thin}
            state={
              phoneNumber.length <= 1
                ? ButtonStates.Active
                : ButtonStates.Disabled
            }
            text={"Guest Checkout"}
            onClick={() => onGuestCheckout()}
            bgColor={buttonColor}
          />
        ) : (
          <Icon icon={Icons.HelpLight} color={Colors.Grey3} size={24} />
        )}
        {(() => {
          if (screen === ScreenEnum.EventUnavailable) {
            return null;
          }
          if (isComplimentary) {
            return (
              <Total>
                Comp
                <Icon
                  icon={Icons.GiftLight}
                  color={Colors.Grey2}
                  size={14}
                  margin="0 0 0 7px"
                  top="1px"
                />
              </Total>
            );
          } else if (EventUtil.isRSVP(event)) {
            return (
              <Total>
                RSVP
                <Icon
                  icon={Icons.ClipboardLight}
                  color={Colors.Grey2}
                  size={14}
                  margin="0 0 0 7px"
                  top="1px"
                />
              </Total>
            );
          } else {
            if (isBoxOffice && noUpgradeTicket) {
              return false;
            } else {
              return (
                <Total>
                  ${Price.output(total, true)}
                  <Icon
                    icon={Icons.CartLight}
                    color={Colors.Grey2}
                    size={14}
                    margin="0 0 0 7px"
                    top="1px"
                  />
                </Total>
              );
            }
          }
        })()}
      </CheckoutInfo>
      )}
    </Container>
  );
};

export default Controls;
