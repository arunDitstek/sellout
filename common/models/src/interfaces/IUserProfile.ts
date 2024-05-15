import IAddress from "./IAddress";
import IAnalytics from "./IAnalytics";
import IStripeCustomer from './IStripeCustomer';
import IUser from "./IUser";


export default interface IUserProfile {
  _id?: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  authyId?: string;
  stripeCustomerId?: string;
  imageUrl?: string;
  orgIds?: string[];
  eventIds?: string[];
  venueIds?: string[];
  artistIds?: string[];
  address?: IAddress;
}


export interface IUserProfileGraphQL extends IUserProfile {
  user: IUser;
  stripeCustomer: IStripeCustomer;
  analytics: IAnalytics;
}




export interface IUserMetric {
  _id?: string;
  orgId: string;
  lifeTimeValue: number;
  yearToDateValue: number;
  lifeTimeTicketsPurchased: number;
  yearToDateTicketsPurchased: number;
  lifeTimeUpgradesPurchased: number;
  yearToDateUpgradesPurchased: number;
  lifeTimeOrdersPurchased: number;
  yearToDateOrdersPurchased: number;
  createdAt: number;
  eventIds :[string]
}

export default interface IUserProfile {
  _id?: string;
  userId: string;
  authyId?: string;
  stripeCustomerId?: string;
  imageUrl?: string;
  metrics?: IUserMetric[];
  orgIds?: string[];
  eventIds?: string[];
  venueIds?: string[];
  artistIds?: string[];
  address?: IAddress;
}

