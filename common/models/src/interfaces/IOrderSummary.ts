import { OrderStateEnum } from './IOrderState';

export interface IOrderSummaryItem {
  typeId: string;
  name: string;
  price: number;
  origionalPrice: number;
  count: number;
  scannedCount: number;
  seats?: string[];
  values?:string;
  description?:string;
  dayIds?: string[];
  teiMemberId?: string;
  guestTicket?: string;
}

export default interface IOrderSummary {
  state: OrderStateEnum;
  total: number | string;
  orderTotalWithRefund: number | string;
  subtotal: number | string;
  selloutFee: number | string;
  stripeFee: number | string;
  promoterFee: number | string;
  salesTaxFee: number | string;
  createdAt: number | string;
  allTickets:IOrderSummaryItem[];
  tickets: IOrderSummaryItem[];
  upgrades: IOrderSummaryItem[];
  ticketsScanned?: number;
  totalTickets?: number;
  upgradesScanned?: number;
  totalUpgrades?: number;
  orgName?: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  userPhoneNumber?: string;
  eventName?: string;
  venueNames?: string[];
  venueName?: string;
  artistNames?: string[];
  aritstName?: string;
}
