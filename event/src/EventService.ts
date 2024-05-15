import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import Joi from '@hapi/joi';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import joiToErrors, { joiToErrorMessages } from '@sellout/service/.dist/joiToErrors';
// import { Event, IEventModel } from './Event';
import { Event } from './Event';
import EventStore from './EventStore';
import IEvent, { EventProcessAsEnum, SendQRCodeEnum, EventAgeEnum, EventTicketDelivery } from '@sellout/models/.dist/interfaces/IEvent';
import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';
import shortid from 'shortid';
import moment from 'moment';
import mongoose from 'mongoose';
import { EventPromotionAppliesToEnum, EventPromotionTypeEnum } from '@sellout/models/.dist/interfaces/IEventPromotion';
import {
  OrderStateEnum,
  OrderItemStateEnum,
} from "@sellout/models/.dist/interfaces/IOrderState";
import { TaskTypes } from '@sellout/models/.dist/interfaces/ITask';
import * as CSV from '@sellout/utils/.dist/CSV';
const tracer = new Tracer('EventService');

export default class EventService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }

  public static main() {
    const serviceName = pb.EventService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new EventService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new EventStore(Event),
    });
    service.run();
  }

  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }

  public register() {
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      /**
       * Incoming Message Handlers
       */
      createEvent: new PbMessageHandler(
        this.createEvent,
        pb.CreateEventRequest,
        pb.CreateEventResponse,
      ),
      publishEvent: new PbMessageHandler(
        this.publishEvent,
        pb.PublishEventRequest,
        pb.PublishEventResponse,
      ),
      updateEvent: new PbMessageHandler(
        this.updateEvent,
        pb.UpdateEventRequest,
        pb.UpdateEventResponse,
      ),
      queryEvents: new PbMessageHandler(
        this.queryEvents,
        pb.QueryEventsRequest,
        pb.QueryEventsResponse,
      ),
      queryEventsList: new PbMessageHandler(
        this.queryEventsList,
        pb.QueryEventsListRequest,
        pb.QueryEventsListResponse,
      ),
      listEvents: new PbMessageHandler(
        this.listEvents,
        pb.ListEventsRequest,
        pb.ListEventsResponse,
      ),
      findEventById: new PbMessageHandler(
        this.findEventById,
        pb.FindEventByIdRequest,
        pb.FindEventByIdResponse,
      ), listEventBySeasonId: new PbMessageHandler(
        this.listEventBySeasonId,
        pb.FindSeasonByIdRequest,
        pb.ListEventsResponse,
      ),
      findEventDetails: new PbMessageHandler(
        this.findEventDetails,
        pb.FindEventByIdRequest,
        pb.FindEventDetailsResponse,
      ),
      deleteEvent: new PbMessageHandler(
        this.deleteEvent,
        pb.DeleteEventRequest,
        pb.DeleteEventResponse,
      ),
      cancelEvent: new PbMessageHandler(
        this.cancelEvent,
        pb.CancelEventRequest,
        pb.CancelEventResponse,
      ),
      cancelTicket: new PbMessageHandler(
        this.cancelTicket,
        pb.CancelTicketRequest,
        pb.CancelTicketResponse,
      ),
      duplicateEvent: new PbMessageHandler(
        this.duplicateEvent,
        pb.DuplicateEventRequest,
        pb.DuplicateEventResponse,
      ),
      eventTickets: new PbMessageHandler(
        this.eventTickets,
        pb.EventTicketsRequest,
        pb.EventTicketsResponse,
      ),
      eventDiscounts: new PbMessageHandler(
        this.eventDiscounts,
        pb.EventDiscountRequest,
        pb.EventTicketsResponse,
      ),
      salesReport: new PbMessageHandler(
        this.salesReport,
        pb.SalesReportRequest,
        pb.SalesReportResponse,
      ), createWaitList: new PbMessageHandler(
        this.createWaitList,
        pb.WaitListRequest,
        pb.WaitListResponse,
      ), updateHolds: new PbMessageHandler(
        this.updateHolds,
        pb.HoldTicketRequest,
        pb.HoldTicketResponse,
      ),
      deleteSubscription: new PbMessageHandler(
        this.deleteSubscription,
        pb.DeleteSubscriptionRequest,
        pb.DeleteSubscriptionResponse,
      ),
      generateWaitListReport: new PbMessageHandler(
        this.generateWaitListReport,
        pb.GenerateWaitListReportRequest,
        pb.GenerateWaitListReportResponse,
      ),
      searchEvents: new PbMessageHandler(
        this.searchEvents,
        pb.QuerySearchEventsRequest,
        pb.FindEventByIdResponse,
      ),
      notifyEvent: new PbMessageHandler(
        this.notifyEvent,
        pb.NotifyMeReportRequest,
        pb.FindEventByIdResponse,
      ),
    });


    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      orderCreated: new PbAsyncMessageHandler(
        this.orderCreated,
        pb.Broadcast.OrderCreatedNotification,
      ),
      orderRefunded: new PbAsyncMessageHandler(
        this.orderRefunded,
        pb.Broadcast.OrderRefundedNotification,
      ),
    });
  }

  public createEvent = async (request: pb.CreateEventRequest): Promise<pb.CreateEventRequest> => {
    const span = tracer.startSpan('createEvent', request.spanContext);
    const response: pb.CreateEventResponse = pb.CreateEventResponse.create();

    const { orgId, event } = request;
    event.orgId = orgId;
    event.createdAt = Time.now();

    let newEvent: IEvent;

    try {
      newEvent = await this.storage.createEvent(span, event);
      response.status = pb.StatusCode.OK;
      response.event = pb.Event.fromObject(newEvent);
    } catch (e) {
      this.logger.error(`createEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Event creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
    * Broadcast event creation
    */
    const eventCreatedNotification = pb.Broadcast.EventCreatedNotification.create({
      spanContext: span.context().toString(),
      orgId,
      eventId: newEvent._id.toString(),
    });

    try {
      await this.proxy.broadcast.eventCreated(eventCreatedNotification);
    } catch (e) {
      this.logger.error(`createEvent - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return response;
  }

  public publishEvent = async (request: pb.PublishEventRequest): Promise<pb.PublishEventResponse> => {
    const span = tracer.startSpan('publishEvent', request.spanContext);
    const response: pb.PublishEventResponse = pb.PublishEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      publishSiteIds: Joi.array().items(Joi.string()).default([]),
      unpublishSiteIds: Joi.array().items(Joi.string()).default([]),
      published: Joi.boolean().default(true),
    });

    const params = schema.validate(request);


    if (params.error) {
      this.logger.error(`publishEvents - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, publishSiteIds, unpublishSiteIds, published } = params.value;
    /**
    * Find the event
    */
    let event
    try {
      event = await this.storage.findEventById(span, request.eventId);
      let existingUrlStub = await this.storage.findUrlStub(span, event._id, event.stub);
      //Error if stub is already exist
      if (existingUrlStub.urlStubExist) {
        throw new Error("The URL Stub value that you entered has already been used. Please enter a different value.")
      }

    } catch (e) {
      this.logger.error(`publishEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    event = event.toObject();

    /**
    * Validate the event
    */
    const eventParams = EventUtil.validatePublish(event);

    if (eventParams.error) {
      this.logger.error(`publishEvents - error: ${JSON.stringify(eventParams.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrorMessages(eventParams.error, pb.Error);
      console.log(response.errors);
      span.setTag('error', true);
      span.log({ errors: eventParams.error });
      span.finish();
      return response;
    }

    const spanContext = span.context().toString();

    /**
     * Publish the event
     */
    try {
      await publishSiteIds.reduce(async (response: pb.PublishWebFlowEventResponse, publishSiteId, index): Promise<pb.PublishWebFlowEventResponse> => {
        await response;
        console.log(`${Date.now()} HIT HERE ${publishSiteId} index ${index}`);
        const publishWebFlowEventRequest = pb.PublishWebFlowEventRequest.create({
          spanContext,
          orgId,
          eventId,
          siteId: publishSiteId,
        });

        try {
          return await this.proxy.webFlowService.publishWebFlowEvent(publishWebFlowEventRequest);
        } catch (e) {
          this.logger.error(`publishEvent - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [pb.Error.create({
            key: 'Error',
            message: e.message,
          })];
          span.setTag('error', true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }, Promise.resolve(null));

    } catch (e) {
      this.logger.error(`publishEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * Unpublish the events
     */
    try {
      await Promise.all(unpublishSiteIds.map(async (unpublishSiteId): Promise<pb.PublishWebFlowEventResponse> => {
        const unpublishWebFlowEventRequest = pb.UnpublishWebFlowEventRequest.create({
          spanContext,
          orgId,
          eventId,
          siteId: unpublishSiteId,
        });

        try {
          return await this.proxy.webFlowService.unpublishWebFlowEvent(unpublishWebFlowEventRequest);
        } catch (e) {
          this.logger.error(`publishEvent - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [pb.Error.create({
            key: 'Error',
            message: e.message,
          })];
          span.setTag('error', true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }

      }));
    } catch (e) {
      this.logger.error(`publishEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
    * Mark the event as published
    * event.published is always true after the first publish
    * even if the event is not hosted on any webflow sites
    */

    if (event.published !== published) {
      try {
        event = await this.storage.updateOneEvent(span, orgId, { _id: event._id, published });
      } catch (e) {
        this.logger.error(`publishEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }


    /**
     * Broadcast event published
     */
    if (publishSiteIds && publishSiteIds.length > 0) {
      const eventPublishedNotification = pb.Broadcast.EventPublishedNotification.create({
        spanContext: span.context().toString(),
        orgId,
        eventId: event._id.toString(),
      });

      try {
        await this.proxy.broadcast.eventPublished(eventPublishedNotification);
      } catch (e) {
        this.logger.error(`publishEvent - error: ${e.message}`);
        span.setTag('error', true);
        span.log({ errors: e.message });
      }
    }

    response.status = pb.StatusCode.OK;
    response.event = pb.Event.fromObject(event);

    span.finish();
    return response;

  }

  public updateEvent = async (request: pb.UpdateEventRequest): Promise<pb.UpdateEventResponse> => {
    const span = tracer.startSpan('updateEvent', request.spanContext);
    const response: pb.UpdateEventResponse = pb.UpdateEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      event: {
        _id: Joi.string().required(),
        seasonId: Joi.string().optional(),
        orgId: Joi.string().required(),
        isMultipleDays: Joi.boolean().optional(),
        totalDays: Joi.string().optional(),
        type: Joi.string(),
        name: Joi.string().default(''),
        subtitle: Joi.string().default(''),
        description: Joi.string().default(''),
        posterImageUrl: Joi.string().default(''),
        venueId: Joi.string(),
        publishable: Joi.boolean().default(false),
        cancel: Joi.boolean().allow(''),
        taxDeduction: Joi.boolean().allow('').optional(),
        salesBeginImmediately: Joi.boolean().default(true),
        seatingChartKey: Joi.string().default(null),
        age: Joi.string().default(EventAgeEnum.AllAges),
        sendQRCode: Joi.string().default(SendQRCodeEnum.DayOfShow),
        userAgreement: Joi.string().default(''),
        processAs: Joi.string().default(EventProcessAsEnum.Paid),
        location: Joi.object(),
        createdAt: Joi.number(),
        schedule: {
          announceAt: Joi.number(),
          ticketsAt: Joi.number(),
          ticketsEndAt: Joi.number(),
          startsAt: Joi.number(),
          endsAt: Joi.number(),
        },
        performances: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          headliningArtistIds: Joi.array().items(Joi.string()).default([]),
          openingArtistIds: Joi.array().items(Joi.string()).default([]),
          price: Joi.number(),
          videoLink: Joi.string(),
          songLink: Joi.string(),
          posterImageUrl: Joi.string(),
          // schedule: [{
          //   doorsAt: Joi.number(),
          //   startsAt: Joi.number(),
          //   endsAt: Joi.number()
          // }],
          schedule: Joi.array()
        })).default([]),
        ticketTypes: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          name: Joi.string(),
          dayIds: Joi.array(),
          totalQty: Joi.number(),
          remainingQty: Joi.number(),
          purchaseLimit: Joi.number(),
          visible: Joi.boolean(),
          performanceIds: Joi.array().items(Joi.string()).default([]),
          rollFees: Joi.boolean(),
          promo: Joi.string().optional(),
          description: Joi.string().default(''),
          values: Joi.string(),
          tiers: Joi.array().items(Joi.object().keys({
            _id: Joi.string(),
            name: Joi.string(),
            price: Joi.number(),
            startsAt: Joi.number(),
            endsAt: Joi.number(),
            totalQty: Joi.number(),
            remainingQty: Joi.number(),
          })).default([]),
        })).default([]),
        holds: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          name: Joi.string(),
          ticketType: Joi.string(),
          totalHeld: Joi.number(),
          totalCheckedIn: Joi.number(),
          totalReleased: Joi.number(),
          totalOutstanding: Joi.number(),
          qty: Joi.number(),
          ticketTypeId: Joi.string(),
        })).default([]),
        waitList: Joi.array().items(Joi.object().keys({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          phoneNumber: Joi.string().required(),
          createdAt: Joi.number(),
        })).default([]), upgrades: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          name: Joi.string(),
          price: Joi.number(),
          totalQty: Joi.number(),
          remainingQty: Joi.number(),
          purchaseLimit: Joi.number(),
          complimentary: Joi.boolean(),
          complimentaryWith: Joi.string(),
          complimentaryQty: Joi.number(),
          ticketTypeIds: Joi.array().items(Joi.string()).default([]),
          imageUrl: Joi.string(),
          description: Joi.string(),
          visible: Joi.boolean(),
          rollFees: Joi.boolean(),
        })).default([]),
        promotions: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          code: Joi.string(),
          type: Joi.string(),
          overRideMax: Joi.number(),
          overRideMaxUpg: Joi.number(),
          remainingQty: Joi.number(),
          totalQty: Joi.number(),
          ticketTypeIds: Joi.array().items(Joi.string()).default([]),
          upgradeIds: Joi.array().items(Joi.string()).default([]),
          active: Joi.boolean(),
          startsAt: Joi.number(),
          endsAt: Joi.number(),
          useLimit: Joi.number(),
          discountType: Joi.string(),
          discountValue: Joi.number(),
          appliesTo: Joi.string().optional()
        })).default([]),
        customFields: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          label: Joi.string(),
          type: Joi.string(),
          minLength: Joi.number(),
          maxLength: Joi.number(),
          minValue: Joi.number(),
          maxValue: Joi.number(),
          options: Joi.array().items(Joi.string()).default([]),
          required: Joi.boolean(),
          active: Joi.boolean(),
        })).default([]),
        exchange: {
          allowed: Joi.string().allow(''),
          percent: Joi.number(),
        },
        ticketDeliveryType: Joi.string().default(EventTicketDelivery.Digital),
        physicalDeliveryInstructions: Joi.string().optional().default(""),
        isGuestTicketSale: Joi.boolean().optional().default(false),
        guestTicketPerMember: Joi.string().optional().default(""),
        subscription: Joi.array().items(Joi.object().keys({
          _id: Joi.string(),
          email: Joi.string(),
          frequency: Joi.string(),
        })),
        isHold: Joi.boolean().default(false),
        stub: Joi.string().default(''),

      }
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`updateEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, event } = params.value;
    const performance = event.performances[0];

    if (performance) {
      const { schedule } = event;
      event.schedule.startsAt = schedule.startsAt;
    }

    let alreadyEvent;
    let existingUrlStub;
    try {
      alreadyEvent = await this.storage.findEventById(span, event._id);
      existingUrlStub = await this.storage.findUrlStub(span, event._id, event.stub);
      //Error if stub is already exist
      if (existingUrlStub.urlStubExist) {
        throw new Error("The URL Stub value that you entered has already been used. Please enter a different value.")
      }

      // console.log(alreadyEvent);
    } catch (e) {
      this.logger.error(`publishEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    alreadyEvent = alreadyEvent.toObject();


    if (event.promotions && event.promotions.length > 0) {
      event.promotions = event.promotions.map(promotion => {
        for (let val of alreadyEvent.promotions) {
          if (val._id == promotion._id)
            promotion.remainingQty = promotion.totalQty - (val.totalQty - val.remainingQty)
        }
        return promotion
      })
    }

    if (event.ticketTypes && event.ticketTypes.length > 0) {
      event.ticketTypes = event.ticketTypes.map(ticketType => {
        for (let val of alreadyEvent.ticketTypes) {
          if (val._id == ticketType._id)
            ticketType.remainingQty = ticketType.totalQty - (val.totalQty - val.remainingQty)
          for (let tier in ticketType.tiers) {
            ticketType.tiers[tier].remainingQty = ticketType.remainingQty
          }
        }
        return ticketType
      })
    }

    if (event.isHold) {
      if (event.holds && event.holds.length > 0) {
        event.ticketTypes = event.ticketTypes.map(ticketType => {
          for (let val of event.holds) {
            if (val.ticketTypeId == ticketType._id)
              ticketType.remainingQty = ticketType.remainingQty - val.qty
            // ticketType.totalQty = ticketType.totalQty - val.qty
            //  (val.totalQty - val.remainingQty)
            for (let tier in ticketType.tiers) {
              // ticketType.tiers[tier].totalQty = ticketType.totalQty
              ticketType.tiers[tier].remainingQty = ticketType.remainingQty
            }

          }
          return ticketType
        })
        const totalHolds = event.holds.concat(alreadyEvent.holds);
        event.holds = totalHolds;
      }
    }

    let updatedEvent: IEvent;

    try {

      updatedEvent = await this.storage.updateOneEvent(span, orgId, event);
      response.status = pb.StatusCode.OK;
      response.event = pb.Event.fromObject(updatedEvent);

    } catch (e) {
      this.logger.error(`updateEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
    * Broadcast event update
    */
    const eventUpdatedNotifcation = pb.Broadcast.EventUpdatedNotification.create({
      spanContext: span.context().toString(),
      orgId,
      eventId: updatedEvent._id.toString(),
    });


    try {
      await this.proxy.broadcast.eventUpdated(eventUpdatedNotifcation);
    } catch (e) {
      this.logger.error(`updateEvent - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return response;
  }


  public listEvents = async (request: pb.ListEventsRequest): Promise<pb.ListEventsResponse> => {
    const span = tracer.startSpan('listEvents', request.spanContext);
    const response: pb.ListEventsResponse = pb.ListEventsResponse.create();

    let events: IEvent[];

    try {
      events = await this.storage.listEvents(span, { orgId: request.orgId });
      response.status = pb.StatusCode.OK;
      response.events = events.map(event => pb.Event.fromObject(event));
    } catch (e) {
      this.logger.error(`listEvents - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public queryEvents = async (request: pb.QueryEventsRequest): Promise<pb.QueryEventsResponse> => {
    const span = tracer.startSpan('queryEvents', request.spanContext);
    const response: pb.QueryEventsResponse = pb.QueryEventsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryEvents - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, pagination } = params.value;
    query.orgId = orgId;

    let events: IEvent[];

    try {
      events = await this.storage.queryEvents(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.events = events.map(event => (pb.Event.fromObject(event)));
    } catch (e) {
      this.logger.error(`queryEvents - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }


  public searchEvents = async (request: pb.QuerySearchEventsRequest): Promise<pb.FindEventByIdResponse> => {
    const span = tracer.startSpan('queryEvents', request.spanContext);
    const response: pb.FindEventByIdResponse = pb.FindEventByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional(),
      orgId: Joi.string().optional(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryEvents - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId, query, orgId } = params.value;
    query.orgId = orgId;

    let events: any;
    try {
      events = await this.storage.eventSearch(span, eventId, query);
      response.status = pb.StatusCode.OK;
      response.event = events
    } catch (e) {
      this.logger.error(`queryEvents - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public queryEventsList = async (request: pb.QueryEventsListRequest): Promise<pb.QueryEventsListResponse> => {
    const span = tracer.startSpan('queryEvents', request.spanContext);
    const response: pb.QueryEventsListResponse = pb.QueryEventsListResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional()
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryEvents - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value
    try {
      let events: any = await this.storage.queryEventsList(span, orgId);
      response.status = pb.StatusCode.OK;
      let eventList = []
      for (let val of events) {
        let event = {
          _id: val._id,
          orgId: val.orgId,
          name: val.name,
          active: val.active,
          schedule: val.schedule,
          cancel: val.cancel,
          stub: val.stub,
          published: val.published,
          ticketTypes: await getTicketTypes(val.ticketTypes),
          startsAt: val.schedule.startsAt,
          endsAt: val.schedule.endsAt,
          announceAt: val.schedule.announceAt,
          posterImageUrl: val.posterImageUrl,
          status: await getEventStatus(val),
          venue: null,
          venueTimezone: null,
        }

        const venuerequest = new pb.FindVenueByIdRequest.create({
          spanContext: request.spanContext,
          venueId: val.venueId,
        });
        let { venue } = await this.proxy.venueService.findVenueById(venuerequest);
        event.venue = venue ? venue.name : null;
        event.venueTimezone = venue?.address?.timezone ? venue.address.timezone : "America/Danver";
        eventList.push(event);
      }
      response.events = eventList

    } catch (e) {
      this.logger.error(`queryEvents - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public eventTickets = async (request: pb.EventTicketsRequest): Promise<any> => {
    const span = tracer.startSpan('eventTickets', request.spanContext);
    const response: any = {}//pb.EventTicketsResponse = pb.EventTicketsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional().allow(""),
      seasonId: Joi.string().optional().allow(""),
      promoCode: Joi.string().optional().allow(""),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`EventTickets - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId, promoCode, seasonId } = params.value;



    try {
      let resp = [];
      if (seasonId) {
        // let seasondetail = await this.storage.findSeasonById(span, eventId)
        const findSeasonRequest = pb.FindEventByIdRequest.create({
          spanContext: span.context().toString(),
          seasonId: seasonId
        });

        let findSeasonResponse = await this.proxy.seasonService.findSeasonById(findSeasonRequest);
        let season = (pb.Season.fromObject(findSeasonResponse.season));
        for (let eventpromo of season.promotions) {
          if (eventpromo.code == promoCode) {
            if (eventpromo.type == EventPromotionTypeEnum.PreSale && eventpromo.ticketTypeIds.length == 0) {
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: season.ticketTypes,
                overRideMax: eventpromo.overRideMax
              })
            } else {
              let ticket = []
              for (let val of eventpromo.ticketTypeIds) {
                for (let tick of season.ticketTypes) {
                  if (tick._id == val) {
                    ticket.push(tick)
                  }
                }
              }
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: ticket,
                overRideMax: eventpromo.overRideMax,
              })
            }
          }
        }
      } else {
        let eventdetail = await this.storage.findEventById(span, eventId)
        let event = (pb.Event.fromObject(eventdetail))
        for (let eventpromo of event.promotions) {
          if (eventpromo.code == promoCode) {
            if (eventpromo.type == EventPromotionTypeEnum.PreSale && eventpromo.ticketTypeIds.length == 0 && eventpromo.upgradeIds.length == 0) {
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: event.ticketTypes,
                eventUpgrades: event.upgrades,
                overRideMax: eventpromo.overRideMax,
                overRideMaxUpg: eventpromo.overRideMaxUpg,
                discountType: eventpromo.discountType,
                discountValue: eventpromo.discountValue,
                appliesTo: eventpromo.appliesTo,
              })
            } else {
              let ticket = []
              for (let val of eventpromo.ticketTypeIds) {
                for (let tick of event.ticketTypes) {
                  if (tick._id == val) {
                    ticket.push(tick)
                  }
                }
              }
              let upgrade = []
              for (let val of eventpromo.upgradeIds) {
                for (let tick of event.upgrades) {
                  if (tick._id == val) {
                    upgrade.push(tick)
                  }
                }
              }
              resp.push({
                promoType: eventpromo.type,
                overRideMaxUpg: eventpromo.overRideMaxUpg,
                overRideMax: eventpromo.overRideMax,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: ticket,
                eventUpgrades: upgrade,
                discountType: eventpromo.discountType,
                discountValue: eventpromo.discountValue,
                appliesTo: eventpromo.appliesTo,
              })
            }
          }
        }
      }
      if (resp.length == 0) {
        this.logger.error(`eventTickets - error: Please Enter Valid PromoCode`);
        response.status = pb.StatusCode.NOT_FOUND;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: "Please Enter Valid PromoCode",
        })];
        span.setTag('error', true);
        span.log({ errors: "Please Enter Valid PromoCode" });
        span.finish();
        return response;
      }

      response.status = pb.StatusCode.OK;
      response.tickets = resp;
    } catch (e) {
      this.logger.error(`eventTickets - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  // Discount codes 
  public eventDiscounts = async (request: pb.EventDiscountRequest): Promise<any> => {
    const span = tracer.startSpan('eventDiscounts', request.spanContext);
    const response: any = {}

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional().allow(""),
      seasonId: Joi.string().optional().allow(""),
      discountCode: Joi.string().optional().allow(""),
      userId: Joi.string().optional().allow(""),
      selectedTicket: Joi.array().items(Joi.string()).default([]),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`EventDiscounts - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId, discountCode, seasonId, userId, selectedTicket } = params.value;

    const queryOrdersRequest = pb.QueryOrdersRequest.create({
      spanContext: span.context().toString(),
      query: {
        eventIds: [eventId],
        // state:{ $ne: "Refunded"}
        // userIds:[userId]
      },
    });

    let queryOrderResponse: pb.QueryOrdersResponse;

    try {
      queryOrderResponse = await this.proxy.orderService.queryOrders(queryOrdersRequest);
    } catch (e) {
      this.logger.error(`deleteEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { orders } = queryOrderResponse;
    const usedCode = orders.filter((order) => order?.discountCode?.toLowerCase() === discountCode?.toLowerCase() && order?.userId === userId && order.state !== OrderStateEnum.Refunded && order.state !== OrderItemStateEnum.Canceled);
    try {

      let resp = [];
      if (seasonId) {
        // let seasondetail = await this.storage.findSeasonById(span, eventId)
        const findSeasonRequest = pb.FindEventByIdRequest.create({
          spanContext: span.context().toString(),
          seasonId: seasonId
        });

        let findSeasonResponse = await this.proxy.seasonService.findSeasonById(findSeasonRequest);
        let season = (pb.Season.fromObject(findSeasonResponse.season));
        for (let eventpromo of season.promotions) {
          if (eventpromo.code == discountCode) {
            if (eventpromo.type == EventPromotionTypeEnum.PreSale && eventpromo.ticketTypeIds.length == 0) {
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: season.ticketTypes,
                overRideMax: eventpromo.overRideMax
              })
            } else {
              let ticket = []
              for (let val of eventpromo.ticketTypeIds) {
                for (let tick of season.ticketTypes) {
                  if (tick._id == val) {
                    ticket.push(tick)
                  }
                }
              }
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: ticket,
                overRideMax: eventpromo.overRideMax,
              })
            }
          }
        }
      } else {
        let eventdetail = await this.storage.findEventById(span, eventId)
        let event = (pb.Event.fromObject(eventdetail))
        for (let eventpromo of event.promotions) {
          if (eventpromo.code.toLowerCase() == discountCode.toLowerCase()) {
            let promotionsCode = event.promotions.find((promo) => promo?.code?.toLowerCase() == discountCode?.toLowerCase());
            // if (eventpromo.code == discountCode) {
            //   let promotionsCode = event.promotions.find((promo) => promo?.code === discountCode);
            if (promotionsCode.useLimit <= usedCode.length && userId) {
              this.logger.error(`eventDiscounts - error: This discount code has already been used by this account.`);
              response.status = pb.StatusCode.NOT_FOUND;
              response.errors = [pb.Error.create({
                key: 'Error',
                message: "This discount code has already been used by this account.",
              })];
              span.setTag('error', true);
              span.log({ errors: "This discount code has already been used by this account" });
              span.finish();
              return response;
            }

            let discountCodeExist = false;
            for (let i = 0; i < promotionsCode.ticketTypeIds.length; i++) {
              for (let j = 0; j < selectedTicket.length; j++) {
                if (promotionsCode.ticketTypeIds[i] == selectedTicket[j]) {
                  discountCodeExist = true
                }
              }
            }

            if (promotionsCode.type === 'Discount') {
              if (promotionsCode.ticketTypeIds.length != 0) {
                if (!discountCodeExist && promotionsCode.appliesTo === EventPromotionAppliesToEnum.PerTicket) {
                  this.logger.error(`eventDiscounts - error: This code cannot be applied to your current order.`);
                  response.status = pb.StatusCode.NOT_FOUND;
                  response.errors = [pb.Error.create({
                    key: 'Error',
                    message: "This code cannot be applied to your current order.",
                  })];
                  span.setTag('error', true);
                  span.log({ errors: "This code cannot be applied to your current order." });
                  span.finish();
                  return response;
                }

              }
              else if (selectedTicket.length == 0 && promotionsCode.appliesTo === EventPromotionAppliesToEnum.PerTicket) {
                this.logger.error(`eventDiscounts - error: This code cannot be applied to your current order.`);
                response.status = pb.StatusCode.NOT_FOUND;
                response.errors = [pb.Error.create({
                  key: 'Error',
                  message: "This code cannot be applied to your current order.",
                })];
                span.setTag('error', true);
                span.log({ errors: "This code cannot be applied to your current order." });
                span.finish();
                return response;

              }
            }
            else {
              this.logger.error(`eventDiscounts - error: Please Enter Valid Discount Code`);
              response.status = pb.StatusCode.NOT_FOUND;
              response.errors = [pb.Error.create({
                key: 'Error',
                message: "Please Enter Valid Discount Code",
              })];
              span.setTag('error', true);
              span.log({ errors: "Please Enter Valid Discount Code" });
              span.finish();
              return response;
            }

            // if (promotionsCode.type === 'Discount') {
            //   if (promotionsCode.ticketTypeIds.length !== 0 && !discountCodeExist && promotionsCode.appliesTo === EventPromotionAppliesToEnum.PerTicket) {
            //     handleError("This code cannot be applied to your current order.");
            //   } else if (selectedTicket?.length === 0) {
            //     handleError("This code cannot be applied to your current order.");
            //   }
            // } else {
            //   handleError("Please Enter Valid Discount Code");
            // }

            // function handleError(errorMessage) {
            //   this.logger.error(`eventDiscounts - error: ${errorMessage}`);
            //   response.status = pb.StatusCode.NOT_FOUND;
            //   response.errors = [pb.Error.create({
            //     key: 'Error',
            //     message: errorMessage,
            //   })];
            //   span.setTag('error', true);
            //   span.log({ errors: errorMessage });
            //   span.finish();
            //   return response;
            // }

            let todayDate = Time.now();
            let checkCodeExepiry = eventpromo.startsAt <= todayDate && eventpromo.endsAt >= todayDate;
            if (!checkCodeExepiry) {
              this.logger.error(`eventDiscounts - error: Applied code is expired.`);
              response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
              response.errors = [pb.Error.create({
                key: 'Error',
                message: "Applied code is expired.",
              })];
              span.setTag('error', true);
              span.log({ errors: "Applied code is expired." });
              span.finish();
              return response;
            }
            if (eventpromo.type == EventPromotionTypeEnum.Discount && eventpromo.ticketTypeIds.length == 0 && eventpromo.upgradeIds.length == 0) {
              resp.push({
                promoType: eventpromo.type,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: event.ticketTypes,
                eventUpgrades: event.upgrades,
                overRideMax: eventpromo.overRideMax,
                overRideMaxUpg: eventpromo.overRideMaxUpg,
                discountType: eventpromo.discountType,
                discountValue: eventpromo.discountValue,
                appliesTo: eventpromo.appliesTo,
                ticketTypeIds: eventpromo.ticketTypeIds
              })
            } else {
              let ticket = []
              for (let val of eventpromo.ticketTypeIds) {
                for (let tick of event.ticketTypes) {
                  if (tick._id == val) {
                    ticket.push(tick)
                  }
                }
              }
              let upgrade = []
              for (let val of eventpromo.upgradeIds) {
                for (let tick of event.upgrades) {
                  if (tick._id == val) {
                    upgrade.push(tick)
                  }
                }
              }
              resp.push({
                promoType: eventpromo.type,
                overRideMaxUpg: eventpromo.overRideMaxUpg,
                overRideMax: eventpromo.overRideMax,
                remainingQty: eventpromo.remainingQty,
                active: eventpromo.active,
                startsAt: eventpromo.startsAt,
                endsAt: eventpromo.endsAt,
                eventTickets: ticket,
                eventUpgrades: upgrade,
                discountType: eventpromo.discountType,
                discountValue: eventpromo.discountValue,
                appliesTo: eventpromo.appliesTo,
                ticketTypeIds: eventpromo.ticketTypeIds
              })
            }

          }

        }
      }

      if (resp.length == 0) {
        this.logger.error(`eventDiscounts - error: Please Enter Valid Discount Code`);
        response.status = pb.StatusCode.NOT_FOUND;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: "Please Enter Valid Discount Code",
        })];
        span.setTag('error', true);
        span.log({ errors: "Please Enter Valid Discount Code" });
        span.finish();
        return response;
      }
      response.status = pb.StatusCode.OK;
      response.tickets = resp;
    } catch (e) {
      this.logger.error(`eventDiscounts - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    span.finish();
    return response;
  }

  public findEventById = async (request: pb.FindEventByIdRequest): Promise<pb.FindEventByIdResponse> => {
    const span = tracer.startSpan('findEventById', request.spanContext);
    const response: pb.FindEventByIdResponse = pb.FindEventByIdResponse.create();

    let event: IEvent;
    try {
      event = await this.storage.findEventById(span, request.eventId);
      response.status = pb.StatusCode.OK;
      let eventdetail = event ? pb.Event.fromObject(event) : null;
      if (eventdetail && eventdetail.promotions) {
        for (let promotions of eventdetail.promotions) {
          for (let ticket of promotions.ticketTypeIds) {
            for (let key in eventdetail.ticketTypes) {
              if (eventdetail.ticketTypes[key]._id == ticket) {
                eventdetail.ticketTypes[key].promo = promotions.code
              }
            }
          }
        }
        for (let key in eventdetail.promotions) {
          if (eventdetail.promotions[key].ticketTypeIds != 0) {
            if (eventdetail.promotions[key].type == EventPromotionTypeEnum.PreSale && eventdetail.promotions[key].ticketTypeIds.length == 0) {
              for (let val of eventdetail.ticketTypes) {
                eventdetail.promotions[key].ticketTypeIds.push(val._id)
              }
            }
          }
        }
        // for (let promotions of eventdetail.promotions) {
        //   for (let upgrade of promotions.upgradeIds) {
        //     for (let key in eventdetail.upgrades) {
        //       if (eventdetail.upgrades[key]._id == upgrade) {
        //         eventdetail.upgrades[key].promo = promotions.code
        //       }
        //     }
        //   }
        // }
        // for (let key in eventdetail.promotions) {
        //   if (eventdetail.promotions[key].upgradeIds != 0) {
        //     if (eventdetail.promotions[key].type == EventPromotionTypeEnum.PreSale && eventdetail.promotions[key].upgradeIds.length == 0) {
        //       for (let val of eventdetail.upgrades) {
        //         eventdetail.promotions[key].upgradeIds.push(val._id)
        //       }
        //     }
        //   }
        // }
      }

      response.event = eventdetail
    } catch (e) {
      this.logger.error(`findEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public listEventBySeasonId = async (request: pb.FindSeasonByIdRequest): Promise<pb.ListEventsResponse> => {
    const span = tracer.startSpan('listEventBySeasonId', request.spanContext);
    const response: pb.ListEventsResponse = pb.ListEventsResponse.create();

    let events: IEvent[];

    try {
      events = await this.storage.findSeasonById(span, { seasonId: request.seasonId });
      response.status = pb.StatusCode.OK;
      response.events = events.map(event => pb.Event.fromObject(event));
    } catch (e) {
      this.logger.error(`listEvents - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public findEventDetails = async (request: pb.FindEventByIdRequest): Promise<pb.FindEventDetailsResponse> => {
    const span = tracer.startSpan('findEventById', request.spanContext);
    const response: pb.FindEventDetailsResponse = pb.FindEventDetailsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional(),
      stub: Joi.string().optional()
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { stub, eventId, spanContext } = params.value;

    let event: IEvent;
    try {
      if (stub) {
        let query = {
          stub: stub
        }
        event = await this.storage.findEventByQuery(span, query);
      } else {
        event = await this.storage.findEventById(span, eventId);
      }
      response.status = pb.StatusCode.OK;
      let eventdetail = event ? pb.Event.fromObject(event) : null;
      eventdetail.status = await getEventStatus(eventdetail);

      let ticketIds = [];
      eventdetail.promotions.map(item => {
        if (item.active) {
          item.ticketTypeIds.map(id => {
            if (!ticketIds.includes(id)) {
              ticketIds.push(id);
            }
          })
        }
      })
      eventdetail.remainingQty = 0
      let lowestprice = []
      for (let val of eventdetail.ticketTypes) {
        if (val.visible == true) {
          if (!ticketIds.includes(val._id)) {
            lowestprice.push(val.tiers[0].price)
          }
          eventdetail.remainingQty += val.remainingQty
        }
      }
      const requestOrg = pb.FindOrganizationRequest.create({
        spanContext: spanContext,
        orgId: eventdetail.orgId,
      });
      let org = await this.proxy.organizationService.findOrganization(requestOrg);

      const venuerequest = new pb.FindVenueByIdRequest.create({
        spanContext: spanContext,
        venueId: eventdetail.venueId,
      });
      let venue = await this.proxy.venueService.findVenueById(venuerequest);
      delete org.organization.userId;
      delete org.organization.stripeId;
      eventdetail.organization = org.organization
      eventdetail.venue = venue.venue
      eventdetail.lowestPrice = Math.min(...lowestprice)
      response.event = eventdetail
    } catch (e) {
      this.logger.error(`findEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  public deleteEvent = async (request: pb.DeleteEventRequest): Promise<pb.DeleteEventResponse> => {
    const span = tracer.startSpan('deleteEvent', request.spanContext);
    const response: pb.DeleteEventResponse = pb.DeleteEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId } = params.value;


    const queryOrdersRequest = pb.QueryOrdersRequest.create({
      spanContext: span.context().toString(),
      orgId,
      query: {
        eventIds: [eventId],
      },
    });

    let queryOrderResponse: pb.QueryOrdersResponse;

    try {
      queryOrderResponse = await this.proxy.orderService.queryOrders(queryOrdersRequest);
    } catch (e) {
      this.logger.error(`deleteEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { orders } = queryOrderResponse;

    const ordersRefundedCount = orders.reduce((cur, next) => {
      if (next.state === 'Refunded') {
        return cur + 1;
      }
      return cur;
    }, 0);

    response.ordersCount = orders.length;
    response.ordersRefundedCount = ordersRefundedCount;

    /*
     * All orders need to be in a full refunded
     * state to cancel an event
     */
    if (orders.length !== ordersRefundedCount) {
      response.status = pb.StatusCode.OK;
      response.deleted = false;
      span.finish();
      return response;
    }

    const findWebFlowEntityRequest = pb.FindWebFlowEntityRequest.create({
      spanContext: span.context().toString(),
      orgId,
      selloutId: eventId,
      entityType: 'EVENT',
    });

    let findWebFlowEntityResponse: pb.FindWebFlowEntityResponse;

    try {
      findWebFlowEntityResponse = await this.proxy.webFlowService.findWebFlowEntity(findWebFlowEntityRequest);
    } catch (e) {
      this.logger.error(`deleteEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    const { entity } = findWebFlowEntityResponse;

    if (entity && entity.webFlowIds && entity.webFlowIds.length) {
      const unpublishSiteIds = entity.webFlowIds.map(e => e.webFlowSiteId);

      const publishRequest = pb.PublishEventRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId,
        unpublishSiteIds,
      });

      let publishResponse: pb.PublishEventResponse;
      try {
        publishResponse = await this.publishEvent(publishRequest);
        if (!publishResponse || publishResponse.status !== pb.StatusCode.OK) {
          throw new Error('There was an error unpublishing this event. Please contact support.');
        }
      } catch (e) {
        this.logger.error(`deleteEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    try {
      await this.storage.deleteEvent(span, orgId, eventId);
    } catch (e) {
      this.logger.error(`deleteEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.deleted = true;

    span.finish();
    return response;
  }

  public deleteSubscription = async (request: pb.DeleteSubscriptionRequest): Promise<pb.DeleteSubscriptionResponse> => {
    const span = tracer.startSpan('deleteSubscription', request.spanContext);
    const response: pb.DeleteSubscriptionResponse = pb.DeleteSubscriptionResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      subscriptionId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deleteSubscription - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId, subscriptionId } = params.value;

    try {
      let event;
      try {
        event = await this.storage.findEventById(span, eventId);

        if (!event || !event._id) {
          throw new Error('Could not find event to delete. Please contact support.');
        }

      } catch (e) {
        this.logger.error(`deleteSubscription - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Could not find event to delete. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      event = event.toObject();
      const deleteTaskRequest = pb.DeleteTaskRequest.create({
        spanContext: span.context().toString(),
        eventId: eventId,
        subscriptionId: subscriptionId,
        startedAt: null,
      });
      try {
        const res = this.proxy.taskService.deleteTask(deleteTaskRequest);
        this.logger.info(res);
      } catch (e) {
        this.logger.error(
          `salesReport - error 9 - eventId: ${eventId}: ${e.message}`
        );
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
      }

      let deleteSubscription;

      try {
        deleteSubscription = await this.storage.deleteSubscription(span, eventId, subscriptionId);
        response.status = pb.StatusCode.OK;
        response.event = pb.Event.fromObject(deleteSubscription);
      } catch (e) {
        this.logger.error(`deleteSubscription - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Subscription deletion was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    } catch (e) {
      this.logger.error(`deleteSubscription - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public cancelEvent = async (request: pb.CancelEventRequest): Promise<pb.CancelEventResponse> => {
    const span = tracer.startSpan('CancelEvent', request.spanContext);
    const response: pb.CancelEventResponse = pb.CancelEventResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
    });
    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId } = params.value;
    const queryOrdersRequest = pb.QueryOrdersRequest.create({
      spanContext: span.context().toString(),
      orgId,
      query: {
        eventIds: [eventId],
      },
    });

    let queryOrderResponse: pb.QueryOrdersResponse;

    try {
      queryOrderResponse = await this.proxy.orderService.queryOrders(queryOrdersRequest);
    } catch (e) {
      this.logger.error(`cancelEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { orders } = queryOrderResponse;

    const ordersRefundedCount = orders.reduce((cur, next) => {
      if (next.state === 'Refunded') {
        return cur + 1;
      }
      return cur;
    }, 0);

    response.ordersCount = orders.length;
    response.ordersRefundedCount = ordersRefundedCount;

    /*
     * All orders need to be in a full refunded
     * state to cancel an event
     */
    // if (orders.length !== ordersRefundedCount) {
    //   response.status = pb.StatusCode.OK;
    //   response.cancel = false;
    //   span.finish();
    //   return response;
    // }


    try {
      await this.storage.cancelEvent(span, orgId, eventId);
    } catch (e) {
      this.logger.error(`cancelEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.cancel = true;

    span.finish();
    return response;
  }

  public cancelTicket = async (request: pb.CancelTicketRequest): Promise<pb.CancelTicketResponse> => {
    const span = tracer.startSpan('CancelTicket', request.spanContext);
    const response: pb.CancelTicketResponse = pb.CancelTicketResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      ticketTypeId: Joi.array().optional(),
      upgradesTypeId: Joi.array().optional(),
      promotionCode: Joi.string().optional(),
      discountCode: Joi.string().optional()

    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, eventId, ticketTypeId, upgradesTypeId, discountCode } = params.value;

    try {
      if (ticketTypeId)
        for (let val of ticketTypeId) {
          await this.storage.updateEventTicketsQuantity(span, orgId, eventId, val);
        }
      if (upgradesTypeId)
        for (let val of upgradesTypeId) {
          await this.storage.updateEventUpgradeQuantity(span, orgId, eventId, val);
        }
      // if (promotionCode)
      //   await this.storage.updateEventPromotionQuantity(span, orgId, eventId, promotionCode);
      if (discountCode)
        await this.storage.updateEventPromotionQuantity(span, orgId, eventId, discountCode);

    } catch (e) {
      this.logger.error(`updateEventTickets - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    response.status = pb.StatusCode.OK;
    response.cancel = true;

    span.finish();
    return response;
  }
  public duplicateEvent = async (request: pb.DuplicateEventRequest): Promise<pb.DuplicateEventRequest> => {
    const span = tracer.startSpan('duplicateEvent', request.spanContext);
    const response: pb.DuplicateEventResponse = pb.DuplicateEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`duplicateEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId } = params.value;
    // Use eventId param to find old event
    let oldEvent: IEvent;
    try {
      oldEvent = await this.storage.findEventById(span, eventId);
    } catch (e) {
      this.logger.error(`duplicateEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // Delete and modify needed fields on the copy of the old event
    const HOUR = 1000 * 60 * 60;
    const startOfDay = moment(Date.now()).startOf('day');
    oldEvent._id = shortid.generate();
    oldEvent.name = `Copy of ${oldEvent.name}`;
    oldEvent.schedule = {
      announceAt: Math.floor((Number(startOfDay) + (10 * HOUR)) / 1000),
      ticketsAt: Math.floor((Number(startOfDay) + (10 * HOUR)) / 1000),
      ticketsEndAt: Math.floor((Number(startOfDay) + (20 * HOUR)) / 1000),
      endsAt: Math.floor((Number(startOfDay) + (23 * HOUR)) / 1000),
      startsAt: Math.floor((Number(startOfDay) + (20 * HOUR)) / 1000),
    };
    oldEvent.performances[0].schedule[0] = {
      startsAt: Math.floor((Number(startOfDay) + (20 * HOUR)) / 1000),
      doorsAt: Math.floor((Number(startOfDay) + (19 * HOUR)) / 1000),
      endsAt: Math.floor((Number(startOfDay) + (23 * HOUR)) / 1000),
    };

    let ticketTypeMap = {};
    oldEvent.ticketTypes.forEach((ticket, index) => {
      const newId = new mongoose.Types.ObjectId().toString();
      ticket.remainingQty = ticket.totalQty;
      ticketTypeMap[ticket._id] = newId;
      ticket._id = newId;
      ticket.tiers.forEach((tier) => {
        tier._id = new mongoose.Types.ObjectId().toString();
      });
    });

    oldEvent.upgrades.forEach((upgrade) => {
      upgrade.ticketTypeIds = upgrade.ticketTypeIds.map((ticketId) => {
        return ticketTypeMap[ticketId];
      });
      upgrade.remainingQty = upgrade.totalQty;
      upgrade._id = new mongoose.Types.ObjectId().toString();
    });
    oldEvent.performances.forEach((performance) => {
      performance._id = new mongoose.Types.ObjectId().toString();
    });
    oldEvent = pb.Event.fromObject(oldEvent);

    // Create new event with the modified old event
    const createEventRequest = pb.CreateEventRequest.create({
      spanContext: span.context().toString(),
      orgId: oldEvent.orgId,
      event: oldEvent,
    });

    let createEventResponse: pb.CreateEventResponse;

    try {
      createEventResponse = await this.createEvent(createEventRequest);
      response.status = pb.StatusCode.OK;
      response.event = createEventResponse.event;
    } catch (e) {
      this.logger.error(`duplicateEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public orderCreated = async (request: pb.Broadcast.OrderCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('orderCreated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      order: Joi.object(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`orderCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { order }: { order: IOrder } = params.value;

    try {
      await this.storage.processSale(
        span,
        order.orgId,
        order.eventId,
        order.tickets || [],
        order.upgrades || [],
        order.promotionCode || null,
        order.discountCode || null
      );

    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    /**
    * Broadcast event update
    */
    const eventUpdatedNotifcation = pb.Broadcast.EventUpdatedNotification.create({
      spanContext: span.context().toString(),
      orgId: order.orgId,
      eventId: order.eventId,
    });

    try {
      await this.proxy.broadcast.eventUpdated(eventUpdatedNotifcation);
    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return;
  }

  public orderRefunded = async (request: pb.Broadcast.OrderRefundedNotification): Promise<void> => {
    const span = tracer.startSpan('orderRefunded', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      order: Joi.object(),
      orgId: Joi.string().required(),
      userId: Joi.string().required(),
      orderId: Joi.string().required(),
      eventId: Joi.string().required(),
      venueIds: Joi.array().optional().default([]),
      artistIds: Joi.array().optional().default([]),
      refundAmount: Joi.number().required(),
      totalRefundedAmount: Joi.number().required(),
      isFullyCanceled: Joi.boolean().required(),
      isFullyRefunded: Joi.boolean().required(),
      refundedTickets: Joi.array().optional().default([]),
      refundedUpgrades: Joi.array().optional().default([]),
    });

    const params = schema.validate(request);


    if (params.error) {
      this.logger.error(`orderRefunded - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const {
      orgId,
      eventId,
      refundAmount,
      isFullyRefunded,
      refundedTickets,
      refundedUpgrades,
      order,
    } = params.value;

    try {
      await this.storage.orderRefunded(
        span,
        orgId,
        eventId,
        refundAmount,
        refundedTickets,
        refundedUpgrades,
        isFullyRefunded,
        order,
      );
    } catch (e) {
      this.logger.error(`orderRefunded - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    /**
    * Broadcast event update
    */
    const eventUpdatedNotifcation = pb.Broadcast.EventUpdatedNotification.create({
      spanContext: span.context().toString(),
      orgId,
      eventId,
    });

    try {
      await this.proxy.broadcast.eventUpdated(eventUpdatedNotifcation);
    } catch (e) {
      this.logger.error(`orderRefunded - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    span.finish();
    return;
  }


  public salesReport = async (request: pb.SalesReportRequest): Promise<pb.SalesReportResponse> => {
    const span = tracer.startSpan('salesReport', request.spanContext);
    const response: pb.SalesReportResponse = pb.SalesReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      params: Joi.object().keys({
        eventId: Joi.string().required(),
        email: Joi.string().required(),
        frequency: Joi.string().required()
      })
    });


    // const params = schema.validate(request);
    const validation = schema.validate(request);

    if (validation.error) {
      this.logger.error(`salesReport - error: ${JSON.stringify(validation.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }
    const { params, orgId } = validation.value;
    try {
      let alreadyEvent
      try {
        alreadyEvent = await this.storage.findEventById(span, params.eventId);
        const alreadyEmailExists = alreadyEvent && alreadyEvent.subscription.find(item => item.email == params.email)
        if (alreadyEmailExists) {
          this.logger.error(`salesReport - error 4: Email already exists`);
          response.status = pb.StatusCode.BAD_REQUEST;
          response.errors = [
            pb.Error.create({
              key: "Error",
              message: "Email already exists",
            }),
          ];
          span.setTag("error", true);
          span.log({ errors: "Email already exists" });
          span.finish();
          return response;
        }

        alreadyEvent.subscription.push({
          email: params.email,
          frequency: params.frequency
        })

      } catch (e) {
        this.logger.error(`salesReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      alreadyEvent = alreadyEvent.toObject();
      let updatedEvent: IEvent;

      try {
        updatedEvent = await this.storage.updateOneEvent(span, orgId, alreadyEvent);
        response.status = pb.StatusCode.OK;
        response.event = pb.Event.fromObject(updatedEvent);
      } catch (e) {
        this.logger.error(`salesReport - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      let executeAt = Time.now();
      const findEmail = response.event.subscription.find(item => item.email == params.email)
      const createTaskRequest = pb.CreateTaskRequest.create({
        spanContext: span.context().toString(),
        task: [
          {
            eventId: params.eventId,
            taskType: TaskTypes.SalesReport,
            executeAt: executeAt,
            orgId: orgId,
            subscription: findEmail
          },
        ],
      });
      try {
        const res = await this.proxy.taskService.createTask(createTaskRequest);
        this.logger.info(res);
      } catch (e) {
        this.logger.error(
          `salesReport - error 9 - eventId: ${params.eventId}: ${e.message}`
        );
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
      }
    } catch (e) {
      this.logger.error(`salesReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    span.finish();
    return response;
  }

  public createWaitList = async (request: pb.WaitListRequest): Promise<pb.WaitListResponse> => {
    const span = tracer.startSpan('createWaitList', request.spanContext);
    const response: pb.WaitListResponse = pb.WaitListResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().required(),
      type: Joi.string().required(),
      orgId: Joi.string().optional(),
      params: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().required()
      })
    });


    // const params = schema.validate(request);
    const validation = schema.validate(request);

    if (validation.error) {
      this.logger.error(`createWaitList - error: ${JSON.stringify(validation.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }
    const { params, eventId, type } = validation.value;
    console.log(eventId, type)
    try {
      let alreadyEvent
      try {
        alreadyEvent = await this.storage.findEventById(span, eventId);
        const alreadyEmailExists = alreadyEvent && alreadyEvent.waitList.find(item => item.email?.toLowerCase() == params.email?.toLowerCase());
        const alreadyPhoneExists = alreadyEvent && alreadyEvent.waitList.find(item => item.phoneNumber == params.phoneNumber);
        // if (alreadyEmailExists) {
        //   this.logger.error(`createWaitList - error 4: This email is already exist in wait list.`);
        //   response.status = pb.StatusCode.BAD_REQUEST;
        //   response.errors = [
        //     pb.Error.create({
        //       key: "Error",
        //       message: "This email is already exist in wait list.",
        //     }),
        //   ];
        //   span.setTag("error", true);
        //   span.log({ errors: "This email is already exist in wait list" });
        //   span.finish();
        //   return response;
        // }
        if (alreadyEmailExists && alreadyPhoneExists) {
          throw new Error('This email and phone number is already on wait list!');
        }
        if (alreadyEmailExists) {
          throw new Error(' This email is already on the wait list!');
        }
        if (alreadyPhoneExists) {
          throw new Error('This phone number is already on the wait list!');
        }
        alreadyEvent.waitList.push({
          email: params.email,
          name: params.name,
          phoneNumber: params.phoneNumber,
          createdAt: Time.now()
        })

      } catch (e) {
        this.logger.error(`createWaitList - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      alreadyEvent = alreadyEvent.toObject();
      let updatedEvent: IEvent;

      try {
        updatedEvent = await this.storage.updateOneEvent(span, alreadyEvent.orgId, alreadyEvent, eventId);
        response.status = pb.StatusCode.OK;
        response.event = pb.Event.fromObject(updatedEvent);
      } catch (e) {
        this.logger.error(`createWaitList - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      const requestOrg = pb.FindOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId: updatedEvent.orgId,
      });
      let org = await this.proxy.organizationService.findOrganization(requestOrg);
      let orgName = org?.organization?.orgName
      let venue;
      const listVenueRequest = new pb.ListEventFeesRequest.create({
        spanContext: span.context().toString(),
        venueId: updatedEvent.venueId,
      });
      try {
        venue = await this.proxy.venueService.findVenueById(
          listVenueRequest
        );
      } catch (e) {
        // errorSpan(span, e);
        throw e;
      }

      const venueName = venue?.venue?.name
      const venueAddress1 = `${venue.venue.address.address1} ${venue.venue.address.address2}`;
      const venueAddress2 = `${venue.venue.address.city}, ${venue.venue?.address.state} ${venue.venue?.address.zip}`;
      const timezone =
        venue.venue && venue.venue?.address && venue.venue.address.timezone
          ? venue.venue?.address.timezone
          : "America/Denver";
      const cityState = `${venue.venue?.address.city}, ${venue.venue.address.state}`;
      const performanceSchedules = updatedEvent?.performances.reduce(
        (cur, next) => {
          if (next.schedule.length == 1) {
            cur.doorsAt.push(next.schedule[0].doorsAt);
            cur.startsAt.push(next.schedule[0].startsAt);
            cur.endsAt.push(next.schedule[0].endsAt);
          } else {
            next.schedule.map((sdl) => {
              cur.doorsAt.push(sdl.doorsAt);
              cur.startsAt.push(sdl.startsAt);
              cur.endsAt.push(sdl.endsAt);
            });
          }
          return cur;
        },
        {
          doorsAt: [],
          startsAt: [],
          endsAt: [],
        }
      );
      let dayIds = [];
      let dayIdsTime = [];
      const perfomancesArray = performanceSchedules.startsAt.map(
        (date, index) => {
          return {
            startsAt: date,
            endsAt: performanceSchedules.endsAt[index],
            doorsAt: performanceSchedules.doorsAt[index],
          };
        }
      );
      dayIdsTime = perfomancesArray.filter(
        (start, index) => !dayIds.includes(start.startsAt)
      );
      const doorsAt = Math.min(...performanceSchedules?.doorsAt);
      const startsAt = Math.min(...performanceSchedules?.startsAt);
      const waitListEmailRequest =
      pb.QueueOrderQRCodeEmailRequest.create({
        spanContext: span.context().toString(),
        toAddress: params.email || params.email,
        firstName: params.name || "Guest",
        eventName: updatedEvent.name,
        orgName: orgName,
        eventSubtitle: updatedEvent.subtitle,
        venueName: venueName,
        eventDate: Time.format(
          updatedEvent.schedule.startsAt,
          "ddd, MMM Do",
          timezone
        ),
        eventStart: updatedEvent.schedule.startsAt,
        eventEnd: updatedEvent.schedule.endsAt,
        doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
        showAt: Time.formatTimeOfDay(startsAt, timezone),
        eventPosterImageUrl: updatedEvent.posterImageUrl,
        dayIdsTime,
        cityState,
        venuePosterImageUrl: venue.venue.imageUrls[0],
        venueAddress1,
        venueAddress2,
        timezone,
        ticketDeliveryType: updatedEvent.ticketDeliveryType,
        physicalDeliveryInstructions: updatedEvent.physicalDeliveryInstructions
      });

      try {

        await this.proxy.emailService.waitListEmail(
          waitListEmailRequest
        );
        response.status = pb.StatusCode.OK;
      } catch (e) {
        this.logger.error(`waitListEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: "Error",
            message: e.message,
          }),
        ];
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
      // response.message =`You have been added to the wait list for ${updatedEvent.name}. Please check your email for further information.`


    } catch (e) {
      this.logger.error(`createWaitList - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    span.finish();
    return response;
  }

  // updateholds for tickets 
  public updateHolds = async (request: pb.HoldTicketRequest): Promise<pb.HoldTicketResponse> => {
    const span = tracer.startSpan('Holdticket', request.spanContext);
    const response: pb.HoldTicketResponse = pb.HoldTicketResponse.create();
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      eventId: Joi.string().optional(),
      hold: {
        _id: Joi.string(),
        name: Joi.string(),
        ticketType: Joi.string(),
        totalHeld: Joi.number(),
        totalCheckedIn: Joi.number(),
        totalReleased: Joi.number(),
        totalOutstanding: Joi.number(),
        qty: Joi.number(),
        ticketTypeId: Joi.string(),

      }
    })
    const validation = schema.validate(request);
    if (validation.error) {
      this.logger.error(`Holdticket - error: ${JSON.stringify(validation.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }
    try {
      const { hold, orgId, eventId } = validation.value;
      let eventDetails = await this.storage.findByHoldId(span, hold._id);
      const prevHoldTicket = eventDetails.holds.find(({ _id }) => _id === hold._id);
      let release = 0;
      release = hold.totalReleased - prevHoldTicket.totalReleased;
      eventDetails = await this.storage.holdTicket(span, orgId, eventId, release, hold);
      response.status = pb.StatusCode.OK;
      response.event = eventDetails;
    } catch (e) {
      this.logger.error(`Holdticket - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    span.finish();
    return response;
  }



  public generateWaitListReport = async (request: pb.GenerateWaitListReportRequest): Promise<pb.GenerateWaitListReportResponse> => {
    const span = tracer.startSpan('generateProfileReport', request.spanContext);
    const response: pb.GenerateWaitListReportResponse = pb.GenerateWaitListReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
      userId: Joi.string().optional(),
      eventId: Joi.string().optional(),

    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`generateProfileReport - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId } = params.value;

    // query.orgId = orgId;

    let venue
    let event: IEvent;

    try {
      event = await this.storage.findEventById(span, eventId);
    } catch (e) {
      this.logger.error(`generateProfileReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    const transformed: any[] = await Promise.all(event.waitList.map(async (item): Promise<any> => {
      const listVenueRequest = new pb.ListEventFeesRequest.create({
        spanContext: span.context().toString(),
        venueId: event.venueId,
      });
      try {
        venue = await this.proxy.venueService.findVenueById(
          listVenueRequest
        );
      } catch (e) {
        // errorSpan(span, e);
        throw e;
      }
      const timezone = venue?.venue?.address?.timezone || "America/Denver";
      return {
        Name: item?.name,
        Email: item?.email,
        'Phone Number': item?.phoneNumber,
        'Date for Waiting List': Time.format(item?.createdAt, "MM/DD/YYYY, h:mma", timezone) + "(" + timezone + ")"
      };
    }));
    let noWaitListObj = {
      Name: "",
      Email: '',
      'Phone Number': "",
      'Date for Waiting List': ""
    };
    const csv = await CSV.fromJson(Object.keys(transformed[0] || noWaitListObj), transformed);
    const file = {
      file: Buffer.from(csv, 'utf8'),
      filename: 'wait-list.csv',
      mimetype: 'text/csv',
      encoding: 'utf8',
    };
    const uploadFileRequest = pb.UploadFileRequest.create({
      spanContext: span.context().toString(),
      orgId,
      files: [file],
    });
    let uploadFileResponse: pb.UploadFileResponse;

    try {
      uploadFileResponse = await this.proxy.fileUploadService.uploadFile(uploadFileRequest);
    } catch (e) {
      throw e;
    }

    const { url } = uploadFileResponse.files[0];
    response.url = url;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }
  
  // this function generating notify task
  public notifyEvent = async (request: pb.NotifyMeReportRequest): Promise<pb.FindEventByIdResponse> => {
    const span = tracer.startSpan('notifyEvent', request.spanContext);
    const response: pb.FindEventByIdResponse = pb.FindEventByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      eventId: Joi.string().optional(),
      email: Joi.string().optional()
    });

    const validation = schema.validate(request);

    if (validation.error) {
      this.logger.error(`notifyEvent - error: ${JSON.stringify(validation.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(validation.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: validation.error });
      span.finish();
      return response;
    }
    const { eventId, email } = validation.value;
    try {
      let alreadyEvent
      try {
        alreadyEvent = await this.storage.findEventById(span, eventId);
      } catch (e) {
        this.logger.error(`notifyEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }

      alreadyEvent = alreadyEvent.toObject();
      let executeAt = alreadyEvent?.schedule?.ticketsAt - 3600;
      const createTaskRequest = pb.CreateTaskRequest.create({
        spanContext: span.context().toString(),
        task: [
          {
            eventId: eventId,
            taskType: TaskTypes.NotifyEvent,
            executeAt: executeAt,
            email: email
          },
        ],
      });
      try {
        const res = await this.proxy.taskService.createTask(createTaskRequest);
        this.logger.info(res);
        response.status = pb.StatusCode.OK;
        response.event = pb.Event.fromObject(alreadyEvent);
      } catch (e) {
        this.logger.error(
          `notifyEvent - error 9 - eventId: ${eventId}: ${e.message}`
        );
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
      }
      const venueRequest = new pb.FindVenueByIdRequest.create({
        spanContext: span.context().toString(),
        venueId: alreadyEvent.venueId
      });

      let venue: pb.FindVenueByIdResponse;
      try {
        venue = await this.proxy.venueService.findVenueById(venueRequest)
      } catch (e) {
        throw e;
      }
      const venueAddress1 = `${venue.venue.address.address1} ${venue.venue.address.address2}`;
      const venueAddress2 = `${venue.venue.address.city}, ${venue.venue?.address.state} ${venue.venue?.address.zip}`;
      const timezone =
        venue.venue && venue.venue?.address && venue.venue.address.timezone
          ? venue.venue?.address.timezone
          : "America/Denver";

          const performanceSchedules = alreadyEvent?.performances.reduce(
            (cur, next) => {
              if (next.schedule.length == 1) {
                cur.doorsAt.push(next.schedule[0].doorsAt);
                cur.startsAt.push(next.schedule[0].startsAt);
                cur.endsAt.push(next.schedule[0].endsAt);
              } else {
                next.schedule.map((sdl) => {
                  cur.doorsAt.push(sdl.doorsAt);
                  cur.startsAt.push(sdl.startsAt);
                  cur.endsAt.push(sdl.endsAt);
                });
              }
              return cur;
            },
            {
              doorsAt: [],
              startsAt: [],
              endsAt: [],
            }
          );
          let dayIds = [];
          let dayIdsTime = [];
          // let dayIdsTimeCalendar = [];
          const perfomancesArray = performanceSchedules.startsAt.map(
            (date, index) => {
              return {
                startsAt: date,
                endsAt: performanceSchedules.endsAt[index],
                doorsAt: performanceSchedules.doorsAt[index],
              };
            }
          );
          dayIdsTime = perfomancesArray.filter(
            (start, index) => !dayIds.includes(start.startsAt)
          );
        const doorsAt = Math.min(...performanceSchedules?.doorsAt);
        const startsAt = Math.min(...performanceSchedules?.startsAt);

      const cityState = `${venue.venue?.address.city}, ${venue.venue.address.state}`;
      let description = `You have Notify for ${alreadyEvent?.name}.`
      const sendNotifyMeEmailRequest =
        pb.QueueOrderQRCodeEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: email,
          eventId: eventId,
          orgName: "",
          // url: `${EMBED_URL}/?eventId=${eventId}`,
          eventName: alreadyEvent?.name,
          eventSubtitle: alreadyEvent.subtitle,
          venueName: venue.venue.name,
          eventPosterImageUrl: alreadyEvent.posterImageUrl,
          cityState,
          venueAddress1,
          venueAddress2,
          timezone,
          ticketDeliveryType: alreadyEvent.ticketDeliveryType,
          physicalDeliveryInstructions: alreadyEvent.physicalDeliveryInstructions,
          description,
          venuePosterImageUrl: venue.venue.imageUrls[0],
          doorsAt: Time.formatTimeOfDay(doorsAt, timezone),
          showAt: Time.formatTimeOfDay(startsAt, timezone),
          dayIdsTime,
        });
      try {
        await this.proxy.emailService.immediateNotifyEmail(
          sendNotifyMeEmailRequest
        );
      } catch (e) {
        this.logger.error(`notifyMeEmail - error: ${e.message}`);
        span.setTag("error", true);
        span.log({ errors: e.message });
        span.finish();
        // return response;
      }

      
    } catch (e) {
      this.logger.error(`notifyEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    span.finish();
    return response;
  }

}

const getTicketTypes = (tickets) => {
  let filterTicket = []
  for (let ticket of tickets) {
    let ticketObj = {
      name: ticket.name,
      purchaseLimit: ticket.purchaseLimit,
      value: ticket?.values || 0,
      price: ticket?.tiers[0]?.price || 0,
      ticketsAvailable: ticket.remainingQty > 0 ? true : false
    }
    filterTicket.push(ticketObj)
  }
  return filterTicket
}

const getEventStatus = (event) => {
  const now = Time.now();

  const s = event.schedule;
  const announceAt = s.announceAt as number;
  const ticketsAt = s.ticketsAt as number;
  const ticketsEndAt = s.ticketsEndAt as number;
  const startsAt = s.startsAt as number;
  const endsAt = s.endsAt as number;

  // if (!webFlowEntity || !webFlowEntity.webFlowIds || !webFlowEntity.webFlowIds.length) {
  //   return EventStatusEnum.Draft;
  // }

  // TODO: cancelled status
  if (startsAt < now && endsAt > now && !event.cancel) {
    return "Live";
  }

  if (!event.published && !event.cancel) {
    return "Draft";
  }

  const remainingQty = event?.ticketTypes?.reduce((cur, next) => {
    return cur + next.remainingQty;
  }, 0);


  if (remainingQty !== undefined && remainingQty <= 0 && !event.cancel) {
    return "Sold Out";
  }

  if (now < announceAt && !event.cancel) {
    return "Pre Announced";
  }

  if (announceAt < now && now < ticketsAt && !event.cancel) {
    return "Announced";
  }

  if (endsAt < now && !event.cancel) {
    return "Past";
  }

  if (ticketsEndAt < now && !event.cancel) {
    return "Sales Ended";
  }

  if (event.published && !event.cancel) {
    return "On Sale";
  }

  if (event.cancel) {
    return "Cancelled";
  }
  return "Draft";
}


