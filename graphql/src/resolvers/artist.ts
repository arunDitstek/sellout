import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from './../graphqlError';
import { roles, hasPermission } from "./../permissions";

export const resolvers = {
  Query: {
    async artist(parent, args, context) {
      let { req, proxy } = context;
      const { artistId } = args;
      const span = req.tracer.startSpan('Artist.artist', req.span);
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

      const request = new pb.FindArtistByIdRequest.create({
        spanContext: spanContext,
        orgId: orgId,
        artistId: parent && parent.artistId ? parent.artistId : artistId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindArtistByIdResponse;
      try {
        response = await proxy.artistService.findArtistById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.artist;
    },
    async artists(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Artist.artists', req.span);
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

      const request = new pb.QueryArtistsRequest.create({
        spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryArtistsResponse;
      try {
        response = await proxy.artistService.queryArtists(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.artists;
    },
    async artistsById(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Artist.artistsById', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = new pb.ListArtistsByIdRequest.create({
        spanContext: spanContext,
        orgId: orgId,
        artistIds: args.artistIds,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListArtistsByIdResponse;
      try {
        response = await proxy.artistService.listArtistsById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.artists;
    },
    async globalArtists(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Artist.queryGlobalArtists', req.span);
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

      const request = new pb.QueryGlobalArtistsRequest.create({
        spanContext: spanContext,
        query: [{
          key: 'name',
          value: args.name,
        }],
        pagination: new pb.Pagination.create(args.pagination),
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryGlobalArtistsResponse;
      try {
        response = await proxy.artistService.queryGlobalArtists(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.artists;
    }
  },
  Mutation: {
    async createArtist(_, args, context) {
      let { req, proxy } = context;
      const { artist } = args;
      const span = req.tracer.startSpan('Artist.createArtist', req.span);
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

      const createRequest = pb.CreateArtistRequest.create({
        spanContext,
        orgId,
        artist,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.artistService.createArtist(createRequest);

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
      return createResponse.artist;
    },
    async updateArtist(_, args, context) {
      let { req, proxy } = context;
      const { artist } = args;
      const span = req.tracer.startSpan('Artist.updateArtist', req.span);
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

      const updateRequest = pb.UpdateArtistRequest.create({
        spanContext,
        orgId,
        artist,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.artistService.updateArtist(updateRequest);

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
      return updateResponse.artist;
    } 
  }
};
