import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from './../graphqlError';
import { roles, hasPermission } from './../permissions';
import { OrderChannelEnum } from '@sellout/models/.dist/enums/OrderChannelEnum';
import { RolesEnum } from '@sellout/models/.dist/interfaces/IRole'
import { OrderTypeEnum } from '@sellout/models/.dist/interfaces/IOrderType';
// var ip = require('what-is-my-ip-address');

export const resolvers = {
  Query: {
    async order(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.order', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      const request = new pb.FindOrderByIdRequest.create({
        spanContext: spanContext,
        orderId: args.orderId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.findOrderById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.order;
    },
    async orderDetails(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.orderDetails', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      const request = new pb.FindOrderByEventIdRequest.create({
        spanContext: spanContext,
        eventId: args.eventId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.findOrderByEventId(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response;
    },

    async eventOrderCount(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.eventOrderCount', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      const request = new pb.FindOrderByEventIdRequest.create({
        spanContext: spanContext,
        eventId: args.eventId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.eventOrderCount(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response;
    },
    async orders(_, args, context) {
      let { req, proxy } = context;
      let { query = {}, pagination } = args;
      const span = req.tracer.startSpan('Order.orders', req.span);
      const spanContext = span.context().toString();
      var { orgId } = req.user;

 
      // HOSTNAME
      // console.log("HEADERS",JSON.stringify(req.headers));

      // if (!userId) {
      //   throw new AuthenticationError("Authentication Required.");
      // }

      // if (!orgId) {
      //   query.userIds = [userId];
      // }
      if (query.userIds && query.userIds.length > 0) {
        orgId
      }
      const request = new pb.QueryOrdersRequest.create({
        spanContext,
        orgId,
        query,
        pagination,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryOrdersResponse;
      try {
        response = await proxy.orderService.queryOrders(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.orders;
    },
    async orderAnalytics(_, args, context) {
      let { req, proxy } = context;
      let { query = {} } = args;
      const span = req.tracer.startSpan('Order.orderAnalytics', req.span);
      const spanContext = span.context().toString();
      const { orgId } = req.user;

      // const { userId, orgId } = req.user;

      // if (!userId) {
      //   throw new AuthenticationError("Authentication Required.");
      // }

      // if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
      //   throw new AuthenticationError(
      //     "User does not have required permission level."
      //   );
      // }

      const request = new pb.QueryOrderAnalyticsRequest.create({
        spanContext,
        orgId,
        query,
      });

      proxy = <IServiceProxy>proxy;
      let response: pb.QueryOrdersResponse;
      try {
        response = await proxy.orderService.queryOrderAnalytics(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.analytics;
    },

    async ordersChargeUpdate(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.ordersChargeUpdate', req.span);
      const spanContext = span.context().toString();

      const request = pb.OrdersChargeUpdateRequest.create({
        spanContext
      });

      proxy = <IServiceProxy>proxy;
      try {
        proxy.orderService.ordersChargeUpdate(request);

        // if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
        //   throw new UserInputError('Invalid Fields', {
        //     invalidArgs: response.errors.map(e => e.key),
        //   });
        // }

        // if (response.status !== pb.StatusCode.OK) {
        //   throw new ApolloError(response.errors[0].message, response.status);
        // }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      // span.finish();
      return { message: 'working' };
    },
    async ticketRestriction(_, args, context) {
      let { req, proxy } = context;
      const { query } = args;
      const span = req.tracer.startSpan('Order.ticketRestriction', req.span);
      const spanContext = span.context().toString();

      const request = new pb.TicketRestrictionRequest.create({
        spanContext: spanContext,
        query,
      });
      proxy = <IServiceProxy>proxy;
      let response: pb.TicketRestrictionResponse;
      try {
        response = await proxy.orderService.ticketRestriction(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response;
    },

  },
  Mutation: {
    async createOrder(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.createOrder', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;


      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      // If the channel is BoxOffice, the user must be a box office user
      if (params.type === OrderTypeEnum.Complimentary) {
        // console.log(await hasPermission(proxy, spanContext, req.user, roles.OWNER),await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER),'.......Compliementry.')
        if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
          // if (!await hasPermission(proxy, spanContext, req.user, roles.OWNER) && !await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
          throw new AuthenticationError(
            "User does not have required permission level."
          );
        }
      }
      if (params.channel === OrderChannelEnum.BoxOffice) {
        // console.log(await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE),'........',req.user, roles.BOX_OFFICE)
        if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
          // if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE) && !await hasPermission(proxy, spanContext, req.user, roles.OWNER) && !await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER) && !await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
          throw new AuthenticationError(
            "User does not have required permission level."
          );
        }
      }
      
      // params.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      // params.ipAddress = await ip.v4() || req.connection.remoteAddress;
     
      params.ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      console.log("headersTest",req.headers)
      // HOSTNAME
      const request = pb.CreateOrderRequest.create({
        spanContext,
        requestorId: userId,
        params,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.createOrder(request);

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
      return response.order
    },
    async createSeasonOrder(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.createSeasonOrder', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      // If the channel is BoxOffice, the user must be a box office user
      if (params.type === OrderTypeEnum.Complimentary) {
        // console.log(await hasPermission(proxy, spanContext, req.user, roles.OWNER),await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER),'.......Compliementry.')
        if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
          // if (!await hasPermission(proxy, spanContext, req.user, roles.OWNER) && !await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER)) {
          throw new AuthenticationError(
            "User does not have required permission level."
          );
        }
      }
      if (params.channel === OrderChannelEnum.BoxOffice) {
        // console.log(await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE),'........',req.user, roles.BOX_OFFICE)
        if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
          // if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE) && !await hasPermission(proxy, spanContext, req.user, roles.OWNER) && !await hasPermission(proxy, spanContext, req.user, roles.SUPER_USER) && !await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
          throw new AuthenticationError(
            "User does not have required permission level."
          );
        }
      }
      params.ipAddress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log("headersTestSeason",req.headers)
      // HOSTNAME
      const request = pb.CreateSeasonOrderRequest.create({
        spanContext,
        requestorId: userId,
        params,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {

        response = await proxy.orderService.createSeasonOrder(request);

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
      return response.order
    }, async createOrderPaymentIntent(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.createOrderPaymentIntent', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // HOSTNAME
      const request = pb.CreateOrderRequest.create({
        spanContext,
        requestorId: userId,
        params,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.createOrderPaymentIntent(request);

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
      return response;
    }, async createSeasonOrderPaymentIntent(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.createSeasonOrderPaymentIntent', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }
      // HOSTNAME
      const request = pb.CreateOrderRequest.create({
        spanContext,
        requestorId: userId,
        params,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {

        response = await proxy.orderService.createSeasonOrderPaymentIntent(request);

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
      return response;
    },
    async refundOrder(_, args, context) {
      let { req, proxy } = context;
      const { orderId, refundAmount, ticketIds, upgradeIds, refundReason, processingFee, promoterFee } = args;
      const span = req.tracer.startSpan('Order.refundOrder', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;
      const { user } = req

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      let userRoleForPermission = roles.ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, userRoleForPermission)) {
        let hasUserPermission = false
        // Getting user role to allow refunding for BOX_OFFICE role also
        if (orgId) {
          let roleResponse: pb.FindUserRoleResponse;
          const roleRequest = pb.FindUserRoleRequest.create({
            spanContext,
            userId: user.userId,
            orgId: user.orgId,
          });

          try {
            roleResponse = await proxy.roleService.findUserRole(roleRequest);
          } catch (e) {
            // return false;
          }

          const { role } = roleResponse
          if (role) {
            if (role.role === RolesEnum.BOX_OFFICE) {
              hasUserPermission = true
            }
            // userRoleForPermission = RolesEnum.BOX_OFFICE
          }
        }
        if (!hasUserPermission) {
          throw new AuthenticationError("User does not have required permission level.");
        }
      }

      const request = pb.RefundOrderRequest.create({
        spanContext,
        orgId,
        orderId,
        refundAmount,
        ticketIds,
        upgradeIds,
        refundedBy: userId,
        refundReason,
        processingFee,
        promoterFee
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.RefundOrderResponse;

      try {
        response = await proxy.orderService.refundOrder(request);

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
      return response.order;
    },
    async cancelOrder(_, args, context) {
      let { req, proxy } = context;
      const { orderId, ticketIds, upgradeIds, cancelReason } = args;
      const span = req.tracer.startSpan('Order.cancelOrder', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;
      const { user } = req

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      let userRoleForPermission = roles.ADMIN
      if (!await hasPermission(proxy, spanContext, req.user, userRoleForPermission)) {
        let hasUserPermission = false
        // Getting user role to allow refunding for BOX_OFFICE role also
        if (orgId) {
          let roleResponse: pb.FindUserRoleResponse;
          const roleRequest = pb.FindUserRoleRequest.create({
            spanContext,
            userId: user.userId,
            orgId: user.orgId,
          });

          try {
            roleResponse = await proxy.roleService.findUserRole(roleRequest);
          } catch (e) {
            // return false;
          }

          const { role } = roleResponse
          if (role) {
            if (role.role === RolesEnum.BOX_OFFICE) {
              hasUserPermission = true
            }
            // userRoleForPermission = RolesEnum.BOX_OFFICE
          }
        }
        if (!hasUserPermission) {
          throw new AuthenticationError("User does not have required permission level.");
        }
      }

      const request = pb.CancelOrderRequest.create({
        spanContext,
        orgId,
        orderId,
        ticketIds,
        upgradeIds,
        cancelReason,
        requestorId: userId
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.CancelOrderResponse;

      try {
        response = await proxy.orderService.cancelOrder(request);

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
      return response.order;
    },
    async refundEventOrders(_, args, context) {
      let { req, proxy } = context;
      const { eventId, dryRun, refundReason, eventType } = args;
      const span = req.tracer.startSpan('Order.refundEventOrders', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId, } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.RefundEventOrdersRequest.create({
        spanContext,
        orgId,
        eventId,
        dryRun,
        refundedBy: userId,
        refundReason,
        eventType
      });

      proxy = <IServiceProxy>proxy;

      let response: pb.RefundOrderResponse;

      try {
        response = await proxy.orderService.refundEventOrders(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: response.errors.map(e => e.key),
          });
        }
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0] && response.errors[0].message ? response.errors[0].message : "", response.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response;
    },
    async scanOrder(_, args, context) {
      let { req, proxy } = context;
      const { orderId, ticketIds, upgradeIds } = args;
      const span = req.tracer.startSpan('Order.scanOrder', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.SCANNER)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.ScanOrderRequest.create({
        spanContext,
        orderId: orderId,
        ticketIds: ticketIds,
        upgradeIds: upgradeIds,
        scannedBy: userId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.scanOrder(request);

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
      return response.status === pb.StatusCode.OK;
    },
    async sendOrderReceiptEmail(_, args, context) {
      let { req, proxy } = context;
      const { orderId } = args;
      const span = req.tracer.startSpan('Order.sendOrderReceiptEmail', req.span);
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

      const request = pb.SendOrderReceiptEmailRequest.create({
        spanContext,
        orgId: orgId,
        orderId: orderId,
        requestorId: userId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.sendOrderReceiptEmail(request);

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
      return response.status === pb.StatusCode.OK;
    },

    async sendSeasonOrderReceiptEmail(_, args, context) {
      let { req, proxy } = context;
      const { orderId } = args;
      const span = req.tracer.startSpan('Order.sendSeasonOrderReceiptEmail', req.span);
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

      const request = pb.SendOrderReceiptEmailRequest.create({
        spanContext,
        orgId: orgId,
        orderId: orderId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.sendSeasonOrderReceiptEmail(request);

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
      return response.status === pb.StatusCode.OK;
    },
    async sendOrderRefundEmail(_, args, context) {
      let { req, proxy } = context;
      const { orderId } = args;
      const span = req.tracer.startSpan('Order.sendOrderRefundEmail', req.span);
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

      const request = pb.SendOrderRefundEmailRequest.create({
        spanContext,
        orderId: orderId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.sendOrderRefundEmail(request);

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
      return response.status === pb.StatusCode.OK;
    },
    async sendOrderQRCodeEmail(_, args, context) {
      let { req, proxy } = context;
      const { orderId } = args;
      const span = req.tracer.startSpan('Order.sendOrderQRCodeEmail', req.span);
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

      const sendOrderQRCodeEmailRequest = pb.SendOrderQRCodeEmailRequest.create({
        spanContext,
        orgId: orgId,
        orderId: orderId,
        requestorId: userId
      });

      proxy = <IServiceProxy>proxy;
      let sendOrderQRCodeEmailResponse;
      try {
        sendOrderQRCodeEmailResponse = await proxy.orderService.sendOrderQRCodeEmail(sendOrderQRCodeEmailRequest);

        if (sendOrderQRCodeEmailResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: sendOrderQRCodeEmailResponse.errors.map(e => e.key),
          });
        }

        if (sendOrderQRCodeEmailResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(sendOrderQRCodeEmailResponse.errors[0].message, sendOrderQRCodeEmailResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return sendOrderQRCodeEmailResponse.status === pb.StatusCode.OK;
    },
    async generateOrderReport(_, args, context) {
      let { req, proxy } = context;
      const { query } = args;
      const span = req.tracer.startSpan('Order.generateOrderReport', req.span);
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

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orgId,
        query,
        userId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.generateOrderReport(request);

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
      return { url: response.url, message: response.message };
    },
    async generateActivityReport(_, args, context) {
      let { req, proxy } = context;
      const { query } = args;
      const span = req.tracer.startSpan('Order.generateActivityReport', req.span);
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

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orgId,
        query,
        userId
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.generateActivityReport(request);

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
      return { url: response.url, message: response.message };
    },
    async breakApartOrder(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.breakApartOrder', req.span);
      const spanContext = span.context().toString();
      const { orderId } = args;
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orderId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.breakApartOrder(request);
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
      return response.order;
    }, async breakApartSeasonOrder(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.breakApartSeasonOrder', req.span);
      const spanContext = span.context().toString();
      const { orderId } = args;
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orderId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.breakApartSeasonOrder(request);
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
      return response.order;
    }, async multipleBreakApartOrder(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.multipleBreakApartOrder', req.span);
      const spanContext = span.context().toString();
      const { orderId } = args;
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orderId,
      });
      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.multipleBreakApartOrder(request);
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
      return response.order;
    }, async multipleBreakApartSeasonOrder(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.multipleBreakApartSeasonOrder', req.span);
      const spanContext = span.context().toString();
      const { orderId } = args;
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orderId,
      });
      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.multipleBreakApartSeasonOrder(request);
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
      return response.order;
    }, async batchPrintBreakApartOrder(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Order.batchPrintBreakApartOrder', req.span);
      const spanContext = span.context().toString();
      const { orderId } = args;
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError(
          "User does not have required permission level."
        );
      }

      const request = pb.GenerateOrderReportRequest.create({
        spanContext,
        orderId,
      });
      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.batchPrintBreakApartOrder(request);
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
      return response.order;
    },
    async updateOrder(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.updateOrder', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;


      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // HOSTNAME
      const request = pb.UpdateOrderRequest.create({
        spanContext,
        requestorId: userId,
        params,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.updateOrder(request);

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
      return response.order
    },
    async updateGuestOrder(_, args, context) {
      let { req, proxy } = context;
      const { params } = args;
      const span = req.tracer.startSpan('Order.updateGuestOrder', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;


      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      // HOSTNAME
      const request = pb.UpdateGuestOrderRequest.create({
        spanContext,
        requestorId: userId,
        params: {
          ...params
        },
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.orderService.updateGuestOrder(request);

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
      return response.order
    }
  }

};
