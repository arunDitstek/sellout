export enum LoginTypes {
  PhoneCode = 'PhoneCode',
  Password = 'Password',
  TwoFactor = 'TwoFactor',
}

export default interface IUser {
  _id?: string;
  email: string;
  password?: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  createdAt?: number;
  phoneVerifyCode?: string;
  phoneNumber?: string;
  phoneNumberVerifiedAt?: number;
  emailVerifyCode?: string;
  emailVerifiedAt?: number;
  forgotPasswordCode?: string;
  lastChangedPasswordAt?: number;
  orgContextId?: string;
  orgRole?: string;
  phoneNumberWaitingForVerify?: string;
  emailWaitingForVerify?: string;
  preferredLogin?: LoginTypes;
  authAttempts?: number;
  authTimeOut?: number;
  secondaryEmails?: string[];
}
