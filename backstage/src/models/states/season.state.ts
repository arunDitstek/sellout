import * as Time from "@sellout/utils/.dist/time";
import ISeason, {
  ISeasonGraphQL,
  SendQRCodeEnum,
  SeasonAgeEnum,
  SeasonTaxDeductionEnum,
} from "@sellout/models/.dist/interfaces/ISeason";
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
import { NEW_SEASON_ID } from "../../redux/reducers/season.reducer";
import * as DefaultImage from "../../utils/DefaultImage";
import IAnalytics from "@sellout/models/.dist/interfaces/IAnalytics";
import { EventTypeEnum } from "@sellout/models/.dist/interfaces/IEvent";

export default function seasonState(_id = NEW_SEASON_ID): ISeasonGraphQL {
  return {
    _id,
    orgId: "",
    name: "",
    subtitle: "",
    description: "",
    userAgreement: "",
    posterImageUrl: DefaultImage.getEventImage(EventTypeEnum.GeneralEvent),
    venueId: "",
    createdAt: 0,
    publishable: false,
    age: SeasonAgeEnum.AllAges,
    taxDeduction: false,
    sendQRCode: SendQRCodeEnum.UponOrder,
    location: addressState(),
    schedule: eventSchedule(),
    performances: [performanceState()],
    // ticketTypes: [ticketTypeState(shortid.generate(), "General Admission")],
    ticketTypes: [],
    holds: [],
    // upgrades: [],
    customFields: [],
    promotions: [],
    exchange: ticketExchanceState(),
    fees: [],
    hasOrders: false,
    analytics: {} as IAnalytics,
    salesBeginImmediately: true,
    isGuestTicketSale: false
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

export function seasonPromotionState(
  _id: string = shortid.generate(),
  code: string = "",
  startsAt: number = Time.now(),
  endsAt: number = Time.now()
): IEventPromotion {
  return {
    _id,
    code,
    type: EventPromotionTypeEnum.PreSale,
    overRideMax:0,
    overRideMaxUpg:0,
    totalQty: 0,
    remainingQty: 0,
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

export function seasonCustomFieldState(
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
