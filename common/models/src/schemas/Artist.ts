import shortid from 'shortid';

const ArtistPressKit = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  posterImageUrls: [
    {
      type: String,
      required: false,
    },
  ],
  links: [
    {
      platform: {
        type: String,
        required: false,
      },
      link: {
        type: String,
        required: false,
      },
    },
  ],
};

const ArtistContact = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  company: {
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
};

const SocialLink = {
  _id: {
    type: String,
    default: shortid.generate,
  },
  platform: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: false,
  },
};

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  orgId: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  genres: [{
    type: String,
    required: false,
  }],
  artistGlobalId: {
    type: String,
    required: false,
  },
  socialAccounts: [SocialLink],
  pressKits: [ArtistPressKit],
  contacts: [ArtistContact],
  createdAt: {
    type: Number,
    default: null,
  },
  createdBy: {
    type: String,
    default: null,
  },
};
