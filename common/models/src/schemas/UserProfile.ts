import shortid from 'shortid';
import Address from './Address';

const Metrics = {
  orgId: {
    type: String,
    required: true,
  },
  lifeTimeValue: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateValue: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeTicketsPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateTicketsPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeUpgradesPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateUpgradesPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  lifeTimeOrdersPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  yearToDateOrdersPurchased: {
    type: Number,
    required: false,
    default: 0,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  eventIds:[{
    type: String,
    required: false,
    default: [],
  }]
};

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  userId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  authyId: {
    type: String,
    required: false,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    required: false,
    default: null,
  },
  imageUrl: {
    type: String,
    required: false,
    default: null,
  },
  orgIds: [{
    type: String,
    required: false,
    default: [],
  }],
  eventIds: [{
    type: String,
    required: false,
    default: [],
  }],
  venueIds: [{
    type: String,
    required: false,
    default: [],
  }],
  artistIds: [{
    type: String,
    required: false,
    default: [],
  }],
  metrics:[Metrics],
  address: Address,
};
