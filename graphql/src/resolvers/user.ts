import * as pb from '@sellout/models/.dist/sellout-proto';
import { ApolloError, AuthenticationError, errorSpan, UserInputError } from '../graphqlError';
import { IServiceProxy } from '../proxyProvider';
import { roles, hasPermission } from './../permissions';


export const resolvers = {
  Query: {
    async user(parent, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('User.user', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (parent && !parent.userId) return null;

      const request = new pb.FindUserByIdRequest.create({
        spanContext: spanContext,
        userId: parent ? parent.userId : userId,
      });

      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.userService.findUserById(request);

        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return response.user
    },
    async userExists(_, args, context) {
      let { req, proxy } = context;
      let { email, phoneNumber, promoCode, eventId, seasonId } = args;
      const span = req.tracer.startSpan('User.userExists', req.span);
      const spanContext = span.context().toString();
      email = email ? email.toLowerCase() : undefined;
      // HOSTNAME
      const request = new pb.FindUserByEmailRequest.create({
        spanContext: spanContext,
        email,
        phoneNumber,
        promoCode,
        eventId,
        seasonId
      });
      proxy = <IServiceProxy>proxy;
      let response;
      try {
        response = await proxy.userService.findUserByEmail(request);
        if (response.status !== pb.StatusCode.OK) {
          throw new ApolloError(response.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return {
        userId: response.user._id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        hasPassword: !!response.user.passwordHash,
        preferredLogin: response.user.preferredLogin,
        phoneNumber: response.user.phoneNumber,
        phoneNumberVerifiedAt: response.user.phoneNumberVerifiedAt,
        promoAvailable: (response.promoLeft && response.promoLeft > 0) || (!promoCode || promoCode == '') ? true : false
      };
    },
  },
  Mutation: {
    async register(_, args, context) {
      let { req, proxy } = context;
      let { user } = args;
      const span = req.tracer.startSpan('User.registerUser', req.span);
      const spanContext = span.context().toString();
      user.email = user.email.toLowerCase();

      // HOSTNAME
      const createRequest = pb.CreateUserRequest.create({
        spanContext,
        user: Object.assign(new pb.User(), user),

      });

      proxy = <IServiceProxy>proxy;
      let createResponse: pb.CreateUserResponse;
      try {
        createResponse = await proxy.userService.createUser(createRequest);

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

      // Attach the user to the req object
      // so that downstream graphql resolvers
      // have auth information
      req.user = {
        userId: createResponse.user._id,
      };

      span.finish();
      return {
        emailVerified: false,
        registered: true,
        user: createResponse.user,
      };
    },
    async login(_, args, context) {
      let { req, proxy } = context;
      let { email, password } = args;
      const span = req.tracer.startSpan('User.loginUser', req.span);
      const spanContext = span.context().toString();
      email = email.toLowerCase();

      // HOSTNAME

      const authRequest = pb.AuthUserRequest.create({
        spanContext,
        email,
        password,
      });

      proxy = <IServiceProxy>proxy;
      let authResponse;
      try {
        authResponse = await proxy.userService.authUser(authRequest);

        if (authResponse.status === pb.StatusCode.UNAUTHORIZED) {
          throw new AuthenticationError(authResponse.errors[0].message);
        }

        if (authResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(authResponse.errors[0].message, pb.StatusCode.BAD_REQUEST);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      // Append user info to request to use in downstream resolvers
      req.user = {
        userId: authResponse.user._id ? authResponse.user._id.toString() : null,
        userEmail: authResponse.user.email ? authResponse.user.email.toString() : null,
        orgId: authResponse.user.orgId ? authResponse.user.orgId.toString() : null,
        orgRole: authResponse.user.orgRole ? authResponse.user.orgRole.toString() : null
      };

      span.finish();
      return {
        user: authResponse.user,
        token: authResponse.token,
      };
    },
    async setUserOrgContextId(parent, args, context) {
      let { req, proxy } = context;
      let { orgId } = args;
      const span = req.tracer.startSpan('User.setUserOrgContextId', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (parent && parent.orgId) {
        orgId = parent.orgId;
      }

      const setOrgRequest = pb.SetUserOrgContextIdRequest.create({
        spanContext,
        userId,
        orgId,
      });

      proxy = <IServiceProxy>proxy;
      let setOrgResponse: pb.SetUserOrgContextIdResponse;
      try {
        setOrgResponse = await proxy.userService.setUserOrgContextId(setOrgRequest);

        if (setOrgResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: setOrgResponse.errors.map(e => e.key)
          });
        }

        if (setOrgResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(setOrgResponse.errors[0].message, setOrgResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return {
        user: setOrgResponse.user,
        token: setOrgResponse.token,
      };
    },
    async updateUserPhoneNumber(_, args, context) {
      let { req, proxy } = context;
      let { newPhoneNumber } = args;
      const span = req.tracer.startSpan('User.updateUserPhoneNumber', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const updatePhoneNumberRequest = pb.UpdateUserPhoneNumberRequest.create({
        spanContext,
        userId,
        newPhoneNumber,
      });

      proxy = <IServiceProxy>proxy;
      let updatePhoneNumberResponse: pb.UpdateUserPhoneNumberResponse;
      try {
        updatePhoneNumberResponse = await proxy.userService.updateUserPhoneNumber(updatePhoneNumberRequest);

        if (updatePhoneNumberResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updatePhoneNumberResponse.errors.map(e => e.key)
          });
        }

        if (updatePhoneNumberResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updatePhoneNumberResponse.errors[0].message, updatePhoneNumberResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updatePhoneNumberResponse.user;
    },
    async updateUserEmail(_, args, context) {
      let { req, proxy } = context;
      let { newEmail } = args;
      const span = req.tracer.startSpan('User.updateUserEmail', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      newEmail = newEmail.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const updateEmailRequest = pb.UpdateUserEmailRequest.create({
        spanContext,
        userId,
        newEmail,
      });

      proxy = <IServiceProxy>proxy;
      let updateEmailResponse: pb.UpdateUserEmailResponse;
      try {
        updateEmailResponse = await proxy.userService.updateUserEmail(updateEmailRequest);

        if (updateEmailResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updateEmailResponse.errors.map(e => e.key)
          });
        }

        if (updateEmailResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updateEmailResponse.errors[0].message, updateEmailResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updateEmailResponse.user;
    },
    async addSecondaryEmail(_, args, context) {
      let { req, proxy } = context;
      let { email } = args;
      const span = req.tracer.startSpan('User.addSecondaryEmail', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      email = email.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = pb.AddSecondaryEmailRequest.create({
        spanContext,
        userId,
        email,
      });

      proxy = <IServiceProxy>proxy;
      let resp: pb.AddSecondaryEmailResponse;
      try {
        resp = await proxy.userService.addSecondaryEmail(request);

        if (resp.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: resp.errors.map(e => e.key)
          });
        }

        if (resp.status !== pb.StatusCode.OK) {
          throw new ApolloError(resp.errors[0].message, resp.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return resp.user;
    },
    async updateSecondaryEmail(_, args, context) {
      let { req, proxy } = context;
      let { email } = args;
      const span = req.tracer.startSpan('User.updateSecondaryEmail', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      email = email.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = pb.UpdateSecondaryEmailRequest.create({
        spanContext,
        userId,
        email,
      });

      proxy = <IServiceProxy>proxy;
      let resp: pb.UpdateSecondaryEmailResponse;
      try {
        resp = await proxy.userService.updateSecondaryEmail(request);

        if (resp.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: resp.errors.map(e => e.key)
          });
        }

        if (resp.status !== pb.StatusCode.OK) {
          throw new ApolloError(resp.errors[0].message, resp.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return resp.user;
    },
    async deleteSecondaryEmail(_, args, context) {
      let { req, proxy } = context;
      let { email } = args;
      const span = req.tracer.startSpan('User.deleteSecondaryEmail', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      email = email.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = pb.DeleteSecondaryEmailRequest.create({
        spanContext,
        userId,
        email,
      });

      proxy = <IServiceProxy>proxy;
      let resp: pb.DeleteSecondaryEmailResponse;
      try {
        resp = await proxy.userService.deleteSecondaryEmail(request);

        if (resp.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: resp.errors.map(e => e.key)
          });
        }

        if (resp.status !== pb.StatusCode.OK) {
          throw new ApolloError(resp.errors[0].message, resp.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return resp.user;
    },
    async makeSecondaryEmailPrimary(_, args, context) {
      let { req, proxy } = context;
      let { email } = args;
      const span = req.tracer.startSpan('User.makeSecondaryEmailPrimary', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;
      email = email.toLowerCase();

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const request = pb.MakeSecondaryEmailPrimaryRequest.create({
        spanContext,
        userId,
        email,
      });

      proxy = <IServiceProxy>proxy;
      let resp: pb.MakeSecondaryEmailPrimaryResponse;
      try {
        resp = await proxy.userService.makeSecondaryEmailPrimary(request);

        if (resp.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: resp.errors.map(e => e.key)
          });
        }

        if (resp.status !== pb.StatusCode.OK) {
          throw new ApolloError(resp.errors[0].message, resp.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return resp.user;
    },
    async updateBasicUserInfo(_, args, context) {
      let { req, proxy } = context;
      let { firstName, lastName, imageUrl } = args;
      const span = req.tracer.startSpan('User.updateBasicUserInfo', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const updateReq = pb.UpdateBasicUserInfoRequest.create({
        spanContext,
        userId,
        firstName,
        lastName,
        imageUrl,
      });

      proxy = <IServiceProxy>proxy;
      let updateBasicUserInfoResponse: pb.UpdateBasicUserInfoResponse;
      try {
        updateBasicUserInfoResponse = await proxy.userService.updateBasicUserInfo(updateReq);

        if (updateBasicUserInfoResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updateBasicUserInfoResponse.errors.map(e => e.key)
          });
        }

        if (updateBasicUserInfoResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updateBasicUserInfoResponse.errors[0].message, updateBasicUserInfoResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updateBasicUserInfoResponse.user;
    },
    async updateUserPreferredLogin(_, args, context) {
      let { req, proxy } = context;
      let { preferredLogin } = args;
      const span = req.tracer.startSpan('User.updateUserPreferredLogin', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const updatePreferredLoginRequest = pb.UpdateUserPreferredLoginRequest.create({
        spanContext,
        userId,
        preferredLogin,
      });

      proxy = <IServiceProxy>proxy;
      let updatePreferredLoginResponse: pb.UpdateUserPreferredLoginResponse;
      try {
        updatePreferredLoginResponse = await proxy.userService.updateUserPreferredLogin(updatePreferredLoginRequest);

        if (updatePreferredLoginResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updatePreferredLoginResponse.errors.map(e => e.key)
          });
        }

        if (updatePreferredLoginResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updatePreferredLoginResponse.errors[0].message, updatePreferredLoginResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updatePreferredLoginResponse.user;
    },
    async sendUserPhoneVerification(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('User.sendUserPhoneVerification', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const verifyRequest = pb.SendUserPhoneVerificationRequest.create({
        spanContext,
        userId,
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.SendUserPhoneVerificationResponse;
      try {
        verifyResponse = await proxy.userService.sendUserPhoneVerification(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();

      return {
        sent: true,
      };
    },
    async sendUserEmailVerification(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('User.sendUserEmailVerification', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId && !args.email) {
        throw new AuthenticationError("Authentication Required.");
      }

      const verifyRequest = pb.SendUserEmailVerificationRequest.create({
        spanContext,
        userId,
        email: args.email
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.SendUserEmailVerificationResponse;
      try {
        verifyResponse = await proxy.userService.sendUserEmailVerification(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();

      return {
        sent: true,
      };
    },
    async verifyUserPhoneNumber(_, args, context) {
      let { req, proxy } = context;
      const { phoneVerificationToken } = args;
      const span = req.tracer.startSpan('User.verifyUserPhoneNumber', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const verifyRequest = pb.VerifyUserPhoneNumberRequest.create({
        spanContext,
        userId,
        phoneVerificationToken,
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.VerifyUserPhoneNumberResponse;
      try {
        verifyResponse = await proxy.userService.verifyUserPhoneNumber(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return {
        phoneVerified: true,
      };
    },
    async verifyUserEmail(_, args, context) {
      let { req, proxy } = context;
      const { emailVerificationToken } = args;
      const span = req.tracer.startSpan('User.verifyUserEmail', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      const verifyRequest = pb.VerifyUserEmailRequest.create({
        spanContext,
        emailVerificationToken,
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.VerifyUserEmailResponse;
      try {
        verifyResponse = await proxy.userService.verifyUserEmail(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return {
        emailVerified: true,
        registered: true
      };
    },
    async forgotUserPassword(_, args, context) {
      let { req, proxy } = context;
      const { email } = args;
      const span = req.tracer.startSpan('User.forgotUserPassword', req.span);
      const spanContext = span.context().toString();


      // HOSTNAME

      const forgotRequest = pb.ForgotUserPasswordRequest.create({
        spanContext,
        email,
      });

      proxy = <IServiceProxy>proxy;
      let forgotResponse;
      try {
        forgotResponse = await proxy.userService.forgotUserPassword(forgotRequest);

        if (forgotResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(forgotResponse.errors[0].message, forgotResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return true;
    },
    async resetUserPassword(_, args, context) {
      let { req, proxy } = context;
      const { forgotPasswordCode, password } = args;
      const span = req.tracer.startSpan('User.resetUserPassword', req.span);
      const spanContext = span.context().toString();

      // HOSTNAME

      const resetRequest = pb.ResetUserPasswordRequest.create({
        spanContext,
        forgotPasswordCode,
        password,
      });

      proxy = <IServiceProxy>proxy;
      let resetResponse;
      try {
        resetResponse = await proxy.userService.resetUserPassword(resetRequest);

        if (resetResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(resetResponse.errors[0].message, resetResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return true;
    },
    async resetUserPasswordInApp(_, args, context) {
      let { req, proxy } = context;
      const { userId } = req.user;
      const { oldPassword, newPassword } = args;
      const span = req.tracer.startSpan('User.resetUserPasswordInApp', req.span);
      const spanContext = span.context().toString();

      const resetRequest = pb.ResetUserPasswordRequest.create({
        spanContext,
        userId,
        oldPassword,
        newPassword,
      });

      proxy = <IServiceProxy>proxy;
      let resetResponse;
      try {
        resetResponse = await proxy.userService.resetUserPasswordInApp(resetRequest);

        if (resetResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(resetResponse.errors[0].message, resetResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return true;
    },
    async setUserPassword(_, args, context) {
      let { req, proxy } = context;
      const { password } = args;
      const span = req.tracer.startSpan('User.setUserPassword', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const setRequest = pb.SetUserPasswordRequest.create({
        spanContext,
        userId,
        password,
      });

      proxy = <IServiceProxy>proxy;
      let setResponse;
      try {
        setResponse = await proxy.userService.setUserPassword(setRequest);

        if (setResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(setResponse.errors[0].message, setResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return setResponse.user;
    },
    async sendUserPhoneAuthentication(_, args, context) {
      let { req, proxy } = context;
      let { email, phoneNumber, isLogin } = args;
      email = email.toLowerCase();
      const span = req.tracer.startSpan('User.sendUserPhoneAuthentication', req.span);
      const spanContext = span.context().toString();

      const verifyRequest = pb.UserPhoneAuthenticationRequest.create({
        spanContext,
        email,
        phoneNumber,
        isLogin
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.UserPhoneAuthenticationResqponse;
      try {
        verifyResponse = await proxy.userService.sendUserPhoneAuthentication(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return true;
    },
    async verifyUserPhoneAuthentication(_, args, context) {
      let { req, proxy } = context;
      let { email, phoneNumber, phoneVerificationToken } = args;
      email = email.toLowerCase();
      const span = req.tracer.startSpan('User.verifyUserPhoneAuthentication', req.span);
      const spanContext = span.context().toString();

      const verifyRequest = pb.VerifyUserPhoneAuthenticationRequest.create({
        spanContext,
        email,
        phoneNumber,
        phoneVerificationToken,
      });

      proxy = <IServiceProxy>proxy;
      let verifyResponse: pb.VerifyUserPhoneAuthenticationResponse;
      try {
        verifyResponse = await proxy.userService.verifyUserPhoneAuthentication(verifyRequest);

        if (verifyResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: verifyResponse.errors.map(e => e.key)
          });
        }

        if (verifyResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(verifyResponse.errors[0].message, verifyResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      // Append user info to request to use in downstream resolvers
      req.user = {
        userId: verifyResponse.user._id ? verifyResponse.user._id.toString() : null,
        userEmail: verifyResponse.user.email ? verifyResponse.user.email.toString() : null,
        orgId: verifyResponse.user.orgId ? verifyResponse.user.orgId.toString() : null,
        orgRole: verifyResponse.user.orgRole ? verifyResponse.user.orgRole.toString() : null
      };

      span.finish();

      return {
        user: verifyResponse.user,
        token: verifyResponse.token,
      };
    },
    async deleteUnverifiedUser(_, args, context) {
      let { req, proxy }: { req: any, proxy: IServiceProxy } = context;
      const { userId, email, phoneNumber } = args;
      const span = req.tracer.startSpan('User.deleteUnverifiedUser', req.span);
      const spanContext = span.context().toString();

      const request = pb.DeleteUnverifiedUserRequest.create({
        spanContext,
        userId,
        email,
        phoneNumber,
      });

      // proxy = <IServiceProxy>proxy;
      let response: pb.DeleteUnverifiedUserResponse;
      try {
        response = await proxy.userService.deleteUnverifiedUser(request);

        if (response.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: response.errors.map(e => e.key)
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

      return response.deleted;
    },

    // Admin Update Email and PhoneNumber
    async updateUserInfo(_, args, context) {
      let { req, proxy } = context;
      let { _id,email, phoneNumber } = args;
      const span = req.tracer.startSpan('User.updateUserInfo', req.span);
      const spanContext = span.context().toString();
      const { userId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      if (!await hasPermission(proxy, spanContext, req.user, roles.ADMIN)) {
        throw new AuthenticationError(
          'You do not have the required permission level to Change Email And phoneNumber.'
        );
      }

      const updateReq = pb.UpdateUserInfoRequest.create({
        spanContext,
        _id,
        email,
        phoneNumber,

      });

      proxy = <IServiceProxy>proxy;
      let updateUserInfoResponse: pb.UpdateUserInfoResponse;
      try {
        updateUserInfoResponse = await proxy.userService.updateUserInfo(updateReq);

        if (updateUserInfoResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: updateUserInfoResponse.errors.map(e => e.key)
          });
        }

        if (updateUserInfoResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(updateUserInfoResponse.errors[0].message, updateUserInfoResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return updateUserInfoResponse.user;
    },

  }
};
