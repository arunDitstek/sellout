export default interface IOrderQuery {
  orgId?: string;
  orderIds?: string[];
  seasonIds?: string[];
  eventIds?: string[];
  venueIds?: string[];
  artistIds?: string[];
  userIds?: string[];
  userQuery?: string;
  eventName?: string;
  states?: string[];
  types?: string[];
  startDate?: number;
  endDate?: number;
  event?: boolean;
  season?: boolean;
  any?: boolean;
}
