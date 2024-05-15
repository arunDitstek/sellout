import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from '../graphqlError';
import { roles, hasPermission } from './../permissions';
import { TicketFormatAsEnum } from '@sellout/models/.dist/interfaces/IOrganization';
export const resolvers = {
  Query: {
    async organization(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Organization.organization', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!parent) {
        if (!userId) {
          throw new AuthenticationError("Authentication Required.");
        }

        // if (!await hasPermission(proxy, spanContext, req.user, roles.SCANNER)) {
        //   throw new AuthenticationError(
        //     "User does not have required permission level."
        //   );
        // }
      }

      if (parent && !parent.orgId) return null;

      const request = new pb.FindOrganizationRequest.create({
        spanContext: spanContext,
        orgId: parent ? parent.orgId : orgId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindOrganizationResponse;
      try {
        response = await proxy.organizationService.findOrganization(request);

        if(response?.organization && response?.organization?.ticketFormat){
          response.organization.ticketFormat = response.organization?.ticketFormat || TicketFormatAsEnum.Standard
        }

        // response.organization.ticketFormat = TicketFormatAsEnum.Standard;
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.organization;
    },
    async organizations(parent, args, context) {
      let { req, proxy } = context;
      const { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Organization.organizations', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!parent) {
        if (!userId) {
          throw new AuthenticationError("Authentication Required.");
        }

        if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
          throw new AuthenticationError(
            "User does not have required permission level."
          );
        }
      }

      const request = new pb.QueryOrganizationsRequest.create({
        spanContext: spanContext,
        query,
        pagination
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindOrganizationResponse;
      try {
        response = await proxy.organizationService.queryOrganizations(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }


      span.finish();
      return response.organizations;
    }
  },
  Mutation: {
    async createOrganization(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Organization.createOrganization', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const createRequest = pb.CreateOrganizationRequest.create({
        spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.organizationService.createOrganization(createRequest);

        if (createResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: createResponse.errors.map(e => e.key),
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
      return createResponse.organization;
    },
    async updateOrganization(_, args, context) {
      let { req, proxy } = context;
      const { organization } = args;
      const span = req.tracer.startSpan('Organization.updateOrganization', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
      //   throw new AuthenticationError(
      //     "User does not have required permission level."
      //   );
      // }

      const updateRequest = pb.UpdateOrganizationRequest.create({
        spanContext,
        orgId,
        organization,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.organizationService.updateOrganization(updateRequest);

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
      return updateResponse.organization;
    },
  }
};
