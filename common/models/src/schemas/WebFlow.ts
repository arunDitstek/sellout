import shortid from 'shortid';

const WebFlowSiteDomain = {
  name: {
    type: String,
    required: true,
  },
  lastPublishedAt: {
    type: Number,
    required: false,
    default: null,
  },
};

const WebFlowSite = {
  name: {
    type: String,
    required: false,
  },
  webFlowId: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  eventCollectionId: {
    type: String,
    required: true,
    default: null,
  },
  venueCollectionId: {
    type: String,
    required: true,
    default: null,
  },
  artistCollectionId: {
    type: String,
    required: true,
    default: null,
  },
  organizationCollectionId: {
    type: String,
    required: true,
    default: null,
  },
  eventTypeCollectionId: {
    type: String,
    required: true,
    default: null,
  },
  previewUrl: {
    type: String,
    required: true,
    default: null,
  },
  domains: [WebFlowSiteDomain],
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

const WebFlowEntityId = {
  webFlowSiteId: String,
  webFlowEntityId: String,
  slug: String,
};

const WebFlowEntity = {
  entityType: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  selloutId: {
    type: String,
    required: true,
  },
  webFlowIds: [WebFlowEntityId],
  alwaysPublishTo: [
    {
      type: String,
      required: false,
      default: [],
    },
  ],
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

export default {
  _id: {
    type: String,
    default: shortid.generate,
  },
  orgId: {
    type: String,
    required: true,
  },
  sites: [WebFlowSite],
  entities: [WebFlowEntity],
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
