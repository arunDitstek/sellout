import IEvent from '@sellout/models/.dist/interfaces/IEvent';
import IOrderTicket from '@sellout/models/.dist/interfaces/IOrderTicket';
import IOrderUpgrade from '@sellout/models/.dist/interfaces/IOrderUpgrade';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import * as Random from '@sellout/utils/.dist/random';
import Tracer from '@sellout/service/.dist/Tracer';
import IEventQuery, { EventQueryOrderByEnum, EventQuerySortByEnum } from '@sellout/models/.dist/interfaces/IEventQuery';
// import ITicketType from '@sellout/models/.dist/interfaces/ITicketType';
const tracer = new Tracer('EventStore');
import * as Time from '@sellout/utils/.dist/time';

interface IEventSearchQuery {
  name?: string;
  email?: string;
  waitList?: string[]

}

export default class EventStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Event;

  constructor(Event) {
    this.Event = Event;
  }

  public async createEvent(spanContext: string, event: IEvent): Promise<IEvent> {
    const span = tracer.startSpan('createEvent', spanContext);
    const newEvent = new this.Event(event);
    let saveEvent: IEvent;
    try {
      saveEvent = await newEvent.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveEvent;
  }

  public async listEvents(spanContext: string, query: object, pagination: IPagination): Promise<IEvent[]> {
    const span = tracer.startSpan('listEvents', spanContext);
    let events: IEvent[];
    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;

        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        events = await this.Event.find(query)
          .skip(skips)
          .limit(pageSize);
      } else {
        events = await this.Event.find(query);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return events;
  }

  public async queryEvents(spanContext: string, query: IEventQuery, pagination: IPagination): Promise<IEvent[]> {
    const span = tracer.startSpan('queryEvents', spanContext);
    let events: IEvent[];
    let finalQuery: any = {};

    if (query.name) {
      finalQuery.name = { $regex: query.name, $options: 'i' };
    }

    if (typeof query.cancel === 'boolean') {
      finalQuery['cancel'] = query.cancel;
    }

    if (query.eventIds && query.eventIds.filter(v => Boolean(v)).length) {
      finalQuery._id = { $in: query.eventIds.filter(id => Boolean(id)) };
    }

    if (query.venueIds && query.venueIds.filter(v => Boolean(v)).length) {
      finalQuery.venueId = { $in: query.venueIds.filter(v => Boolean(v)) };
    }

    // if (query.userIds && query.userIds.filter(v => Boolean(v)).length) {
    //   finalQuery.userId = { $in: query.userIds.filter(v => Boolean(v)) };
    // }

    if (query.artistIds) {
      finalQuery['performances'] = {
        $elemMatch: {
          $or: [
            { headliningArtistIds: { $in: query.artistIds } },
            { openingArtistIds: { $in: query.artistIds } },
          ]
        }
      };
    }
    // deprecated 
    // if (query.startDate) {
    //   finalQuery['schedule.startsAt'] = {
    //     $gte: query.startDate,
    //   };
    // }

    // if (query.endDate) {
    //   finalQuery['schedule.startsAt'] = {
    //     $lte: query.endDate,
    //   };
    // }

    // if (query.startDate && query.endDate) {
    //   finalQuery['schedule.startsAt'] = {
    //     $gte: query.startDate,
    //     $lte: query.endDate,
    //   };
    // }

    if (query.startDate) {
      finalQuery['schedule.endsAt'] = {
        $gte: Time.now(),
      };
    }
    if (query.endDate) {
      finalQuery['schedule.endsAt'] = {
        $lte: Time.now(),
      }
    }

    if (query.startDate && query.endDate) {
      finalQuery['schedule.startsAt'] = {
        $gte: query.startDate,
        $lte: query.endDate,
      };
    }

    if (typeof query.published === 'boolean') {
      finalQuery['published'] = query.published;
    }


    if (!query.sortBy) query.sortBy = EventQuerySortByEnum.CreatedAt;
    if (!query.orderBy) query.orderBy = EventQueryOrderByEnum.Ascending;

    // $or queries in mongo must not be empty arrays
    // so we check to make sure it will be populated
    // before we do the conversation.
    // If it is not, this is a 'list all events' request
    // and we can just do a normal query, even
    // if 'query.any' is true

    if (query.any && Object.keys(finalQuery).length) {
      const or = [];
      for (const [key, value] of Object.entries(finalQuery)) {
        or.push({ [key]: value });
      }

      if (typeof query.cancel === 'boolean') {
        var cancel: any = query.cancel;
      } else {
        cancel = { $ne: true };
      }
      if (query.name) {
        finalQuery = { $or: or, $and: [{ orgId: query.orgId, active: true }] };
      } else {
        finalQuery = { $or: or, $and: [{ orgId: query.orgId, active: true, cancel: cancel }] };
      }
      // filtering based on event ids with $and
      if (query?.eventIds?.length) {
        finalQuery['$and'].push({ _id: { $in: query?.eventIds } })
      }
    } else {
      finalQuery.orgId = query.orgId;
      finalQuery.active = true;
    }
    try {
      if (pagination) {
        const { pageSize, pageNumber = 1 } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        events = await this.Event.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({ [query.sortBy]: query.orderBy });
      } else {
        events = await this.Event.find(finalQuery);
      }

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();

    return events;
  }

  public async queryEventsList(spanContext: string, orgId: string): Promise<any> {
    const span = tracer.startSpan('queryEvents', spanContext);
    let events: any;
    let finalQuery: any = {};
    if (orgId) {
      finalQuery['orgId'] = orgId;
    }

    // finalQuery['schedule.startsAt'] = {
    //   $lte: Time.now(),
    // };
    finalQuery['schedule.endsAt'] = {
      $gte: Time.now(),
    };
    finalQuery['schedule.announceAt'] = {
      $lte: Time.now(),
    };
    finalQuery['published'] = true;
    finalQuery['publishable'] = true;


    // finalQuery.sortBy = EventQuerySortByEnum.CreatedAt;
    // finalQuery.orderBy = EventQueryOrderByEnum.Ascending;
    finalQuery.cancel = { $ne: true };
    finalQuery.active = true;
    try {
      events = await this.Event.find(finalQuery).sort({ 'schedule.startsAt': 1 }).lean()
      //   },
      //   {
      //       $project: {
      //           _id: 1,
      //           name: 1,
      //           active: 1,
      //           schedule: 1,
      //           cancel: 1,
      //           published:1,
      //           ticketTypes: 1,
      //           startsAt: "$schedule.startsAt",
      //           endsAt: "$schedule.endsAt",
      //           posterImageUrl: 1,
      //           venue: {
      //               $first: "$venue.name"publissable
      //           }
      //       }
      //   }
      // ]);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return events;
  }

  public async findEventById(spanContext: string, eventId: string): Promise<IEvent> {
    const span = tracer.startSpan('findEventById', spanContext);
    let event: IEvent;
    try {
      event = await this.Event.findById(eventId)
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return event;
  }

  public async findSeasonById(spanContext: string, query: object): Promise<IEvent[]> {
    const span = tracer.startSpan('findSeasonById', spanContext);
    let events: IEvent[];
    try {
      //  let query = {
      //   seasonId:seasonId
      //   }
      events = await this.Event.find(query).sort({ 'schedule.startsAt': 1 }).lean()
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return events;

  }

  public async updateOneEvent(spanContext: string, orgId: string, event: IEvent): Promise<IEvent> {
    const span = tracer.startSpan('updateOneEvent', spanContext);

    // if you can figure out a way to save all properties without
    // this bullshit I'll give you $100.00, no kidding
    // - Sam Heutmaker
    event = JSON.parse(JSON.stringify(event));

    try {
      event = await this.Event.findOneAndUpdate({ orgId, _id: event._id }, { $set: event }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return event;
  }

  public async updateEventTicketsQuantity(spanContext: string, orgId: string, eventID: string, ticketTypeID: string): Promise<boolean> {
    const span = tracer.startSpan('updateOneEvent', spanContext);
    try {
      await this.Event.findOneAndUpdate({ orgId, _id: eventID, "ticketTypes._id": ticketTypeID }, { $inc: { 'ticketTypes.$.remainingQty': 1, 'ticketTypes.$.tiers.0.remainingQty': 1 } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async updateEventUpgradeQuantity(spanContext: string, orgId: string, eventID: string, upgradeTypeID: string): Promise<boolean> {
    const span = tracer.startSpan('upgrades', spanContext);
    try {
      await this.Event.findOneAndUpdate({ orgId, _id: eventID, "upgrades._id": upgradeTypeID }, { $inc: { 'upgrades.$.remainingQty': 1 } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async updateEventPromotionQuantity(spanContext: string, orgId: string, eventID: string, code: string): Promise<boolean> {
    const span = tracer.startSpan('promotion', spanContext);
    try {

      await this.Event.findOneAndUpdate({ orgId, _id: eventID, "promotions.code": code }, { $inc: { 'promotions.$.remainingQty': 1 } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async deleteEvent(spanContext: string, orgId: string, eventId: string): Promise<boolean> {

    const span = tracer.startSpan('deleteEvent', spanContext);

    try {
      await this.Event.findOneAndUpdate({ orgId, _id: eventId }, { $set: { active: false } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return true;
  }

  public async cancelEvent(spanContext: string, orgId: string, eventId: string): Promise<boolean> {

    const span = tracer.startSpan('cancelEvent', spanContext);

    try {
      await this.Event.findOneAndUpdate({ orgId, _id: eventId }, { $set: { cancel: true } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return true;
  }
  public async processSale(
    spanContext: string,
    orgId: string,
    eventId: string,
    tickets: IOrderTicket[],
    upgrades: IOrderUpgrade[],
    promotionCode?: string,
    discountCode?: string
  ): Promise<IEvent> {
    const span = tracer.startSpan('processSale', spanContext);
    let remainingQty = {} as any;
    const arrayFilters = [];

    /* Mongo Array Filters are pretty crazy
    *  We use them to enable atomic writes
    *  which allows us to accurately keep
    *  track of available ticket quantity
    *  during times of high traffic
    *  https://stackoverflow.com/questions/18173482/mongodb-update-deeply-nested-subdocument
    *
    * IMPORTANT!
    * Thoroughly test any changes to the code below.
    */

    // Tickets
    const purchasedTickets = tickets.reduce((cur, next) => {
      if (cur.hasOwnProperty(next.ticketTypeId)) {
        cur[next.ticketTypeId].qty++;
      } else {
        cur[next.ticketTypeId] = {
          ticketTypeId: next.ticketTypeId,
          ticketTierId: next.ticketTierId,
          qty: 1,
        };
      }
      return cur;
    }, {});

    Object.values(purchasedTickets).forEach((ticket: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;
      const secondIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`ticketTypes.$[${firstIndex}].remainingQty`]: (-1 * ticket.qty),
        [`ticketTypes.$[${firstIndex}].tiers.$[${secondIndex}].remainingQty`]: (-1 * ticket.qty),
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: ticket.ticketTypeId,
      });

      arrayFilters.push({
        [`${secondIndex}._id`]: ticket.ticketTierId,
      });
    });

    // Upgrades
    const purchasedUpgrades = upgrades.reduce((cur, next) => {
      if (cur.hasOwnProperty(next.upgradeId)) {
        cur[next.upgradeId].qty++;
      } else {
        cur[next.upgradeId] = {
          upgradeId: next.upgradeId,
          qty: 1,
        };
      }
      return cur;
    }, {});

    Object.values(purchasedUpgrades).forEach((upgrade: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`upgrades.$[${firstIndex}].remainingQty`]: (-1 * upgrade.qty),
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: upgrade.upgradeId,
      });
    });

    /* 
     * Promotion Code 
     */
    if (promotionCode) {
      remainingQty = {
        ...remainingQty,
        "promotions.$[indexPromo1].remainingQty": (-1), //* tickets.length
      };

      arrayFilters.push({
        'indexPromo1.code': promotionCode,
      });
    }

    if (discountCode) {
      remainingQty = {
        ...remainingQty,
        "promotions.$[indexPromo2].remainingQty": (-1), //* tickets.length
      };

      arrayFilters.push({
        'indexPromo2.code': discountCode
      });
    }

    // filter and update, son
    try {
      await this.Event.findOneAndUpdate(
        {
          orgId,
          _id: eventId,
        },
        {
          $inc: {
            // Remaining Tickets & Upgrades
            ...remainingQty,
          },
        },
        {
          arrayFilters,
        },
      );

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
  }

  public async orderCanceled(
    spanContext: string,
    orgId: string,
    eventId: string,
    refundAmount: number,
    refundedTickets: string[],
    refundedUpgrades: string[],
    order: any,
  ): Promise<void> {
    const span = tracer.startSpan('orderCanceled', spanContext);
    const { tickets = [], upgrades = [], promotionCode } = order;
    let remainingQty = {} as any;
    const arrayFilters = [];

    /* Mongo Array Filters are pretty crazy
    *  We use them to enable atomic writes
    *  which allows us to accurately keep
    *  track of avaialable ticket quantity
    *  during times of high traffic
    *  https://stackoverflow.com/questions/18173482/mongodb-update-deeply-nested-subdocument
    *
    * IMPORTANT!
    * Thoroughly test any changes to the code below.
    */

    /*
     * Tickets
     */
    const canceledTickets = tickets
      .filter(ticket => refundedTickets.includes(ticket._id))
      .reduce((cur, next) => {
        if (cur.hasOwnProperty(next.ticketTypeId)) {
          cur[next.ticketTypeId].qty++;
        } else {
          cur[next.ticketTypeId] = {
            ticketTypeId: next.ticketTypeId,
            ticketTierId: next.ticketTierId,
            qty: 1,
          };
        }
        return cur;
      }, {});

    Object.values(canceledTickets).forEach((ticket: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;
      const secondIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`ticketTypes.$[${firstIndex}].remainingQty`]: ticket.qty,
        [`ticketTypes.$[${firstIndex}].tiers.$[${secondIndex}].remainingQty`]: ticket.qty,
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: ticket.ticketTypeId,
      });

      arrayFilters.push({
        [`${secondIndex}._id`]: ticket.ticketTierId,
      });
    });

    /*
     * Upgrades
     */
    const canceledUpgrades = upgrades
      .filter(upgrade => refundedUpgrades.includes(upgrade._id))
      .reduce((cur, next) => {
        if (cur.hasOwnProperty(next.upgradeId)) {
          cur[next.upgradeId].qty++;
        } else {
          cur[next.upgradeId] = {
            upgradeId: next.upgradeId,
            qty: 1,
          };
        }
        return cur;
      }, {});

    Object.values(canceledUpgrades).forEach((upgrade: any) => {
      const firstIndex = `index${Random.generateOfLength(14)}`;

      remainingQty = {
        ...remainingQty,
        [`upgrades.$[${firstIndex}].remainingQty`]: upgrade.qty,
      };

      arrayFilters.push({
        [`${firstIndex}._id`]: upgrade.upgradeId,
      });
    });
    /* 
     * Promotion Code 
     */
    if (promotionCode) {
      remainingQty = {
        ...remainingQty,
        "promotions.$[promotionFilter].remainingQty": tickets.length,
      };

      arrayFilters.push({
        'promotionFilter.code': promotionCode,
      });
    }

    try {
      await this.Event.findOneAndUpdate(
        {
          orgId,
          _id: eventId,
        },
        {
          $inc: {
            // Remaining Tickets & Upgrades
            ...remainingQty
          },
        },
        {
          arrayFilters,
        },
      );

    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
  }

  public async deleteSubscription(spanContext: string, eventId: string, subscriptionId: string): Promise<any> {

    const span = tracer.startSpan('deleteSubscription', spanContext);
    let event;
    try {
      event = await this.Event.findOneAndUpdate({ _id: eventId }, { $pull: { subscription: { _id: subscriptionId } } }, false,);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return event;
  }

  public async findByHoldId(spanContext: string, _id: string): Promise<IEvent> {
    const span = tracer.startSpan('findByHoldId', spanContext);
    let events: IEvent;
    try {
      // events = await this.Event.find({ holds: { $elemMatch: { _id: { $eq:  _id } } } }).lean()
      events = await this.Event.findOne({ "holds._id": _id }).lean();
      console.log(events);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return events;

  }

  public async holdTicket(spanContext: string, orgId: string, eventID: string, remainingQty: string, hold): Promise<IEvent> {
    const span = tracer.startSpan('updateOneEvent', spanContext);

    let event: IEvent;
    try {
      await this.Event.updateOne(
        { orgId, _id: eventID, "holds._id": hold._id },
        { $set: { "holds.$": hold } }
      )
      event = await this.Event.findOneAndUpdate({ orgId, _id: eventID, "ticketTypes._id": hold.ticketTypeId }, { $inc: { 'ticketTypes.$.remainingQty': remainingQty, 'ticketTypes.$.tiers.0.remainingQty': remainingQty } }).lean()
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return event;
  }

  // find existing stub
  public async findUrlStub(spanContext: string, _id: string, stub: string) {
    const span = tracer.startSpan('findUrlStub', spanContext);
    let event: IEvent;
    let urlStubExist = false;


    try {
      if (stub) {
        event = await this.Event.findOne({ stub, _id: { $ne: _id }, published: true });
        if (event) {
          urlStubExist = true;
        }
      }
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return {
      event,
      urlStubExist,
    };
  }

  public async findEventByQuery(spanContext: string, query): Promise<IEvent> {
    const span = tracer.startSpan('findEventByQuery', spanContext);
    let event: IEvent;
    try {
      event = await this.Event.findOne(query);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return event;
  }

  // public async eventSearch(spanContext: string, eventId: string, query: IEventSearchQuery): Promise<any> {
  //   const span = tracer.startSpan('queryOrders', spanContext);
  //   let event;
  //   let finalQuery: any = { _id: eventId }
  //   console.log(query)
  //   try {
  //       event = await this.Event.findOne(finalQuery).lean();
  //       let waitList = event.waitList;
  //       if(event.waitList.length !==0){
  //         let eventWaitList = waitList.filter(wList => wList.name.includes(query.name) || wList.phoneNumber.includes(query.name) || wList.email.includes(query.name))
  //         event.waitList = eventWaitList;
  //       }
  //       event = event
  //   } catch (error) {
  //     console.error(error);
  //     span.setTag('error', true);
  //     span.log({ errors: error.message });
  //     span.finish();
  //     return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
  //   }
  //   span.finish();
  //   return event;
  // }




  public async eventSearch(spanContext: string, eventId: string, query: IEventSearchQuery, pagination: IPagination): Promise<any> {
    const span = tracer.startSpan('queryOrders', spanContext);
    let event;
    let finalQuery: any = { _id: eventId };

    try {
      event = await this.Event.findOne(finalQuery).lean();

      if (event?.waitList?.length !== 0 && query.name) {
        const regexPattern = new RegExp(query.name, 'i'); // 'i' flag for case-insensitive matching
        const eventWaitList = event.waitList.filter(wList =>
          regexPattern.test(wList.name) ||
          regexPattern.test(wList.phoneNumber) ||
          regexPattern.test(wList.email)
        );
        event.waitList = eventWaitList;
      }

      // Apply pagination
      if (pagination && pagination.pageSize && pagination.pageNumber) {
        const { pageSize, pageNumber } = pagination;
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = pageSize * pageNumber;

        event.waitList = event.waitList.slice(startIndex, endIndex);
      }
    } catch (error) {
      console.error(error);
      span.setTag('error', true);
      span.log({ errors: error.message });
      span.finish();
      return Promise.reject(new EventStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return event;
  }






}
