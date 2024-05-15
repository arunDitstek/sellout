import IAddress from "./IAddress";

export default interface IVenue {
  _id?: string;
  orgId?: string;
  name: string;
  description: string;
  capacity: number;
  tax?: string;
  url?: string;
  imageUrls?: string[];
  venueGlobalId?: string;
  address: IAddress;
}
