import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import * as pb from '@sellout/models/.dist/sellout-proto';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Tracer from '@sellout/service/.dist/Tracer';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import Joi from '@hapi/joi';
import IOrderQuery from '@sellout/models/.dist/interfaces/IOrderQuery';

const tracer = new Tracer('OrderStore');

export default class OrderStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Order;

  constructor(Order) {
    this.Order = Order;
  }

  public async createOrder(spanContext: string, attributes: IOrder): Promise<IOrder> {
    const span = tracer.startSpan('createOrder', spanContext);

    const schema = Joi.object().keys({
      userId: Joi.string().optional().allow(''),
      orgId: Joi.string().required(),
      eventId: Joi.string().optional(),
      seasonId: Joi.string().optional(),
      eventName: Joi.string().required(),
      venueIds: Joi.array().required(),
      artistIds: Joi.array().required(),
      feeIds: Joi.array().required(),
      stripeChargeId: Joi.string().optional(),
      tickets: Joi.array().optional(),
      fees: Joi.array().required(),
      upgrades: Joi.array().required(),
      state: Joi.string().required(),
      type: Joi.string().required(),
      channel: Joi.string().required(),
      tax: Joi.number().required(),
      createdAt: Joi.number().required(),
      createdBy: Joi.string().required(),
      promotionCode: Joi.string().optional().allow(null),
      discountCode: Joi.string().optional().allow(null),
      ipAddress: Joi.any(),
      address: Joi.any(),
      customFields: Joi.array(),
      payments: Joi.array(),
      hidden: Joi.boolean().optional().default(false),
      parentSeasonOrderId: Joi.string().optional().allow(''),
      discountAmount: Joi.number().allow("", null)
      .empty(["", null])
      .default(null),
    });
    const params = schema.validate(attributes);
    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const order = new this.Order(params.value);

    let savedOrder: IOrder;
    try {
      savedOrder = await order.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return savedOrder;
  }
  public async updateOneOrder(spanContext: string, order: IOrder): Promise<IOrder> {
    const span = tracer.startSpan('updateOne', spanContext);
    let updatedOrder;

    try {
      updatedOrder = await this.Order.findOneAndUpdate({ _id: order._id }, { $set: order }, { new: true, upsert: true }).lean();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return updatedOrder;
  }

  public async getPromoUsedCount(spanContext: string, promoCode: string, eventId: string, userId: string, seasonId: string): Promise<any> {
    const span = tracer.startSpan('getPromoUsed', spanContext);
    let order;
    try {
      if (eventId) {
        order = await this.Order.find({ eventId: eventId, promotionCode: promoCode, userId: userId });
      } else {
        order = await this.Order.find({ seasonId: seasonId, promotionCode: promoCode, userId: userId });
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order.length;
  }
  public async queryOrders(spanContext: string, query: IOrderQuery, pagination: IPagination): Promise<IOrder[]> {
    const span = tracer.startSpan('queryOrders', spanContext);
    let orders: IOrder[];
    let finalQuery: any = {};

    if (query.orderIds && query.orderIds.filter(v => Boolean(v)).length) {
      finalQuery._id = { $in: query.orderIds.filter(v => Boolean(v)) };
    }
    if (query.userQuery) {
      finalQuery._id = { $regex: query.userQuery, $options: "xi" };
      finalQuery["tickets.teiMemberId"] = query.userQuery
      finalQuery.eventName = { $regex: query.userQuery, $options: 'i' };
    }

    if (query.venueIds && query.venueIds.filter(v => Boolean(v)).length) {
      finalQuery.venueIds = { $in: query.venueIds.filter(v => Boolean(v)) };
    }

    if (query.artistIds && query.artistIds.filter(v => Boolean(v)).length) {
      finalQuery.artistIds = { $in: query.artistIds.filter(v => Boolean(v)) };
    }

    if (query.userIds && query.userIds.filter(v => Boolean(v)).length) {
      finalQuery.userId = { $in: query.userIds.filter(v => Boolean(v)) };
    }

    if (query.states && query.states.filter(v => Boolean(v)).length) {
      finalQuery.state = { $in: query.states.filter(v => Boolean(v)) };
    }

    if (query.types && query.types.filter(v => Boolean(v)).length) {
      finalQuery.type = { $in: query.types.filter(v => Boolean(v)) };
    }

    if (query.startDate && query.endDate) {
      finalQuery.createdAt = {
        $gte: query.startDate,
        $lte: query.endDate,
      };
    }



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
      finalQuery = { $or: or }
      if (query.orgId) {
        finalQuery['$and'] = [{ orgId: query.orgId }];
      }
    } else if (query.orgId) {
      finalQuery.orgId = query.orgId;
    }

    if (query.eventIds && query.eventIds.filter(v => Boolean(v)).length) {
      if (query.event) {
        if (finalQuery['$and'])
          finalQuery['$and'].push({ eventId: { $in: query.eventIds.filter(v => Boolean(v)) } });
        else
          finalQuery['$and'] = [{ eventId: { $in: query.eventIds.filter(v => Boolean(v)) } }];
      } else {
        if (finalQuery['$or'])
          finalQuery['$or'].push({ eventId: { $in: query.eventIds.filter(v => Boolean(v)) } });
        else
          finalQuery['$or'] = [{ eventId: { $in: query.eventIds.filter(v => Boolean(v)) } }]
      }
    }


    if (query.seasonIds && query.seasonIds.filter(v => Boolean(v)).length) {
      if (query.season) {
        if (finalQuery['$and'])
          finalQuery['$and'].push({ seasonId: { $in: query.seasonIds.filter(v => Boolean(v)) } });
        else
          finalQuery['$and'] = [{ seasonId: { $in: query.seasonIds.filter(v => Boolean(v)) } }];
      } else {
        if (finalQuery['$or'])
          finalQuery['$or'].push({ seasonId: { $in: query.seasonIds.filter(v => Boolean(v)) } });
        else
          finalQuery['$or'] = [{ seasonId: { $in: query.seasonIds.filter(v => Boolean(v)) } }]
      }
    }

    try {
      if (pagination) {
        const { pageSize, pageNumber = 1 } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        orders = await this.Order.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({ createdAt: -1 }).lean();
      } else {
        orders = await this.Order.find(finalQuery).sort({ createdAt: -1 }).lean();
      }


    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return orders;
  }

  public async OrdersforCharge(spanContext: string): Promise<IOrder[]> {
    const span = tracer.startSpan('queryOrders', spanContext);
    let orders: IOrder[];
    try {
      orders = await this.Order.find({ stripeChargeId: null, "payments.paymentIntentId": { $ne: null } }).sort({ createdAt: -1 });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return orders;
  }
  public async findById(spanContext: string, orderId: string): Promise<IOrder> {
    const span = tracer.startSpan('findById', spanContext);
    let order: IOrder;
    try {
      // secretId only works when querying for an invididual order
      order = await this.Order.findOne({ $or: [{ _id: orderId }, { secretId: orderId }] }).lean();
      order.tickets.map((item) => {
        if (!Array.isArray(item.scan)) {
          item.scan = [item.scan]
        }
      })
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }

  public async findByMultipleId(spanContext: string, orderId: string): Promise<IOrder[]> {
    const span = tracer.startSpan('findByMultipleId', spanContext);
    let order: IOrder[];
    try {
      // secretId only works when querying for an invididual order
      order = await this.Order.find({ _id: { $in: orderId } }).lean();
      for (let multipleOrder of order) {
        multipleOrder.tickets.map((item) => {
          if (!Array.isArray(item.scan)) {
            item.scan = [item.scan]
          }
        })
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }
  public async findByMultipleParentSeasonOrderId(spanContext: string, orderId: string): Promise<IOrder[]> {
    const span = tracer.startSpan('findByMultipleParentSeasonOrderId', spanContext);
    let order: IOrder[];
    try {
      // secretId only works when querying for an invididual order
      order = await this.Order.find({ parentSeasonOrderId: { $in: orderId } }).lean();
      for (let multipleOrder of order) {
        multipleOrder.tickets.map((item) => {
          if (!Array.isArray(item.scan)) {
            item.scan = [item.scan]
          }
        })
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }
  public async findBySeasonOrderId(spanContext: string, orderId: string): Promise<IOrder[]> {
    const span = tracer.startSpan('findBySeasonOrderId', spanContext);
    let order: IOrder[];
    try {
      // secretId only works when querying for an invididual order
      order = await this.Order.find({ parentSeasonOrderId: orderId }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }

  public async findByEmail(spanContext: string, email: string): Promise<IOrder> {
    const span = tracer.startSpan('findByEmail', spanContext);
    let order: IOrder;
    try {
      order = await this.Order.findOne({ email });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }

  public async findOrderById(spanContext: string, eventId: string, seasonId: string, teiMemberId): Promise<any> {
    const span = tracer.startSpan('getOrder', spanContext);
    let order;
    try {
      if (eventId) {
        order = await this.Order.aggregate(
          [
            {
              '$match': {
                'eventId': eventId,
                'tickets.teiMemberId': {
                  '$in': teiMemberId
                }, 'tickets.state': 'Active'
              }
            }, {
              '$project': {
                'tickets.teiMemberId': 1,
                'tickets.guestTicket': true
              }
            }
          ])
      } else {
        order = await this.Order.aggregate(
          [
            {
              '$match': {
                'seasonId': seasonId,
                'tickets.teiMemberId': {
                  '$in': teiMemberId
                }, 'tickets.state': 'Active'
              }
            }, {
              '$project': {
                'tickets.teiMemberId': 1,
                'tickets.guestTicket': true
              }
            }
          ])
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order
  }


  public async findOrderByEventId(spanContext: string, eventId: string): Promise<any> {
    const span = tracer.startSpan('findOrderByEventId', spanContext);

    let ticketScanned;
    let ticketSold;
    let ticketUnscanned;
    let tkCount;
    let ugCount;
    let tkCountScanned;
    let ugCountScanned;
    let upgradeScanned;
    try {
      if (eventId) {

        ticketSold = await this.Order.aggregate([
          {
            '$match': {
              'eventId': eventId, 
              'state': 'Active'
            }
          }, {
            '$addFields': {
              'ticketsize': {
                '$size': '$tickets'
              }
            }
          }, {
            '$addFields': {
              'upgradesize': {
                '$size': '$upgrades'
              }
            }
          }, {
            '$group': {
              '_id': null, 
              'tickets_count': {
                '$sum': '$ticketsize'
              }, 
              'upgrades_count': {
                '$sum': '$upgradesize'
              }
            }
          }, {
            '$project': {
              'tickets_count': 1, 
              'upgrades_count': 1
            }
          }
        ])

        // let upgradeSold = await this.Order.aggregate([
        //   {
        //     '$match': {
        //       'eventId': eventId
        //     }
        //   }, {
        //     '$match': {
        //       'state': 'Active'
        //     }
        //   }, {
        //     '$addFields': {
        //       'size': {
        //         '$size': '$upgrades'
        //       }
        //     }
        //   }, {
        //     '$group': {
        //       '_id': null,
        //       'upgrades_count': {
        //         '$sum': '$size'
        //       }
        //     }
        //   }
        // ])

        ticketScanned = await this.Order.aggregate(
          [
            {
              '$match': {
                'eventId': eventId
              }
            }, {
              '$unwind': {
                'path': '$tickets',
                'preserveNullAndEmptyArrays': false
              }
            }, {
              '$unwind': {
                'path': '$tickets.scan',
                'preserveNullAndEmptyArrays': false
              }
            }, {
              '$match': {
                'tickets.scan.scanned': true
              }
            }, {
              '$count': 'scanned'
            }
        ])

        upgradeScanned = await this.Order.aggregate(
          [
            {
              '$match': {
                'eventId': eventId
              }
            }, {
              '$unwind': {
                'path': '$upgrades',
                'preserveNullAndEmptyArrays': false
              }
            }, {
              '$unwind': {
                'path': '$upgrades.scan',
                'preserveNullAndEmptyArrays': false
              }
            }, {
              '$match': {
                'upgrades.scan.scanned': true
              }
            }, {
              '$count': 'scanned'
            }
        ])

        tkCountScanned = ticketScanned[0]?.scanned || 0;
        ugCountScanned = upgradeScanned[0]?.scanned || 0;
    
         tkCount = ticketSold[0]?.tickets_count || 0;
         ugCount = ticketSold[0]?.upgrades_count || 0;
      }

      ticketSold = tkCount + ugCount;
      // ticketSold = ticketSold[0] ? ticketSold[0].tickets_count : 0;
      // ticketScanned = ticketScanned && ticketScanned[0] ? ticketScanned[0].scanned : 0;
      ticketScanned = tkCountScanned + ugCountScanned;
      ticketUnscanned = ticketSold - ticketScanned;
    } catch (e) {
      console.error(e);
      span.setTag('error', true)
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return { eventId: eventId, ticketSold: ticketSold, ticketScanned: ticketScanned, ticketUnscanned: ticketUnscanned }
  }

  public async eventOrderCount(spanContext: string, eventId: string): Promise<any> {
    const span = tracer.startSpan('findOrderByEventId', spanContext);
    let orderCount = 0;
    try {
      orderCount = await this.Order.find({ eventId }).count();
    } catch (e) {
      console.error(e);
      span.setTag('error', true)
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return orderCount
  }

  public async findByFeeId(spanContext: string, feeId: string): Promise<IOrder> {
    const span = tracer.startSpan('findByFeeId', spanContext);
    let order: IOrder;
    try {
      // secretId only works when querying for an invididual order
      // order = await this.Order.findOne({ $or: [{ _id: orderId }, { secretId: orderId }] }).lean();
      order = await this.Order.findOne({ feeIds: feeId }).lean();
      order.tickets.map((item) => {
        if (!Array.isArray(item.scan)) {
          item.scan = [item.scan]
        }
      })
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return order;
  }

  public async orderActivity(spanContext: string, orgId: string, query: IOrderQuery): Promise<IOrder[]> {
    const span = tracer.startSpan('queryOrders', spanContext);
    let orders: IOrder[];
    let condition;
    if (query.startDate === 0 || query.startDate === null && query.endDate === 0 || query.endDate == null) {
      condition = { 'orgId': orgId }
    } else {
      condition = {
        'orgId': orgId,
        'createdAt': {
          '$gte': query.startDate,
          '$lte': query.endDate
        }
      }
    }
    const aggregation =
      [
        {
          '$match': condition,
        },
        {
          '$lookup': {
            'from': 'users',
            'let': {
              'userId': "$userId"
            },
            // 'localField': 'userId',
            // 'foreignField': '_id',
            'pipeline': [
              {
                "$match": {
                  "$expr": {
                    "$eq": ["$$userId", "$_id"]
                  }
                }
              },
              {
                '$project': {
                  'firstName': 1,
                  'lastName': 1
                }
              }
            ],
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user',
            'preserveNullAndEmptyArrays': true
          }
        },
        {
          '$lookup': {
            'from': 'venues',
            'localField': 'venueIds',
            'foreignField': '_id',
            'as': 'venue'
          }
        }, {
          '$unwind': {
            'path': '$venue',
            'preserveNullAndEmptyArrays': true
          }
        },

        {
          '$lookup': {
            'from': 'events',
            'localField': 'eventId',
            'foreignField': '_id',
            'as': 'event'
          }
        }, {
          '$unwind': {
            'path': '$event',
            'preserveNullAndEmptyArrays': true
          }
        },{
          '$addFields': {
            'refundedTickets': {
              '$filter': {
                'input': '$tickets',
                'as': 'tickets',
                'cond': {
                  '$eq': [
                    '$$tickets.refund.refunded', true
                  ]
                }
              }
            },
            'refundedUpgrades': {
              '$filter': {
                'input': '$upgrades',
                'as': 'upgrades',
                'cond': {
                  '$eq': [
                    '$$upgrades.refund.refunded', true
                  ]
                }
              }
            }
          }
        },
        {
          '$addFields': {
            'latestRefundedTickets': {
              '$arrayElemAt': [
                '$refundedTickets', {
                  '$indexOfArray': [
                    '$refundedTickets.refund.refundedAt',
                    {
                      '$max': '$refundedTickets.refund.refundedAt'
                    }
                  ]
                }
              ]
            },
            'latestRefundedUpgrades': {
              '$arrayElemAt': [
                '$refundedUpgrades', {
                  '$indexOfArray': [
                    '$refundedUpgrades.refund.refundedAt',
                    {
                      '$max': '$refundedUpgrades.refund.refundedAt'
                    }
                  ]
                }
              ]
            },
            'totalTicketsPrice': {
              '$sum': '$tickets.price'
            },
            'totalupgradesPrice': {
              '$sum': '$upgrades.price'
            }
          }
        }
      ]
    try {
      orders = await this.Order.aggregate(
        aggregation
      ).sort({ createdAt: -1 });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new OrderStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return orders;
  }

}
