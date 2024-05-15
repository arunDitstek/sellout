import * as pb from "@sellout/models/.dist/sellout-proto";
import { IServiceProxy } from "../proxyProvider";
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan
} from "../graphqlError";
import { roles, hasPermission } from "../permissions";

export const resolvers = {
  Query: {
    async seating(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("Seating.seating", req.span);
      const spanContext = span.context().toString();
      let { orgId } = req.user;

      // if (!userId) {
      //   throw new AuthenticationError("Authentication Required.");
      // }
      
      // if (!(await hasPermission(proxy, spanContext, req.user, roles.ADMIN))) {
      //   return null;
      // }
      
      if(orgId || (parent && parent?._id) || (args && args?.orgId))
      
      orgId = parent && parent?._id ? parent?._id : args?.orgId ?  args?.orgId : orgId;
      if (!orgId) {
        return null;
      }
    
      const request = new pb.FindOrganizationSeatingRequest.create({
        spanContext: spanContext,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindOrganizationSeatingResponse;
      try {
        response = await proxy.seatingService.findOrganizationSeating(request);

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
      return response.seating;
    },
     async seatingPublicKey(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan("Seating.publicKey", req.span);
      const spanContext = span.context().toString();
    
      const request = new pb.FindOrganizationSeatingRequest.create({
        spanContext: spanContext,
        orgId: parent?.orgId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindOrganizationSeatingResponse;
      try {
        response = await proxy.seatingService.findOrganizationSeating(request);

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
      return response.seating ? response.seating.publicKey : null;
    },
  },
  Mutation: {
     async createOrganizationSeating(_, args, context) {
      let { req, proxy } = context;
      const { orgId } = args;
      const span = req.tracer.startSpan("Seating.createOrganizationSeating", req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create seating keys.'
        );
      }
      const createRequest = pb.CreateSeatingRequest.create({
        spanContext,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.seatingService.createSeating(createRequest);

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
      return createResponse.seating;
    },
  }
};
