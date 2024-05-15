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
    async venue(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Venue.venue', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if(parent && !parent.venueId) return null;

      const request = new pb.FindVenueByIdRequest.create({
        spanContext: spanContext,
        venueId: parent ? parent.venueId : args.venueId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindVenueByIdResponse;
      try {
        response = await proxy.venueService.findVenueById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.venue;
    },
    async venues(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Venue.venues', req.span);
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
      
      const request = new pb.QueryVenuesRequest.create({
        spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryVenuesResponse;
      try {
        response = await proxy.venueService.queryVenues(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.venues;
    },
    async globalVenues(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Venue.globalVenues', req.span);
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

      const request = new pb.QueryGlobalVenuesRequest.create({
        spanContext: spanContext,
        query: [{
          key: 'name',
          value: args.name,
        }],
        pagination: new pb.Pagination.create(args.pagination),
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryGlobalVenuesResponse;
      try {
        response = await proxy.venueService.queryGlobalVenues(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.venues;
    }
  },
  Mutation: {
    async createVenue(_, args, context) {
      let { req, proxy } = context;
      const { venue } = args;
      const span = req.tracer.startSpan('Venue.createVenue', req.span);
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

      const createRequest = pb.CreateVenueRequest.create({
        spanContext,
        orgId,
        venue,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.venueService.createVenue(createRequest);

        if (createResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: createResponse.errors,
          });
        }

        if (createResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(createResponse.errors[0].message, createResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return createResponse.venue;
    },
    async updateVenue(_, args, context) {
      let { req, proxy } = context;
      const { venue } = args;
      const span = req.tracer.startSpan('Venue.updateVenue', req.span);
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

      const createRequest = pb.UpdateVenueRequest.create({
        spanContext,
        orgId,
        venue,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.venueService.updateVenue(createRequest);

        if (updateResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updateResponse.errors,
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
      return updateResponse.venue;
    }
    
  }
};
