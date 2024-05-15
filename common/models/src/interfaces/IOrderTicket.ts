import IRefund from "./IRefund";
import IScan from "./IScan";
import { OrderItemStateEnum } from "./IOrderState";
import ITeiMemberInfo  from "./ITeiMemberInfo";
export default interface IOrderTicket {
  _id?: string;
  name: string;
  ticketTypeId: string;
  ticketTierId: string;
  teiMemberId?: string;
  teiMemberInfo?:ITeiMemberInfo;
  price: number;
  origionalPrice :number
  rollFees: boolean;
  paymentId: string | null;
  seat: string;
  refund: IRefund;
  scan?: IScan[];
  state: OrderItemStateEnum;
  qrCodeUrl?: string;
  values?: string;
  description?: string;
  dayIds?: string[];
  guestTicket?: boolean;
}
