import shortid from 'shortid';
import { EventAgeEnum, SendQRCodeEnum, EventProcessAsEnum } from '../interfaces/IEvent';
import { UpgradeTypeComplimentaryWithEnum } from "../interfaces/IEventUpgrade";
import Address from './Address';
import Metrics from './Metrics';
const EventCustomFields = {
  _id: {
    type: String,
    default: shortid.generate
  },
  label: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: true
  },
  minLength: {
    type: Number,
    required: true,
    default: 0
  },
  maxLength: {
    type: Number,
    required: false,
    default: null,
  },
  minValue: {
    type: Number,
    required: true,
    default: 0
  },
  maxValue: {
    type: Number,
    required: false,
    default: null
  },
  required: {
    type: Boolean,
    required: true,
    default: false,
  },
  options: [{
    type: String,
    required: true,
    default: [],
  }],
  active: {
    type: Boolean,
    required: true,
    default: true
  }
};
const EventPromotion = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  totalQty: {
    type: Number,
    required: true,
  },
  overRideMax: {
    type: Number,
    required: false,
  },
  remainingQty: {
    type: Number,
    required: true,
  },
  ticketTypeIds: [
    {
      type: String,
      required: true,
      default: [],
    },
  ],
  upgradeIds: [
    {
      type: String,
      required: true,
      default: [],
    },
  ],
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  startsAt: {
    type: Number,
    required: true,
  },
  endsAt: {
    type: Number,
    required: true,
  },
  useLimit: {
    type: Number,
    required: true,
  },
  discountType: {
    type: String,
    required: true,
  },
  discountValue: {
    type: String,
    required: true,
  },
};
const SeasonSchedule = {
  announceAt: {
    type: Number,
    required: false,
  },
  ticketsAt: {
    type: Number,
    required: false,
  },
  ticketsEndAt: {
    type: Number,
    required: false,
  },
  startsAt: {
    type: Number,
    required: false,
  },
  endsAt: {
    type: Number,
    required: false,
  },
};

const SeasonUpgrade = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalQty: {
    type: Number,
    required: true,
  },
  remainingQty: {
    type: Number,
    required: true,
  },
  purchaseLimit: {
    type: Number,
    required: true,
    default: 8,
  },
  complimentary: {
    type: Boolean,
    required: true,
    default: false,
  },
  complimentaryWith: {
    type: String,
    required: false,
    default: UpgradeTypeComplimentaryWithEnum.Order,
  },
  complimentaryQty: {
    type: String,
    required: false,
    default: 1,
  },
  ticketTypeIds: [
    {
      type: String,
      required: true,
    },
  ],
  imageUrl: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  visible: {
    type: Boolean,
    required: true,
    default: true,
  },
  rollFees: {
    type: Boolean,
    required: true,
    default: false,
  },
  values: {
    type: String,
    required: false,
    default: "0",
  },
};


export const PerformanceSchedule = [{
  _id: {
    type: String,
    required: false,
    default: shortid.generate,
  },
  doorsAt: {
    type: Number,
    required: false,
  },
  startsAt: {
    type: Number,
    required: false,
  },
  endsAt: {
    type: Number,
    required: false,
  },
}];

const Performance = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: false,
  },
  headliningArtistIds: [
    {
      type: String,
      required: false,
    },
  ],
  openingArtistIds: [
    {
      type: String,
      requird: false,
    },
  ],
  venueId: {
    type: String,
    required: false,
  },
  venueStageId: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: 0,
  },
  posterImageUrl: {
    type: String,
    required: false,
  },
  videoLink: {
    type: String,
    required: false,
  },
  songLink: {
    type: String,
    required: false,
  },
  schedule: PerformanceSchedule,
};

const TicketExchange = {
  allowed: {
    type: String,
    required: false,
  },
  percent: {
    type: String,
    required: false,
  },
};

const TicketHold = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  ticketTypeId: {
    type: String,
    required: true,
  },
};

const TicketTier = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  startsAt: {
    type: Number,
    required: true,
  },
  endsAt: {
    type: Number,
    required: true,
  },
  totalQty: {
    type: Number,
    required: true,
  },
  remainingQty: {
    type: Number,
    required: true,
  },
};

const TicketType = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  totalQty: {
    type: Number,
    required: true,
  },
  remainingQty: {
    type: Number,
    required: true,
  },
  purchaseLimit: {
    type: Number,
    required: true,
    default: 8,
  },
  visible: {
    type: Boolean,
    required: true,
    default: true,
  },
  performanceIds: [
    {
      type: String,
      required: false,
      default: [],
    },
  ],
  tiers: [TicketTier],
  description: {
    type: String,
    required: false
  },
  rollFees: {
    type: Boolean,
    required: true,
    default: false,
  },
  values: {
    type: String,
    required: false,
    default: "0",
  },dayIds: [
    {
      type: String,
      required: false
    }
  ]
};


export default {
  _id: {
    type: String,
    default: shortid.generate
  },
  orgId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  subtitle: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  posterImageUrl: {
    type: String,
    required: false
  },
  venueId: {
    type: String,
    required: false
  },
  createdAt: {
    type: Number,
    required: true
  },
  publishable: {
    type: Boolean,
    required: true,
    default: false
  },
  seatingChartKey: {
    type: String,
    required: false,
  },
  age: {
    type: String,
    required: true,
    default: EventAgeEnum.AllAges
  },
  active: {
    type: Boolean,
    default: true
  },
  cancel: {
    type: Boolean,
    required: true,
    default: false
  },
  taxDeduction: {
    type: Boolean,
    required: true,
    default: false
  },
  userAgreement: {
    type: String,
    required: false
  },
  processAs: {
    type: String,
    required: true,
    default: EventProcessAsEnum.Paid,
  },
  sendQRCode: {
    type: String,
    default: SendQRCodeEnum.UponOrder,
  },
  location: Address,
  schedule: SeasonSchedule,
  performances: [Performance],
  ticketTypes: [TicketType],
  holds: [TicketHold],
  upgrades: [SeasonUpgrade],
  promotions: [EventPromotion],
  customFields: [EventCustomFields],
  exchange: TicketExchange,
  metrics: Metrics,
  published: {
    type: Boolean,
    default: false,
  },
  salesBeginImmediately: {
    type: Boolean,
    required: true,
    default: true
  },numberOfEvent:{
    type: Number,
    required: true,
    default: 0
  },eventIds:[
    {
      type: String,
      required: false
    }
  ],isGuestTicketSale:{
    type: Boolean,
    required: false,
    default: false
  }
};


