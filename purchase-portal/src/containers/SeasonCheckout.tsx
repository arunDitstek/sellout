import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import SeasonInfo from "../components/SeasonInfo";
import EventUnavailable from "../screens/EventUnavailable";
import SeasonSelectTicketSeats from "../screens/SeasonSelectTicketSeats";
import CustomFields from "../screens/CustomFields";
import LiabilityWaiver from "../screens/LiabilityWaiver";
import UserEmail from "../screens/UserEmail";
import UserInfo from "../screens/UserInfo";
import PhoneCode from "../screens/PhoneCode";
import SelectPayment from "../screens/SelectPayment";
import AddPayment from "../screens/AddPayment";
import ConfirmOrder from "../screens/ConfirmOrder";
import OrderConfirmed from "../screens/OrderConfirmed";
import SeasonControls from "../components/SeasonControls";
import { PurchasePortalState } from "../redux/store";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import { Colors } from "@sellout/ui/build/Colors";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import GuestMembers from "../screens/GuestMembers";

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

type CheckoutProps = {
  season: Required<ISeasonGraphQL>;
};

type ContainerProps = {
  isLoading: boolean;
};

const Checkout: React.FC<CheckoutProps> = ({ season }) => {
  /** State **/
  const [session, setSession] = React.useState(false as boolean);
  const { screen, loading, SeatingPlanTimer } = useSelector(
    (state: PurchasePortalState) => state.app
  );

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
              case ScreenEnum.EventUnavailable:
                return <EventUnavailable season={season} />;

              case ScreenEnum.Tickets:
                return <SeasonSelectTicketSeats season={season} />;

              case ScreenEnum.GuestMembers:
                return <GuestMembers season={season} />;

              case ScreenEnum.CustomFields:
                return <CustomFields season={season} />;

              case ScreenEnum.LiabilityWaiver:
                return <LiabilityWaiver season={season} />;

              case ScreenEnum.UserEmail:
                return <UserEmail season={season} />;

              case ScreenEnum.UserInfo:
                return <UserInfo />;

              case ScreenEnum.PhoneCode:
                return <PhoneCode season={season} />;

              case ScreenEnum.SelectPayment:
                return <SelectPayment />;

              case ScreenEnum.AddPayment:
                return <AddPayment />;

              case ScreenEnum.ConfirmOrder:
                return <ConfirmOrder season={season} />;

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

export default Checkout;
