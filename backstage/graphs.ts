
enum MetricIntervalEnum {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}

enum MetricDurationEnum {
  AllTime = 'All Time',
  Today = 'Today',
  OneWeek = 'One Week',
  OneMonth = 'One Month',
  MonthToDate = 'MTD',
  YearToDate = 'YTD',
  OneYear = 'One Year',
  Custom = 'Custom',
};


enum MetricCardTypeEnum {
  TicketSales = 'Ticket Sales',
  UpgradeSales = 'Upgrades Sales',
  ExtraFeeRevenue = 'Extra Fee Revenue',
  TicketsSold = 'Tickets Sold',
  TotalOrders = 'Total Orders',
  Promotions = 'Promotioins',
  TicketComps = 'Ticket Comps',
  UpgradeComps = 'Upgrade Comps',
  OnlineSessions = 'Online Sessions',
  OnlineConversationRate = 'Online Converstation Rate',
  AvgOrderValue = 'Avg. Order Value',
}

enum MetricValueTypeEnum {
  Quantity = 'Quantity',
  Currency = 'Currency',
  Percent = 'Percent',
}

interface IMetricParams {
  eventId?: string;
  venueId?: string;
  artistId?: string;
  startDate?: number;
  endDate?: number;
  interval?: MetricIntervalEnum;
  types: MetricCardTypeEnum[];
}

interface Coordinate {
  x: number;
  y: number;
}

interface DataPoint {
  label: string;
  interval?: MetricIntervalEnum;
  coordinates?: Coordinate[];
  segments?: DataPoint[];
  type: MetricValueTypeEnum;
  totalValue?: number;
}

const TicketSalesCard: DataPoint = {
  label: MetricCardTypeEnum.TicketSales,
  type: MetricValueTypeEnum.Currency,
  interval: MetricIntervalEnum.Hour,
  totalValue: 1000,
  coordinates: [
    {
      x: 1,
      y: 1,
    }
  ],
  segments: [
    {
      label: 'General Admission',
      type: MetricValueTypeEnum.Currency,
      totalValue: 300,
      coordinates: [
        {
          x: 1,
          y: 1,
        },
        {
          x: 2,
          y: 1,
        }
      ]
    }
  ]
}
