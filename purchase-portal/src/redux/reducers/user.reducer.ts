import ICreateUserParams from "../../models/interfaces/ICreateUserParams";
import IStripeCardDetails from "../../models/interfaces/IStripeCardDetails";
import {
  createUserState,
  createStripeCard,
} from "../../models/states/user.state";
import Partial from "../../models/interfaces/Partial";
import {
  UserActionTypes,
  UserActionCreatorTypes,
  SetCreateUserParamsAction,
  SetConfirmEmailAction,
  SetUserExistsAction,
  SetPhoneVerificationTokenAction,
  GetUserProfileSuccessAction,
  SetStripeCardDetailAction
} from "../actions/user.actions";
import { AppActionCreatorTypes, AppActionTypes } from "../actions/app.actions";
import { IUserProfileGraphQL } from "@sellout/models/.dist/interfaces/IUserProfile";

export type UserReducerState = {
  userProfile: IUserProfileGraphQL | null;
  token: "";
  createUserParams: ICreateUserParams;
  confirmEmail: string;
  lastCheckedEmail: string;
  userExists: boolean;
  phoneVerificationToken: string;
  stripeCardDetail: IStripeCardDetails;
};

function userReducerState(): UserReducerState {
  return {
    userProfile: null,
    token: "",
    createUserParams: createUserState(),
    confirmEmail: "",
    lastCheckedEmail: "",
    userExists: true,
    phoneVerificationToken: "",
    stripeCardDetail: createStripeCard(),
  };
}

export default function reducer(
  state = userReducerState(),
  action: UserActionCreatorTypes | AppActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    case UserActionTypes.SET_CREATE_USER_PARAMS:
      return setCreateUserParams(
        state,
        payload as SetCreateUserParamsAction["payload"]
      );

      case UserActionTypes.SET_STRIPE_CARD_DETAIL:
        return setStripeCardDetail(
          state,
          payload as SetStripeCardDetailAction["payload"]
        );

    case UserActionTypes.SET_CONFIRM_EMAIL:
      return setConfirmEmail(
        state,
        payload as SetConfirmEmailAction["payload"]
      );

    case UserActionTypes.SET_USER_EXISTS:
      return setUserExists(state, payload as SetUserExistsAction["payload"]);

    case UserActionTypes.SET_PHONE_VERIFICATION_TOKEN:
      return setPhoneVerificationToken(
        state,
        payload as SetPhoneVerificationTokenAction["payload"]
      );

    case UserActionTypes.GET_USER_PROFILE_SUCCESS:
      return getUserProfileSuccess(
        state,
        payload as GetUserProfileSuccessAction["payload"]
      );

    /****************************************************************************************
      Reset App
    ****************************************************************************************/

    case AppActionTypes.RESET_APP:
      return resetApp();

    default:
      return state;
  }
}

/********************************************************************************
 *  Set Create User Params
 *******************************************************************************/

function setCreateUserParams(
  state: UserReducerState,
  { createUserParams }: { createUserParams: Partial<ICreateUserParams> }
): UserReducerState {
  state = {
    ...state,
    createUserParams: {
      ...state.createUserParams,
      ...createUserParams,
    },
  };

  state.lastCheckedEmail = state.createUserParams.email;
  return state;
}

/********************************************************************************
 *  Set Stripe Card Detail
 *******************************************************************************/

 function setStripeCardDetail(
  state: UserReducerState,
  { stripeCardDetail }: { stripeCardDetail: Partial<IStripeCardDetails> }
): UserReducerState {
  state = {
    ...state,
    stripeCardDetail: {
      ...state.stripeCardDetail,
      ...stripeCardDetail,
    },
  };
  return state;
}

/********************************************************************************
 *  Set Confirm Email
 *******************************************************************************/

function setConfirmEmail(
  state: UserReducerState,
  { confirmEmail }: { confirmEmail: string }
): UserReducerState {
  state = {
    ...state,
    confirmEmail,
  };

  return state;
}

/********************************************************************************
 *  Set User Exists
 *******************************************************************************/

function setUserExists(
  state: UserReducerState,
  { userExists }: { userExists: boolean }
): UserReducerState {
  state = {
    ...state,
    userExists,
  };

  return state;
}

/********************************************************************************
 *  Set Phone Verification Token
 *******************************************************************************/

function setPhoneVerificationToken(
  state: UserReducerState,
  { phoneVerificationToken }: { phoneVerificationToken: string }
): UserReducerState {
  state = {
    ...state,
    phoneVerificationToken,
  };

  return state;
}

/********************************************************************************
 *  Get User Profile Success
 *******************************************************************************/

function getUserProfileSuccess(
  state: UserReducerState,
  { userProfile }: { userProfile: IUserProfileGraphQL }
): UserReducerState {
  state = {
    ...state,
    userProfile,
  };

  return state;
}

/********************************************************************************
 *  Reset App
 *******************************************************************************/

function resetApp(): UserReducerState {
  return userReducerState();
}
