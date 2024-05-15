import IAddress from "./IAddress";

export enum TicketFormatAsEnum {
  Standard = "Standard",
  RCSC = "RCSC",
}

export default interface IOrganization {
  _id?: string;
  userId?: string;
  createdAt?: number;
  authyId?: string;
  stripeId?: string;
  orgName?: string;
  orgUrls?: string[];
  address?: IAddress;
  orgLogoUrl?: string;
  orgColorHex?: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  facebookPixelId?: string;
  googleAnalyticsId?: string;
  isSeasonTickets?: boolean;
  isTegIntegration?: boolean;
  validateMemberId?:boolean;
  tegClientID?: string;
  tegSecret?: string;
  tegURL?: string;
  ticketFormat?: string;
  locationId?: string;
}
