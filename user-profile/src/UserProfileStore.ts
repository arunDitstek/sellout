import IUserProfile from '@sellout/models/.dist/interfaces/IUserProfile';
// import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer from '@sellout/service/.dist/Tracer';
// import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
// import Joi from '@hapi/joi';

const tracer = new Tracer('UserProfileStore');

interface IUserProfileQuery {
  orgId: string;
  eventIds?: string[];
  venueIds?: string[];
  artistIds?: string[];
  userIds?: string[];
  name?: string;
  email?: string;
  phoneNumber?: string;
  any?: boolean;
}

export default class UserProfileStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private UserProfile;

  constructor(UserProfile) {
    this.UserProfile = UserProfile;
  }
  public async createProfile(spanContext: string, attributes: IUserProfile): Promise<IUserProfile> {
    const span = tracer.startSpan('createProfile', spanContext);
    const profile = new this.UserProfile(attributes);

    let saveProfile: IUserProfile;
    try {
      saveProfile = await profile.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserProfileStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveProfile;
  }
  public async updateOneProfile(spanContext: string, userId: string, profile: IUserProfile): Promise<IUserProfile> {
    const span = tracer.startSpan('updateOne', spanContext);
    try {
      profile = this.UserProfile.findOneAndUpdate({ userId }, { $set: { ...profile } }, { new: true });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserProfileStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return profile;
  }
  public async findProfile(spanContext: string, userId: string): Promise<IUserProfile> {
    const span = tracer.startSpan('findProfile', spanContext);
    let profile: IUserProfile;
    try {
      profile = await this.UserProfile.findOne({ userId });
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserProfileStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return profile;
  }
  public async queryProfiles(spanContext: string, query: IUserProfileQuery, pagination: IPagination): Promise<IUserProfile[]> {
    const span = tracer.startSpan('queryUserProfiles', spanContext);
    let profiles: IUserProfile[];
    let finalQuery: any = {};

    if (query.eventIds && query.eventIds.filter(v => Boolean(v)).length) {
      finalQuery.eventIds = { $in: query.eventIds.filter(v => Boolean(v)) };
    }

    if (query.venueIds && query.venueIds.filter(v => Boolean(v)).length) {
      finalQuery.venueIds = { $in: query.venueIds.filter(v => Boolean(v)) };
    }

    if (query.artistIds && query.artistIds.filter(v => Boolean(v)).length) {
      finalQuery.artistIds = { $in: query.artistIds.filter(v => Boolean(v)) };
    }

    if (query.userIds && query.userIds.filter(v => Boolean(v)).length) {
      finalQuery.userId = { $in: query.userIds.filter(v => Boolean(v)) };
    }

    if (query.name) {
      const [firstName, lastName] = query.name.split(' ');
      if (firstName) {
        finalQuery.firstName = { $regex: firstName, $options: "xi" };
        finalQuery.lastName = { $regex: firstName, $options: "xi" };
      }
      if (lastName) finalQuery.lastName = { $regex: lastName, $options: 'xi' };
    }

    if (query.email) {
      finalQuery.email = { $regex: query.email, $options: 'xi' };
    }

    if (query.phoneNumber) {
      finalQuery.phoneNumber = { $regex: query.phoneNumber, $options: 'i' };
    }

    // $or queries in mongo must not be empty arrays
    // so we check to make sure it will be populated
    // before we do the conversation.
    // If it is not, this is a 'list all events' request
    // and we can just do a normal query, even
    // if 'query.any' is true
    if (query.any && Object.keys(finalQuery).length) {

      const or = [];
      const and: any = []; //{ orgIds: query.orgId }

      if (query && query.orgId) {
        and.push({ orgIds: query.orgId })
      }
      const andKeys = ['eventIds', 'venueIds', 'artisIds'];
      for (const [key, value] of Object.entries(finalQuery)) {
        const param = { [key]: value };
        if (andKeys.includes(key)) {
          and.push(param);
        } else {
          or.push(param);
        }
      }

      finalQuery = { $and: and };
      if (or.length) finalQuery.$or = or;

    } else {
      if (query && query.orgId) {
        finalQuery.orgIds = query.orgId;
      }
    }
    const aggregate: any = [
      {
        $match: finalQuery,
      },
    ];
    if (query && query.orgId) {
      aggregate.push(
        {
          $addFields: {
            metrics: {
              $filter: {
                input: '$metrics',
                as: 'metric',
                cond: { $eq: ['$$metric.orgId', query.orgId] },
              },
            },
          },
        })
    }
    if (pagination) {
      const { pageSize, pageNumber } = pagination;
      let skips = pageSize * (pageNumber - 1);
      skips = !skips || skips < 0 ? 0 : skips;

      const skip = {
        $skip: skips,
      };

      const limit = {
        $limit: pageSize,
      };

      const sort = {
        $sort: {
          createdAt: -1,
        },
      };

      aggregate.push(skip, limit, sort);
    }

    try {
      profiles = await this.UserProfile.aggregate(aggregate);
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserProfileStore.OPERATION_UNSUCCESSFUL());
    }

    span.finish();
    return profiles;
  }
  public async deleteUserProfile(spanContext: string, userId: string): Promise<boolean> {
    const span = tracer.startSpan('deleteUserProfile', spanContext);
    try {
      await this.UserProfile.deleteOne({ userId });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new UserProfileStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
}
