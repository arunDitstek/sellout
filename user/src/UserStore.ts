import IUser from '@sellout/models/.dist/interfaces/IUser';
import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import Tracer from '@sellout/service/.dist/Tracer';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import Joi from '@hapi/joi';
import bcrypt from 'bcrypt';
import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('UserStore');

export default class UserStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private User;

  constructor(User) {
    this.User = User;
  }

  public async createUser(spanContext: string, attributes: IUser, accountExists: boolean): Promise<IUser> {
    const span = tracer.startSpan('createUser', spanContext);

    if (attributes.password) {
      try {
        attributes.passwordHash = await this.hashPassword(spanContext, attributes.password);
      } catch (e) {
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
      }

      // Begone fool!
      delete attributes.password;
    }

    const { phoneNumber } = attributes;

    let savedUser: IUser;

    if (accountExists) {
      try {

        // console.log(attributes, accountExists)
        savedUser = await this.User.findOneAndUpdate({ phoneNumber }, { $set: attributes }, { new: true });
      } catch (e) {
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
      }

    } else {
      const user = new this.User(attributes);

      try {
        savedUser = await user.save();
      } catch (e) {
        span.setTag('error', true);
        span.log({ errors: e.message });
        span.finish();
        return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
      }
    }

    span.finish();
    return savedUser;
  }
  public async saveEmailVerifyCode(spanContext: string, userId: string, emailVerifyCode: string): Promise<boolean> {
    const span = tracer.startSpan('saveEmailVerifyCode', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ _id: userId }, { $set: { emailVerifyCode } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async savePhoneVerifyCode(spanContext: string, userId: string, phoneVerifyCode: string): Promise<boolean> {
    const span = tracer.startSpan('savePhoneVerifyCode', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ _id: userId }, { $set: { phoneVerifyCode } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async setAuthAttempts(spanContext: string, userId: string, authAttempts: number): Promise<boolean> {
    const span = tracer.startSpan('savePhoneVerifyCode', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ _id: userId }, { $set: { authAttempts } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async setAuthTimeOut(spanContext: string, userId: string, authTimeOut: number): Promise<boolean> {
    const span = tracer.startSpan('savePhoneVerifyCode', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ _id: userId }, { $set: { authTimeOut } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async verifyEmail(spanContext: string, emailVerifyCode: string): Promise<boolean> {
    const span = tracer.startSpan('verifyEmail', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ emailVerifyCode }, { $set: { emailVerifiedAt: Time.now() } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }
  public async verifyPhoneNumber(spanContext: string, userId: string): Promise<boolean> {
    const span = tracer.startSpan('verifyEmail', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ _id: userId }, { $set: { phoneNumberVerifiedAt: Time.now() } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }
  private async hashPassword(spanContext: string, password: string): Promise<string> {
    const span = tracer.startSpan('hashPassword', spanContext);

    try {
      Joi.assert(password, Joi.string().required());
    } catch (e) {
      const errors = joiToErrors(e, pb.Error);
      span.setTag('error', true);
      span.log({ errors });
      span.finish();
      return Promise.reject(errors);
    }

    const stretches = 10;
    const hash = await bcrypt.hash(password, stretches);

    span.finish();
    return hash;

  }
  public async comparePasswordHash(spanContext: string, password: string, passwordHash: string): Promise<boolean> {
    const span = tracer.startSpan('comparePasswordHash', spanContext);
    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(password, passwordHash);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return isValid;
  }
  public async setUserOrgContextId(spanContext: string, userId: string, orgContextId: string, orgRole: string): Promise<IUser> {
    const span = tracer.startSpan('setUserOrgContext', spanContext);
    let user: IUser;

    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { orgContextId, orgRole } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

  public async updateUserName(spanContext: string, userId: string, firstName: string, lastName: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserName', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { firstName, lastName } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

  public async updateSecondaryEmailList(spanContext: string, userId: string, secondaryEmails: string[]): Promise<IUser> {
    const span = tracer.startSpan('updateSecondaryEmailList', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { secondaryEmails } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

  public async makeSecondaryEmailPrimary(spanContext: string, userId: string, secondaryEmails: string[], primaryEmail: string): Promise<IUser> {
    const span = tracer.startSpan('makeSecondaryEmailPrimary', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { secondaryEmails, email: primaryEmail } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }
  public async updateUserPhoneNumber(spanContext: string, userId: string, newPhoneNumber: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserPhoneNumber', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { phoneNumberWaitingForVerify: newPhoneNumber } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

  public async updateUserEmail(spanContext: string, userId: string, newEmail: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserEmail', spanContext);
    let user: IUser;

    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { emailWaitingForVerify: newEmail } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }
  public async updateUserPreferredLogin(spanContext: string, userId: string, preferredLogin: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserEmail', spanContext);
    let user: IUser;

    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { preferredLogin } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }
  /**
   * resetUserPhoneNumber is a helper function to replace the user phoneNumber
   * with the phoneNumberWaiting for verify and reset phoneNumberWaitingForVerify back to an empty string.
   * This is different from updateUserPhoneNumber because that function only sets the phoneNumberWaitingForVerify field.
   * The same applies for the update and reset email functions.
   *
   * @param spanContext
   * @param userId
   * @param newPhoneNumber
   */
  public async resetUserPhoneNumber(spanContext: string, userId: string, newPhoneNumber: string): Promise<IUser> {
    const span = tracer.startSpan('resetUserPhoneNumber', spanContext);
    let user: IUser;

    try {
      user = await this.User.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $set: {
            phoneNumber: newPhoneNumber,
            phoneNumberWaitingForVerify: '',
          },
        },
        {
          new: true,
        });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }
  public async resetUserEmail(spanContext: string, userId: string, newEmail: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserEmail', spanContext);
    let user: IUser;

    try {
      user = await this.User.findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $set: {
            email: newEmail,
            emailWaitingForVerify: '',
          },
        },
        {
          new: true,
        });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }
  public async forgotPassword(spanContext: string, email: string, forgotPasswordCode: string): Promise<boolean> {
    const span = tracer.startSpan('forgotPassword', spanContext);
    let put: UpdateWriteOpResult['result'];

    try {
      put = await this.User.updateOne({ email }, { $set: { forgotPasswordCode } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async resetPassword(spanContext: string, forgotPasswordCode: string, newPassword: string): Promise<boolean> {
    const span = tracer.startSpan('resetPassword', spanContext);
    let put: UpdateWriteOpResult['result'];
    let passwordHash;

    try {
      passwordHash = await this.hashPassword(spanContext, newPassword);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    try {
      put = await this.User.updateOne({ forgotPasswordCode }, { $set: { passwordHash, forgotPasswordCode: null, lastChangedPasswordAt: Time.now() } });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return put.nModified === 1;
  }

  public async setUserPassword(spanContext: string, userId: string, password: string): Promise<IUser> {
    const span = tracer.startSpan('setUserPassword', spanContext);
    let passwordHash: String;
    try {
      passwordHash = await this.hashPassword(spanContext, password);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id: userId }, { $set: { passwordHash, lastChangedPasswordAt: Time.now() } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

  public async findBy(spanContext: string, query: object): Promise<IUser> {
    const span = tracer.startSpan('findBy', spanContext);
    let user: IUser;
    try {
      user = await this.User.find(query);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return user[0];
  }

  public async findById(spanContext: string, userId: string): Promise<IUser> {
    const span = tracer.startSpan('findById', spanContext);
    let user: IUser;
    try {
      user = await this.User.findById(userId);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return user;
  }
  public async findByEmail(spanContext: string, email: string, phoneNumber: string): Promise<IUser> {
    const span = tracer.startSpan('findByEmail', spanContext);
    let user: IUser;
    try {
      if (email)
        user = await this.User.findOne({ $or: [{ email }, { secondaryEmails: email }] });
      if (phoneNumber)
        user = await this.User.findOne({ phoneNumber });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return user;
  }

  public async findEmailPhoneNumber(spanContext: string, _id: string, email: string, phoneNumber: string) {
    const span = tracer.startSpan('findByEmail', spanContext);
    let user: IUser;
    let emailExist = false;
    let phoneNumberExist = false;
    let emailSecExist = false
    try {
      if (email) {
        user = await this.User.findOne({ email, _id: { $ne: _id } });
        if (user) {
          emailExist = true;
        }
      }

      if (phoneNumber) {
        user = await this.User.findOne({ phoneNumber, _id: { $ne: _id } });
        if (user) {
          phoneNumberExist = true;
        }
      }

      if (email) {
        let isUser = await this.User.findOne({ secondaryEmails: email, _id: { $ne: _id } });
        if (isUser) {
          emailSecExist = true;
        }
      }
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return {
      user,
      emailExist,
      phoneNumberExist,
      emailSecExist
    };
  }

  public async findByPhoneNumber(spanContext: string, phoneNumber: string): Promise<IUser> {
    const span = tracer.startSpan('findByPhoneNumber', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOne({ phoneNumber });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return user;
  }
  public async deleteUser(spanContext: string, userId: string, email: string, phoneNumber: string): Promise<boolean> {
    const span = tracer.startSpan('deleteUser', spanContext);
    try {
      await this.User.deleteOne({
        $or: [
          { _id: userId },
          { email },
          { phoneNumber },
        ],
      });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async updateUserInfo(spanContext: string, _id: string, phoneNumber: string, email: string): Promise<IUser> {
    const span = tracer.startSpan('updateUserInfo', spanContext);
    let user: IUser;
    try {
      user = await this.User.findOneAndUpdate({ _id }, { $set: { phoneNumber, email }, }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return user;
  }

}
