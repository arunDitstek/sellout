import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from '../graphqlError';
import { roles, hasPermission } from "./../permissions";

export const resolvers = {
  Query: {
    async userProfile(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('UserProfile.userProfile', req.span);
      const spanContext = span.context().toString();
      let { userId } = req.user;
      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (args.userId) {
        userId = args.userId;
      }

      // HOSTNAME ?

      const request = new pb.FindUserProfileRequest.create({
        spanContext: spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindUserProfileResponse;
      try {
        response = await proxy.userProfileService.findUserProfile(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }
        if (response && response.userProfile && (!response.userProfile.stripeCustomerId || response.userProfile.stripeCustomerId == null)) {
          const createCustomerRequest = new pb.CreateStripeCustomerRequest({
            spanContext: span.context().toString(),
            userId: response.userProfile.userId.toString(),
          });

          let createCustomerResponse = await proxy.stripeService.createStripeCustomer(
            createCustomerRequest,
          );
          if (createCustomerResponse && createCustomerResponse.stripeCustomer && createCustomerResponse.stripeCustomer.stripeCustomerId) {
            response.userProfile.stripeCustomerId = createCustomerResponse.stripeCustomer.stripeCustomerId
          }
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }


      span.finish();
      return response.userProfile;
    },
    async userProfileAdmin(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('UserProfile.userProfile', req.span);
      const spanContext = span.context().toString();
      let { userId } = req.user;
      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (args.userId) {
        userId = args.userId;
      }

      // HOSTNAME ?

      const request = new pb.FindUserProfileRequest.create({
        spanContext: spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindUserProfileResponse;
      try {
        response = await proxy.userProfileService.findUserProfile(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }


      span.finish();
      return response.userProfile;
    },
    async userProfiles(_, args, context) {
      let { req, proxy } = context;
      const { query = { }, pagination } = args;
      const span = req.tracer.startSpan('UserProfile.userProfiles', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      // const { orgId } = query;
      // console.log("orgId ++++>>>", orgId);


      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // if (!orgId) {
      //   throw new AuthenticationError("You do not have access to the users requested.");
      // }

      // if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
      //   throw new AuthenticationError(
      //     "User does not have required permission level."
      //   );
      // }

      const request = new pb.QueryUserProfilesRequest.create({
        spanContext: spanContext,
        // orgId: orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryUserProfilesResponse;
      try {
        response = await proxy.userProfileService.queryUserProfiles(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }


      span.finish();
      return response.userProfiles;
    },

    async userProfilesAdmin(_, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('UserProfile.userProfiles', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;
      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // if (!orgId) {
      //   throw new AuthenticationError("You do not have access to the users requested.");
      // }

      // if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
      //   throw new AuthenticationError(
      //     "User does not have required permission level."
      //   );
      // }

      const request = new pb.QueryUserProfilesRequest.create({
        spanContext: spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryUserProfilesResponse;
      try {
        response = await proxy.userProfileService.queryUserProfiles(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }


      span.finish();
      return response.userProfiles;
    },
  },
  Mutation: {
    async updateUserProfile(_, args, context) {
      let { req, proxy } = context;
      const { userProfile } = args;
      const span = req.tracer.startSpan('UserProfile.updateUserProfile', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = pb.UpdateUserProfileRequest.create({
        spanContext,
        userId,
        userProfile,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.userProfileService.updateUserProfile(request);

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
      return response.userProfile;
    },
    async generateUserProfileReport(_, args, context) {
      let { req, proxy } = context;
      const { query } = args;
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

      const request = pb.GenerateUserProfileReportRequest.create({
        spanContext,
        orgId,
        userId,
        query,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.userProfileService.generateUserProfileReport(request);

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
    }
  }
};
