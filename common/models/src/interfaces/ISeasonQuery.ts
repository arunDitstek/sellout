export enum SeasonQuerySortByEnum {
    CreatedAt = 'createdAt',
    StartsAt  = 'schedule.startsAt',
  };
  
  export enum SeasonQueryOrderByEnum {
    Ascending = -1,
    Descending = 1,
  }
  
  export default interface ISeasonQuery {
    orgId?: string;
    name?: string;
    seasonIds?: string[];
    venueIds?: string[];
    artistIds?: string[];
    userIds?: string[];
    startDate?: number;
    endDate?: number;
    sortBy?: SeasonQuerySortByEnum;
    orderBy?: SeasonQueryOrderByEnum;
    published?: boolean;
    cancel?: boolean;
    any?: boolean;
  }