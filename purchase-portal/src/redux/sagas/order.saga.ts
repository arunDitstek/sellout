import { all, takeLatest, put, select, call } from "redux-saga/effects";
import * as AppActions from "../actions/app.actions";
import { OrderReducerState } from "../reducers/order.reducer";
import * as OrderActions from "..//actions/order.actions";
import { OrderActionTypes } from "../actions/order.actions";
import { PurchasePortalState } from "../store";
import { ErrorKeyEnum, ScreenEnum } from "../reducers/app.reducer";
import client from "../../graphql/client";
import * as StripeService from "../../utils/StripeService";
import CREATE_ORDER from "@sellout/models/.dist/graphql/mutations/createOrder.mutation";
import CREATE_SEASON_ORDER from "@sellout/models/.dist/graphql/mutations/createSeasonOrder.mutation";
import CREATE_ORDER_PAYMENT_INTENT from "@sellout/models/.dist/graphql/mutations/createOrderPaymentIntent.mutation";
import CREATE_STRIPE_TERMINAL_CONNECTION_TOKEN from "@sellout/models/.dist/graphql/mutations/createStripeTerminalConnectionToken.mutation";
import CREATE_SEASON_ORDER_PAYMENT_INTENT from "@sellout/models/.dist/graphql/mutations/createSeasonOrderPaymentIntent.mutation";
import GET_ALREADY_PURCHASED_TICKET from "@sellout/models/.dist/graphql/queries/ticketRestriction.query";
import * as ErrorUtil from "../../utils/ErrorUtil";
import {
  loadStripeTerminal,
  ErrorResponse,
  DiscoverResult,
  ISdkManagedPaymentIntent,
} from "@stripe/terminal-js";
import * as StripeTerminalReaderUtil from "../../utils/StripeTerminalReaderUtil";
import purchasePortalModeToOrderChannel from "../../utils/purchasePortalModeToOrderChannel";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import axios from "axios";
import * as CryptoJS from "crypto-js";

export default function* userSaga() {
  try {
    yield all([
      createCardEntryOrderWatch(),
      createTerminalOrderWatch(),
      createOrderWatch(),
      createOrderPaymentIntentWatch(),
      confirmCardPaymentWatch(),
      initializeStripeTerminalWatch(),
      discoverStripeTerminalReadersWatch(),
      connectToStripeTerminalReaderSagaWatch(),
      collectStripeTerminalPaymentSagaWatch(),
      cancelStripeTerminalPaymentSagaWatch(),
      processStripeTerminalPaymentSagaWatch(),
      setGuestMemberValidationSagaWatch(),
      setMemberIdAlreadyPurchasedATicketValidSagaWatch(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

// function* setErrors(err: string) {
//   yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, err))
// }

/********************************************************************************
 *  Create Card Entry Order
 *******************************************************************************/

function* createCardEntryOrderWatch() {
  yield takeLatest(
    OrderActionTypes.CREATE_CARD_ENTRY_ORDER,
    createCardEntryOrderSaga
  );
}

function* createCardEntryOrderSaga({
  payload,
}: OrderActions.CreateCardEntryOrderAction) {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );

  yield put(AppActions.setLoading(true));
  yield put(OrderActions.createOrderPaymentIntent());
  yield takeLatest(
    OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_SUCCESS,
    function* () {
      yield put(OrderActions.confirmCardPayment());
      yield takeLatest(
        OrderActionTypes.CONFIRM_CARD_PAYMENT_SUCCESS,
        function* () {
          yield put(OrderActions.createOrder());
        }
      );
    }
  );
}

/********************************************************************************
 *  Create Terminal Order
 *******************************************************************************/

function* createTerminalOrderWatch() {
  yield takeLatest(
    OrderActionTypes.CREATE_TERMINAL_ORDER,
    createTerminalOrderSaga
  );
}

function* createTerminalOrderSaga({
  payload,
}: OrderActions.CreateTerminalOrderAction) {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );

  yield put(OrderActions.initializeStripeTerminal());
  yield takeLatest(
    OrderActionTypes.INITIALIZE_STRIPE_TERMINAL_SUCCESS,
    function* () {
      yield put(OrderActions.discoverStripeTerminalReaders());
      yield takeLatest(
        OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS,
        function* ({
          payload,
        }: OrderActions.DiscoverStripeTerminalReadersSuccessAction) {
          const defaultReader = StripeTerminalReaderUtil.getDefaultReader(
            payload.readers
          );
          if (defaultReader) {
            yield put(
              OrderActions.connectToStripeTerminalReader(defaultReader)
            );
          }
        }
      );
    }
  );
}

/********************************************************************************
 *  Create Order
 *******************************************************************************/

function* createOrderWatch() {
  yield takeLatest(OrderActionTypes.CREATE_ORDER, createOrderSaga);
}
function* createOrderSaga({ payload }: OrderActions.CreateOrderAction) {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );

  const { createOrderParams } = order;
  const modifiedOrderParams = { ...createOrderParams };

  const removeUpgradeDescription = modifiedOrderParams.upgrades.map(
    ({ description, ...rest }) => ({ ...rest })
  );
  
  modifiedOrderParams.upgrades = removeUpgradeDescription;
  
  let modifiedParamsWithDiscount: Record<string, any> = { ...modifiedOrderParams };
  
  if (modifiedParamsWithDiscount.eventId) {
    modifiedParamsWithDiscount = {
      ...modifiedParamsWithDiscount,
      discountAmount: createOrderParams.discountAmount,
      discountCode: createOrderParams.discountCode,
    };
  }
  else if (modifiedParamsWithDiscount.seasonId) {
    const { discountAmount, discountCode, ...paramsWithoutDiscount } = modifiedParamsWithDiscount;
    modifiedParamsWithDiscount = paramsWithoutDiscount;
  }

  yield put(AppActions.setLoading(true));
  try {
    const res: {
      data: any;
    } = yield call(async () => {
      if (modifiedParamsWithDiscount.eventId) {
        return await client.mutate({
          mutation: CREATE_ORDER,
          variables: {
            params: modifiedParamsWithDiscount,
          },
        });
      } else if (modifiedParamsWithDiscount.seasonId) {
        return await client.mutate({
          mutation: CREATE_SEASON_ORDER,
          variables: {
            params: modifiedParamsWithDiscount,
          },
        });
      }
    });

    if (createOrderParams.eventId) {
      yield put(OrderActions.createOrderSuccess(res?.data?.createOrder));
    } else if (createOrderParams.seasonId) {
      yield put(OrderActions.createOrderSuccess(res?.data?.createSeasonOrder));
    }

    yield put(AppActions.setLoading(false));
    const SeatingPlanTimer = 0;
    yield put(AppActions.setSeatTimer({ SeatingPlanTimer }));
    yield put(AppActions.setScreen(ScreenEnum.OrderConfirmed));
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);

    if (errorMsg.length > 0) {
      yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));
    }
    yield put(OrderActions.createOrderFailure(errorMsg));
    yield put(AppActions.setLoading(false));
  }
}

/********************************************************************************
 *  Create Order Payment Intent
 *******************************************************************************/

function* createOrderPaymentIntentWatch() {
  yield takeLatest(
    OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT,
    createOrderPaymentIntentSaga
  );
}

function* createOrderPaymentIntentSaga({
  payload,
}: OrderActions.CreateOrderPaymentIntentAction) {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );
  const {
    app: { mode, memberId,eventsCache,eventId }
  } = yield select((state: PurchasePortalState) => state);

  const { paymentMethodId, createOrderParams } = order;
  const removeUpgradeDescription = createOrderParams.upgrades.map(
    ({ description, ...rest }) => ({ ...rest })
  );
  const event = eventsCache[eventId];
  createOrderParams.upgrades = removeUpgradeDescription;
  memberId && event?.organization?.isTegIntegration &&
    createOrderParams.tickets.map(
      (a) =>
        memberId && (a.teiMemberId = memberId === "undefined" ? "" : memberId)
    );
  try {
    const res: { data: any } = yield call(async () => {
      if (createOrderParams?.eventId) {
        return await client.mutate({
          mutation: CREATE_ORDER_PAYMENT_INTENT,
          variables: {
            params: {
              userId: createOrderParams.userId,
              channel: purchasePortalModeToOrderChannel(mode),
              orgId: createOrderParams.orgId,
              eventId: createOrderParams.eventId,
              tickets: createOrderParams.tickets,
              upgrades: createOrderParams.upgrades,
              promotionCode: createOrderParams.promotionCode
                ? createOrderParams.promotionCode
                : createOrderParams.discountCode,
              discountCode: createOrderParams.discountCode,
              paymentMethodType: createOrderParams.paymentMethodType,
              paymentMethodId: paymentMethodId,
              stalePaymentIntentId: createOrderParams.paymentIntentId,
            },
          },
        });
      } else if (createOrderParams?.seasonId) {
        return await client.mutate({
          mutation: CREATE_SEASON_ORDER_PAYMENT_INTENT,
          variables: {
            params: {
              userId: createOrderParams.userId,
              channel: purchasePortalModeToOrderChannel(mode),
              orgId: createOrderParams.orgId,
              seasonId: createOrderParams.seasonId,
              tickets: createOrderParams.tickets,
              upgrades: createOrderParams.upgrades,
              promotionCode: createOrderParams.promotionCode
                ? createOrderParams.promotionCode
                : createOrderParams.discountCode,
              paymentMethodType: createOrderParams.paymentMethodType,
              paymentMethodId: paymentMethodId,
              stalePaymentIntentId: createOrderParams.paymentIntentId,
            },
          },
        });
      }
    });

    const paymentIntentId = createOrderParams.eventId
      ? res.data.createOrderPaymentIntent.paymentIntentId
      : res.data.createSeasonOrderPaymentIntent.paymentIntentId;
    const clientSecret = createOrderParams.eventId
      ? res.data.createOrderPaymentIntent.clientSecret
      : res.data.createSeasonOrderPaymentIntent.clientSecret;

    yield put(
      OrderActions.createOrderPaymentIntentSuccess(
        paymentIntentId,
        clientSecret
      )
    );
  } catch (error) {
    const errorMsg = ErrorUtil.getErrorMessage(error);
    if (errorMsg.length > 0) {
      yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));
    }
    yield put(OrderActions.createOrderPaymentIntentFailure(errorMsg));
    yield put(AppActions.setLoading(false));
    // HANDLE ERROR
    //  const errorMsg = ErrorUtil.getErrorMessage(error);
    //  yield put(ArtistActions.createArtistFailure(errorMsg));
  }
}

/********************************************************************************
 *  Confirm Card Payment
 *******************************************************************************/

function* confirmCardPaymentWatch() {
  yield takeLatest(
    OrderActionTypes.CONFIRM_CARD_PAYMENT,
    confirmCardPaymentSaga
  );
}

function* confirmCardPaymentSaga({
  payload,
}: OrderActions.ConfirmCardPaymentAction) {
  const { paymentClientSecret }: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );

  const stripeInjection = StripeService.stripe();

  if (!stripeInjection) {
    // HANDLE ERROR
    console.error("NO STRIPE INJECTION");
    return;
  }

  const { stripe } = stripeInjection;

  try {
    const { error } = yield call(async () => {
      return await stripe.confirmCardPayment(paymentClientSecret);
    });

    if (error) {
      yield put(
        AppActions.setError(ErrorKeyEnum.ConFirmOrderError, error?.message)
      );
      console.error(error);
      yield put(AppActions.setLoading(false));
      yield put(OrderActions.confirmCardPaymentFailure(error));
    } else {
      yield put(OrderActions.confirmCardPaymentSuccess());
    }
  } catch (error) {
    // HANDLE ERROR
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(OrderActions.confirmCardPaymentFailure(errorMsg));
  }
}

/********************************************************************************
 *  Initialize Stripe Terminal
 *******************************************************************************/

function* initializeStripeTerminalWatch() {
  yield takeLatest(
    OrderActionTypes.INITIALIZE_STRIPE_TERMINAL,
    initializeStripeTerminal
  );
}

function* initializeStripeTerminal({
  payload,
}: OrderActions.InitializeStripeTerminalAction) {
  try {
    const StripeTerminal: { create: any } = yield call(
      async () => await loadStripeTerminal()
    );
    const terminal = StripeTerminal?.create({
      onFetchConnectionToken: async () => {
        const { data, errors } = await client.mutate({
          mutation: CREATE_STRIPE_TERMINAL_CONNECTION_TOKEN,
        });

        const aa = getErrorMessage(errors);
        return data?.createStripeTerminalConnectionToken;
      },
      onUnexpectedReaderDisconnect: (e: any) => {
        console.error(e);
      },
    });

    StripeService.setStripeTerminal(terminal || null);

    yield put(AppActions.setScreen(ScreenEnum.CardReader));
    yield put(OrderActions.initializeStripeTerminalSuccess());
  } catch (e) {
    const errorMsg = getErrorMessage(e);
    yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));

    // HANDLE ERROR
    console.error(e);
  }
}

/********************************************************************************
 *  Discover Stripe Terminal Readers
 *******************************************************************************/

function isDiscoverErrorResponse(
  response: DiscoverResult | ErrorResponse
): response is ErrorResponse {
  return (response as ErrorResponse).error !== undefined;
}

function* discoverStripeTerminalReadersWatch() {
  yield takeLatest(
    OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS,
    discoverStripeTerminalReaders
  );
}

function* discoverStripeTerminalReaders({
  payload,
}: OrderActions.DiscoverStripeTerminalReadersAction) {
  try {
    yield put(AppActions.setLoading(true));

    const stripeTerminalInjection = StripeService.stripeTerminal();

    if (!stripeTerminalInjection) {
      // HANDLE ERROR
      console.error("NO STRIPE TERMINAL INJECTION");
      return;
    }

    const { terminal } = stripeTerminalInjection;
    const discoverResult: DiscoverResult | ErrorResponse = yield call(
      async () => {
        // return await connectReaderHandler()
        const config = { simulated: false };
        const readers = await terminal.discoverReaders(config);
        return readers;
      }
    );

    if (isDiscoverErrorResponse(discoverResult)) {
      // HANDLE ERROR
      console.log("Error in Discovery");
    } else {
      yield put(
        OrderActions.discoverStripeTerminalReadersSuccess(
          discoverResult.discoveredReaders
        )
      );
      yield put(AppActions.setLoading(false));
    }
  } catch (e) {
    // HANDLE ERROR
    console.error(e);
    yield put(AppActions.setLoading(false));
  }
}

/********************************************************************************
 *  Connect to Stripe Terminal Reader
 *******************************************************************************/

function* connectToStripeTerminalReaderSagaWatch() {
  yield takeLatest(
    OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER,
    connectToStripeTerminalReaderSaga
  );
}

function* connectToStripeTerminalReaderSaga({
  payload,
}: OrderActions.ConnectToStripeTerminalReaderAction) {
  try {
    yield put(AppActions.setLoading(true));
    const stripeTerminalInjection = StripeService.stripeTerminal();

    if (!stripeTerminalInjection) {
      // HANDLE ERROR
      console.error("NO STRIPE TERMINAL INJECTION");
      return;
    }

    const { terminal } = stripeTerminalInjection;

    const { lastSelectedReader }: OrderReducerState = yield select(
      (state: PurchasePortalState) => state.order
    );

    // Disconnect from the current reader
    if (lastSelectedReader) {
      try {
        yield call(async () => {
          console.log("CANCEL COLLECT");
          return await terminal.cancelCollectPaymentMethod();
        });

        yield call(async () => {
          console.log("DISCONNECT FROM READER");
          return await terminal.disconnectReader();
        });
      } catch (e) {
        // HANDLE ERROR
        console.error(e);
      }
    }

    const connectResult: { error: any } = yield call(async () => {
      return await terminal.connectReader(payload.reader);
    });

    // Set the default reader so next time
    // this browser automatically connects to the
    // last used reader
    StripeTerminalReaderUtil.setDefaultReaderId(payload.reader.id);

    if (connectResult.error) {
      console.error(connectResult.error);
      yield put(AppActions.setLoading(false));
      // HANDLE ERROR
    } else {
      yield put(
        OrderActions.connectToStripeTerminalReaderSuccess(payload.reader)
      );
      yield put(AppActions.setLoading(false));
    }
  } catch (e) {
    // HANDLE ERROR
    console.error(e);
  }
}

/********************************************************************************
 *  Collect Stripe Terminal Payment
 *******************************************************************************/

function* collectStripeTerminalPaymentSagaWatch() {
  yield takeLatest(
    [OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS],
    collectStripeTerminalPaymentSaga
  );
}

function* collectStripeTerminalPaymentSaga({
  payload,
}: OrderActions.CollectStripeTerminalPaymentAction) {
  try {
    const stripeTerminalInjection = StripeService.stripeTerminal();

    if (!stripeTerminalInjection) {
      // HANDLE ERROR
      console.error("NO STRIPE TERMINAL INJECTION");
      return;
    }

    yield put(OrderActions.createOrderPaymentIntent());

    yield takeLatest(
      OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_SUCCESS,
      function* () {
        const { terminal } = stripeTerminalInjection;

        const { paymentClientSecret }: OrderReducerState = yield select(
          (state: PurchasePortalState) => state.order
        );

        const collectResult: { error: any; paymentIntent: any } = yield call(
          async () => {
            return await terminal.collectPaymentMethod(
              paymentClientSecret as string
            );
          }
        );

        if (collectResult.error) {
          // HANDLE ERROR
          console.error(collectResult.error);
          yield put(AppActions.setLoading(false));
        } else {
          yield put(
            OrderActions.collectStripeTerminalPaymentSuccess(
              collectResult.paymentIntent
            )
          );
        }
      }
    );
  } catch (e) {
    // HANDLE ERROR
    console.error(e);
  }
}

/********************************************************************************
 *  Cancel Stripe Terminal Payment
 *******************************************************************************/

function* cancelStripeTerminalPaymentSagaWatch() {
  yield takeLatest(
    [OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT],
    cancelStripeTerminalPaymentSaga
  );
}

function* cancelStripeTerminalPaymentSaga({
  payload,
}: OrderActions.CancelStripeTerminalPaymentAction) {
  try {
    const stripeTerminalInjection = StripeService.stripeTerminal();

    if (!stripeTerminalInjection) {
      // HANDLE ERROR
      console.error("NO STRIPE TERMINAL INJECTION");
      return;
    }

    const { terminal } = stripeTerminalInjection;

    const { lastSelectedReader }: OrderReducerState = yield select(
      (state: PurchasePortalState) => state.order
    );

    // Disconnect from the current reader
    console.log(lastSelectedReader);
    if (lastSelectedReader) {
      console.log(lastSelectedReader);
      try {
        yield call(async () => {
          console.log("CANCEL COLLECT");
          return await terminal.cancelCollectPaymentMethod();
        });

        yield call(async () => {
          console.log("DISCONNECT FROM READER");
          return await terminal.disconnectReader();
        });
      } catch (e) {
        // HANDLE ERROR
        console.error(e);
      }
    }

    yield put(OrderActions.cancelStripeTerminalPaymentSuccess());
  } catch (e) {
    // HANDLE ERROR
    console.error(e);
  }
}

/********************************************************************************
 *  Process Stripe Terminal Payment
 *******************************************************************************/

function* processStripeTerminalPaymentSagaWatch() {
  yield takeLatest(
    [OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS],
    processStripeTerminalPaymentSaga
  );
}

function* processStripeTerminalPaymentSaga({
  payload,
}: OrderActions.ProcessStripeTerminalPaymentAction) {
  try {
    yield put(AppActions.setLoading(true));

    const stripeTerminalInjection = StripeService.stripeTerminal();

    if (!stripeTerminalInjection) {
      // HANDLE ERROR
      console.error("NO STRIPE TERMINAL INJECTION");
      return;
    }

    const { terminal } = stripeTerminalInjection;

    const { paymentIntent }: OrderReducerState = yield select(
      (state: PurchasePortalState) => state.order
    );

    const processResult: { error: any } = yield call(async () => {
      return await terminal.processPayment(
        paymentIntent as ISdkManagedPaymentIntent
      );
    });

    if (processResult.error) {
      // HANDLE ERROR
      console.error(processResult.error);
      yield put(
        AppActions.setError(
          ErrorKeyEnum.ConFirmOrderError,
          processResult.error.message
        )
      );
      yield put(AppActions.setLoading(false));
    } else {
      yield put(OrderActions.processStripeTerminalPaymentSuccess());
      yield put(OrderActions.createOrder());
    }
  } catch (e) {
    // HANDLE ERROR
    console.error(e);
    yield put(AppActions.setLoading(false));
  }
}

/********************************************************************************
 *  Guest Member Validation
 *******************************************************************************/

function* setGuestMemberValidationSagaWatch() {
  yield takeLatest(
    OrderActionTypes.GUST_MEMBER_VALIDATION,
    setGuestMemberValidation
  );
}

function* setGuestMemberValidation() {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );
  // const dispatch = useDispatch();
  const { app } = yield select((state: PurchasePortalState) => state);
  const { eventId, eventsCache, seasonId, seasonsCache } = app;
  const {
    createOrderParams: { tickets },
    ticketRestriction,
  } = order;
  const event = eventsCache[eventId];
  const season = seasonsCache[seasonId];
  const urlPath = event
    ? event?.organization?.tegURL
    : season?.organization?.tegURL;

  const hasDuplicate = (tickets: any) => {
    let duplicate: any = {};
    for (const ticket of tickets) {
      const ticketsWithSameTEI = tickets.find(
        (x: any) =>
          x.teiMemberId === ticket.teiMemberId &&
          x.seat !== ticket.seat &&
          !x.guestTicket
      );
      if (ticketsWithSameTEI && !ticket.guestTicket) {
        duplicate[ticket.teiMemberId] = 1;
      }
    }
    return Object.keys(duplicate).length;
  };

  let memberIds = [] as any;
  order.createOrderParams.tickets.map((a) => memberIds.push(a.teiMemberId));
  const allowGuestPerMember = Number(event?.guestTicketPerMember);
  let errorMsg = "";

  let error: any = {};
  for (const item of tickets) {
    const { teiMemberId, guestTicket } = item;
    const totalGuestPerMember = tickets.filter(
      (el) => el.teiMemberId === teiMemberId && el.guestTicket === true
    ).length;
    const guestTicketCounts = ticketRestriction?.guestTicketCounts || [];
    const alreadyUsedCount =
      guestTicketCounts.filter((x) => x.teiMemberId == teiMemberId) || 0;
    const invalidMember = guestTicketCounts.filter(
      (el) => el.inValid && el.teiMemberId === teiMemberId
    );
    if (
      totalGuestPerMember + Number(alreadyUsedCount[0]?.count) >
        allowGuestPerMember &&
      teiMemberId
    ) {
      error[
        teiMemberId
      ] = `Member ID (${teiMemberId}) has already purchased the maximum guest tickets for this event.`;
    } else if (
      teiMemberId &&
      invalidMember.length > 0 &&
      guestTicket === false
    ) {
      error[
        teiMemberId
      ] = `Member ID (${teiMemberId}) has already purchased a ticket for this ${
        event ? "event" : "season"
      }.`;
    } else if (
      Number(alreadyUsedCount[0]?.count) === allowGuestPerMember &&
      invalidMember.length > 0 &&
      teiMemberId
    ) {
      error[
        teiMemberId
      ] = `This member ID (${teiMemberId}) has already purchased a ticket for this event.`;
    }
  }

  const CLIENT_ID = event
    ? event?.organization?.tegClientID
    : season?.organization?.tegClientID;

  const CLIENT_SECRET_ID = event
    ? event?.organization?.tegSecret
    : season?.organization?.tegSecret;

  const CLIENT_ENCTYPTION_TOKEN = `${urlPath}/Auth/ClientEncryptionToken`;

  const AUTHENTICATE_CLIENT_TOKEN = `${urlPath}/Auth/AuthenticateClient`;

  const MEMBER_ID_VALIDATION = `${urlPath}/api/v1/contacts/MemberValidator/ValidateMemberIds?MemberIDs=`;
  yield put(AppActions.setLoading(true));

  let encyptionConfig = {
    method: "post",
    url: CLIENT_ENCTYPTION_TOKEN,
    headers: {
      ContentType: "application/json",
    },
    data: { ClientID: CLIENT_ID },
  };

  try {
    const processResult: { data: any; error: any } = yield call(async () => {
      return await axios(encyptionConfig);
    });

    const clientEncryptionToken = processResult?.data?.Token;

    const HMAC_SHA_256 = CryptoJS.HmacSHA256(
      CLIENT_SECRET_ID,
      clientEncryptionToken
    ).toString();

    const BASE_64_HMAC_TOKEN = Buffer.from(
      `${CLIENT_ID}:${HMAC_SHA_256}`
    ).toString("base64");

    let authenticateClientConfig = {
      method: "post",
      url: AUTHENTICATE_CLIENT_TOKEN,
      headers: {
        Authorization: `Basic ${BASE_64_HMAC_TOKEN}`,
        ContentType: "application/json",
      },
      data: { ClientID: CLIENT_ID },
    };

    const authenticationResponse: { data: any; error: any } = yield call(
      async () => {
        return await axios(authenticateClientConfig);
      }
    );

    let validationConfig = {
      method: "get",
      url: `${MEMBER_ID_VALIDATION}${memberIds.toString()}`,
      headers: {
        Authorization: `Bearer ${authenticationResponse?.data.access_token}`,
        ContentType: "application/json",
      },
    };

    try {
      const memberValidationResponse: { data: any; error: any } = yield call(
        async () => {
          return await axios(validationConfig);
        }
      );
      yield put(AppActions.setLoading(false));
      yield put(
        OrderActions.setMemberIdStatusValid(
          memberValidationResponse.data.Members
        )
      );
    } catch (error) {
      const ticketsEmpty = tickets.map(
        (t) => t.teiMemberId === "" || t.teiMemberId === undefined
      );
      if (ticketsEmpty.length > 0) {
        errorMsg = `All fields are required.`;
        yield put(
          AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg)
        );
        yield put(AppActions.setLoading(false));
      }
    }

    const validMemberTickets = order.createOrderParams.tickets.filter(
      (a) => a.isMemberIdValid
    ).length;

    let memberId = [] as any;
    order.createOrderParams.tickets.map(
      (a) => a.teiMemberId && memberId.push(a.teiMemberId)
    );

    const isMemberIdEmpty = tickets.some(
      (el) => el.teiMemberId === "" || el.teiMemberId === undefined
    );
    if (
      event &&
      order.createOrderParams.tickets.length === validMemberTickets
    ) {
      if (order.createOrderParams.tickets) {
        if (!app.errors.ConFirmOrderError.includes("Duplicate")) {
          if (Object.keys(error).length) {
            const err: any = Object.values(error)[0];
            console.log("ConFirmOrderError", err);
            yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, err));
          } else {
            yield put(AppActions.navigateForward());
          }
        } else {
          yield put(
            AppActions.setError(
              ErrorKeyEnum.ConFirmOrderError,
              "Duplicate member IDs must be marked as guests."
            )
          );
        }
      }
    } else if (isMemberIdEmpty) {
      errorMsg = `All fields are required.`;
      yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));
    }

    if (
      season &&
      order.createOrderParams.tickets.length === validMemberTickets
    ) {
      if (Object.keys(error).length) {
        const err: any = Object.values(error)[0];
        yield put(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, err));
      } else {
        yield put(AppActions.seasonNavigateForward());
      }
    }
  } catch (error) {}
}

/********************************************************************************
 *  Set Member Id Already Purchased A Ticket Validation
 *******************************************************************************/

function* setMemberIdAlreadyPurchasedATicketValidSagaWatch() {
  yield takeLatest(
    OrderActionTypes.GET_TICKET_RESTRICTION_VALID,
    SetMemberIdAlreadyPurchasedATicketValid
  );
}

function* SetMemberIdAlreadyPurchasedATicketValid() {
  const order: OrderReducerState = yield select(
    (state: PurchasePortalState) => state.order
  );
  const { app } = yield select((state: PurchasePortalState) => state);
  const { eventId, eventsCache, seasonId, seasonsCache } = app;
  const event = eventsCache[eventId];
  const season = seasonsCache[seasonId];
  let memberIds = [] as any;
  order.createOrderParams.tickets.map((a) => {
    if (a.teiMemberId !== "") {
      memberIds.push(a.teiMemberId);
    }
  });
  try {
    const res: { data: any } = yield call(async () => {
      return await client.query({
        query: GET_ALREADY_PURCHASED_TICKET,
        variables: {
          query: {
            eventId: event?._id || "",
            seasonId: season?._id || "",
            teiMemberId: memberIds,
          },
        },
        fetchPolicy: "network-only",
      });
    });
    const { ticketRestriction } = res.data;

    yield put(
      OrderActions.setTicketRestrictionAction(ticketRestriction as any)
    );
    yield put(OrderActions.setGuestMemberValidation());
  } catch (error) {
    const errorMsg = ErrorUtil.getErrorMessage(error);
    yield put(AppActions.setError(ErrorKeyEnum.Global, errorMsg));
  }
}
