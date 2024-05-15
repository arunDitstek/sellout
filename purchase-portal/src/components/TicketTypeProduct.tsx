import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import { PurchasePortalState } from "../redux/store";
import * as OrderActions from "../redux/actions/order.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import Product from "@sellout/ui/build/components/Product";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";

type TicketTypeProductProps = {
  ticketType: ITicketType;
  event: Required<IEventGraphQL>;
  overRideMax: number;
};

const TicketTypeProduct: React.FC<TicketTypeProductProps> = ({
  ticketType,
  event,
  overRideMax,
}) => {
  /** State **/
  //const tier = TierUtil.currentTier(ticketType);
  // const tier = ticketType.tiers.find(tier => tier.name === "Day of Show");
  // const tier = ticketType.tiers.find(tier => tier.name === "Advance");
  const tier = ticketType.tiers.find((tier) => true);
  // const selector = (state: PurchasePortalState) => state.order.createOrderParams
  // const createOrderParams = useSelector(selector);
  const {
    app: { errors, availablseatingCategories },
    order: { createOrderParams },
  } = useSelector((state: PurchasePortalState) => state);
  const ticketCount = OrderUtil.ticketTypeCount(
    createOrderParams,
    ticketType._id
  );
  const isMultiDaysEvent = event?.isMultipleDays;
  const timeZone = event?.venue?.address?.timezone
    ? event?.venue?.address?.timezone
    : "America/Denver";

  const dispatch = useDispatch();
  if (!tier) return null;
  /** Actions **/

  const addTicketType = () => {
    overRideMax !== -1
      ? dispatch(
          OrderActions.addTicketTypeUnseated(
            event,
            ticketType._id as string,
            tier._id as string,
            overRideMax
          )
        )
      : dispatch(
          OrderActions.addTicketType(
            event,
            ticketType._id as string,
            tier._id as string
          )
        );
  };

  const removeTicketType = () =>
    dispatch(
      OrderActions.removeTicketType(
        event,
        ticketType._id as string,
        tier._id as string
      )
    );

  const {
    app: { mode },
  } = useSelector((state: PurchasePortalState) => state);

  const ticketDaysSelected: any =
    ticketType.dayIds &&
    ticketType.dayIds.sort(function (a: any, b: any) {
      return a - b;
    });
  /** Render **/
  return (
    <>
      <Product
        title={ticketType.name}
        price={
          EventUtil.isRSVP(event)
            ? parseFloat(ticketType.values as string)
            : tier.price
        }
        description={ticketType.description}
        value={ticketCount}
        minValue={0}
        eventDays={ticketDaysSelected as string[]}
        isRSVP={EventUtil.isRSVP(event)}
        maxValue={
          overRideMax !== -1 ? Number(overRideMax) : ticketType.purchaseLimit
        }
        onIncrement={() => addTicketType()}
        onDecrement={() => removeTicketType()}
        isMultiDaysEvent={isMultiDaysEvent as boolean}
        timeZone={timeZone as string}
        remainingQty={ticketType.remainingQty}
      />
    </>
  );
};

export default TicketTypeProduct;
