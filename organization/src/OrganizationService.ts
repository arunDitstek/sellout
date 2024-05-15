import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import Joi from '@hapi/joi';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import { Organization } from './Organization';
import OrganizationStore from './OrganizationStore';
import IOrganization from '@sellout/models/.dist/interfaces/IOrganization';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';

const tracer = new Tracer('OrganizationService');

export default class OrganizationService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.OrganizationService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new OrganizationService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new OrganizationStore(Organization),
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
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      /**
       * Incoming Message Handlers
       */
      createOrganization: new PbMessageHandler(
        this.createOrganization,
        pb.CreateOrganizationRequest,
        pb.CreateOrganizationResponse,
      ),
      queryOrganizations: new PbMessageHandler(
        this.queryOrganizations,
        pb.QueryOrganizationsRequest,
        pb.QueryOrganizationsResponse,
      ),
      listOrganizationUrls: new PbMessageHandler(
        this.listOrganizationUrls,
        pb.ListOrganizationUrlsRequest,
        pb.ListOrganizationUrlsResponse,
      ),
      updateOrganization: new PbMessageHandler(
        this.updateOrganization,
        pb.UpdateOrganizationRequest,
        pb.UpdateOrganizationResponse,
      ),
      findOrganization: new PbMessageHandler(
        this.findOrganization,
        pb.FindOrganizationRequest,
        pb.FindOrganizationResponse,
      ),
    });
  }
  private toPb = (organization: IOrganization): IOrganization => {
    if (!organization) {
      return new pb.Organization;
    }

    return Object.assign(new pb.Organization(), {
      _id: organization._id.toString(),
      userId: organization.userId,
      createdAt: organization.createdAt,
      authyId: organization.authyId,
      stripeId: organization.stripeId,
      orgName: organization.orgName,
      orgUrls: organization.orgUrls,
      orgLogoUrl: organization.orgLogoUrl,
      orgColorHex: organization.orgColorHex,
      bio: organization.bio,
      email: organization.email,
      phoneNumber: organization.phoneNumber,
      facebookPixelId: organization.facebookPixelId,
      googleAnalyticsId: organization.googleAnalyticsId,
      isSeasonTickets: organization.isSeasonTickets,
      isTegIntegration: organization.isTegIntegration,
      validateMemberId: organization.validateMemberId,
      tegClientID: organization.tegClientID,
      tegSecret: organization.tegSecret,
      tegURL: organization.tegURL,
      ticketFormat: organization?.ticketFormat,
      address: Object.assign(new pb.Address(), {
        address1: organization.address.address1,
        address2: organization.address.address2,
        city: organization.address.city,
        state: organization.address.state,
        zip: organization.address.zip,
        country: organization.address.country,
        phone: organization.address.phone,
        placeName: organization.address.placeName
      }),
      locationId: organization.locationId,
    });

  }
  public createOrganization = async (request: pb.CreateOrganizationRequest): Promise<pb.CreateOrganizationResponse> => {
    const span = tracer.startSpan('createOrganization', request.spanContext);
    const response: pb.CreateOrganizationResponse = pb.CreateOrganizationResponse.create();
    const params = Joi.string().required().validate(request.userId);

    if (params.error) {
      this.logger.error(`createOrganization - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const userId = params.value;

    // get the org creator's phone number and email to set as the default for the organization
    const findUserRequest = pb.FindUserByIdRequest.create({
      spanContext: span.context().toString(),
      userId,
    });

    console.log('FUCK');

    let userEmail: string = '';
    let userPhoneNumber: string = '';;
    try {
      const res = await this.proxy.userService.findUserById(findUserRequest);
      if (!res || !res.user) {
        throw new Error('There was an error, please contact support');
      }
      userEmail = res.user.email;
      userPhoneNumber = res.user.phoneNumber;
    } catch (e) {
      this.logger.error(`createOrganization - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Organization creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return
      response;
    }

    console.log(userEmail);
    console.log(userPhoneNumber);
    console.log('FUCK 2');


    // create the organzation in Mongo
    const attributes: IOrganization = {
      userId,
      createdAt: Time.now(),
      email: userEmail,
      phoneNumber: userPhoneNumber,
    };
    let organization: IOrganization;
    try {
      organization = await this.storage.createOrganization(span, attributes);
      response.status = pb.StatusCode.OK;
      response.organization = this.toPb(organization);
    } catch (e) {
      this.logger.error(`createOrganization - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Organization creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      return response;
    }

    console.log('FUCK 3');

    const createRoleRequest = pb.CreateRoleRequest.create({
      spanContext: span.context().toString(),
      creatorId: userId,
      role: {
        orgId: organization._id.toString(),
        userId,
        role: 'OWNER',
      },
    });

    try {
      await this.proxy.roleService.createRole(createRoleRequest);
    } catch (e) {
      this.logger.error(`createOrganization - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Organization creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      return response;
    }

    const orgCreatedNotification = pb.Broadcast.OrganizationCreatedNotification.create({
      spanContext: span.context().toString(),
      orgId: organization._id.toString(),
    });

    try {
      await this.proxy.broadcast.organizationCreated(orgCreatedNotification);
    } catch (e) {
      this.logger.error(`createOrganization - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    return response;
  }

  public queryOrganizations = async (request: pb.QueryOrganizationsRequest): Promise<pb.QueryOrganizationsResponse> => {
    const span = tracer.startSpan('queryOrganizations', request.spanContext);
    const response: pb.QueryOrganizationsResponse = pb.QueryOrganizationsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryOrganizations - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { query, pagination } = params.value;


    let organizations: IOrganization[];

    try {
      organizations = await this.storage.queryOrganizations(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.organizations = organizations.map(event => (pb.Organization.fromObject(event)));
    } catch (e) {
      this.logger.error(`queryOrganizations - error: ${e.message}`);
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

  public listOrganizationUrls = async (request: pb.ListOrganizationUrlsRequest): Promise<pb.ListOrganizationUrlsResponse> => {
    const span = tracer.startSpan('listOrganizationUrls', request.spanContext);
    const response: pb.ListOrganizationUrlsResponse = pb.ListOrganizationUrlsResponse.create();

    let organizations: IOrganization[];
    let orgUrlList = [];
    try {
      organizations = await this.storage.listOrganizationUrls(span);
      response.status = pb.StatusCode.OK;
      for (let i = 0; i < organizations.length; i++) {
        orgUrlList = orgUrlList.concat(organizations[i].orgUrls);
      }
      response.orgUrls = orgUrlList;
    } catch (e) {
      this.logger.error(`listOrganizationUrls - error: ${e.message}`);
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
  public updateOrganization = async (request: pb.UpdateOrganizationRequest): Promise<pb.UpdateOrganizationResponse> => {
    const span = tracer.startSpan('updateOrganization', request.spanContext);
    const response: pb.UpdateOrganizationResponse = pb.UpdateOrganizationResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      organization: {
        authyId: Joi.any(),
        stripeId: Joi.any(),
        orgName: Joi.any(),
        orgUrls: Joi.any(),
        phone: Joi.any(),
        orgLogoUrl: Joi.any(),
        orgColorHex: Joi.any(),
        address: Joi.any(),
        bio: Joi.any(),
        email: Joi.any(),
        phoneNumber: Joi.any(),
        facebookPixelId: Joi.any(),
        googleAnalyticsId: Joi.any(),
        isSeasonTickets: Joi.any(),
        isTegIntegration: Joi.any(),
        tegClientID: Joi.any(),
        tegSecret: Joi.any(),
        validateMemberId: Joi.any(),
        tegURL: Joi.any(),
        ticketFormat: Joi.any(),
        locationId: Joi.any()
      }
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateOrganization - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value;

    let updatedOrganization: IOrganization;

    try {
      updatedOrganization = await this.storage.updateOneOrganization(span, orgId, request.organization);
      response.status = pb.StatusCode.OK;
      response.organization = this.toPb(updatedOrganization);
    } catch (e) {
      this.logger.error(`updateOrganization - error: ${e.message}`);
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
  public findOrganization = async (request: pb.FindOrganizationRequest): Promise<pb.FindOrganizationResponse> => {
    const span = tracer.startSpan('findOrganization', request.spanContext);
    const response: pb.FindOrganizationResponse = pb.FindOrganizationResponse.create();

    let organization: IOrganization;
    try {
      organization = await this.storage.findOrganization(span, request.orgId);
      response.status = pb.StatusCode.OK;
      response.organization = this.toPb(organization);
    } catch (e) {
      this.logger.error(`findOrganization - error: ${e.message}`);
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
}
