import { all, takeLatest, put, select, call } from "redux-saga/effects";
import wait from "@sellout/utils/.dist/wait";
import { AppActionTypes } from "../actions/app.actions";
import * as AppActions from "..//actions/app.actions";
import { UserActionTypes } from "..//actions/user.actions";
import * as UserActions from "..//actions/user.actions";
import { OrderActionTypes } from "..//actions/order.actions";
import * as OrderActions from "..//actions/order.actions";
import * as Embed from "../../utils/Embed";
import { PurchasePortalState } from "../store";
import { ScreenEnum, ErrorKeyEnum } from "../reducers/app.reducer";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import * as Validation from "@sellout/ui/build/utils/Validation";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import purchasePortalModeToOrderChannel from "../../utils/purchasePortalModeToOrderChannel";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";

export default function* appSaga() {
  try {
    yield all([
      setStatusWatch(),
      resetAppWatch(),
      navigateForwardWatch(),
      navigateBackwardWatch(),
      seasonNavigateForwardWatch(),
      seasonNavigateBackwardWatch(),
      closeAppWatch(),
      showNotificationWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

/********************************************************************************
 *  Set Status
 *******************************************************************************/

function* setStatusWatch() {
  yield takeLatest(AppActionTypes.SET_PURCHASE_PORTAL_STATUS, setStatusSaga);
}

function* setStatusSaga(action: AppActions.SetPurchasePortalStatusAction) {
  const {
    payload: { status },
  } = action;

  Embed.setStatus(status);
}

/********************************************************************************
 *  Reset App
 *******************************************************************************/

function* resetAppWatch() {
  yield takeLatest(AppActionTypes.RESET_APP, resetAppSaga);
}

function* resetAppSaga(action: AppActions.ResetAppAction) {
  const state: PurchasePortalState = yield select(
    (state: PurchasePortalState) => state
  );

  const { app } = state;
  const {
    mode,
    isComplimentary,
    eventId,
    eventsCache,
    seasonId,
    seasonsCache,
  } = app;
  const event = eventsCache[eventId];
  const season = seasonsCache[seasonId];
  const channel: OrderChannelEnum = purchasePortalModeToOrderChannel(mode);

  if (event) {
    yield put(
      OrderActions.setInitialCreateOrderParams(event, channel, isComplimentary)
    );
  } else if (season) {
    yield put(
      OrderActions.setSeasonInitialCreateOrderParams(
        season,
        channel,
        isComplimentary
      )
    );
  }
}

/********************************************************************************
 *  Close App
 *******************************************************************************/

function* closeAppWatch() {
  yield takeLatest(AppActionTypes.CLOSE_APP, closeAppSaga);
}

function* closeAppSaga(action: AppActions.CloseAppAction) {
  Embed.close();
  yield put(AppActions.resetApp());
}

/********************************************************************************
 *  Navigate Forward
 *******************************************************************************/

function* navigateForwardWatch() {
  yield takeLatest(AppActionTypes.NAVIGATE_FORWARD, navigateForwardSaga);
}

function* navigateForwardSaga(action: AppActions.NavigateForwardAction) {
  const state: PurchasePortalState = yield select(
    (state: PurchasePortalState) => state
  );
  const { app, order, user } = state;
  const { screen, mode, isComplimentary, eventId, eventsCache } = app;
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const event = eventsCache[eventId];
  const {
    createOrderParams: { paymentMethodType },
    upgradesOnly,
    guestCheckout,
  } = order;
  const {
    userExists,
    confirmEmail,
    phoneVerificationToken,
    createUserParams: { email },
    userProfile,
  } = user;

  const hasUpgrades =
    EventUtil.activeNonComplimentaryUpgrades(event).length > 0;
  console.log(EventUtil.activeNonComplimentaryUpgrades(event));
  const hasCustomFields = EventUtil.activeCustomFields(event).length > 0;
  const hasUserAgreement = Boolean(event?.userAgreement);
  const isPaid = EventUtil.isPaid(event);
  const isTEGValidate = event?.organization?.isTegIntegration && event?.organization?.validateMemberId
  const isTEGBoxoffice = event?.organization?.isTegIntegration && !event?.organization?.validateMemberId && isBoxOffice

  switch (screen) {
    case ScreenEnum.EventUnavailable:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;

    case ScreenEnum.Tickets:
      if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers)); 
      } else {
        if (hasUpgrades) {
          yield put(AppActions.setScreen(ScreenEnum.Upgrades));
          return;
        } else if (hasCustomFields) {
          yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        } else if (hasUserAgreement) {
          yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        } else if (isBoxOffice) {
          yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
        } else {
          yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        }
      }
      if (upgradesOnly) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
      }
      return;
    case ScreenEnum.GuestMembers:
      if (hasUpgrades) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
        return;
      } else if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
      } else if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
      } else if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;
    case ScreenEnum.Upgrades:
      if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
      } else if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
      } else if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;

    case ScreenEnum.CustomFields:
      if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
      } else if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;

    case ScreenEnum.LiabilityWaiver:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;

    /** Checkout **/

    case ScreenEnum.UserEmail:
      const emailMessage =
        Validation.email.validate(email)?.error?.message || "";
      yield put(AppActions.setError(ErrorKeyEnum.UserEmail, emailMessage));

      if (userExists) {
        if (emailMessage) return;
        yield put(AppActions.setScreen(ScreenEnum.PhoneCode));
      } else {
        const confirmEmailMessage =
          email === confirmEmail ? "" : "Emails do not match";
        yield put(
          AppActions.setError(
            ErrorKeyEnum.ConfirmUserEmail,
            confirmEmailMessage
          )
        );
        if (emailMessage || confirmEmailMessage) return;
        yield put(AppActions.setScreen(ScreenEnum.UserInfo));
      }
      return;

    case ScreenEnum.UserInfo:
      yield put(UserActions.register());
      yield takeLatest(UserActionTypes.REGISTER_SUCCESS, function* () {
        yield put(AppActions.setScreen(ScreenEnum.PhoneCode));
      });
      return;

    case ScreenEnum.PhoneCode:
      yield put(AppActions.setLoading(true));
      yield put(UserActions.verifyPhoneAuthentication(phoneVerificationToken));
      yield takeLatest(
        UserActionTypes.VERIFY_PHONE_AUTHENTICATION_SUCCESS,
        function* ({
          payload,
        }: UserActions.VerifyPhoneAuthenticationSuccessAction) {
          yield put(UserActions.getUserProfile());
        }
      );

      yield takeLatest(
        UserActionTypes.GET_USER_PROFILE_SUCCESS,
        function* ({ payload }: UserActions.GetUserProfileSuccessAction) {
          if (isPaid) {
            if (payload.userProfile.stripeCustomer.paymentMethods.length) {
              yield put(
                OrderActions.setPaymentMethodId(
                  payload.userProfile.stripeCustomer.paymentMethods[0]
                    .paymentMethodId
                )
              );
              yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
            } else {
              yield put(AppActions.setScreen(ScreenEnum.AddPayment));
            }
          } else {
            yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          }
          yield put(AppActions.setLoading(false));
        }
      );

      yield takeLatest(
        [
          UserActionTypes.VERIFY_PHONE_AUTHENTICATION_FAILURE,
          UserActionTypes.GET_USER_PROFILE_FAILURE,
        ],
        function* () {
          yield put(AppActions.setLoading(false));
        }
      );
      return;

    case ScreenEnum.AddPayment:
      yield put(AppActions.setLoading(true));
      yield put(UserActions.addPaymentMethod());
      yield takeLatest(
        UserActionTypes.ADD_PAYMENT_METHOD_SUCCESS,
        function* ({
          payload: { paymentMethod },
        }: UserActions.AddPaymentMethodSuccessAction) {
          yield put(
            OrderActions.setPaymentMethodId(paymentMethod.paymentMethodId)
          );
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          yield put(AppActions.setLoading(false));
        }
      );

      yield takeLatest(
        UserActionTypes.ADD_PAYMENT_METHOD_FAILURE,
        function* () {
          yield put(AppActions.setLoading(false));
        }
      );
      return;

    case ScreenEnum.SelectPayment:
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    /** Box Office **/
    case ScreenEnum.CustomerPhoneNumber:
      if (!userExists) {
        if (email) {
          yield put(UserActions.register());
          yield takeLatest(UserActionTypes.REGISTER_SUCCESS, function* () {
            if (isPaid && !isComplimentary) {
              yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
            } else {
              yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
            }
          });
        } else if (guestCheckout) {
          if (isPaid && !isComplimentary) {
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
          } else {
            yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          }
        }
      } else if (userProfile && userExists) {
        if (isPaid && !isComplimentary) {
          yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        } else {
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
        }
      }
      return;

    case ScreenEnum.PaymentMethod:
      switch (paymentMethodType) {
        case PaymentMethodTypeEnum.CardEntry:
          yield put(AppActions.setScreen(ScreenEnum.AddPayment));
          break;
        case PaymentMethodTypeEnum.CardReader:
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          break;
        case PaymentMethodTypeEnum.Cash:
          yield put(AppActions.setScreen(ScreenEnum.CashPayment));
          break;
        case PaymentMethodTypeEnum.Check:
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          break;
      }
      return;

    case ScreenEnum.SelectPayment:
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    case ScreenEnum.CashPayment:
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    case ScreenEnum.ConfirmOrder:
      switch (paymentMethodType) {
        case PaymentMethodTypeEnum.CardEntry:
          yield put(OrderActions.createCardEntryOrder());
          break;
        case PaymentMethodTypeEnum.CardReader:
          yield put(OrderActions.createTerminalOrder());
          // yield put(AppActions.setScreen(ScreenEnum.CardReader));
          break;
        case PaymentMethodTypeEnum.Cash:
          yield put(OrderActions.createOrder());
          break;
        case PaymentMethodTypeEnum.Check:
          yield put(OrderActions.createOrder());
          break;
        case PaymentMethodTypeEnum.None:
          yield put(OrderActions.createOrder());
          break;
      }

      yield takeLatest(OrderActionTypes.CREATE_ORDER_SUCCESS, function* () {
        yield put(AppActions.setScreen(ScreenEnum.OrderConfirmed));
      });
      return;
    // case ScreenEnum.OrderConfirmed:
    //   yield put(AppActions.setScreen(ScreenEnum.UserEmail));
    //   return;

    default:
      console.log("OH NO!");
      // yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
  }
}

/********************************************************************************
 *  Navigate Backward
 *******************************************************************************/

function* navigateBackwardWatch() {
  yield takeLatest(AppActionTypes.NAVIGATE_BACKWARD, navigateBackwardSaga);
}

function* navigateBackwardSaga(action: AppActions.NavigateBackwardAction) {
  const state: PurchasePortalState = yield select(
    (state: PurchasePortalState) => state
  );

  const { app, order, user } = state;

  const { screen, mode, eventId, eventsCache } = app;
  const {
    guestCheckout,
    createOrderParams: { paymentMethodType },
    upgradesOnly,
  } = order;

  const { userExists } = user;
  const event = eventsCache[eventId];

  const hasUpgrades =
    EventUtil.activeNonComplimentaryUpgrades(event).length > 0;

  const hasCustomFields = EventUtil.activeCustomFields(event).length > 0;
  const hasUserAgreement = Boolean(event?.userAgreement);
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const isTEGValidate = event?.organization?.isTegIntegration && event?.organization?.validateMemberId
  const isTEGBoxoffice = event?.organization?.isTegIntegration && !event?.organization?.validateMemberId && isBoxOffice

  switch (screen) {
    case ScreenEnum.Tickets:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
    case ScreenEnum.GuestMembers:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
    case ScreenEnum.Upgrades:
      if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
      }
      if (upgradesOnly) {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
      }
      return;

    case ScreenEnum.CustomFields:
      if (hasUpgrades) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
        return;
      } else if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        return;
      }

    case ScreenEnum.LiabilityWaiver:
      if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        return;
      } else if (hasUpgrades) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
        return;
      } else if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        return;
      }

    /** Checkout **/
    case ScreenEnum.UserEmail:
      const email = "" as any;
      if (guestCheckout) {
        yield put(AppActions.setScreen(ScreenEnum.OrderConfirmed));
        return;
      } else if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        return;
      } else if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        return;
      } else if (hasUpgrades) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        return;
      } else if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        yield put(UserActions.setCreateUserParams({ email }));
        return;
      }

    case ScreenEnum.UserInfo:
      yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      return;

    case ScreenEnum.PhoneCode:
      if (userExists) {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserInfo));
        return;
      }

    case ScreenEnum.SelectPayment:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        return;
      }

    case ScreenEnum.AddPayment:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
        yield put(AppActions.setError(ErrorKeyEnum.PaymentCardError, ""));
        return;
      }

    /** Box Office **/
    case ScreenEnum.CustomerPhoneNumber:
      yield put(AppActions.setError(ErrorKeyEnum.UserProfileError, ""));
      if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        return;
      } else if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        return;
      } else if (hasUpgrades) {
        yield put(AppActions.setScreen(ScreenEnum.Upgrades));
        return;
      } else if ((isTEGValidate) || (isTEGBoxoffice)) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        return;
      }

    case ScreenEnum.PaymentMethod:
      yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      return;

    case ScreenEnum.CashPayment:
      yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
      return;

    case ScreenEnum.ConfirmOrder:
      if (event.userAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
        return;
      } else {
        switch (paymentMethodType) {
          case PaymentMethodTypeEnum.CardEntry:
            if (isBoxOffice) {
              yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
              yield put(
                AppActions.setError(ErrorKeyEnum.ConFirmOrderError, "")
              );
              return;
            } else {
              yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
              yield put(
                AppActions.setError(ErrorKeyEnum.ConFirmOrderError, "")
              );
              return;
            }
          case PaymentMethodTypeEnum.CardReader:
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.Cash:
            yield put(AppActions.setScreen(ScreenEnum.CashPayment));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.Check:
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.None:
            if (isBoxOffice) {
              yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
            } else {
              yield put(AppActions.setScreen(ScreenEnum.UserEmail));
            }
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
        }
      }

    case ScreenEnum.CardReader:
      yield put(OrderActions.cancelStripeTerminalPayment());
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    default:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      yield put(AppActions.resetApp());
      return;
  }
}

/********************************************************************************
 *  Season Navigate Forward
 *******************************************************************************/

function* seasonNavigateForwardWatch() {
  yield takeLatest(
    AppActionTypes.SEASON_NAVIGATE_FORWARD,
    seasonNavigateForwardSaga
  );
}

function* seasonNavigateForwardSaga(action: AppActions.NavigateForwardAction) {
  const state: PurchasePortalState = yield select(
    (state: PurchasePortalState) => state
  );

  const { app, order, user } = state;
  const { screen, mode, isComplimentary, seasonId, seasonsCache } = app;
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;
  const season = seasonsCache[seasonId];
  const {
    createOrderParams: { paymentMethodType },
  } = order;
  const {
    userExists,
    confirmEmail,
    phoneVerificationToken,
    createUserParams: { email },
    userProfile,
  } = user;

  const hasCustomFields = SeasonUtil.activeCustomFields(season).length > 0;
  const hasUserAgreement = Boolean(season?.userAgreement);

  switch (screen) {
    case ScreenEnum.EventUnavailable:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
    case ScreenEnum.Tickets:
      if (season?.organization?.isTegIntegration) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
      } else {
        if (hasCustomFields) {
          yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        } else if (hasUserAgreement) {
          yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        } else if (isBoxOffice) {
          yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
        } else {
          yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        }
      }
      return;
    case ScreenEnum.GuestMembers:
      if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
      } else if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
      } else if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;
    case ScreenEnum.CustomFields:
      if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
      } else if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;

    case ScreenEnum.LiabilityWaiver:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      }
      return;

    /** Checkout **/

    case ScreenEnum.UserEmail:
      const emailMessage =
        Validation.email.validate(email)?.error?.message || "";
      yield put(AppActions.setError(ErrorKeyEnum.UserEmail, emailMessage));

      if (userExists) {
        if (emailMessage) return;
        yield put(AppActions.setScreen(ScreenEnum.PhoneCode));
      } else {
        const confirmEmailMessage =
          email === confirmEmail ? "" : "Emails do not match";
        yield put(
          AppActions.setError(
            ErrorKeyEnum.ConfirmUserEmail,
            confirmEmailMessage
          )
        );
        if (emailMessage || confirmEmailMessage) return;
        yield put(AppActions.setScreen(ScreenEnum.UserInfo));
      }
      return;

    case ScreenEnum.UserInfo:
      yield put(UserActions.register());
      yield takeLatest(UserActionTypes.REGISTER_SUCCESS, function* () {
        yield put(AppActions.setScreen(ScreenEnum.PhoneCode));
      });
      return;

    case ScreenEnum.PhoneCode:
      yield put(AppActions.setLoading(true));
      yield put(UserActions.verifyPhoneAuthentication(phoneVerificationToken));
      yield takeLatest(
        UserActionTypes.VERIFY_PHONE_AUTHENTICATION_SUCCESS,
        function* ({
          payload,
        }: UserActions.VerifyPhoneAuthenticationSuccessAction) {
          yield put(UserActions.getUserProfile());
        }
      );

      yield takeLatest(
        UserActionTypes.GET_USER_PROFILE_SUCCESS,
        function* ({ payload }: UserActions.GetUserProfileSuccessAction) {
          if (payload.userProfile.stripeCustomer.paymentMethods.length) {
            yield put(
              OrderActions.setPaymentMethodId(
                payload.userProfile.stripeCustomer.paymentMethods[0]
                  .paymentMethodId
              )
            );
            yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
          } else {
            yield put(AppActions.setScreen(ScreenEnum.AddPayment));
          }

          yield put(AppActions.setLoading(false));
        }
      );

      yield takeLatest(
        [
          UserActionTypes.VERIFY_PHONE_AUTHENTICATION_FAILURE,
          UserActionTypes.GET_USER_PROFILE_FAILURE,
        ],
        function* () {
          yield put(AppActions.setLoading(false));
        }
      );
      return;

    case ScreenEnum.AddPayment:
      yield put(AppActions.setLoading(true));
      yield put(UserActions.addPaymentMethod());
      yield takeLatest(
        UserActionTypes.ADD_PAYMENT_METHOD_SUCCESS,
        function* ({
          payload: { paymentMethod },
        }: UserActions.AddPaymentMethodSuccessAction) {
          yield put(
            OrderActions.setPaymentMethodId(paymentMethod.paymentMethodId)
          );
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          yield put(AppActions.setLoading(false));
        }
      );

      yield takeLatest(
        UserActionTypes.ADD_PAYMENT_METHOD_FAILURE,
        function* () {
          yield put(AppActions.setLoading(false));
        }
      );
      return;

    case ScreenEnum.SelectPayment:
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    /** Box Office **/
    case ScreenEnum.CustomerPhoneNumber:
      if (!userExists) {
        yield put(UserActions.register());
        yield takeLatest(UserActionTypes.REGISTER_SUCCESS, function* () {
          if (!isComplimentary) {
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
          } else {
            yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          }
        });
      } else if (userProfile && userExists) {
        if (!isComplimentary) {
          yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        } else {
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
        }
      }
      return;

    case ScreenEnum.PaymentMethod:
      switch (paymentMethodType) {
        case PaymentMethodTypeEnum.CardEntry:
          yield put(AppActions.setScreen(ScreenEnum.AddPayment));
          break;
        case PaymentMethodTypeEnum.CardReader:
          yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
          break;
        case PaymentMethodTypeEnum.Cash:
          yield put(AppActions.setScreen(ScreenEnum.CashPayment));
          break;
      }
      return;

    case ScreenEnum.CashPayment:
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    case ScreenEnum.ConfirmOrder:
      switch (paymentMethodType) {
        case PaymentMethodTypeEnum.CardEntry:
          yield put(OrderActions.createCardEntryOrder());
          break;
        case PaymentMethodTypeEnum.CardReader:
          yield put(OrderActions.createTerminalOrder());
          // yield put(AppActions.setScreen(ScreenEnum.CardReader));
          break;
        case PaymentMethodTypeEnum.Cash:
          yield put(OrderActions.createOrder());
          break;
        case PaymentMethodTypeEnum.Check:
          yield put(OrderActions.createOrder());
          break;
        case PaymentMethodTypeEnum.None:
          yield put(OrderActions.createOrder());
          break;
      }

      yield takeLatest(OrderActionTypes.CREATE_ORDER_SUCCESS, function* () {
        yield put(AppActions.setScreen(ScreenEnum.OrderConfirmed));
      });
      return;

    default:
      console.log("OH NO!");
      // yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
  }
}

/********************************************************************************
 *  Season Navigate Backward
 *******************************************************************************/

function* seasonNavigateBackwardWatch() {
  yield takeLatest(
    AppActionTypes.SEASON_NAVIGATE_BACKWARD,
    seasonNavigateBackwardSaga
  );
}

function* seasonNavigateBackwardSaga(
  action: AppActions.NavigateBackwardAction
) {
  const state: PurchasePortalState = yield select(
    (state: PurchasePortalState) => state
  );

  const { app, order, user } = state;

  const { screen, mode, seasonId, seasonsCache } = app;
  const {
    createOrderParams: { paymentMethodType },
  } = order;

  const { userExists } = user;
  const season = seasonsCache[seasonId];
  const hasCustomFields = SeasonUtil.activeCustomFields(season).length > 0;
  const hasUserAgreement = Boolean(season?.userAgreement);
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;

  switch (screen) {
    case ScreenEnum.Tickets:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;
    case ScreenEnum.GuestMembers:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;

    case ScreenEnum.Upgrades:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;

    case ScreenEnum.CustomFields:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      return;

    case ScreenEnum.LiabilityWaiver:
      if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        return;
      }

    /** Checkout **/
    case ScreenEnum.UserEmail:
      const email = "" as any;
      if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        return;
      } else if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        return;
      } else if (season?.organization?.isTegIntegration) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        yield put(AppActions.setError(ErrorKeyEnum.PromoCodeLimitError, ""));
        yield put(UserActions.setCreateUserParams({ email }));
        return;
      }

    case ScreenEnum.UserInfo:
      yield put(AppActions.setScreen(ScreenEnum.UserEmail));
      return;

    case ScreenEnum.PhoneCode:
      if (userExists) {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserInfo));
        return;
      }

    case ScreenEnum.SelectPayment:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.UserEmail));
        return;
      }

    case ScreenEnum.AddPayment:
      if (isBoxOffice) {
        yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
        yield put(AppActions.setError(ErrorKeyEnum.PaymentCardError, ""));
        return;
      }

    /** Box Office **/
    case ScreenEnum.CustomerPhoneNumber:
      yield put(AppActions.setError(ErrorKeyEnum.UserProfileError, ""));
      if (hasUserAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        return;
      } else if (hasCustomFields) {
        yield put(AppActions.setScreen(ScreenEnum.CustomFields));
        return;
      } else if (season?.organization?.isTegIntegration) {
        yield put(AppActions.setScreen(ScreenEnum.GuestMembers));
        return;
      } else {
        yield put(AppActions.setScreen(ScreenEnum.Tickets));
        return;
      }

    case ScreenEnum.PaymentMethod:
      yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
      return;

    case ScreenEnum.CashPayment:
      yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
      return;

    case ScreenEnum.ConfirmOrder:
      if (season?.userAgreement) {
        yield put(AppActions.setScreen(ScreenEnum.LiabilityWaiver));
        yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
        return;
      } else {
        switch (paymentMethodType) {
          case PaymentMethodTypeEnum.CardEntry:
            if (isBoxOffice) {
              yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
              yield put(
                AppActions.setError(ErrorKeyEnum.ConFirmOrderError, "")
              );
              return;
            } else {
              yield put(AppActions.setScreen(ScreenEnum.SelectPayment));
              yield put(
                AppActions.setError(ErrorKeyEnum.ConFirmOrderError, "")
              );
              return;
            }
          case PaymentMethodTypeEnum.CardReader:
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.Cash:
            yield put(AppActions.setScreen(ScreenEnum.CashPayment));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.Check:
            yield put(AppActions.setScreen(ScreenEnum.PaymentMethod));
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
          case PaymentMethodTypeEnum.None:
            if (isBoxOffice) {
              yield put(AppActions.setScreen(ScreenEnum.CustomerPhoneNumber));
            } else {
              yield put(AppActions.setScreen(ScreenEnum.UserEmail));
            }
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
            return;
        }
      }

    case ScreenEnum.CardReader:
      yield put(OrderActions.cancelStripeTerminalPayment());
      yield put(AppActions.setScreen(ScreenEnum.ConfirmOrder));
      return;

    default:
      yield put(AppActions.setScreen(ScreenEnum.Tickets));
      yield put(AppActions.resetApp());
      return;
  }
}

/************************************************************
 *  App Notification
 ***********************************************************/

function* showNotificationWatch() {
  yield takeLatest(AppActionTypes.SHOW_NOTIFICATION, showNotificationSaga);
}

function* showNotificationSaga(action: AppActions.ShowNotificationAction) {
  yield call(async () => await wait(7000));
  yield put(AppActions.hideNotification());
}
