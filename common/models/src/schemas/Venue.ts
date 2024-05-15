import shortid from 'shortid';
import Address from './Address';

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  orgId: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    default: null,
  },
  capacity: {
    type: Number,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  tax: {
    type: Number,
    default: null,
  },
  imageUrls: [
    {
      type: String,
    },
  ],
  venueGlobalId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Number,
    default: null,
  },
  createdBy: {
    type: String,
    default: null,
  },
  address: Address,
};
