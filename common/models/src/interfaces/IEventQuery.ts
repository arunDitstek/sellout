export enum EventQuerySortByEnum {
  CreatedAt = 'createdAt',
  StartsAt  = 'schedule.startsAt',
};

export enum EventQueryOrderByEnum {
  Ascending = -1,
  Descending = 1,
}

export default interface IEventQuery {
  orgId?: string;
  name?: string;
  eventIds?: string[];
  venueIds?: string[];
  artistIds?: string[];
  userIds?: string[];
  startDate?: number;
  endDate?: number;
  sortBy?: EventQuerySortByEnum;
  orderBy?: EventQueryOrderByEnum;
  published?: boolean;
  cancel?: boolean;
  any?: boolean;
}