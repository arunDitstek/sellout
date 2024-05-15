import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from './../graphqlError';
import { roles, hasPermission } from './../permissions';

export const resolvers = {
  Query: {
    async event(order, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Event.event', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME
      const request = new pb.FindEventByIdRequest.create({
        spanContext: spanContext,
        eventId: order && order.eventId ? order.eventId : args.eventId
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.FindEventByIdResponse;
      try {
        response = await proxy.eventService.findEventById(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response.event;
    },

    async events(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SCANNER)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = new pb.QueryEventsRequest.create({
        spanContext: spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryEventsResponse;
      try {
        response = await proxy.eventService.queryEvents(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.events;
    },

    async searchEvents(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination, eventId } = args;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SCANNER)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = new pb.QuerySearchEventsRequest.create({
        spanContext: spanContext,
        query,
        pagination,
        eventId,
        orgId
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindEventByIdResponse;
      try {
        response = await proxy.eventService.searchEvents(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.event;
    },

    async eventQuery(order, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Event.event', req.span);
      const spanContext = span.context().toString();
      const { query = {}, eventId, pagination } = args;

      const request = new pb.QuerySearchEventsRequest.create({
        spanContext: spanContext,
        eventId,
        query,
        pagination
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.FindEventByIdResponse;
      try {
        response = await proxy.eventService.searchEvents(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response.event;
    },

    async eventsList(context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      let { orgId } = req.query;
      const request = new pb.QueryEventsListRequest.create({
        spanContext: spanContext,
        orgId
      });
      proxy = <IServiceProxy>proxy;
      let response: pb.QueryEventsListResponse;
      try {
        response = await proxy.eventService.queryEventsList(request);
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response;
    },

    async seasonsList(context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Seasons.seasons', req.span);
      const spanContext = span.context().toString();
      // const orgId = req.body.orgId;
      let { orgId } = req.query;


      const request = new pb.QuerySeasonsListRequest.create({
        spanContext: spanContext,
        orgId
      });
      proxy = <IServiceProxy>proxy;
      let response: pb.QuerySeasonsListResponse;
      try {
        response = await proxy.seasonService.querySeasonsList(request);
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response;
    },


    async eventsDetails(context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      let { id, name } = req.query;
      // const eventId = req.body.eventId;


      const request = new pb.QueryEventsListRequest.create({
        spanContext: spanContext,
        eventId: id,
        stub: name
      });
      proxy = <IServiceProxy>proxy;
      let response: any
      try {
        response = await proxy.eventService.findEventDetails(request);
        // if (response.status !== pb.StatusCode.OK) {
        //   return response;
        // } else {
        //   const requestOrg = new pb.FindOrganizationRequest.create({
        //     spanContext: spanContext,
        //     orgId: response.event && response.event.orgId,
        //   });    
        //   let org = await proxy.organizationService.findOrganization(requestOrg);
        //   if (org.status !== pb.StatusCode.OK) {
        //     return org;
        //   }
        //   let event : any = response.event
        //   event.organization = org.Organization
        //   console.log(org.organization,'.........', event.organization)
        //   response.event = event
        // }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response;
    },

    async seasonsDetails(context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Season.season', req.span);
      const spanContext = span.context().toString();
      let { id } = req.query;

      const request = new pb.QuerySeasonsListRequest.create({
        spanContext: spanContext,
        seasonId: id
      });
      proxy = <IServiceProxy>proxy;
      let response: any;
      try {
        response = await proxy.seasonService.findSeasonDetails(request);
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response;
    },
    async eventTickets(_, args, context) {
      let { req, proxy } = context;
      const { eventId, promoCode, seasonId } = args;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      // const { userId } = req.user;

      // if (!userId) {
      //   throw new AuthenticationError("Authentication Required.");
      // }

      const request = new pb.EventTicketsRequest.create({
        spanContext: spanContext,
        eventId,
        seasonId,
        promoCode
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.EventTicketsResponse;
      try {
        response = await proxy.eventService.eventTickets(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.tickets;
    },

    async eventDiscounts(_, args, context) {
      let { req, proxy } = context;
      const { eventId, discountCode, seasonId, userId, selectedTicket } = args;
      const span = req.tracer.startSpan('Event.events', req.span);
      const spanContext = span.context().toString();
      // const { userId } = req.user;

      // if (!userId) {
      //   throw new AuthenticationError("Authentication Required.");
      // }

      const request = new pb.EventDiscountRequest.create({
        spanContext: spanContext,
        eventId,
        seasonId,
        discountCode: discountCode?.toLowerCase(),
        userId,
        selectedTicket
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.EventTicketsResponse;
      try {
        response = await proxy.eventService.eventDiscounts(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.tickets;
    },
    async notifyEvent(order, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Event.event', req.span);
      const spanContext = span.context().toString();
      const { eventId, email } = args;

      const request = new pb.NotifyMeReportRequest.create({
        spanContext: spanContext,
        eventId,
        email,
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.FindEventByIdResponse;
      try {
        response = await proxy.eventService.notifyEvent(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response.event;
    },
  },
  Mutation: {
    async createEvent(_, args, context) {
      let { req, proxy } = context;
      const { event } = args;
      const span = req.tracer.startSpan('Event.createEvent', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;


      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.CreateEventRequest.create({
        spanContext,
        orgId,
        event,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.eventService.createEvent(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: response.errors.map(e => e.key),
          });
        }

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, response.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.event;
    },
    async publishEvent(_, args, context) {
      let { req, proxy } = context;
      const { eventId, publishSiteIds, unpublishSiteIds, published } = args;

      const span = req.tracer.startSpan('Event.publishEvent', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.PublishEventRequest.create({
        spanContext,
        orgId,
        eventId,
        publishSiteIds,
        unpublishSiteIds,
        published,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.eventService.publishEvent(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: response.errors,
          });
        }

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, response.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.event;
    },
    async updateEvent(_, args, context) {
      let { req, proxy } = context;
      const { event } = args;
      const span = req.tracer.startSpan('Event.updateEvent', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }
      const updateRequest = pb.UpdateEventRequest.create({
        spanContext,
        orgId,
        event,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.eventService.updateEvent(updateRequest);
        if (updateResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updateResponse.errors.map(e => e.key),
          });
        }

        if (updateResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updateResponse.errors[0].message, updateResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updateResponse.event;
    },
    async deleteEvent(_, args, context) {
      let { req, proxy } = context;
      const { eventId } = args;
      const span = req.tracer.startSpan('Event.deleteEvent', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const deleteRequest = pb.DeleteEventRequest.create({
        spanContext,
        orgId,
        eventId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse;
      try {
        deleteResponse = await proxy.eventService.deleteEvent(deleteRequest);
        if (deleteResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: deleteResponse.errors.map(e => e.key),
          });
        }

        if (deleteResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(deleteResponse.errors[0].message, deleteResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return deleteResponse;
    },
    async duplicateEvent(_, args, context) {
      let { req, proxy } = context;
      const { eventId } = args;
      const span = req.tracer.startSpan('Event.duplicateEvent', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const duplicateRequest = pb.DuplicateEventRequest.create({
        spanContext,
        eventId,
      });

      proxy = <IServiceProxy>proxy;
      let duplicateResponse;
      try {
        duplicateResponse = await proxy.eventService.duplicateEvent(duplicateRequest);

        if (duplicateResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: duplicateResponse.errors.map(e => e.key),
          });
        }

        if (duplicateResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(duplicateResponse.errors[0].message, duplicateResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();

      return duplicateResponse.event;
    },
    async salesReport(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Event.salesReport', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const salesReportRequest = pb.SalesReportRequest.create({
        spanContext,
        orgId,
        params
      });

      proxy = <IServiceProxy>proxy;
      let salesReportResponse;
      try {
        salesReportResponse = await proxy.eventService.salesReport(salesReportRequest);

        if (salesReportResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: salesReportResponse.errors.map(e => e.key),
          });
        }

        if (salesReportResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(salesReportResponse.errors[0].message, salesReportResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();

      return salesReportResponse.event;
    },
    // async notifyEvent(_, args, context) {
    //   let { req, proxy } = context;
    //   const { eventId, email } = args;
    //   const span = req.tracer.startSpan('Event.salesReport', req.span);
    //   const spanContext = span.context().toString();
    //   const { userId, orgId } = req.user;

    //   if (!userId) {
    //     throw new AuthenticationError("Authentication Required.");
    //   }

    //   if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
    //     throw new AuthenticationError(
    //       "User does not have required permission level."
    //     );
    //   }

    //   const notifyEventRequest = pb.NotifyMeReportRequest.create({
    //     spanContext,
    //     orgId,
    //     email,
    //     eventId
    //   });

    //   proxy = <IServiceProxy>proxy;
    //   let NotifyMeReportResponse;
    //   try {
    //     NotifyMeReportResponse = await proxy.eventService.notifyEvent(notifyEventRequest);

    //     if (NotifyMeReportResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
    //       throw new UserInputError('Invalid Fields', {
    //         invalidArgs: NotifyMeReportResponse.errors.map(e => e.key),
    //       });
    //     }

    //     if (NotifyMeReportResponse.status !== pb.StatusCode.OK) {
    //       throw new ApolloError(NotifyMeReportResponse.errors[0].message, NotifyMeReportResponse.status);
    //     }

    //   } catch (e) {
    //     errorSpan(span, e);
    //     throw e;
    //   }

    //   span.finish();

    //   return NotifyMeReportResponse.event;
    // },
    async createWaitList(_, args, context) {
      let { req, proxy } = context;
      const { params, eventId, type, } = args;
      const span = req.tracer.startSpan('Event.createWaitList', req.span);
      const spanContext = span.context().toString();

      const waitListRequest = pb.WaitListRequest.create({
        spanContext,
        eventId,
        params,
        type,
        // orgId
      });

      proxy = <IServiceProxy>proxy;
      let waitListResponse;
      try {
        waitListResponse = await proxy.eventService.createWaitList(waitListRequest);
        // // if (waitListResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
        // //   throw new UserInputError('Invalid Fields', {
        // //     invalidArgs: waitListResponse.errors.map(e => e.key),
        // //   });
        // }

        if (waitListResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(waitListResponse.errors[0].message, waitListResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return waitListResponse.event;
    },
    async deleteSubscription(_, args, context) {
      let { req, proxy } = context;
      const { eventId, subscriptionId } = args;
      const span = req.tracer.startSpan('Event.deleteSubscription', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const deleteSubscriptionRequest = pb.DeleteEventRequest.create({
        spanContext,
        orgId,
        eventId,
        subscriptionId
      });

      proxy = <IServiceProxy>proxy;
      let deleteSubscriptionResponse;
      try {
        deleteSubscriptionResponse = await proxy.eventService.deleteSubscription(deleteSubscriptionRequest);
        if (deleteSubscriptionResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: deleteSubscriptionResponse.errors.map(e => e.key),
          });
        }

        if (deleteSubscriptionResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(deleteSubscriptionResponse.errors[0].message, deleteSubscriptionResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return deleteSubscriptionResponse.event;
    },
    async holdTicket(_, args, context) {
      let { req, proxy } = context;
      const { params, eventId } = args;
      const span = req.tracer.startSpan('Event.holdTicket', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const holdTcketRequest = pb.HoldTicketRequest.create({
        spanContext,
        orgId,
        eventId,
        hold: params
      });

      proxy = <IServiceProxy>proxy;
      let HoldTicketResponse;
      try {
        HoldTicketResponse = await proxy.eventService.updateHolds(holdTcketRequest);

        if (HoldTicketResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: HoldTicketResponse.errors.map(e => e.key),
          });
        }

        if (HoldTicketResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(HoldTicketResponse.errors[0].message, HoldTicketResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();

      return HoldTicketResponse.event;
    },
    async generateWaitListReport(_, args, context) {
      let { req, proxy } = context;
      const { eventId } = args;
      const span = req.tracer.startSpan('UserProfile.updateUserProfile', req.span);
      const spanContext = span.context().toString();
      const { orgId, userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateWaitListReportRequest.create({
        spanContext,
        orgId,
        userId,
        eventId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.eventService.generateWaitListReport(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: response.errors.map(e => e.key),
          });
        }

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, response.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return {
        url: response?.url,
        message: response?.message
      }
    },


    // async notifyEvent(_, args, context) {
    //   let { req, proxy } = context;
    //   const { eventId, email, } = args;
    //   const span = req.tracer.startSpan('Event.createWaitList', req.span);
    //   const spanContext = span.context().toString();

    //   const waitListRequest = pb.WaitListRequest.create({
    //     spanContext,
    //     eventId,
    //     email
    //   });

    //   proxy = <IServiceProxy>proxy;
    //   let waitListResponse;
    //   try {
    //     waitListResponse = await proxy.eventService.createWaitList(waitListRequest);
    //     // // if (waitListResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
    //     // //   throw new UserInputError('Invalid Fields', {
    //     // //     invalidArgs: waitListResponse.errors.map(e => e.key),
    //     // //   });
    //     // }

    //     if (waitListResponse.status !== pb.StatusCode.OK) {
    //       throw new ApolloError(waitListResponse.errors[0].message, waitListResponse.status);
    //     }

    //   } catch (e) {
    //     errorSpan(span, e);
    //     throw e;
    //   }
    //   span.finish();
    //   return waitListResponse.event;
    // },





  }
};
