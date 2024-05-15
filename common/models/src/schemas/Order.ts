import shortid from 'shortid';
import Address from './Address';

const Refund = {
  refunded: {
    type: Boolean,
    required: true,
    default: false,
  },
  refundedAt: {
    type: Number,
    required: false,
  },
  refundedBy: {
    type: String,
    required: false,
    default: '',
  },
  refundedAmount: {
    type: Number,
    required: false,
  },
  refundReason: {
    type: String,
    required: false,
  },
};

const Scan = {
  _id: false,
  scanned: {
    type: Boolean,
    required: true,
    default: false,
  },
  scannedAt: {
    type: Number,
    required: false,
  },
  scannedBy: {
    type: String,
    required: false,
    default: '',
  }, startsAt: {
    type: Number,
    required: false,
  }
};
const Fees = {
  _id: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
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
  }, seasonId: {
    type: String,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
  },
  value: {
    type: Number,
    required: false,
  },
  appliedTo: {
    type: String,
    required: false,
  },
  appliedBy: {
    type: String,
    required: false,
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
  createdBy: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Number,
    required: false,
  },
  updatedBy: {
    type: String,
    required: false,
  },
  updatedAt: {
    type: Number,
    required: false,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  amount: {
    type: String,
    required: false,
  },
};
const TeiMemberInfoInput = {
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  phoneNumber: {
    type: String,
    required: false
  }
}
const OrderTicket = {
  _id: {
    type: String,
    required: false,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  ticketTypeId: {
    type: String,
    required: true,
  },
  ticketTierId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  origionalPrice:{
    type: Number,
    required: true,
  },
  rollFees: {
    type: Boolean,
    required: true,
    default: false,
  },
  paymentId: {
    type: String,
    required: false,
    default: null,
  },
  seat: {
    type: String,
    required: false,
    default: '',
  },
  scan: [Scan],
  refund: Refund,
  state: {
    type: String,
    required: true,
  },
  qrCodeUrl: {
    type: String,
    required: false,
    default: null,
  },
  values: {
    type: String,
    required: false,
  }, description: {
    type: String,
    required: false
  }, dayIds: [
    {
      type: String,
      required: false
    }
  ], teiMemberId: {
    type: String,
    required: false
  }, isMemberIdValid: {
    type: Boolean,
    required: false
  },
  teiMemberInfo: TeiMemberInfoInput,
  guestTicket: {
    type: Boolean,
    required: false
  }
};

const OrderUpgrade = {
  _id: {
    type: String,
    required: false,
    default: shortid.generate,
  },
  name: {
    type: String,
    required: true,
  },
  upgradeId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rollFees: {
    type: Boolean,
    required: true,
    default: false,
  },
  paymentId: {
    type: String,
    required: false,
    default: null,
  },
  scan: Scan,
  refund: Refund,
  state: {
    type: String,
    required: true,
  },
  qrCodeUrl: {
    type: String,
    required: false,
    default: null,
  },
};

const OrderCustomField = {
  _id: {
    type: String,
    required: false,
    default: shortid.generate,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  customFieldId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
};



const Payment = {
  _id: {
    type: String,
    required: false,
    default: shortid.generate,
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  transferAmount: {
    type: Number,
    required: false,
  },
  feeAmount: {
    type: Number,
    required: false,
  },
  tax: {
    type: Number,
    required: false,
  },
  feeIds: [{
    type: String,
    required: false,
    default: [],
  }],
  createdAt: {
    type: Number,
    required: false,
  },
  createdBy: {
    type: String,
    required: false,
  },
  promotionCode: {
    type: String,
    required: false,
  },
  discountCode: {
    type: String,
    required: false,
  },
  discount: {
    type: Number,
    required: false,
  },
  paymentMethodType: {
    type: String,
    required: true,
  },
}

export default {
  _id: {
    type: String,
    // required: true,
    // default: shortid.generate,
    default: function () {
      const string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_."
      shortid.characters(string);
      let id = shortid.generate();
      return id;
    }
    // default: function () {
    //   // let id = shortid.generate();
    //   let id = shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
    //   id = id.substring(0, 9);
    //   return id;
    //   // if (id.startsWith('-')) {
    //   //   id = 'BAb' + id.slice(1);
    //   // }
    //   // return id;
    // }
    // validate: {
    //   validator: function (value) {
    //     return !value.startsWith('-');
    //   },
    //   message: props => `The _id "${props.value}" should not start with a hyphen ("-").`,
    // },
  },
  secretId: {
    type: String,
    requied: false,
    default: null,
  },
  userId: {
    type: String,
    required: false,
    default: null,
  },
  orgId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false
  },
  eventName: {
    type: String,
    required: true,
  },
  tax: {
    type: Number,
    default: null,
  },
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
  feeIds: [{
    type: String,
    required: false,
    default: [],
  }],
  createdAt: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  stripeChargeId: {
    type: String,
    required: false,
  },
  tickets: [OrderTicket],
  fees: [Fees],
  upgrades: [OrderUpgrade],
  recipientEmails: [{
    type: String,
    required: false,
    default: [],
  }],
  qrCodeUrl: {
    type: String,
    required: false,
    default: null,
  },
  state: {
    type: String,
    required: true,
  },
  refundedAmount: {
    type: Number,
    required: false,
  },
  processingFee: {
    refund: Refund
  },
  promoterFee: {
    refund: Refund
  },
  refundReason: {
    type: String,
    required: false,
    default: '',
  },
  type: {
    type: String,
    required: false,
  },
  channel: {
    type: String,
    required: false,
  },
  promotionCode: {
    type: String,
    required: false,
    default: null,
  },
  discountCode: {
    type: String,
    required: false,
    default: null,
  },
  discountAmount: {
    type: Number,
    required: false,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  address: Address,
  customFields: [OrderCustomField],
  payments: [Payment],
  seasonId: {
    type: String,
    required: false,
  }, hidden: {
    type: Boolean,
    required: false,
  }, printed: {
    type: Boolean,
    required: false,
    default: false
  }, parentSeasonOrderId: {
    type: String,
    required: false,
  }, cancelReason: {
    type: String,
    required: false
  },

};
