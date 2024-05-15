export enum FeeTypeEnum {
  Flat = "Flat",
  Percent = "Percent",
}

export enum FeeAppliedToEnum {
  Order = "Order",
  Ticket = "Ticket",
  Upgrade = "Upgrade",
}

export enum FeeAppliedByEnum {
  Sellout = "Sellout",
  Stripe = "Stripe",
  Organization = "Organization",
}

export enum FeeFiltersEnum {
  Seated = "Seated",
  CardEntry = "Card Entry",
  CardReader = 'Card Reader Wifi',
  CardReaderBluetooth = 'Card Reader Bluetooth',
  GuestTicket = "Guest ticket",
}

export enum FeePaymentMethodEnum {
  CardEntry = 'Manual Card Entry',
  CardReader = 'Card Reader',
  CardReaderWifi = 'Card Reader (Wifi)',
  CardReaderBluetooth = 'Card Reader (Bluetooth)',
  Cash = 'Cash',
  None = 'None',
  Check = 'Check',
}

export default interface IFee {
  _id?: string;
  name: string;
  orgId?: string;
  eventId?: string;
  seasonId?: string;
  type: FeeTypeEnum;
  value: number;
  appliedTo: FeeAppliedToEnum;
  appliedBy: FeeAppliedByEnum;
  minAppliedToPrice?: number;
  maxAppliedToPrice?: number;
  filters?: FeeFiltersEnum[];
  createdBy?: string;
  createdAt?: number;
  updatedBy?: string;
  updatedAt?: number;
  disabled: boolean;
  amount?: string;
  isApplyPlatformFee:boolean;
  paymentMethods?: FeePaymentMethodEnum[];

  // disableable: boolean;
  // editable: boolean;
  // isGlobal: boolean;
}
