import * as pb from '@sellout/models/.dist/sellout-proto';
// import * as Query from "@sellout/models/.dist/interfaces/IQuery";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
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
    async fee(parent, args, context) {
      let { req, proxy } = context;
      let { feeId } = args;
      const span = req.tracer.startSpan('Fee.fee', req.span);
      const spanContext = span.context().toString();

      const request = new pb.FindFeeByIdRequest.create({
        spanContext: spanContext,
        feeId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.FindFeeByIdResponse;
      try {
        response = await proxy.feeService.findFeeById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fee;
    },
    async fees(_, args, context) {
      let { req, proxy } = context;
      let { feeIds, orgId } = args;
      const span = req.tracer.startSpan('Fee.fee', req.span);
      const spanContext = span.context().toString();

      const request = new pb.ListFeesByIdRequest.create({
        spanContext: spanContext,
        orgId,
        feeIds,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListFeesByIdResponse;
      try {
        response = await proxy.feeService.listFeesById(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    },
    async eventFees(parent, args, context) {
      let { req, proxy } = context;
      let { eventId } = args;
      const span = req.tracer.startSpan('Fee.eventFees', req.span);
      const spanContext = span.context().toString();

      const request = new pb.ListEventFeesRequest.create({
        spanContext: spanContext,
        orgId: parent && parent.orgId ? parent.orgId : null,
        eventId: parent && parent._id ? parent._id : eventId
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListEventFeesResponse;
      try {
        response = await proxy.feeService.listEventFees(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    },
    async seasonFees(parent, args, context) {
      let { req, proxy } = context;
      let { seasonId } = args;
      const span = req.tracer.startSpan('Fee.seasonFees', req.span);
      const spanContext = span.context().toString();

      const request = new pb.ListEventFeesRequest.create({
        spanContext: spanContext,
        orgId: parent && parent.orgId ? parent.orgId : null,
        // eventId: parent && parent._id ? parent._id : eventId,
        seasonId: parent && parent._id ? parent._id : seasonId
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListEventFeesResponse;
      try {
        response = await proxy.feeService.listEventFees(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    }, async seasonEvents(parent, args, context) {
      let { req, proxy } = context;
      let { seasonId } = args;
      const span = req.tracer.startSpan('Fee.seasonEvents', req.span);
      const spanContext = span.context().toString();
      const request = new pb.ListEventFeesRequest.create({
        spanContext: spanContext,
        orgId: parent && parent.orgId ? parent.orgId : null,
        seasonId: parent && parent._id ? parent._id : seasonId
      });

      proxy = <IServiceProxy>proxy;


      let response: pb.ListEventsResponse;
      try {
        response = await proxy.eventService.listEventBySeasonId(request);
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
    async listFees(parent, args, context) {
      let { req, proxy } = context;
      let { orgId, feeIds } = parent;
      const span = req.tracer.startSpan('Fee.listFees', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!orgId || !feeIds || !feeIds.length) return [];

      const request = new pb.ListFeesByIdRequest.create({
        spanContext: spanContext,
        orgId,
        feeIds,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListFeesByIdResponse;
      try {
        response = await proxy.feeService.listFeesById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    },
    async processingFee(parent, args, context) {
      let { req } = context;
      const span = req.tracer.startSpan('Fee.listFees', req.span);
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const totalParams = {
        tickets: parent.order.tickets,
        upgrades: parent.order.upgrades,
        fees: parent.fees,
        paymentMethodType: parent.order?.payments[0]?.paymentMethodType
      };

      // const subTotal = PaymentUtil.calculatePaymentSubtotal(totalParams);
      // const subTotal = PaymentUtil.calculatePaymentTotal(totalParams).subTotal;
      // const total = PaymentUtil.calculatePaymentTotal(totalParams).total;
      // const totalFee = PaymentUtil.calculatePaymentTotal(totalParams).totalWithoutTaxFees
      // const totalFee = PaymentUtil.calculatePaymentTotal(totalParams).totalFees
      const totalFee = PaymentUtil.calculateFeeWithoutTax(totalParams);
      console.log("ALL FEES", totalFee);
      span.finish();
      return totalFee;
    },
    async organizationFees(_, args, context) {
      let { req, proxy } = context;
      const { orgId } = args;
      const span = req.tracer.startSpan('Fee.organizationFees', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to view organization fees.'
        );
      }

      const request = new pb.ListOrganizationFeesRequest.create({
        spanContext: spanContext,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListPlatformFeesResponse;
      try {
        response = await proxy.feeService.listOrganizationFees(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    },
    async platformFees(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Fee.platformFees', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to view platform fees.'
        );
      }

      const request = new pb.ListPlatformFeesRequest.create({
        spanContext: spanContext,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListPlatformFeesResponse;
      try {
        response = await proxy.feeService.listPlatformFees(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.fees;
    }, async eventFeeCalculation(_, args, context) {

      let { req, proxy } = context;
      const { query = {} } = args;

      const span = req.tracer.startSpan('Fee.eventFees', req.span);
      const spanContext = span.context().toString();
      const { orgId } = req.user;

      const request = new pb.ListEventFeesRequest.create({
        spanContext: spanContext,
        orgId: orgId,
        eventId: query.eventId
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.ListEventFeesResponse;
      try {
        response = await proxy.feeService.listEventFees(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      const totalFee = PaymentUtil.calculatePaymentTotal({ fees: response.fees, upgrades: query.upgrades, tickets: query.tickets, paymentMethodType: query.paymentMethodType,promotions:query.promotions });
      span.finish();
      return totalFee;
    }
  },
  Mutation: {
    async createFee(_, args, context) {
      let { req, proxy } = context;
      const { fee } = args;
      const span = req.tracer.startSpan('Fee.createFee', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId, eventId, seasonId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create fees.'
        );
      }

      const createRequest = pb.CreateFeeRequest.create({
        spanContext,
        orgId,
        eventId,
        seasonId,
        requestorId: userId,
        fee,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.feeService.createFee(createRequest);

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
      return createResponse.fee;
    },
    async createOrganizationFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, fee } = args;
      const span = req.tracer.startSpan('Fee.createOrganizationFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create organization fees.'
        );
      }

      const createRequest = pb.CreateFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        fee,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.feeService.createOrganizationFee(createRequest);

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
      return createResponse.fee;
    },
    async createEventOrSeasonFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, eventId, seasonId, fee } = args;
      const span = req.tracer.startSpan('Fee.createEventOrSeasonFee', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId: contextOrgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create organization fees.'
        );
      }

      const createRequest = pb.CreateFeeRequest.create({
        spanContext,
        orgId: orgId || contextOrgId,
        eventId,
        seasonId,
        requestorId: userId,
        fee,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.feeService.createEventOrSeasonFee(createRequest);

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
      return createResponse.fee;
    },
    async createPlatformFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, fee } = args;
      const span = req.tracer.startSpan('Fee.createPlatformFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create platform fees.'
        );
      }

      const createRequest = pb.CreateFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        fee,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.feeService.createPlatformFee(createRequest);

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
      return createResponse.fee;
    },
    async updateFee(_, args, context) {
      let { req, proxy } = context;
      const { fee } = args;
      const span = req.tracer.startSpan('Fee.updateFee', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have the required permission level to update fees.'
        );
      }

      const updateFeeRequest = pb.UpdateFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        fee
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse: pb.UpdateFeeResponse;
      try {
        updateResponse = await proxy.feeService.updateFee(updateFeeRequest);

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
      return updateResponse.fee;
    },
    async updateOrganizationFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, fee } = args;
      const span = req.tracer.startSpan('Fee.updateOrganizationFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to update organization fees.'
        );
      }

      const updateRequest = pb.UpdateFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        fee
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse: pb.UpdateFeeResponse;
      try {
        updateResponse = await proxy.feeService.updateOrganizationFee(updateRequest);

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
      return updateResponse.fee;
    },
    async updateEventOrSeasonFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, eventId, seasonId, fee } = args;
      const span = req.tracer.startSpan('Fee.updateEventOrSeasonFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to update organization fees.'
        );
      }

      const updateRequest = pb.UpdateFeeRequest.create({
        spanContext,
        orgId,
        eventId,
        seasonId,
        requestorId: userId,
        fee
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse: pb.UpdateFeeResponse;
      try {
        updateResponse = await proxy.feeService.updateEventOrSeasonFee(updateRequest);

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
      return updateResponse.fee;
    },
    async updatePlatformFee(_, args, context) {
      let { req, proxy } = context;
      const { fee } = args;
      const span = req.tracer.startSpan("Fee.updatePlatformFee", req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // SUPER ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create platform fees.'
        );
      }

      const updateFeeRequest = pb.UpdateFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        fee
      });

      proxy = <IServiceProxy>proxy;
      let updateResponse: pb.UpdateFeeResponse;
      try {
        updateResponse = await proxy.feeService.updatePlatformFee(updateFeeRequest);

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
      return updateResponse.fee;
    },
    async disableFee(_, args, context) {
      let { req, proxy } = context;
      const { feeId } = args;
      const span = req.tracer.startSpan('Fee.disableFee', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have the required permission level to create fees.'
        );
      }

      const disableFeeRequest = pb.DisableFeeRequest.create({
        spanContext,
        orgId,
        requestorId: userId,
        feeId,
      });

      proxy = <IServiceProxy>proxy;
      let disableFeeResponse: pb.DisableFeeResponse;
      try {
        disableFeeResponse = await proxy.feeService.disableFee(disableFeeRequest);

        if (disableFeeResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: disableFeeResponse.errors.map(e => e.key),
          });
        }

        if (disableFeeResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(disableFeeResponse.errors[0].message, disableFeeResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return disableFeeResponse.status === pb.StatusCode.OK;
    },
    async deleteOrganizationFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, feeId } = args;
      const span = req.tracer.startSpan('Fee.deleteOrganizationFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to delete organization fees.'
        );
      }

      const deleteRequest = pb.DeleteOrganizationFeeRequest.create({
        spanContext,
        orgId,
        feeId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse: pb.DisableFeeResponse;
      try {
        deleteResponse = await proxy.feeService.deleteOrganizationFee(deleteRequest);

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
    async deleteEventOrSeasonFee(_, args, context) {
      let { req, proxy } = context;
      const { orgId, eventId, seasonId, feeId } = args;
      const span = req.tracer.startSpan('Fee.deleteEventOrSeasonFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to delete organization fees.'
        );
      }

      const deleteRequest = pb.DeleteEventOrSeasonFeeRequest.create({
        spanContext,
        orgId,
        eventId,
        seasonId,
        feeId,
        requestorId: userId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse: pb.DisableFeeResponse;
      try {
        deleteResponse = await proxy.feeService.deleteEventOrSeasonFee(deleteRequest);

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
    async deletePlatformFee(_, args, context) {
      let { req, proxy } = context;
      const { feeId } = args;
      const span = req.tracer.startSpan('Fee.deletePlatformFee', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          'You do not have the required permission level to delete platform fees.'
        );
      }

      const deleteRequest = pb.DisableFeeRequest.create({
        spanContext,
        feeId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse: pb.DisableFeeResponse;
      try {
        deleteResponse = await proxy.feeService.deletePlatformFee(deleteRequest);

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
    async applyPlatformFeesToAllOrganizations(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Fee.applyPlatformFeesToAllOrganizations', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const applyRequest = pb.ApplyPlatformFeesToAllOrganizationsRequest.create({
        spanContext,
      });

      proxy = <IServiceProxy>proxy;
      let applyResponse;
      try {
        applyResponse = await proxy.feeService.applyPlatformFeesToAllOrganizations(applyRequest);

        if (applyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: applyResponse.errors.map(e => e.key),
          });
        }

        if (applyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(applyResponse.errors[0].message, applyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return applyResponse.success;
    }
  }
};
