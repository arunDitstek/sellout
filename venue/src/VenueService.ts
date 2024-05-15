import * as pb from '@sellout/models/.dist/sellout-proto';
import Joi from '@hapi/joi';
import * as Time from '@sellout/utils/.dist/time';
import * as GoogleTimezoneAPI from '@sellout/utils/.dist/GoogleTimezoneAPI';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors, { joiToErrorMessages } from '@sellout/service/.dist/joiToErrors';
import { Venue } from './Venue';
import VenueStore from './VenueStore';
import IVenue  from '@sellout/models/.dist/interfaces/IVenue';
import Tracer  from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';

const tracer = new Tracer('VenueService');

export default class VenueService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.VenueService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new VenueService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new VenueStore(Venue),
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
      createVenue: new PbMessageHandler(
        this.createVenue,
        pb.CreateVenueRequest,
        pb.CreateVenueResponse,
      ),
      updateVenue: new PbMessageHandler(
        this.updateVenue,
        pb.UpdateVenueRequest,
        pb.UpdateVenueResponse,
      ),
      listPromoterVenues: new PbMessageHandler(
        this.listPromoterVenues,
        pb.ListPromoterVenuesRequest,
        pb.ListPromoterVenuesResponse,
      ),
      queryVenues: new PbMessageHandler(
        this.queryVenues,
        pb.QueryVenuesRequest,
        pb.QueryVenuesResponse,
      ),
      queryGlobalVenues: new PbMessageHandler(
        this.queryGlobalVenues,
        pb.QueryGlobalVenuesRequest,
        pb.QueryGlobalVenuesResponse,
      ),
      findVenueById: new PbMessageHandler(
        this.findVenueById,
        pb.FindVenueByIdRequest,
        pb.FindVenueByIdResponse,
      ),
    });
  }
  public createVenue = async (request: pb.CreateVenueRequest): Promise<pb.CreateVenueResponse> => {
    const span = tracer.startSpan('createVenue', request.spanContext);
    const response: pb.CreateVenueResponse = pb.CreateVenueResponse.create();

    const addressError = 'One or more address fields are missing. Street, city, zip code, and state are required';
    const schema = Joi.object().options({ abortEarly: false }).keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venue: {
        name: Joi.string().required().messages({ 'any.required': 'Venue name is a required field' }),
        orgId: Joi.any().default(null),
        venueGlobalId: Joi.any().default(null),
        description: Joi.string().optional().messages({ 'any.required': 'Venue description is a required field' }),
        capacity: Joi.number().optional().messages({ 'any.required': 'Venue Capacity is a required field' }),
        address: Joi.object().options({ abortEarly: true }).keys({
          address1: Joi.string().required().messages({ 'string.empty': addressError }),
          address2: Joi.any(),
          city: Joi.string().required().messages({ 'string.empty': addressError }),
          state: Joi.string().required().messages({ 'string.empty': addressError }),
          zip: Joi.string().required().messages({ 'string.empty': addressError }),
          lat: Joi.number().required().messages({ 'any.required': addressError }),
          lng: Joi.number().required().messages({ 'any.required': addressError }),
          placeId: Joi.string().required().messages({ 'string.empty': addressError }),
          placeName: Joi.string().required().messages({ 'string.empty': addressError }),
          country: Joi.any(),
          phone: Joi.any(),
        }),
        url: Joi.any(),
        tax: Joi.number().precision(2).min(0).optional(),
        imageUrls: Joi.any().required().messages({ 'any.required': 'Venue image is a required field' }),
      },
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createVenue - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrorMessages(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, venue } = params.value;

    try {
      const { address: { lat, lng } } = venue;
      const { timeZoneId } = await GoogleTimezoneAPI.info(lat, lng);
      venue.address.timezone = timeZoneId;
    } catch (e) {
      this.logger.error(`createVenue - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to retrieve venue location information',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    venue.createdAt = Time.now();

    let globalVenue: IVenue;
    if (!venue.venueGlobalId) {
      try {
        globalVenue = await this.storage.createVenue(span, venue);
      } catch (e) {
        this.logger.error(`createVenue - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Global venue creation was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }

      venue.venueGlobalId = globalVenue._id;
    }

    venue.orgId = orgId;

    let promoterVenue: IVenue;
    try {
      promoterVenue = await this.storage.createVenue(span, venue);
      response.status = pb.StatusCode.OK;
      response.venue = pb.Venue.fromObject(promoterVenue);
    } catch (e) {
      this.logger.error(`createVenue - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Venue creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Broadcast venue creation
    */
    const venueCreatedNotification = pb.Broadcast.VenueCreatedNotification.create({
      spanContext: span.context().toString(),
      orgId,
      venueId: promoterVenue._id.toString(),
    });

    try {
      await this.proxy.broadcast.venueCreated(venueCreatedNotification);
    } catch (e) {
      this.logger.error(`createVenue - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
    }

    span.finish();
    return response;
  }
  public updateVenue = async (request: pb.UpdateVenueRequest): Promise<pb.UpdateVenueResponse> => {
    const span = tracer.startSpan('updateVenue', request.spanContext);
    const response: pb.UpdateVenueResponse = pb.UpdateVenueResponse.create();
    const addressError = 'One or more address fields are missing. Street, city, zip code, and state are required';
    const schema = Joi.object().options({ abortEarly: false }).keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venue: {
        _id: Joi.string().required(),
        orgId: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string().allow('').default(''),
        capacity: Joi.number().default(''),
        address: Joi.object().options({ abortEarly: true }).keys({
          address1: Joi.string().required().messages({ 'string.empty': addressError }),
          address2: Joi.any(),
          city: Joi.string().required().messages({ 'string.empty': addressError }),
          state: Joi.string().required().messages({ 'string.empty': addressError }),
          zip: Joi.string().required().messages({ 'string.empty': addressError }),
          lat: Joi.number().required().messages({ 'any.required': addressError }),
          lng: Joi.number().required().messages({ 'any.required': addressError }),
          placeId: Joi.string().required().messages({ 'string.empty': addressError }),
          placeName: Joi.string().required().messages({ 'string.empty': addressError }),
          country: Joi.any(),
          phone: Joi.any(),
        }),
        url: Joi.string().default(''),
        tax: Joi.number().precision(2).min(0).optional(),
        imageUrls: Joi.any().default([]),
        venueGlobalId: Joi.string(),
      },
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`updateVenue - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error});
      span.finish();
      return response;
    }

    const { venue, orgId } = params.value;

    let updatedVenue: IVenue;

    try {
      const { address: { lat, lng } } = venue;
      const { timeZoneId } = await GoogleTimezoneAPI.info(lat, lng);
      venue.address.timezone = timeZoneId;
      updatedVenue = await this.storage.updateOneVenue(span, orgId, venue);
      if (!updatedVenue) {
        throw new Error(`Venue with id ${request.venue._id} does not exist.`);
      }
      const eventRequest = pb.QueryEventsRequest.create({
        spanContext: span.context().toString(),
        orgId: orgId,
        query: {
          venueIds: [request.venue._id]
        }
     });
     let eventResponse: pb.QueryEventsResponse;

     try {
      eventResponse = await this.proxy.eventService.queryEvents(eventRequest);
        if (eventResponse.status !== pb.StatusCode.OK) {
           throw new Error('Unable to query user profiles');
        }

        const { events } = eventResponse;
        for(let val of events) {
          const listFeesRequest = new pb.updateFeeByEventRequest.create({
            spanContext: span.context().toString(),
            eventId: val._id,
            name: 'Sales tax',
            value: venue.tax
         });
         await this.proxy.feeService.updateFeeByEvent(listFeesRequest);
        }
          
     } catch (e) {
        this.logger.error(`queryOrders - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
           pb.Error.create({
              key: 'Error',
              message: e.message
           })
        ];
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
     }
    //   const listFeesRequest = new pb.ListFeesByIdRequest.create({
    //     spanContext: span.context().toString(),
    //     orgId: orgId,
    //     feeIds: feeIds,
    //  });

    //  let listFeesResponse: pb.ListEventFeesResponse;
    //  try {
    //     listFeesResponse = await this.proxy.feeService.listFeesById(listFeesRequest);
    //     if (listFeesResponse.status !== pb.StatusCode.OK) {
    //        throw new Error('Failed to fetch order fees.');
    //     }
    //  } catch (e) {
    //     this.logger.error(`orderEntities - error: ${e.message}`);
    //     throw new Error(`Failed to fetch order fees: ${e.message}`);
    //  }
      response.status = pb.StatusCode.OK;
      response.venue = pb.Venue.fromObject(updatedVenue);
    } catch (e) {
      this.logger.error(`updateVenue - error : ${JSON.stringify(e)}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Broadcast venue update
    */
    const venueUpdatedNotifcation = pb.Broadcast.VenueUpdatedNotification.create({
      spanContext: span.context().toString(),
      venueId: updatedVenue._id.toString(),
      orgId,
    });

    try {
      await this.proxy.broadcast.venueUpdated(venueUpdatedNotifcation);
    } catch (e) {
      this.logger.error(`updateVenue - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
    }

    span.finish();
    return response;
  }
  public listPromoterVenues = async(request: pb.ListPromoterVenuesRequest): Promise<pb.ListPromoterVenuesResponse> => {
    const span = tracer.startSpan('listPromoterVenues', request.spanContext);
    const response: pb.ListPromoterVenuesResponse = pb.ListPromoterVenuesResponse.create();

    let venues: IVenue[];

    try {
      venues = await this.storage.listVenues(span, { orgId: request.orgId });
      response.status = pb.StatusCode.OK;
      response.venues = venues.map(v => pb.Venue.fromObject(v));
    } catch (e) {
      this.logger.error(`listPromoterVenues - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public queryVenues = async (request: pb.QueryVenuesRequest): Promise<pb.QueryVenuesResponse> => {
    const span = tracer.startSpan('queryVenues', request.spanContext);
    const response: pb.QueryVenuesResponse = pb.QueryVenuesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryVenues - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, pagination } = params.value;

    query.orgId = orgId;

    let venues: IVenue[];

    try {
      venues = await this.storage.queryVenues(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.venues = venues.map(venue => (pb.Venue.fromObject(venue)));
    } catch (e) {
      this.logger.error(`queryVenues - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public queryGlobalVenues = async (request: pb.QueryGlobalVenuesRequest): Promise<pb.QueryGlobalVenuesResponse> => {
    const span = tracer.startSpan('queryGlobalVenues', request.spanContext);
    const response: pb.QueryGlobalVenuesResponse = pb.QueryGlobalVenuesResponse.create();

    let venues: IVenue[];
    const pagination = request.pagination;
    const query = request.query.reduce((cur, next) => {
      return {
        ...cur,
        [next.key]: {
          $regex: new RegExp(`^${next.value}`, 'i'),

        },
      };
    },                                 {});

    query.orgId = null;
    query.venueGlobalId = null;

    try {
      venues = await this.storage.listVenues(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.venues = venues.map(v => pb.Venue.fromObject(v));
    } catch (e) {
      this.logger.error(`queryGlobalVenues - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  public findVenueById = async (request: pb.FindVenueByIdRequest): Promise<pb.FindVenueByIdRequest> => {
    const span = tracer.startSpan('findVenueById', request.spanContext);
    const response: pb.FindVenueByIdRequest = pb.FindVenueByIdRequest.create();

    let venue: IVenue;
    try {
      venue = await this.storage.findVenueById(span, request.venueId);
      response.status = pb.StatusCode.OK;
      response.venue = venue ? pb.Venue.fromObject(venue) : null;
    } catch (e) {
      this.logger.error(`findVenue - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
}
