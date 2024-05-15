import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import * as Query from "@sellout/models/.dist/interfaces/IQuery";
import Joi from '@hapi/joi';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import { Fee } from './Fee';
import FeeStore from './FeeStore';
import IFee, { FeeAppliedByEnum, FeeAppliedToEnum, FeeFiltersEnum, FeeTypeEnum } from '@sellout/models/.dist/interfaces/IFee';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';

const tracer = new Tracer('FeeService');

export default class FeeService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }

  public static main() {
    const serviceName = pb.FeeService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new FeeService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new FeeStore(Fee),
    });
    service.run();
  }

  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }

  public register() {
    this.connectionMgr.subscribe(this.serviceName, "api", {
      /**
       * Incoming Message Handlers
       */
      createFee: new PbMessageHandler(
        this.createFee,
        pb.CreateFeeRequest,
        pb.CreateFeeResponse,
      ),
      createOrganizationFee: new PbMessageHandler(
        this.createOrganizationFee,
        pb.CreateFeeRequest,
        pb.CreateFeeResponse,
      ),
      createEventOrSeasonFee: new PbMessageHandler(
        this.createEventOrSeasonFee,
        pb.CreateFeeRequest,
        pb.CreateFeeResponse,
      ),
      createPlatformFee: new PbMessageHandler(
        this.createPlatformFee,
        pb.CreateFeeRequest,
        pb.CreateFeeResponse,
      ),
      updateFee: new PbMessageHandler(
        this.updateFee,
        pb.UpdateFeeRequest,
        pb.UpdateFeeResponse,
      ),
      updateFeeByEvent: new PbMessageHandler(
        this.updateFeeByEvent,
        pb.updateFeeByEventRequest,
        pb.updateFeeByEventResponse,
      ),
      updateOrganizationFee: new PbMessageHandler(
        this.updateOrganizationFee,
        pb.UpdateFeeRequest,
        pb.UpdateFeeResponse,
      ),
      updateEventOrSeasonFee: new PbMessageHandler(
        this.updateEventOrSeasonFee,
        pb.UpdateFeeRequest,
        pb.UpdateFeeResponse,
      ),
      updatePlatformFee: new PbMessageHandler(
        this.updatePlatformFee,
        pb.UpdateFeeRequest,
        pb.UpdateFeeResponse,
      ),
      disableFee: new PbMessageHandler(
        this.disableFee,
        pb.DisableFeeRequest,
        pb.DisableFeeResponse,
      ),
      deleteOrganizationFee: new PbMessageHandler(
        this.deleteOrganizationFee,
        pb.DeleteOrganizationFeeRequest,
        pb.DeleteOrganizationFeeResponse,
      ),
      deleteEventOrSeasonFee: new PbMessageHandler(
        this.deleteEventOrSeasonFee,
        pb.DeleteEventOrSeasonFeeRequest,
        pb.DeleteEventOrSeasonFeeResponse,
      ),
      deletePlatformFee: new PbMessageHandler(
        this.deletePlatformFee,
        pb.DeletePlatformFeeRequest,
        pb.DeletePlatformFeeResponse,
      ),
      listEventFees: new PbMessageHandler(
        this.listEventFees,
        pb.ListEventFeesRequest,
        pb.ListEventFeesResponse,
      ),
      listFeesById: new PbMessageHandler(
        this.listFeesById,
        pb.ListFeesByIdRequest,
        pb.ListFeesByIdResponse,
      ),
      listOrganizationFees: new PbMessageHandler(
        this.listOrganizationFees,
        pb.ListOrganizationFeesRequest,
        pb.ListOrganizationFeesResponse,
      ),
      listPlatformFees: new PbMessageHandler(
        this.listPlatformFees,
        pb.ListPlatformFeesRequest,
        pb.ListPlatformFeesResponse,
      ),
      queryFees: new PbMessageHandler(
        this.queryFees,
        pb.QueryFeesRequest,
        pb.QueryFeesResponse,
      ),
      findFeeById: new PbMessageHandler(
        this.findFeeById,
        pb.FindFeeByIdRequest,
        pb.FindFeeByIdResponse,
      ),
      applyPlatformFeesToAllOrganizations: new PbMessageHandler(
        this.applyPlatformFeesToAllOrganizations,
        pb.ApplyPlatformFeesToAllOrganizationsRequest,
        pb.ApplyPlatformFeesToAllOrganizationsResponse,
      ),

    });

    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      eventCreated: new PbAsyncMessageHandler(
        this.eventCreated,
        pb.Broadcast.EventCreatedNotification,
      ),
      seasonCreated: new PbAsyncMessageHandler(
        this.seasonCreated,
        pb.Broadcast.SeasonCreatedNotification
      ),
      organizationCreated: new PbAsyncMessageHandler(
        this.organizationCreated,
        pb.Broadcast.OrganizationCreatedNotification,
      )
    });
  }

  public createFee = async (request: pb.CreateFeeRequest): Promise<pb.CreateFeeResponse> => {
    const span = tracer.startSpan('createFee', request.spanContext);
    const response: pb.CreateFeeResponse = pb.CreateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        eventId: Joi.string().optional(),
        seasonId: Joi.string().optional(),
        type: Joi.string().required(),
        value: Joi.number().required(),
        appliedTo: Joi.string().optional().default(FeeAppliedToEnum.Ticket),
        appliedBy: Joi.string().optional().default(FeeAppliedByEnum.Organization),
        minAppliedToPrice: Joi.number().optional().default(0),
        maxAppliedToPrice: Joi.number().optional().default(0),
        filters: Joi.array().items(Joi.string()).default([]),
        paymentMethods: Joi.array().items(Joi.string()).default([]),
        isApplyPlatformFee: Joi.boolean().optional().default(false)
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    // const minAppliedToPrice = 0;
    // const maxAppliedToPrice = 0;
    // const filters = [];

    const {
      orgId,
      requestorId,
      fee: {
        name,
        eventId,
        seasonId,
        type,
        value,
        appliedTo,
        appliedBy,
        minAppliedToPrice,
        maxAppliedToPrice,
        filters,
        paymentMethods,
      }
    } = params.value;

    const now = Time.now();

    const attributes: IFee = {
      orgId,
      name,
      eventId,
      seasonId,
      type,
      value,
      appliedTo,
      minAppliedToPrice,
      maxAppliedToPrice,
      appliedBy,
      filters,
      paymentMethods,
      createdBy: requestorId,
      createdAt: now,
      updatedBy: requestorId,
      updatedAt: now,
      disabled: false,
      isApplyPlatformFee: false
    };

    let fee: IFee;

    try {
      fee = await this.storage.createFee(span, attributes);
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`createFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Fee creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public createOrganizationFee = async (request: pb.CreateFeeRequest): Promise<pb.CreateFeeResponse> => {
    const span = tracer.startSpan('createOrganizationFee', request.spanContext);
    const response: pb.CreateFeeResponse = pb.CreateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        type: Joi.string().required(),
        value: Joi.number().required(),
        appliedTo: Joi.string().required(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().items(Joi.string()).default([]),
        appliedBy: Joi.string().required(),
        paymentMethods: Joi.array().items(Joi.string()).default([]),
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createOrganizationFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const {
      orgId,
      requestorId,
      fee: {
        name,
        type,
        value,
        appliedTo,
        minAppliedToPrice,
        maxAppliedToPrice,
        filters,
        appliedBy,
        paymentMethods,
      }
    } = params.value;

    const now = Time.now();

    const attributes: IFee = {
      orgId,
      name,
      type,
      value,
      appliedTo,
      minAppliedToPrice,
      maxAppliedToPrice,
      appliedBy,
      filters,
      paymentMethods,
      createdBy: requestorId,
      createdAt: now,
      updatedBy: requestorId,
      updatedAt: now,
      disabled: false,
      isApplyPlatformFee: false

    };

    let fee: IFee;

    try {
      if (attributes.appliedBy === FeeAppliedByEnum.Sellout) {
        if (attributes.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (attributes.appliedTo === FeeAppliedToEnum.Ticket && attributes.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees only applied to order."
          );
        }
      }
      fee = await this.storage.createFee(span, attributes);
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      console.log(e);
      this.logger.error(`createOrganizationFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          // message: 'Fee creation was unsuccessful. Please contact support.',
          message: e.message
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public createEventOrSeasonFee = async (request: pb.CreateFeeRequest): Promise<pb.CreateFeeResponse> => {
    const span = tracer.startSpan('createEventOrSeasonFee', request.spanContext);
    const response: pb.CreateFeeResponse = pb.CreateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().allow(null).optional(),
      eventId: Joi.string().optional().allow(null).allow(''),
      seasonId: Joi.string().optional().allow(null).allow(''),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        type: Joi.string().required(),
        value: Joi.number().required(),
        appliedTo: Joi.string().required(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().items(Joi.string()).default([]),
        appliedBy: Joi.string().required(),
        paymentMethods: Joi.array().optional().items(Joi.string()).default([]),
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createEventOrSeasonFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }



    const {
      orgId,
      eventId,
      seasonId,
      requestorId,
      fee: {
        name,
        type,
        value,
        appliedTo,
        minAppliedToPrice,
        maxAppliedToPrice,
        filters,
        appliedBy,
        paymentMethods,
      }
    } = params.value;

    const now = Time.now();

    const attributes: IFee = {
      orgId,
      eventId,
      seasonId,
      name,
      type,
      value,
      appliedTo,
      minAppliedToPrice,
      maxAppliedToPrice,
      appliedBy,
      filters,
      paymentMethods,
      createdBy: requestorId,
      createdAt: now,
      updatedBy: requestorId,
      updatedAt: now,
      disabled: false,
      isApplyPlatformFee: false

    };
    let fee: IFee;
    try {
      if (attributes.appliedBy === FeeAppliedByEnum.Sellout) {
        if (attributes.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (attributes.appliedTo === FeeAppliedToEnum.Ticket && attributes.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees only applied to order."
          );

        }
      }
      fee = await this.storage.createFee(span, attributes);
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      console.log(e);
      this.logger.error(`createEventOrSeasonFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public createPlatformFee = async (request: pb.CreateFeeRequest): Promise<pb.CreateFeeResponse> => {
    const span = tracer.startSpan('createPlatformFee', request.spanContext);
    const response: pb.CreateFeeResponse = pb.CreateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        type: Joi.string().required(),
        value: Joi.number().required(),
        appliedTo: Joi.string().required(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().items(Joi.string()).default([]),
        paymentMethods: Joi.array().optional().items(Joi.string()).default([]),
        appliedBy: Joi.string().default(FeeAppliedByEnum.Sellout),
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createPlatformFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const {
      requestorId,
      fee: {
        name,
        type,
        value,
        appliedTo,
        minAppliedToPrice,
        maxAppliedToPrice,
        filters,
        paymentMethods,
        appliedBy,
      }
    } = params.value;

    const now = Time.now();

    const attributes: IFee = {
      name,
      type,
      value,
      appliedTo,
      minAppliedToPrice,
      maxAppliedToPrice,
      appliedBy,
      filters,
      paymentMethods,
      createdBy: requestorId,
      createdAt: now,
      updatedBy: requestorId,
      updatedAt: now,
      disabled: false,
      isApplyPlatformFee: false
    };

    let fee: IFee;

    try {
      if (attributes.appliedBy === FeeAppliedByEnum.Sellout) {
        if (attributes.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (attributes.appliedTo === FeeAppliedToEnum.Ticket && attributes.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees only applied to order."
          );
        }
      }
      fee = await this.storage.createFee(span, attributes);
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      console.log(e);
      this.logger.error(`createPlatformFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          // message: 'Platform fee creation was unsuccessful. Please contact support.',
          message: e.message
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public updateFee = async (request: pb.UpdateFeeRequest): Promise<pb.UpdateFeeResponse> => {
    const span = tracer.startSpan('updateFee', request.spanContext);
    const response: pb.UpdateFeeResponse = pb.UpdateFeeResponse.create();


    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().required(),
        eventId: Joi.string().optional(),
        seasonId: Joi.string().optional(),
        type: Joi.string().required(),
        value: Joi.number().required(),
        appliedTo: Joi.string().optional(),
        appliedBy: Joi.string().optional(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().items(Joi.string()).optional(),
        paymentMethods: Joi.array().items(Joi.string()).optional(),
      }),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { orgId, requestorId, fee } = params.value;
    fee.updatedAt = Time.now();
    fee.updatedBy = requestorId;

    // delete fee.appliedTo;
    delete fee.appliedBy;
    delete fee.minAppliedToPrice;
    delete fee.maxAppliedToPrice;
    delete fee.filters;
    delete fee.paymentMethods;

    try {
      fee = await this.storage.updateFee(span, orgId, fee);
      if (!fee || !fee._id) {
        throw new Error('The fee could not updated.');
      }
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`updateFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public updateFeeByEvent = async (request: pb.updateFeeByEventRequest): Promise<pb.updateFeeByEventResponse> => {
    const span = tracer.startSpan('updateFeeByEvent', request.spanContext);
    const response: pb.updateFeeByEventResponse = pb.updateFeeByEventResponse.create();


    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional(),
      seasonId: Joi.string().optional(),
      name: Joi.string().optional(),
      value: Joi.number().optional(),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`updateFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { eventId, seasonId, name, value } = params.value;

    try {
      let fee = await this.storage.updateFeeByEvent(span, eventId, seasonId, name, value);
      if (!fee || !fee._id) {
        throw new Error('The fee could not updated.');
      }
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`updateFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  public updateOrganizationFee = async (request: pb.UpdateFeeRequest): Promise<pb.UpdateFeeResponse> => {
    const span = tracer.startSpan('updateOrganizationFee', request.spanContext);
    const response: pb.UpdateFeeResponse = pb.UpdateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().optional(),
        type: Joi.string().optional(),
        value: Joi.number().optional(),
        appliedTo: Joi.string().optional(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().optional().items(Joi.string()).default([]),
        appliedBy: Joi.string().optional(),
        // paymentMethods: Joi.array().items(Joi.string()).optional(),
        paymentMethods: Joi.array().optional().items(Joi.string()).default([])
      })
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateOrganizationFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { orgId, requestorId, fee } = params.value;
    fee.updatedAt = Time.now();
    fee.updatedBy = requestorId;

    try {
      if (fee.appliedBy === FeeAppliedByEnum.Sellout) {
        if (fee.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (fee.appliedTo === FeeAppliedToEnum.Ticket && fee.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees are only applied to the order."
          );
        }
      }
      fee = await this.storage.updateFee(span, orgId, fee);
      if (!fee || !fee._id) {
        throw new Error('The organization fee could not be updated.');
      }
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`updateFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public updateEventOrSeasonFee = async (request: pb.UpdateFeeRequest): Promise<pb.UpdateFeeResponse> => {
    const span = tracer.startSpan('updateEventOrSeasonFee', request.spanContext);
    const response: pb.UpdateFeeResponse = pb.UpdateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional().allow(null).allow(''),
      eventId: Joi.string().optional().allow(null).allow(''),
      seasonId: Joi.string().optional().allow(null).allow(''),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().optional(),
        type: Joi.string().optional(),
        value: Joi.number().optional(),
        appliedTo: Joi.string().optional(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().optional().items(Joi.string()).default([]),
        appliedBy: Joi.string().optional(),
        // paymentMethods: Joi.array().items(Joi.string()).optional(),
        paymentMethods: Joi.array().optional().items(Joi.string()).default([]),
      })
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateEventOrSeasonFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { eventId, seasonId, requestorId, fee } = params.value;
    fee.updatedAt = Time.now();
    fee.updatedBy = requestorId;

    try {
      if (fee.appliedBy === FeeAppliedByEnum.Sellout) {
        if (fee.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (fee.appliedTo === FeeAppliedToEnum.Ticket && fee.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees are only applied to the order."
          );
        }
      }
      fee = await this.storage.updateEventOrSeasonFee(span, eventId, seasonId, fee);
      if (!fee || !fee._id) {
        throw new Error('The fee could not be updated.');
      }
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`updateEventOrSeasonFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public updatePlatformFee = async (request: pb.UpdateFeeRequest): Promise<pb.UpdateFeeResponse> => {
    const span = tracer.startSpan('updatePlatformFee', request.spanContext);
    const response: pb.UpdateFeeResponse = pb.UpdateFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string(),
      requestorId: Joi.string().required(),
      fee: Joi.object().keys({
        _id: Joi.string().required(),
        name: Joi.string().optional(),
        type: Joi.string().optional(),
        value: Joi.number().optional(),
        appliedTo: Joi.string().optional(),
        minAppliedToPrice: Joi.number().optional(),
        maxAppliedToPrice: Joi.number().optional(),
        filters: Joi.array().optional().items(Joi.string()).default([]),
        appliedBy: Joi.string().optional(),
        // paymentMethods: Joi.array().items(Joi.string()).optional(),
        paymentMethods: Joi.array().optional().items(Joi.string()).default([])
      })
    });

    const params = schema.validate(request);

    if (params.error) {
      console.log(params.error);
      this.logger.error(`updatePlatformFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let { requestorId, fee } = params.value;
    fee.updatedAt = Time.now();
    fee.updatedBy = requestorId;

    try {
      if (fee.appliedBy === FeeAppliedByEnum.Sellout) {
        if (fee.filters?.includes(FeeFiltersEnum.GuestTicket)) {
          throw new Error(
            "Guest ticket fees always applied to organization."
          );
        }
        if (fee.appliedTo === FeeAppliedToEnum.Ticket && fee.type === FeeTypeEnum.Percent) {
          throw new Error(
            "Sellout percentage fees are only applied to the order."
          );
        }
      }
      fee = await this.storage.updateFee(span, null, fee);
      if (!fee || !fee._id) {
        throw new Error('The platform fee could not be updated.');
      }
      response.fee = pb.Fee.fromObject(fee);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`updatePlatformFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public disableFee = async (request: pb.DisableFeeRequest): Promise<pb.DisableFeeResponse> => {
    const span = tracer.startSpan('disableFee', request.spanContext);
    const response: pb.DisableFeeResponse = pb.DisableFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      requestorId: Joi.string().required(),
      feeId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`disableFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, requestorId, feeId } = params.value;


    let fee: IFee;

    try {
      fee = await this.storage.disableFee(span, orgId, requestorId, feeId);
      response.status = pb.StatusCode.OK;
      response.fee = pb.Fee.fromObject(fee);
    } catch (e) {
      this.logger.error(`disableFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: `Failed to disable fee. Please contact support.`,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public deleteOrganizationFee = async (request: pb.DeleteOrganizationFeeRequest): Promise<pb.DeleteOrganizationFeeResponse> => {
    const span = tracer.startSpan('deleteOrganizationFee', request.spanContext);
    const response: pb.DeleteOrganizationFeeResponse = pb.DeleteOrganizationFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      feeId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deleteOrganizationFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, feeId } = params.value;


    let deleted: Boolean;

    try {
      deleted = await this.storage.deleteOrganizationFee(span, orgId, feeId);

      if (!deleted) {
        throw new Error('Delete organization fee failed at DB level. Please contact Sam.')
      }

      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`deleteOrganizationFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: `Failed to delete organization fee. Please contact support)`,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public deleteEventOrSeasonFee = async (request: pb.DeleteEventOrSeasonFeeRequest): Promise<pb.DeleteOrganizationFeeResponse> => {
    const span = tracer.startSpan('deleteEventOrSeasonFee', request.spanContext);
    const response: pb.DeleteOrganizationFeeResponse = pb.DeleteOrganizationFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      eventId: Joi.string().optional().allow(null).allow(''),
      seasonId: Joi.string().optional().allow(null).allow(''),
      feeId: Joi.string().required(),
      orgId: Joi.string().optional(),
      requestorId: Joi.string().optional()
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deleteEventOrSeasonFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { eventId, seasonId, feeId, orgId, requestorId, spanContext } = params.value;
    let deleted: Boolean;
    try {

      const request = new pb.FindOrderByFeeIdRequest.create({
        spanContext: spanContext,
        feeId: feeId
      });
      let order = await this.proxy.orderService.findOrderByFeeId(request);

      if (order?.order?._id) {
        deleted = await this.storage.disableFee(span, orgId, requestorId, feeId);
      } else {
        deleted = await this.storage.deleteEventOrSeasonFee(span, eventId, seasonId, feeId);
      }

      if (!deleted) {
        throw new Error('Delete fee failed at DB level. Please contact Sam.')
      }

      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`deleteEventOrSeasonFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: `Failed to delete organization fee. Please contact support)`,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public deletePlatformFee = async (request: pb.DeletePlatformFeeRequest): Promise<pb.DeletePlatformFeeResponse> => {
    const span = tracer.startSpan('deletePlatformFee', request.spanContext);
    const response: pb.DeletePlatformFeeResponse = pb.DeletePlatformFeeResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      feeId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`deletePlatformFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { feeId } = params.value;


    let deleted: Boolean;

    try {
      deleted = await this.storage.deletePlatformFee(span, feeId);

      if (!deleted) {
        throw new Error('Delete platform fee failed at DB level. Please contact Sam.')
      }

      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`deletePlatformFee - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: `Failed to delete platform fee. Please contact Sam :)`,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public listFeesById = async (request: pb.ListFeesByIdRequest): Promise<pb.ListFeesByIdResponse> => {
    const span = tracer.startSpan('listFeesById', request.spanContext);
    const response: pb.ListFeesByIdResponse = pb.ListFeesByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      feeIds: Joi.array().items(Joi.string()),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(`listFeesById - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, feeIds } = params.value;


    if (!feeIds || !feeIds.length) {
      response.status = pb.StatusCode.OK;
      response.fees = [];
      return response;
    }

    let fees: IFee[];

    try {
      fees = await this.storage.listFeesById(span, orgId, feeIds);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`listFeesById - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public listEventFees = async (request: pb.ListEventFeesRequest): Promise<pb.ListEventFeesResponse> => {
    const span = tracer.startSpan('listEventFees', request.spanContext);
    const response: pb.ListEventFeesResponse = pb.ListEventFeesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      eventId: Joi.string().optional(),
      seasonId: Joi.string().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`listEventFees - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, seasonId } = params.value;
    let fees: IFee[];
    try {
      fees = await this.storage.listEventFees(span, orgId, eventId, seasonId);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`listEventFees - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public listOrganizationFees = async (request: pb.ListOrganizationFeesRequest): Promise<pb.ListOrganizationFeesResponse> => {
    const span = tracer.startSpan('listOrganizationFees', request.spanContext);
    const response: pb.ListOrganizationFeesResponse = pb.ListOrganizationFeesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`listOrganizationFees - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value;


    let fees: IFee[];

    try {
      fees = await this.storage.listOrganizationFees(span, orgId);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`listOrganizationFees - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public listPlatformFees = async (request: pb.ListPlatformFeesRequest): Promise<pb.ListPlatformFeesResponse> => {
    const span = tracer.startSpan("listPlatformFees", request.spanContext);
    const response: pb.ListPlatformFeesResponse = pb.ListPlatformFeesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`listPlatformFees - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    let fees: IFee[];

    try {
      fees = await this.storage.listPlatformFees(span);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`listPlatformFees - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public queryFees = async (request: pb.QueryFeesRequest): Promise<pb.QueryFeesResponse> => {
    const span = tracer.startSpan('queryFees', request.spanContext);
    const response: pb.QueryFeesResponse = pb.QueryFeesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryFees - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let { query, pagination } = params.value;


    query = Query.fromPb(query);

    let fees: IFee[];

    try {
      fees = await this.storage.queryFees(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`queryFees - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }


  public processingFee = async (request: pb.QueryFeesRequest): Promise<pb.QueryFeesResponse> => {
    const span = tracer.startSpan('processingFee', request.spanContext);
    const response: pb.QueryFeesResponse = pb.QueryFeesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`processingFee - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let { query, pagination } = params.value;


    query = Query.fromPb(query);

    let fees: IFee[];

    try {
      fees = await this.storage.queryFees(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.fees = fees.map(fee => pb.Fee.fromObject(fee));
    } catch (e) {
      this.logger.error(`queryFees - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }

  public findFeeById = async (request: pb.FindFeeByIdRequest): Promise<pb.FindFeeByIdResponse> => {
    const span = tracer.startSpan('findFeeById', request.spanContext);
    const response: pb.FindFeeByIdResponse = pb.FindFeeByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      feeId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findFeeById - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { feeId } = params.value;


    let fee: IFee;
    try {
      fee = await this.storage.findFeeById(span, feeId);
      response.status = pb.StatusCode.OK;
      response.fee = fee ? pb.Fee.fromObject(fee) : null;
    } catch (e) {
      this.logger.error(`findFeeById - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public eventCreated = async (request: pb.Broadcast.EventCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('eventCreated', request.spanContext);
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().optional(),
      seasonId: Joi.string().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`eventCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId, seasonId } = params.value;


    let organizationFees: IFee[];
    try {
      organizationFees = await this.storage.listOrganizationFees(span, orgId);
      if (!organizationFees || !organizationFees.length) {
        throw new Error('Could not find platform fees.');
      }
    } catch (e) {
      this.logger.error(
        `eventCreated - error: ${JSON.stringify(e.message)}`,
      );
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    organizationFees.forEach(async fee => {
      try {
        const createFee = pb.CreateFeeRequest.create({
          spanContext: span.context().toString(),
          orgId,
          requestorId: fee.createdBy,
          fee: {
            _id: fee._id,
            name: fee.name,
            eventId,
            seasonId,
            type: fee.type,
            value: fee.value,
            appliedTo: fee.appliedTo,
            minAppliedToPrice: fee.minAppliedToPrice,
            maxAppliedToPrice: fee.maxAppliedToPrice,
            appliedBy: fee.appliedBy,
            filters: fee.filters,
            paymentMethods: fee.paymentMethods,
          }
        });
        await this.createFee(createFee);
      } catch (e) {
        this.logger.error(
          `eventCreated - error: ${JSON.stringify(e.message)}`,
        );
        span.setTag('error', true);
        span.log({ errors: e.message });
        return;
      }
    });

    span.finish();
    return;
  }


  public seasonCreated = async (request: pb.Broadcast.SeasonCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('seasonCreated', request.spanContext);
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().optional(),
      seasonId: Joi.string().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`seasonCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId, seasonId } = params.value;


    let organizationFees: IFee[];
    try {
      organizationFees = await this.storage.listOrganizationFees(span, orgId);


      if (!organizationFees || !organizationFees.length) {
        throw new Error('Could not find platform fees.');
      }
    } catch (e) {
      this.logger.error(
        `seasonCreated - error: ${JSON.stringify(e.message)}`,
      );
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    organizationFees.forEach(async fee => {
      try {
        const createFee = pb.CreateFeeRequest.create({
          spanContext: span.context().toString(),
          orgId,
          requestorId: fee.createdBy,
          fee: {
            _id: fee._id,
            name: fee.name,
            eventId,
            seasonId,
            type: fee.type,
            value: fee.value,
            appliedTo: fee.appliedTo,
            minAppliedToPrice: fee.minAppliedToPrice,
            maxAppliedToPrice: fee.maxAppliedToPrice,
            appliedBy: fee.appliedBy,
            filters: fee.filters,
            paymentMethods: fee.paymentMethods,
          }
        });
        await this.createFee(createFee);
      } catch (e) {
        this.logger.error(
          `seasonCreated - error: ${JSON.stringify(e.message)}`,
        );
        span.setTag('error', true);
        span.log({ errors: e.message });
        return;
      }
    });

    span.finish();
    return;
  }

  public organizationCreated = async (request: pb.Broadcast.OrganizationCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('organizationCreated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`organizationCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId } = params.value;


    let platformFees: IFee[];
    try {
      platformFees = await this.storage.listPlatformFees(span);

      if (!platformFees || !platformFees.length) {
        throw new Error('Could not find platform fees.');
      }

    } catch (e) {
      this.logger.error(
        `organizationCreated - error: ${JSON.stringify(e.message)}`,
      );
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    platformFees.forEach(async fee => {
      try {
        const createFee = pb.CreateFeeRequest.create({
          spanContext: span.context().toString(),
          orgId,
          requestorId: fee.createdBy,
          fee: {
            _id: fee._id,
            name: fee.name,
            type: fee.type,
            value: fee.value,
            appliedTo: fee.appliedTo,
            minAppliedToPrice: fee.minAppliedToPrice,
            maxAppliedToPrice: fee.maxAppliedToPrice,
            appliedBy: fee.appliedBy,
            paymentMethods: fee.paymentMethods,
          }
        });
        await this.createOrganizationFee(createFee);
      } catch (e) {
        this.logger.error(
          `organizationCreated - error: ${JSON.stringify(e.message)}`,
        );
        span.setTag('error', true);
        span.log({ errors: e.message });
        return;
      }
    });

    span.finish();
    return;
  }

  public applyPlatformFeesToAllOrganizations = async (request: pb.ApplyPlatformFeesToAllOrganizationsRequest): Promise<pb.ApplyPlatformFeesToAllOrganizationsResponse> => {
    const span = tracer.startSpan('applyPlatformFeesToAllOrganizations', request.spanContext);
    const response: pb.ApplyPlatformFeesToAllOrganizationsResponse = pb.ApplyPlatformFeesToAllOrganizationsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`applyPlatformFeesToAllOrganizations - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      response.success = false;
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response
    }

    let platformFees: IFee[];
    try {
      platformFees = await this.storage.listPlatformFees(span);

      if (!platformFees || !platformFees.length) {
        throw new Error('Could not find platform fees.');
      }

      await this.storage.updateMany(span);

    } catch (e) {
      this.logger.error(`applyPlatformFeesToAllOrganizations - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      response.success = false;
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const queryOrgsRequest = new pb.QueryOrganizationsRequest.create({
      spanContext: span.context().toString(),
      query: {},
      pagination: null,
    });

    let queryOrgsResponse: pb.QueryOrganizationsResponse;
    try {
      queryOrgsResponse = await this.proxy.organizationService.queryOrganizations(queryOrgsRequest);
    } catch (e) {
      this.logger.error(`applyPlatformFeesToAllOrganizations - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      response.success = false;
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { organizations } = queryOrgsResponse;

    organizations.forEach(async (org) => {
      await this.storage.deleteAllOrganizationFees(span, org._id);

      platformFees.forEach(async fee => {
        try {
          const createFee = pb.CreateFeeRequest.create({
            spanContext: span.context().toString(),
            orgId: org._id.toString(),
            requestorId: fee.createdBy,
            fee: {
              _id: fee._id,
              name: fee.name,
              type: fee.type,
              value: fee.value,
              appliedTo: fee.appliedTo,
              minAppliedToPrice: fee.minAppliedToPrice,
              maxAppliedToPrice: fee.maxAppliedToPrice,
              appliedBy: fee.appliedBy,
              filters: fee.filters,
              paymentMethods: fee.paymentMethods,
            }
          });
          await this.createOrganizationFee(createFee);
        } catch (e) {
          this.logger.error(`applyPlatformFeesToAllOrganizations - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [pb.Error.create({
            key: 'Error',
            message: e.message,
          })];
          span.setTag('error', true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      });
    });

    response.status = pb.StatusCode.OK;
    response.success = true;

    span.finish();
    return response;
  }

}
