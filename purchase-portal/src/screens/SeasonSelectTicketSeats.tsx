import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import { SeatsioClient, Region } from "seatsio";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as OrderActions from "../redux/actions/order.actions";
import ICreateOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import TierUtil from "@sellout/models/.dist/utils/TierUtil";
import SeatingPlanSecretCode from "../components/SeatingPlanSecretCode";
import { Colors } from "@sellout/ui/build/Colors";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import * as Price from "@sellout/utils/.dist/price";
import * as AppActions from "../redux/actions/app.actions";
import IEventPromotion, {
  EventPromotionTypeEnum,
} from "@sellout/models/.dist/interfaces/IEventPromotion";
import * as Time from "@sellout/utils/.dist/time";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import GET_PROMO_CODE from "@sellout/models/.dist/graphql/queries/promoCodeVerify.query";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import QUERY_SEATING_KEYS from "@sellout/models/.dist/graphql/queries/seatingKeys.query";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { debug } from "console";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  min-height: calc(100% - 160px);
`;

const Content = styled.div`
  position: relative;
  height: 100%;
`;

const SEATS_IO_CONTAINER = "SEATS_IO_CONTAINER";

type SeasonSelectTicketSeatsProps = {
  season: Required<ISeasonGraphQL>;
};

const SeasonSelectTicketSeats: React.FC<SeasonSelectTicketSeatsProps> = ({
  season,
}) => {
  /** State **/
  const [loading, setLoading] = React.useState(true);
  const seatingId = SeasonUtil.seatingId({ _id: season._id as string });
  const isOnSale = SeasonUtil.isOnSale(season);

  const [showPromotionCodeInput, setShowPromotionCodeInput] = useState(false);
  const [showPromotionCodeButton, setShowPromotionCodeButton] = useState(false);
  const [reRender, setReRender] = useState(false);

  const {
    app: { mode, availablseatingCategories },
    order: { createOrderParams },
  } = useSelector((state: PurchasePortalState) => state);
  const { promotionCode } = createOrderParams;

  const [ticketCount, setTicketCount] = React.useState(0);
  let available = [] as any;
  // const { secretKey } = useSeatingKeysHook(event?.orgId as any);

  const { data: secretKeyData, loading: secretKeyLoading } = useQuery(
    QUERY_SEATING_KEYS,
    {
      variables: {
        orgId: season?.orgId,
      },
    }
  );

  /** Actions **/
  const dispatch = useDispatch();
  const setCreateOrderParams = (orderParams: Partial<ICreateOrderParams>) =>
    dispatch(OrderActions.setCreateOrderParams(orderParams));

  const addTicketType = (
    ticketTypeId: string,
    tierId: string,
    seat: string,
    overRideMax?: number
  ) => {
    dispatch(
      OrderActions.addTicketType(season as any, ticketTypeId, tierId, seat, overRideMax)
    );
    setTicketCount(ticketCount + 1);
  };

  const removeTicketType = (
    ticketTypeId: string,
    tierId: string,
    seat: string
  ) => {
    dispatch(
      OrderActions.removeTicketType(season as any, ticketTypeId, tierId, seat)
    );
    setTicketCount(ticketCount - 1);
  };

  const [getPromoTickets, { data, error }] = useLazyQuery(GET_PROMO_CODE, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      if(data.eventTickets.length > 0 && setShowPromotionCodeButton){
      setShowPromotionCodeButton(true);
      }
    },
  });

  const ticket = data?.eventTickets;
  const now = Time.now();
  const activeTickets =
    ticket &&
    ticket[0]?.active &&
    ticket[0]?.remainingQty > 0 &&
    ticket[0]?.startsAt < now &&
    now < ticket[0]?.endsAt;

  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  if (isBoxOffice) {
    available = season.ticketTypes
      .filter((ticketType: ITicketType) => ticketType.remainingQty > 0)
      .map((a) => a.name);
  } else {
    const promotionCodeTicketsIds = season?.promotions
      ?.filter((a) => a.type === "Unlock" && a.active)
      .reduce((cur: string[], promotion: any) => {
        return [...cur, ...promotion.ticketTypeIds];
      }, []);

    const withoutPromotionCodeTickets = season?.ticketTypes
      // Must be visibile
      .filter((ticketType: ITicketType) => ticketType.visible)
      .filter(
        (ticketType: ITicketType) =>
          !promotionCodeTicketsIds.includes(ticketType._id as string)
      )
      .map((a) => a.name);

    const eventTickets = ticket && ticket[0]?.eventTickets;
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

    const visibleTickets =
      promotionCodeTickets &&
      promotionCodeTickets.filter((i: any) => i.visible);
    if (visibleTickets && visibleTickets.length > 0) {
      const visibleTickets = promotionCodeTickets
        .filter((i: any) => i.visible)
        .map((a: any) => a.name);
      available = isOnSale
        ? [...withoutPromotionCodeTickets, ...visibleTickets]
        : [...visibleTickets];
    } else {
      available = [...withoutPromotionCodeTickets];
    }
    if (visibleTickets && visibleTickets.length === 0) {
      available = [...availablseatingCategories];
    }
  }

  /** Hooks **/
  React.useEffect(() => {
    setTimeout(() => setLoading(false), 350);
     getPromoTickets({
      variables: {
        seasonId: season._id,
        promoCode: promotionCode,
      },
    });
    const availablseatingCategories = available;
    dispatch(
      AppActions.setAvailableSeatingAction({ availablseatingCategories })
    );
  }, []);

  const pricing = season.ticketTypes.map((ticketType: ITicketType) => {
    return {
      category: ticketType.name,
      price: false
        ? `$${ticketType.values}`
        : `$${Price.output(TierUtil.currentTier(ticketType)?.price, true)}`,
    };
  });

  const maxSelectedObjects = season.ticketTypes.map(
    (ticketType: ITicketType) => {
      const useRemainingQty =
        ticketType.remainingQty < ticketType.purchaseLimit;
      const isSeatCategory = ticket && ticket.length && ticket[0].eventTickets.length > 0 ? ticket[0].eventTickets.find((t: any) => ticketType._id === t._id) : true
      return ticket && ticket.length && isSeatCategory && ticket[0].active && Number(ticket[0].overRideMax) !== 0 ?
        {
          category: ticketType.name,
          quantity: Number(ticket[0].overRideMax),
        } :
        {
          category: ticketType.name,
          quantity: useRemainingQty
            ? ticketType.remainingQty
            : ticketType.purchaseLimit,
        };
    }
  );

  /////////////// secret code //////////////

  const checkPromotionCode = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (close) close();
    }, 250);

     getPromoTickets({
      variables: {
        seasonId: season._id,
        promoCode: promotionCode,
      },
    });
    const availablseatingCategories = available;
    dispatch(
      AppActions.setAvailableSeatingAction({ availablseatingCategories })
    );
    setShowPromotionCodeInput(!showPromotionCodeInput);
  };

  const updateHoldToken = async (holdToken: any, min: any) => {
    if (secretKeyData.seating.secretKey) {
      let seatsIOClient = new SeatsioClient(
        //Region.EU(),
        secretKeyData.seating.secretKey
      );
      return await seatsIOClient.holdTokens.expiresInMinutes(holdToken, min);
    }
  };

  const stopTime = (e: any) => {
    const SeatingPlanTimer = 0;
    dispatch(AppActions.setSeatTimer({ SeatingPlanTimer }));
    onSeatDeSelected();
    updateHoldToken(e.chart?.holdToken, 15);
  };

  const onSeatSelected = () => {
    sessionStorage.setItem("seatsSelect", "true");
  };

  const onSeatDeSelected = () => {
    sessionStorage.setItem("seatsSelect", "false");
  };

  const onChangePromotionCode = (e: any) => {
    const promotionCode: string = e.target.value;
    dispatch(
      OrderActions.setCreateOrderParams({
        promotionCode,
      })
    );
  };
  const seatioToken = sessionStorage.getItem("seatsio");

  React.useEffect(() => {
    if (seatioToken) {
      const holdToken1 = JSON.parse(seatioToken).holdToken;
      setCreateOrderParams({ holdToken: holdToken1 });
    }
  }, [seatioToken]);

  let timerOnRefresh = 0 as number;
  return (
    <Container>
      {mode === EPurchasePortalModes.Checkout && (
        <SeatingPlanSecretCode
          title="Select tickets"
          showPromotionButton={isOnSale}
          checkPromotionCode={checkPromotionCode}
          onChangePromotionCode={onChangePromotionCode}
          promotionCode={promotionCode}
          showPromotionCodeInput={showPromotionCodeInput}
          setShowPromotionCodeInput={setShowPromotionCodeInput}
          loading={loading}
          showPromotionCodeButton={showPromotionCodeButton}
        />
      )}
      <Content id={SEATS_IO_CONTAINER}>
        {!secretKeyLoading && (
          <SeatsioSeatingChart
            id={SEATS_IO_CONTAINER}
            publicKey={season.seatingPublicKey}
            event={seatingId}
            availableCategories={available}
            pricing={pricing}
            region="eu"
            maxSelectedObjects={maxSelectedObjects}
            session={"continue"}
            onSessionInitialized={(holdToken: any) => {
              timerOnRefresh = holdToken.expiresInSeconds as number;
            }}
            onChartRendered={async (seatingChart: any) => {
              if (seatingChart.selectedObjects.length > 0) {
                const SeatingPlanTimer = Time.now() + timerOnRefresh;
                dispatch(AppActions.setSeatTimer({ SeatingPlanTimer }));
              }
              if (seatingChart.selectedObjects.length === 0) {
                onSeatDeSelected();
                await updateHoldToken(seatingChart?.holdToken, 15);
              }
              setCreateOrderParams({ holdToken: seatingChart.holdToken });
            }}
            onObjectSelected={async (object: any) => {
              const ticketType = season?.ticketTypes.find(
                (ticketType) => ticketType.name === object.category.label
              );
              var seatsSelect = sessionStorage.getItem("seatsSelect");
              //
              if (ticketType) {
                if (
                  object.chart.selectedObjects.length === 1 &&
                  (seatsSelect === "false" || !seatsSelect)
                ) {
                  onSeatSelected();
                  let holdToken = await updateHoldToken(
                    object?.chart?.holdToken,
                    5
                  );
                  const SeatingPlanTimer =
                    Time.now() + holdToken.expiresInSeconds;
                  dispatch(AppActions.setSeatTimer({ SeatingPlanTimer }));
                }
                const tier = TierUtil.currentTier(ticketType);
                if (!tier) return null;
                addTicketType(
                  ticketType._id as string,
                  tier._id as string,
                  object.id,
                  ticket && ticket.length && Number(ticket[0].overRideMax)
                );
              }
            }}
            onObjectDeselected={async (object: any) => {
              const ticketType = season?.ticketTypes.find(
                (ticketType) => ticketType.name === object.category.label
              );
              if (ticketType) {
                if (object.chart.selectedObjects.length === 0) {
                  await stopTime(object);
                }
                const tier = TierUtil.currentTier(ticketType);
                if (!tier) return null;
                removeTicketType(
                  ticketType._id as string,
                  tier._id as string,
                  object.id
                );
              }
            }}
            showFullScreenButton={false}
            showZoomOutButtonOnMobile={false}
            onHoldTokenExpired={() => {
              onSeatDeSelected();
            }}
          />
        )}
      </Content>
    </Container>
  );
};

export default SeasonSelectTicketSeats;
