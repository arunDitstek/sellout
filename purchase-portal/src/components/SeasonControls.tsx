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
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import * as Price from "@sellout/utils/.dist/price";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import { Flex } from "@sellout/ui";
import { useTabletMedia } from "@sellout/ui/build/utils/MediaQuery";
import * as OrderActions from "../redux/actions/order.actions";

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
  width: ${(props) => (props.isSeating ? "350px" : "calc(100% - 48px)")};
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

type SeasonControlsProps = {
  season: Required<ISeasonGraphQL>;
};

const SeasonControls: React.FC<SeasonControlsProps> = ({ season }) => {
  /** Hooks **/
  const showNext = useShowNext(season);
  const isTablet = useTabletMedia();

  /** State **/
  const { app, order } = useSelector((state: PurchasePortalState) => state);
  const { mode, isComplimentary, screen, errors } = app;
  const {
    createOrderParams: { tickets, upgrades, paymentMethodType },
  } = order;

  /** Actions **/
  const dispatch = useDispatch();

  const navigateForward = () => {
    if (screen === ScreenEnum.GuestMembers) {

      dispatch(OrderActions.getTicketRestrictionAction());
    } else {
      dispatch(AppActions.seasonNavigateForward());
    }
  };

  let buttonColor = Colors.Orange;
  let buttonText = "Next";

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
    fees: season.fees,
    paymentMethodType,
  };
  const ticketUpgradeGuestFeeTotal = PaymentUtil.calculatePaymentTotal(totalParams).subTotal || 0;
  const total = screen === ScreenEnum.ConfirmOrder || screen === ScreenEnum.CashPayment ? PaymentUtil.calculatePaymentTotal(totalParams).total || 0 : ticketUpgradeGuestFeeTotal;

  const errorMsg: any =
    errors[ErrorKeyEnum.ConFirmOrderError] ||
    errors[ErrorKeyEnum.PromoCodeLimitError] ||
    errors[ErrorKeyEnum.PaymentCardError] ||
    errors[ErrorKeyEnum.UserProfileError];

  const isSeatingScreen = (screen: any, season: any) => {
    return (
      screen === ScreenEnum.Tickets && Boolean(season?.seatingChartKey ?? false)
    );
  };
  if (isSeatingScreen(screen, season)) {

    return (
      <Container isSeating={true}>
        <Flex align="center" justify="space-between" margin="0 16px 0">
          <Flex direction="column">
            <ItemCount>
              {tickets.length} Seat{tickets.length === 1 ? "" : "s"} Selected
            </ItemCount>
            <TotalText>
              {(() => {
                if (isComplimentary) {
                  return "Comp";
                } else {
                  return `$${Price.output(total, true)}`;
                }
              })()}
            </TotalText>
          </Flex>
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
        </Flex>
      </Container>
    );
  }

  if (screen === ScreenEnum.OrderConfirmed) {
    return null;
  }

  return (
    <Container>
      {showNext && !errorMsg && (
        <ButtonContainer>
          <Button
            type={ButtonTypes.Next}
            text={buttonText}
            onClick={() => navigateForward()}
            bgColor={buttonColor}
          />
        </ButtonContainer>
      )}
      <CheckoutInfo>
        {/* <Logo src={SelloutLogo} /> */}
        <Icon icon={Icons.HelpLight} color={Colors.Grey3} size={24} />
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
        })()}
      </CheckoutInfo>
    </Container>
  );
};

export default SeasonControls;
