import IVenue from '@sellout/models/.dist/interfaces/IVenue';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer  from '@sellout/service/.dist/Tracer';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Joi from '@hapi/joi';
// import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('VenueStore');

interface IVenueQuery {
  orgId: string;
  name?: string;
  venueIds?: string[];
  any?: boolean;
}

export default class VenueStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Venue;

  constructor(Venue) {
    this.Venue = Venue;
  }
  public async createVenue(spanContext: string, venue: IVenue): Promise<IVenue> {
    const span = tracer.startSpan('createVenue', spanContext);
    const schema = Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      capacity: Joi.number(),
      address: Joi.any(),
      url: Joi.any(),
      tax: Joi.number().precision(2).min(0).optional(),
      imageUrls: Joi.any(),
      venueGlobalId: Joi.any(),
      orgId: Joi.any(),
      createdAt: Joi.number(),
    });

    const params = schema.validate(venue);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const newVenue = new this.Venue(venue);

    let saveVenue: IVenue;
    try {
      saveVenue = await newVenue.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new VenueStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveVenue;
  }
  public async listVenues(spanContext: string, query: object, pagination: IPagination): Promise<IVenue[]> {
    const span = tracer.startSpan('listVenues', spanContext);
    let venues: IVenue[];
    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        venues = await this.Venue.find(query)
          .skip(skips)
          .limit(pageSize);
      } else {
        venues = await this.Venue.find(query);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new VenueStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return venues;
  }
  public async findVenueById(spanContext: string, venueId: string): Promise<IVenue> {
    const span = tracer.startSpan('findVenueById', spanContext);
    let venue: IVenue;
    try {
      venue = await this.Venue.findById(venueId);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new VenueStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return venue;
  }
  public async updateOneVenue(spanContext: string, orgId: string, venue: IVenue): Promise<IVenue> {
    const span = tracer.startSpan('updateOneVenue', spanContext);
    const schema = Joi.object().keys({
      _id: Joi.string(),
      name: Joi.string().required(),
      description: Joi.string().allow('').default(''),
      capacity: Joi.number(),
      address: Joi.any(),
      url: Joi.any(),
      tax: Joi.number().precision(2).min(0).optional(),
      imageUrls: Joi.any(),
      venueGlobalId: Joi.any(),
      orgId: Joi.any(),
      createdAt: Joi.number(),
    });

    const params = schema.validate(venue);
    let vanueId = venue._id
    delete venue._id

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    try {
      venue = await this.Venue.findOneAndUpdate({ orgId, _id: vanueId }, { $set: { ...venue } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new VenueStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return venue;
  }
  public async queryVenues(spanContext: string, query: IVenueQuery, pagination: IPagination): Promise<IVenue[]> {
    const span = tracer.startSpan('queryVenues', spanContext);
    let venues: IVenue[];
    let finalQuery: any = {};

    if (query.name) {
      finalQuery.name = { $regex: query.name, $options: 'i' };
    }

    if (query.venueIds && query.venueIds.filter(id => Boolean(id)).length) {
      finalQuery._id = { $in: query.venueIds.filter(id => Boolean(id)) };
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
      if (pagination && pagination.pageNumber) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        venues = await this.Venue.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({ createdAt: -1 });
      } else {
        venues = await this.Venue.find(finalQuery);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new VenueStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return venues;
  }
}
