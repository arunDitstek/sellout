import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import BaseService from '@sellout/service/.dist/BaseService';
import Joi from '@hapi/joi';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors, { joiToErrorMessages } from '@sellout/service/.dist/joiToErrors';
import { Season } from './Season';
import SeasonStore from './SeasonStore';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';
import Tracer from '@sellout/service/.dist/Tracer';
import ISeason from '@sellout/models/.dist/interfaces/ISeason';
import { EventProcessAsEnum, SendQRCodeEnum, EventAgeEnum } from '@sellout/models/.dist/interfaces/IEvent';
import { EventPromotionTypeEnum } from '@sellout/models/.dist/interfaces/IEventPromotion';
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
const tracer = new Tracer('SeasonService');
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import IOrder from '@sellout/models/.dist/interfaces/IOrder';

export default class SeasonService extends BaseService {

   public proxy: IServiceProxy;

   constructor(opts) {
      super(opts);
      this.proxy = proxyProvider(this.connectionMgr);
   }
   public static main() {
      const serviceName = pb.SeasonService.name;
      const logger = new ConsoleLogManager({
         serviceName,
      });
      const service = new SeasonService({
         serviceName,
         connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
         logManager: logger,
         storageManager: new SeasonStore(Season),
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
      this.connectionMgr.subscribe(this.serviceName, "api", {
         /**
          * Incoming Message Handlers
          */
         createSeason: new PbMessageHandler(
            this.createSeason,
            pb.CreateSeasonRequest,
            pb.CreateSeasonResponse,
         ),
         updateSeason: new PbMessageHandler(
            this.updateSeason,
            pb.UpdateSeasonRequest,
            pb.UpdateSeasonResponse,
         ),
         findSeasonById: new PbMessageHandler(
            this.findSeasonById,
            pb.FindSeasonByIdRequest,
            pb.FindSeasonByIdResponse,
         ),
         publishSeason: new PbMessageHandler(
            this.publishSeason,
            pb.PublishSeasonRequest,
            pb.PublishSeasonResponse,
         ),
         querySeasons: new PbMessageHandler(
            this.querySeasons,
            pb.QuerySeasonsRequest,
            pb.QuerySeasonsResponse,
         ), seasonTickets: new PbMessageHandler(
            this.seasonTickets,
            pb.SeasonTicketsRequest,
            pb.SeasonTicketsResponse,
         ),
         querySeasonsList: new PbMessageHandler(
            this.querySeasonsList,
            pb.QuerySeasonsListRequest,
            pb.QuerySeasonsListResponse,
         ),
         findSeasonDetails: new PbMessageHandler(
            this.findSeasonDetails,
            pb.FindSeasonByIdRequest,
            pb.FindSeasonDetailsResponse,
         )
      });

      this.connectionMgr.subscribeBroadcast(this.serviceName, {
         orderSeasonCreated: new PbAsyncMessageHandler(
            this.orderSeasonCreated,
            pb.Broadcast.OrderCreatedNotification,
         ),
         // orderRefunded: new PbAsyncMessageHandler(
         //    this.orderRefunded,
         //    pb.Broadcast.OrderRefundedNotification,
         // ),
      });

   }

   public findSeasonById = async (request: pb.FindSeasonByIdRequest): Promise<pb.FindSeasonByIdResponse> => {
      const span = tracer.startSpan('findSeasonById', request.spanContext);
      const response: pb.FindSeasonByIdResponse = pb.FindSeasonByIdResponse.create();
      let season: ISeason;
      try {
         season = await this.storage.findSeasonById(span, request.seasonId);
         response.status = pb.StatusCode.OK;
         let seasondetail = season ? pb.Season.fromObject(season) : null;
         if (seasondetail && seasondetail.promotions) {
            for (let promotions of seasondetail.promotions) {
               for (let ticket of promotions.ticketTypeIds) {
                  for (let key in seasondetail.ticketTypes) {
                     if (seasondetail.ticketTypes[key]._id == ticket) {
                        seasondetail.ticketTypes[key].promo = promotions.code
                     }
                  }
               }
            }
            for (let key in seasondetail.promotions) {
               if (seasondetail.promotions[key].type == EventPromotionTypeEnum.PreSale && seasondetail.promotions[key].ticketTypeIds.length == 0) {
                  for (let val of seasondetail.ticketTypes) {
                     seasondetail.promotions[key].ticketTypeIds.push(val._id)
                  }
               }
            }
         }

         response.season = seasondetail
      } catch (e) {
         this.logger.error(`findSeason - error: ${e.message}`);
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

   public createSeason = async (request) => {
      const span = tracer.startSpan('createSeason', request.spanContext);
      const response: pb.CreateSeasonResponse = pb.CreateSeasonResponse.create();
      const { orgId, season } = request;
      season.orgId = orgId;
      season.createdAt = Time.now();

      let newSeason: ISeason;


      try {
         newSeason = await this.storage.createSeason(span, season);
         response.status = pb.StatusCode.OK;
         response.season = pb.Season.fromObject(newSeason);
      } catch (e) {
         this.logger.error(`createSeason - error: ${e.message}`);
         response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
         response.errors = [
            pb.Error.create({
               key: 'Error',
               message: 'Season creation was unsuccessful. Please contact support.',
            }),
         ];
         span.setTag('error', true);
         span.log({ errors: e.message });
         span.finish();
         return response;
      }

      /**
          * Broadcast season creation
          */
      const seasonCreatedNotification = pb.Broadcast.SeasonCreatedNotification.create({
         spanContext: span.context().toString(),
         orgId,
         seasonId: newSeason._id.toString(),
      });

      try {
         await this.proxy.broadcast.seasonCreated(seasonCreatedNotification);
      } catch (e) {
         this.logger.error(`createSeason - error: ${e.message}`);
         span.setTag('error', true);
         span.log({ errors: e.message });
      }

      span.finish();
      return response;
   }

   public updateSeason = async (request: pb.UpdateSeasonRequest): Promise<pb.UpdateSeasonResponse> => {
      const span = tracer.startSpan('updateSeason', request.spanContext);
      const response: pb.UpdateSeasonResponse = pb.UpdateSeasonResponse.create();

      const schema = Joi.object().keys({
         spanContext: Joi.string().required(),
         orgId: Joi.string().required(),
         season: {
            _id: Joi.string().required(),
            orgId: Joi.string().required(),
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
               qty: Joi.number(),
               ticketTypeId: Joi.string(),
            })).default([]),
            upgrades: Joi.array().items(Joi.object().keys({
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
               overRideMax: Joi.number(),
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
            numberOfEvent: Joi.number(),
            isGuestTicketSale: Joi.boolean()
         },
      });

      const params = schema.validate(request);
      if (params.error) {
         this.logger.error(`updateSeason - error: ${JSON.stringify(params.error)}`);
         response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
         response.errors = joiToErrors(params.error, pb.Error);
         span.setTag('error', true);
         span.log({ errors: params.error });
         span.finish();
         return response;
      }

      const { orgId, season } = params.value;
      const performance = season.performances[0];

      if (performance) {
         const { schedule } = season;
         season.schedule.startsAt = schedule.startsAt;
      }

      let alreadySeason;
      try {
         alreadySeason = await this.storage.findSeasonById(span, season._id);
      } catch (e) {
         this.logger.error(`publishSeason - error: ${e.message}`);
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

      alreadySeason = alreadySeason.toObject();
      if (season.promotions && season.promotions.length > 0) {
         season.promotions = season.promotions.map(promotion => {
            for (let val of alreadySeason.promotions) {
               if (val._id == promotion._id)
                  promotion.remainingQty = promotion.totalQty - (val.totalQty - val.remainingQty)
            }
            return promotion
         })
      }
      if (season.ticketTypes && season.ticketTypes.length > 0) {
         season.ticketTypes = season.ticketTypes.map(ticketType => {
            for (let val of alreadySeason.ticketTypes) {
               if (val._id == ticketType._id)
                  ticketType.remainingQty = ticketType.totalQty - (val.totalQty - val.remainingQty)
               for (let tier in ticketType.tiers) {
                  ticketType.tiers[tier].remainingQty = ticketType.remainingQty
               }
            }

            return ticketType
         })
      }
      let updatedSeason: ISeason;
      try {
         updatedSeason = await this.storage.updateOneSeason(span, orgId, season);
         response.status = pb.StatusCode.OK;
         response.season = pb.Season.fromObject(updatedSeason);
      } catch (e) {
         this.logger.error(`updateSeason - error: ${e.message}`);
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
      * Broadcast Season update
      */
      const seasonUpdatedNotifcation = pb.Broadcast.SeasonUpdatedNotification.create({
         spanContext: span.context().toString(),
         orgId,
         seasonId: updatedSeason._id.toString(),
      });

      try {
         await this.proxy.broadcast.updatedSeason(seasonUpdatedNotifcation);
      } catch (e) {
         this.logger.error(`updateSeason - error: ${e.message}`);
         span.setTag('error', true);
         span.log({ errors: e.message });
      }

      span.finish();
      return response;
   }

   public publishSeason = async (request) => {
      const span = tracer.startSpan('publishSeason', request.spanContext);
      const response: pb.PublishSeasonResponse = pb.PublishSeasonResponse.create();

      const schema = Joi.object().keys({
         spanContext: Joi.string().required(),
         orgId: Joi.string().required(),
         seasonId: Joi.string().required(),
         published: Joi.boolean().default(true),
      });

      const params = schema.validate(request);


      if (params.error) {
         this.logger.error(`publishSeasons - error: ${JSON.stringify(params.error)}`);
         response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
         response.errors = joiToErrors(params.error, pb.Error);
         span.setTag('error', true);
         span.log({ errors: params.error });
         span.finish();
         return response;
      }
      const { orgId, published } = params.value;
      /**
      * Find the Season
      */
      let season
      try {
         season = await this.storage.findSeasonById(span, request.seasonId);
      } catch (e) {
         this.logger.error(`publishSeason - error: ${e.message}`);
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

      season = season.toObject();
      /**
      * Validate the season
      */
      const seasonParams = SeasonUtil.validatePublish(season);

      if (seasonParams.error) {
         this.logger.error(`publishSeasons - error: ${JSON.stringify(seasonParams.error)}`);
         response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
         response.errors = joiToErrorMessages(seasonParams.error, pb.Error);
         span.setTag('error', true);
         span.log({ errors: seasonParams.error });
         span.finish();
         return response;
      }

      // const spanContext = span.context().toString();
      /**
       * Publish the season
       */
      // try {
      //   await publishSiteIds.reduce(async (response: pb.PublishWebFlowEventResponse, publishSiteId, index): Promise<pb.PublishWebFlowEventResponse> => {
      //     await response;
      //     console.log(`${Date.now()} HIT HERE ${publishSiteId} index ${index}`);
      //     const publishWebFlowEventRequest = pb.PublishWebFlowEventRequest.create({
      //       spanContext,
      //       orgId,
      //       seasonId,
      //       siteId: publishSiteId,
      //     });

      //     try {
      //       return await this.proxy.webFlowService.publishWebFlowEvent(publishWebFlowEventRequest);
      //     } catch (e) {
      //       this.logger.error(`publishSeason - error: ${e.message}`);
      //       response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //       response.errors = [pb.Error.create({
      //         key: 'Error',
      //         message: e.message,
      //       })];
      //       span.setTag('error', true);
      //       span.log({ errors: e.message });
      //       span.finish();
      //       return response;
      //     }
      //   }, Promise.resolve(null));

      // } catch (e) {
      //   this.logger.error(`publishSeason - error: ${e.message}`);
      //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //   response.errors = [pb.Error.create({
      //     key: 'Error',
      //     message: e.message,
      //   })];
      //   span.setTag('error', true);
      //   span.log({ errors: e.message });
      //   span.finish();
      //   return response;
      // }

      /**
       * Unpublish the seaseon
       */
      // try {
      //   await Promise.all(unpublishSiteIds.map(async (unpublishSiteId): Promise<pb.PublishWebFlowEventResponse> => {
      //     const unpublishWebFlowEventRequest = pb.UnpublishWebFlowEventRequest.create({
      //       spanContext,
      //       orgId,
      //       seasonId,
      //       siteId: unpublishSiteId,
      //     });

      //     try {
      //       return await this.proxy.webFlowService.unpublishWebFlowEvent(unpublishWebFlowEventRequest);
      //     } catch (e) {
      //       this.logger.error(`publishSeason - error: ${e.message}`);
      //       response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //       response.errors = [pb.Error.create({
      //         key: 'Error',
      //         message: e.message,
      //       })];
      //       span.setTag('error', true);
      //       span.log({ errors: e.message });
      //       span.finish();
      //       return response;
      //     }

      //   }));
      // } catch (e) {
      //   this.logger.error(`publishSeason - error: ${e.message}`);
      //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      //   response.errors = [pb.Error.create({
      //     key: 'Error',
      //     message: e.message,
      //   })];
      //   span.setTag('error', true);
      //   span.log({ errors: e.message });Event

      /**
      * Mark the Season as published
      * season.published is always true after the first publish
      * season if the season is not hosted on any webflow sites
      */

      if (season.published !== published) {
         try {
            season = await this.storage.updateOneSeason(span, orgId, { _id: season._id, published });
         } catch (e) {
            this.logger.error(`publishSeason - error: ${e.message}`);
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
       * Broadcast season published
       */
      // if (publishSiteIds && publishSiteIds.length > 0) {
      //   const eventPublishedNotification = pb.Broadcast.EventPublishedNotification.create({
      //     spanContext: span.context().toString(),
      //     orgId,
      //     seasonId: season._id.toString(),
      //   });

      //   try {
      //     await this.proxy.broadcast.eventPublished(eventPublishedNotification);
      //   } catch (e) {
      //     this.logger.error(`publishSeason - error: ${e.message}`);
      //     span.setTag('error', true);
      //     span.log({ errors: e.message });
      //   }
      // }

      response.status = pb.StatusCode.OK;
      response.season = pb.Season.fromObject(season);

      span.finish();
      return response;

   }

   public querySeasons = async (request: pb.QuerySeasonsRequest): Promise<pb.QuerySeasonsResponse> => {
      const span = tracer.startSpan('querySeas', request.spanContext);
      const response: pb.QuerySeasonsResponse = pb.QuerySeasonsResponse.create();

      const schema = Joi.object().keys({
         spanContext: Joi.string().required(),
         orgId: Joi.string().required(),
         query: Joi.any().optional(),
         pagination: Joi.any().optional(),
      });

      const params = schema.validate(request);

      if (params.error) {
         this.logger.error(`querySeasons - error: ${JSON.stringify(params.error)}`);
         response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
         response.errors = joiToErrors(params.error, pb.Error);
         span.setTag('error', true);
         span.log({ errors: params.error });
         span.finish();
         return response;
      }
      const { orgId, query, pagination } = params.value;
      query.orgId = orgId;

      let seasons: ISeason[];

      try {
         seasons = await this.storage.querySeasons(span, query, pagination);
         response.status = pb.StatusCode.OK;
         response.seasons = seasons.map(season => (pb.Season.fromObject(season)));
      } catch (e) {
         this.logger.error(`querySeasons - error: ${e.message}`);
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

   public querySeasonsList = async (request: pb.QuerySeasonsListRequest): Promise<pb.QuerySeasonsListResponse> => {
      const span = tracer.startSpan('querySeasons', request.spanContext);
      const response: pb.QuerySeasonsListResponse = pb.QuerySeasonsListResponse.create();

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
         let seasons: any = await this.storage.querySeasonList(span, orgId);
         response.status = pb.StatusCode.OK;
         let seasonList = []
         for (let val of seasons) {
            let season = {
               _id: val._id,
               orgId: val.orgId,
               name: val.name,
               active: val.active,
               schedule: val.schedule,
               cancel: val.cancel,
               published: val.published,
               ticketTypes: val.ticketTypes,
               startsAt: val.schedule.startsAt,
               endsAt: val.schedule.endsAt,
               posterImageUrl: val.posterImageUrl,
               status: await getSeasonStatus(val),
               venue: null
            }

            const venuerequest = new pb.FindVenueByIdRequest.create({
               spanContext: request.spanContext,
               venueId: val.venueId,
            });
            let { venue } = await this.proxy.venueService.findVenueById(venuerequest);
            season.venue = venue ? venue.name : null
            seasonList.push(season);
         }
         response.seasons = seasonList

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

   public findSeasonDetails = async (request: pb.FindSeasonByIdRequest): Promise<pb.FindSeasonDetailsResponse> => {
      const span = tracer.startSpan('findSeasonById', request.spanContext);
      const response: pb.FindSeasonDetailsResponse = pb.FindSeasonDetailsResponse.create();

      const schema = Joi.object().keys({
         spanContext: Joi.string().required(),
         seasonId: Joi.string().required(),
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
      const { seasonId, spanContext } = params.value;

      let season: ISeason;
      try {
         season = await this.storage.findSeasonById(span, seasonId);
         response.status = pb.StatusCode.OK;
         let seasondetail = season ? pb.Season.fromObject(season) : null;
         seasondetail.status = await getSeasonStatus(seasondetail)
         seasondetail.remainingQty = 0
         let lowestprice = []
         for (let val of seasondetail.ticketTypes) {
            if (val.visible == true) {
               lowestprice.push(val.tiers[0].price)
               seasondetail.remainingQty += val.remainingQty
            }
         }
         const requestOrg = pb.FindOrganizationRequest.create({
            spanContext: spanContext,
            orgId: seasondetail.orgId,
         });
         let org = await this.proxy.organizationService.findOrganization(requestOrg);

         const venuerequest = new pb.FindVenueByIdRequest.create({
            spanContext: spanContext,
            venueId: seasondetail.venueId,
         });
         let venue = await this.proxy.venueService.findVenueById(venuerequest);
         delete org.organization.userId;
         delete org.organization.stripeId;
         seasondetail.organization = org.organization
         seasondetail.venue = venue.venue
         seasondetail.lowestPrice = Math.min(...lowestprice)
         response.season = seasondetail
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




   public seasonTickets = async (request: pb.SeasonTicketsRequest): Promise<any> => {
      const span = tracer.startSpan('seasonTickets', request.spanContext);
      const response: any = {}
      const schema = Joi.object().keys({
         spanContext: Joi.string().required(),
         seasonId: Joi.string().required(),
         promoCode: Joi.string().optional().allow(""),
      });

      const params = schema.validate(request);
      if (params.error) {
         this.logger.error(`seasonTickets - error: ${JSON.stringify(params.error)}`);
         response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
         response.errors = joiToErrors(params.error, pb.Error);
         span.setTag('error', true);
         span.log({ errors: params.error });
         span.finish();
         return response;
      }
      const { seasonId, promoCode } = params.value;

      try {
         let seasondetail = await this.storage.findSeasonById(span, seasonId)
         let resp = []
         let season = (pb.Season.fromObject(seasondetail))
         for (let seasonpromo of season.promotions) {
            if (seasonpromo.code == promoCode) {
               if (seasonpromo.type == EventPromotionTypeEnum.PreSale && seasonpromo.ticketTypeIds.length == 0) {
                  resp.push({
                     promoType: seasonpromo.type,
                     remainingQty: seasonpromo.remainingQty,
                     active: seasonpromo.active,
                     startsAt: seasonpromo.startsAt,
                     endsAt: seasonpromo.endsAt,
                     seasonTickets: season.ticketTypes,
                     overRideMax: seasonpromo.overRideMax
                  })
               } else {
                  let ticket = []
                  for (let val of seasonpromo.ticketTypeIds) {
                     for (let tick of season.ticketTypes) {
                        if (tick._id == val) {
                           ticket.push(tick)
                        }
                     }
                  }
                  resp.push({
                     promoType: seasonpromo.type,
                     remainingQty: seasonpromo.remainingQty,
                     active: seasonpromo.active,
                     startsAt: seasonpromo.startsAt,
                     endsAt: seasonpromo.endsAt,
                     seasonTickets: ticket,
                     overRideMax: seasonpromo.overRideMax
                  })
               }
            }
         }
         response.status = pb.StatusCode.OK;
         response.tickets = resp;
      } catch (e) {
         this.logger.error(`seasonTickets - error: ${e.message}`);
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

   public orderSeasonCreated = async (request: pb.Broadcast.OrderCreatedNotification): Promise<void> => {
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
            order.seasonId,
            order.tickets || [],
            order.upgrades || [],
            order.promotionCode || null,
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

}

const getSeasonStatus = (season) => {
   const now = Time.now();
 
   const s = season.schedule;
   const announceAt = s.announceAt as number;
   const ticketsAt = s.ticketsAt as number;
   const ticketsEndAt = s.ticketsEndAt as number;
   const startsAt = s.startsAt as number;
   const endsAt = s.endsAt as number;
 
   // if (!webFlowEntity || !webFlowEntity.webFlowIds || !webFlowEntity.webFlowIds.length) {
   //   return EventStatusEnum.Draft;
   // }
 
   // TODO: cancelled status
   if (startsAt < now && endsAt > now && !season.cancel) {
     return "Live";
   }
 
   if (!season.published && !season.cancel) {
     return "Draft";
   }
 
   const remainingQty = season?.ticketTypes?.reduce((cur, next) => {
     return cur + next.remainingQty;
   }, 0);
 
 
   if (remainingQty !== undefined && remainingQty <= 0 && !season.cancel) {
     return "Sold Out";
   }
 
   if (now < announceAt && !season.cancel) {
     return "Pre Announced";
   }
 
   if (announceAt < now && now < ticketsAt && !season.cancel) {
     return "Announced";
   }
 
   if (endsAt < now && !season.cancel) {
     return "Past";
   }
 
   if (ticketsEndAt < now && !season.cancel) {
     return "Sales Ended";
   }
 
   if (season.published && !season.cancel) {
     return "On Sale";
   }
 
   if (season.cancel) {
     return "Cancelled";
   }
   return "Draft";
 }
 