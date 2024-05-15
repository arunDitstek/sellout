import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from './../graphqlError';
import { roles, hasPermission } from './../permissions';
// import { OrderChannelEnum } from '@sellout/models/.dist/enums/OrderChannelEnum';
// import { RolesEnum } from '@sellout/models/.dist/interfaces/IRole'
// import { OrderTypeEnum } from '@sellout/models/.dist/interfaces/IOrderType';

export const resolvers = {
  Query: {
    async season(order, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Season.season', req.span);
      const spanContext = span.context().toString();
      // HOSTNAME
      const request = new pb.FindSeasonByIdRequest.create({
        spanContext: spanContext,
        seasonId: order && order.seasonId ? order.seasonId : args.seasonId
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.FindSeasonByIdResponse;
      try {

        response = await proxy.seasonService.findSeasonById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
      span.finish();
      return response.season;
    }, async seasons(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Season.seasons', req.span);
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

      const request = new pb.QuerySeasonsRequest.create({
        spanContext: spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QuerySeasonsResponse;
      try {
         
        response = await proxy.seasonService.querySeasons(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.seasons;
    },
  
  },
  Mutation: {
    async createSeason(_, args, context) {
      let { req, proxy } = context;
      const { season } = args;
      const span = req.tracer.startSpan('Seasoin.createSeason', req.span);
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

      const request = pb.CreateSeasonRequest.create({
        spanContext,
        orgId,
        season
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.seasonService.createSeason(request);
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
      return response.season;
    },
    async publishSeason(_, args, context) {
      let { req, proxy } = context;
      const { seasonId, published } = args;
      const span = req.tracer.startSpan('Season.publishSeason', req.span);
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
      const request = pb.PublishSeasonRequest.create({
        spanContext,
        orgId,
        seasonId,
        published
      });
      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.seasonService.publishSeason(request)
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
      return response.season;
    },
    async updateSeason(_, args, context) {
      let { req, proxy } = context;
      const { season } = args;
      const span = req.tracer.startSpan('Season.updateSeason', req.span);
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
      const updateRequest = pb.UpdateSeasonRequest.create({
        spanContext,
        orgId,
        season,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.seasonService.updateSeason(updateRequest);
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
      return updateResponse.season;
    }
  }
};