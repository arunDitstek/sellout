import ITicketTier from "./ITicketTier";
import IScan from "./IScan";
import ITeiMemberInfo from "./ITeiMemberInfo";

export default interface ITicketType {
  _id?: string;
  name: string;
  totalQty: number;
  remainingQty: number;
  purchaseLimit: number;
  overRideMax?: number;
  visible: boolean;
  performanceIds: string[];
  tiers: ITicketTier[];
  description?: string;
  rollFees: boolean;
  promo?: string;
  values?: string;
  dayIds?: string[];
  teiMemberId?: string;
  teiMemberInfo?:ITeiMemberInfo;
  isMemberIdValid?: boolean;
  scan?: IScan[];
  guestTicket?: boolean;
}
