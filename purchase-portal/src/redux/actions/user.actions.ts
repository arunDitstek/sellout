import Partial from "../../models/interfaces/Partial";
import ICreateUserParams from '../../models/interfaces/ICreateUserParams';
import IStripeCardDetails from "../../models/interfaces/IStripeCardDetails";
import { IUserProfileGraphQL } from "@sellout/models/.dist/interfaces/IUserProfile";
import IStripePaymentMethod from "@sellout/models/.dist/interfaces/IStripePaymentMethod";

export const UserActionTypes = {
  SET_CREATE_USER_PARAMS: "SET_CREATE_USER_PARAMS",
  SET_CONFIRM_EMAIL: "SET_CONFIRM_EMAIL",
  SET_USER_EXISTS: "SET_USER_EXISTS",
  SET_TOKEN: "SET_TOKEN",
  REGISTER: "REGISTER",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILURE: "REGISTER_FAILURE",
  SET_PHONE_VERIFICATION_TOKEN: 'SET_PHONE_VERIFICATION_TOKEN',
  VERIFY_PHONE_AUTHENTICATION: 'VERIFY_PHONE_AUTHENTICATION',
  VERIFY_PHONE_AUTHENTICATION_SUCCESS: 'VERIFY_PHONE_AUTHENTICATION_SUCCESS',
  VERIFY_PHONE_AUTHENTICATION_FAILURE: 'VERIFY_PHONE_AUTHENTICATION_FAILURE',
  GET_USER_PROFILE: 'GET_USER_PROFILE',
  GET_USER_PROFILE_SUCCESS: 'GET_USER_PROFILE_SUCCESS',
  GET_USER_PROFILE_FAILURE: 'GET_USER_PROFILE_FAILURE',
  ADD_PAYMENT_METHOD: 'ADD_PAYMENT_METHOD',
  ADD_PAYMENT_METHOD_SUCCESS: 'ADD_PAYMENT_METHOD_SUCCESS',
  ADD_PAYMENT_METHOD_FAILURE: 'ADD_PAYMENT_METHOD_FAILURE',
  SET_STRIPE_CARD_DETAIL: "SET_STRIPE_CARD_DETAIL",
};

/********************************************************************************
 *  User Action Creators
 *******************************************************************************/

export type UserActionCreatorTypes =
  SetCreateUserParamsAction
  | SetConfirmEmailAction
  | SetTokenAction
  | RegisterAction
  | RegisterSuccessAction
  | RegisterFailureAction
  | SetPhoneVerificationTokenAction
  | VerifyPhoneAuthenticationAction
  | GetUserProfileAction
  | GetUserProfileSuccessAction
  | GetUserProfileFailureAction
  | AddPaymentMethodAction
  | AddPaymentMethodSuccessAction
  | AddPaymentMethodFailureAction
  | SetStripeCardDetailAction;

/********************************************************************************
 *  Set Create User Params
 *******************************************************************************/

export interface SetCreateUserParamsAction {
  type: typeof UserActionTypes.SET_CREATE_USER_PARAMS;
  payload: {
    createUserParams: Partial<ICreateUserParams>,
  };
}

export function setCreateUserParams(createUserParams: Partial<ICreateUserParams>): SetCreateUserParamsAction {
  return {
    type: UserActionTypes.SET_CREATE_USER_PARAMS,
    payload: {
      createUserParams,
    }
  };
}
/********************************************************************************
 *  Set Stripe Card Detail
 *******************************************************************************/

 export interface SetStripeCardDetailAction {
  type: typeof UserActionTypes.SET_STRIPE_CARD_DETAIL;
  payload: {
    stripeCardDetail: Partial<IStripeCardDetails>,
  };
}

export function setStripeCardDetail(stripeCardDetail: Partial<IStripeCardDetails>): SetStripeCardDetailAction {
  return {
    type: UserActionTypes.SET_STRIPE_CARD_DETAIL,
    payload: {
      stripeCardDetail,
    }
  };
}

/********************************************************************************
 *  Set Confirm Email
 *******************************************************************************/

export interface SetConfirmEmailAction {
  type: typeof UserActionTypes.SET_CONFIRM_EMAIL;
  payload: {
    confirmEmail: string,
  };
}

export function setConfirmEmail(confirmEmail: string): SetConfirmEmailAction {
  return {
    type: UserActionTypes.SET_CONFIRM_EMAIL,
    payload: {
      confirmEmail,
    }
  };
}

/********************************************************************************
 *  Set User Exists
 *******************************************************************************/

export interface SetUserExistsAction {
  type: typeof UserActionTypes.SET_USER_EXISTS;
  payload: {
    userExists: boolean,
  };
}

export function setUserExists(userExists: boolean): SetUserExistsAction {
  return {
    type: UserActionTypes.SET_USER_EXISTS,
    payload: {
      userExists,
    }
  };
}

/********************************************************************************
 *  Set Token
 *******************************************************************************/

export interface SetTokenAction {
  type: typeof UserActionTypes.SET_TOKEN;
  payload: {
    token: string;
  };
}

export function setToken(token: string): SetTokenAction {
  return {
    type: UserActionTypes.SET_TOKEN,
    payload: {
      token,
    }
  };
}

/********************************************************************************
 *  Register
 *******************************************************************************/

export interface RegisterAction {
  type: typeof UserActionTypes.REGISTER;
  payload: {};
}

export function register(): RegisterAction {
  return {
    type: UserActionTypes.REGISTER,
    payload: {}
  };
}

export interface RegisterSuccessAction {
  type: typeof UserActionTypes.REGISTER_SUCCESS;
  payload: {
    userProfile: IUserProfileGraphQL;
  };
}

export function registerSuccess(userProfile: IUserProfileGraphQL): RegisterSuccessAction {
  return {
    type: UserActionTypes.REGISTER_SUCCESS,
    payload: {
      userProfile
    }
  };
}

export interface RegisterFailureAction {
  type: typeof UserActionTypes.REGISTER_FAILURE;
  payload: {
    errorMsg: string
  };
}

export function registerFailure(errorMsg: string): RegisterFailureAction {
  return {
    type: UserActionTypes.REGISTER_FAILURE,
    payload: {
      errorMsg,
    }
  };
}

/********************************************************************************
*  Phone Authentication
*******************************************************************************/


export interface SetPhoneVerificationTokenAction {
  type: typeof UserActionTypes.SET_PHONE_VERIFICATION_TOKEN;
  payload: {
    phoneVerificationToken: string,
  };
}

export function setPhoneVerificationToken(phoneVerificationToken: string): SetPhoneVerificationTokenAction {
  return {
    type: UserActionTypes.SET_PHONE_VERIFICATION_TOKEN,
    payload: {
      phoneVerificationToken,
    }
  };
}

export interface VerifyPhoneAuthenticationAction {
  type: typeof UserActionTypes.VERIFY_PHONE_AUTHENTICATION;
  payload: {
    phoneVerificationToken: string,
  };
}

export function verifyPhoneAuthentication(phoneVerificationToken: string): VerifyPhoneAuthenticationAction {
  return {
    type: UserActionTypes.VERIFY_PHONE_AUTHENTICATION,
    payload: {
      phoneVerificationToken,
    }
  };
}

export interface VerifyPhoneAuthenticationSuccessAction {
  type: typeof UserActionTypes.VERIFY_PHONE_AUTHENTICATION_SUCCESS;
  payload: {
    token: string;
  };
}

export function verifyPhoneAuthenticationSuccess(token: string): VerifyPhoneAuthenticationSuccessAction {
  return {
    type: UserActionTypes.VERIFY_PHONE_AUTHENTICATION_SUCCESS,
    payload: {
      token,
    }
  };
}

export interface VerifyPhoneAuthenticationFailureAction {
  type: typeof UserActionTypes.VERIFY_PHONE_AUTHENTICATION_FAILURE;
  payload: {
    errorMsg: string
  };
}

export function verifyPhoneAuthenticationFailure(errorMsg: string): VerifyPhoneAuthenticationFailureAction {
  return {
    type: UserActionTypes.VERIFY_PHONE_AUTHENTICATION_FAILURE,
    payload: {
      errorMsg,
    }
  };
}

/********************************************************************************
 *  Get User Profile
 *******************************************************************************/

export interface GetUserProfileAction {
  type: typeof UserActionTypes.GET_USER_PROFILE;
  payload: {};
}

export function getUserProfile(): GetUserProfileAction {
  return {
    type: UserActionTypes.GET_USER_PROFILE,
    payload: {}
  };
}

export interface GetUserProfileSuccessAction {
  type: typeof UserActionTypes.GET_USER_PROFILE_SUCCESS;
  payload: {
    userProfile: IUserProfileGraphQL
  };
}

export function getUserProfileSuccess(userProfile: IUserProfileGraphQL): GetUserProfileSuccessAction {
  return {
    type: UserActionTypes.GET_USER_PROFILE_SUCCESS,
    payload: {
      userProfile
    }
  };
}

export interface GetUserProfileFailureAction {
  type: typeof UserActionTypes.GET_USER_PROFILE_FAILURE;
  payload: {
    errorMsg: string
  };
}

export function getUserProfileFailure(errorMsg: string): GetUserProfileFailureAction {
  return {
    type: UserActionTypes.GET_USER_PROFILE_FAILURE,
    payload: {
      errorMsg,
    }
  };
}

/********************************************************************************
 *  Add Payment Method
 *******************************************************************************/

export interface AddPaymentMethodAction {
  type: typeof UserActionTypes.ADD_PAYMENT_METHOD;
  payload: {};
}

export function addPaymentMethod(): AddPaymentMethodAction {
  return {
    type: UserActionTypes.ADD_PAYMENT_METHOD,
    payload: {}
  };
}

export interface AddPaymentMethodSuccessAction {
  type: typeof UserActionTypes.ADD_PAYMENT_METHOD_SUCCESS;
  payload: {
    paymentMethod: IStripePaymentMethod
  };
}

export function addPaymentMethodSuccess(paymentMethod: IStripePaymentMethod): AddPaymentMethodSuccessAction {
  return {
    type: UserActionTypes.ADD_PAYMENT_METHOD_SUCCESS,
    payload: {
      paymentMethod
    }
  };
}

export interface AddPaymentMethodFailureAction {
  type: typeof UserActionTypes.ADD_PAYMENT_METHOD_FAILURE;
  payload: {
    errorMsg: string
  };
}

export function addPaymentMethodFailure(errorMsg: string): AddPaymentMethodFailureAction {
  return {
    type: UserActionTypes.ADD_PAYMENT_METHOD_FAILURE,
    payload: {
      errorMsg,
    }
  };
}

