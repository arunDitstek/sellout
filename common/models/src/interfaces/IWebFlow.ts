export enum WebFlowEntityType {
  VENUE = "VENUE",
  EVENT = "EVENT",
  ARTIST = "ARTIST",
  ORGANIZATION = "ORGANIZATION",
}

export interface IWebFlowEntityId {
  webFlowSiteId: string;
  webFlowEntityId: string;
  slug: string;
  webFlowSite?: IWebFlowSite;
}

export interface IWebFlowEntity {
  _id?: string;
  entityType: WebFlowEntityType,
  name: string;
  selloutId: string;
  webFlowIds: IWebFlowEntityId[];
  alwaysPublishTo?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface IWebFlowSiteDomain {
  _id?: string;
  name: string;
  lastPublishedAt: number;
}

export interface IWebFlowSite {
  _id?: string;
  name: string;
  webFlowId: string;
  enabled: boolean;
  eventCollectionId: string;
  venueCollectionId: string;
  artistCollectionId: string;
  organizationCollectionId: string;
  eventTypeCollectionId: string;
  previewUrl: string;
  domains: IWebFlowSiteDomain[];
  createdAt: number;
  updatedAt?: number;
}

export default interface IWebFlow {
  _id?: string;
  orgId: string;
  sites?: IWebFlowSite[];
  entities?: IWebFlowEntity[];
  createdAt: number;
  updatedAt?: number;
}
