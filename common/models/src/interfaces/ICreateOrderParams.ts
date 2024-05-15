import IOrderCustomField from "../interfaces/IOrderCustomField";
import { OrderTypeEnum } from "../interfaces/IOrderType";
import { OrderChannelEnum } from "../enums/OrderChannelEnum";
import { PaymentMethodTypeEnum } from "../enums/PaymentMethodTypeEnum";
import IScan from "../interfaces/IScan";
import ITeiMemberInfo  from "./ITeiMemberInfo";
import IFee from "./IFee";

export default interface ICreateOrderParams {
  userId: string;
  orgId: string;
  eventId?: string;
  seasonId?: string;
  discount?:string;
  // discountAmount?:string
  tickets: ICreateOrderTicketParams[];
  upgrades: ICreateOrderUpgradeParams[];
  fees?: IFee[];
  type: OrderTypeEnum;
  channel: OrderChannelEnum;
  promotionCode: string;
  discountCode: string;
  customFields: IOrderCustomField[];
  paymentMethodType: PaymentMethodTypeEnum;
  paymentIntentId: string;
  holdToken?: string;
  eventIds?: string[];
  hidden?: boolean;
  parentSeasonOrderId?:string;
  discountAmount:number;
}

export interface ICreateOrderTicketParams {
  name: string;
  ticketTypeId: string;
  ticketTierId: string;
  price: number;
  origionalPrice:number;
  rollFees: boolean;
  seat?: string;
  description?: string;
  values?: string;
  dayIds?: string[];
  teiMemberId?: string;
  isMemberIdValid?: boolean;
  scan?: IScan[];
  teiMemberInfo?:ITeiMemberInfo;
  guestTicket? : boolean;
}

export interface ICreateOrderUpgradeParams {
  name: string;
  upgradeId: string;
  price: number;
  rollFees: boolean;
  description?: string;
}

export interface IOrderTicketRestrictedParams {
  eventId?: string;
  seasonId?: string;
  guestTicketCounts?: any[];
}


 
