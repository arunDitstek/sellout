import IEvent, { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import IOrder from "@sellout/models/.dist/interfaces/IOrder";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import ICreateOrderParams, {
  ICreateOrderTicketParams,
  ICreateOrderUpgradeParams,
  IOrderTicketRestrictedParams,
} from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import {
  createOrderState,
  createOrderTicketState,
  createOrderUpgradeState,
  orderCustomFieldState,
} from "../../models/states/order.state";
import Partial from "../../models/interfaces/Partial";
import {
  OrderActionTypes,
  OrderActionCreatorTypes,
  SetPaymentMethodId,
  SetCreateOrderParamsAction,
  SetInitialCreateOrderParamsAction,
  SetSeasonInitialCreateOrderParamsAction,
  SetOrderCustomFieldAction,
  SetMemberIdAction,
  SetMemberIdStatusValidAction,
  AddTicketTypeAction,
  RemoveTicketTypeAction,
  UpdateUpgradeCountAction,
  SetCashTenderedAction,
  CreateOrderSuccessAction,
  CreateOrderPaymentIntentSuccessAction,
  DiscoverStripeTerminalReadersSuccessAction,
  ConnectToStripeTerminalReaderAction,
  ConnectToStripeTerminalReaderSuccessAction,
  CollectStripeTerminalPaymentSuccessAction,
  CancelStripeTerminalPaymentSuccessAction,
  SetTicketRestrictionAction,
  SetGuestCheckoutAction,
  SetGuestCheckoutEmailAction,
  SetUpgradesOnlyAction,
  SetAppliedDiscountAction,
} from "../actions/order.actions";
import { AppActionCreatorTypes, AppActionTypes } from "../actions/app.actions";
import Required from "../../models/interfaces/Required";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import IEventUpgrade, {
  UpgradeTypeComplimentaryWithEnum,
} from "@sellout/models/.dist/interfaces/IEventUpgrade";
import { UserActionTypes } from "../actions/user.actions";
import { Reader, ISdkManagedPaymentIntent } from "@stripe/terminal-js";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import { OrderChannelEnum } from "@sellout/models/.dist/enums/OrderChannelEnum";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";

export type OrderReducerState = {
  createOrderParams: ICreateOrderParams;
  order: IOrder | null;
  paymentMethodId: string | null;
  paymentIntent: ISdkManagedPaymentIntent | null;
  paymentClientSecret: any;
  terminalConnected: boolean;
  terminalReaders: Reader[];
  selectedReader: Reader | null;
  lastSelectedReader: Reader | null;
  cashTendered: number | null;
  ticketRestriction: IOrderTicketRestrictedParams;
  guestCheckout: boolean;
  guestCheckoutEmail: string;
  upgradesOnly: boolean;
  appliedDiscount: IEventPromotion[];
};

function orderReducerState(): OrderReducerState {
  return {
    createOrderParams: createOrderState(),
    order: null,
    paymentMethodId: null,
    paymentIntent: null,
    paymentClientSecret: "",
    terminalConnected: false,
    terminalReaders: [],
    selectedReader: null,
    lastSelectedReader: null,
    cashTendered: 0,
    ticketRestriction: {},
    guestCheckout: false,
    guestCheckoutEmail: "",
    upgradesOnly: false,
    appliedDiscount: [],
  };
}

export default function reducer(
  state = orderReducerState(),
  action: OrderActionCreatorTypes | AppActionCreatorTypes
) {
  const { type, payload } = action;

  switch (type) {
    /****************************************************************************************
      Create Order Parameters
    ****************************************************************************************/

    case OrderActionTypes.SET_CREATE_ORDER_PARAMS:
      return setCreateOrderParams(
        state,
        payload as SetCreateOrderParamsAction["payload"]
      );

    case OrderActionTypes.SET_INITIAL_CREATE_ORDER_PARAMS:
      return setInitialCreateOrderParams(
        state,
        payload as SetInitialCreateOrderParamsAction["payload"]
      );
    case OrderActionTypes.SET_SEASON_INITIAL_CREATE_ORDER_PARAMS:
      return setSeasonInitialCreateOrderParams(
        state,
        payload as SetSeasonInitialCreateOrderParamsAction["payload"]
      );

    case OrderActionTypes.SET_ORDER_CUSTOM_FIELD:
      return setOrderCustomField(
        state,
        payload as SetOrderCustomFieldAction["payload"]
      );

    case OrderActionTypes.SET_MEMBER_ID:
      return setMemberId(state, payload as SetMemberIdAction["payload"]);

    case OrderActionTypes.SET_MEMBER_ID_STATUS_VALID:
      return setMemberIdStatusValid(
        state,
        payload as SetMemberIdStatusValidAction["payload"]
      );

    case OrderActionTypes.SET_TICKET_RESTRICTION_VALID:
      return setTicketRestrictionAction(
        state,
        payload as SetTicketRestrictionAction["payload"]
      );

    case OrderActionTypes.SET_GUEST_CHECKOUT:
      return setGuestCheckout(
        state,
        payload as SetGuestCheckoutAction["payload"]
      );

    case OrderActionTypes.SET_UPGRADES_ONLY:
      return setUpgradesOnly(
        state,
        payload as SetUpgradesOnlyAction["payload"]
      );

    case OrderActionTypes.SET_GUEST_CHECKOUT_EMAIL:
      return setGuestCheckoutEmail(
        state,
        payload as SetGuestCheckoutEmailAction["payload"]
      );

    case OrderActionTypes.ADD_TICKET_TYPE:
      return addTicketType(state, payload as AddTicketTypeAction["payload"]);

    case OrderActionTypes.REMOVE_TICKET_TYPE:
      return removeTicketType(
        state,
        payload as RemoveTicketTypeAction["payload"]
      );

    case OrderActionTypes.UPDATE_UPGRADE_COUNT:
      return updateUpgradeCount(
        state,
        payload as UpdateUpgradeCountAction["payload"]
      );

    case OrderActionTypes.SET_PAYMENT_METHOD_ID:
      return setPaymentMethodId(
        state,
        payload as SetPaymentMethodId["payload"]
      );

    case OrderActionTypes.SET_CASH_TENDERED:
      return setCashTendered(
        state,
        payload as SetCashTenderedAction["payload"]
      );

    case OrderActionTypes.SET_APPLIED_DISCOUNT:
      return setAppliedDiscounts(
        state,
        payload as SetAppliedDiscountAction["payload"]
      );

    case UserActionTypes.GET_USER_PROFILE_SUCCESS:
      return setCreateOrderParams(state, {
        createOrderParams: {
          userId: (payload as any).userProfile?.user?._id,
        },
      });

    /****************************************************************************************
      Create Order
    ****************************************************************************************/

    case OrderActionTypes.CREATE_ORDER:
      return state;

    case OrderActionTypes.CREATE_ORDER_SUCCESS:
      return createOrderSuccess(
        state,
        payload as CreateOrderSuccessAction["payload"]
      );

    case OrderActionTypes.CREATE_ORDER_FAILURE:
      return state;

    /****************************************************************************************
      Create Order Payment Intent
    ****************************************************************************************/

    case OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT:
      return state;

    case OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_SUCCESS:
      return createOrderPaymentIntentSuccess(
        state,
        payload as CreateOrderPaymentIntentSuccessAction["payload"]
      );

    case OrderActionTypes.CREATE_ORDER_PAYMENT_INTENT_FAILURE:
      return state;

    /****************************************************************************************
      Discover Stripe Terminal Readers
    ****************************************************************************************/

    case OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS:
      return state;

    case OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_SUCCESS:
      return discoverStripeTerminalReadersSuccess(
        state,
        payload as DiscoverStripeTerminalReadersSuccessAction["payload"]
      );

    case OrderActionTypes.DISCOVER_STRIPE_TERMINAL_READERS_FAILURE:
      return state;

    /****************************************************************************************
      Connect to Stripe Terminal Reader
    ****************************************************************************************/

    case OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER:
      return connectToStripeTerminalReader(
        state,
        payload as ConnectToStripeTerminalReaderAction["payload"]
      );

    case OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_SUCCESS:
      return connectToStripeTerminalReaderSuccess(
        state,
        payload as ConnectToStripeTerminalReaderSuccessAction["payload"]
      );

    case OrderActionTypes.CONNECT_TO_STRIPE_TERMINAL_READER_FAILURE:
      return state;

    /****************************************************************************************
      Collect Stripe Terminal Payment
    ****************************************************************************************/

    case OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT:
      return state;

    case OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_SUCCESS:
      return collectStripeTerminalPaymentSuccess(
        state,
        payload as CollectStripeTerminalPaymentSuccessAction["payload"]
      );

    case OrderActionTypes.COLLECT_STRIPE_TERMINAL_PAYMENT_FAILURE:
      return state;

    /****************************************************************************************
      Cancel Stripe Terminal Payment
    ****************************************************************************************/
    case OrderActionTypes.CANCEL_STRIPE_TERMINAL_PAYMENT_SUCCESS:
      return cancelStripeTerminalPaymentSuccess(
        state,
        payload as CancelStripeTerminalPaymentSuccessAction["payload"]
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

/****************************************************************************************
  Set Create Order Params
****************************************************************************************/

function setCreateOrderParams(
  state: OrderReducerState,
  payload: {
    createOrderParams: Partial<ICreateOrderParams>;
  }
): OrderReducerState {
  return {
    ...state,
    createOrderParams: {
      ...state.createOrderParams,
      ...payload.createOrderParams,
    },
  };
}

/****************************************************************************************
  Set Event Initial Create Order Params
****************************************************************************************/

function setInitialCreateOrderParams(
  state: OrderReducerState,
  {
    event,
    channel,
    isComplimentary,
  }: {
    event: IEventGraphQL;
    channel: OrderChannelEnum;
    isComplimentary: boolean;
  }
): OrderReducerState {
  let createOrderParams = <ICreateOrderParams>{
    eventId: event?._id,
    orgId: event?.orgId,
    channel: channel,
  };

  if (isComplimentary) {
    createOrderParams.paymentMethodType = PaymentMethodTypeEnum.None;
    createOrderParams.type = OrderTypeEnum.Complimentary;
  } else if (EventUtil.isRSVP(event)) {
    createOrderParams.paymentMethodType = PaymentMethodTypeEnum.None;
    createOrderParams.type = OrderTypeEnum.RSVP;
  }

  return setCreateOrderParams(state, {
    createOrderParams,
  });
}

/****************************************************************************************
  Set Season Initial Create Order Params
****************************************************************************************/

function setSeasonInitialCreateOrderParams(
  state: OrderReducerState,
  {
    season,
    channel,
    isComplimentary,
  }: {
    season: ISeasonGraphQL;
    channel: OrderChannelEnum;
    isComplimentary: boolean;
  }
): OrderReducerState {
  let createOrderParams = <ICreateOrderParams>{
    seasonId: season?._id,
    orgId: season?.orgId,
    channel: channel,
  };

  if (isComplimentary) {
    createOrderParams.paymentMethodType = PaymentMethodTypeEnum.None;
    createOrderParams.type = OrderTypeEnum.Complimentary;
  }

  return setCreateOrderParams(state, {
    createOrderParams,
  });
}

/****************************************************************************************
  Set Order Custom Field
****************************************************************************************/

function setOrderCustomField(
  state: OrderReducerState,
  {
    label,
    value,
    customFieldId,
    type,
  }: {
    label: string;
    value: string | number;
    customFieldId: string;
    type: CustomFieldTypeEnum;
  }
): OrderReducerState {
  let customFields = [...state.createOrderParams.customFields];

  const customFieldExists = customFields.find(
    (customField) => customField.customFieldId === customFieldId
  );

  if (customFieldExists) {
    customFields = customFields.map((customField) => {
      if (customField.customFieldId === customFieldId) {
        return {
          ...customField,
          value,
        };
      }
      return customField;
    });
  } else {
    const customField = orderCustomFieldState(
      label,
      value,
      customFieldId,
      type
    );
    customFields.push(customField);
  }

  return setCreateOrderParams(state, { createOrderParams: { customFields } });
}

/****************************************************************************************
  Set Payment Method Id
****************************************************************************************/

function setPaymentMethodId(
  state: OrderReducerState,
  { paymentMethodId }: { paymentMethodId: string }
): OrderReducerState {
  return {
    ...state,
    paymentMethodId,
  };
}

/****************************************************************************************
  Set Cash Tendered
****************************************************************************************/

function setCashTendered(
  state: OrderReducerState,
  { cashTendered }: { cashTendered: number | null }
): OrderReducerState {
  return {
    ...state,
    cashTendered,
  };
}

/****************************************************************************************
  Set Applied Discount
****************************************************************************************/

function setAppliedDiscounts(
  state: OrderReducerState,
  { appliedDiscount }: { appliedDiscount: IEventPromotion[] }
): OrderReducerState {
  return {
    ...state,
    appliedDiscount,
  };
}

/****************************************************************************************
  Create Order Success
****************************************************************************************/

function createOrderSuccess(
  state: OrderReducerState,
  { order }: { order: IOrder }
): OrderReducerState {
  return {
    ...state,
    order,
  };
}

/****************************************************************************************
  Create Order Payment Intent Success
****************************************************************************************/

function createOrderPaymentIntentSuccess(
  state: OrderReducerState,
  {
    paymentIntentId,
    paymentClientSecret,
  }: {
    paymentIntentId: string;
    paymentClientSecret: string;
  }
): OrderReducerState {
  state = setCreateOrderParams(state, {
    createOrderParams: { paymentIntentId },
  });

  return {
    ...state,
    paymentClientSecret,
  };
}

/****************************************************************************************
  Discover Stripe Terminal Readers Success
****************************************************************************************/

function discoverStripeTerminalReadersSuccess(
  state: OrderReducerState,
  { readers }: { readers: Reader[] }
): OrderReducerState {
  return {
    ...state,
    terminalReaders: readers,
  };
}

/****************************************************************************************
  Connect to Stripe Terminal Reader
****************************************************************************************/

function connectToStripeTerminalReader(
  state: OrderReducerState,
  { reader }: { reader: Reader }
): OrderReducerState {
  return {
    ...state,
    terminalConnected: false,
    selectedReader: null,
    lastSelectedReader: state.selectedReader,
  };
}

/****************************************************************************************
  Connect to Stripe Terminal Reader Success
****************************************************************************************/

function connectToStripeTerminalReaderSuccess(
  state: OrderReducerState,
  { reader }: { reader: Reader }
): OrderReducerState {
  return {
    ...state,
    terminalConnected: true,
    selectedReader: reader,
    lastSelectedReader: state.lastSelectedReader || reader,
  };
}

/****************************************************************************************
  Collect Stripe Terminal Payment Success
****************************************************************************************/

function collectStripeTerminalPaymentSuccess(
  state: OrderReducerState,
  { paymentIntent }: { paymentIntent: ISdkManagedPaymentIntent }
): OrderReducerState {
  return {
    ...state,
    paymentIntent,
  };
}

/****************************************************************************************
  Cancel Stripe Terminal Payment
****************************************************************************************/

function cancelStripeTerminalPaymentSuccess(
  state: OrderReducerState,
  payload: CancelStripeTerminalPaymentSuccessAction["payload"]
): OrderReducerState {
  return {
    ...state,
    terminalConnected: false,
    selectedReader: null,
    lastSelectedReader: null,
  };
}

/****************************************************************************************
  Set Member ID
****************************************************************************************/

function setMemberId(
  state: OrderReducerState,
  {
    value,
    index,
    guestTicket,
  }: { value: string; index: number; guestTicket: boolean }
): OrderReducerState {
  state.createOrderParams.tickets[index].teiMemberId = value;
  state.createOrderParams.tickets[index].isMemberIdValid = undefined;
  state.createOrderParams.tickets[index].guestTicket = guestTicket;
  return state;
}

/****************************************************************************************
   Set Member ID Status Valid
****************************************************************************************/

function setMemberIdStatusValid(
  state: OrderReducerState,
  { memberIdsResponse }: { memberIdsResponse: any }
): OrderReducerState {
  memberIdsResponse.map((a: any, index: number) => {
    a.MemberStatus.StatusID === "ACTIVE" &&
      state.createOrderParams.tickets.map((i: any) => {
        if (i.teiMemberId === a.MemberID) {
          i.isMemberIdValid = true;
          i.teiMemberInfo = {
            firstName: a.FirstName,
            lastName: a.LastName,
            email: a.Email,
            phoneNumber: a.Phone,
          };
        }
        return i;
      });
    a.MemberStatus.StatusID === "INACTIVE" &&
      state.createOrderParams.tickets.map((i: any) => {
        if (i.teiMemberId === a.MemberID) {
          i.isMemberIdValid = false;
        }
        return i;
      });
  });
  return state;
}

/****************************************************************************************
  Get Member ID Already Purchased A Ticket Valid
****************************************************************************************/

function setTicketRestrictionAction(
  state: OrderReducerState,
  { ticketRestriction }: { ticketRestriction: any }
): OrderReducerState {
  state.ticketRestriction = ticketRestriction;
  return state;
}

/****************************************************************************************
  Set Guest Checkout
****************************************************************************************/

function setGuestCheckout(
  state: OrderReducerState,
  { guestCheckout }: { guestCheckout: boolean }
): OrderReducerState {
  state.guestCheckout = guestCheckout;
  return state;
}

/****************************************************************************************
  Set Upgrades Only
****************************************************************************************/

function setUpgradesOnly(
  state: OrderReducerState,
  { upgradesOnly }: { upgradesOnly: boolean }
): OrderReducerState {
  state.upgradesOnly = upgradesOnly;
  return state;
}

/****************************************************************************************
  Set Guest Checkout Email
****************************************************************************************/

function setGuestCheckoutEmail(
  state: OrderReducerState,
  { guestCheckoutEmail }: { guestCheckoutEmail: string }
): OrderReducerState {
  state.guestCheckoutEmail = guestCheckoutEmail;
  return state;
}

/****************************************************************************************
  Add Ticket Type
****************************************************************************************/

function addTicketType(
  state: OrderReducerState,
  payload: {
    event: Required<IEvent>;
    ticketTypeId: string;
    ticketTierId: string;
    seat?: string;
    overRideMax?: number;
    selectedObject?: number
  }
): OrderReducerState {
  const tickets: ICreateOrderTicketParams[] = [...state.createOrderParams.tickets,];
  const ticketType: ITicketType = payload.event.ticketTypes.find(
    (ticket) => ticket._id === payload.ticketTypeId
  ) as ITicketType;

  // Find Upgrades associated with this ticket type
  const upgrades: IEventUpgrade[] = payload.event.upgrades.filter((upgrade) =>
    upgrade.ticketTypeIds.includes(payload.ticketTypeId)
  );
  // Find paid upgrades that come with this ticket type
  const paidUpgrades: IEventUpgrade[] = upgrades.filter(
    (upgrade) => !upgrade.complimentary
  );
  // Find complimentary upgrades that come with this ticket type
  const complimentaryUpgrades: IEventUpgrade[] = upgrades.filter(
    (upgrade) => upgrade.complimentary
  );

  // If the seat is already held by the hold token
  // then return current state



  const Gatype = payload.seat &&
    payload.seat !== "General Admission" && payload.seat !== "GA" &&
    Boolean(tickets.find((ticket) => ticket.seat === payload.seat) ?? false)

  if (
    Gatype) {
    return state;
  }

  let ticketCount =
    OrderUtil.ticketTypeCount(state.createOrderParams, payload.ticketTypeId)


  const isAvailableQty = payload.overRideMax
    ? ticketCount <= payload.overRideMax &&
    ticketCount <= ticketType.remainingQty
    : ticketCount <= ticketType.purchaseLimit &&
    ticketCount <= ticketType.remainingQty;


  if (isAvailableQty &&payload.seat !== "General Admission" && payload.seat !== "GA") {
    tickets.push(
      createOrderTicketState(
        payload.event,
        payload.ticketTypeId,
        payload.ticketTierId,
        state.createOrderParams.type === OrderTypeEnum.Complimentary,
        payload.seat,
        payload.overRideMax
      )
    );
  
    // Add complimentary upgrades to order
    state = complimentaryUpgrades.reduce(
      (state: OrderReducerState, upgrade: IEventUpgrade) => {
        const upgradeCount = OrderUtil.upgradeCount(
          state.createOrderParams,
          upgrade._id
        );
        if (
          upgrade.complimentaryWith ===
          UpgradeTypeComplimentaryWithEnum.Order &&
          upgradeCount < 1
        ) {
          state = updateUpgradeCount(state, {
            event: payload.event,
            upgradeId: upgrade._id as string,
            upgradeCount: upgradeCount + 1,
          });
        }
        if (
          upgrade.complimentaryWith === UpgradeTypeComplimentaryWithEnum.Ticket
        ) {
          state = updateUpgradeCount(state, {
            event: payload.event,
            upgradeId: upgrade._id as string,
            upgradeCount: upgradeCount + 1,
          });
        }
        return state;
      },
      state
    );
  }
  state = setCreateOrderParams(state, { createOrderParams: { tickets }, });

  if (payload.seat == "General Admission" || payload.seat == "GA"  && tickets.length == payload.selectedObject){
    return state;
  }
  if (payload.seat == "General Admission" || payload.seat == "GA"  && tickets.length > payload!.selectedObject!){
    return state;
  }
else {
let ticketCount =
OrderUtil.ticketTypeCount(state.createOrderParams, payload.ticketTypeId)

const isAvailableQty = payload.overRideMax
? ticketCount <= payload.overRideMax &&
ticketCount <= ticketType.remainingQty
: ticketCount <= ticketType.purchaseLimit &&
ticketCount <= ticketType.remainingQty;


if (isAvailableQty && payload.seat == "General Admission" || payload.seat == "GA") {
tickets.push(
  createOrderTicketState(
    payload.event,
    payload.ticketTypeId,
    payload.ticketTierId,
    state.createOrderParams.type === OrderTypeEnum.Complimentary,
    payload.seat,
    payload.overRideMax
  )
);

// Add complimentary upgrades to order
state = complimentaryUpgrades.reduce(
  (state: OrderReducerState, upgrade: IEventUpgrade) => {
    const upgradeCount = OrderUtil.upgradeCount(
      state.createOrderParams,
      upgrade._id
    );
    if (
      upgrade.complimentaryWith ===
      UpgradeTypeComplimentaryWithEnum.Order &&
      upgradeCount < 1
    ) {
      state = updateUpgradeCount(state, {
        event: payload.event,
        upgradeId: upgrade._id as string,
        upgradeCount: upgradeCount + 1,
      });
    }
    if (
      upgrade.complimentaryWith === UpgradeTypeComplimentaryWithEnum.Ticket
    ) {
      state = updateUpgradeCount(state, {
        event: payload.event,
        upgradeId: upgrade._id as string,
        upgradeCount: upgradeCount + 1,
      });
    }
    return state;
  },
  state
);
}

state = setCreateOrderParams(state, { createOrderParams: { tickets }, });
}

  return state;
}

/****************************************************************************************
  Remove Ticket Type
****************************************************************************************/

function removeTicketType(
  state: OrderReducerState,
  payload: {
    event: Required<IEvent>;
    ticketTypeId: string;
    ticketTierId: string;
    seat?: string;
  }
): OrderReducerState {
  const tickets: ICreateOrderTicketParams[] = [
    ...state.createOrderParams.tickets,
  ];
  const ticketType: ITicketType = payload.event.ticketTypes.find(
    (ticket) => ticket._id === payload.ticketTypeId
  ) as ITicketType;

  // Find Upgrades associated with this ticket type
  const upgrades: IEventUpgrade[] = payload.event.upgrades.filter((upgrade) =>
    upgrade.ticketTypeIds.includes(payload.ticketTypeId)
  );
  // Find paid upgrades that come with this ticket type
  const paidUpgrades: IEventUpgrade[] = upgrades.filter(
    (upgrade) => !upgrade.complimentary
  );
  // Find complimentary upgrades that come with this ticket type
  const complimentaryUpgrades: IEventUpgrade[] = upgrades.filter(
    (upgrade) => upgrade.complimentary
  );

  const ticketIndex = tickets.findIndex(
    (t) => t.ticketTypeId === payload.ticketTypeId && t.seat === payload.seat
  );
  if (ticketIndex > -1) {
    tickets.splice(ticketIndex, 1);
    // Remove complimentary upgrades from order
    state = complimentaryUpgrades.reduce(
      (state: OrderReducerState, upgrade: IEventUpgrade) => {
        const upgradeCount = OrderUtil.upgradeCount(
          state.createOrderParams,
          upgrade._id
        );
        return updateUpgradeCount(state, {
          event: payload.event,
          upgradeId: upgrade._id as string,
          upgradeCount: upgradeCount - 1,
        });
      },
      state
    );
    // Remove unavailable upgrades from order
    state = setCreateOrderParams(state, {
      createOrderParams: { tickets },
    });

    const ticketTypeCount = OrderUtil.ticketTypeCount(
      state.createOrderParams,
      payload.ticketTypeId
    );

    if (ticketTypeCount === 0) {
      state = paidUpgrades.reduce(
        (state: OrderReducerState, upgrade: IEventUpgrade) => {
          return updateUpgradeCount(state, {
            event: payload.event,
            upgradeId: upgrade._id as string,
            upgradeCount: 0,
          });
        },
        state
      );
    }
  }

  return state;
}

/****************************************************************************************
  Update Upgrade Count
****************************************************************************************/

function updateUpgradeCount(
  state: OrderReducerState,
  payload: {
    event: Required<IEvent>;
    upgradeId: string;
    upgradeCount: number;
  }
): OrderReducerState {
  let upgrades: ICreateOrderUpgradeParams[] = [
    ...state.createOrderParams.upgrades,
  ];
  const upgrade: IEventUpgrade = payload.event.upgrades.find(
    (upgrade) => upgrade._id === payload.upgradeId
  ) as IEventUpgrade;

  const requiredTicketTypeIsInCart: boolean = Boolean(
    state.createOrderParams.tickets.find(
      (ticket) =>
        upgrade.ticketTypeIds.includes(ticket.ticketTypeId) &&
        upgrade.visible === true
    )
  );

  // Add an upgrade to the cart
  if (
    OrderUtil.upgradeCount(state.createOrderParams, payload.upgradeId) <
    payload.upgradeCount
  ) {
    // if (!upgrade.complimentary && !requiredTicketTypeIsInCart) return state;

    if (
      payload.upgradeCount <= upgrade.purchaseLimit &&
      payload.upgradeCount <= upgrade.remainingQty &&
      upgrade.visible
    ) {
      upgrades.push(
        createOrderUpgradeState(
          payload.event,
          payload.upgradeId,
          state.createOrderParams.type === OrderTypeEnum.Complimentary
        )
      );
    }

    // Remove an upgrade from the cart
  } else {
    const upgradeIndex: number = upgrades.findIndex(
      (u) => u.upgradeId === payload.upgradeId
    );

    if (upgradeIndex > -1) {
      upgrades.splice(upgradeIndex, 1);
    }
  }

  // Remove all upgrades of this type from the cart
  if (payload.upgradeCount === 0) {
    upgrades = upgrades.filter(
      (upgrade) => upgrade.upgradeId !== payload.upgradeId
    );
  }

  return setCreateOrderParams(state, { createOrderParams: { upgrades } });
}

/********************************************************************************
 *  Reset App
 *******************************************************************************/

function resetApp(): OrderReducerState {
  return orderReducerState();
}
