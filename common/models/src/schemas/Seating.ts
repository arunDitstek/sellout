import shortid from 'shortid';

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  orgId: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  secretKey: {
    type: String,
    required: true,
  },
  designerKey: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
    default: null,
  },
  updatedAt: {
    type: Number,
    required: false,
    default: null,
  },
};
