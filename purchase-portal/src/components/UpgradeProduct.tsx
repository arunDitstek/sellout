import React from "react";
import { useDispatch, useSelector } from "react-redux";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import { PurchasePortalState } from "../redux/store";
import * as OrderActions from "../redux/actions/order.actions";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import Required from "../models/interfaces/Required";
import Product from "@sellout/ui/build/components/Product";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";

type UpgradeProductProps = {
  upgrade: IEventUpgrade;
  event: Required<IEvent>;
  overRideMaxUpg: number;
};

const UpgradeProduct: React.FC<UpgradeProductProps> = ({
  upgrade,
  event,
  overRideMaxUpg,
}) => {
  const selector = (state: PurchasePortalState) =>
    state.order.createOrderParams;
  const createOrderParams = useSelector(selector);
  const upgradeCount = OrderUtil.upgradeCount(createOrderParams, upgrade._id);
  const dispatch = useDispatch();
  const updateUpgradeCount = (upgradeCount: number) =>
    dispatch(
      OrderActions.updateUpgradeCount(
        event,
        upgrade._id as string,
        upgradeCount
      )
    );

  const availableWithTicketTypes: ITicketType[] = event.ticketTypes.filter(
    (t) => upgrade.ticketTypeIds.includes(t._id as string)
  );

  const availableWith =
    availableWithTicketTypes.length &&
    availableWithTicketTypes.length !== event.ticketTypes.length
      ? `Available with ${availableWithTicketTypes
          .map((t) => t.name)
          .join(", ")} tickets`
      : "";

  return (
    <Product
      title={upgrade.name}
      price={upgrade.price}
      isRSVP={EventUtil.isRSVP(event)}
      subtitle={availableWith}
      description={upgrade.description}
      // Counter Props
      value={upgradeCount}
      minValue={0}
      maxValue={
        overRideMaxUpg !== -1 ? Number(overRideMaxUpg) : upgrade.purchaseLimit
      }
      remainingQty={upgrade.remainingQty}
      onIncrement={() => updateUpgradeCount(upgradeCount + 1)}
      onDecrement={() => updateUpgradeCount(upgradeCount - 1)}
    />
  );
  ``;
};

export default UpgradeProduct;
