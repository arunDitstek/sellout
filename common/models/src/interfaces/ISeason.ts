import IAddress from "./IAddress";
import IOrganization from "./IOrganization";
import { IWebFlowEntity } from "./IWebFlow";
import ITicketType from "./ITicketType";
import IEventSchedule from "./IEventSchedule";
import ITicketExchange from "./ITicketExchange";
import IEventUpgrade from "./IEventUpgrade";
import ITicketHold from "./ITicketHold";
import IPerformance from "./IPerformance";
import IEventPromotion from "./IEventPromotion";
import IEventCustomField from "./IEventCustomField";
import IAnalytics from "./IAnalytics";
import IFee from "./IFee";
import IVenue from "./IVenue";
import IEvent from "./IEvent";

// export enum SeasonTypeEnum {
//   GeneralEvent = "General Event", // TODO // BACKFILL
//   Concert = "Concert",
// }

export enum SeasonAgeEnum {
  AllAges = "All ages welcome",
  EighteenPlus = "18+",
  TwentyOnePlus = "21+",
}

export enum SeasonTaxDeductionEnum {
  false = "No",
  true = "Yes",
}
export enum SendQRCodeEnum {
  UponOrder = "Upon order",
  TwoWeeksBefore = "Two weeks before show",
  DayOfShow = "Day of Show",
}

export enum SeasonSaleTaxEnum {
  SalesTax = "Sales tax",
}

export enum SeasonTypeEnum {
  GeneralEvent = "General Event", // TODO // BACKFILL
  Concert = "Concert",
}

export default interface ISeason {
  _id?: string;
  orgId: string;
  //type: SeasonTypeEnum;
  name?: string;
  subtitle?: string;
  description?: string;
  posterImageUrl?: string;
  venueId?: string;
  createdAt: number;
  publishable?: boolean;
  seatingChartKey?: string;
  age?: SeasonAgeEnum;
  taxDeduction?: boolean;
  active?: boolean;
  userAgreement?: string;
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
  cancel?: boolean;
  fees: IFee[];
  numberOfEvent?: number;
  eventIds?: string[];
  organization?: IOrganization;
  isGuestTicketSale?: boolean;
}

export interface ISeasonGraphQL extends ISeason {
  organization?: IOrganization;
  venue?: IVenue;
  fees: IFee[];
  webFlowEntity?: IWebFlowEntity;
  seatingPublicKey?: string;
  hasOrders: boolean;
  analytics: IAnalytics;
  events?: IEvent;
}
