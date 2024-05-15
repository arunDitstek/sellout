import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Query from "@sellout/models/.dist/interfaces/IQuery";
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
    // SPECIAL ROLE CASE
    async role(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Role.role', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = new pb.FindRoleByIdRequest.create({
        spanContext: spanContext,
        roleId: args.roleId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindRoleByIdResponse;
      try {
        response = await proxy.roleService.findRoleById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      let { role } = response;

      if (!role) return null;

      // role is in the org, user owns the role, or role has not yet been assigned a user
      if (role.orgId === orgId || role.userId === userId || !role.userId) {
        span.finish();
        return response.role;
      } else {
        span.finish();
        throw new AuthenticationError(
          'You do not have the required permission level to view this role.'
        );
      }
    },
    async roles(_, args, context) {
      let { req, proxy } = context;
      let { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Role.roles', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have required permission level to view these roles.'
        );
      }


      query.orgId = orgId;
      query = Query.toPb(query);

      const request = new pb.QueryRolesRequest.create({
        spanContext: spanContext,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryRolesResponse;
      try {
        response = await proxy.roleService.queryRoles(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.roles;
    },
    async userRoles(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Role.userRoles', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = new pb.QueryRolesRequest.create({
        spanContext: spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryRolesResponse;
      try {
        response = await proxy.roleService.findUserRoles(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.roles;
    },
    async isSuperUser(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Role.isSuperUser', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      try {
        return await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)
      } catch(e) {
        throw new AuthenticationError(
          'You do not have the required permission level view this setting.'
        );
      }

    },
  },
  Mutation: {
    async createRole(_, args, context) {
      let { req, proxy } = context;
      let { role, update } = args;
      const span = req.tracer.startSpan('Role.createRole', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      role.userEmail = role.userEmail.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, role.role === roles.OWNER ? roles.OWNER : roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have required permission level to create this role.'
        );
      }

      const createRequest = pb.CreateRoleRequest.create({
        spanContext,
        creatorId: userId,
        role,
        update,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.roleService.createRole(createRequest);

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
      return createResponse.role;
    },
    async deleteRole(_, args, context) {
      let { req, proxy } = context;
      const { roleId } = args;
      const span = req.tracer.startSpan('Role.deleteRole', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have the required permission level to delete roles.'
        );
      }

      const deleteRequest = pb.DeleteRoleRequest.create({
        spanContext,
        roleId: roleId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse;
      try {
        deleteResponse = await proxy.roleService.deleteRole(deleteRequest);

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
      return deleteResponse.status === pb.StatusCode.OK;
    },
    // SPECIAL ROLE CASE
    async acceptRole(_, args, context) {
      let { req, proxy } = context;
      const { roleId, accept } = args;
      const span = req.tracer.startSpan('Role.acceptRole', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const findRequest = new pb.FindRoleByIdRequest.create({
        spanContext: spanContext,
        roleId,
      });

      proxy = <IServiceProxy>proxy;
      let findResponse: pb.FindRoleByIdResponse;
      try {
        findResponse = await proxy.roleService.findRoleById(findRequest);

        if (findResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(findResponse.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      let { role } = findResponse;

      if(!role) return null;

      const acceptRequest = pb.AcceptRoleRequest.create({
        spanContext,
        roleId,
        accept,
      });

      let acceptResponse;
      try {
        acceptResponse = await proxy.roleService.acceptRole(acceptRequest);

        if (acceptResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: acceptResponse.errors.map(e => e.key),
          });
        }

        if (acceptResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(acceptResponse.errors[0].message, acceptResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return acceptResponse.role;
    }


  }
};
