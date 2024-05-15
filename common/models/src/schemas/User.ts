import shortid from 'shortid';
import { LoginTypes } from '../interfaces/IUser';

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  email: {
    type: String,
    required: false,
  },
  secondaryEmails: {
    type: [String],
    required: false,
  },
  passwordHash: {
    type: String,
    required: false,
    default: null,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  phoneVerifyCode: {
    type: String,
    required: false,
    default: null,
  },
  authAttempts: {
    type: Number,
    required: false,
    default: null,
  },
  authTimeOut: {
    type: Number,
    required: false,
    default: null,
  },
  phoneNumber: {
    type: String,
    required: false,
    default: '',
  },
  phoneNumberVerifiedAt: {
    type: Number,
    required: false,
    default: '',
  },
  emailVerifyCode: {
    type: String,
    required: false,
    default: null,
  },
  emailVerifiedAt: {
    type: Number,
    required: false,
    default: null,
  },
  forgotPasswordCode: {
    type: String,
    required: false,
    default: null,
  },
  lastChangedPasswordAt: {
    type: Number,
    required: false,
    default: null,
  },
  orgContextId: {
    type: String,
    required: false,
    default: null,
  },
  orgRole: {
    type: String,
    required: false,
    default: null,
  },
  previousPhoneNumber: {
    type: String,
    required: false,
    default: '',
  },
  phoneNumberWaitingForVerify: {
    type: String,
    required: false,
    default: '',
  },
  previousEmail: {
    type: String,
    required: false,
    default: '',
  },
  emailWaitingForVerify: {
    type: String,
    required: false,
    default: '',
  },
  preferredLogin: {
    type: String,
    required: false,
    default: LoginTypes.Password,
  },
};
