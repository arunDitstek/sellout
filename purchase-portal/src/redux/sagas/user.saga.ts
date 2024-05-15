import { all, takeLatest, put, select, call } from "redux-saga/effects";
import * as AppActions from "..//actions/app.actions";
import { UserReducerState } from "../reducers/user.reducer";
import { UserActionTypes } from "../actions/user.actions";
import * as UserActions from "..//actions/user.actions";
import { PurchasePortalState } from "../store";
import { ErrorKeyEnum } from "../reducers/app.reducer";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import * as Auth from "../../utils/Auth";
import client from "../../graphql/client";
import USER_PROFILE from "@sellout/models/.dist/graphql/queries/userProfile.query";
import STRIPE_CARD_DETAIL from "@sellout/models/.dist/graphql/queries/stripeCardDetail.query";
import REGISTER from "@sellout/models/.dist/graphql/mutations/register.mutation";
import VERIFY_USER_PHONE_AUTHENTICATION from "@sellout/models/.dist/graphql/mutations/verifyUserPhoneAuthentication.mutation";
import CREATE_STRIPE_SETUP_INTENT from "@sellout/models/.dist/graphql/mutations/createStripeSetupIntent.mutation";
import ATTACH_STRIPE_PAYMENT_METHOD from "@sellout/models/.dist/graphql/mutations/attachStripePaymentMethod.mutation";
import { IUserProfileGraphQL } from "@sellout/models/.dist/interfaces/IUserProfile";
import * as StripeService from "../../utils/StripeService";
import * as ErrorUtil from "../../utils/ErrorUtil";
import { CardNumberElement } from "@stripe/react-stripe-js";

export default function* userSaga() {
  try {
    yield all([
      setConfirmEmailWatch(),
      setTokenWatch(),
      registerWatch(),
      verifyPhoneAuthenticationWatch(),
      getUserProfileWatch(),
      addPaymentMethodWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

/********************************************************************************
 *  Confirm Email
 *******************************************************************************/

function* setConfirmEmailWatch() {
  yield takeLatest(UserActionTypes.SET_CONFIRM_EMAIL, setConfirmEmailSaga);
}

function* setConfirmEmailSaga(action: UserActions.SetConfirmEmailAction) {
  const user: UserReducerState = yield select(
    (state: PurchasePortalState) => state.user
  );
  const {
    confirmEmail,
    createUserParams: { email },
  } = user;

  if (confirmEmail === email) {
    yield put(AppActions.navigateForward());
  }
}

/********************************************************************************
 *  Set Token
 *******************************************************************************/

function* setTokenWatch() {
  yield takeLatest(UserActionTypes.SET_TOKEN, setTokenSaga);
}

function* setTokenSaga({ payload: { token } }: UserActions.SetTokenAction) {
  Auth.setToken(token);
}

/********************************************************************************
 *  Register Watch
 *******************************************************************************/

function* registerWatch() {
  yield takeLatest(UserActionTypes.REGISTER, registerSaga);
}

function* registerSaga({}: UserActions.RegisterAction) {
  yield put(AppActions.setLoading(true));
  const user: UserReducerState = yield select(
    (state: PurchasePortalState) => state.user
  );

  const { createUserParams } = user;
  try {
    const res: { data: any } = yield call(async () => {
      return await client.mutate({
        mutation: REGISTER,
        variables: {
          user: createUserParams,
        },
      });
    });
    yield put(UserActions.registerSuccess(res.data.register.userProfile));
    yield put(UserActions.getUserProfileSuccess(res.data.register.userProfile));
    yield put(AppActions.setLoading(false));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(UserActions.registerFailure(errorMsg));
    yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
    yield put(AppActions.setLoading(false));
  }
}

/********************************************************************************
 *  Verify Phone Authentication
 *******************************************************************************/

function* verifyPhoneAuthenticationWatch() {
  yield takeLatest(
    UserActionTypes.VERIFY_PHONE_AUTHENTICATION,
    verifyPhoneAuthenticationSaga
  );
}

function* verifyPhoneAuthenticationSaga({
  payload: { phoneVerificationToken },
}: UserActions.VerifyPhoneAuthenticationAction) {
  const user: UserReducerState = yield select(
    (state: PurchasePortalState) => state.user
  );

  const {
    createUserParams: { email },
  } = user;

  try {
    const res: { data: any } = yield call(async () => {
      return await client.mutate({
        mutation: VERIFY_USER_PHONE_AUTHENTICATION,
        variables: {
          email,
          phoneVerificationToken,
        },
      });
    });

    const {
      verifyUserPhoneAuthentication: { token },
    }: {
      verifyUserPhoneAuthentication: {
        token: string;
      };
    } = res.data;

    yield put(UserActions.setToken(token));
    yield put(UserActions.verifyPhoneAuthenticationSuccess(token));
  } catch (error) {
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(UserActions.verifyPhoneAuthenticationFailure(errorMsg));
    yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
  }
}

/********************************************************************************
 *  Get User Profile
 *******************************************************************************/

function* getUserProfileWatch() {
  yield takeLatest(UserActionTypes.GET_USER_PROFILE, getUserProfileSaga);
}

function* getUserProfileSaga({ payload }: UserActions.GetUserProfileAction) {
  const user: UserReducerState = yield select(
    (state: PurchasePortalState) => state.user
  );

  try {
    const res: { data: any } = yield call(async () => {
      return await client.query({
        query: USER_PROFILE,
        fetchPolicy: "no-cache",
      });
    });
    const {
      userProfile,
    }: {
      userProfile: IUserProfileGraphQL;
    } = res.data;
    
    yield put(UserActions.getUserProfileSuccess(userProfile));
  } catch (error) {
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(UserActions.getUserProfileFailure(errorMsg));
    yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
  }
}

/********************************************************************************
 *  Add Payment Method
 *******************************************************************************/

function* addPaymentMethodWatch() {
  yield takeLatest(UserActionTypes.ADD_PAYMENT_METHOD, addPaymentMethodSaga);
}

function* addPaymentMethodSaga({
  payload,
}: UserActions.AddPaymentMethodAction) {

  const user: UserReducerState = yield select(
    (state: PurchasePortalState) => state.user
  );

  const {
    createUserParams: { firstName, lastName },
  } = user;

  const stripeInjection = StripeService.stripe();
  if (!stripeInjection) return;

  const { stripe, elements } = stripeInjection;

  let clientSecret: string = "";
  try {
    const res: { data: any } = yield call(async () => {
      return await client.mutate({
        mutation: CREATE_STRIPE_SETUP_INTENT,
      });
    });

    const { createStripeSetupIntent } = res.data;
    clientSecret = createStripeSetupIntent;
  } catch (error) {
    console.log(error);
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(AppActions.setError(ErrorKeyEnum.PaymentCardError, errorMsg));
    yield put(AppActions.setLoading(false));
    //  yield put(ArtistActions.createArtistFailure(errorMsg));
  }

  const cardNumberElement = elements.getElement(CardNumberElement);
  if (!cardNumberElement) {
    console.log("NO CARD NUMBER ELEMENT");
    return;
  }

  const { setupIntent, error } = yield call(async () => {
    return await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        billing_details: { name: `${firstName} ${lastName}` },
      },
    });
  });

  if (error) {
    console.log(error.message);
    yield put(
      AppActions.setError(ErrorKeyEnum.PaymentCardError, error?.message)
    );
    yield put(UserActions.addPaymentMethodFailure(error));
  } else {
    yield put(AppActions.setError(ErrorKeyEnum.PaymentCardError, ""));
    console.log(setupIntent.payment_method);
  }

  const { mode } = yield select((state: PurchasePortalState) => state.app);

  if (mode === EPurchasePortalModes.BoxOffice) {
    try {
      const res: { data: any } = yield call(async () => {
        return await client.query({
          query: STRIPE_CARD_DETAIL,
          variables: {
            paymentMethodId: setupIntent.payment_method,
          },
        });
      });
      const cardDetail = res.data.getStripeCardByMethod;
      yield put(
        UserActions.addPaymentMethodSuccess(res?.data?.getStripeCardByMethod)
      );
      //const setStripeCardDetail = (cardDetail: Partial<IStripeCardDetails>) =>
      yield put(UserActions.setStripeCardDetail(cardDetail));
    } catch (error) {
      const errorMsg = ErrorUtil.getErrorMessage(error);
      yield put(UserActions.addPaymentMethodFailure(errorMsg));
      yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
    }
  } else if (mode === EPurchasePortalModes.Checkout) {
    try {
      const {
        data: { attachStripePaymentMethod },
      } = yield call(async () => {
        return await client.mutate({
          mutation: ATTACH_STRIPE_PAYMENT_METHOD,
          variables: {
            paymentMethodId: setupIntent.payment_method,
          },
        });
      });
      yield put(UserActions.getUserProfile());
      yield takeLatest(
        UserActionTypes.GET_USER_PROFILE_SUCCESS,
        function* ({ payload }: UserActions.GetUserProfileSuccessAction) {
          yield put(
            UserActions.addPaymentMethodSuccess(attachStripePaymentMethod)
          );
        }
      );
    } catch (error) {
      const errorMsg = ErrorUtil.getErrorMessage(error);
      yield put(UserActions.addPaymentMethodFailure(errorMsg));
      yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
    }
  }
}
