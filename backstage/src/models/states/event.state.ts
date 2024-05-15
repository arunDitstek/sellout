import * as Time from "@sellout/utils/.dist/time";
import {
  IEventGraphQL,
  EventTypeEnum,
  EventProcessAsEnum,
  SendQRCodeEnum,
  EventAgeEnum,
  EventTicketDelivery,
} from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import ITicketExchange, {
  TicketExchangeAllowedEnum,
} from "@sellout/models/.dist/interfaces/ITicketExchange";
import IEventUpgrade, {
  UpgradeTypeComplimentaryWithEnum,
} from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
import IEventPromotion, {
  EventPromotionTypeEnum,
  EventPromotionDiscountTypeEnum,
  EventPromotionAppliesToEnum,
} from "@sellout/models/.dist/interfaces/IEventPromotion";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import addressState from "./address.state";
import shortid from "shortid";
import { NEW_EVENT_ID } from "../../redux/reducers/event.reducer";
import * as DefaultImage from "../../utils/DefaultImage";
import IAnalytics from "@sellout/models/.dist/interfaces/IAnalytics";
import ITicketHold from "@sellout/models/.dist/interfaces/ITicketHold";

export default function eventState(_id = NEW_EVENT_ID): IEventGraphQL {
  return {
    _id,
    orgId: "",
    type: EventTypeEnum.GeneralEvent,
    name: "",
    subtitle: "",
    seasonId: "",
    description: "",
    userAgreement: "",
    posterImageUrl: DefaultImage.getEventImage(EventTypeEnum.GeneralEvent),
    venueId: "",
    createdAt: 0,
    publishable: false,
    age: EventAgeEnum.AllAges,
    taxDeduction: false,
    processAs: EventProcessAsEnum.Paid,
    sendQRCode: SendQRCodeEnum.UponOrder,
    location: addressState(),
    schedule: eventSchedule(),
    performances: [performanceState()],
    // ticketTypes: [ticketTypeState(shortid.generate(), "General Admission")],
    ticketTypes: [],
    holds: [],
    upgrades: [],
    customFields: [],
    promotions: [],
    exchange: ticketExchanceState(),
    artists: [],
    fees: [],
    hasOrders: false,
    analytics: {} as IAnalytics,
    salesBeginImmediately: true,
    isMultipleDays: false,
    totalDays: "1",
    ticketDeliveryType: EventTicketDelivery.Digital as EventTicketDelivery,
    physicalDeliveryInstructions: "",
    isGuestTicketSale: false,
    guestTicketPerMember: "",
    subscription: [],
    isHold: false,
    stub: "",
    waitList:[]
  };
}

const eventStartsAt = () => Time.fromStartOfDay(20 * Time.HOUR) + 30 * Time.DAY;
const eventEndsAt = () => eventStartsAt() + 3 * Time.HOUR;

export function eventSchedule(): IEventSchedule {
  return {
    announceAt: Time.now(),
    ticketsAt: Time.now(),
    ticketsEndAt: eventEndsAt(),
    startsAt: eventStartsAt(),
    endsAt: eventEndsAt(),
  };
}

export function performanceState(): IPerformance {
  return {
    _id: "",
    name: "",
    headliningArtistIds: [],
    openingArtistIds: [],
    venueId: "",
    venueStageId: "",
    price: 0,
    posterImageUrl: "",
    videoLink: "",
    songLink: "",
    schedule: [
      {
        doorsAt: eventStartsAt() - 1 * Time.HOUR,
        startsAt: eventStartsAt(),
        endsAt: eventEndsAt(),
      },
    ],
  };
}

export function ticketTierState(
  _id: string = shortid.generate(),
  name: string = "",
  price: number = 0,
  startsAt: number | null,
  endsAt: number | null,
  totalQty: number = 0
): ITicketTier {
  return {
    _id,
    name,
    price,
    startsAt: startsAt,
    endsAt: endsAt,
    totalQty: totalQty,
    remainingQty: totalQty,
  };
}

export function ticketTypeState(
  _id: string = shortid.generate(),
  name: string = "",
  qty: number = 0
): ITicketType {
  return {
    _id,
    name,
    promo: "",
    totalQty: qty,
    remainingQty: qty,
    purchaseLimit: 8,
    visible: true,
    performanceIds: [],
    dayIds: [],
    // tiers: [ticketTierState(shortid.generate(), "Day of Show", 0, eventStartsAt(), eventEndsAt(), qty)],
    tiers: [
      ticketTierState(
        shortid.generate(),
        "Advance",
        0,
        eventStartsAt(),
        eventEndsAt(),
        qty
      ),
    ],
    // tiers: [ticketTierState("0", "Advance", price), ticketTierState("1", "Day of Show", price)],
    description: "",
    rollFees: false,
    values: "0",
  };
}

export function upgradeState(
  _id: string = shortid.generate(),
  name: string = "",
  ticketTypeIds: string[] = []
): IEventUpgrade {
  return {
    _id,
    name,
    price: 0,
    totalQty: 0,
    remainingQty: 0,
    purchaseLimit: 8,
    complimentary: false,
    complimentaryWith: UpgradeTypeComplimentaryWithEnum.Order,
    complimentaryQty: 1,
    ticketTypeIds,
    imageUrl: "",
    description: "",
    visible: true,
    rollFees: false,
  };
}

export function eventPromotionState(
  _id: string = shortid.generate(),
  code: string = "",
  startsAt: number = Time.now(),
  endsAt: number = Time.now()
): IEventPromotion {
  return {
    _id,
    code,
    type: EventPromotionTypeEnum.PreSale,
    totalQty: 0,
    remainingQty: 0,
    overRideMax: 0,
    overRideMaxUpg: 0,
    ticketTypeIds: [],
    upgradeIds: [],
    active: true,
    startsAt,
    endsAt,
    useLimit: 1,
    discountType: EventPromotionDiscountTypeEnum.Flat,
    discountValue: 0,
    appliesTo: EventPromotionAppliesToEnum.PerTicket
  };
}

export function eventCustomFieldState(
  _id: string = shortid.generate(),
  label: string = "",
  type: CustomFieldTypeEnum = CustomFieldTypeEnum.Text
): IEventCustomField {
  return {
    _id,
    label,
    type,
    minLength: 0,
    maxLength: 0,
    minValue: 0,
    maxValue: 0,
    options: [],
    required: false,
    active: true,
  };
}

export function ticketExchanceState(): ITicketExchange {
  return {
    allowed: TicketExchangeAllowedEnum.Always,
    percent: 0,
  };
}

export function ticketHoldsState(_id: string = shortid.generate()): ITicketHold {
  return {
    _id,
    name: "",
    qty: 0,
    ticketType: '',
    totalHeld: 0,
    totalCheckedIn: 0,
    totalReleased: 0,
    totalOutstanding: 0,
    ticketTypeId: '',
    ticketRemaining: 0
  };
}
