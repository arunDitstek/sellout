import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Colors } from "@sellout/ui/build/Colors";
import Loader, { LoaderSizes } from "@sellout/ui/build/components/Loader";
import { motion } from "framer-motion";
import BoxOffice from "./BoxOffice";
import Checkout from "./Checkout";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import Flex from "@sellout/ui/build/components/Flex";
import Error from "./../components/Error";
import isSeatingScreen from "../utils/isSeatingScreen";
import * as ErrorUtil from "../utils/ErrorUtil";
import SeasonCheckout from "./SeasonCheckout";
import SeasonBoxOffice from "./SeasonBoxOffice";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import AppNotification from "../components/AppNotification";

const MainContainer = styled(motion.div) <any>`
  position: relative;
  height: 100%;
  width: max-content;
  background-color: ${Colors.White};
  transition: all 0.3s;
  overflow: hidden;

  ${media.tablet`
    max-width: ${(props: any) => (props.isSeating ? "696px" : "400px")};
    min-width: 400px;
    height: 664px;
    border-radius: 15px;
  `};
   ${media.mobile`
      width: 100%;
    `}
  /* ${media.largeDesktop`
    height: 800px;
  `}; */
`;

type MainPopContainerTypes = {
  isSeating: boolean;
};

const MainPopContainer: React.FC<MainPopContainerTypes> = ({
  isSeating,
  children,
}) => {
  return (
    <MainContainer
      id="SELLOUT_CHECKOUT_MODAL"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      isSeating={isSeating}
    >
      {children}
    </MainContainer>
  );
};

type PurchasePortalProps = {};

// HANDLE ERROR
const PurchasePortal: React.FC<PurchasePortalProps> = () => {
  /** Hooks **/
  const { event, eventId, loading: eventLoading } = useEvent();

  const { season, seasonId, error } = useSeason();
  /** State **/
  const { mode, screen } = useSelector(
    (state: PurchasePortalState) => state.app
  );
  const isSeatingEvent = isSeatingScreen(screen, event);
  const isSeatingSeason = isSeatingScreen(screen, season as IEventGraphQL);

  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  });

  /** Render **/
  // if (!eventId && !season) {
  //   return (
  //     <MainPopContainer isSeating={false}>
  //       Please enter a valid event ID or season ID
  //     </MainPopContainer>
  //   );
  // }

  return (
    <MainPopContainer isSeating={isSeatingEvent || isSeatingSeason}>
      <AppNotification />
      {(() => {
        if (error) {
          return (
            <Flex align="center" justify="center" height="100%">
              <Error>{ErrorUtil.getErrorMessage(error)}</Error>
            </Flex>
          );
        }

        if (!event && !season) {
          return (
            <Flex align="center" justify="center" height="100%">
              <Loader color={Colors.Orange} size={LoaderSizes.Large} />
            </Flex>
          );
        }

        switch (mode) {
          case EPurchasePortalModes.Checkout:
            switch (event || season) {
              case event:
                return <Checkout event={event as Required<IEventGraphQL>} />;

              case season:
                return (
                  <SeasonCheckout season={season as Required<ISeasonGraphQL>} />
                );
            }

          case EPurchasePortalModes.BoxOffice:
            switch (event || season) {
              case event:
                return <BoxOffice event={event as Required<IEventGraphQL>} />;

              case season:
                return (
                  <SeasonBoxOffice
                    season={season as Required<ISeasonGraphQL>}
                  />
                );
            }

          default:
            return;
        }
      })()}
    </MainPopContainer>
  );
};

export default PurchasePortal;
