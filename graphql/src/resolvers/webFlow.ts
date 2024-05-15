import * as pb from "@sellout/models/.dist/sellout-proto";
import { IServiceProxy } from "../proxyProvider";
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan
} from "./../graphqlError";
import { roles, hasPermission } from "./../permissions";

export const resolvers = {
  Query: {
    async webFlow(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("WebFlow.webFlow", req.span);
      const spanContext = span.context().toString();
      let { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.ADMIN))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }
      
      orgId = parent && parent._id ? parent._id : orgId;
    
      const request = new pb.FindOrganizationWebFlowRequest.create({
        spanContext: spanContext,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindOrganizationWebFlowResponse;
      try {
        response = await proxy.webFlowService.findOrganizationWebFlow(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            response.errors[0].message,
            pb.StatusCode.BAD_REQUEST
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.webFlow;
    },
    async webFlowEntity(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("WebFlow.webFlowEntity", req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.SCANNER))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = new pb.FindWebFlowEntityRequest.create({
        spanContext: spanContext,
        orgId,
        selloutId: parent._id,
        entityType: args.entityType,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindWebFlowEntityResponse;
      try {
        response = await proxy.webFlowService.findWebFlowEntity(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            response.errors[0].message,
            pb.StatusCode.BAD_REQUEST
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.entity;
    },
    async webFlowSites(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("WebFlow.webFlowSites", req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = new pb.ListWebFlowSitesRequest.create({
        spanContext,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListWebFlowSitesResponse;
      try {
        response = await proxy.webFlowService.listWebFlowSites(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            response.errors[0].message,
            pb.StatusCode.BAD_REQUEST
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.sites;
    },
    
  },
  Mutation: {
    async createWebFlow(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("WebFlow.createWebFlow", req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.ADMIN))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const createRequest = pb.CreateWebFlowRequest.create({
        spanContext,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.webFlowService.createWebFlow(createRequest);

        if (createResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError("Invalid Fields", {
            invalidArgs: createResponse.errors.map(e => e.key)
          });
        }

        if (createResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            createResponse.errors[0].message,
            createResponse.status
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return createResponse.webFlow;
    },
    async createWebFlowSite(_, args, context) {
      let { req, proxy } = context;
      let { webFlowId, orgId } = args;
      const span = req.tracer.startSpan("WebFlow.createWebFlowSite", req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      
      if (!(await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const createRequest = pb.CreateWebFlowSiteRequest.create({
        spanContext,
        orgId: orgId,
        webFlowId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.webFlowService.createWebFlowSite(createRequest);

        if (createResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError("Invalid Fields", {
            invalidArgs: createResponse.errors.map(e => e.key)
          });
        }

        if (createResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            createResponse.errors[0].message,
            createResponse.status
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return createResponse.webFlow;
    },
    async remapWebFlowSite(_, args, context) {
      let { req, proxy } = context;
      let { webFlowId } = args;
      const span = req.tracer.startSpan("WebFlow.createWebFlowSite", req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.RemapWebFlowSiteRequest.create({
        spanContext,
        webFlowId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.webFlowService.remapWebFlowSite(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError("Invalid Fields", {
            invalidArgs: response.errors.map(e => e.key)
          });
        }

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            response.errors[0].message,
            response.status
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.webFlows;
    },
    async updateVenuePublishing(_, args, context) {
      let { req, proxy } = context;
      let { venueId, alwaysPublishTo } = args;
      const span = req.tracer.startSpan("WebFlow.updateVenuePublishing", req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!(await hasPermission(proxy, spanContext, req.user, roles.ADMIN))) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const updateRequest = pb.UpdateVenuePublishingRequest.create({
        spanContext,
        orgId,
        venueId,
        alwaysPublishTo,
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse;
      try {
        updateResponse = await proxy.webFlowService.updateVenuePublishing(updateRequest);

        if (updateResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError("Invalid Fields", {
            invalidArgs: updateResponse.errors.map(e => e.key)
          });
        }

        if (updateResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(
            updateResponse.errors[0].message,
            updateResponse.status
          );
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updateResponse.webFlow;
    }
  }
};
