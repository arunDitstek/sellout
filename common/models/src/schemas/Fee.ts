import shortid from 'shortid';

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  orgId: {
    type: String,
    required: false,
    default: null,
  },
  eventId: {
    type: String,
    required: false,
    default: null,
  },seasonId: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  appliedTo: {
    type: String,
    required: true,
  },
  appliedBy: {
    type: String,
    required: true,
  },
  minAppliedToPrice: {
    type: Number,
    required: false,
    default: null,
  },
  maxAppliedToPrice: {
    type: Number,
    required: false,
    default: null,
  },
  filters: [{
    type: String,
    required: false,
    default: [],
  }],
  paymentMethods: [{
    type: String,
    required: false,
    default: [],
  }],
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  updatedBy: { 
    type: String,
    required: true,
  },
  updatedAt: {
    type: Number,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  isApplyPlatformFee: {
    type: Boolean,
    required: false,
    default: false,
  },
};
