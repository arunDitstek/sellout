import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import * as Price from '@sellout/utils/.dist/price';
import * as CSV from '@sellout/utils/.dist/CSV';
import Joi from '@hapi/joi';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import { UserProfile } from './UserProfile';
import UserProfileStore from './UserProfileStore';
import IUserProfile from '@sellout/models/.dist/interfaces/IUserProfile';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';
// import { AnalyticsTypeEnum } from '@sellout/models/.dist/interfaces/IAnalytics';
// import AnalyticsUtil from '@sellout/models/.dist/utils/AnalyticsUtil';
// import { UserAnalyticsSegmentsIndexEnum } from '@sellout/models/.dist/interfaces/IAnalytics';
const tracer = new Tracer('UserProfileService');

export default class UserProfileService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.UserProfileService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new UserProfileService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new UserProfileStore(UserProfile),
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
      createUserProfile: new PbMessageHandler(
        this.createProfile,
        pb.CreateUserProfileRequest,
        pb.CreateUserProfileResponse,
      ),
      updateUserProfile: new PbMessageHandler(
        this.updateProfile,
        pb.UpdateUserProfileRequest,
        pb.UpdateUserProfileResponse,
      ),
      findUserProfile: new PbMessageHandler(
        this.findProfile,
        pb.FindUserProfileRequest,
        pb.FindUserProfileResponse,
      ),
      generateUserProfileReport: new PbMessageHandler(
        this.generateProfileReport,
        pb.GenerateUserProfileReportRequest,
        pb.GenerateUserProfileReportResponse,
      ),
      emailTotalEUserReport: new PbMessageHandler(
        this.emailTotalEUserReport,
        pb.GenerateUserProfileReportRequest,
        pb.GenerateUserProfileReportResponse,
      ),
      queryUserProfiles: new PbMessageHandler(
        this.queryProfiles,
        pb.QueryUserProfilesRequest,
        pb.QueryUserProfilesResponse,
      ),
      deleteUnverifiedUserProfile: new PbMessageHandler(
        this.deleteUnverifiedUserProfile,
        pb.DeleteUnverifiedUserProfileRequest,
        pb.DeleteUnverifiedUserProfileResponse,
      ),
    });

    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      orderCreated: new PbAsyncMessageHandler(
        this.orderCreated,
        pb.Broadcast.OrderCreatedNotification,
      ),
    });
  }

  public createProfile = async (request: pb.CreateUserProfileRequest): Promise<pb.CreateUserProfileResponse> => {
    const span = tracer.startSpan('createProfile', request.spanContext);
    const response: pb.CreateUserProfileResponse = pb.CreateUserProfileResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
      firstName: Joi.string().optional().allow(null).allow(''),
      lastName: Joi.string().optional().allow(null).allow(''),
      email: Joi.string().optional().allow(null).allow(''),
      phoneNumber: Joi.string().optional().allow(null).allow(''),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createProfile - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, firstName, lastName, email, phoneNumber } = params.value;

    const attributes: IUserProfile = {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
    };

    let profile: IUserProfile;
    try {
      profile = await this.storage.createProfile(span, attributes);
      response.status = pb.StatusCode.OK;
      response.userProfile = pb.UserProfile.fromObject(profile);
    } catch (e) {
      this.logger.error(`createProfile - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'User profile creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      return response;
    }

    span.finish();
    return response;
  }

  public updateProfile = async (request: pb.UpdateUserProfileRequest): Promise<pb.UpdateUserProfileResponse> => {
    const span = tracer.startSpan('updateProfile', request.spanContext);
    const response: pb.UpdateUserProfileResponse = pb.UpdateUserProfileResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
      userProfile: {
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
        phoneNumber: Joi.string(),
        authyId: Joi.string(),
        stripeCustomerId: Joi.string(),
        imageUrl: Joi.string(),
        address: Joi.string(),
      },
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateProfile - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId } = params.value;

    let updatedProfile: IUserProfile;

    try {
      updatedProfile = await this.storage.updateOneProfile(span, userId, request.userProfile);
      response.status = pb.StatusCode.OK;
      response.userProfile = pb.UserProfile.fromObject(updatedProfile);
    } catch (e) {
      this.logger.error(`updateProfile - error: ${e.message}`);
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

  public findProfile = async (request: pb.FindUserProfileRequest): Promise<pb.FindUserProfileResponse> => {
    const span = tracer.startSpan('findProfile', request.spanContext);
    const response: pb.FindUserProfileResponse = pb.FindUserProfileResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      userId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findProfile - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId } = params.value;

    let profile: IUserProfile;
    try {
      profile = await this.storage.findProfile(span, userId);
      response.status = pb.StatusCode.OK;
      response.userProfile = pb.UserProfile.fromObject(profile);
    } catch (e) {
      this.logger.error(`findProfile - error: ${e.message}`);
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

  // public generateProfileReport = async (request: pb.GenerateUserProfileReportRequest): Promise<pb.GenerateUserProfileReportResponse> => {
  //   const span = tracer.startSpan('generateProfileReport', request.spanContext);
  //   const response: pb.GenerateUserProfileReportResponse = pb.GenerateUserProfileReportResponse.create();

  //   const schema = Joi.object().keys({
  //     spanContext: Joi.string().required(),
  //     orgId: Joi.string().required(),
  //     query: Joi.any().optional(),
  //   });

  //   const params = schema.validate(request);

  //   if (params.error) {
  //     this.logger.error(`generateProfileReport - error: ${JSON.stringify(params.error)}`);
  //     response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
  //     response.errors = joiToErrors(params.error, pb.Error);
  //     span.setTag('error', true);
  //     span.log({ errors: params.error });
  //     span.finish();
  //     return response;
  //   }
  //   const { orgId, query } = params.value;

  //   query.orgId = orgId;

  //   let profiles: IUserProfile[];

  //   try {
  //     profiles = await this.storage.queryProfiles(span, query, null);
  //   } catch (e) {
  //     this.logger.error(`generateProfileReport - error: ${e.message}`);
  //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //     response.errors = [pb.Error.create({
  //       key: 'Error',
  //       message: e.message,
  //     })];
  //     span.setTag('error', true);
  //     span.log({ errors: e.message });
  //     span.finish();
  //     return response;
  //   }

  //   const transformed: any[] = await Promise.all(profiles.map(async (profile: IUserProfile): Promise<any> => {

  //     let tempRequest = new pb.QueryOrderAnalyticsRequest.create({
  //       spanContext: span.context().toString(),
  //       orgId,
  //       query: {
  //         userId: profile.userId,
  //         startDate: null,
  //         endDate: null,
  //         types: [AnalyticsTypeEnum.UserAnalytics]
  //       },
  //     });
  //     let eventsAttended = 0;
  //     let lifeTimeValue = 0;

  //     try {
  //       let test = await this.proxy.orderService.queryOrderAnalytics(tempRequest).then(result => { return result });
  //       eventsAttended = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount].coordinates);
  //       lifeTimeValue = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.LifeTimeValue].coordinates);
  //     } catch (e) {
  //       this.logger.error(`generateProfileReport - error: ${e.message}`);
  //       response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //       response.errors = [pb.Error.create({
  //         key: 'Error',
  //         message: e.message,
  //       })];
  //       span.setTag('error', true);
  //       span.log({ errors: e.message });
  //       span.finish();
  //     }
  //     // const { metrics: [metrics] } = profile;
  //     return {
  //       // 'Customer Since': Time.format(metrics.createdAt),
  //       Name: `${profile.firstName} ${profile.lastName}`,
  //       Email: profile.email,
  //       'Phone Number': profile.phoneNumber,
  //       Events: eventsAttended,
  //       LTV:`${Price.output(lifeTimeValue as number , true)}`



  //       // Value: Price.output(metrics.lifeTimeValue),
  //       // // 'Year-to-date value': Price.output(metrics.yearToDateValue),
  //       // 'Value refunded': Price.output(metrics.lifeTimeValueRefunded),
  //       // // 'Year-to-date value refunded': Price.output(metrics.yearToDateValueRefunded),
  //       // 'Tickets purchased': metrics.lifeTimeTicketsPurchased,
  //       // // 'Year-to-date tickets purchased': metrics.yearToDateTicketsPurchased,
  //       // 'Tickets refunded': metrics.lifeTimeTicketsRefunded,
  //       // // 'Year-to-date tickets refunded': metrics.yearToDateTicketsRefunded,
  //       // // 'upgrades purchased': metrics.lifeTimeUpgradesPurchased,
  //       // // 'Year-to-date upgrades purchased': metrics.yearToDateUpgradesPurchased,
  //       // // 'upgrades refunded': metrics.lifeTimeUpgradesRefunded,
  //       // // 'Year-to-date upgrades refunded': metrics.yearToDateUpgradesRefunded,
  //       // 'Orders purchased': metrics.lifeTimeOrdersPurchased,
  //       // // 'Year-to-date orders purchased': metrics.yearToDateOrdersPurchased,
  //       // 'Orders refunded': metrics.lifeTimeOrdersRefunded,
  //       // // 'Year-to-date orders refunded': metrics.yearToDateOrdersRefunded,
  //     };
  //   }));

  //   const csv = await CSV.fromJson(Object.keys(transformed[0]), transformed);

  //   const file = {
  //     file: Buffer.from(csv, 'utf8'),
  //     filename: 'user-profiles.csv',
  //     mimetype: 'text/csv',
  //     encoding: 'utf8',
  //   };

  //   const uploadFileRequest = pb.UploadFileRequest.create({
  //     spanContext: span.context().toString(),
  //     orgId,
  //     files: [file],
  //   });

  //   let uploadFileResponse: pb.UploadFileResponse;

  //   try {
  //     uploadFileResponse = await this.proxy.fileUploadService.uploadFile(uploadFileRequest);
  //   } catch (e) {
  //     throw e;
  //   }

  //   const { url } = uploadFileResponse.files[0];

  //   response.url = url;
  //   response.status = pb.StatusCode.OK;

  //   span.finish();
  //   return response;
  // }

  public emailTotalEUserReport = async (
    request: any
  ): Promise<pb.GenerateUserProfileReportResponse> => {
    const span = tracer.startSpan("emailTotalEOrderReport", request.spanContext);
    const response: pb.GenerateUserProfileReportResponse =
      pb.GenerateUserProfileReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      userId: Joi.string().optional(),
      query: Joi.any().optional(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `emailTotalEOrderReport - error: ${JSON.stringify(params.error)}`
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag("error", true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, userId } = params.value;

    query.orgId = orgId;

    // let orders: IOrder[];
    /*
     * Find the org
     */
    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId: orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(
        findOrgRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      throw new Error(`Failed to fetch order organization: ${e.message}`);
    }

    const { organization } = findOrgResponse;

    /*
     * Find the user
     */

    const findUserRequest = pb.FindUserByIdRequest.create({
      spanContext: span.context().toString(),
      userId: userId,
    });

    let findUserResponse: pb.FindUserByIdResponse;

    try {
      findUserResponse = await this.proxy.userService.findUserById(
        findUserRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      throw new Error(`Failed to fetch order user: ${e.message}`);
    }

    const { user } = findUserResponse;
    let profiles;
    try {
      profiles = await this.storage.queryProfiles(span, query, null);
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    // profiles.length = 5
    // console.log("profiles ", profiles.length)
    const transformed: any[] = await Promise.all(
      profiles?.map(async (profile: IUserProfile): Promise<any> => {
        // let tempRequest = new pb.QueryOrderAnalyticsRequest.create({
        //   spanContext: span.context().toString(),
        //   orgId,
        //   query: {
        //     userId: profile.userId,
        //     startDate: null,
        //     endDate: null,
        //     types: [AnalyticsTypeEnum.UserAnalytics]
        //   },
        // });
        let eventsAttended = 0;
        let lifeTimeValue = 0;
        // const { metrics: [metrics] } = profile;
        const metrics = profile?.metrics?.length ? profile?.metrics[0] : null;
        lifeTimeValue = metrics && metrics?.lifeTimeValue || 0;
        eventsAttended = metrics && metrics?.eventIds && metrics?.eventIds.length || 0;

        // try {
        //   let test = await this.proxy.orderService.queryOrderAnalytics(tempRequest).then(result => { return result });
        //   eventsAttended = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount].coordinates);
        //   // lifeTimeValue = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.LifeTimeValue].coordinates);
        // } catch (e) {
        //   this.logger.error(`generateProfileReport - error: ${e.message}`);
        //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        //   response.errors = [pb.Error.create({
        //     key: 'Error',
        //     message: e.message,
        //   })];
        //   span.setTag('error', true);
        //   span.log({ errors: e.message });
        //   span.finish();
        // }
        // const { metrics: [metrics] } = profile;
        return {
          // 'Customer Since': Time.format(metrics.createdAt),
          Name: `${profile.firstName} ${profile.lastName}`,
          Email: profile.email,
          'Phone Number': profile.phoneNumber,
          Events: eventsAttended,        // LTV: `${Price.output(lifeTimeValue as number, true)}`
          LTV: `${Price.output(lifeTimeValue as number, true)}`,

        };
      }));

    const csv = await CSV.fromJson(Object.keys(transformed[0]), transformed);
    const file = {
      file: Buffer.from(csv, "utf8"),
      filename: "order-report.csv",
      mimetype: "text/csv",
      encoding: "utf8",
    };

    const uploadFileRequest = pb.UploadFileRequest.create({
      spanContext: span.context().toString(),
      orgId,
      files: [file],
    });

    let uploadFileResponse: pb.UploadFileResponse;

    try {
      uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
        uploadFileRequest
      );
    } catch (e) {
      this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: "Error",
          message: e.message,
        }),
      ];
      span.setTag("error", true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const { url } = uploadFileResponse.files[0];
    await this.proxy.emailService.customerSheetEmail({
      toAddress: user.email,
      orgName: organization.orgName,
      url: url,
    });
    response.url = url;
    span.finish();
    return response;
  };

  public generateProfileReport = async (request: pb.GenerateUserProfileReportRequest): Promise<pb.GenerateUserProfileReportResponse> => {
    const span = tracer.startSpan('generateProfileReport', request.spanContext);
    const response: pb.GenerateUserProfileReportResponse = pb.GenerateUserProfileReportResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
      userId: Joi.string().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`generateProfileReport - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query } = params.value;

    query.orgId = orgId;
    // if (query.email && query.email.length > 0) {
    //   const request = pb.QueryUserProfilesRequest.create({
    //     spanContext: span.context().toString(),
    //     orgId: orgId,
    //     query: {
    //       ...query,
    //       name: query.userQuery,
    //       any: true,
    //     },
    //   });

    //   let response: pb.QueryUserProfilesResponse;

    //   try {
    //     response = await this.proxy.userProfileService.queryUserProfiles(
    //       request
    //     );

    //     if (response.status !== pb.StatusCode.OK) {
    //       throw new Error("Unable to query user profiles");
    //     }

    //     const { userProfiles } = response;
    //     query.userIds = userProfiles.map(({ userId }) => userId);
    //   } catch (e) {
    //     this.logger.error(`queryOrders - error: ${e.message}`);
    //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
    //     response.errors = [
    //       pb.Error.create({
    //         key: "Error",
    //         message: e.message,
    //       }),
    //     ];
    //     span.setTag("error", true);
    //     span.log({ errors: e.message });
    //     span.finish();
    //     return response;
    //   }
    // }

    let profiles: IUserProfile[];

    try {
      profiles = await this.storage.queryProfiles(span, query, null);
    } catch (e) {
      this.logger.error(`generateProfileReport - error: ${e.message}`);
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

    if (profiles.length > 500) {
      this.emailTotalEUserReport(request);
      this.logger.error(
        `generateOrderReport - error: ${"Your export has been scheduled and will be emailed to you when it is complete."}`
      );
      response.status = pb.StatusCode.OK;
      response.message =
        "Your export has been scheduled and will be emailed to you when it is complete.";
      span.setTag("error", true);
      span.log({
        errors:
          "Your export has been scheduled and will be emailed to you when it is complete.",
      });
      span.finish();
      return response;
    } else {

      const transformed: any[] = await Promise.all(profiles.map(async (profile: IUserProfile): Promise<any> => {
        // let tempRequest = new pb.QueryOrderAnalyticsRequest.create({
        //   spanContext: span.context().toString(),
        //   orgId,
        //   query: {
        //     userId: profile.userId,
        //     startDate: null,
        //     endDate: null,
        //     types: [AnalyticsTypeEnum.UserAnalytics]
        //   },
        // });
        // let eventsAttended = 0;

        // let lifeTimeValue = 0;

        // try {
        // let test = await this.proxy.orderService.queryOrderAnalytics(tempRequest).then(result => { return result });
        // eventsAttended = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount].coordinates);
        //   // lifeTimeValue = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.LifeTimeValue].coordinates);
        // } catch (e) {
        //   this.logger.error(`generateProfileReport - error: ${e.message}`);
        //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        //   response.errors = [pb.Error.create({
        //     key: 'Error',
        //     message: e.message,
        //   })];
        //   span.setTag('error', true);
        //   span.log({ errors: e.message });
        //   span.finish();
        // }
        // const { metrics: [metrics] } = profile;
        const metrics = profile?.metrics?.length ? profile?.metrics[0] : null;
        let lifeTimeValue = metrics && metrics?.lifeTimeValue || 0;
        let eventsAttended = metrics && metrics?.eventIds && metrics?.eventIds.length || 0;
        return {
          // 'Customer Since': Time.format(metrics.createdAt),
          Name: `${profile.firstName} ${profile.lastName}`,
          Email: profile.email,
          'Phone Number': profile.phoneNumber,
          Events: eventsAttended,
          LTV: `${Price.output(lifeTimeValue as number, true)}`,
        };
      }));
      let noMetricsObj = {
        Name: "",
        Email: '',
        Events:"",
        'Phone Number': "",
        LTV:""
      };

      const csv = await CSV.fromJson(Object.keys(transformed[0] || noMetricsObj), transformed);
      const file = {
        file: Buffer.from(csv, 'utf8'),
        filename: 'user-profiles.csv',
        mimetype: 'text/csv',
        encoding: 'utf8',

      };
      const uploadFileRequest = pb.UploadFileRequest.create({
        spanContext: span.context().toString(),
        orgId,
        files: [file],
      });
      let uploadFileResponse: pb.UploadFileResponse;

      try {
        uploadFileResponse = await this.proxy.fileUploadService.uploadFile(uploadFileRequest);
      } catch (e) {
        throw e;
      }

      const { url } = uploadFileResponse.files[0];
      response.url = url;
      response.status = pb.StatusCode.OK;

      span.finish();
      return response;

    }
    // const transformed: any[] = await Promise.all(profiles.map(async (profile: IUserProfile): Promise<any> => {

    //   let tempRequest = new pb.QueryOrderAnalyticsRequest.create({
    //     spanContext: span.context().toString(),
    //     orgId,
    //     query: {
    //       userId: profile.userId,
    //       startDate: null,
    //       endDate: null,
    //       types: [AnalyticsTypeEnum.UserAnalytics]
    //     },
    //   });
    //   let eventsAttended = 0;
    //   let lifeTimeValue = 0;

    //   try {
    //     let test = await this.proxy.orderService.queryOrderAnalytics(tempRequest).then(result => { return result });
    //     eventsAttended = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount].coordinates);
    //     lifeTimeValue = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.LifeTimeValue].coordinates);
    //   } catch (e) {
    //     this.logger.error(`generateProfileReport - error: ${e.message}`);
    //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
    //     response.errors = [pb.Error.create({
    //       key: 'Error',
    //       message: e.message,
    //     })];
    //     span.setTag('error', true);
    //     span.log({ errors: e.message });
    //     span.finish();
    //   }
    //   // const { metrics: [metrics] } = profile;
    //   return {
    //     // 'Customer Since': Time.format(metrics.createdAt),
    //     Name: `${profile.firstName} ${profile.lastName}`,
    //     Email: profile.email,
    //     'Phone Number': profile.phoneNumber,
    //     Events: eventsAttended,
    //     LTV:`${Price.output(lifeTimeValue as number , true)}`



    //     // Value: Price.output(metrics.lifeTimeValue),
    //     // // 'Year-to-date value': Price.output(metrics.yearToDateValue),
    //     // 'Value refunded': Price.output(metrics.lifeTimeValueRefunded),
    //     // // 'Year-to-date value refunded': Price.output(metrics.yearToDateValueRefunded),
    //     // 'Tickets purchased': metrics.lifeTimeTicketsPurchased,
    //     // // 'Year-to-date tickets purchased': metrics.yearToDateTicketsPurchased,
    //     // 'Tickets refunded': metrics.lifeTimeTicketsRefunded,
    //     // // 'Year-to-date tickets refunded': metrics.yearToDateTicketsRefunded,
    //     // // 'upgrades purchased': metrics.lifeTimeUpgradesPurchased,
    //     // // 'Year-to-date upgrades purchased': metrics.yearToDateUpgradesPurchased,
    //     // // 'upgrades refunded': metrics.lifeTimeUpgradesRefunded,
    //     // // 'Year-to-date upgrades refunded': metrics.yearToDateUpgradesRefunded,
    //     // 'Orders purchased': metrics.lifeTimeOrdersPurchased,
    //     // // 'Year-to-date orders purchased': metrics.yearToDateOrdersPurchased,
    //     // 'Orders refunded': metrics.lifeTimeOrdersRefunded,
    //     // // 'Year-to-date orders refunded': metrics.yearToDateOrdersRefunded,
    //   };
    // }));

    // const csv = await CSV.fromJson(Object.keys(transformed[0]), transformed);

    // const file = {
    //   file: Buffer.from(csv, 'utf8'),
    //   filename: 'user-profiles.csv',
    //   mimetype: 'text/csv',
    //   encoding: 'utf8',
    // };

    // const uploadFileRequest = pb.UploadFileRequest.create({
    //   spanContext: span.context().toString(),
    //   orgId,
    //   files: [file],
    // });

    // let uploadFileResponse: pb.UploadFileResponse;

    // try {
    //   uploadFileResponse = await this.proxy.fileUploadService.uploadFile(uploadFileRequest);
    // } catch (e) {
    //   throw e;
    // }

    // const { url } = uploadFileResponse.files[0];

    // response.url = url;
    // response.status = pb.StatusCode.OK;

    // span.finish();
    // return response;
  }


  public queryProfiles = async (request: pb.QueryUserProfilesRequest): Promise<pb.QueryUserProfilesResponse> => {
    const span = tracer.startSpan('queryProfiles', request.spanContext);
    const response: pb.QueryUserProfilesResponse = pb.QueryUserProfilesResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().optional(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryProfiles - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, query, pagination } = params.value;
      if(orgId){
        query.orgId = orgId;
      }

    let userProfiles: IUserProfile[];
    try {
      userProfiles = await this.storage.queryProfiles(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.userProfiles = userProfiles.map(profile => pb.UserProfile.fromObject(profile));
    } catch (e) {
      this.logger.error(`queryProfiles - error: ${e.message}`);
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

  public deleteUnverifiedUserProfile = async (
    request: pb.DeleteUnverifiedUserProfileRequest,
  ): Promise<pb.DeleteUnverifiedUserProfileResponse> => {
    const span = tracer.startSpan('deleteUnverifiedUserProfile', request.spanContext);
    const response: pb.DeleteUnverifiedUserProfileResponse = pb.DeleteUnverifiedUserProfileResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `deleteUnverifieduserProfile - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId } = params.value;


    // these checks may be unnecessary since this function is only called by
    // deleteUnverifiedUser() which also does checks on the user model
    // to determine whether this is a valid delete profile request.
    let userProfile: IUserProfile;
    try {
      userProfile = await this.storage.findProfile(span, userId);
      if (userProfile) {
        if (userProfile.orgIds.length > 0
          || userProfile.venueIds.length > 0
          || userProfile.artistIds.length > 0
          || userProfile.eventIds.length > 0) {
          throw new Error('Invalid request. Please contact support.');
        }
      }
    } catch (e) {
      this.logger.error(`deleteUnverifiedUserProfile - error: ${e.message}`);
      response.deleted = false;
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

    if (userProfile) {
      try {
        await this.storage.deleteUserProfile(span, userId);
      } catch (e) {
        this.logger.error(`deleteUnverifiedUserProfile - error: ${e.message}`);
        response.deleted = false;
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
    }

    response.deleted = true;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }

  // public orderCreated = async (request: pb.Broadcast.OrderCreatedNotification): Promise<void> => {
  //   const span = tracer.startSpan('orderCreated', request.spanContext);

  //   const schema = Joi.object().keys({
  //     spanContext: Joi.string().required(),
  //     order: Joi.object(),
  //   });

  //   const params = schema.validate(request);

  //   if (params.error) {
  //     this.logger.error(`orderCreated - error: ${JSON.stringify(params.error)}`);
  //     span.setTag('error', true);
  //     span.log({ errors: params.error });
  //     span.finish();
  //     return;
  //   }
  //   const { order } = params.value;

  //   let {
  //     userId,
  //     orgId,
  //     eventId,
  //     venueIds = [],
  //     artistIds = [],
  //   } = order;

  //   let userProfile: IUserProfile;

  //   try {
  //     userProfile = await this.storage.findProfile(span, userId);
  //   } catch (e) {
  //     this.logger.error(`orderCreated - error: ${e.message}`);
  //     span.setTag('error', true);
  //     span.log({ errors: e.message });
  //     span.finish();
  //     return;
  //   }


  //   let {
  //     orgIds,
  //     eventIds,
  //     venueIds: profileVenueIds,
  //     artistIds: profileArtistIds,
  //   } = userProfile;

  //   // Others
  //   orgIds.push(orgId);
  //   orgIds = [...new Set(orgIds)];

  //   eventIds.push(eventId);
  //   eventIds = [...new Set(eventIds)];

  //   venueIds = venueIds.concat(profileVenueIds);
  //   venueIds = [...new Set(venueIds)];

  //   artistIds = artistIds.concat(profileArtistIds);
  //   artistIds = [...new Set(artistIds)];

  //   try {
  //     await this.storage.updateOneProfile(span, userId, { orgIds, eventIds, venueIds, artistIds });
  //   } catch (e) {
  //     this.logger.error(`orderCreated - error: ${e.message}`);
  //     span.setTag('error', true);
  //     span.log({ errors: e.message });
  //     span.finish();
  //     return;
  //   }

  //   span.finish();
  //   return;
  // }

  public orderCreated = async (request: pb.Broadcast.OrderCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('orderCreated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      order: Joi.object(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`orderCreated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { order } = params.value;

    const lifeTimeValue = order?.payments[0]?.transferAmount

    let {
      userId,
      orgId,
      eventId,
      venueIds = [],
      artistIds = [],

    } = order;

    let userProfile: IUserProfile;

    try {
      userProfile = await this.storage.findProfile(span, userId);
    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }


    let {
      orgIds,
      eventIds,
      venueIds: profileVenueIds,
      artistIds: profileArtistIds,
      metrics
    } = userProfile;

    // const total = eventIds.length+ eventId.length
    // console.log(total)
    // let count = 0
    // order?.map(ticket => {
    //   if(ticket.eventId){
    //     count = count+1
    //   }
    //   return  count
    // })


    // const new1 = order?.map(order => order.eventId).length;

    //  let total =( orders: any[]) => {
    //   return [...new Set(orders.map(order => order.eventId))].length;
    //  }
    //   console.log(total.length)
    // let newtotal = total.length
    // console.log(newtotal)

    // let tickettotal =(orders:any[])=>{
    //   return orders.reduce((cur: number, next: any) => cur + next.tickets.length ?? 0, 0);
    // }
    // console.log(tickettotal.length)
    // let newtotal = tickettotal.length
    // console.log(newtotal)

    //   // Metrics
    // let metricIndex = metrics.findIndex(metric => metric.orgId === orgId);

    // if(metricIndex > -1) {
    //   metrics[metricIndex].lifeTimeValue += order?.payments[0]?.transferAmount;
    //   metrics[metricIndex].lifeTimeTicketsPurchased += newtotal;

    // } else {
    //   let metric: any = {
    //     orgId,
    //     lifeTimeValue: lifeTimeValue as number,
    //     lifeTimeTicketsPurchased: newtotal,
    //     // createdAt: Time.now(),
    //   };
    //   metrics.push(metric);
    // }
    // Metrics
    let metricIndex = metrics.findIndex(metric => metric.orgId === orgId);
    let orderTickets = order?.tickets?.length || 0;
    let orderUpgrades = order?.upgrades?.length || 0;
    if (metricIndex > -1) {
      let isExistEvent = metrics[metricIndex].eventIds.includes(order.eventId);
      if (!isExistEvent) {
        metrics[metricIndex].eventIds.push(order.eventId);
      }
      // Value
      metrics[metricIndex].lifeTimeValue += order?.payments[0]?.transferAmount;
      metrics[metricIndex].yearToDateValue += order?.payments[0]?.transferAmount;
      // Tickets
      metrics[metricIndex].lifeTimeUpgradesPurchased += orderUpgrades;
      metrics[metricIndex].lifeTimeOrdersPurchased += 1;
      metrics[metricIndex].lifeTimeTicketsPurchased += orderTickets;
      metrics[metricIndex].yearToDateOrdersPurchased += 1;
      metrics[metricIndex].yearToDateTicketsPurchased += orderTickets;
      metrics[metricIndex].yearToDateUpgradesPurchased += orderUpgrades;
      metrics[metricIndex].orgId = orgId;
      metrics[metricIndex].createdAt = Time.now();
    } else {
      let metric: any = {
        orgId,
        createdAt: Time.now(),
        lifeTimeValue: lifeTimeValue,
        yearToDateValue: lifeTimeValue,
        lifeTimeUpgradesPurchased: orderUpgrades,
        lifeTimeOrdersPurchased: 1,
        lifeTimeTicketsPurchased: orderTickets,
        yearToDateTicketsPurchased: orderTickets,
        yearToDateUpgradesPurchased: orderUpgrades,
        yearToDateOrdersPurchased: 1,
        eventIds: [order.eventId]
      };
      metrics.push(metric);
    }




    // Others
    orgIds.push(orgId);
    orgIds = [...new Set(orgIds)];

    eventIds.push(eventId);
    eventIds = [...new Set(eventIds)];

    venueIds = venueIds.concat(profileVenueIds);
    venueIds = [...new Set(venueIds)];

    artistIds = artistIds.concat(profileArtistIds);
    artistIds = [...new Set(artistIds)];

    try {
      await this.storage.updateOneProfile(span, userId, { orgIds, eventIds, venueIds, artistIds, metrics });
    } catch (e) {
      this.logger.error(`orderCreated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return;
    }

    span.finish();
    return;
  }

  //  public generateProfileReport = async (request: pb.GenerateUserProfileReportRequest): Promise<pb.GenerateUserProfileReportResponse> => {
  //   const span = tracer.startSpan('generateProfileReport', request.spanContext);
  //   const response: pb.GenerateUserProfileReportResponse = pb.GenerateUserProfileReportResponse.create();

  //   const schema = Joi.object().keys({
  //     spanContext: Joi.string().required(),
  //     orgId: Joi.string().required(),
  //     query: Joi.any().optional(),
  //     userId:Joi.string().optional()
  //   });
  // //   const params = schema.validate(request);

  //   const params = schema.validate(request);
  //   let { orgId, query } = params.value;

  //   if (params.error) {
  //     this.logger.error(`generateProfileReport - error: ${JSON.stringify(params.error)}`);
  //     response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
  //     response.errors = joiToErrors(params.error, pb.Error);
  //     span.setTag("error", true);
  //     span.log({ errors: params.error });
  //     span.finish();
  //     return response;
  //   }

  //   query.orgId = orgId;

  //   let profiles: IUserProfile[]; 

  //   try {
  //     profiles = await this.storage.queryProfiles(span, query, null);
  //   } catch (e) {
  //     this.logger.error(`generateProfileReport - error: ${e}`);
  //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //     response.errors = [pb.Error.create({
  //       key: "Error",
  //       message: e.message
  //     })];
  //     span.setTag("error", true);
  //     span.log({ errors: e });
  //     span.finish();
  //     return response;
  //   }
  //   // const transformed: any[] = await Promise.all(profiles.map(async (profile: IUserProfile): Promise<any> => {

  //   const transformed: any[] = await Promise.all(profiles.map(async (profile: any): Promise<any> => {
  //     const { metrics: [metrics] } = profile;
  //     return {
  //       // 'Customer Since': Time.format(metrics.createdAt),
  //       'Name': `${profile.firstName} ${profile.lastName}`,
  //       'Email': profile.email,
  //       'Phone Number': profile.phoneNumber,
  //       'LTV': Price.output(metrics.lifeTimeValue as number, true),
  //       // 'Year-to-date value': Price.output(metrics.yearToDateValue),
  //       // 'Value refunded': Price.output(metrics.lifeTimeValueRefunded),
  //       // 'Year-to-date value refunded': Price.output(metrics.yearToDateValueRefunded),
  //       'Events': metrics.lifeTimeTicketsPurchased,
  //       // 'Year-to-date tickets purchased': metrics.yearToDateTicketsPurchased,
  //       // 'Tickets refunded': metrics.lifeTimeTicketsRefunded,
  //       // 'Year-to-date tickets refunded': metrics.yearToDateTicketsRefunded,
  //       // 'upgrades purchased': metrics.lifeTimeUpgradesPurchased,
  //       // 'Year-to-date upgrades purchased': metrics.yearToDateUpgradesPurchased,
  //       // 'upgrades refunded': metrics.lifeTimeUpgradesRefunded,
  //       // 'Year-to-date upgrades refunded': metrics.yearToDateUpgradesRefunded,
  //       // 'Orders purchased': metrics.lifeTimeOrdersPurchased,
  //       // 'Year-to-date orders purchased': metrics.yearToDateOrdersPurchased,
  //       // 'Orders refunded': metrics.lifeTimeOrdersRefunded,
  //       // 'Year-to-date orders refunded': metrics.yearToDateOrdersRefunded,
  //     };
  //   }));

  //   const csv = await CSV.fromJson(Object.keys(transformed[0]), transformed);
  //   const file = {
  //     file: Buffer.from(csv, 'utf8'),
  //     filename: 'user-profiles.csv',
  //     mimetype: 'text/csv',
  //     encoding: 'utf8',
  //   };

  //   const uploadFileRequest = pb.UploadFileRequest.create({
  //           spanContext: span.context().toString(),
  //           orgId,
  //           files: [file],
  //         });
  //   let uploadFileResponse: pb.UploadFileResponse;

  //   try {
  //     uploadFileResponse = await this.proxy.fileUploadService.uploadFile(uploadFileRequest);
  //   } catch (e) {
  //     throw e;
  //   }

  //   const { url } = uploadFileResponse.files[0];

  //   response.url = url;
  //   response.status = pb.StatusCode.OK;

  //   span.finish();
  //   return response;
  // }


  // public emailTotalEUserReport = async (
  //   request: any
  // ): Promise<pb.GenerateUserProfileReportResponse> => {
  //   const span = tracer.startSpan("emailTotalEOrderReport", request.spanContext);
  //   const response: pb.GenerateUserProfileReportResponse =
  //     pb.GenerateUserProfileReportResponse.create();

  //   const schema = Joi.object().keys({
  //     spanContext: Joi.string().required(),
  //     orgId: Joi.string().required(),
  //     userId: Joi.string().optional(),
  //     query: Joi.any().optional(),
  //   });
  //   const params = schema.validate(request);
  //   if (params.error) {
  //     this.logger.error(
  //       `emailTotalEOrderReport - error: ${JSON.stringify(params.error)}`
  //     );
  //     response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
  //     response.errors = joiToErrors(params.error, pb.Error);
  //     span.setTag("error", true);
  //     span.log({ errors: params.error });
  //     span.finish();
  //     return response;
  //   }
  //   const { orgId, query, userId } = params.value;

  //   query.orgId = orgId;

  //   // let orders: IOrder[];
  //   /*
  //    * Find the org
  //    */
  //   const findOrgRequest = pb.FindOrganizationRequest.create({
  //     spanContext: span.context().toString(),
  //     orgId: orgId,
  //   });

  //   let findOrgResponse: pb.FindOrganizationResponse;

  //   try {
  //     findOrgResponse = await this.proxy.organizationService.findOrganization(
  //       findOrgRequest
  //     );
  //   } catch (e) {
  //     this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
  //     throw new Error(`Failed to fetch order organization: ${e.message}`);
  //   }

  //   const { organization } = findOrgResponse;

  //   /*
  //    * Find the user
  //    */

  //   const findUserRequest = pb.FindUserByIdRequest.create({
  //     spanContext: span.context().toString(),
  //     userId: userId,
  //   });

  //   let findUserResponse: pb.FindUserByIdResponse;

  //   try {
  //     findUserResponse = await this.proxy.userService.findUserById(
  //       findUserRequest
  //     );
  //   } catch (e) {
  //     this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
  //     throw new Error(`Failed to fetch order user: ${e.message}`);
  //   }

  //   const { user } = findUserResponse;

  //   let profiles
  //   try {
  //     profiles = await this.storage.queryProfiles(span, query, null);
  //   } catch (e) {
  //     this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
  //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //     response.errors = [
  //       pb.Error.create({
  //         key: "Error",
  //         message: e.message,
  //       }),
  //     ];
  //     span.setTag("error", true);
  //     span.log({ errors: e.message });
  //     span.finish();
  //     return response;
  //   }

  //   const transformed: any[] = await Promise.all(profiles.map(async (profile: IUserProfile): Promise<any> => {

  //     let tempRequest = new pb.QueryOrderAnalyticsRequest.create({
  //       spanContext: span.context().toString(),
  //       orgId,
  //       query: {
  //         userId: profile.userId,
  //         startDate: null,
  //         endDate: null,
  //         types: [AnalyticsTypeEnum.UserAnalytics]
  //       },
  //     });
  //     let eventsAttended = 0;
  //     let lifeTimeValue = 0;

  //     try {
  //       let test = await this.proxy.orderService.queryOrderAnalytics(tempRequest).then(result => { return result });
  //       eventsAttended = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount].coordinates);
  //       lifeTimeValue = AnalyticsUtil.getTotalValue(test.analytics[0].segments[UserAnalyticsSegmentsIndexEnum.LifeTimeValue].coordinates);
  //     } catch (e) {
  //       this.logger.error(`generateProfileReport - error: ${e.message}`);
  //       response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //       response.errors = [pb.Error.create({
  //         key: 'Error',
  //         message: e.message,
  //       })];
  //       span.setTag('error', true);
  //       span.log({ errors: e.message });
  //       span.finish();
  //     }
  //     // const { metrics: [metrics] } = profile;
  //     return {
  //       // 'Customer Since': Time.format(metrics.createdAt),
  //       Name: `${profile.firstName} ${profile.lastName}`,
  //       Email: profile.email,
  //       'Phone Number': profile.phoneNumber,
  //       Events: eventsAttended,
  //       LTV:`${Price.output(lifeTimeValue as number , true)}`
  //     };
  //   }));

  //   const csv = await CSV.fromJson(Object.keys(transformed[0]), transformed);
  //   const file = {
  //     file: Buffer.from(csv, "utf8"),
  //     filename: "order-report.csv",
  //     mimetype: "text/csv",
  //     encoding: "utf8",
  //   };

  //   const uploadFileRequest = pb.UploadFileRequest.create({
  //     spanContext: span.context().toString(),
  //     orgId,
  //     files: [file],
  //   });

  //   let uploadFileResponse: pb.UploadFileResponse;

  //   try {
  //     uploadFileResponse = await this.proxy.fileUploadService.uploadFile(
  //       uploadFileRequest
  //     );
  //   } catch (e) {
  //     this.logger.error(`emailTotalEOrderReport - error: ${e.message}`);
  //     response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
  //     response.errors = [
  //       pb.Error.create({
  //         key: "Error",
  //         message: e.message,
  //       }),
  //     ];
  //     span.setTag("error", true);
  //     span.log({ errors: e.message });
  //     span.finish();
  //     return response;
  //   }

  //   const { url } = uploadFileResponse.files[0];
  //   user.email = 'ashutoshk@yopmail.com'
  //   await this.proxy.emailService.customerSheetEmail({
  //     toAddress: user.email,
  //     orgName: organization.orgName,
  //     url: url,
  //   });
  //   response.url = url;
  //   span.finish();
  //   return response;
  // };
}
