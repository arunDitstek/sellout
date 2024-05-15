export enum AnalyticsIntervalEnum {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}

export enum AnalyticsDurationEnum {
  AllTime = 'All time',
  Today = 'Today',
  OneWeek = 'One week',
  OneMonth = 'One month',
  MonthToDate = 'Month to date',
  YearToDate = 'Year to date',
  OneYear = 'One year',
  Custom = 'Custom dates',
};

export enum AnalyticsTypeEnum {
  Overview = 'Overview',
  TotalSales = 'Total Sales',
  TicketSales = "Ticket Sales",
  TicketsSold = "Tickets Sold",
  TicketComps = "Ticket Comps",
  TicketsScanned= "Tickets Scanned",
  UpgradesScanned = "Upgrades Scanned",
  UpgradeSales = "Upgrades Sales",
  UpgradesSold = "Upgrades Sold",
  UpgradeComps = "Upgrade Comps",
  Promotions = "Promotions",
  ScannedCounts = "Scanned Counts",
  ExtraFeeRevenue = "Extra Fee Revenue",
  TotalOrders = "Total Orders",
  AvgOrderValue = "Avg. Order Value",
  OnlineSessions = "Online Sessions",
  OnlineConversationRate = "Online Converstation Rate",
  EventAnalytics = 'Event Analytics',
  UserAnalytics = 'User Analytics'
}

export enum AnalyticsValueTypeEnum {
  Quantity = 'Quantity',
  Currency = 'Currency',
  Percent = 'Percent',
}

export interface IAnalyticsQueryParams {
  eventId?: string;
  seasonId?: string;
  venueId?: string;
  artistId?: string;
  userId?: string;
  startDate?: number;
  endDate?: number;
  interval?: AnalyticsIntervalEnum;
  types: AnalyticsTypeEnum[];
}

export interface ICoordinate {
  x: number;
  y: number;
}

export enum EventAnalyticsEnum {
  SoldOutPercentage = 'Sold Out',
  TotalSales = 'Total Sales',
}

export enum EventAnalyticsSegmentsIndexEnum {
  SoldOut = 0,
  TotalSales = 1,
}

export enum UserAnalyticsEnum {
  EventsAttendedCount = 'EventAttendedCount',
  TicketsPurchasedCount = 'TicketsPurchasedCount',
  LifeTimeValue = 'LifeTimeValue',
}

export enum UserAnalyticsSegmentsIndexEnum {
  EventsAttendedCount = 0,
  TicketsPurchasedCount = 1,
  LifeTimeValue = 2,
}

export default interface IAnalytics {
  label: string;
  interval?: AnalyticsIntervalEnum;
  intervalOptions?: AnalyticsIntervalEnum[];
  coordinates?: ICoordinate[];
  segments?: IAnalytics[];
  type: AnalyticsValueTypeEnum;
  totalValue?: number;
}


// const EventAnalytics: IAnalytics = {
//   label: AnalyticsTypeEnum.EventAnalytics,
//   type: AnalyticsValueTypeEnum.General,
//   interval: AnalyticsIntervalEnum.Hour,
//   segments: [
//     {
//       label: EventAnalyticsEnum.SoldOutPercentage,
//       type: AnalyticsValueTypeEnum.Percent,
//       coordinates: [
//         {
//           x: 1,
//           y: 68,
//         },
//       ]
//     },
//     {
//       label: EventAnalyticsEnum.TotalSales,
//       type: AnalyticsValueTypeEnum.Currency,
//       coordinates: [
//         {
//           x: 1,
//           y: 2120100,
//         },
//       ]
//     }
//   ]

// }

// const TicketSalesCard: IAnalytics = {
//   label: AnalyticsTypeEnum.TicketSales,
//   type: AnalyticsValueTypeEnum.Currency,
//   interval: AnalyticsIntervalEnum.Hour,
//   totalValue: 1000,
//   coordinates: [
//     {
//       x: 1,
//       y: 1,
//     }
//   ],
//   segments: [
//     {
//       label: 'General Admission',
//       type: AnalyticsValueTypeEnum.Currency,
//       totalValue: 300,
//       coordinates: [
//         {
//           x: 1,
//           y: 1,
//         },
//         {
//           x: 2,
//           y: 1,
//         }
//       ]
//     }
//   ]
// }
