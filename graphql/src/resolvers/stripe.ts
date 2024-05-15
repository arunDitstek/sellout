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

    async stripePublishKey(parent, args, context) {

      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.stripePublishKey', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      const request = new pb.RetrieveStripeChargeRequest.create({
        spanContext: spanContext,
        orgId: parent?.orgId,
        stripeChargeId: parent?.stripeChargeId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.stripeService.stripePublishKey(request);

        if (response.status !== pb.StatusCode.OK) {
          return {
            publicStripeKey: response.publicStripeKey
          }
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.stripeCharge;
    },
    async stripeCharge(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.stripeCharge', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      if (!parent || !parent.stripeChargeId) return null;

      const request = new pb.RetrieveStripeChargeRequest.create({
        spanContext: spanContext,
        orgId: parent.orgId,
        stripeChargeId: parent.stripeChargeId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.stripeService.retrieveStripeCharge(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.stripeCharge;
    },
    async stripeConnectAccount(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.stripeConnectAccount', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      if (!parent || !parent.stripeId) return null;

      const request = new pb.RetrieveStripeConnectAccountRequest.create({
        spanContext: spanContext,
        stripeAccountId: parent.stripeId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.stripeService.retrieveStripeConnectAccount(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.stripeConnectAccount;
    },
    async stripeCustomer(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.stripeCustomer', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      if (!req.hostnameIsValid) {
        throw new AuthenticationError("Invalid host.");
      }

      if (parent && !parent.stripeCustomerId) return null;

      const request = new pb.RetrieveStripeCustomerRequest.create({
        spanContext: spanContext,
        stripeCustomerId: parent.stripeCustomerId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.stripeService.retrieveStripeCustomer(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.stripeCustomer;
    },
    async listStripeTerminalReaders(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.listStripeTerminalReaders', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const listRequest = pb.ListStripeTerminalReadersRequest.create({
        spanContext,
        userId,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let listResponse: pb.ListStripeTerminalReadersResponse;
      try {
        listResponse = await proxy.stripeService.listStripeTerminalReaders(listRequest);

        if (listResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: listResponse.errors.map(e => e.key),
          });
        }

        if (listResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(listResponse.errors[0].message, listResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return listResponse.readers;
    },
    async getStripeCardByMethod(_, args, context) {
      let { req, proxy } = context;
      const { paymentMethodId } = args;
      const span = req.tracer.startSpan('Stripe.attachStripePaymentMethod', req.span);
      const spanContext = span.context().toString();

      const cardRequest = pb.GetStripeCardByMethodRequest.create({
        spanContext,
        paymentMethodId,
      });

      proxy = <IServiceProxy>proxy;
      let cardResponse: pb.GetStripeCardByMethodResponse;
      try {
        cardResponse = await proxy.stripeService.getStripeCardByMethod(cardRequest);
        if (cardResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: cardResponse.errors.map(e => e.key),
          });
        }

        if (cardResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(cardResponse.errors[0].message, cardResponse.status);
        }
        //cardResponse.card.expMonth = 4
        span.finish();
        return cardResponse.card;
      } catch (e) {
        errorSpan(span, e);
        throw e;
      }
    },
    async createStripeLocationId(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.createStripeLocationId', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const createRequest = pb.CreateStripeTerminalConnectionTokenRequest.create({
        spanContext,
        userId,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse: pb.CreateStripeLocationIdResponse;
      try {
        createResponse = await proxy.stripeService.createStripeLocationId(createRequest);

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
      return createResponse.locationId;
    }



  },
  Mutation: {
    async connectStripe(_, args, context) {
      let { req, proxy } = context;
      const { connectCode } = args;
      const span = req.tracer.startSpan('Stripe.connectStripe', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const connectRequest = pb.ConnectStripeUserRequest.create({
        spanContext,
        orgId,
        connectCode,
      });

      proxy = <IServiceProxy>proxy;
      let connectResponse;
      try {
        connectResponse = await proxy.stripeService.connectStripeUser(connectRequest);

        if (connectResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: connectResponse.errors.map(e => e.key),
          });
        }

        if (connectResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(connectResponse.errors[0].message, connectResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return true;
    },
    async createStripeSetupIntent(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.createStripeSetupIntent', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      const createRequest = pb.CreateStripeSetupIntentRequest.create({
        spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse: pb.CreateStripeSetupIntentResponse;
      try {
        createResponse = await proxy.stripeService.createStripeSetupIntent(createRequest);

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
      return createResponse.clientSecret;
    },
    async attachStripePaymentMethod(_, args, context) {
      let { req, proxy } = context;
      const { paymentMethodId, _id } = args;
      const span = req.tracer.startSpan('Stripe.attachStripePaymentMethod', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      const attachRequest = pb.AttachStripePaymentMethodRequest.create({
        spanContext,
        userId:_id ?_id :userId,
        paymentMethodId
      });

      proxy = <IServiceProxy>proxy;
      let attachResponse: pb.AttachStripePaymentMethodResponse;
      try {
        attachResponse = await proxy.stripeService.attachStripePaymentMethod(attachRequest);

        if (attachResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: attachResponse.errors.map(e => e.key),
          });
        }

        if (attachResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(attachResponse.errors[0].message, attachResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return attachResponse.paymentMethod;
    },
    async createStripeSource(_, args, context) {
      let { req, proxy } = context;
      const { stripeToken, userId } = args;
      const span = req.tracer.startSpan('Stripe.createStripeSource', req.span);
      const spanContext = span.context().toString();
      // const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      const createRequest = pb.CreateStripeSourceRequest.create({
        spanContext,
        userId,
        stripeToken
      });

      proxy = <IServiceProxy>proxy;
      let createResponse;
      try {
        createResponse = await proxy.stripeService.createStripeSource(createRequest);

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
      return createResponse.stripeCustomer;
    },
    async deleteStripeSource(_, args, context) {
      let { req, proxy } = context;
      const { sourceId } = args;
      const span = req.tracer.startSpan('Stripe.deleteStripeSource', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      const deleteRequest = pb.CreateStripeSourceRequest.create({
        spanContext,
        userId,
        sourceId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse;
      try {
        deleteResponse = await proxy.stripeService.deleteStripeSource(deleteRequest);

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
    async registerStripeTerminalReader(_, args, context) {
      let { req, proxy } = context;
      const { label, registrationCode } = args;
      const span = req.tracer.startSpan('Stripe.registerStripeTerminalReader', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const registerRequest = pb.CreateStripeTerminalConnectionTokenRequest.create({
        spanContext,
        userId,
        orgId,
        label,
        registrationCode,
      });

      proxy = <IServiceProxy>proxy;
      let registerResponse: pb.CreateStripeTerminalConnectionTokenResponse;
      try {
        registerResponse = await proxy.stripeService.registerStripeTerminalReader(registerRequest);

        if (registerResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: registerResponse.errors.map(e => e.key),
          });
        }

        if (registerResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(registerResponse.errors[0].message, registerResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return registerResponse.reader;
    },
    async deleteStripeTerminalReader(_, args, context) {
      let { req, proxy } = context;
      const { readerId } = args;
      const span = req.tracer.startSpan('Stripe.deleteStripeTerminalReader', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const deleteRequest = pb.DeleteStripeTerminalReaderRequest.create({
        spanContext,
        userId,
        orgId,
        readerId,
      });

      proxy = <IServiceProxy>proxy;
      let deleteResponse: pb.ListStripeTerminalReadersResponse;
      try {
        deleteResponse = await proxy.stripeService.deleteStripeTerminalReader(deleteRequest);

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
      return deleteResponse.success;
    },
    async createStripeTerminalConnectionToken(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('Stripe.createStripeTerminalConnectionToken', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError('Authentication Required.');
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.BOX_OFFICE)) {
        throw new AuthenticationError('User does not have required permission level.');
      }

      const createRequest = pb.CreateStripeTerminalConnectionTokenRequest.create({
        spanContext,
        userId,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let createResponse: pb.CreateStripeTerminalConnectionTokenResponse;
      try {
        createResponse = await proxy.stripeService.createStripeTerminalConnectionToken(createRequest);

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
      return createResponse.connectionToken;
    }

  }
};
