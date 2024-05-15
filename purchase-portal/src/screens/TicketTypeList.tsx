import React, { useEffect } from "react";
import styled from "styled-components";
import {useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import { Colors } from "@sellout/ui/build/Colors";
import TicketTypeProduct from "../components/TicketTypeProduct";
import ScreenHeader from "../components/ScreenHeader";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import useShowNext from "../hooks/useShowNext.hook";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { EventPromotionTypeEnum } from "@sellout/models/.dist/interfaces/IEventPromotion";
import usePromoCodeHook from "../hooks/usePromoCodehook";
import * as Time from "@sellout/utils/.dist/time";
import EventUnavilableWaitList from "./EventUnavilableWaitList";


const Container = styled.div<ShowNexProps>`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding: ${(props) => (props.isNextButtonVisible ? "0 0 72px" : "0")};
`;
const Wrapper = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  height: 505px;
  width: 100%;
`;
export const Text = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  height: 450px;
  display: flex;
  align-items: center;
  text-align: center;
  padding: 0 15px;
  justify-content: center;
`;

type TicketTypeListProps = {
  event: Required<IEventGraphQL>;
};

type ShowNexProps = {
  isNextButtonVisible: boolean;
};

const TicketTypeList: React.FC<TicketTypeListProps> = ({ event }) => {
  /* State */
  const {
    app: { mode, errors },
    order: {
      createOrderParams: { promotionCode },
    },
  } = useSelector((state: PurchasePortalState) => state);

  const [overRideMax, setOverRideMax] = React.useState(0);

  const showNext = useShowNext(event);
  const isOnSale = EventUtil.isOnSale(event);
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const { ticket } = usePromoCodeHook(
    event?._id as string,
    promotionCode as string
  );

  let ticketTypes: ITicketType[] = [];

  if (isBoxOffice) {
    ticketTypes = event.ticketTypes.filter(
      (ticketType: ITicketType) => ticketType.remainingQty >= 0
    );

    // Lowest price first
    ticketTypes = ticketTypes.sort((a: ITicketType, b: ITicketType) => {
      const {
        tiers: [aTier],
      } = a;
      const {
        tiers: [bTier],
      } = b;
      if (aTier.price > bTier.price) return 1;
      if (aTier.price < bTier.price) return -1;
      return 0;
    });
  } else {
    const promotionCodeTickets = event.promotions
      ?.filter((a) => a.type === "Unlock" && a.active)
      .reduce((cur: string[], promotion: IEventPromotion) => {
        return [...cur, ...promotion.ticketTypeIds];
      }, []);

    ticketTypes = event.ticketTypes
      .filter((ticketType: ITicketType) => ticketType.visible)
      .filter(
        (ticketType: ITicketType) =>
          !promotionCodeTickets.includes(ticketType._id as string)
      );

    useEffect(() => {
      if (ticket && ticket && ticket.length > 0) {
        setOverRideMax(ticket[0]?.overRideMax);
      }
    }, [ticket]);

    if (promotionCode && ticket) {
      const promotion = event.promotions.find((promotion: IEventPromotion) =>
        !isOnSale
          ? promotion.type === EventPromotionTypeEnum.PreSale
          : promotion.type === EventPromotionTypeEnum.Unlock
      );

      const now = Time.now();
      const activeTickets1 =
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

      const promotionCodeTickets =
        activeTickets1 &&
        activeTickets1.reduce((cur: string[], a: any) => {
          return [...cur, ...a.eventTickets];
        }, []);

      if (promotionCodeTickets && promotionCodeTickets.length > 0) {
        const visibleTickets = promotionCodeTickets.filter(
          (a: any) => a.visible
        );
        ticketTypes = [...visibleTickets];
      } else {
        ticketTypes = [...ticketTypes];
      }
    }
  }
  const allTicketsVisible: any =
  event?.ticketTypes?.filter(
    (ticket: any) =>  ticket.remainingQty > 0
  );
  const allUpgradeVisible: any =
  event?.upgrades?.filter(
    (upgrade: any) =>  upgrade.remainingQty > 0
  );

  /* Render */
  return (
    <Container isNextButtonVisible={showNext}>
      {mode === EPurchasePortalModes.Checkout && (
        <ScreenHeader title="Select tickets" showPromotionButton={isOnSale} />
      )}
    {errors?.Global && errors?.Global?.length > 0 ? (<Text>{errors?.Global}</Text>) : (
        <>
          {isBoxOffice && allTicketsVisible.length == 0 || (allTicketsVisible.length == 0 && allUpgradeVisible.length== 0) ? (
            <>
            <EventUnavilableWaitList event={event}/>
        </>
          ) : (
            ticketTypes.map((ticketType: ITicketType) => {
              let overRideMaxT = -1;
              const active = event?.promotions?.filter((item: any) => {
                if (
                  item.ticketTypeIds.includes(ticketType._id as any) &&
                  overRideMax
                ) {
                  overRideMaxT = item?.overRideMax;
                } else {
                  overRideMaxT = -1;
                }
              });

              return (
                <TicketTypeProduct
                  key={ticketType._id}
                  ticketType={ticketType}
                  event={event}
                  overRideMax={overRideMaxT}
                />
              );
            })
          )}
        </>
      )}
    
      {ticketTypes.length === 0 && (
        <Text>
          There are no tickets available. If you have a promo code, click the
          link above to enter it and see available tickets.
        </Text>
      )}
    </Container>
  );
};

export default TicketTypeList;
