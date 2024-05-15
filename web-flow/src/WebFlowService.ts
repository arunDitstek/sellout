import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import * as Random from '@sellout/utils/.dist/random';
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import Joi from '@hapi/joi';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import PbAsyncMessageHandler from '@sellout/service/.dist/PbAsyncMessageHandler';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import { WebFlow } from './WebFlow';
import WebFlowStore from './WebFlowStore';
import IWebFlow, {
   IWebFlowSite,
   IWebFlowEntity,
   IWebFlowEntityId,
   WebFlowEntityType,
   IWebFlowSiteDomain,
}  from '@sellout/models/.dist/interfaces/IWebFlow';
import Tracer  from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL, WEBFLOW_API_KEY } from './env';
import WebFlowClient from 'webflow-api';
import * as EventTransform from './transforms/EventTransform';
import * as HtmlTransform from './transforms/HtmlTransform';
import fetch from 'node-fetch';

const webFlowClient = new WebFlowClient({ token: WEBFLOW_API_KEY });

const tracer = new Tracer('WebFlowService');

// Patch isn't implemented in the webflow JS API
// idk why, seems stupid
// we implement it here with fetch
async function patchItem(params: any = {}, settings = { live: false }) {
  const { live } = settings;
  const url = `https://api.webflow.com/collections/${params.collectionId}/items/${params.itemId}?live=${live}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${WEBFLOW_API_KEY}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0',
      },
      body: JSON.stringify({ fields: params.fields }),
    });
    return await response.json();
  } catch (e) {
    throw e;
  }
}

export default class WebFlowService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }

  public static main() {
    const serviceName = pb.WebFlowService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new WebFlowService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new WebFlowStore(WebFlow),
    });
    service.run();
  }

  public run() {
    this.connectionMgr.connect();
    this.connectionMgr.on('connect', () => {
      this.register();
      this.logger.info(`Service instance ${this.serviceName} is running...`);
    });
  }

  public register() {
    this.connectionMgr.subscribe(this.serviceName, 'api', {
      /**
       * Incoming Message Handlers
       */
      createWebFlow: new PbMessageHandler(
        this.createWebFlow,
        pb.CreateWebFlowRequest,
        pb.CreateWebFlowResponse,
      ),
      createWebFlowSite: new PbMessageHandler(
        this.createWebFlowSite,
        pb.CreateWebFlowSiteRequest,
        pb.CreateWebFlowSiteResponse,
      ),
      listWebFlowSites: new PbMessageHandler(
        this.listWebFlowSites,
        pb.ListWebFlowSitesRequest,
        pb.ListWebFlowSitesResponse,
      ),
      remapWebFlowSite: new PbMessageHandler(
        this.remapWebFlowSite,
        pb.RemapWebFlowSiteRequest,
        pb.RemapWebFlowSiteResponse,
      ),
      publishWebFlowEvent: new PbMessageHandler(
        this.publishWebFlowEvent,
        pb.PublishWebFlowEventRequest,
        pb.PublishWebFlowEventResponse,
      ),
      unpublishWebFlowEvent: new PbMessageHandler(
        this.unpublishWebFlowEvent,
        pb.UnpublishWebFlowEventRequest,
        pb.UnpublishWebFlowEventResponse,
      ),
      updateWebFlowEvent: new PbMessageHandler(
        this.updateWebFlowEvent,
        pb.UpdateWebFlowEventRequest,
        pb.UpdateWebFlowEventResponse,
      ),
      updateVenuePublishing: new PbMessageHandler(
        this.updateVenuePublishing,
        pb.UpdateVenuePublishingRequest,
        pb.UpdateVenuePublishingResponse,
      ),
      findOrganizationWebFlow: new PbMessageHandler(
        this.findOrganizationWebFlow,
        pb.FindOrganizationWebFlowRequest,
        pb.FindOrganizationWebFlowResponse,
      ),
      findWebFlowEntity: new PbMessageHandler(
        this.findWebFlowEntity,
        pb.FindWebFlowEntityRequest,
        pb.FindWebFlowEntityResponse,
      ),
    });

    this.connectionMgr.subscribeBroadcast(this.serviceName, {
      // Organization
      organizationCreated: new PbAsyncMessageHandler(
        this.organizationCreated,
        pb.Broadcast.OrganizationCreatedNotification,
      ),
      // Venue
      venueUpdated: new PbAsyncMessageHandler(
        this.venueUpdated,
        pb.Broadcast.VenueUpdatedNotification,
      ),
      // Artist
      artistUpdated: new PbAsyncMessageHandler(
        this.artistUpdated,
        pb.Broadcast.ArtistUpdatedNotification,
      ),
      // Organization
      organizationUpdated: new PbAsyncMessageHandler(
        this.organizationUpdated,
        pb.Broadcast.OrganizationUpdatedNotification,
      ),
    });
  }
  
  public createWebFlow = async (request: pb.CreateWebFlowRequest): Promise<pb.CreateWebFlowResponse> => {
    const span = tracer.startSpan('createWebFlow', request.spanContext);
    const response: pb.CreateWebFlowResponse = pb.CreateWebFlowResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
       this.logger.error(`createWebFlow - error: ${JSON.stringify(params.error)}`);
       response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
       response.errors = joiToErrors(params.error, pb.Error);
       span.setTag('error', true);
       span.log({ errors: params.error });
       span.finish();
       return response;
     }
     const { orgId } = params.value;

    const createdAt = Time.now();

    const attributes: IWebFlow = {
      orgId,
      entities: [],
      createdAt,
      updatedAt: createdAt,
    };

    let webFlow: IWebFlow;
    try {
      webFlow = await this.storage.createWebFlow(span, attributes);
    } catch (e) {
      this.logger.error(`createWebFlow - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to create website hosting configuration.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Link the sellout webflow site
    */

    // Hold off on this until we can validate that
    // events are not pornographic

    // const createSiteRequest = pb.CreateWebFlowSiteRequest.create({
    //   spanContext: span.context().toString(),
    //   orgId,
    //   webFlowId: SELLOUT_WEBFLOW_SITE_ID,
    // });

    // let createSiteResponse: pb.CreateWebFlowSiteResponse;
    // try {
    //   createSiteResponse = await this.createWebFlowSite(createSiteRequest);
    //   if(createSiteResponse.status !== pb.StatusCode.OK) {
    //     throw new Error('Error linking to Sellout WebFlow site.');
    //   }
    // } catch(e) {
    //   this.logger.error(`createWebFlow - error: ${e.message}`);
    //   response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
    //   response.errors = [
    //     pb.Error.create({
    //       key: 'Error',
    //       message: 'Error linking to Sellout WebFlow site.',
    //     }),
    //   ];
    //   span.setTag('error', true);
    //   span.log({ errors: e })
    //   span.finish();
    //   return response;
    // }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  public createWebFlowSite = async (request: pb.CreateWebFlowSiteRequest): Promise<pb.CreateWebFlowSiteResponse> => {
     const span = tracer.startSpan('createWebFlowSite', request.spanContext);
     const response: pb.CreateWebFlowSiteResponse = pb.CreateWebFlowSiteResponse.create();

     const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      webFlowId: Joi.string().required(),
    });

     const params = schema.validate(request);

     if (params.error) {
      this.logger.error(`createWebFlowSite - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, webFlowId } = params.value;

     const createdAt = Time.now();

     const site = await webFlowClient.site({ siteId: webFlowId });
     const { name, previewUrl } = site;
     let domains = await webFlowClient.domains({ siteId: webFlowId });

     domains = domains.map((d): IWebFlowSiteDomain => ({
      name: d.name,
      lastPublishedAt: d.lastPublished ? Time.fromDate(d.lastPublished) : 0,
    }));

     const webFlowCollections = await webFlowClient.collections({ siteId: webFlowId });
     const eventCollection = webFlowCollections.find(c => c.name === 'Events');
     const venueCollection = webFlowCollections.find(c => c.name === 'Venues');
     const artistCollection = webFlowCollections.find(c => c.name === 'Performers');
     const organizationCollection = webFlowCollections.find(c => c.name === 'Organizations');
     const eventTypeCollection = webFlowCollections.find(c => c.name === 'Event Types');

     try {
      if (!eventCollection) throw new Error('Could not find Events collection.');
      if (!venueCollection) throw new Error('Could not find Venues collection.');
      if (!artistCollection) throw new Error('Could not find Performers collection.');
      if (!organizationCollection) throw new Error('Could not find Organizations collection.');
    } catch (e) {
      this.logger.error(`createWebFlowSite - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

     const eventCollectionId = eventCollection._id;
     const venueCollectionId = venueCollection._id;
     const artistCollectionId = artistCollection._id;
     const organizationCollectionId = organizationCollection._id;
     const eventTypeCollectionId = eventTypeCollection._id;

    // const eventSchema = await webFlowClient.collection({ collectionId: eventCollectionId });
    // const venueSchema = await webFlowClient.collection({ collectionId: venueCollectionId });
    // const artistSchema = await webFlowClient.collection({ collectionId: artistCollectionId });
    // const orgSchema = await webFlowClient.collection({ collectionId: organizationCollectionId });
    // console.log('EVENT');
    // console.log(JSON.stringify(eventSchema));
    // console.log('VENUE');
    // console.log(JSON.stringify(venueSchema));
    // console.log('ARTIST');
    // console.log(JSON.stringify(artistSchema));
    // console.log('ORGANIAZATION');
    // console.log(JSON.stringify(orgSchema));

     const attributes: IWebFlowSite = {
      name,
      webFlowId,
      enabled: true,
      eventCollectionId,
      venueCollectionId,
      artistCollectionId,
      organizationCollectionId,
      eventTypeCollectionId,
      previewUrl,
      domains,
      createdAt,
      updatedAt: createdAt,
    };

     let webFlow;

     try {
      webFlow = await this.storage.createWebFlowSite(span, orgId, attributes);
      response.status = pb.StatusCode.OK;
      response.webFlow = pb.WebFlow.fromObject(webFlow);
    } catch (e) {
      this.logger.error(`createWebFlowSite - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to create website.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  
  public listWebFlowSites = async (request: pb.ListWebFlowSitesRequest): Promise<pb.ListWebFlowSitesResponse> => {
    const span = tracer.startSpan('listWebFlowSites', request.spanContext);
    const response: pb.ListWebFlowSitesResponse = pb.ListWebFlowSitesResponse.create();

    let sites;
    try {
      sites = await webFlowClient.sites();
      sites = await Promise.all(sites.map(async (site) => {
        return pb.WebFlowSite.fromObject({
          webFlowId: site._id,
          name: site.name,
          previewUrl: site.previewUrl,
        });
      }));
    } catch (e) {
      this.logger.error(`listWebFlowSites - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to list websites. This is bad. Please contact Sam or try again.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.sites = sites;
    response.status = pb.StatusCode.OK;
    span.finish();

    return response;
  }

  public remapWebFlowSite = async (request: pb.RemapWebFlowSiteRequest): Promise<pb.RemapWebFlowSiteResponse> => {
    const span = tracer.startSpan('remapWebFlowSite', request.spanContext);
    const response: pb.RemapWebFlowSiteResponse = pb.RemapWebFlowSiteResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      webFlowId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`remapWebFlowSite - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { webFlowId: webFlowSiteId } = params.value;

    const webFlowCollections = await webFlowClient.collections({ siteId: webFlowSiteId });
    const eventCollection = webFlowCollections.find(c => c.name === 'Events');
    const venueCollection = webFlowCollections.find(c => c.name === 'Venues');
    const artistCollection = webFlowCollections.find(c => c.name === 'Performers');
    const organizationCollection = webFlowCollections.find(c => c.name === 'Organizations');
    const eventTypeCollection = webFlowCollections.find(c => c.name === 'Event Types');

    try {
      if (!eventCollection) throw new Error('Could not find Events collection.');
      if (!venueCollection) throw new Error('Could not find Venues collection.');
      if (!artistCollection) throw new Error('Could not find Performers collection.');
      if (!organizationCollection) throw new Error('Could not find Organizations collection.');
    } catch (e) {
      this.logger.error(`remapWebFlowSite - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const eventCollectionId = eventCollection._id;
    const venueCollectionId = venueCollection._id;
    const artistCollectionId = artistCollection._id;
    const organizationCollectionId = organizationCollection._id;
    const eventTypeCollectionId = eventTypeCollection._id;

    const events = await webFlowClient.items({ collectionId: eventCollectionId });
    const venues = await webFlowClient.items({ collectionId: venueCollectionId });
    const artists = await webFlowClient.items({ collectionId: artistCollectionId });
    const organizations = await webFlowClient.items({ collectionId: organizationCollectionId });
    const eventTypes = await webFlowClient.items({ collectionId: eventTypeCollectionId });

    function bySlugs(items) {
      return items.reduce((cur, next) => {
        cur[next.slug] = next._id;
        return cur;
      }, {})
    }

    const eventsBySlug = bySlugs(events.items);
    const venuesBySlug = bySlugs(venues.items);
    const artistsBySlug = bySlugs(artists.items);
    const organizationsBySlug = bySlugs(organizations.items);
    const eventTypesBySlug = bySlugs(eventTypes.items);

    const entitiesBySlug = Object.assign(
      {},
      eventsBySlug,
      venuesBySlug,
      artistsBySlug,
      organizationsBySlug,
      eventTypesBySlug
    );

    let webFlows: IWebFlow[];
    try {
      webFlows = await this.storage.findAllWebFlows(span);
    } catch (e) {
      this.logger.error(`remapWebFlowSite - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    try {
      webFlows = await Promise.all(webFlows.map(async (webFlow): Promise<IWebFlow> => {
        webFlow.sites = webFlow.sites.map((site: IWebFlowSite): IWebFlowSite => {
          if (site.webFlowId === webFlowSiteId) {
            site.eventCollectionId = eventCollectionId;
            site.venueCollectionId = venueCollectionId;
            site.artistCollectionId = artistCollectionId;
            site.organizationCollectionId = organizationCollectionId;
            site.eventTypeCollectionId = eventTypeCollectionId;
            site.updatedAt = Time.now();
          }

          return site;
        });

        webFlow.entities = webFlow.entities.map((entity: IWebFlowEntity): IWebFlowEntity => {
          entity.webFlowIds = entity.webFlowIds.map((webFlowId: IWebFlowEntityId): IWebFlowEntityId => {
            if (webFlowId.webFlowSiteId === webFlowSiteId) {
              webFlowId.webFlowEntityId = entitiesBySlug[webFlowId.slug];
            }
            return webFlowId;
          })
          return entity;
        });

        try {
          webFlow = await this.storage.updateOrganizationWebFlow(span, webFlow.orgId, webFlow);
        } catch (e) {
          throw e;
        }

        return webFlow;
      }));
    } catch (e) {
      this.logger.error(`remapWebFlowSite - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.webFlows = webFlows.map(w => pb.WebFlow.fromObject(w));

    span.finish();
    return response;
  }

  public updateVenuePublishing = async (request: pb.UpdateVenuePublishingRequest): Promise<pb.UpdateVenuePublishingResponse> => {
    const span = tracer.startSpan('updateVenuePublishing', request.spanContext);
    const response: pb.UpdateVenuePublishingResponse = pb.UpdateVenuePublishingResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venueId: Joi.string().required(),
      alwaysPublishTo: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateVenuePublishing - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, venueId, alwaysPublishTo } = params.value;

    let webFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
      if (!webFlow) {
        throw new Error(`Website configuration belonging to org ${orgId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`updateVenuePublishing - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to update venue publishing preferences',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    webFlow.entities = webFlow.entities.map(v => {
      if (v.selloutId === venueId) {
        v.alwaysPublishTo = alwaysPublishTo;
        return v;
      }  return v;
    });

    try {
      webFlow = await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
      response.status = pb.StatusCode.OK;
      response.webFlow = pb.WebFlow.fromObject(webFlow);
    } catch (e) {
      this.logger.error(`updateVenuePublishing - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to create website.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public findOrganizationWebFlow = async (request: pb.FindOrganizationWebFlowRequest): Promise<pb.FindOrganizationWebFlowResponse> => {
    const span = tracer.startSpan('findOrganizationWebFlow', request.spanContext);
    const response: pb.FindOrganizationWebFlowResponse = pb.FindOrganizationWebFlowResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findOrganizationWebFlow - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId } = params.value;

    let webFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
      response.status = pb.StatusCode.OK;
      response.webFlow = pb.WebFlow.fromObject(webFlow);
    } catch (e) {
      this.logger.error(`findOrganizationWebFlow - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to retrieve organization website configuration.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }

  public findWebFlowEntity = async (request: pb.FindWebFlowEntityRequest): Promise<pb.FindWebFlowEntityResponse> => {
    const span = tracer.startSpan('findWebFlowEntity', request.spanContext);
    const response: pb.FindWebFlowEntityResponse = pb.FindWebFlowEntityResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      selloutId: Joi.string().required(),
      entityType: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`findWebFlowEntity - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, selloutId, entityType } = params.value;

    let webFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
    } catch (e) {
      this.logger.error(`findWebFlowEntity - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to retrieve entity website configuration.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return response;
    }

    const entity: IWebFlowEntity = webFlow?.entities.find(entity => entity.entityType === entityType && entity.selloutId === selloutId);

    /**
     * Match webflow sites to ids for full site info
     */
    if (entity) {
      entity.webFlowIds = entity?.webFlowIds.map(webFlowId => {
        webFlowId.webFlowSite = webFlow?.sites.find(site => site.webFlowId === webFlowId.webFlowSiteId);
        return webFlowId;
      });
      response.entity = pb.WebFlowEntity.fromObject(entity);
    } else {
      response.entity = null;
    }

    response.status = pb.StatusCode.OK;

    span.finish();
    return response;
  }

  /****************************************************************************************
  * Event
  *****************************************************************************************/

  private createEventWebFlowEntity = async (spanContext: string, orgId: string, eventId: string, webFlow: IWebFlow): Promise<IWebFlow> => {
    const span = tracer.startSpan('createEventWebFlowEntity', spanContext);

    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventByIdResponse;

    try {
      findEventResponse = await this.proxy.eventService.findEventById(findEventRequest);
      if (!findEventResponse || !findEventResponse.event) {
        throw new Error(`Event with id ${eventId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`createEventWebFlowEntity - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return null;
    }

    const { event } = findEventResponse;

    const createdAt = Time.now();

    const eventEntity: IWebFlowEntity = {
      entityType: WebFlowEntityType.EVENT,
      name: event.name,
      selloutId: event._id,
      webFlowIds: [],
      createdAt,
      updatedAt: createdAt,
    };

    webFlow.entities.push(eventEntity);

    span.finish();
    return webFlow;
  }

  public updateWebFlowEvent = async (request: pb.UpdateWebFlowEventRequest): Promise<pb.UpdateWebFlowEventResponse> => {
    const span = tracer.startSpan('updateWebFlowEvent', request.spanContext);
    const response: pb.UpdateWebFlowEventResponse = pb.UpdateWebFlowEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateWebFlowEvent - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId } = params.value;

    /**
    * Find the WebFlow
    */
    let webFlow: IWebFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
      if (!webFlow) {
        throw new Error(`Website configuration belonging to org ${orgId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`updateWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: e.message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Update all sites
    */
    const webFlowEvent = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.EVENT && e.selloutId === eventId);

    // If there is no entity, then this
    // entity isn't published anywhere on webflow
    // and does not need to be updated
    if (!webFlowEvent) {
      response.status = pb.StatusCode.OK;
      span.finish();
      return response;
    }

    const publishes = await Promise.all(webFlowEvent.webFlowIds.map(async (webFlowId): Promise<string> => {

      const publishEventRequest = pb.PublishWebFlowEventRequest.create({
        spanContext: span.context().toString(),
        orgId,
        eventId,
        siteId: webFlowId.webFlowSiteId,
      });

      try {
        const res = await this.publishWebFlowEvent(publishEventRequest);
        return res.status;
      } catch (e) {
        this.logger.error(`updateWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Could not update website event.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        return pb.StatusCode.INTERNAL_SERVER_ERROR;
      }
    }));

    const isErrorResponse = publishes.find(p => p !== pb.StatusCode.OK);
    response.status =  isErrorResponse ? pb.StatusCode.INTERNAL_SERVER_ERROR : pb.StatusCode.OK;

    span.finish();
    return response;
  }

  public publishWebFlowEvent = async (request: pb.PublishWebFlowEventRequest): Promise<pb.PublishWebFlowEventResponse> => {
    const span = tracer.startSpan('publishWebFlowEvent', request.spanContext);
    const response: pb.PublishWebFlowEventResponse = pb.PublishWebFlowEventResponse.create();

    /**
     * Validate Request Paramaters
     */
    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      siteId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`publishWebFlowEvent - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, eventId, siteId } = params.value;

    /**
     * Find the Event
     */
    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventByIdResponse;

    try {
      findEventResponse = await this.proxy.eventService.findEventById(findEventRequest);

      if (!findEventResponse || !findEventResponse.event) {
        throw new Error(`Event with id ${eventId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { event } = findEventResponse;
    const { venueId } = event;
    const artistIds = EventUtil.artistIds(event);
    const headliningArtistIds = EventUtil.headliningArtistIds(event);
    const openingArtistIds = EventUtil.openingArtistIds(event);
    // const live = EventUtil.hasBeenAnnounced(event);
    // const draft = !EventUtil.hasBeenAnnounced(event);
    const live = true;
    const draft = false;

    /**
    * Find the WebFlow
    */
    let webFlow: IWebFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
      if (!webFlow) {
        throw new Error(`Website configuration belonging to org ${orgId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not find site configuration. Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    /**
    * Publish the venues
    */
    const publishVenueRequest = pb.PublishWebFlowVenueRequest.create({
      spanContext: span.context().toString(),
      orgId,
      venueId,
      siteId,
      webFlow,
      live,
    });

    let publishVenueResponse: pb.PublishVenueResponse;
    try {
      publishVenueResponse = await this.publishVenue(publishVenueRequest);
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not publish venue. Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    webFlow = publishVenueResponse.webFlow;

    /**
    * Publish the artists
    */
    webFlow = await artistIds.reduce(async (webFlow: Promise<IWebFlow>, artistId: string): Promise<IWebFlow> => {
      const publishArtistRequest = pb.PublishWebFlowArtistRequest.create({
        spanContext: span.context().toString(),
        orgId,
        artistId,
        siteId,
        webFlow: await webFlow,
        live,
      });

      let publishArtistResponse: pb.PublishWebFlowArtistResponse;
      try {
        publishArtistResponse = await this.publishArtist(publishArtistRequest);
      } catch (e) {
        this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Could not publish artist. Failed to publish website',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
      return publishArtistResponse.webFlow;

    }, Promise.resolve(webFlow));

    /**
    * Publish the organization
    */
    const publishOrgRequest = pb.PublishWebFlowOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId,
      siteId,
      webFlow,
      live,
    });

    let publishOrgResponse: pb.PublishWebFlowOrganizationResponse;
    try {
      publishOrgResponse = await this.publishOrganization(publishOrgRequest);
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not publish organization. Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    webFlow = publishOrgResponse.webFlow;

    /**
    * Get the venue for the timezone
    */
    const findVenueRequest = pb.FindVenueByIdRequest.create({
      spanContext: span.context().toString(),
      orgId,
      venueId,
    });

    let findVenueResponse: pb.PublishWebFlowOrganizationResponse;
    try {
      findVenueResponse = await this.proxy.venueService.findVenueById(findVenueRequest);
      if (!findVenueResponse.venue || !findVenueResponse.venue.address) {
        throw new Error('This venue does not have an address.');
      }
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not find venue. Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { timezone } = findVenueResponse.venue.address;

    /**
    * Find the webflow event 
    */
    let webFlowEvent = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.EVENT && e.selloutId === event._id);

    /**
    * Create the webflow entity in Sellout if it doesn't exist
    */
    if (!webFlowEvent) {
      webFlow = await this.createEventWebFlowEntity(span.context().toString(), orgId, eventId, webFlow);
      webFlowEvent = webFlow.entities
        .find(e => e.entityType === WebFlowEntityType.EVENT && e.selloutId === event._id);
    }

    let webFlowEventId = webFlowEvent.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    const webFlowVenue = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.VENUE && e.selloutId === venueId);

    const webFlowVenueId = webFlowVenue.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    const headlinigArtistWebFlowIds = webFlow.entities
      .filter(e => e.entityType === WebFlowEntityType.ARTIST && headliningArtistIds.includes(e.selloutId))
      .reduce((cur: IWebFlowEntityId[], next: IWebFlowEntity): IWebFlowEntityId[] => {
        return cur.concat(next.webFlowIds.filter(webFlowId => webFlowId.webFlowSiteId === siteId));
      },      [])
      .map((entityId: IWebFlowEntityId): string => entityId.webFlowEntityId);

    const headliningPerformerEntity = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ARTIST && headliningArtistIds.includes(e.selloutId));

    const openingArtistWebFlowIds = webFlow.entities
      .filter(e => e.entityType === WebFlowEntityType.ARTIST && openingArtistIds.includes(e.selloutId))
      .reduce((cur: IWebFlowEntityId[], next: IWebFlowEntity): IWebFlowEntityId[] => {
        return cur.concat(next.webFlowIds.filter(webFlowId => webFlowId.webFlowSiteId === siteId));
      },      [])
      .map((entityId: IWebFlowEntityId): string => entityId.webFlowEntityId);

    const webFlowOrg = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ORGANIZATION && e.selloutId === orgId);

    const webFlowOrgId = webFlowOrg.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowEventId || !webFlowEventId.webFlowEntityId) {
      try {
        const slug = webFlowEventId ? webFlowEventId.slug : Random.generateOfLength(16).toString();
        const result = await webFlowClient.createItem({
          collectionId: site.eventCollectionId,
          fields: EventTransform.transform(
            event,
            webFlowOrgId.webFlowEntityId,
            webFlowVenueId.webFlowEntityId,
            headliningPerformerEntity ? headliningPerformerEntity.name : null,
            headlinigArtistWebFlowIds,
            openingArtistWebFlowIds,
            slug,
            draft,
            timezone,
          ),
        }, {
          live
        });
        webFlowEventId = {
          webFlowEntityId: result._id,
          webFlowSiteId: siteId,
          slug,
        };
        webFlowEvent.webFlowIds.push(webFlowEventId);
        webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
          if (e.selloutId !== webFlowEvent.selloutId) return e;
          return webFlowEvent;
        });
      } catch (e) {
        console.error(e);
        this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Could not publish event. Failed to publish website.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    } else {
      try {
        await webFlowClient.updateItem({
          collectionId: site.eventCollectionId,
          itemId: webFlowEventId.webFlowEntityId,
          fields: EventTransform.transform(
            event,
            webFlowOrgId.webFlowEntityId,
            webFlowVenueId.webFlowEntityId,
            headliningPerformerEntity ? headliningPerformerEntity.name : null,
            headlinigArtistWebFlowIds,
            openingArtistWebFlowIds,
            webFlowEventId.slug,
            draft,
            timezone,
          ),
        }, { 
          live 
        });
      } catch (e) {
        console.error(e);
        this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Could not publish event. Failed to publish website.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    try {
      webFlow = await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
      response.status = pb.StatusCode.OK;
      response.webFlow = pb.WebFlow.fromObject(webFlow);
    } catch (e) {
      this.logger.error(`publishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Site published with errors.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
  private unpublishWebFlowEvent = async (request: pb.UnpublishWebFlowEventRequest): Promise<pb.UnpublishWebFlowEventResponse> => {
    const span = tracer.startSpan('unpublishWebFlowEvent', request.spanContext);
    const response: pb.UnpublishWebFlowEventResponse = pb.UnpublishWebFlowEventResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      eventId: Joi.string().required(),
      siteId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`unpublishWebFlowEvent - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, eventId, siteId } = params.value;

    /**
     * Find the WebFlow
     */
    let webFlow: IWebFlow;

    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
      if (!webFlow) {
        throw new Error(`Website configuration belonging to org ${orgId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Could not find site configuration. Failed to publish website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    /**
     * Unpublish the event
     */
    const webFlowEvent = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.EVENT && e.selloutId === eventId);

    if (!webFlowEvent) {
      const message = 'Failed to remove event. Event site entity does not exist.';
      this.logger.error(`unpublishWebFlowEvent - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    const webFlowEventId = webFlowEvent.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowEventId) {
      const message = 'Failed to remove event. Event does not exist on this site.';
      this.logger.error(`unpublishWebFlowEvent - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    try {
      await patchItem({
        collectionId: site.eventCollectionId,
        itemId: webFlowEventId.webFlowEntityId,
        fields: {
          _draft: true,
          _archived: true,
        },
      }, { 
        live: true
      });
      await webFlowClient.removeItem({
        collectionId: site.eventCollectionId,
        itemId: webFlowEventId.webFlowEntityId,
      });
      webFlowEvent.webFlowIds = webFlowEvent.webFlowIds
        .filter((e: IWebFlowEntityId): boolean => e.webFlowSiteId !== siteId);
      webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
        if (e.selloutId !== webFlowEvent.selloutId) return e;
        return webFlowEvent;
      });

    } catch (e) {
      console.error(e);
      this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to remove event from website.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Find the Event
    */
    const findEventRequest = pb.FindEventByIdRequest.create({
      spanContext: span.context().toString(),
      eventId,
    });

    let findEventResponse: pb.FindEventByIdResponse;

    try {
      findEventResponse = await this.proxy.eventService.findEventById(findEventRequest);

      if (!findEventResponse || !findEventResponse.event) {
        throw new Error(`Event with id ${eventId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to remove event entities from website.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { event } = findEventResponse;
    const { venueId } = event;
    const artistIds = EventUtil.artistIds(event);

    const eventIds = webFlow.entities
    .filter(entity => entity.entityType === WebFlowEntityType.EVENT)
    .filter(entity => entity.webFlowIds.length > 0)
    .filter(entity => entity.selloutId !== event._id.toString())
    .map(entity => entity.selloutId);
    
    let queryEventsResponse: pb.QueryEventResponse;
    try {
      const queryEventsRequest = pb.QueryEventsRequest.create({
        spanContext: span.context().toString(),
        orgId,
        query: {
          eventIds, 
        }
      });

      queryEventsResponse = await this.proxy.eventService.queryEvents(queryEventsRequest);
    } catch (e) {
      this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to query events to find referenced objects',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { events } = queryEventsResponse;

    const allReferencedFields = events.reduce((cur, event) => {
      return cur.concat(EventUtil.artistIds(event), EventUtil.venueIds(event), event.orgId);
    }, []);

    /**
    * Unpublish the venue
    */
    const venueIsReferenced = allReferencedFields.includes(venueId);


    if (!venueIsReferenced) {
      const unpublishVenueRequest = pb.UnpublishWebFlowVenueRequest.create({
        spanContext: span.context().toString(),
        orgId,
        venueId,
        siteId,
        webFlow,
      });

      let unpublishVenueResponse: pb.UnpublishVenueResponse;
      try {
        unpublishVenueResponse = await this.unpublishVenue(unpublishVenueRequest);
      } catch (e) {
        this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Fail to remove venue from website.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
      webFlow = unpublishVenueResponse.webFlow;
    } 

    /**
    * Unpublish the artists
    */
    webFlow = await artistIds.reduce(async (webFlow: Promise<IWebFlow>, artistId: string): Promise<IWebFlow> => {

      const resolvedWebFlow = await webFlow;

      const artistIsReferenced = allReferencedFields.includes(artistId);

      if (artistIsReferenced) {
        return resolvedWebFlow;
      }

      const unpublishArtistRequest = pb.UnpublishWebFlowArtistRequest.create({
        spanContext: span.context().toString(),
        orgId,
        artistId,
        siteId,
        webFlow: resolvedWebFlow,
      });

      let publishArtistResponse: pb.UnpublishWebFlowArtistResponse;
      try {
        publishArtistResponse = await this.unpublishArtist(unpublishArtistRequest);
      } catch (e) {
        this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Fail to remove artist from website.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
      return publishArtistResponse.webFlow;
    }, Promise.resolve(webFlow));

    /**
    * Unpublish the organization
    */
    const orgIsReferenced = allReferencedFields.includes(orgId);

    if (!orgIsReferenced) {
      const unpublishOrgRequest = pb.UnpublishWebFlowOrganizationRequest.create({
        spanContext: span.context().toString(),
        orgId,
        siteId,
        webFlow,
      });

      let unpublishOrgResponse: pb.UnpublishWebFlowOrganizationResponse;
      try {
        unpublishOrgResponse = await this.unpublishOrganization(unpublishOrgRequest);
      } catch (e) {
        this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Fail to remove organization from website.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }

      webFlow = unpublishOrgResponse.webFlow;
    }

    try {
      webFlow = await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
    } catch (e) {
      this.logger.error(`unpublishWebFlowEvent - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Event unpublished with errors.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  /****************************************************************************************
  * Venue
  *****************************************************************************************/

  private transformVenue(venue, slug): any {
    const { address = {} } = venue;
    const webFlowVenue: any = {
      name: venue.name,
      'sellout-id': venue._id.toString(),
      'venue-description': venue.description,
      'description-plain-text': HtmlTransform.transform(venue.description),
      'venue-image': venue.imageUrls[0],
      'address-line-1': address.address1,
      'address-line-2': address.address2,
      city: address.city,
      state: address.state,
      'zip-code': address.zip,
      country: address.country,
      _archived: false,
      _draft: false,
    };

    if (slug) webFlowVenue.slug = slug;

    return webFlowVenue;
  }

  private createVenueWebFlowEntity = async (spanContext: string, orgId: string, venueId: string, webFlow: IWebFlow): Promise<IWebFlow> => {
    const span = tracer.startSpan('createVenueWebFlowEntity', spanContext);

    const findVenueRequest = pb.FindVenueByIdRequest.create({
      spanContext: span.context().toString(),
      venueId,
    });

    let findVenueResponse: pb.FindVenueByIdResponse;

    try {
      findVenueResponse = await this.proxy.venueService.findVenueById(findVenueRequest);
      if (!findVenueResponse || !findVenueResponse.venue) {
        throw new Error(`Venue with id ${venueId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`createVenueWebFlowEntity - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return null;
    }

    const { venue } = findVenueResponse;

    const createdAt = Time.now();

    const venueEntity: IWebFlowEntity = {
      entityType: WebFlowEntityType.VENUE,
      name: venue.name,
      selloutId: venue._id,
      webFlowIds: [],
      createdAt,
      updatedAt: createdAt,
    };

    webFlow.entities.push(venueEntity);

    span.finish();
    return webFlow;
  }

  public venueUpdated = async (request: pb.Broadcast.VenueUpdatedNotification): Promise<void> => {
    const span = tracer.startSpan('venueUpdated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venueId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`venueUpdated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, venueId } = params.value;

    let webFlow: IWebFlow;
    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
    } catch (e) {
      this.logger.error(`venueUpdated - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return;
    }

    const webFlowVenue = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.VENUE && e.selloutId === venueId);

    // If there is no entity, then this
    // entity isn't published anywhere on webflow
    // and does not need to be updated
    if (!webFlowVenue) {
      span.finish();
      return;
    }

    webFlow = await webFlowVenue.webFlowIds.reduce(async (webFlow: Promise<IWebFlow>, webFlowId): Promise<IWebFlow> => {

      const resolvedWebFlow: IWebFlow  = await webFlow;

      const publishVenueRequest = pb.PublishWebFlowVenueRequest.create({
        spanContext: span.context.toString(),
        orgId,
        venueId,
        webFlow: resolvedWebFlow,
        siteId: webFlowId.webFlowSiteId,
      });
      let response: pb.PublishWebFlowVenueResponse;

      try {
        response = await this.publishVenue(publishVenueRequest);
      } catch (e) {
        this.logger.error(`venueUpdated - error: ${JSON.stringify(e.message)}`);
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return;
      }
      return response.webFlow;
    },                                             Promise.resolve(webFlow));

    try {
      await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
    } catch (e) {
      this.logger.error(`venueUpdated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
    }

    span.finish();
    return;
  }

  public publishVenue = async (request: pb.PublishWebFlowVenueRequest): Promise<pb.PublishWebFlowVenueResponse> => {
    const span = tracer.startSpan('publishVenue', request.spanContext);
    const response: pb.PublishWebFlowVenueResponse = pb.PublishWebFlowVenueResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venueId: Joi.string().required(),
      siteId: Joi.string().required(),
      live: Joi.boolean().default(false),
      webFlow: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`publishVenue - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    let { orgId, venueId, siteId, webFlow, live } = params.value;


    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    /**
    * Find the Venue
    */
    const findVenueRequest = pb.FindVenueByIdRequest.create({
      spanContext: span.context().toString(),
      venueId,
    });

    let findVenueResponse: pb.FindVenueByIdResponse;

    try {
      findVenueResponse = await this.proxy.venueService.findVenueById(findVenueRequest);

      if (!findVenueResponse || !findVenueResponse.venue) {
        throw new Error(`Venue with id ${venueId} does not exist.`);
      }
    } catch (e) {
      console.error(e);
      this.logger.error(`publishWebFlowVenue - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to publish venue.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { venue } = findVenueResponse;

    /**
    * Publish the venue
    */
    let webFlowVenue = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.VENUE && e.selloutId === venue._id);

    /**
    * Create the webflow entity in Sellout if it doesn't exist
    */
    if (!webFlowVenue) {
      webFlow = await this.createVenueWebFlowEntity(span.context().toString(), orgId, venueId, webFlow);

      webFlowVenue = webFlow.entities
        .find(e => e.entityType === WebFlowEntityType.VENUE && e.selloutId === venue._id);
    }

    let webFlowVenueId = webFlowVenue.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowVenueId || !webFlowVenueId.webFlowEntityId) {
      try {
        const slug = webFlowVenueId ? webFlowVenueId.slug : Random.generateOfLength(16).toString();
        const result = await webFlowClient.createItem({
          collectionId: site.venueCollectionId,
          fields: this.transformVenue(venue, slug),
        }, { live });
        webFlowVenueId = {
          webFlowEntityId: result._id,
          webFlowSiteId: siteId,
          slug,
        };
        webFlowVenue.webFlowIds.push(webFlowVenueId);
        webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
          if (e.selloutId !== webFlowVenue.selloutId) return e;
          return webFlowVenue;
        });

      } catch (e) {
        console.error(e);
        this.logger.error(`publishWebFlowVenue - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish venue.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    } else {
      try {
        await webFlowClient.updateItem({
          collectionId: site.venueCollectionId,
          itemId: webFlowVenueId.webFlowEntityId,
          fields: this.transformVenue(venue, webFlowVenueId.slug),
        }, { live: true });

        webFlowVenue.name = venue.name;
        webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
          if (e.selloutId !== webFlowVenue.selloutId) return e;
          return webFlowVenue;
        });

      } catch (e) {
        console.error(e);
        this.logger.error(`publishWebFlowVenue - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish venue.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }
  private unpublishVenue = async (request: pb.UnpublishWebFlowVenueRequest): Promise<pb.UnpublishWebFlowVenueResponse> => {
    const span = tracer.startSpan('unpublishVenue', request.spanContext);
    const response: pb.UnpublishWebFlowVenueResponse = pb.UnpublishWebFlowVenueResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      venueId: Joi.string().required(),
      siteId: Joi.string().required(),
      webFlow: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`unpublishVenue - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { venueId, siteId, webFlow } = params.value;

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    const webFlowVenue = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.VENUE && e.selloutId === venueId);

    if (!webFlowVenue) {
      const message = 'Failed to remove venue. Venue site entity does not exist.';
      this.logger.error(`unpublishVenue - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    const webFlowVenueId = webFlowVenue.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowVenueId) {
      const message = 'Failed to remove venue. Venue does not exist on this site.';
      this.logger.error(`unpublishVenue - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    try {
      await patchItem({
        collectionId: site.venueCollectionId,
        itemId: webFlowVenueId.webFlowEntityId,
        fields: {
          _draft: true,
          _archived: true,
        },
      }, { 
        live: true
      });
      await webFlowClient.removeItem({
        collectionId: site.venueCollectionId,
        itemId: webFlowVenueId.webFlowEntityId,
      });
      webFlowVenue.webFlowIds = webFlowVenue.webFlowIds
        .filter((e: IWebFlowEntityId): boolean => e.webFlowSiteId !== siteId);
      webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
        if (e.selloutId !== webFlowVenue.selloutId) return e;
        return webFlowVenue;
      });
    } catch (e) {
      console.error(e);
      this.logger.error(`unpublishVenue - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to remove venue from website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  /****************************************************************************************
  * Artist
  *****************************************************************************************/

  private transformArtist(artist, slug): any {
    const { pressKits: [pressKit], socialAccounts } = artist;
    const links = socialAccounts.reduce((cur, next) => {
      cur[next.platform] = next.link;
      return cur;
    },                                  {});

    const webFlowArtist: any = {
      name: artist.name,
      'sellout-id': artist._id.toString(),
      'poster-image': pressKit.posterImageUrls[0],
      bio: pressKit.description,
      'plain-text-bio': HtmlTransform.transform(pressKit.description),
      'official-website': links.Web,
      'facebook-link': links.FaceBook,
      'instagram-link': links.Instagram,
      'youtube-link': links.YouTube,
      'spotify-link': links.Spotify,
      'apple-music-link': links.AppleMusic,
      _archived: false,
      _draft: false,
    };

    if (slug) webFlowArtist.slug = slug;

    return webFlowArtist;
  }

  private createArtistWebFlowEntity = async (spanContext: string, orgId: string, artistId: string, webFlow: IWebFlow): Promise<IWebFlow> => {
    const span = tracer.startSpan('createArtistWebFlowEntity', spanContext);

    const findArtistRequest = pb.FindArtistByIdRequest.create({
      spanContext: span.context().toString(),
      orgId,
      artistId,
    });

    let findArtistResponse: pb.FindArtistByIdResponse;

    try {
      findArtistResponse = await this.proxy.artistService.findArtistById(findArtistRequest);
      if (!findArtistResponse || !findArtistResponse.artist) {
        throw new Error(`Artist with id ${artistId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`createArtistWebFlowEntity - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return null;
    }

    const { artist } = findArtistResponse;

    const createdAt = Time.now();

    const artistEntity: IWebFlowEntity = {
      entityType: WebFlowEntityType.ARTIST,
      name: artist.name,
      selloutId: artist._id,
      webFlowIds: [],
      createdAt,
      updatedAt: createdAt,
    };

    webFlow.entities.push(artistEntity);

    span.finish();
    return webFlow;
  }

  public artistUpdated = async (request: pb.Broadcast.ArtistUpdatedNotification): Promise<void> => {
    const span = tracer.startSpan('artistUpated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      artistId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`artistUpdated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, artistId } = params.value;


    let webFlow: IWebFlow;
    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
    } catch (e) {
      this.logger.error(`artistUpdated - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return;
    }

    const webFlowArtist = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ARTIST && e.selloutId === artistId);

    // If there is no entity, then this
    // entity isn't published anywhere on webflow
    // and does not need to be updated
    if (!webFlowArtist) {
      span.finish();
      return;
    }

    webFlow = await webFlowArtist.webFlowIds.reduce(async (webFlow: Promise<IWebFlow>, webFlowId): Promise<IWebFlow> => {

      const resolvedWebFlow: IWebFlow = await webFlow;

      const publishArtistRequest = pb.PublishWebFlowArtistRequest.create({
        spanContext: span.context.toString(),
        orgId,
        artistId,
        webFlow: resolvedWebFlow,
        siteId: webFlowId.webFlowSiteId,
      });
      let response: pb.PublishWebFlowArtistResponse;

      try {
        response = await this.publishArtist(publishArtistRequest);
      } catch (e) {
        this.logger.error(`artistUpdated - error: ${JSON.stringify(e.message)}`);
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return;
      }
      return response.webFlow;
    },                                              Promise.resolve(webFlow));

    try {
      await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
    } catch (e) {
      this.logger.error(`artistUpdated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
    }

    span.finish();
    return;
  }

  public publishArtist = async (request: pb.PublishWebFlowArtistRequest): Promise<pb.PublishWebFlowArtistResponse> => {
    const span = tracer.startSpan('publishArtist', request.spanContext);
    const response: pb.PublishWebFlowArtistResponse = pb.PublishWebFlowArtistResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      artistId: Joi.string().required(),
      siteId: Joi.string().required(),
      live: Joi.boolean().default(false),
      webFlow: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`publishArtist - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    let { orgId, artistId, siteId, webFlow, live } = params.value;

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    /**
    * Find the Artist
    */
    const findArtistRequest = pb.FindArtistByIdRequest.create({
      spanContext: span.context().toString(),
      orgId,
      artistId,
    });

    let findArtistResponse: pb.FindArtistByIdResponse;

    try {
      findArtistResponse = await this.proxy.artistService.findArtistById(findArtistRequest);

      if (!findArtistResponse || !findArtistResponse.artist) {
        throw new Error(`Artist with id ${artistId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`publishWebFlowArtist - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to publish artist',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { artist } = findArtistResponse;

    /**
    * Publish the artist
    */
    let webFlowArtist = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ARTIST && e.selloutId === artist._id);

    /**
     * Create the webflow entity in Sellout if it doesn't exist
     */
    if (!webFlowArtist) {
      webFlow = await this.createArtistWebFlowEntity(span.context().toString(), orgId, artistId, webFlow);
      webFlowArtist = webFlow.entities
        .find(e => e.entityType === WebFlowEntityType.ARTIST && e.selloutId === artist._id);
    }

    let webFlowArtistId = webFlowArtist.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowArtistId || !webFlowArtistId.webFlowEntityId) {
      try {
        const slug = webFlowArtistId ? webFlowArtistId.slug : Random.generateOfLength(16).toString();
        const result = await webFlowClient.createItem({
          collectionId: site.artistCollectionId,
          fields: this.transformArtist(artist, slug),
        }, { 
          live 
        });
        webFlowArtistId = {
          webFlowEntityId: result._id,
          webFlowSiteId: siteId,
          slug,
        };
        webFlowArtist.webFlowIds.push(webFlowArtistId);
        webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
          if (e.selloutId !== webFlowArtist.selloutId) return e;
          return webFlowArtist;
        });

      } catch (e) {
        console.error(e);
        this.logger.error(`publishWebFlowArtist - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish website',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    } else {
      try {
        await webFlowClient.updateItem({
          collectionId: site.artistCollectionId,
          itemId: webFlowArtistId.webFlowEntityId,
          fields: this.transformArtist(artist, webFlowArtistId.slug),
        },                             { live: true });

        webFlowArtist.name = artist.name;
        webFlow.entities = webFlow.entities.map(
          (e: IWebFlowEntity): IWebFlowEntity => {
            if (e.selloutId !== webFlowArtist.selloutId) return e;
            return webFlowArtist;
          },
        );
      } catch (e) {
        this.logger.error(`publishWebFlowArtist - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish artist',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  private unpublishArtist = async (request: pb.UnpublishWebFlowArtistRequest): Promise<pb.UnpublishWebFlowArtistResponse> => {
    const span = tracer.startSpan('unpublishArtist', request.spanContext);
    const response: pb.UnpublishWebFlowArtistResponse = pb.UnpublishWebFlowArtistResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      artistId: Joi.string().required(),
      siteId: Joi.string().required(),
      webFlow: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`unpublishArtist - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { artistId, siteId, webFlow } = params.value;

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    const webFlowArtist = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ARTIST && e.selloutId === artistId);

    if (!webFlowArtist) {
      const message = 'Failed to remove artist. Artist site entity does not exist.';
      this.logger.error(`unpublishArtist - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    const webFlowArtistId = webFlowArtist.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowArtistId) {
      const message = 'Failed to remove artist. Artist does not exist on this site.';
      this.logger.error(`unpublishArtist - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    try {
      await patchItem({
        collectionId: site.artistCollectionId,
        itemId: webFlowArtistId.webFlowEntityId,
        fields: {
          _draft: true,
          _archived: true,
        },
      }, { 
        live: true
      });
      await webFlowClient.removeItem({
        collectionId: site.artistCollectionId,
        itemId: webFlowArtistId.webFlowEntityId,
      });
      webFlowArtist.webFlowIds = webFlowArtist.webFlowIds
        .filter((e: IWebFlowEntityId): boolean => e.webFlowSiteId !== siteId);
      webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
        if (e.selloutId !== webFlowArtist.selloutId) return e;
        return webFlowArtist;
      });
    } catch (e) {
      console.error(e);
      this.logger.error(`unpublishArtist - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to remove artist from website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  /****************************************************************************************
  * Organization
  *****************************************************************************************/

  private transformOrganization(organization, slug): any {
    const webFlowOrg: any = {
      name: organization.orgName,
      'sellout-id': organization._id,
      'website-url': organization.orgUrls[0],
      logo: organization.orgLogoUrl,
      bio: organization.bio,
      'plain-text-bio': HtmlTransform.transform(organization.bio),
      'phone-number': organization.phoneNumber,
      'support-email': organization.email,
      // "brand-color": organization.orgColorHex,
      _archived: false,
      _draft: false,
    };

    if (slug) webFlowOrg.slug = slug;

    return webFlowOrg;
  }

  private createOrganizationWebFlowEntity = async(spanContext: string, orgId, webFlow: IWebFlow): Promise<IWebFlow> => {
    const span = tracer.startSpan('createOrganizationWebFlowEntity', spanContext);

    /**
     * Find the Organization
     */
    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(findOrgRequest);
      if (!findOrgResponse || !findOrgResponse.organization) {
        throw new Error(`Organization with id ${orgId} does not exist`);
      }
    } catch (e) {
      this.logger.error(`createOrganizationWebFlowEntity - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return null;
    }

    const { organization } = findOrgResponse;

    /**
    * Create and save the webflow config
    */
    const createdAt = Time.now();

    const organizationEntity: IWebFlowEntity = {
      entityType: WebFlowEntityType.ORGANIZATION,
      name: organization.orgName,
      selloutId: orgId,
      webFlowIds: [],
      createdAt,
      updatedAt: createdAt,
    };

    webFlow.entities.push(organizationEntity);

    span.finish();
    return webFlow;
  }

  public organizationCreated = async (request: pb.Broadcast.OrganizationCreatedNotification): Promise<void> => {
    const span = tracer.startSpan('organizationCreated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`organizationUpated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId } = params.value;

    const createRequest = pb.CreateWebFlowRequest.create({
      spanContext: span.context().toString(),
      orgId,
    });

    try {
      await this.createWebFlow(createRequest);
    } catch (e) {
      this.logger.error(`organizationCreated - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return;
    }

    span.finish();
    return;
  }

  public organizationUpdated = async (request: pb.Broadcast.OrganizationUpdatedNotification): Promise<void> => {
    const span = tracer.startSpan('organizationUpated', request.spanContext);

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`organizationUpated - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId } = params.value;

    let webFlow: IWebFlow;
    try {
      webFlow = await this.storage.findOrganizationWebFlow(span, orgId);
    } catch (e) {
      this.logger.error(`organizationUpated - error: ${JSON.stringify(e.message)}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return;
    }

    const webFlowOrganization = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ORGANIZATION && e.selloutId === orgId);

    // If there is no entity, then this
    // entity isn't published anywhere on webflow
    // and does not need to be updated
    if (!webFlowOrganization) {
      span.finish();
      return;
    }

    webFlow = await webFlowOrganization.webFlowIds.reduce(async (webFlow: Promise<IWebFlow>, webFlowId): Promise<IWebFlow> => {

      const resolvedWebFlow: IWebFlow = await webFlow;

      const publishOrganizationRequest = pb.PublishWebFlowOrganizationRequest.create({
        spanContext: span.context.toString(),
        orgId,
        webFlow: resolvedWebFlow,
        siteId: webFlowId.webFlowSiteId,
      });
      let response: pb.PublishWebFlowOrganizationResponse;

      try {
        response = await this.publishOrganization(publishOrganizationRequest);
      } catch (e) {
        this.logger.error(`organizationUpated - error: ${JSON.stringify(e.message)}`);
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return;
      }
      return response.webFlow;
    },                                                    Promise.resolve(webFlow));

    try {
      await this.storage.updateOrganizationWebFlow(span, orgId, webFlow);
    } catch (e) {
      this.logger.error(`organizationUpated - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
    }

    span.finish();
    return;
  }

  private publishOrganization = async (request: pb.PublishWebFlowOrganizationRequest): Promise<pb.PublishWebFlowOrganizationResponse> => {
    const span = tracer.startSpan('publishOrganization', request.spanContext);
    const response: pb.PublishWebFlowOrganizationResponse = pb.PublishWebFlowOrganizationResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      siteId: Joi.string().required(),
      webFlow: Joi.any(),
      live: Joi.boolean().default(false),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`publishOrganization - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    let { orgId, siteId, webFlow, live } = params.value;

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    /**
     * Find the Organization
     */
    const findOrgRequest = pb.FindOrganizationRequest.create({
      spanContext: span.context().toString(),
      orgId,
    });

    let findOrgResponse: pb.FindOrganizationResponse;

    try {
      findOrgResponse = await this.proxy.organizationService.findOrganization(findOrgRequest);

      if (!findOrgResponse || !findOrgResponse.organization) {
        throw new Error(`Organization with id ${orgId} does not exist.`);
      }
    } catch (e) {
      this.logger.error(`publishOrganization - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to publish organization.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    const { organization } = findOrgResponse;

    /**
     * Publish the organization
     */
    let webFlowOrg = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ORGANIZATION && e.selloutId === organization._id);

    /**
     * Create the webflow entity in Sellout if it doesn't exist
     */
    if (!webFlowOrg) {
      webFlow = await this.createOrganizationWebFlowEntity(span.context().toString(), orgId, webFlow);

      webFlowOrg = webFlow.entities
        .find(e => e.entityType === WebFlowEntityType.ORGANIZATION && e.selloutId === organization._id);
    }

    let webFlowOrgId = webFlowOrg.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowOrgId || !webFlowOrgId.webFlowEntityId) {
      try {
        const slug = webFlowOrgId ? webFlowOrgId.slug : Random.generateOfLength(16).toString();
        const result = await webFlowClient.createItem({
          collectionId: site.organizationCollectionId,
          fields: this.transformOrganization(organization, slug),
        }, { 
          live 
        });
        webFlowOrgId = {
          webFlowEntityId: result._id,
          webFlowSiteId: siteId,
          slug,
        };
        webFlowOrg.webFlowIds.push(webFlowOrgId);
        webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
          if (e.selloutId !== webFlowOrg.selloutId) return e;
          return webFlowOrg;
        });

      } catch (e) {
        console.error(e);
        this.logger.error(`publishOrganization - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish organization to website',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    } else {
      try {
        await webFlowClient.updateItem({
          collectionId: site.organizationCollectionId,
          itemId: webFlowOrgId.webFlowEntityId,
          fields: this.transformOrganization(organization, webFlowOrgId.slug),
        },                             { live: true });

        webFlowOrg.name = organization.name;
        webFlow.entities = webFlow.entities.map(
          (e: IWebFlowEntity): IWebFlowEntity => {
            if (e.selloutId !== webFlowOrg.selloutId) return e;
            return webFlowOrg;
          },
        );
      } catch (e) {
        this.logger.error(`publishOrganization - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Failed to publish organization to website',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

  private unpublishOrganization = async (request: pb.UnpublishWebFlowOrganizationRequest): Promise<pb.UnpublishWebFlowOrganizationResponse> => {
    const span = tracer.startSpan('unpublishOrganization', request.spanContext);
    const response: pb.UnpublishWebFlowOrganizationResponse = pb.UnpublishWebFlowOrganizationResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      siteId: Joi.string().required(),
      webFlow: Joi.any(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`unpublishOrganization - error: ${JSON.stringify(params.error)}`);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return;
    }
    const { orgId, siteId, webFlow } = params.value;

    const site = webFlow.sites.find(s => s.webFlowId === siteId);

    const webFlowOrg = webFlow.entities
      .find(e => e.entityType === WebFlowEntityType.ORGANIZATION && e.selloutId === orgId);

    if (!webFlowOrg) {
      const message = 'Failed to remove organization. Organization site entity does not exist.';
      this.logger.error(`unpublishOrganization - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    const webFlowOrgId = webFlowOrg.webFlowIds
      .find(id => id.webFlowSiteId === siteId);

    if (!webFlowOrgId) {
      const message = 'Failed to remove organization. Organization does not exist on this site.';
      this.logger.error(`unpublishOrganization - error: ${message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message,
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: message });
      span.finish();
      return response;
    }

    try {
      await patchItem({
        collectionId: site.organizationCollectionId,
        itemId: webFlowOrgId.webFlowEntityId,
        fields: {
          _draft: true,
          _archived: true,
        },
      }, { 
        live: true
      });
      await webFlowClient.removeItem({
        collectionId: site.organizationCollectionId,
        itemId: webFlowOrgId.webFlowEntityId,
      });
      webFlowOrg.webFlowIds = webFlowOrg.webFlowIds
      .filter((e: IWebFlowEntityId): boolean => e.webFlowSiteId !== siteId);
      webFlow.entities = webFlow.entities.map((e: IWebFlowEntity): IWebFlowEntity => {
        if (e.selloutId !== webFlowOrg.selloutId) return e;
        return webFlowOrg;
      });
    } catch (e) {
      console.error(e);
      this.logger.error(`unpublishOrganization - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Failed to remove organization from website',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    response.status = pb.StatusCode.OK;
    response.webFlow = pb.WebFlow.fromObject(webFlow);

    span.finish();
    return response;
  }

}
