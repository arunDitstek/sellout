import IAddress from "./IAddress";
import IPayment from './IPayment';
import IOrderTicket from './IOrderTicket';
import IOrderUpgrade from './IOrderUpgrade';
import IOrderCustomField from './IOrderCustomField'
import { OrderStateEnum } from './IOrderState';
import { OrderTypeEnum } from './IOrderType';
import { OrderChannelEnum } from '../enums/OrderChannelEnum';
import IProcessingFee from './IProcessingFees';
import IUser from "./IUser";
import IFee from "./IFee";
import IEvent from "./IEvent";
import IVenue from "./IVenue";
import ISeason from "./ISeason";


export default interface IOrder {
  _id?: string;
  secretId?: string;
  orgId: string;
  userId: string;
  eventId?: string;
  seasonId?: string;
  eventName: string;
  venueIds: string[];
  artistIds: string[];
  feeIds: string[]; // BACKFILL
  fees: IFee[];
  stripeChargeId?: string; // BACKFILL
  tickets: IOrderTicket[];
  upgrades: IOrderUpgrade[];
  recipientEmails?: string[];
  qrCodeUrl?: string;
  state?: OrderStateEnum,
  refundedAmount?: number; // BACKFILL
  type?: OrderTypeEnum;
  channel: OrderChannelEnum,
  createdAt?: number;
  createdBy?: string;
  promotionCode?: string;
  discountCode?: string;
  ipAddress?: string;
  address?: IAddress;
  tax?: number;
  customFields?: IOrderCustomField[];
  refundReason?: string; // BACKFILL
  payments: IPayment[];
  processingFee?: IProcessingFee;
  email?: string,
  hidden?: boolean;
  printed?: boolean;
  parentSeasonOrderId?: string;
  cancelReason?: string;
  promoterFee?: IProcessingFee;
  discountAmount?: number,
  discount?:string
};

export interface IEventGraphQL extends IEvent {
  venue?: IVenue;
}

export interface ISeasonGraphQL extends ISeason {
  venue?: IVenue;
}

export interface IOrderGraphQL extends IOrder {
  user: IUser;
  fees: IFee[];
  event: IEventGraphQL;
  season: ISeasonGraphQL;
};

export interface ITicketRestriction  extends IOrder{
  eventId?:string;
  seasonId?:string;
  teiMemberId?:string[];

}
