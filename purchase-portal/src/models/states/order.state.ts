import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import ICreateOrderParams, {
  ICreateOrderTicketParams,
  ICreateOrderUpgradeParams,
} from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IOrderCustomField from "@sellout/models/.dist/interfaces/IOrderCustomField";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";

export function createOrderState(): ICreateOrderParams {
  return {
    userId: "",
    orgId: "",
    eventId: "",
    tickets: [],
    upgrades: [],
    // discount: "",
    type: OrderTypeEnum.Paid,
    channel: OrderChannelEnum.Online,
    promotionCode: "",
    discountCode: "",
    customFields: [],
    paymentMethodType: PaymentMethodTypeEnum.CardEntry,
    paymentIntentId: "",
    discountAmount:0
  };
}

export function createOrderTicketState(
  event: Required<IEvent>,
  ticketTypeId: string,
  ticketTierId: string,
  isComplimentary: boolean,
  seat?: string,
  overRideMax?: number
): ICreateOrderTicketParams {
  const { ticketTypes } = event;
  const ticket = ticketTypes.find((t) => t._id === ticketTypeId) as ITicketType;
  const tier = ticket.tiers.find((t) => t._id === ticketTierId) as ITicketTier;
  const name = ticket.name;
  const price = isComplimentary ? 0 : tier.price;
  const origionalPrice = isComplimentary ? 0 : tier.price;
  const rollFees = ticket.rollFees;
  const description = ticket.description;
  const values = ticket.values;
  const dayIds = ticket.dayIds;
  const teiMemberId = "";
  const isMemberIdValid = false;
  const guestTicket = false;
  return {
    name,
    ticketTypeId,
    ticketTierId,
    price,
    origionalPrice,
    rollFees,
    seat,
    description,
    values,
    dayIds,
    teiMemberId,
    isMemberIdValid,
    guestTicket
  };
}

export function createOrderUpgradeState(
  event: Required<IEvent>,
  upgradeId: string,
  isComplimentary: boolean
): ICreateOrderUpgradeParams {
  const upgrade = event.upgrades.find(
    (u) => u._id === upgradeId
  ) as IEventUpgrade;
  const name = upgrade.name;
  const price = isComplimentary ? 0 : upgrade.price;
  const rollFees = upgrade.rollFees;
  const description = upgrade.description;
  return {
    name,
    upgradeId,
    price,
    rollFees,
    description,
  };
}

export function orderCustomFieldState(
  label: string,
  value: string | number,
  customFieldId: string,
  type: CustomFieldTypeEnum
): IOrderCustomField {
  return {
    label,
    value,
    customFieldId,
    type,
  };
}
