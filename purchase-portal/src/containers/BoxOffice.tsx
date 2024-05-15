import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import EventInfo from "../components/EventInfo";
import TicketTypeList from "../screens/TicketTypeList";
import SelectTicketSeats from "../screens/SelectTicketSeats";
import UpgradeTypeList from "../screens/UpgradeTypeList";
import CustomFields from "../screens/CustomFields";
import LiabilityWaiver from "../screens/LiabilityWaiver";
import CustomerPhoneNumber from "../screens/CustomerPhoneNumber";
import PaymentMethod from "../screens/PaymentMethod";
import SelectPayment from "../screens/SelectPayment";
import AddPayment from "../screens/AddPayment";
import CashPayment from "../screens/CashPayment";
import ConfirmOrder from "../screens/ConfirmOrder";
import StripeTerminal from "../screens/StripeTerminal";
import OrderConfirmed from "../screens/OrderConfirmed";
import Controls from "../components/Controls";
import { PurchasePortalState } from "../redux/store";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import { Colors } from "@sellout/ui/build/Colors";
import GuestMembers from "../screens/GuestMembers";
import UserEmail from "../screens/UserEmail";

const Container = styled.div<ContainerProps>`
  position: relative;
  overflow: ${(props) => (props.isLoading ? "initial" : "scroll")};
  height: 100%;
  margin-bottom: 200px;
  z-index: 1000;
`;

const Placeholder = styled.div`
  height: 160px;
  background-color: transparent;
`;

const Spacer = styled.div`
  position: relative;
  height: 160px;
`;

const LoaderDiv = styled.div`
  position: absolute;
  background-color: white;
  top: 110px;
  width: 100%;
  z-index: 10000;
  height: 100%;
`;

const LoaderContainer = styled.div`
  width: 100%;
  height: calc(100% - 200px);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SessionExpired = styled.p`
  width: 100%;
  height: calc(100% - 200px);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 2px;
`;

type BoxOfficeProps = {
  event: Required<IEventGraphQL>;
};

type ContainerProps = {
  isLoading: boolean;
};

const BoxOffice: React.FC<BoxOfficeProps> = ({ event }) => {
  /** State **/
  const { screen, errors, loading, SeatingPlanTimer } = useSelector(
    (state: PurchasePortalState) => state.app
  );
  // const appError = errors[ErrorKeyEnum.Global];
  const [session, setSession] = React.useState(false as boolean);

  React.useEffect(() => {
    if (SeatingPlanTimer === 1) {
      setSession(true);
    }
  }, [SeatingPlanTimer]);

  /** Render **/
  return (
    <Fragment>
      <EventInfo event={event} />
      {session ? (
        <Container isLoading={loading}>
          {" "}
          <Placeholder />
          {loading && (
            <LoaderDiv>
              <LoaderContainer>
                <Loader color={Colors.Orange} size={LoaderSizes.Large} />
              </LoaderContainer>
            </LoaderDiv>
          )}
          <SessionExpired>
            Your session has expired.Please refresh the page.
          </SessionExpired>{" "}
        </Container>
      ) : (
        <Container isLoading={loading}>
          <Placeholder />
          {loading && (
            <LoaderDiv>
              <LoaderContainer>
                <Loader color={Colors.Orange} size={LoaderSizes.Large} />
              </LoaderContainer>
            </LoaderDiv>
          )}
          {(() => {
            switch (screen) {
              case ScreenEnum.Tickets:
                if (event.seatingChartKey) {
                  return <SelectTicketSeats event={event} />;
                } else {
                  return <TicketTypeList event={event} />;
                }

              case ScreenEnum.Upgrades:
                return <UpgradeTypeList event={event} />;

              case ScreenEnum.CustomFields:
                return <CustomFields event={event} />;

              case ScreenEnum.LiabilityWaiver:
                return <LiabilityWaiver event={event} />;

              case ScreenEnum.GuestMembers:
                return <GuestMembers event={event} />;

              case ScreenEnum.CustomerPhoneNumber:
                return <CustomerPhoneNumber />;

              case ScreenEnum.PaymentMethod:
                return <PaymentMethod />;

              case ScreenEnum.SelectPayment:
                return <SelectPayment />;

              case ScreenEnum.AddPayment:
                return <AddPayment />;

              case ScreenEnum.CashPayment:
                return <CashPayment event={event} />;

              case ScreenEnum.ConfirmOrder:
                return <ConfirmOrder event={event} />;

              case ScreenEnum.CardReader:
                return <StripeTerminal />;

              case ScreenEnum.OrderConfirmed:
                return <OrderConfirmed event={event} />;

              case ScreenEnum.UserEmail:
                return <UserEmail event={event} />;
            }
          })()}
        </Container>
      )}
      <Spacer />
      {!session && <Controls event={event} />}
    </Fragment>
  );
};

export default BoxOffice;
