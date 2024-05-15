import IAnalytics, {
  AnalyticsDurationEnum,
  AnalyticsIntervalEnum,
  AnalyticsTypeEnum,
  AnalyticsValueTypeEnum,
  EventAnalyticsEnum,
  ICoordinate,
  UserAnalyticsEnum,
} from "../interfaces/IAnalytics";
import IOrder from "../interfaces/IOrder";
import IOrderTicket from "../interfaces/IOrderTicket";
import IOrderUpgrade from "../interfaces/IOrderUpgrade";
import { OrderTypeEnum } from "../interfaces/IOrderType";
// import { OrderStateEnum } from "../interfaces/IOrderState";
import * as Time from "@sellout/utils/.dist/time";
import * as Price from '@sellout/utils/.dist/price';
// import { number } from "@hapi/joi";

interface IDuration {
  startsAt: number;
  endsAt: number;
}

const sum = (array: number[]) => (array.length ? array.pop() + sum(array) : 0);

const makeArray = (intervalNum: number) => new Array(intervalNum).fill(0);

type SumFn = (orders: IOrder[]) => any;

const makeCoordinates = (
  orders: IOrder[],
  intervalInfo: IntervalInfo,
  sumFn: SumFn
) => {
  const { startDate, intervalLength, intervalNum, interval } = intervalInfo;

  const coordinates = makeArray(intervalNum).map((_, index) => {
    // set x to beginning second of interval
    let x: number;
    switch (interval) {
      case AnalyticsIntervalEnum.Hour:
        x = Time.getStartOfHour(index * intervalLength + startDate);
        break;
      case AnalyticsIntervalEnum.Day:
        x = Time.getStartOfDay(index * intervalLength + startDate);
        break;
      case AnalyticsIntervalEnum.Week:
        x = Time.getStartOfWeek(index * intervalLength + startDate);
        break;
      case AnalyticsIntervalEnum.Month:
        x = Time.getStartOfMonth(index * intervalLength + startDate);
        break;
      case AnalyticsIntervalEnum.Year:
        x = Time.getStartOfYear(index * intervalLength + startDate);
        break;
      default:
        x = Time.getStartOfDay(index * intervalLength + startDate);
        break;
    }

    const filteredOrder = orders
      .filter((order) => {
        const createdAt = order.createdAt as number;
        return x <= createdAt && createdAt < x + intervalLength;
      })

    const y = sumFn(filteredOrder);

    return {
      x,
      y,
    };
  });

  // quick solution to remove duplicated coordinates
  // real issue is probably above..
  const uniqueCoords = Array.from(new Set(coordinates.map(a => a.x)))
    .map(x => {
      return coordinates.find(a => a.x === x)
    });
  return uniqueCoords as ICoordinate[];
};

const makeAnalytics = (
  type: AnalyticsTypeEnum,
  orders: IOrder[],
  intervalInfo: IntervalInfo,
  valueType: AnalyticsValueTypeEnum,
  coordinatesSumFn: SumFn,
  segmentTypes?: string[],
  segmentCoordinatesHOSumFn?: (segmentType: string) => SumFn
) => {
  const { interval, intervalOptions } = intervalInfo;
  const segments =
    segmentTypes?.map(
      (segmentType: string): IAnalytics => {
        const coordinates = segmentCoordinatesHOSumFn
          ? makeCoordinates(
            orders,
            intervalInfo,
            segmentCoordinatesHOSumFn(segmentType)
          )
          : [];

        const segment: IAnalytics = {
          label: segmentType,
          interval: interval,
          intervalOptions: intervalOptions,
          coordinates,
          segments: [],
          type: valueType,
        };

        return segment;
      }
    ) ?? [];

  const coordinates = makeCoordinates(orders, intervalInfo, coordinatesSumFn);

  const analytics: IAnalytics = {
    label: type,
    interval: interval,
    intervalOptions: intervalOptions,
    coordinates,
    segments,
    type: valueType,
  };

  return analytics;
};


const MAX_INTERVALS = 60;

const intervalMap = {
  [AnalyticsIntervalEnum.Hour]: 60 * 60,
  [AnalyticsIntervalEnum.Day]: 60 * 60 * 24,
  [AnalyticsIntervalEnum.Week]: 60 * 60 * 24 * 7,
  [AnalyticsIntervalEnum.Month]: 60 * 60 * 24 * 30,
  [AnalyticsIntervalEnum.Year]: 60 * 60 * 24 * 365,
};

const intervalsMap = {
  [AnalyticsIntervalEnum.Hour]: [AnalyticsIntervalEnum.Hour, AnalyticsIntervalEnum.Day],
  [AnalyticsIntervalEnum.Day]: [AnalyticsIntervalEnum.Day, AnalyticsIntervalEnum.Week],
  [AnalyticsIntervalEnum.Week]: [AnalyticsIntervalEnum.Week, AnalyticsIntervalEnum.Month],
  [AnalyticsIntervalEnum.Month]: [AnalyticsIntervalEnum.Month, AnalyticsIntervalEnum.Year],
  [AnalyticsIntervalEnum.Year]: [AnalyticsIntervalEnum.Year],
};

const maxDuration = (interval: AnalyticsIntervalEnum): number => {
  return intervalMap[interval] * MAX_INTERVALS;
}

const getIntervalFromDuration = (duration: number): AnalyticsIntervalEnum => {
  const maxHour = maxDuration(AnalyticsIntervalEnum.Hour);
  const maxDay = maxDuration(AnalyticsIntervalEnum.Day);
  const maxWeek = maxDuration(AnalyticsIntervalEnum.Week);
  const maxMonth = maxDuration(AnalyticsIntervalEnum.Month);

  if (duration <= maxHour) {
    return AnalyticsIntervalEnum.Hour;
  } else if (duration <= maxDay) {
    return AnalyticsIntervalEnum.Day;
  } else if (duration <= maxWeek) {
    return AnalyticsIntervalEnum.Week
  } else if (duration <= maxMonth) {
    return AnalyticsIntervalEnum.Month;
  } else {
    return AnalyticsIntervalEnum.Year;
  }
}

type IntervalInfo = {
  startDate: number;
  endDate: number;
  duration: number;
  interval: AnalyticsIntervalEnum;
  intervalOptions: AnalyticsIntervalEnum[];
  intervalLength: number;
  intervalNum: number;
};

const getIntervalInfo = (
  orders: IOrder[],
  startDate?: number,
  endDate?: number,
  interval?: AnalyticsIntervalEnum,
): IntervalInfo => {
  startDate = startDate || orders[orders.length - 1]?.createdAt as number || Time.getStartOfCurrentDay();
  endDate = endDate || orders[0]?.createdAt as number || Time.getEndOfCurrentDay();

  if (startDate === endDate) {
    endDate = Time.getEndOfCurrentDay();
  }

  const duration = endDate - startDate; // duration in seconds
  const intervalFromDuration = getIntervalFromDuration(duration);
  const intervalOptions = intervalsMap[intervalFromDuration];
  if (!interval) {
    interval = getIntervalFromDuration(duration);
  }

  if (!intervalOptions.includes(interval)) {
    interval = intervalOptions[0];
  }

  // Time length in seconds that each interval consists of.
  const intervalLength = intervalMap[interval];

  // Number of intervals.
  const intervalNum = Math.ceil(duration / intervalLength) + 1;

  return {
    startDate,
    endDate,
    duration,
    interval,
    intervalOptions,
    intervalLength,
    intervalNum,
  };
};

export default {
  fromOrders(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    showSegments: boolean,
    startDate?: number,
    endDate?: number,
    interval?: AnalyticsIntervalEnum,
  ): IAnalytics {
    const intervalInfo = getIntervalInfo(orders, startDate, endDate, interval);
    switch (type) {
      case AnalyticsTypeEnum.Overview:
        return this.overview(type, orders, intervalInfo);

      case AnalyticsTypeEnum.TotalSales:
        return this.totalSales(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TicketSales:
        return this.ticketSales(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TicketsSold:
        return this.ticketsSold(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TicketComps:
        return this.ticketComps(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.UpgradeSales:
        return this.upgradeSales(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.UpgradesSold:
        return this.upgradesSold(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TicketComps:
        return this.ticketComps(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.Promotions:
        return this.promotions(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TotalOrders:
        return this.totalOrders(type, orders, intervalInfo);

      case AnalyticsTypeEnum.EventAnalytics:
        return this.eventAnalytics(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.UserAnalytics:
        return this.userAnalytics(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.TicketsScanned:
        return this.ticketsScanned(type, orders, intervalInfo, showSegments);

      case AnalyticsTypeEnum.UpgradesScanned:
        return this.upgradesScanned(type, orders, intervalInfo, showSegments);
      

      default:
        return {
          label: type,
          interval: interval,
          intervalOptions: [],
          coordinates: [{ x: 0, y: 0 }],
          segments: [],
          type: AnalyticsValueTypeEnum.Quantity,
        } as IAnalytics;
    }
  },

  overview(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
  ): IAnalytics {

    const coordinatesSumFn = (orders: IOrder[]) => orders.reduce((cur, order) => {
      let total = 0
      if (order.type == OrderTypeEnum.RSVP) {
        total = sum(order.tickets.map(ticket => Number(ticket?.values) || 0)) + sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
      } else {
        total = sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price))
      }
      return cur + total
    }, 0);

    // const coordinatesSumFn = (orders: IOrder[]) =>
    //   orders
    //     // .filter(order => order.type === OrderTypeEnum.Paid)
    //     .reduce((cur, order) => cur + sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price)), 0);

    const coordinates = makeCoordinates(orders, intervalInfo, coordinatesSumFn);
    const { interval, intervalOptions } = intervalInfo;


    let segments: IAnalytics[] = [];
    const coordinatesSumFn2 = (orders: IOrder[]) =>
      orders
        // .filter(order => order.type === OrderTypeEnum.Paid)
        .reduce((cur, order) => cur + order.tickets.length, 0);
    const segmentCoordinates = makeCoordinates(orders, intervalInfo, coordinatesSumFn2);
    let segment: IAnalytics = {
      label: 'Tickets Sold',
      interval: interval,
      intervalOptions: intervalOptions,
      coordinates: segmentCoordinates,
      segments: [],
      type: AnalyticsValueTypeEnum.Quantity,
    };
    segments.push(segment);
    const coordinatesSumFn3 = (orders: IOrder[]) => orders.length//sum(orders.map(order => { return order.state != OrderStateEnum.Refunded ? 1 : 0} ))
    // .reduce((cur,order) => cur + sum(order.tickets.map(ticket => { return ticket.refund.refunded == false ? 1 : 0})),0)

    // const coordinatesSumFn3 = (orders: IOrder[]) => orders.length;
    const segmentCoordinates2 = makeCoordinates(orders, intervalInfo, coordinatesSumFn3);
    segment = {
      label: 'Orders',
      interval: interval,
      intervalOptions: intervalOptions,
      coordinates: segmentCoordinates2,
      segments: [],
      type: AnalyticsValueTypeEnum.Quantity,
    };
    segments.push(segment);

    const analytics: IAnalytics = {
      label: 'Total Sales',
      interval: interval,
      intervalOptions: intervalOptions,
      coordinates,
      segments,
      type: AnalyticsValueTypeEnum.Currency,
    };

    return analytics;
  },

  totalSales(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {

    const coordinatesSumFn = (orders: IOrder[]) => orders.reduce((cur, order) => {
      let total = 0
      if (order.type == OrderTypeEnum.RSVP) {
        total = sum(order.tickets.map(ticket => Number(ticket?.values) || 0)) + sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
      } else {
        total = sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price))
      }
      return cur + total
    }, 0);

    // const coordinatesSumFn = (orders: IOrder[]) =>
    //   orders
    //     // .filter(order => order.type === OrderTypeEnum.Paid)
    //     .reduce((cur, order) => cur + sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price)), 0);


    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    // if (showSegments) {
    //   segmentTypes = Object.keys(
    //     orders
    //       .reduce((cur, next: IOrder) => {
    //         return cur.concat(next.tickets);
    //       }, [] as IOrderTicket[])
    //       .reduce((cur, next: IOrderTicket) => {
    //         cur[next.name] = true;
    //         return cur;
    //       }, {})
    //   );

    //   segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
    //     orders
    //       .filter(order => order.type === OrderTypeEnum.Paid)
    //       .reduce((cur, order) => cur + sum(
    //         order.tickets
    //           .filter((ticket) => ticket.name === segmentType)
    //           .map((ticket) => ticket.price)), 0);
    // }


    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Currency,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  ticketSales(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) => orders.reduce((cur, order) => {
      let total = 0
      if (order.type == OrderTypeEnum.RSVP) {
        total = sum(order.tickets.map(ticket => Number(ticket?.values) || 0)) || 0
        // total = sum(order.tickets.map(ticket => Number(ticket?.values)|| 0)) + sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
      } else {
        total = sum(order.tickets.map(ticket => ticket.price))
      }
      return cur + total
    }, 0);


    // const coordinatesSumFn = (orders: IOrder[]) =>
    //   orders
    //     // .filter(order => order.type === OrderTypeEnum.Paid)
    //     .reduce((cur, order) => cur + sum(order.tickets.map(ticket => ticket.price)), 0);

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.tickets);
          }, [] as IOrderTicket[])
          .reduce((cur, next: IOrderTicket) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) => {
        //   const ordersData = orders
        //     // .filter(order => order.type === OrderTypeEnum.Paid)
        //     .reduce((cur, order) => cur + sum(
        //       order.tickets
        //         .filter((ticket) => ticket.name === segmentType)
        //         .map((ticket) => ticket.price)), 0);

        //   return ordersData
        // }

        const ordersData = orders.reduce((cur, order) => {
          let total;
          if (order.type == OrderTypeEnum.RSVP) {
            total = sum(order.tickets.filter((ticket) => ticket.name === segmentType).map(ticket => Number(ticket?.values) || 0))
          } else {
            total = sum(order.tickets.filter((ticket) => ticket.name === segmentType).map(ticket => Number(ticket?.price) || 0))
          }
          return cur + total
        }, 0);
        return ordersData
      }

    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Currency,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  ticketsSold(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders
        // .filter(order => order.type === OrderTypeEnum.Paid)
        .reduce((cur, order) => cur + order.tickets.length, 0);
        

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.tickets);
          }, [] as IOrderTicket[])
          .reduce((cur, next: IOrderTicket) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          // .filter(order => order.type === OrderTypeEnum.Paid)
          .reduce((cur, order) =>
            cur + order.tickets.filter((ticket) => ticket.name === segmentType).length, 0);
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  ticketsScanned(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    let count = 0;
    const coordinatesSumFn = (orders: IOrder[]) => orders.reduce((cur, order) => {
      order?.tickets.map(ticket => {
        ticket?.scan?.map(a => {
          if (a.scanned) {
            count = count + 1
          }
        }
        )
      })
      return  count
    }, 0);
    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.tickets);
          }, [] as IOrderTicket[])
          .reduce((cur, next: IOrderTicket) => {
            cur[next.name] = true;
            return cur;
          }, {})

      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders:any) =>   orders
        .reduce((cur, order) => {
          const filteredTickets = order.tickets.filter((ticket) => {
            return ticket.name === segmentType && ticket?.scan.some(scanData => scanData.scanned === true);
          });
      
          // console.log(filteredTickets);
      
          return cur + filteredTickets.length;
        }, 0);
            
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn ,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  // upgradeScannedCount
  upgradesScanned(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    let count = 0;
    const coordinatesSumFn = (orders: any) => orders.reduce((cur, order) => {
      order?.upgrades.map(upgrade => {
        if(upgrade?.scan.scanned){
           count = count + 1
        }
      })
      return  count
    }, 0);
    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.upgrades);
          }, [] as IOrderUpgrade[])
          .reduce((cur, next: IOrderUpgrade) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );
      segmentCoordinatesHOSumFn = (segmentType: string) => (orders:any) =>   orders
      .reduce((cur, order) => {
        const filteredUpgrades = order.upgrades.filter((upgrade) => {
          return upgrade.name === segmentType && upgrade?.scan.scanned === true;
        });
    
        console.log(filteredUpgrades);
    
        return cur + filteredUpgrades.length;
      }, 0);
     
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn ,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  ticketComps(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders
        .filter(order => order.type === OrderTypeEnum.Complimentary)
        .reduce((cur, order) => cur + order.tickets.length, 0);

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.tickets);
          }, [] as IOrderTicket[])
          .reduce((cur, next: IOrderTicket) => {
            cur[next.name] = true;
            return cur;
          }, {})
          
      );


      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          .filter(order => order.type === OrderTypeEnum.Complimentary)
          .reduce((cur, order) =>
            cur + order.tickets.filter((ticket) => ticket.name === segmentType).length, 0);
    }


    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  upgradeSales(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders
        // .filter(order => order.type === OrderTypeEnum.Paid)
        .reduce((cur, order) => cur + sum(order.upgrades.map(upgrade => upgrade.price)), 0);

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.upgrades);
          }, [] as IOrderUpgrade[])
          .reduce((cur, next: IOrderUpgrade) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          // .filter(order => order.type === OrderTypeEnum.Paid)
          .reduce((cur, order) => cur + sum(
            order.upgrades
              .filter((upgrade) => upgrade.name === segmentType)
              .map((upgrade) => upgrade.price)), 0);
    }


    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Currency,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  upgradesSold(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders
        // .filter(order => order.type === OrderTypeEnum.Paid)
        .reduce((cur, order) => cur + order.upgrades.length, 0);

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.upgrades);
          }, [] as IOrderUpgrade[])
          .reduce((cur, next: IOrderUpgrade) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          // .filter(order => order.type === OrderTypeEnum.Paid)
          .reduce((cur, order) =>
            cur + order.upgrades.filter((upgrade) => upgrade.name === segmentType).length, 0);
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  upgradeComps(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {

    const coordinatesSumFn = (orders: IOrder[]) => orders.reduce((cur, order) => {
      let total = 0
      if (order.type == OrderTypeEnum.RSVP) {
        total = sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
        // total = sum(order.tickets.map(ticket => Number(ticket?.values)|| 0)) + sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
      } else {
        total = sum(order.upgrades.map(upgrade => upgrade.price))
        // total = sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price))
      }
      return cur + total
    }, 0);


    // const coordinatesSumFn = (orders: IOrder[]) =>
    //   orders
    //     .reduce((cur, order) =>
    //       cur + order.upgrades.filter(upgrade => upgrade.price === 0).length,
    //       0);

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders
          .reduce((cur, next: IOrder) => {
            return cur.concat(next.tickets);
          }, [] as IOrderTicket[])
          .reduce((cur, next: IOrderTicket) => {
            cur[next.name] = true;
            return cur;
          }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          .reduce((cur, order) =>
            cur + order.upgrades.filter((upgrade) => upgrade.name === segmentType && upgrade.price === 0).length, 0);
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  promotions(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders.filter(order => Boolean(order.promotionCode))
        .length

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = Object.keys(
        orders.reduce((cur, next: IOrder) => {
          if (next.promotionCode) cur[next.promotionCode] = true;
          return cur;
        }, {})
      );

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) =>
        orders
          .filter(order => order.promotionCode === segmentType)
          .length;
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  totalOrders(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) => orders.length
    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn
    );
  },
  eventAnalytics(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {
    const coordinatesSumFn = (orders: IOrder[]) =>
      orders.filter(order => Boolean(order.promotionCode))
        .length;

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = [EventAnalyticsEnum.SoldOutPercentage, EventAnalyticsEnum.TotalSales];

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) => {
        switch (segmentType) {
          case EventAnalyticsEnum.SoldOutPercentage:
            return 0;
          case EventAnalyticsEnum.TotalSales:
            return calculateTotalSale(orders)

          // orders.reduce((cur: number, next: IOrder) => cur + next?.payments?.[0]?.transferAmount ?? 0, 0)
        }
      }
    }


    const calculateTotalSale = (orders) => orders
      .reduce((cur, order) => {
        let total = 0
        if (order.type == OrderTypeEnum.RSVP) {
          total = sum(order.tickets.map(ticket => Number(ticket?.values) || 0)) + sum(order.upgrades.map(upgrade => Number(upgrade?.price) || 0))
        } else {
          total = sum(order.tickets.map(ticket => ticket.price)) + sum(order.upgrades.map(upgrade => upgrade.price))
        }
        return cur + total
      }, 0);

    const data = makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
    return data
  },
  userAnalytics(
    type: AnalyticsTypeEnum,
    orders: IOrder[],
    intervalInfo: IntervalInfo,
    showSegments: boolean,
  ): IAnalytics {

    const coordinatesSumFn = (orders: IOrder[]) =>
      orders.filter(order => Boolean(order.promotionCode))
        .length;

    let segmentTypes;
    let segmentCoordinatesHOSumFn;
    if (showSegments) {
      segmentTypes = [
        UserAnalyticsEnum.EventsAttendedCount,
        UserAnalyticsEnum.TicketsPurchasedCount,
        UserAnalyticsEnum.LifeTimeValue
      ];

      segmentCoordinatesHOSumFn = (segmentType: string) => (orders: IOrder[]) => {
        switch (segmentType) {
          case UserAnalyticsEnum.EventsAttendedCount:
            return [...new Set(orders.map(order => order.eventId))].length;
          case UserAnalyticsEnum.TicketsPurchasedCount:
            return orders.reduce((cur: number, next: IOrder) => cur + next.tickets.length ?? 0, 0);
          case UserAnalyticsEnum.LifeTimeValue:
            return orders.reduce((cur: number, next: IOrder) => cur + next.payments?.[0]?.transferAmount ?? 0, 0);

        }
      }
    }

    return makeAnalytics(
      type,
      orders,
      intervalInfo,
      AnalyticsValueTypeEnum.Quantity,
      coordinatesSumFn,
      segmentTypes,
      segmentCoordinatesHOSumFn
    );
  },

  // Returns start and end date
  durationToUnix(duration: AnalyticsDurationEnum): IDuration {
    type DurationEnumToDurationMap = Record<
      AnalyticsDurationEnum,
      () => IDuration
    >;

    const durations: DurationEnumToDurationMap = {
      [AnalyticsDurationEnum.AllTime]: () => {
        const duration: IDuration = {
          startsAt: 0,
          endsAt: 0,
        };
        return duration;
      },
      [AnalyticsDurationEnum.Today]: () => {
        const duration: IDuration = {
          startsAt: Time.getStartOfCurrentDay(),
          endsAt: Time.getEndOfCurrentDay()
        };
        return duration;
      },
      [AnalyticsDurationEnum.OneWeek]: () => {
        const duration: IDuration = {
          startsAt: Time.now() - Time.DAY * 7,
          endsAt: Time.now(),
        };
        return duration;
      },
      [AnalyticsDurationEnum.OneMonth]: () => {
        const duration: IDuration = {
          startsAt: Time.now() - Time.DAY * 30,
          endsAt: Time.now(),
        };
        return duration;
      },
      [AnalyticsDurationEnum.MonthToDate]: () => {
        const duration: IDuration = {
          startsAt: Time.getStartOfCurrentMonth(),
          endsAt: Time.now(),
        };
        return duration;
      },
      [AnalyticsDurationEnum.YearToDate]: () => {
        const duration: IDuration = {
          startsAt: Time.getStartOfCurrentYear(),
          endsAt: Time.now(),
        };
        return duration;
      },
      [AnalyticsDurationEnum.OneYear]: () => {
        const duration: IDuration = {
          startsAt: Time.now() - Time.DAY * 365,
          endsAt: Time.now(),
        };
        return duration;
      },
      [AnalyticsDurationEnum.Custom]: () => {
        const duration: IDuration = {
          startsAt: 0,
          endsAt: 0,
        };
        return duration;
      },
    };

    return durations[duration]();
  },

  // Returns available intervals
  durationIntervals(interval: AnalyticsDurationEnum): AnalyticsIntervalEnum[] {
    type AnalyticsDurationToIntervalMap = Record<
      AnalyticsDurationEnum,
      () => AnalyticsIntervalEnum[]
    >;

    const intervals: AnalyticsDurationToIntervalMap = {
      [AnalyticsDurationEnum.AllTime]: (): AnalyticsIntervalEnum[] => {
        return [];
      },
      [AnalyticsDurationEnum.Today]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Hour];
      },
      [AnalyticsDurationEnum.OneWeek]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Day];
      },
      [AnalyticsDurationEnum.OneMonth]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Day, AnalyticsIntervalEnum.Week];
      },
      [AnalyticsDurationEnum.MonthToDate]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Day, AnalyticsIntervalEnum.Week];
      },
      [AnalyticsDurationEnum.YearToDate]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Week, AnalyticsIntervalEnum.Month];
      },
      [AnalyticsDurationEnum.OneYear]: (): AnalyticsIntervalEnum[] => {
        return [AnalyticsIntervalEnum.Week, AnalyticsIntervalEnum.Month];
      },
      [AnalyticsDurationEnum.Custom]: (): AnalyticsIntervalEnum[] => {
        return [];
      },
    };

    return intervals[interval]();
  },

  getDateFormat(time: any, interval: AnalyticsIntervalEnum, timezone: string = 'America/Denver') {
    switch (interval) {
      case AnalyticsIntervalEnum.Hour:
        return Time.format(time, 'h:mma', timezone);
      case AnalyticsIntervalEnum.Day:
        return Time.format(time, 'MMM DD', timezone);
      case AnalyticsIntervalEnum.Week:
        return `${Time.format(time, 'MMM DD', timezone)} - ${Time.format(time + (Time.DAY * 7), 'MMM DD', timezone)}`;
      case AnalyticsIntervalEnum.Month:
        return Time.format(time, 'MMM YYYY', timezone);
      case AnalyticsIntervalEnum.Year:
        return Time.format(time, 'YYYY', timezone);
      default:
        return Time.format(time, 'MMM DD', timezone);
    }
  },

  getTotalValue(coords: ICoordinate[]) {
    if (!coords) {
      return 0;
    }
    return coords.reduce((acc, next) => {
      return acc += next.y;
    }, 0);
  },

  getDisplayMetric(data: IAnalytics, hoverIndex?: number) {
    let val = 0;
    if (data.coordinates) {
      if (hoverIndex === undefined) {
        val = this.getTotalValue(data.coordinates);
      } else {
        let coord = data?.coordinates.find((coord: ICoordinate) => coord.x === hoverIndex);
        if (coord) val = coord.y;
      }
    }
    if (data.type === AnalyticsValueTypeEnum.Currency) {
      return `$${Price.output(val, true)}`;
    }
    return val?.toString();
  },

  getMaxXVal(dataArray: ICoordinate[]) {
    return dataArray.reduce((max: number, p: ICoordinate) => p.x > max ? p.x : max, 0);
  },

  getMinXVal(dataArray: ICoordinate[]) {
    return dataArray.reduce((min: number, p: ICoordinate) => p.x < min ? p.x : min, Infinity)
  },

  getMaxYVal(dataArray: ICoordinate[]) {
    return dataArray.reduce((max: number, p: ICoordinate) => p.y > max ? p.y : max, 0);
  }
};
