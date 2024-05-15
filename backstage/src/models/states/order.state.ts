import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import addressState from './address.state';
import { OrderTypeEnum } from '@sellout/models/.dist/interfaces/IOrderType';
import IOrderTicket from '@sellout/models/.dist/interfaces/IOrderTicket';
import IOrderUpgrade from '@sellout/models/.dist/interfaces/IOrderUpgrade';
import { OrderItemStateEnum, OrderStateEnum } from '@sellout/models/.dist/interfaces/IOrderState';
import IRefund from '@sellout/models/.dist/interfaces/IRefund';
import IScan from '@sellout/models/.dist/interfaces/IScan';
import IOrderCustomField from '@sellout/models/.dist/interfaces/IOrderCustomField';
import { OrderChannelEnum } from '@sellout/models/.dist/enums/OrderChannelEnum';
import { CustomFieldTypeEnum } from '@sellout/models/.dist/enums/CustomFieldTypeEnum';

export default function orderState(): IOrder {
  return {
    _id: "",
    orgId: '',
    userId: '',
    eventId: '',
    venueIds: [],
    eventName: '',
    artistIds: [],
    feeIds: [],
    fees:[],
    stripeChargeId: '',
    refundReason: '',
    ipAddress: '',
    promotionCode: '',
    customFields: [orderCustomFieldState()],
    tickets: [orderTicketsState()],
    upgrades: [orderUpgradesState()],
    address: addressState(),
    type: OrderTypeEnum.Paid,
    channel: OrderChannelEnum.Online,
    state: OrderStateEnum.Active,
    payments: [],
    tax: 0,
    // discount:""
    // discountAmount
  };
};

export function orderCustomFieldState(): IOrderCustomField {
  return {
    _id: '',
    label: '',
    value: '',
    customFieldId: '',
    type: CustomFieldTypeEnum.Text,
  }
}

export function orderTicketsState(): IOrderTicket {
  return {
    _id: '',
    name: '',
    ticketTypeId: '',
    ticketTierId: '',
    origionalPrice:0,
    price: 0,
    rollFees: false,
    paymentId: null,
    seat: '',
    refund: refundState(),
    scan: [scanState()],
    state: OrderItemStateEnum.Active,
  }
}

export function orderUpgradesState(): IOrderUpgrade {
  return {
    _id: '',
    name: '',
    upgradeId: '',
    price: 0,
    rollFees: false,
    paymentId: null,
    refund: refundState(),
    scan: scanState(),
    state: OrderItemStateEnum.Active,
  }
}

export function refundState(): IRefund {
  return {
    refunded: false,
    refundedAt: 0,
    refundedBy: '',
    refundReason: '',
    refundedAmount: 0,
  }
}

export function scanState(): IScan {
  return {
    scanned: false,
    scannedAt: 0,
    scannedBy: '',
    startsAt: 0
  }
}
