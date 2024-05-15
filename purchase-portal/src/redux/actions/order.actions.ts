import IEvent, { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import Partial from "../../models/interfaces/Partial";
import Required from "../../models/interfaces/Required";
import ICreateOrderParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import IOrderTicketRestrictedParams from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import { ISdkManagedPaymentIntent, Reader } from "@stripe/terminal-js";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";

export const OrderActionTypes = {
  SET_CREATE_ORDER_PARAMS: "SET_CREATE_ORDER_PARAMS",
  SET_INITIAL_CREATE_ORDER_PARAMS: "SET_INITIAL_CREATE_ORDER_PARAMS",
  SET_ORDER_CUSTOM_FIELD: "SET_ORDER_CUSTOM_FIELD",
  ADD_TICKET_TYPE: "ADD_TICKET_TYPE",
  REMOVE_TICKET_TYPE: "REMOVE_TICKET_TYPE",
  UPDATE_UPGRADE_COUNT: "UPDATE_UPGRADE_COUNT",
  SET_PAYMENT_METHOD_ID: "SET_PAYMENT_METHOD_ID",
  SET_CASH_TENDERED: "SET_CASH_TENDERED",
  // Create Card Entry Order
  CREATE_CARD_ENTRY_ORDER: "CREATE_CARD_ENTRY_ORDER",
  CREATE_CARD_ENTRY_ORDER_SUCCESS: "CREATE_CARD_ENTRY_ORDER_SUCCESS",
  CREATE_CARD_ENTRY_ORDER_FAILURE: "CREATE_CARD_ENTRY_ORDER_FAILURE",
  // Create Terminal Order
  CREATE_TERMINAL_ORDER: "CREATE_TERMINAL_ORDER",
  CREATE_TERMINAL_ORDER_SUCCESS: "CREATE_TERMINAL_ORDER_SUCCESS",
  CREATE_TERMINAL_ORDER_FAILURE: "CREATE_TERMINAL_ORDER_FAILURE",
  // Create Order
  CREATE_ORDER: "CREATE_ORDER",
  CREATE_ORDER_SUCCESS: "CREATE_ORDER_SUCCESS",
  CREATE_ORDER_FAILURE: "CREATE_ORDER_FAILURE",
  // Create Order Payment Intent
  CREATE_ORDER_PAYMENT_INTENT: "CREATE_ORDER_PAYMENT_INTENT",
  CREATE_ORDER_PAYMENT_INTENT_SUCCESS: "CREATE_ORDER_PAYMENT_INTENT_SUCCESS",
  CREATE_ORDER_PAYMENT_INTENT_FAILURE: "CREATE_ORDER_PAYMENT_INTENT_FAILURE",
  SET_SEASON_INITIAL_CREATE_ORDER_PARAMS:
    "SET_SEASON_INITIAL_CREATE_ORDER_PARAMS",
  // Confirm Card Payment
  CONFIRM_CARD_PAYMENT: "CONFIRM_CARD_PAYMENT",
  CONFIRM_CARD_PAYMENT_SUCCESS: "CONFIRM_CARD_PAYMENT_SUCCESS",
  CONFIRM_CARD_PAYMENT_FAILURE: "CONFIRM_CARD_PAYMENT_FAILURE",
  // Initialize Stripe Terminal
  INITIALIZE_STRIPE_TERMINAL: "INITIALIZE_STRIPE_TERMINAL",
  INITIALIZE_STRIPE_TERMINAL_SUCCESS: "INITIALIZE_STRIPE_TERMINAL_SUCCESS",
  INITIALIZE_STRIPE_TERMINAL_FAILURE: "INITIALIZE_STRIPE_TERMINAL_FAILURE",
  // Discover Stripe Terminal Readers
  DISCOVER_STRIPE_TERMINAL_READERS: "DISCOVER_STRIPE_TERMINAL_READERS",
  DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS:
    "DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS",
  DISCOVER_STRIPE_TERMINAL_READERS_FAILURE:
    "DISCOVER_STRIPE_TERMINAL_READERS_FAILURE",
  // Connect to Stripe Terminal Reader
  CONNECT_TO_STRIPE_TERMINAL_READER: "CONNECT_TO_STRIPE_TERMINAL_READER",
  CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS:
    "CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS",
  CONNECT_TO_STRIPE_TERMINAL_READER_FAILURE:
    "CONNECT_TO_STRIPE_TERMINAL_READER_FAILURE",
  // Collect Stripe Terminal Payment
  COLLECT_STRIPE_TERMINAL_PAYMENT: "COLLECT_STRIPE_TERMINAL_PAYMENT",
  COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS:
    "COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS",
  COLLECT_STRIPE_TERMINAL_PAYMENT_FAILURE:
    "COLLECT_STRIPE_TERMINAL_PAYMENT_FAILURE",
  // Cancel Stripe Terminal Payment
  CANCEL_STRIPE_TERMINAL_PAYMENT: "CANCEL_STRIPE_TERMINAL_PAYMENT",
  CANCEL_STRIPE_TERMINAL_PAYMENT_SUCCESS:
    "CANCEL_STRIPE_TERMINAL_PAYMENT_SUCCESS",
  CANCEL_STRIPE_TERMINAL_PAYMENT_FAILURE:
    "CANCEL_STRIPE_TERMINAL_PAYMENT_FAILURE",
  // Process Stripe Terminal Payment
  PROCESS_STRIPE_TERMINAL_PAYMENT: "PROCESS_STRIPE_TERMINAL_PAYMENT",
  PROCESS_STRIPE_TERMINAL_PAYMENT_SUCCESS:
    "PROCESS_STRIPE_TERMINAL_PAYMENT_SUCCESS",
  PROCESS_STRIPE_TERMINAL_PAYMENT_FAILURE:
    "PROCESS_STRIPE_TERMINAL_PAYMENT_FAILURE",
  // Set Member
  SET_MEMBER_ID: "SET_MEMBER_ID",
  GUST_MEMBER_VALIDATION: "GUST_MEMBER_VALIDATION",
  SET_MEMBER_ID_STATUS_VALID: "SET_MEMBER_ID_STATUS_VALID",
  GET_TICKET_RESTRICTION_VALID: "GET_TICKET_RESTRICTION_VALID",
  SET_TICKET_RESTRICTION_VALID: "SET_TICKET_RESTRICTION_VALID",
  SET_GUEST_CHECKOUT: "SET_GUEST_CHECKOUT",
  SET_GUEST_CHECKOUT_EMAIL: "SET_GUEST_CHECKOUT_EMAIL",
  SET_UPGRADES_ONLY: "SET_UPGRADES_ONLY",
  SET_APPLIED_DISCOUNT: "SET_APPLIED_DISCOUNT",
};

/********************************************************************************
 *  Order Action Creators
 *******************************************************************************/

export type OrderActionCreatorTypes =
  | SetCreateOrderParamsAction
  | SetInitialCreateOrderParamsAction
  | SetOrderCustomFieldAction
  | AddTicketTypeAction
  | RemoveTicketTypeAction
  | UpdateUpgradeCountAction
  | SetPaymentMethodId
  | SetCashTenderedAction
  // Create Card Entry Order
  | CreateCardEntryOrderAction
  | CreateCardEntryOrderSuccessAction
  | CreateCardEntryOrderFailureAction
  // Create Terminal Order
  | CreateTerminalOrderAction
  | CreateTerminalOrderSuccessAction
  | CreateTerminalOrderFailureAction
  // Create Order
  | CreateOrderAction
  | CreateOrderSuccessAction
  | CreateOrderFailureAction
  // Create Order Payment Intent
  | CreateOrderPaymentIntentAction
  | CreateOrderPaymentIntentSuccessAction
  | CreateOrderPaymentIntentFailureAction
  // Confirm Card Payment
  | ConfirmCardPaymentAction
  | ConfirmCardPaymentSuccessAction
  | ConfirmCardPaymentFailureAction
  // Initialize Stripe Terminal
  | InitializeStripeTerminalAction
  | InitializeStripeTerminalSuccessAction
  | InitializeStripeTerminalSuccessAction
  // Discover Stripe Terminal Readers
  | DiscoverStripeTerminalReadersAction
  | DiscoverStripeTerminalReadersSuccessAction
  | DiscoverStripeTerminalReadersFailureAction
  // Connect to Stripe Terminal Reader
  | ConnectToStripeTerminalReaderAction
  | ConnectToStripeTerminalReaderSuccessAction
  | ConnectToStripeTerminalReaderFailureAction
  // Collect Stripe Terminal Payment
  | CollectStripeTerminalPaymentAction
  | CollectStripeTerminalPaymentSuccessAction
  | CollectStripeTerminalPaymentFailureAction
  // Cancel Stripe Terminal Payment
  | CancelStripeTerminalPaymentAction
  | CancelStripeTerminalPaymentSuccessAction
  | CancelStripeTerminalPaymentFailureAction
  // Process Stripe Terminal Payment
  | ProcessStripeTerminalPaymentAction
  | ProcessStripeTerminalPaymentSuccessAction
  | ProcessStripeTerminalPaymentFailureAction
  // Set Member
  | SetMemberIdAction
  | SetGuestMemberValidation
  | SetMemberIdStatusValidAction
  | GetTicketRestrictionAction
  | SetTicketRestrictionAction
  | SetGuestCheckoutAction
  | SetGuestCheckoutEmailAction
  | SetUpgradesOnlyAction
  | SetAppliedDiscountAction;

/****************************************************************************************
  Set Applied discount
****************************************************************************************/

export interface SetAppliedDiscountAction {
  type: typeof OrderActionTypes.SET_APPLIED_DISCOUNT;
  payload: { appliedDiscount: IEventPromotion[]};
}

export function setAppliedDiscounts(
  appliedDiscount: IEventPromotion[]
): SetAppliedDiscountAction {
  return {
    type: OrderActionTypes.SET_APPLIED_DISCOUNT,
    payload: { appliedDiscount },
  };
}

/****************************************************************************************
  Set Guset Member Validation
****************************************************************************************/

export interface SetGuestMemberValidation {
  type: typeof OrderActionTypes.GUST_MEMBER_VALIDATION;
  payload: {};
}

export function setGuestMemberValidation(): SetGuestMemberValidation {
  return {
    type: OrderActionTypes.GUST_MEMBER_VALIDATION,
    payload: {},
  };
}

/****************************************************************************************
  Get Member Id Already Purchased A Ticket Validation
****************************************************************************************/

export interface GetTicketRestrictionAction {
  type: typeof OrderActionTypes.GET_TICKET_RESTRICTION_VALID;
  payload: {};
}

export function getTicketRestrictionAction(): GetTicketRestrictionAction {
  return {
    type: OrderActionTypes.GET_TICKET_RESTRICTION_VALID,
    payload: {},
  };
}

/****************************************************************************************
  Set Member Id Already Purchased A Ticket Validation
****************************************************************************************/

export interface SetTicketRestrictionAction {
  type: typeof OrderActionTypes.SET_TICKET_RESTRICTION_VALID;
  payload: { ticketRestriction: any };
}

export function setTicketRestrictionAction(
  ticketRestriction: Partial<IOrderTicketRestrictedParams>
): SetTicketRestrictionAction {
  return {
    type: OrderActionTypes.SET_TICKET_RESTRICTION_VALID,
    payload: { ticketRestriction },
  };
}

/****************************************************************************************
  Set Guest Checkout
****************************************************************************************/

export interface SetGuestCheckoutAction {
  type: typeof OrderActionTypes.SET_GUEST_CHECKOUT;
  payload: { guestCheckout: boolean };
}

export function setGuestCheckout(
  guestCheckout: boolean
): SetGuestCheckoutAction {
  return {
    type: OrderActionTypes.SET_GUEST_CHECKOUT,
    payload: { guestCheckout },
  };
}

/****************************************************************************************
  Set Upgrades Only
****************************************************************************************/

export interface SetUpgradesOnlyAction {
  type: typeof OrderActionTypes.SET_UPGRADES_ONLY;
  payload: { upgradesOnly: boolean };
}

export function setUpgradesOnly(upgradesOnly: boolean): SetUpgradesOnlyAction {
  return {
    type: OrderActionTypes.SET_UPGRADES_ONLY,
    payload: { upgradesOnly },
  };
}

/****************************************************************************************
  Set Guest Checkout Email
****************************************************************************************/

export interface SetGuestCheckoutEmailAction {
  type: typeof OrderActionTypes.SET_GUEST_CHECKOUT_EMAIL;
  payload: { guestCheckoutEmail: string };
}

export function setGuestCheckoutEmail(
  guestCheckoutEmail: string
): SetGuestCheckoutEmailAction {
  return {
    type: OrderActionTypes.SET_GUEST_CHECKOUT_EMAIL,
    payload: { guestCheckoutEmail },
  };
}

/****************************************************************************************
  Set Create Order Params
****************************************************************************************/

export interface SetCreateOrderParamsAction {
  type: typeof OrderActionTypes.SET_CREATE_ORDER_PARAMS;
  payload: {
    createOrderParams: Partial<ICreateOrderParams>;
  };
}

export function setCreateOrderParams(
  createOrderParams: Partial<ICreateOrderParams>
): SetCreateOrderParamsAction {
  return {
    type: OrderActionTypes.SET_CREATE_ORDER_PARAMS,
    payload: {
      createOrderParams,
    },
  };
}

/****************************************************************************************
  Set Initial Create Order Params
****************************************************************************************/

export interface SetInitialCreateOrderParamsAction {
  type: typeof OrderActionTypes.SET_INITIAL_CREATE_ORDER_PARAMS;
  payload: {
    event: IEventGraphQL;
    channel: OrderChannelEnum;
    isComplimentary: boolean;
  };
}

export function setInitialCreateOrderParams(
  event: IEventGraphQL,
  channel: OrderChannelEnum,
  isComplimentary: boolean
): SetInitialCreateOrderParamsAction {
  return {
    type: OrderActionTypes.SET_INITIAL_CREATE_ORDER_PARAMS,
    payload: {
      event,
      isComplimentary,
      channel,
    },
  };
}

/****************************************************************************************
  Set Season Initial Create Order Params
****************************************************************************************/

export interface SetSeasonInitialCreateOrderParamsAction {
  type: typeof OrderActionTypes.SET_SEASON_INITIAL_CREATE_ORDER_PARAMS;
  payload: {
    season: ISeasonGraphQL;
    channel: OrderChannelEnum;
    isComplimentary: boolean;
  };
}

export function setSeasonInitialCreateOrderParams(
  season: ISeasonGraphQL,
  channel: OrderChannelEnum,
  isComplimentary: boolean
): SetSeasonInitialCreateOrderParamsAction {
  return {
    type: OrderActionTypes.SET_SEASON_INITIAL_CREATE_ORDER_PARAMS,
    payload: {
      season,
      isComplimentary,
      channel,
    },
  };
}

/****************************************************************************************
  Set Order Custom Field
****************************************************************************************/

export interface SetOrderCustomFieldAction {
  type: typeof OrderActionTypes.SET_ORDER_CUSTOM_FIELD;
  payload: {
    label: string;
    value: string | number;
    customFieldId: string;
    type: CustomFieldTypeEnum;
  };
}

export function setOrderCustomField(
  label: string,
  value: string | number,
  customFieldId: string,
  type: CustomFieldTypeEnum
): SetOrderCustomFieldAction {
  return {
    type: OrderActionTypes.SET_ORDER_CUSTOM_FIELD,
    payload: {
      label,
      value,
      customFieldId,
      type,
    },
  };
}

/****************************************************************************************
  Add Member ID
****************************************************************************************/

export interface SetMemberIdAction {
  type: typeof OrderActionTypes.SET_MEMBER_ID;
  payload: {
    value: string;
    index: number;
    guestTicket: boolean;
  };
}

export function setMemberId(
  value: string,
  index: number,
  guestTicket: boolean
): SetMemberIdAction {
  return {
    type: OrderActionTypes.SET_MEMBER_ID,
    payload: {
      value,
      index,
      guestTicket,
    },
  };
}

/****************************************************************************************
  Set Member ID Status Valid
****************************************************************************************/

export interface SetMemberIdStatusValidAction {
  type: typeof OrderActionTypes.SET_MEMBER_ID_STATUS_VALID;
  payload: { memberIdsResponse: any };
}

export function setMemberIdStatusValid(
  memberIdsResponse: any
): SetMemberIdStatusValidAction {
  return {
    type: OrderActionTypes.SET_MEMBER_ID_STATUS_VALID,
    payload: { memberIdsResponse },
  };
}

/****************************************************************************************
  Add Ticket Type
****************************************************************************************/

export interface AddTicketTypeAction {
  type: typeof OrderActionTypes.ADD_TICKET_TYPE;
  payload: {
    event: Required<IEvent>;
    ticketTypeId: string;
    ticketTierId: string;
    seat?: string;
    overRideMax?: number;
    selectedObject?:number
  };
}

export function addTicketType(
  event: Required<IEvent>,
  ticketTypeId: string,
  ticketTierId: string,
  seat?: string,
  overRideMax?: number,
  selectedObject?:number

): AddTicketTypeAction {
  return {
    type: OrderActionTypes.ADD_TICKET_TYPE,
    payload: {
      event,
      ticketTypeId,
      ticketTierId,
      seat,
      overRideMax,
      selectedObject
    },
  };
}

export function addTicketTypeUnseated(
  event: Required<IEvent>,
  ticketTypeId: string,
  ticketTierId: string,
  overRideMax?: number
): AddTicketTypeAction {
  return {
    type: OrderActionTypes.ADD_TICKET_TYPE,
    payload: {
      event,
      ticketTypeId,
      ticketTierId,
      overRideMax,
    },
  };
}

/****************************************************************************************
  Remove Ticket Type
****************************************************************************************/

export interface RemoveTicketTypeAction {
  type: typeof OrderActionTypes.REMOVE_TICKET_TYPE;
  payload: {
    event: Required<IEvent>;
    ticketTypeId: string;
    ticketTierId: string;
    seat?: string;
  };
}

export function removeTicketType(
  event: Required<IEvent>,
  ticketTypeId: string,
  ticketTierId: string,
  seat?: string
): RemoveTicketTypeAction {
  return {
    type: OrderActionTypes.REMOVE_TICKET_TYPE,
    payload: {
      event,
      ticketTypeId,
      ticketTierId,
      seat,
    },
  };
}

/****************************************************************************************
  Update Upgrade Count
****************************************************************************************/

export interface UpdateUpgradeCountAction {
  type: typeof OrderActionTypes.UPDATE_UPGRADE_COUNT;
  payload: {
    event: Required<IEvent>;
    upgradeId: string;
    upgradeCount: number;
  };
}

export function updateUpgradeCount(
  event: Required<IEvent>,
  upgradeId: string,
  upgradeCount: number
): UpdateUpgradeCountAction {
  return {
    type: OrderActionTypes.UPDATE_UPGRADE_COUNT,
    payload: {
      event,
      upgradeId,
      upgradeCount,
    },
  };
}

/****************************************************************************************
Set Payment Method Id
****************************************************************************************/

export interface SetPaymentMethodId {
  type: typeof OrderActionTypes.SET_PAYMENT_METHOD_ID;
  payload: {
    paymentMethodId: string;
  };
}

export function setPaymentMethodId(
  paymentMethodId: string
): SetPaymentMethodId {
  return {
    type: OrderActionTypes.SET_PAYMENT_METHOD_ID,
    payload: {
      paymentMethodId,
    },
  };
}

/****************************************************************************************
  Set Cash Tendered
****************************************************************************************/

export interface SetCashTenderedAction {
  type: typeof OrderActionTypes.SET_CASH_TENDERED;
  payload: {
    cashTendered: number | null;
  };
}

export function setCashTendered(
  cashTendered: number | null
): SetCashTenderedAction {
  return {
    type: OrderActionTypes.SET_CASH_TENDERED,
    payload: {
      cashTendered,
    },
  };
}

/****************************************************************************************
  Create Card Entry Order
****************************************************************************************/

export interface CreateCardEntryOrderAction {
  type: typeof OrderActionTypes.CREATE_CARD_ENTRY_ORDER;
  payload: {};
}

export function createCardEntryOrder(): CreateCardEntryOrderAction {
  return {
    type: OrderActionTypes.CREATE_CARD_ENTRY_ORDER,
    payload: {},
  };
}

export interface CreateCardEntryOrderSuccessAction {
  type: typeof OrderActionTypes.CREATE_CARD_ENTRY_ORDER_SUCCESS;
  payload: {
    order: IOrder;
  };
}

export function createCardEntryOrderSuccess(
  order: IOrder
): CreateCardEntryOrderSuccessAction {
  return {
    type: OrderActionTypes.CREATE_CARD_ENTRY_ORDER_SUCCESS,
    payload: {
      order,
    },
  };
}

export interface CreateCardEntryOrderFailureAction {
  type: typeof OrderActionTypes.CREATE_CARD_ENTRY_ORDER_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createCardEntryOrderFailure(
  errorMsg: string
): CreateCardEntryOrderFailureAction {
  return {
    type: OrderActionTypes.CREATE_CARD_ENTRY_ORDER_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Create Terminal Order
****************************************************************************************/

export interface CreateTerminalOrderAction {
  type: typeof OrderActionTypes.CREATE_TERMINAL_ORDER;
  payload: {};
}

export function createTerminalOrder(): CreateTerminalOrderAction {
  return {
    type: OrderActionTypes.CREATE_TERMINAL_ORDER,
    payload: {},
  };
}

export interface CreateTerminalOrderSuccessAction {
  type: typeof OrderActionTypes.CREATE_TERMINAL_ORDER_SUCCESS;
  payload: {
    order: IOrder;
  };
}

export function createTerminalOrderSuccess(
  order: IOrder
): CreateTerminalOrderSuccessAction {
  return {
    type: OrderActionTypes.CREATE_TERMINAL_ORDER_SUCCESS,
    payload: {
      order,
    },
  };
}

export interface CreateTerminalOrderFailureAction {
  type: typeof OrderActionTypes.CREATE_TERMINAL_ORDER_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createTerminalOrderFailure(
  errorMsg: string
): CreateTerminalOrderFailureAction {
  return {
    type: OrderActionTypes.CREATE_TERMINAL_ORDER_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Create Order
****************************************************************************************/

export interface CreateOrderAction {
  type: typeof OrderActionTypes.CREATE_ORDER;
  payload: {};
}

export function createOrder(): CreateOrderAction {
  return {
    type: OrderActionTypes.CREATE_ORDER,
    payload: {},
  };
}

export interface CreateOrderSuccessAction {
  type: typeof OrderActionTypes.CREATE_ORDER_SUCCESS;
  payload: {
    order: IOrder;
  };
}

export function createOrderSuccess(order: IOrder): CreateOrderSuccessAction {
  return {
    type: OrderActionTypes.CREATE_ORDER_SUCCESS,
    payload: {
      order,
    },
  };
}

export interface CreateOrderFailureAction {
  type: typeof OrderActionTypes.CREATE_ORDER_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createOrderFailure(errorMsg: string): CreateOrderFailureAction {
  return {
    type: OrderActionTypes.CREATE_ORDER_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Create Order Payment Intent
****************************************************************************************/

export interface CreateOrderPaymentIntentAction {
  type: typeof OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT;
  payload: {};
}

export function createOrderPaymentIntent(): CreateOrderPaymentIntentAction {
  return {
    type: OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT,
    payload: {},
  };
}

export interface CreateOrderPaymentIntentSuccessAction {
  type: typeof OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_SUCCESS;
  payload: {
    paymentIntentId: string;
    paymentClientSecret: string;
  };
}

export function createOrderPaymentIntentSuccess(
  paymentIntentId: string,
  paymentClientSecret: string
): CreateOrderPaymentIntentSuccessAction {
  return {
    type: OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_SUCCESS,
    payload: {
      paymentIntentId,
      paymentClientSecret,
    },
  };
}

export interface CreateOrderPaymentIntentFailureAction {
  type: typeof OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function createOrderPaymentIntentFailure(
  errorMsg: string
): CreateOrderPaymentIntentFailureAction {
  return {
    type: OrderActionTypes.CREATE_ORDER_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Confirm Card Payment
****************************************************************************************/

export interface ConfirmCardPaymentAction {
  type: typeof OrderActionTypes.CONFIRM_CARD_PAYMENT;
  payload: {};
}

export function confirmCardPayment(): ConfirmCardPaymentAction {
  return {
    type: OrderActionTypes.CONFIRM_CARD_PAYMENT,
    payload: {},
  };
}

export interface ConfirmCardPaymentSuccessAction {
  type: typeof OrderActionTypes.CONFIRM_CARD_PAYMENT_SUCCESS;
  payload: {};
}

export function confirmCardPaymentSuccess(): ConfirmCardPaymentSuccessAction {
  return {
    type: OrderActionTypes.CONFIRM_CARD_PAYMENT_SUCCESS,
    payload: {},
  };
}

export interface ConfirmCardPaymentFailureAction {
  type: typeof OrderActionTypes.CONFIRM_CARD_PAYMENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function confirmCardPaymentFailure(
  errorMsg: string
): ConfirmCardPaymentFailureAction {
  return {
    type: OrderActionTypes.CONFIRM_CARD_PAYMENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Initialize Stripe Terminal
****************************************************************************************/

export interface InitializeStripeTerminalAction {
  type: typeof OrderActionTypes.INITIALIZE_STRIPE_TERMINAL;
  payload: {};
}

export function initializeStripeTerminal(): InitializeStripeTerminalAction {
  return {
    type: OrderActionTypes.INITIALIZE_STRIPE_TERMINAL,
    payload: {},
  };
}

export interface InitializeStripeTerminalSuccessAction {
  type: typeof OrderActionTypes.INITIALIZE_STRIPE_TERMINAL_SUCCESS;
  payload: {};
}

export function initializeStripeTerminalSuccess(): InitializeStripeTerminalSuccessAction {
  return {
    type: OrderActionTypes.INITIALIZE_STRIPE_TERMINAL_SUCCESS,
    payload: {},
  };
}

export interface InitializeStripeTerminalFailureAction {
  type: typeof OrderActionTypes.INITIALIZE_STRIPE_TERMINAL_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function initializeStripeTerminalFailure(
  errorMsg: string
): InitializeStripeTerminalFailureAction {
  return {
    type: OrderActionTypes.INITIALIZE_STRIPE_TERMINAL_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Discover Stripe Terminal Readers
****************************************************************************************/

export interface DiscoverStripeTerminalReadersAction {
  type: typeof OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS;
  payload: {};
}

export function discoverStripeTerminalReaders(): DiscoverStripeTerminalReadersAction {
  return {
    type: OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS,
    payload: {},
  };
}

export interface DiscoverStripeTerminalReadersSuccessAction {
  type: typeof OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS;
  payload: {
    readers: Reader[];
  };
}

export function discoverStripeTerminalReadersSuccess(
  readers: Reader[]
): DiscoverStripeTerminalReadersSuccessAction {
  return {
    type: OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS,
    payload: {
      readers,
    },
  };
}

export interface DiscoverStripeTerminalReadersFailureAction {
  type: typeof OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function discoverStripeTerminalReadersFailure(
  errorMsg: string
): DiscoverStripeTerminalReadersFailureAction {
  return {
    type: OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Connect to Stripe Terminal Reader
****************************************************************************************/

export interface ConnectToStripeTerminalReaderAction {
  type: typeof OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER;
  payload: {
    reader: Reader;
  };
}

export function connectToStripeTerminalReader(
  reader: Reader
): ConnectToStripeTerminalReaderAction {
  return {
    type: OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER,
    payload: {
      reader,
    },
  };
}

export interface ConnectToStripeTerminalReaderSuccessAction {
  type: typeof OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS;
  payload: {
    reader: Reader;
  };
}

export function connectToStripeTerminalReaderSuccess(
  reader: Reader
): ConnectToStripeTerminalReaderSuccessAction {
  return {
    type: OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS,
    payload: {
      reader,
    },
  };
}

export interface ConnectToStripeTerminalReaderFailureAction {
  type: typeof OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function connectToStripeTerminalReaderFailure(
  errorMsg: string
): ConnectToStripeTerminalReaderFailureAction {
  return {
    type: OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Collect Stripe Terminal Payment
****************************************************************************************/

export interface CollectStripeTerminalPaymentAction {
  type: typeof OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT;
  payload: {};
}

export function collectStripeTerminalPayment(): CollectStripeTerminalPaymentAction {
  return {
    type: OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT,
    payload: {},
  };
}

export interface CollectStripeTerminalPaymentSuccessAction {
  type: typeof OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS;
  payload: {
    paymentIntent: ISdkManagedPaymentIntent;
  };
}

export function collectStripeTerminalPaymentSuccess(
  paymentIntent: ISdkManagedPaymentIntent
): CollectStripeTerminalPaymentSuccessAction {
  return {
    type: OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS,
    payload: {
      paymentIntent,
    },
  };
}

export interface CollectStripeTerminalPaymentFailureAction {
  type: typeof OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function collectStripeTerminalPaymentFailure(
  errorMsg: string
): CollectStripeTerminalPaymentFailureAction {
  return {
    type: OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Cancel Stripe Terminal Payment
****************************************************************************************/

export interface CancelStripeTerminalPaymentAction {
  type: typeof OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT;
  payload: {};
}

export function cancelStripeTerminalPayment(): CancelStripeTerminalPaymentAction {
  return {
    type: OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT,
    payload: {},
  };
}

export interface CancelStripeTerminalPaymentSuccessAction {
  type: typeof OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT_SUCCESS;
  payload: {};
}

export function cancelStripeTerminalPaymentSuccess(): CancelStripeTerminalPaymentSuccessAction {
  return {
    type: OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT_SUCCESS,
    payload: {},
  };
}

export interface CancelStripeTerminalPaymentFailureAction {
  type: typeof OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function cancelStripeTerminalPaymentFailure(
  errorMsg: string
): CancelStripeTerminalPaymentFailureAction {
  return {
    type: OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}

/****************************************************************************************
  Process Stripe Terminal Payment
****************************************************************************************/

export interface ProcessStripeTerminalPaymentAction {
  type: typeof OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT;
  payload: {};
}

export function processStripeTerminalPayment(): ProcessStripeTerminalPaymentAction {
  return {
    type: OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT,
    payload: {},
  };
}

export interface ProcessStripeTerminalPaymentSuccessAction {
  type: typeof OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT_SUCCESS;
  payload: {};
}

export function processStripeTerminalPaymentSuccess(): ProcessStripeTerminalPaymentSuccessAction {
  return {
    type: OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT_SUCCESS,
    payload: {},
  };
}

export interface ProcessStripeTerminalPaymentFailureAction {
  type: typeof OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT_FAILURE;
  payload: {
    errorMsg: string;
  };
}

export function processStripeTerminalPaymentFailure(
  errorMsg: string
): ProcessStripeTerminalPaymentFailureAction {
  return {
    type: OrderActionTypes.PROCESS_STRIPE_TERMINAL_PAYMENT_FAILURE,
    payload: {
      errorMsg,
    },
  };
}
