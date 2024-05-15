import * as pb from '@sellout/models/.dist/sellout-proto';
import Joi from '@hapi/joi';
import * as Time from '@sellout/utils/.dist/time';
import * as Random from '@sellout/utils/.dist/random';
import BaseService from '@sellout/service/.dist/BaseService';
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import { User } from './User';
import UserStore from './UserStore';
import IUser from '@sellout/models/.dist/interfaces/IUser';
import Tracer from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL, JWT_SECRET, ADMIN_UI_BASE_URL } from './env';
import jwt from 'jsonwebtoken';
import uuid4 from 'uuid/v4';

const tracer = new Tracer('UserService');

export default class UserService extends BaseService {
  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.UserService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new UserService({
      serviceName,
      connectionMgr: new NatsConnectionManager(
        [<string>NATS_URL],
        logger,
        true,
      ),
      logManager: logger,
      storageManager: new UserStore(User),
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
      createUser: new PbMessageHandler(
        this.createUser,
        pb.CreateUserRequest,
        pb.CreateUserResponse,
      ),
      setUserOrgContextId: new PbMessageHandler(
        this.setUserOrgContextId,
        pb.SetUserOrgContextIdRequest,
        pb.SetUserOrgContextIdResponse,
      ),
      sendUserEmailVerification: new PbMessageHandler(
        this.sendUserEmailVerification,
        pb.SendUserEmailVerificationRequest,
        pb.SendUserEmailVerificationResponse,
      ),
      verifyUserEmail: new PbMessageHandler(
        this.verifyUserEmail,
        pb.VerifyUserEmailRequest,
        pb.VerifyUserEmailResponse,
      ),
      sendUserPhoneVerification: new PbMessageHandler(
        this.sendUserPhoneVerification,
        pb.SendUserPhoneVerificationRequest,
        pb.SendUserPhoneVerificationResponse,
      ),
      verifyUserPhoneNumber: new PbMessageHandler(
        this.verifyUserPhoneNumber,
        pb.VerifyUserPhoneNumberRequest,
        pb.VerifyUserPhoneNumberResponse,
      ),
      authUser: new PbMessageHandler(
        this.authUser,
        pb.AuthUserRequest,
        pb.AuthUserResponse,
      ),
      updateUserPhoneNumber: new PbMessageHandler(
        this.updateUserPhoneNumber,
        pb.UpdateUserPhoneNumberRequest,
        pb.UpdateUserPhoneNumberResponse,
      ),
      updateUserEmail: new PbMessageHandler(
        this.updateUserEmail,
        pb.UpdateUserEmailRequest,
        pb.UpdateUserEmailResponse,
      ),
      updateBasicUserInfo: new PbMessageHandler(
        this.updateBasicUserInfo,
        pb.UpdateBasicUserInfoRequest,
        pb.UpdateBasicUserInfoResponse,
      ),
      forgotUserPassword: new PbMessageHandler(
        this.forgotUserPassword,
        pb.ForgotUserPasswordRequest,
        pb.ForgotUserPasswordResponse,
      ),
      resetUserPassword: new PbMessageHandler(
        this.resetUserPassword,
        pb.ResetUserPasswordRequest,
        pb.ResetUserPasswordResponse,
      ),
      resetUserPasswordInApp: new PbMessageHandler(
        this.resetUserPasswordInApp,
        pb.ResetUserPasswordInAppRequest,
        pb.ResetUserPasswordInAppResponse,
      ),
      findUserById: new PbMessageHandler(
        this.findUserById,
        pb.FindUserByIdRequest,
        pb.FindUserByIdResponse,
      ),
      findUserByEmail: new PbMessageHandler(
        this.findUserByEmail,
        pb.FindUserByEmailRequest,
        pb.FindUserByEmailResponse,
      ),
      sendUserPhoneAuthentication: new PbMessageHandler(
        this.sendUserPhoneAuthentication,
        pb.UserPhoneAuthenticationRequest,
        pb.UserPhoneAuthenticationResponse,
      ),
      verifyUserPhoneAuthentication: new PbMessageHandler(
        this.verifyUserPhoneAuthentication,
        pb.VerifyUserPhoneAuthenticationRequest,
        pb.VerifyUserPhoneAuthenticationResponse,
      ),
      updateUserPreferredLogin: new PbMessageHandler(
        this.updateUserPreferredLogin,
        pb.UpdateUserPreferredLoginRequest,
        pb.UpdateUserPreferredLoginResponse,
      ),
      deleteUnverifiedUser: new PbMessageHandler(
        this.deleteUnverifiedUser,
        pb.DeleteUnverifiedUserRequest,
        pb.DeleteUnverifiedUserResponse,
      ),
      setUserPassword: new PbMessageHandler(
        this.setUserPassword,
        pb.SetUserPasswordRequest,
        pb.SetUserPasswordResponse,
      ),
      addSecondaryEmail: new PbMessageHandler(
        this.addSecondaryEmail,
        pb.AddSecondaryEmailRequest,
        pb.AddSecondaryEmailResponse,
      ),
      updateSecondaryEmail: new PbMessageHandler(
        this.updateSecondaryEmail,
        pb.UpdateSecondaryEmailRequest,
        pb.UpdateSecondaryEmailResponse,
      ),
      deleteSecondaryEmail: new PbMessageHandler(
        this.deleteSecondaryEmail,
        pb.DeleteSecondaryEmailRequest,
        pb.DeleteSecondaryEmailResponse,
      ),
      makeSecondaryEmailPrimary: new PbMessageHandler(
        this.makeSecondaryEmailPrimary,
        pb.MakeSecondaryEmailPrimaryRequest,
        pb.MakeSecondaryEmailPrimaryResponse,
      ),
      updateUserInfo: new PbMessageHandler(
        this.updateUserInfo,
        pb.UpdateUserInfoRequest,
        pb.UpdateUserInfoResponse,
      ),
    });
  }
  private toPb = (user: IUser): IUser => {
    if (!user) {
      return new pb.User();
    }

    const pbUser = Object.assign(new pb.User(), {
      _id: user?._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneNumberVerifiedAt: user.phoneNumberVerifiedAt,
      orgContextId: user.orgContextId,
      orgRole: user.orgRole,
      phoneNumberWaitingForVerify: user.phoneNumberWaitingForVerify,
      emailWaitingForVerify: user.emailWaitingForVerify,
      preferredLogin: user.preferredLogin,
      passwordHash: user.passwordHash,
      secondaryEmails: user.secondaryEmails,
    });

    return pbUser;
  }
  private generateJWT = (user: IUser): string => {
    return jwt.sign(
      { _id: user?._id, email: user.email, orgId: user.orgContextId },
      JWT_SECRET,
    );
  }
  public createUser = async (
    request: pb.CreateUserRequest,
  ): Promise<pb.CreateUserResponse> => {
    const span = tracer.startSpan('createUser', request.spanContext);
    const response: pb.CreateUserResponse = pb.CreateUserResponse.create();

    /**
     * Validate the registration parameters
     */
    const schema = Joi.object().keys({
      email: Joi.string().email().allow(null).allow('').optional(),
      password: Joi.string().allow(null).allow('').optional(),
      firstName: Joi.string().allow(null).allow('').optional(),
      lastName: Joi.string().allow(null).allow('').optional(),
      phoneNumber: Joi.string().allow(null).optional(),
      secondaryEmail: Joi.boolean().allow(null).optional(),
    });
    const params = schema.validate(request.user);

    if (params.error) {
      this.logger.error(`createUser - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { email, password, firstName, lastName, phoneNumber, secondaryEmail } = params.value;


    let secondary = secondaryEmail ? secondaryEmail : false
    let existingUser: IUser;
    /**
     * We only check this if the email is sent. For accounts that
     * do not have an email, the email is stored as an empty string.
     */
    if (Boolean(email)) {
      try {
        existingUser = await this.storage.findByEmail(span, email);
        if (existingUser && existingUser?._id) {
          throw new Error('An account with this email already exists.');
        }
      } catch (e) {
        this.logger.error(`createUser - error: ${e.message}`);
        response.status = pb.StatusCode.BAD_REQUEST;
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

    /**
   * Noticed that the user must have an email address for this
   * check to fail. If they don't have an email address, but 
   * the phone number does exist, the user was created 
   * at the box office and is now updating their account
   * information via backstage or self checkout.
   */
    try {
      existingUser = await this.storage.findByPhoneNumber(span, phoneNumber);

    } catch (e) {
      this.logger.error(`createUser - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    /**
     * Save the user to storage
     */
    if (!!existingUser && secondary) {
      let secondaryEmailArr = existingUser.secondaryEmails
      secondaryEmailArr.push(email)

      var attributes: IUser = {
        email: existingUser.email,
        password,
        firstName,
        lastName,
        phoneNumber,
        secondaryEmails: secondaryEmailArr,
        createdAt: Time.now(),
      };
    } else {
      attributes = {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        createdAt: Time.now(),
      };
    }
    // console.log(existingUser.secondaryEmails, secondary, !!existingUser, '..........')
    // if (existingUser && existingUser._id && existingUser.email) {
    //   throw new Error('It appears that an account with this phone number is already registered using a different email address. Please click the back button and enter the correct email address to login into this account.');
    // }
    let user: IUser;
    try {
      user = await this.storage.createUser(span, attributes, !!existingUser);
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`createUser - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Register was unsuccessful. Please try again.'
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    /**
     * If the user already exists, update the user profile with
     * the latest user info
     * If the user does not exist, create the user profile 
     * and stripe customer account
     */
    if (existingUser) {
      /**
       * Update the user profile
       */

      var updateEmailRoleReq = pb.UpdateRoleEmailRequest.create({
        spanContext: span.context().toString(),
        userId: existingUser?._id,
        userEmail: email
      });
      if (secondary) {
        var updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
          spanContext: span.context().toString(),
          userId: user?._id,
          userProfile: {
            firstName,
            lastName,
            email: existingUser.email,
            phoneNumber,
          },
        });
        console.log(updateUserProfileRequest, '........')
        updateEmailRoleReq = pb.UpdateRoleEmailRequest.create({
          spanContext: span.context().toString(),
          userId: existingUser?._id,
          userEmail: existingUser.email
        });
      } else {
        updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
          spanContext: span.context().toString(),
          userId: user?._id,
          userProfile: {
            firstName,
            lastName,
            email,
            phoneNumber,
          },
        });

        const updateEmailReq = pb.QueueUpdatedEmailRequest.create({
          spanContext: span.context().toString(),
          toAddress: existingUser.email,
          firstName,
          lastName,
        });

        try {
          await this.proxy.emailService.queueUpdatedEmail(updateEmailReq);
          response.status = pb.StatusCode.OK;
        } catch (e) {
          this.logger.error(e);
        }
      }

      try {
        var profile = await this.proxy.userProfileService.updateUserProfile(
          updateUserProfileRequest,
        );
      } catch (e) {
        this.logger.error(`createUser - error: ${e.message}`);
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
      try {
        await this.proxy.roleService.updateRoleEmail(
          updateEmailRoleReq,
        );
      } catch (e) {
        this.logger.error(`createUser - error: ${e.message}`);
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
      if (!secondary) {

        const { stripeCustomerId } = profile.userProfile
        const updateCustomerRequest = new pb.UpdateStripeCustomerRequest({
          spanContext: span.context().toString(),
          userId: user?._id.toString(),
          stripeCustomerId
        });

        let updateCustomerResponse: pb.UpdateStripeCustomerResponse;

        try {
          updateCustomerResponse = await this.proxy.stripeService.updateStripeCustomer(
            updateCustomerRequest,
          );

          if (updateCustomerResponse.status !== pb.StatusCode.OK) {
            throw new Error(
              'There was an error creating the stripe customer. Please contact support.'
            );
          }
        } catch (e) {
          this.logger.error(`createUser - error: ${e.message}`);
          response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
          response.errors = [
            pb.Error.create({
              key: 'Error',
              message: e.message,
            }),
          ].concat(updateCustomerResponse.errors);
          span.setTag('error', true);
          span.log({ errors: e.message });
          span.finish();
          return response;
        }
      }

      /**
       * Create the stripe customer
       */
    } else {
      /**
       * Create the user profile
       */
      const createProfileRequest = new pb.CreateUserProfileRequest({
        spanContext: span.context().toString(),
        userId: user?._id.toString(),
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      let createProfileResponse: pb.CreateUserProfileResponse;

      try {
        createProfileResponse = await this.proxy.userProfileService.createUserProfile(
          createProfileRequest,
        );

        if (createProfileResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            'There was an error creating the user profile. Please contact support.'
          );
        }
      } catch (e) {
        this.logger.error(`createUser - error: ${e.message}`);
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

      /**
       * Create the stripe customer
       */
      const createCustomerRequest = new pb.CreateStripeCustomerRequest({
        spanContext: span.context().toString(),
        userId: user?._id.toString(),
      });

      let createCustomerResponse: pb.CreateStripeCustomerResponse;

      try {
        createCustomerResponse = await this.proxy.stripeService.createStripeCustomer(
          createCustomerRequest,
        );

        if (createCustomerResponse.status !== pb.StatusCode.OK) {
          throw new Error(
            'There was an error creating the stripe customer. Please contact support.'
          );
        }
      } catch (e) {
        this.logger.error(`createUser - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: e.message,
          }),
        ].concat(createCustomerResponse.errors);
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return response;
      }
    }

    // Track
    this.segment.identify({
      userId: user?._id,
      properties: {
        firsName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phoneNumber,
      },
    });

    span.finish();
    return response;
  }
  public sendUserEmailVerification = async (
    request: pb.SendUserEmailVerificationRequest,
  ): Promise<pb.SendUserEmailVerificationResponse> => {
    const span = tracer.startSpan(
      'sendUserEmailVerification',
      request.spanContext,
    );
    const response: pb.SendUserEmailVerificationResponse = pb.SendUserEmailVerificationResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().optional(),
      email: Joi.string().optional(),
    });

    const params = schema.validate(request);
    let { userId } = params.value;
    if (params.value.email) {
      let userdetail = await this.storage.findByEmail(span, params.value.email)
      userId = userdetail?._id
    }
    const emailVerifyCode: string = uuid4();

    try {
      await this.storage.saveEmailVerifyCode(span, userId, emailVerifyCode);
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
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

    let user: IUser;

    try {
      user = await this.storage.findById(span, userId);
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
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

    const { firstName, lastName, email, emailWaitingForVerify } = user;

    const verifyEmailReq = pb.QueueUserWelcomeEmailRequest.create({
      spanContext: span.context().toString(),
      toAddress: emailWaitingForVerify || email,
      firstName,
      lastName,
      redirectUrl: `${ADMIN_UI_BASE_URL}/account/verifyEmail/?code=${emailVerifyCode}`,
    });

    try {
      await this.proxy.emailService.queueUserWelcomeEmail(verifyEmailReq);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(e);
    }

    span.finish();
    return response;
  }
  public sendUserPhoneVerification = async (
    request: pb.VerifyUserPhoneNumberRequest,
  ): Promise<pb.VerifyUserPhoneNumberResponse> => {
    const span = tracer.startSpan(
      'sendUserPhoneVerification',
      request.spanContext,
    );
    const response: pb.SendUserPhoneVerificationResponse = pb.SendUserPhoneVerificationResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `sendUserPhoneVerification - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { userId } = params.value;


    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
      response.phoneVerified = false;
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

    const phoneVerifyCode: string = Random.generateOfLength(4).toString();

    try {
      await this.storage.savePhoneVerifyCode(span, user?._id, phoneVerifyCode);
      await this.storage.setAuthAttempts(span, user?._id, 0);
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
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

    const verifyRequest = pb.SendPlivoSMSRequest.create({
      spanContext: span.context().toString(),
      phoneNumber: user.phoneNumberWaitingForVerify || user.phoneNumber,
      message: `Your Sellout Verification Code is ${phoneVerifyCode}`,
    });

    try {
      await this.proxy.plivoService.sendPlivoSMS(verifyRequest);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
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
  public verifyUserPhoneNumber = async (
    request: pb.VerifyUserPhoneNumberRequest,
  ): Promise<pb.VerifyUserPhoneNumberResponse> => {
    const span = tracer.startSpan('verifyUserPhoneNumber', request.spanContext);
    const response: pb.VerifyUserPhoneNumberResponse = pb.VerifyUserPhoneNumberResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      phoneVerificationToken: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `verifyUserPhoneNumber - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, phoneVerificationToken } = params.value;

    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
    } catch (e) {
      this.logger.error(`verifyUserPhoneNumber - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.emailVerified = false;
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

    try {
      if (user.authTimeOut > Time.now()) {
        throw new Error(`Too many incorrect code attempts, try again at ${Time.format(user.authTimeOut, 'M/DD/YYYY h:mm:ssa')}`);
      }
    } catch (e) {
      this.logger.error(`verifyUserPhoneNumber - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // check if auth code is valid and add to authAttempts if failure, set timeout if attempts is greater than 10
    if (!(phoneVerificationToken === user.phoneVerifyCode)) {
      try {
        await this.storage.setAuthAttempts(span, user?._id, (user.authAttempts += 1));
        if (user.authAttempts >= 10) {
          // await this.storage.setAuthTimeOut(span, user._id, (Time.now() + ((Time.MINUTE / 1000) * 10)));
          await this.storage.setAuthTimeOut(span, user?._id, (Time.now() + (Time.MINUTE * 15)));
          await this.storage.savePhoneVerifyCode(span, user?._id, null);
        }
        throw new Error('Invalid verification code.');
      } catch (e) {
        this.logger.error(`authTimeOut - error: ${e.message}`);
        response.status = pb.StatusCode.BAD_REQUEST;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });

        span.finish();
        return response;
      }
    }

    // at this point, user has entered the correct code

    // delete phone code from database
    try {
      await this.storage.savePhoneVerifyCode(span, user?._id, null);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    // reset login attempts if any
    try {
      await this.storage.setAuthAttempts(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    // reset timeout if not null
    try {
      await this.storage.setAuthTimeOut(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    if (user.phoneNumberWaitingForVerify) {
      try {
        user = await this.storage.resetUserPhoneNumber(
          span,
          userId,
          user.phoneNumberWaitingForVerify,
        );
      } catch (e) {
        this.logger.error(`verifyUserPhoneNumber - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.phoneVerified = false;
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

    try {
      await this.storage.verifyPhoneNumber(span, userId);
    } catch (e) {
      this.logger.error(`verifyUserPhoneNumber - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.phoneVerified = false;
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

    /**
     * We store the phone number on the user profile
     * so it needs to be updated when the the
     * new phone number is verified
     */

    const updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId: user?._id.toString(),
      userProfile: {
        phoneNumber: user.phoneNumber,
      },
    });

    try {
      await this.proxy.userProfileService.updateUserProfile(
        updateUserProfileRequest,
      );
    } catch (e) {
      this.logger.error(`verifyUserPhoneNumber - error: ${e.message}`);
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

    response.status = pb.StatusCode.OK;
    response.phoneVerified = true;

    span.finish();
    return response;
  }

  public verifyUserEmail = async (
    request: pb.VerifyUserEmailRequest,
  ): Promise<pb.VerifyUserEmailResponse> => {
    const span = tracer.startSpan('verifyUserEmail', request.spanContext);
    const response: pb.VerifyUserEmailResponse = pb.VerifyUserEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      emailVerificationToken: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `verifyUserEmail - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { emailVerificationToken } = params.value;


    let user: IUser;
    try {
      user = await this.storage.findBy(span, {
        emailVerifyCode: emailVerificationToken,
      });
      if (user && user.emailVerifiedAt && !user.emailWaitingForVerify) {
        throw new Error('This account has already been verified.');
      }
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.emailVerified = false;
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

    let isValid;
    try {
      isValid = await this.storage.verifyEmail(span, emailVerificationToken);
      if (!isValid) {
        throw new Error('Invalid verification code.');
      }
      response.status = pb.StatusCode.OK;
      response.emailVerified = true;
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.emailVerified = false;
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

    // reset main email if needed
    if (user.emailWaitingForVerify) {
      try {
        user = await this.storage.resetUserEmail(
          span,
          user?._id,
          user.emailWaitingForVerify,
        );
      } catch (e) {
        this.logger.error(`verifyUserEmail - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.phoneVerified = false;
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

    /**
     * Once a user has verified their email
     * we update the organization roles that
     * they have authorization to access with
     * their userId
     */
    const updateRolesRequest = pb.AssignUserIdToRolesRequest.create({
      spanContext: span.context().toString(),
      userId: user?._id.toString(),
      userEmail: user.email,
    });

    try {
      await this.proxy.roleService.assignUserIdToRoles(updateRolesRequest);
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
    }

    /**
     * We store the email on the user profile
     * so it needs to be updated when the the
     * new email is verified
     */
    const updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId: user?._id.toString(),
      userProfile: {
        email: user.email,
      },
    });

    try {
      await this.proxy.userProfileService.updateUserProfile(
        updateUserProfileRequest,
      );
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
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

    response.status = pb.StatusCode.OK;
    response.emailVerified = true;

    span.finish();
    return response;
  }
  public setUserOrgContextId = async (
    request: pb.SetUserOrgContextIdRequest,
  ): Promise<pb.SetUserOrgContextIdResponse> => {
    const span = tracer.startSpan('setUserOrgContextId', request.spanContext);
    const response: pb.SetUserOrgContextIdResponse = pb.SetUserOrgContextIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      orgId: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `setUserOrgContextId - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, orgId } = params.value;

    // let role;

    // if(orgId) {
    //   const findUserRoleRequest = pb.FindUserRoleRequest.create({
    //     spanContext: span.context().toString(),
    //     userId,
    //     orgId
    //   });

    //   let findUserRoleResponse: pb.FindUserRoleRequest;

    //   try {
    //     findUserRoleResponse = await this.proxy.roleService.findUserRole(findUserRoleRequest);
    //     role = findUserRoleResponse.role;

    //     if(!role) {
    //       throw new Error('This user does not have access to this organization.');
    //     }

    //   } catch(e) {
    //     this.logger.error(`setUserOrgContextId - error: ${e.message}`);
    //     response.status = pb.StatusCode.UNAUTHORIZED;
    //     response.errors = [pb.Error.create({
    //       key: 'Error',
    //       message: e.message,
    //     })];
    //     span.setTag('error', true);
    //     span.log({ errors: e.message  });
    //     span.finish();
    //     return response;
    //   }
    // }

    let user: IUser;

    try {
      user = await this.storage.setUserOrgContextId(span, userId, orgId);
    } catch (e) {
      this.logger.error(`setUserOrgContextId - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    response.user = this.toPb(user);
    response.token = this.generateJWT(user);
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }
  public authUser = async (
    request: pb.AuthUserRequest,
  ): Promise<pb.AuthUserResponse> => {
    const span = tracer.startSpan('authUser', request.spanContext);
    const response: pb.AuthUserResponse = pb.AuthUserResponse.create();

    let user: IUser;
    let isValidPassword = false;

    try {
      user = await this.storage.findByEmail(span, request.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
    } catch (e) {
      this.logger.error(`authUser - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      if (user.authTimeOut > Time.now()) {
        throw new Error(`Too many incorrect login attempts, try again at ${Time.format(user.authTimeOut, 'M/DD/YYYY h:mm:ssa')}`);
      }
    } catch (e) {
      this.logger.error(`authUser - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    try {
      isValidPassword = await this.storage.comparePasswordHash(
        span,
        request.password,
        user.passwordHash,
      );
    } catch (e) {
      this.logger.error(`authUser - error: ${e.message}`);
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

    // check if auth is valid and add to authAttempts if failure, set timeout if attempts is greater than 10
    if (!isValidPassword) {
      try {
        await this.storage.setAuthAttempts(span, user?._id, (user.authAttempts += 1));
        if ((user.authAttempts += 1) >= 10) {
          await this.storage.setAuthTimeOut(span, user?._id, (Time.now() + ((Time.MINUTE / 1000) * 10)));
        }
        throw new Error('Invalid credentials');
      } catch (e) {
        this.logger.error(`authTimeOut - error: ${e.message}`);
        response.status = pb.StatusCode.UNAUTHORIZED;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });

        span.finish();
        return response;
      }
    }

    // password is valid at this point

    // reset login attempts if any
    try {
      await this.storage.setAuthAttempts(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    // reset timeout if not null
    try {
      await this.storage.setAuthTimeOut(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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
    response.token = this.generateJWT(user);
    response.user = this.toPb(user);
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }

  public forgotUserPassword = async (
    request: pb.ForgotPasswordUserRequest,
  ): Promise<pb.ForgotPasswordUserResponse> => {
    const span = tracer.startSpan('forgotUserPassword', request.spanContext);
    const response: pb.ForgotUserPassword = pb.ForgotUserPasswordRequest.create();

    const schema = Joi.object().keys({
      email: Joi.string()
        .email()
        .required(),
      spanContext: Joi.string(),
    });

    const params = schema.validate(request);
    const { email } = params.value;

    // Generate code for reset password email
    const forgotPasswordCode: string = uuid4();

    let saveCodeSuccess = false;
    try {
      saveCodeSuccess = await this.storage.forgotPassword(
        span,
        email,
        forgotPasswordCode,
      );
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`forgotUserPassword - error: ${e.message}`);
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
    }

    if (saveCodeSuccess) {
      const resetPasswordEmailRequest = new pb.QueueUserResetPasswordEmailRequest.create(
        {
          spanContext: span.context().toString(),
          toAddress: email,
          resetPasswordUrl: `${ADMIN_UI_BASE_URL}/account/resetPassword/?code=${forgotPasswordCode}`,
        },
      );

      try {
        await this.proxy.emailService.queueUserResetPasswordEmail(
          resetPasswordEmailRequest,
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    span.finish();
    return response;
  }

  public resetUserPassword = async (
    request: pb.ResetPasswordUserRequest,
  ): Promise<pb.ResetPasswordUserResponse> => {
    const span = tracer.startSpan('resetUserPassword', request.spanContext);
    const response: pb.ResetUserPasswordResponse = pb.ResetUserPasswordResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      forgotPasswordCode: Joi.string().required(),
      password: Joi.string().required(),
    });

    const params = schema.validate(request);
    const { forgotPasswordCode, password } = params.value;

    let isReset = false;
    try {
      isReset = await this.storage.resetPassword(
        span,
        forgotPasswordCode,
        password,
      );
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`resetUserPassword - error: ${e.message}`);
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

    if (!isReset) {
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message:
            'Invalid or missing password reset code. Please contact support.',
        }),
      ];
    }

    return response;
  }

  public resetUserPasswordInApp = async (
    request: pb.ResetUserPasswordInAppRequest,
  ): Promise<pb.ResetUserPasswordInAppResponse> => {
    const span = tracer.startSpan('resetUserPassword', request.spanContext);
    const response: pb.ResetUserPasswordResponseInApp = pb.ResetUserPasswordInAppResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    });

    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `resetUserPasswordInApp
         - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { oldPassword, newPassword, userId } = params.value;

    // find user
    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
      if (!user) throw new Error('Unable to reset password');
    } catch (e) {
      this.logger.error(`resetUserPasswordInApp - error: ${e.message}`);
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

    // check if old password is valid
    let isValidPassword: boolean;
    try {
      isValidPassword = await this.storage.comparePasswordHash(
        span,
        oldPassword,
        user.passwordHash,
      );
      if (!isValidPassword) throw new Error('Old password is incorrect');
    } catch (e) {
      this.logger.error(`resetUserPasswordInApp - error: ${e.message}`);
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

    // set new password
    try {
      user = await this.storage.setUserPassword(span, userId, newPassword);
      response.status = pb.StatusCode.OK;
    } catch (e) {
      this.logger.error(`resetUserPasswordInApp - error: ${e.message}`);
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

    return response;
  }

  public setUserPassword = async (
    request: pb.SetPasswordUserRequest,
  ): Promise<pb.SetPasswordUserResponse> => {
    const span = tracer.startSpan('resetUserPassword', request.spanContext);
    const response: pb.SetUserPasswordResponse = pb.SetUserPasswordResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      password: Joi.string().required(),
    });

    const params = schema.validate(request);
    const { userId, password } = params.value;

    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
      if (user.passwordHash) {
        throw new Error('You already have a password.');
      }
    } catch (e) {
      response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      user = await this.storage.setUserPassword(span, userId, password);
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`setUserPassword - error: ${e.message}`);
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

    return response;
  }

  /**
   * Updates user phoneNumberWaitingForVerify, not phoneNumber
   */
  public updateUserPhoneNumber = async (
    request: pb.UpdateUserPhoneNumberRequest,
  ): Promise<pb.UpdateUserPhoneNumberResponse> => {
    const span = tracer.startSpan('updateUserPhoneNumber', request.spanContext);
    const response: pb.UpdateUserPhoneNumberResponse = pb.UpdateUserPhoneNumberResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      newPhoneNumber: Joi.string().required(),
    });

    const params = schema.validate(request);
    const { userId, newPhoneNumber } = params.value;

    let user: IUser;
    let existingUser: IUser;

    // Check to make sure new phone number doesn't belong to an account already
    try {
      existingUser = await this.storage.findByPhoneNumber(span, newPhoneNumber);
      if (existingUser) {
        throw new Error('An account with this phone number already exists.');
      }
    } catch (e) {
      this.logger.error(`updateUserPhoneNumber - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      user = await this.storage.updateUserPhoneNumber(
        span,
        userId,
        newPhoneNumber,
      );
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`updateUserPhoneNumber - error: ${e.message}`);
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

    return response;
  }

  /**
   * Updates user emailWaitingForVerify, not email
   */
  public updateUserEmail = async (
    request: pb.UpdateUserEmailRequest,
  ): Promise<pb.UpdateUserEmailResponse> => {
    const span = tracer.startSpan('updateUserEmail', request.spanContext);
    const response: pb.UpdateUserEmailResponse = pb.UpdateUserEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      newEmail: Joi.string().required(),
    });

    const params = schema.validate(request);
    const { userId, newEmail } = params.value;

    let user: IUser;
    let existingUser: IUser;

    // Check to make sure new email doesn't belong to an account already
    // including the current user account
    try {
      existingUser = await this.storage.findByEmail(span, newEmail);
      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }
    } catch (e) {
      this.logger.error(`updateUserEmail - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      user = await this.storage.updateUserEmail(span, userId, newEmail);
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`updateUserEmail - error: ${e.message}`);
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

    return response;
  }

  public updateBasicUserInfo = async (
    request: pb.UpdateBasicUserInfoRequest,
  ): Promise<pb.UpdateBasicUserInfoResponse> => {
    const span = tracer.startSpan('updateBasicUserInfo', request.spanContext);
    const response: pb.UpdateBasicUserInfoResponse = pb.UpdateBasicUserInfoResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      imageUrl: Joi.string().optional().allow(''),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `updateBasicUserInfo - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { firstName, lastName, imageUrl, userId } = params.value;

    let user: IUser;

    try {
      user = await this.storage.updateUserName(span, userId, firstName, lastName);
    } catch (e) {
      this.logger.error(`updateBasicUserInfo - error: ${e.message}`);
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

    /**
     * Update user profile with new info
     * also, UserProfile should be deleted and we should just use the User model imo
     */
    const updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId,
      userProfile: {
        firstName,
        lastName,
        imageUrl,
      },
    });

    try {
      await this.proxy.userProfileService.updateUserProfile(
        updateUserProfileRequest,
      );
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
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

    response.status = pb.StatusCode.OK;
    response.user = this.toPb(user);
    return response;
  }


  /**
   * TODO
   * The Secondary email functions are not yet complete and need to be finished
   * and tested before actual use. Do not use.
   */
  public addSecondaryEmail = async (
    request: pb.AddSecondaryEmailRequest,
  ): Promise<pb.AddSecondaryEmailResponse> => {
    const span = tracer.startSpan('AddSecondaryEmail', request.spanContext);
    const response: pb.AddSecondaryEmailResponse = pb.AddSecondaryEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      email: Joi.string().required(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `AddSecondaryEmail - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { email, userId } = params.value;
    let user: IUser;
    let existingUser: IUser;

    try {
      existingUser = await this.storage.findByEmail(span, email);
      if (existingUser) {
        throw new Error('An account with this email already exists.');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      user = await this.storage.findById(span, userId);
      if (!user) {
        throw new Error('Cannot add new email, please contact support');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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

    try {
      if (user.secondaryEmails && user.secondaryEmails.length >= 3) {
        throw new Error('You cannot add more than 3 secondary emails');
      } else {
        user = await this.storage.updateSecondaryEmailList(span, userId, user.secondaryEmails.concat([]));
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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

    response.status = pb.StatusCode.OK;
    response.user = this.toPb(user);
    return response;
  }

  public updateSecondaryEmail = async (
    request: pb.UpdateSecondaryEmailRequest,
  ): Promise<pb.UpdateSecondaryEmailResponse> => {
    const span = tracer.startSpan('UpdateSecondaryEmail', request.spanContext);
    const response: pb.UpdateSecondaryEmailResponse = pb.UpdateSecondaryEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      email: Joi.string().required(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `UpdateSecondaryEmail - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    // const { email, userId } = params.value;
    let user: IUser;

    response.status = pb.StatusCode.OK;
    response.user = this.toPb(user);
    return response;
  }

  public deleteSecondaryEmail = async (
    request: pb.DeleteSecondaryEmailRequest,
  ): Promise<pb.DeleteSecondaryEmailResponse> => {
    const span = tracer.startSpan('DeleteSecondaryEmail', request.spanContext);
    const response: pb.DeleteSecondaryEmailResponse = pb.DeleteSecondaryEmailResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      email: Joi.string().required(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `DeleteSecondaryEmail - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { email, userId } = params.value;
    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
      if (!user) {
        throw new Error('Cannot add new email, please contact support');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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
    let emails = [];
    for (let val of user.secondaryEmails) {
      if (val != email)
        emails.push(val)
    }
    try {
      user = await this.storage.updateSecondaryEmailList(span, userId, emails);
      if (!user) {
        throw new Error('Cannot add new email, please contact support');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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
    response.status = pb.StatusCode.OK;
    response.user = this.toPb(user);
    return response;
  }

  public makeSecondaryEmailPrimary = async (
    request: pb.MakeSecondaryEmailPrimaryRequest,
  ): Promise<pb.MakeSecondaryEmailPrimaryResponse> => {
    const span = tracer.startSpan('MakeSecondaryEmailPrimary', request.spanContext);
    const response: pb.MakeSecondaryEmailPrimaryResponse = pb.MakeSecondaryEmailPrimaryResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      email: Joi.string().required(),
    });
    const params = schema.validate(request);
    if (params.error) {
      this.logger.error(
        `MakeSecondaryEmailPrimary - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { email, userId } = params.value;
    let user: IUser;
    try {
      user = await this.storage.findById(span, userId);
      if (!user) {
        throw new Error('Cannot add new email, please contact support');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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
    let emails = [user.email];
    for (let val of user.secondaryEmails) {
      if (val != email)
        emails.push(val)
    }
    // console.log(emails,'............')
    try {
      user = await this.storage.makeSecondaryEmailPrimary(span, userId, emails, email);
      if (!user) {
        throw new Error('Cannot add new email, please contact support');
      }
    } catch (e) {
      this.logger.error(`addSecondaryEmail - error: ${e.message}`);
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

    /**
     * Find the user profile to get the stripeCustomerId
     */
    const findUserProfileRequest = pb.FindUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId,
    });

    let findUserProfileResponse: pb.FindUserProfileResponse;

    try {
      findUserProfileResponse = await this.proxy.userProfileService.findUserProfile(findUserProfileRequest);

      // if (!findUserProfileResponse || !findUserProfileRequest.userProfile) {
      //   throw new Error('There was an error retrieving the user profile.');
      // }

    } catch (e) {
      this.logger.error(`createStripeSource - error: ${e.message}`);
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

    const { userProfile: { stripeCustomerId } } = findUserProfileResponse;

    const updateCustomerRequest = new pb.UpdateStripeCustomerRequest({
      spanContext: span.context().toString(),
      userId: user?._id.toString(),
      stripeCustomerId
    });

    let updateCustomerResponse: pb.UpdateStripeCustomerResponse;

    try {
      updateCustomerResponse = await this.proxy.stripeService.updateStripeCustomer(
        updateCustomerRequest,
      );

      if (updateCustomerResponse.status !== pb.StatusCode.OK) {
        throw new Error(
          'There was an error creating the stripe customer. Please contact support.'
        );
      }
    } catch (e) {
      this.logger.error(`createUser - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ].concat(updateCustomerResponse.errors);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }
    response.status = pb.StatusCode.OK;
    response.user = this.toPb(user);
    return response;
  }

  public updateUserPreferredLogin = async (
    request: pb.UpdateUserPreferredLoginRequest,
  ): Promise<pb.UpdateUserPreferredLoginResponse> => {
    const span = tracer.startSpan(
      'updateUserPreferredLogin',
      request.spanContext,
    );
    const response: pb.UpdateUserPreferredLoginResponse = pb.UpdateUserPreferredLoginResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      userId: Joi.string().required(),
      preferredLogin: Joi.string().required(),
    });

    const params = schema.validate(request);
    const { userId, preferredLogin } = params.value;

    let user: IUser;

    try {
      user = await this.storage.updateUserPreferredLogin(
        span,
        userId,
        preferredLogin,
      );
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`updateUserPreferredLogin - error: ${e.message}`);
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

    return response;
  }

  // update userInfo
  public updateUserInfo = async (
    request: pb.UpdateUserInfoRequest,
  ): Promise<pb.UpdateUserInfoResponse> => {
    const span = tracer.startSpan('updateUserInfo', request.spanContext);
    const response: pb.UpdateUserInfoResponse = pb.UpdateUserInfoResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string(),
      _id: Joi.string().required(),
      phoneNumber: Joi.string().optional(),
      email: Joi.string().email().required(),
    });

    const params = schema.validate(request);
    const { _id, phoneNumber, email } = params.value;

    let user: IUser;
    let existingUser;

    // Check to make sure new phone number and Email doesn't belong to an account already
    try {

      user = await this.storage.findById(span, _id);
      existingUser = await this.storage.findEmailPhoneNumber(span, _id, email, phoneNumber);

      // email and phone number alredy exists on existing user
      if (existingUser.emailExist && existingUser.phoneNumberExist) {
        throw new Error('An account with this email and phone number already exists.');
      }
      if (existingUser.emailExist) {
        throw new Error('An account with this email already exists.');
      }
      if (existingUser.phoneNumberExist) {
        throw new Error('An account with this phone number already exists.');
      }
      if (existingUser.emailSecExist) {
        throw new Error('An account with this email already exists.');
      }


    } catch (e) {
      this.logger.error(`updateUserInfo - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
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


    try {
      user = await this.storage.updateUserInfo(
        span,
        _id,
        phoneNumber,
        email,
      );
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`updateUserInfo - error: ${e.message}`);
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

    const updateUserProfileRequest = pb.UpdateUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId: user?._id,
      userProfile: {
        email,
        phoneNumber
      }
    });
    try {
      await this.proxy.userProfileService.updateUserProfile(
        updateUserProfileRequest,
      );
    } catch (e) {
      this.logger.error(`updateUserInfo - error: ${e.message}`);
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
    return response;
  }



  public findUserById = async (
    request: pb.FindUserByIdRequest,
  ): Promise<pb.FindUserByIdResponse> => {
    const span = tracer.startSpan('findUserById', request.spanContext);
    const response: pb.FindUserByIdResponse = pb.FindUserByIdResponse.create();

    let user: IUser;
    try {
      user = await this.storage.findById(span, request.userId);
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`findUserById - error: ${e.message}`);
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
    }

    span.finish();
    return response;
  }

  public findUserByEmail = async (
    request: pb.FindUserByEmailRequest,
  ): Promise<pb.FindUserByEmailResponse> => {
    const span = tracer.startSpan('findUserByEmail', request.spanContext);
    const response: pb.FindUserByEmailResponse = pb.FindUserByEmailResponse.create();

    let user: IUser;
    try {
      user = await this.storage.findByEmail(span, request.email, request.phoneNumber);
      let userDetail = this.toPb(user);
      if (request.promoCode || request.eventId || request.seasonId) {
        let promo = await this.proxy.orderService.getPromoUsed({
          span,
          promoCode: request.promoCode,
          eventId: request.eventId,
          userId: userDetail?._id,
          seasonId: request.seasonId
        });
        response.promoLeft = promo.count
      }
      response.status = pb.StatusCode.OK;
      response.user = userDetail;
    } catch (e) {
      this.logger.error(`findUserByEmail - error: ${e.message}`);
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
    }

    span.finish();
    return response;
  }

  public findUserByPhoneNumber = async (
    request: pb.FindUserByPhoneNumberRequest,
  ): Promise<pb.FindUserByPhoneNumberResponse> => {
    const span = tracer.startSpan('findUserByPhonNumber', request.spanContext);
    const response: pb.FindUserByPhoneNumber = pb.FindUserByPhoneNumber.create();

    let user: IUser;
    try {
      user = await this.storage.findByPhoneNumber(span, request.phoneNumber);
      response.status = pb.StatusCode.OK;
      response.user = this.toPb(user);
    } catch (e) {
      this.logger.error(`findUserByPhoneNumber - error: ${e.message}`);
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
    }

    span.finish();
    return response;
  }

  public sendUserPhoneAuthentication = async (
    request: pb.UserPhoneAuthenticationRequest,
  ): Promise<pb.UserPhoneAuthenticationResponse> => {
    const span = tracer.startSpan(
      'sendUserPhoneAuthentication',
      request.spanContext,
    );
    const response: pb.UserPhoneAuthenticationResponse = pb.UserPhoneAuthenticationResponse.create();

    const schema = Joi.object()
      .keys({
        spanContext: Joi.string(),
        email: Joi.string(),
        phoneNumber: Joi.string(),
        isLogin: Joi.boolean().default(false)
      })
      .xor('email', 'phoneNumber');

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `sendUserPhoneAuthentication - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { email, phoneNumber, isLogin } = params.value;


    let user: IUser;

    if (phoneNumber) {
      try {
        user = await this.storage.findByPhoneNumber(span, phoneNumber);
        if (!user) {
          throw new Error('A user with this phone number does not exist.');
        }
      } catch (e) {
        this.logger.error(
          `sendUserPhoneAuthentication - error: ${JSON.stringify(e.message)}`,
        )
        response.status = pb.StatusCode.BAD_REQUEST;
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
    } else {
      try {
        user = await this.storage.findByEmail(span, email);
        if (!user) {
          throw new Error('A user with this email does not exist.');
        }
      } catch (e) {
        this.logger.error(
          `sendUserPhoneAuthentication - error: ${JSON.stringify(e.message)}`,
        );
        response.status = pb.StatusCode.BAD_REQUEST;
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

    if (user.authTimeOut > Time.now()) {
      const error = new Error(`Too many incorrect code attempts, try again at ${Time.format(user.authTimeOut, 'M/DD/YYYY h:mm:ssa')}`);
      this.logger.error(
        `sendUserPhoneAuthentication - error: ${JSON.stringify(error.message)}`,
      );
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: error.message,
      })];
      span.setTag('error', true);
      span.log({ errors: error.message });
      span.finish();
      return response;
    }

    const phoneVerifyCode: string = Random.generateOfLength(4).toString();

    try {
      await this.storage.savePhoneVerifyCode(span, user?._id, phoneVerifyCode);
      await this.storage.setAuthAttempts(span, user?._id, 0);
    } catch (e) {
      this.logger.error(
        `sendUserPhoneAuthentication - error: ${JSON.stringify(e.message)}`,
      );
      response.status = pb.StatusCode.BAD_REQUEST;
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

    if (isLogin) {


      const verifyRequest = pb.SendPlivoSMSRequest.create({
        spanContext: span.context().toString(),
        phoneNumber: user.phoneNumber,
        message: `Your Sellout Authentication Code is ${phoneVerifyCode}`,
      });

      try {
        const response = await this.proxy.plivoService.sendPlivoSMS(verifyRequest);

        if (response.status !== pb.StatusCode.OK) {
          throw new Error('Failed to send authentication text message.');
        }

      } catch (e) {
        this.logger.error(
          `sendUserPhoneAuthentication - error: ${JSON.stringify(e.message)}`,
        );
        // response.status = pb.StatusCode.BAD_REQUEST;
        // response.errors = [pb.Error.create({
        //   key: 'Error',
        //   message: e.message,
        // })];
        // span.setTag('error', true);
        // span.log({ errors: e.message });
        // span.finish();
        // return response;
      }
    } else {

      const userAuthenticationCodeEmail = new pb.QueueUserAuthenticationCodeEmailRequest.create(
        {
          spanContext: span.context().toString(),
          toAddress: email,
          authCode: `${phoneVerifyCode}`,
        },
      );

      try {
        await this.proxy.emailService.queueUserAuthenticationCodeEmail(
          userAuthenticationCodeEmail,
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    response.status = pb.StatusCode.OK;
    span.finish();
    return response;
  }

  public verifyUserPhoneAuthentication = async (
    request: pb.VerifyUserPhoneAuthenticationRequest,
  ): Promise<pb.VerifyUserPhoneAuthenticationResponse> => {
    const span = tracer.startSpan(
      'verifyUserPhoneAuthentication',
      request.spanContext,
    );
    const response: pb.VerifyUserPhoneAuthenticationResponse = pb.VerifyUserPhoneAuthenticationResponse.create();

    const schema = Joi.object()
      .keys({
        spanContext: Joi.string(),
        email: Joi.string(),
        phoneNumber: Joi.string(),
        phoneVerificationToken: Joi.string().required(),
      })
      .xor('email', 'phoneNumber');

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `verifyUserPhoneAuthentication - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { email, phoneNumber, phoneVerificationToken } = params.value;


    let user: IUser;

    if (phoneNumber) {
      try {
        user = await this.storage.findByPhoneNumber(span, phoneNumber);
      } catch (e) {
        response.status = pb.StatusCode.BAD_REQUEST;
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
    } else {
      try {
        user = await this.storage.findByEmail(span, email);
      } catch (e) {
        response.status = pb.StatusCode.BAD_REQUEST;
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

    try {
      if (user.authTimeOut > Time.now()) {
        throw new Error(`Too many incorrect code attempts, try again at ${Time.format(user.authTimeOut, 'M/DD/YYYY h:mm:ssa')}`);
      }
    } catch (e) {
      this.logger.error(`verifyUserEmail - error: ${e.message}`);
      response.status = pb.StatusCode.BAD_REQUEST;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    // check if auth code is valid and add to authAttempts if failure, set timeout if attempts is greater than 10
    if (!(phoneVerificationToken === user.phoneVerifyCode)) {
      try {
        await this.storage.setAuthAttempts(span, user?._id, (user.authAttempts += 1));
        if (user.authAttempts >= 10) {
          // await this.storage.setAuthTimeOut(span, user._id, (Time.now() + ((Time.MINUTE / 1000) * 10)));
          await this.storage.setAuthTimeOut(span, user?._id, (Time.now() + (Time.MINUTE * 15)));
          await this.storage.savePhoneVerifyCode(span, user?._id, null);
        }
        throw new Error('The code you entered is incorrect.');
      } catch (e) {
        this.logger.error(`authTimeOut - error: ${e.message}`);
        response.status = pb.StatusCode.BAD_REQUEST;
        response.errors = [pb.Error.create({
          key: 'Error',
          message: e.message,
        })];
        span.setTag('error', true);
        span.log({ errors: e.message });

        span.finish();
        return response;
      }
    }

    // at this point, user has entered the correct code

    // delete phone code from database

    try {
      await this.storage.savePhoneVerifyCode(span, user?._id, null);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    // reset login attempts if any
    try {
      await this.storage.setAuthAttempts(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    // reset timeout if not null
    try {
      await this.storage.setAuthTimeOut(span, user?._id, 0);
    } catch (e) {
      this.logger.error(`savePhoneVerifyCode - error: ${e.message}`);
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

    if (!user.phoneNumberVerifiedAt) {
      try {
        await this.storage.verifyPhoneNumber(span, user?._id);
      } catch (e) {
        span.setTag('error', true);
        span.log({ errors: e.message });
      }
    }

    response.token = this.generateJWT(user);
    response.user = this.toPb(user);
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }

  public deleteUnverifiedUser = async (
    request: pb.DeleteUnverifiedUserRequest,
  ): Promise<pb.DeleteUnverifiedUserResponse> => {
    const span = tracer.startSpan('deleteUnverifiedUser', request.spanContext);
    const response: pb.DeleteUnverifiedUserResponse = pb.DeleteUnverifiedUserResponse.create();

    const schema = Joi.object()
      .keys({
        spanContext: Joi.string(),
        userId: Joi.string(),
        email: Joi.string(),
        phoneNumber: Joi.string(),
      })
      .xor('userId', 'email', 'phoneNumber');

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(
        `verifyUserPhoneAuthentication - error: ${JSON.stringify(params.error)}`,
      );
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { userId, email, phoneNumber } = params.value;


    let user: IUser;
    try {
      if (userId) {
        user = await this.storage.findById(span, userId);
      } else if (email) {
        user = await this.storage.findByEmail(span, email);
      } else if (phoneNumber) {
        user = await this.storage.findByPhoneNumber(span, phoneNumber);
      } else {
        throw new Error('Invalid request. Please contact support.');
      }

      if (user.emailVerifiedAt || user.phoneNumberVerifiedAt) {
        throw new Error('Invalid request. Please contact support.');
      }
    } catch (e) {
      this.logger.error(`deleteUnverifiedUser - error: ${e.message}`);
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

    try {
      await this.storage.deleteUser(span, userId, email, phoneNumber);
    } catch (e) {
      this.logger.error(`deleteUnverifiedUser - error: ${e.message}`);
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

    // delete the user profile as well
    const deleteProfileRequest = pb.DeleteUnverifiedUserProfileRequest.create({
      spanContext: span.context().toString(),
      userId: user?._id.toString(),
    });

    try {
      await this.proxy.userProfileService.deleteUnverifiedUserProfile(
        deleteProfileRequest,
      );
    } catch (e) {
      this.logger.error(`deleteUnverifiedUser - error: ${e.message}`);
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

    response.deleted = true;
    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }
}
