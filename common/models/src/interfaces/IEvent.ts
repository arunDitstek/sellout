import IVenue from "./IVenue";
import IOrganization from "./IOrganization";
import IArtist from "./IArtist";
import IFee from "./IFee";
import { IWebFlowEntity } from "./IWebFlow";

import ITicketType from "./ITicketType";
import IEventSchedule from "./IEventSchedule";
import ITicketExchange from "./ITicketExchange";
import IEventUpgrade from "./IEventUpgrade";
import ITicketHold from "./ITicketHold";
import IPerformance from "./IPerformance";
import IEventPromotion from "./IEventPromotion";
import IEventCustomField from "./IEventCustomField";
import IAddress from "./IAddress";
import IAnalytics from "./IAnalytics";
import ISalesReport from "./ISalesReport";
import IWaitList from "./ISalesReport";

export enum EventTypeEnum {
  GeneralEvent = "General Event", // TODO // BACKFILL
  // BasicEvent = 'Basic Event',
  Concert = "Concert",
  // Festival = 'Festival',
  // TEDx = 'TEDx',
  // DinnerParty = 'Dinner Party',
  // Conference = 'Conference',
  // FilmScreening = 'Film Screening',
  // VirtualEvent = 'Virtual Event',
  // StandUpComedy = 'StandUp Comedy',
  // Rodeo = 'Rodeo',
  // ImprovComedy = 'Improv Comedy',
  // Class = 'Class',
  // WorkShop = 'Workshop',
}

export enum EventAgeEnum {
  AllAges = "All ages welcome",
  EighteenPlus = "18+",
  TwentyOnePlus = "21+",
}

export enum EventTicketDelivery {
  Digital = "Digital only",
  Physical = "Will-call only",
  Both = "Both digital and will-call",
}

export enum EventTaxDeductionEnum {
  false = "No",
  true = "Yes",
}
export enum SendQRCodeEnum {
  UponOrder = "Upon order",
  TwoWeeksBefore = "Two weeks before show",
  DayOfShow = "Day of Show",
}

export enum EventProcessAsEnum {
  Paid = "Paid",
  RSVP = "RSVP",
  // Free = 'Free',
}

export enum EventSaleTaxEnum {
  SalesTax = "Sales tax",
}

export default interface IEvent {
  _id?: string;
  orgId: string;
  type: EventTypeEnum;
  name?: string;
  subtitle?: string;
  description?: string;
  posterImageUrl?: string;
  venueId?: string;
  createdAt: number;
  publishable?: boolean;
  seatingChartKey?: string;
  age?: EventAgeEnum;
  taxDeduction?: boolean;
  active?: boolean;
  userAgreement?: string;
  processAs?: EventProcessAsEnum;
  sendQRCode?: SendQRCodeEnum;
  location?: IAddress;
  schedule?: IEventSchedule;
  performances?: IPerformance[];
  ticketTypes?: ITicketType[];
  holds?: ITicketHold[];
  upgrades?: IEventUpgrade[];
  promotions?: IEventPromotion[];
  customFields?: IEventCustomField[];
  exchange?: ITicketExchange;
  published?: boolean;
  salesBeginImmediately?: boolean;
  isMultipleDays?: boolean;
  totalDays?: string;
  cancel?: boolean;
  fees: IFee[];
  seasonId?: string;
  ticketDeliveryType?: EventTicketDelivery;
  physicalDeliveryInstructions?: string;
  isGuestTicketSale?: boolean;
  guestTicketPerMember?: string;
  organization?: IOrganization;
  subscription: ISalesReport[];
  isHold?: boolean;
  stub?: string;
  waitList: IWaitList[];
}

export interface IEventGraphQL extends IEvent {
  organization?: IOrganization;
  venue?: IVenue;
  fees: IFee[];
  artists: IArtist[];
  webFlowEntity?: IWebFlowEntity;
  seatingPublicKey?: string;
  hasOrders: boolean;
  analytics: IAnalytics;
}
