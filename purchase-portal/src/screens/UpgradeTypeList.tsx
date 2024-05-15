import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IEventPromotion, {
  EventPromotionTypeEnum,
} from "@sellout/models/.dist/interfaces/IEventPromotion";
import { Colors } from "@sellout/ui/build/Colors";
import UpgradeProduct from "../components/UpgradeProduct";
import ScreenHeader from "../components/ScreenHeader";
import useShowNext from "../hooks/useShowNext.hook";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import usePromoCodeHook from "../hooks/usePromoCodehook";
import { Text } from "./TicketTypeList";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import * as Time from "@sellout/utils/.dist/time";

const Container = styled.div<ShowNexProps>`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding: ${(props) => (props.isNextButtonVisible ? "0 0 72px" : "0")};
`;

const Spacer = styled.div`
  /* height: 15px; */
  background-color: transparent;
`;

type UpgradeTypeListProps = {
  event: Required<IEventGraphQL>;
};

type ShowNexProps = {
  isNextButtonVisible: boolean;
};

const UpgradeTypeList: React.FC<UpgradeTypeListProps> = ({ event }) => {
  /** State **/
  const {
    app: { mode, errors },
    order: {
      createOrderParams: { promotionCode },
    },
  } = useSelector((state: PurchasePortalState) => state);

  const [overRideMax, setOverRideMax] = React.useState(0);
  const isOnSale = EventUtil.isOnSale(event);
  const showNext = useShowNext(event);
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const { ticket } = usePromoCodeHook(
    event?._id as string,
    promotionCode as string
  );

  // Must have remaining qty
  let upgrades: IEventUpgrade[] = [];
  if (isBoxOffice) {
    // Must not be complimentary
    upgrades = event.upgrades.filter(
      (upgrade: IEventUpgrade) => !upgrade.complimentary
    );

    // Lowest price first
    upgrades = upgrades.sort((a: IEventUpgrade, b: IEventUpgrade) => {
      if (a.price > b.price) return 1;
      if (a.price < b.price) return -1;
      return 0;
    });
  } else {
    const promotionCodeUpgrades = event.promotions
      ?.filter((a) => a.type === "Unlock" && a.active)
      .reduce((cur: string[], promotion: IEventPromotion) => {
        return [...cur, ...promotion.upgradeIds];
      }, []);
    // Must not be locked behind promotion
    // Remove ! from the promotionCodeTickets to hide the message
    upgrades = event.upgrades
      .filter((upgrade: IEventUpgrade) => upgrade.visible)
      .filter(
        (upgrade: IEventUpgrade) =>
          !promotionCodeUpgrades.includes(upgrade._id as string)
      );


    useEffect(() => {
      if (ticket && ticket.length && Number(ticket.overRideMaxUpg) !== 0) {
        setOverRideMax(ticket[0]?.overRideMaxUpg);
      }
      return;
    }, [ticket]);

    if (promotionCode && ticket) {
      const promotion = event.promotions.find((promotion: IEventPromotion) =>
        !isOnSale
          ? promotion.type === EventPromotionTypeEnum.PreSale
          : promotion.type === EventPromotionTypeEnum.Unlock
      );
      const now = Time.now();
      const activeUpgrades =
        ticket &&
        ticket.filter(
          (a: any) =>
            a.active &&
            a.remainingQty &&
            a.startsAt < now &&
            now < a.endsAt &&
            (!isOnSale
              ? a?.promoType === EventPromotionTypeEnum.PreSale
              : a?.promoType === EventPromotionTypeEnum.Unlock)
        );
      const promotionCodeUpgrades =
        activeUpgrades &&
        activeUpgrades.reduce((cur: string[], a: any) => {
          return [...cur, ...a.eventUpgrades];
        }, []);

      if (promotionCodeUpgrades && promotionCodeUpgrades.length > 0) {
        const visibleUpgrades = promotionCodeUpgrades.filter(
          (a: any) => a.visible
        );
        upgrades = [...visibleUpgrades];
      } else {
        upgrades = [...upgrades];
      }
    }
  }

  /** Render **/
  return (
    <Container isNextButtonVisible={showNext}>
      <ScreenHeader title="Select upgrades" />
      <Spacer />
      {errors?.Global && errors?.Global.length > 0 ? (
        <Text>No upgrades available for that code.</Text>
      ) : (
        <>
          {upgrades?.map((upgrade: IEventUpgrade) => {
            let overRideMaxUpg = -1;
            const active = event?.promotions?.filter((item: any) => {
              if (
                item.upgradeIds.includes(upgrade._id as any)  &&
                overRideMax
              ) {
                overRideMaxUpg = item?.overRideMaxUpg;
              } else {
                overRideMaxUpg = -1;
              }
            });
            return (
              <UpgradeProduct
                key={upgrade._id}
                upgrade={upgrade}
                event={event}
                overRideMaxUpg={overRideMaxUpg}
              />
            );
          })}
        </>
      )}
      {upgrades?.length === 0 && (
        <Text>
          There are no upgrades available. If you have a promo code, click the
          link above in ticket screen to enter it and see available upgrades.
        </Text>
      )}
    </Container>
  );
};

export default UpgradeTypeList;
