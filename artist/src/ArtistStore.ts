import IArtist from '@sellout/models/.dist/interfaces/IArtist';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer  from '@sellout/service/.dist/Tracer';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Joi from '@hapi/joi';
// import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('ArtistStore');

interface IArtistQuery {
  orgId: string;
  name?: string;
  artistIds?: string[];
  any?: boolean;
}

export default class ArtistStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Artist;

  constructor(Artist) {
    this.Artist = Artist;
  }
  public async createArtist(spanContext: string, artist: IArtist): Promise<IArtist> {
    const span = tracer.startSpan('createArtist', spanContext);
    const schema = Joi.object().keys({
      type: Joi.string(),
      name: Joi.string(),
      genres: Joi.array(),
      socialAccounts: Joi.array(),
      pressKits: Joi.array(),
      contacts: Joi.array(),
      artistGlobalId: Joi.string(),
      orgId: Joi.string(),
      createdAt: Joi.number(),
    });

    const params = schema.validate(artist);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const newArtist = new this.Artist(artist);

    let saveArtist: IArtist;
    try {
      saveArtist = await newArtist.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveArtist;
  }
  public async listArtists(spanContext: string, query: object, pagination: IPagination): Promise<IArtist[]> {
    const span = tracer.startSpan('listArtists', spanContext);
    let artists: IArtist[];
    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        artists = await this.Artist.find(query)
          .skip(skips)
          .limit(pageSize);
      } else {
        artists = await this.Artist.find(query);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return artists;
  }
  public async listArtistsById(spanContext: string, orgId: string, artistIds: string[]): Promise<IArtist[]> {
    const span = tracer.startSpan('listArtistsById', spanContext);
    let artists: IArtist[];
    try {
      artists = await this.Artist.find({ orgId, _id: { $in: artistIds } });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return artists;
  }
  public async findArtistById(spanContext: string, orgId: string, artistId: string): Promise<IArtist> {
    const span = tracer.startSpan('findArtist', spanContext);
    let artist: IArtist;

    try {
      artist = await this.Artist.findOne({ _id: artistId, orgId  });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return artist;
  }
  public async updateOneArtist(spanContext: string, orgId: string, artist: IArtist): Promise<IArtist> {
    const span = tracer.startSpan('updateOne', spanContext);
    try {
      artist = this.Artist.findOneAndUpdate({ orgId, _id: artist._id }, { $set: artist }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return artist;
  }
  public async queryArtists(spanContext: string, query: IArtistQuery, pagination: IPagination): Promise<IArtist[]> {
    const span = tracer.startSpan('queryArtists', spanContext);
    let artists: IArtist[];
    let finalQuery: any = {};

    if (query.name) {
      finalQuery.name = { $regex: query.name, $options: 'i' };
    }

    if (query.artistIds && query.artistIds.filter(id => Boolean(id)).length) {
      finalQuery._id = { $in: query.artistIds.filter(id => Boolean(id)) };
    }

    // $or queries in mongo must not be empty arrays
    // so we check to make sure it will be populated
    // before we do the conversation.
    // If it is not, this is a 'list all events' request
    // and we can just do a normal query, even
    // if 'query.any' is true
    if (query.any && Object.keys(finalQuery).length) {
      const or = [];
      for (const [key, value] of Object.entries(finalQuery)) {
        or.push({ [key]: value });
      }
      finalQuery = { $or: or, $and: [{ orgId: query.orgId }] };
    } else {
      finalQuery.orgId = query.orgId;
    }

    try {
      if (pagination) {
        const { pageSize = 3, pageNumber = 1 } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        artists = await this.Artist.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({ createdAt: -1 });
      } else {
        artists = await this.Artist.find(finalQuery);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new ArtistStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return artists;
  }
}
