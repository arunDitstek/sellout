import * as pb from '@sellout/models/.dist/sellout-proto';
import * as Time from '@sellout/utils/.dist/time';
import Joi from '@hapi/joi';
import BaseService from "@sellout/service/.dist/BaseService";
import ConsoleLogManager from '@sellout/service/.dist/ConsoleLogManager';
import NatsConnectionManager from '@sellout/service/.dist/NatsConnectionManager';
import PbMessageHandler from '@sellout/service/.dist/PbMessageHandler';
import joiToErrors, { joiToErrorMessages } from '@sellout/service/.dist/joiToErrors';
import { Artist } from './Artist';
import ArtistStore from './ArtistStore';
import IArtist  from '@sellout/models/.dist/interfaces/IArtist';
import Tracer  from '@sellout/service/.dist/Tracer';
import { IServiceProxy, proxyProvider } from './proxyProvider';
import { NATS_URL } from './env';

const tracer = new Tracer('ArtistService');

export default class ArtistService extends BaseService {

  public proxy: IServiceProxy;

  constructor(opts) {
    super(opts);
    this.proxy = proxyProvider(this.connectionMgr);
  }
  public static main() {
    const serviceName = pb.ArtistService.name;
    const logger = new ConsoleLogManager({
      serviceName,
    });
    const service = new ArtistService({
      serviceName,
      connectionMgr: new NatsConnectionManager([<string>NATS_URL], logger, true),
      logManager: logger,
      storageManager: new ArtistStore(Artist),
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
      createArtist: new PbMessageHandler(
        this.createArtist,
        pb.CreateArtistRequest,
        pb.CreateArtistResponse,
      ),
      updateArtist: new PbMessageHandler(
        this.updateArtist,
        pb.UpdateArtistRequest,
        pb.UpdateArtistResponse,
      ),
      findArtistById: new PbMessageHandler(
        this.findArtistById,
        pb.FindArtistByIdRequest,
        pb.FindArtistByIdResponse,
      ),
      queryArtists: new PbMessageHandler(
        this.queryArtists,
        pb.QueryArtistsRequest,
        pb.QueryArtistsResponse,
      ),
      listArtistsById: new PbMessageHandler(
        this.listArtistsById,
        pb.ListArtistsByIdRequest,
        pb.ListArtistsByIdResponse,
      ),
      listArtists: new PbMessageHandler(
        this.listArtists,
        pb.ListArtistsRequest,
        pb.ListArtistsResponse,
      ),
      queryGlobalArtists: new PbMessageHandler(
        this.queryGlobalArtists,
        pb.QueryGlobalArtistsRequest,
        pb.QueryGlobalArtistsResponse,
      ),
    });
  }

  public createArtist = async (request: pb.CreateArtistRequest): Promise<pb.CreateArtistResponse> => {
    const span = tracer.startSpan('createArtist', request.spanContext);
    const response: pb.CreateArtistResponse = pb.CreateArtistResponse.create();

    const schema = Joi.object().options({ abortEarly: false }).keys({
      spanContext: Joi.string(),
      orgId: Joi.string(),
      artist: {
        type: Joi.string().required().messages({ 'any.required': 'Artist type is a required field' }),
        name: Joi.string().required().messages({ 'any.required': 'Artist name is a required field' }),
        genres: Joi.array(),
        socialAccounts: Joi.array(),
        pressKits: Joi.array().items(Joi.object().keys({
          _id: Joi.string().required(),
          posterImageUrls: Joi.array().required().messages({ 'any.required': 'Artist image is a required field' }),
          description: Joi.string().optional(),
        })),
        contacts: Joi.array(),
        artistGlobalId: Joi.string(),
        orgId: Joi.string(),
      },
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`createArtist - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrorMessages(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }
    const { orgId, artist } = params.value;

    artist.createdAt = Time.now();

    let globalArtist: IArtist;

    if (!artist.artistGlobalId) {
      try {
        globalArtist = await this.storage.createArtist(span, artist);
      } catch (e) {
        this.logger.error(`createArtist - error: ${e.message}`);
        response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
        response.errors = [
          pb.Error.create({
            key: 'Error',
            message: 'Global artist creation was unsuccessful. Please contact support.',
          }),
        ];
        span.setTag('error', true);
        span.log({ errors: e.message  });
        span.finish();
        return response;
      }

      artist.artistGlobalId = globalArtist._id.toString();
    }

    artist.orgId = orgId;

    let orgArtist: IArtist;
    try {
      orgArtist = await this.storage.createArtist(span, artist);
      response.status = pb.StatusCode.OK;
      response.artist = pb.Artist.fromObject(orgArtist);
    } catch (e) {
      this.logger.error(`createArtist - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [
        pb.Error.create({
          key: 'Error',
          message: 'Artist creation was unsuccessful. Please contact support.',
        }),
      ];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

   /**
   * Broadcast artist creation
   */
    const artistCreatedNotification = pb.Broadcast.ArtistCreatedNotification.create({
      spanContext: span.context().toString(),
      orgId,
      artistId: orgArtist._id.toString(),
    });

    try {
      await this.proxy.broadcast.artistCreated(artistCreatedNotification);
    } catch (e) {
      this.logger.error(`createArtist - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
    }

    span.finish();
    return response;
  }
  public updateArtist = async (request: pb.UpdateArtistRequest): Promise<pb.UpdateArtistResponse> => {
    const span = tracer.startSpan('updateArtist', request.spanContext);
    const response: pb.UpdateArtistResponse = pb.UpdateArtistResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      artist: {
        _id: Joi.string().required(),
        orgId: Joi.string(),
        type: Joi.string(),
        name: Joi.string(),
        genres: Joi.array().default([]),
        socialAccounts: Joi.array().default([]),
        pressKits: Joi.array().default([]),
        contacts: Joi.array().default([]),
        artistGlobalId: Joi.string(),
      },
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`updateArtist - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, artist } = params.value;


    let updateArtist: IArtist;

    try {
      updateArtist = await this.storage.updateOneArtist(span, orgId, artist);
      response.status = pb.StatusCode.OK;
      response.artist = pb.Artist.fromObject(updateArtist);
    } catch (e) {
      this.logger.error(`updateArtist - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    /**
    * Broadcast artist update
    */
    const artistUpdatedNotifcation = pb.Broadcast.ArtistUpdatedNotification.create({
      spanContext: span.context().toString(),
      artistId: artist._id.toString(),
      orgId,
    });

    try {
      await this.proxy.broadcast.artistUpdated(artistUpdatedNotifcation);
    } catch (e) {
      this.logger.error(`updateArtist - error: ${e.message}`);
      span.setTag('error', true);
      span.log({ errors: e.message  });
    }

    span.finish();
    return response;
  }
  public listArtists = async (request: pb.ListArtistsRequest): Promise<pb.ListArtistsResponse> => {
    const span = tracer.startSpan('listArtists', request.spanContext);
    const response: pb.ListArtistsResponse = pb.ListArtistsResponse.create();

    let artists: IArtist[];

    try {
      artists = await this.storage.listArtists(span, { orgId: request.orgId });
      response.status = pb.StatusCode.OK;
      response.artists = artists.map(artist => pb.Artist.fromObject(artist));
    } catch (e) {
      this.logger.error(`listArtists - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public listArtistsById = async (request: pb.ListArtistsByIdRequest): Promise<pb.ListArtistsByIdResponse> => {
    const span = tracer.startSpan('listArtistsById', request.spanContext);
    const response: pb.ListArtistsByIdResponse = pb.ListArtistsByIdResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      artistIds: Joi.array().required(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`listArtistsById - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, artistIds } = params.value;


    let artists: IArtist[];

    try {
      artists = await this.storage.listArtistsById(span, orgId, artistIds);
      response.status = pb.StatusCode.OK;
      response.artists = artists.map(artist => pb.Artist.fromObject(artist));
    } catch (e) {
      this.logger.error(`listArtistsById - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public queryArtists = async (request: pb.QueryArtistsRequest): Promise<pb.QueryArtistsResponse> => {
    const span = tracer.startSpan('queryArtists', request.spanContext);
    const response: pb.QueryArtistsResponse = pb.QueryArtistsResponse.create();

    const schema = Joi.object().keys({
      spanContext: Joi.string().required(),
      orgId: Joi.string().required(),
      query: Joi.any().optional(),
      pagination: Joi.any().optional(),
    });

    const params = schema.validate(request);

    if (params.error) {
      this.logger.error(`queryArtists - error: ${JSON.stringify(params.error)}`);
      response.status = pb.StatusCode.UNPROCESSABLE_ENTITY;
      response.errors = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return response;
    }

    const { orgId, query, pagination } = params.value;

    query.orgId = orgId;

    let artists: IArtist[];

    try {
      artists = await this.storage.queryArtists(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.artists = artists.map(artist => (pb.Artist.fromObject(artist)));
    } catch (e) {
      this.logger.error(`queryArtists - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public queryGlobalArtists = async (request: pb.QueryGlobalArtistsRequest): Promise<pb.QueryGlobalArtistsResponse> => {
    const span = tracer.startSpan('queryGlobalArtists', request.spanContext);
    const response: pb.QueryGlobalArtistsResponse = pb.QueryGlobalArtistsResponse.create();

    let artists: IArtist[];
    const pagination = request.pagination;
    const query = request.query.reduce((cur, next) => {
      return {
        ...cur,
        [next.key]: {
          $regex: new RegExp(`^${next.value}`, 'i'),

        },
      };
    },                                 {});

    query.orgId = '';
    query.artistGlobalId = '';

    try {
      artists = await this.storage.listArtists(span, query, pagination);
      response.status = pb.StatusCode.OK;
      response.artists = artists.map(artist => pb.Artist.fromObject(artist));
    } catch (e) {
      this.logger.error(`queryGlobalArtists - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;

  }
  public findArtistById = async (request: pb.FindArtistByIdRequest): Promise<pb.FindArtistByIdResponse> => {
    const span = tracer.startSpan('findArtistById', request.spanContext);
    const response: pb.FindArtistByIdResponse = pb.FindArtistByIdResponse.create();

    let artist: IArtist;
    try {
      artist = await this.storage.findArtistById(span, request.orgId, request.artistId);
      response.status = pb.StatusCode.OK;
      response.artist = artist ? pb.Artist.fromObject(artist) : null;
    } catch (e) {
      this.logger.error(`findArtist - error: ${e.message}`);
      response.status = pb.StatusCode.INTERNAL_SERVER_ERROR;
      response.errors = [pb.Error.create({
        key: 'Error',
        message: e.message,
      })];
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return response;
    }

    span.finish();
    return response;
  }
}
