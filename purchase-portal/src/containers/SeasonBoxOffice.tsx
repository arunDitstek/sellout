import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import SeasonInfo from "../components/SeasonInfo";
import SeasonSelectTicketSeats from "../screens/SeasonSelectTicketSeats";
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
import SeasonControls from "../components/SeasonControls";
import { PurchasePortalState } from "../redux/store";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import { Colors } from "@sellout/ui/build/Colors";
import GuestMembers from "../screens/GuestMembers";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

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
  season: Required<ISeasonGraphQL>;
};

type ContainerProps = {
  isLoading: boolean;
};

const SeasonBoxOffice: React.FC<BoxOfficeProps> = ({ season }) => {
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
      <SeasonInfo season={season} />
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
                if (season.seatingChartKey) {
                  return <SeasonSelectTicketSeats season={season} />;
                }

              case ScreenEnum.GuestMembers:
                return <GuestMembers season={season} />;

              case ScreenEnum.CustomFields:
                return <CustomFields season={season} />;

              case ScreenEnum.LiabilityWaiver:
                return <LiabilityWaiver season={season} />;

              case ScreenEnum.CustomerPhoneNumber:
                return <CustomerPhoneNumber />;

              case ScreenEnum.PaymentMethod:
                return <PaymentMethod />;

              case ScreenEnum.SelectPayment:
                return <SelectPayment />;

              case ScreenEnum.AddPayment:
                return <AddPayment />;

              case ScreenEnum.CashPayment:
                return <CashPayment season={season} />;

              case ScreenEnum.ConfirmOrder:
                return <ConfirmOrder season={season} />;

              case ScreenEnum.CardReader:
                return <StripeTerminal />;

              case ScreenEnum.OrderConfirmed:
                return <OrderConfirmed season={season} />;
            }
          })()}
        </Container>
      )}
      <Spacer />
      {!session && <SeasonControls season={season} />}
    </Fragment>
  );
};

export default SeasonBoxOffice;
