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
  userId: {
    type: String,
    required: false,
  },
  userEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  acceptedAt: {
    type: Number,
    required: false,
    default: null,
  },
};
