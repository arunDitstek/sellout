import IOrganization from '@sellout/models/.dist/interfaces/IOrganization';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer  from '@sellout/service/.dist/Tracer';
import joiToErrors  from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Joi from '@hapi/joi';
// import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('OrganizationStore');

interface IOrganizationQuery {
  name?: string;
  orgIds?: string[];
  startDate?: number;
  endDate?: number;
  any?: boolean;
  orgQuery?:string
}

export default class OrganizationStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Organization;

  constructor(Organization) {
    this.Organization = Organization;
  }

  public async createOrganization(spanContext: string, attributes: IOrganization): Promise<IOrganization> {
    const span = tracer.startSpan('createOrganization', spanContext);

    const schema = Joi.object().keys({
      userId: Joi.string().required(),
      createdAt: Joi.number().required(),
      email: Joi.string().optional(),
      phoneNumber: Joi.string().optional(),
    });

    const params = schema.validate(attributes);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const organization = new this.Organization(attributes);

    let saveOrganization: IOrganization;
    try {
      saveOrganization = await organization.save();
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveOrganization;
  }

  public async listOrganizationUrls(spanContext: string): Promise<IOrganization[]> {
    const span = tracer.startSpan('listOrganizationUrls', spanContext);
    let organizations: IOrganization[];
    try {
      organizations = await this.Organization.find().lean();
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return organizations;
  }

  public async queryOrganizations(spanContext: string, query: IOrganizationQuery, pagination: IPagination): Promise<IOrganization[]> {
    const span = tracer.startSpan('queryOrganizations', spanContext);
    let events: IOrganization[];
    let finalQuery: any = {};

    // if (query.name) {
    //   finalQuery.name = { $regex: query.name, $options: 'xi' };
    // }
    // if (query.orgIds) {
    //   finalQuery.orgIds = { $regex: query.orgIds, $options: 'xi' };
    // }
    // if(query.name){
    //   finalQuery.orgName = { $regex: query.name, $options: 'i' };
    // }
    if (query.orgIds && query.orgIds.filter(v => Boolean(v)).length) {
      finalQuery._id = { $in: query.orgIds.filter(v => Boolean(v)) };
    }

    if (query.orgQuery) {
      finalQuery._id = { $regex: query.orgQuery, $options: "xi" };
      finalQuery.orgName = { $regex: query.orgQuery, $options: 'i' };
      finalQuery.email ={ $regex: query.orgQuery, $options: 'i'}
    }

    if (query.startDate && query.endDate) {
      finalQuery.createdAt = {
        $gte: query.startDate,
        $lte: query.endDate,
      };
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
      finalQuery = { $or: or }
      if (query.orgIds) {
        finalQuery['$and'] = [{ orgId: query.orgIds }];
      }
    } else if (query.orgIds) {
      finalQuery.orgId = query.orgIds;
    }

    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        events = await this.Organization.find(finalQuery)
          .skip(skips)
          .limit(pageSize)
          .sort({ createdAt: -1 });
      } else {
        events = await this.Organization.find(finalQuery).sort({ createdAt: -1 });
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return events;
  }

  public async findOrganization(spanContext: string, orgId: string): Promise<IOrganization> {
    const span = tracer.startSpan('findOrganization', spanContext);
    let organization: IOrganization;
    try {
      organization = await this.Organization.findById(orgId).lean();
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return organization;
  }

  public async updateOneOrganization(spanContext: string, orgId: string, organization: IOrganization): Promise<IOrganization> {
    const span = tracer.startSpan('updateOne', spanContext);

    try {
      organization = this.Organization.findOneAndUpdate({ _id: orgId }, { $set: { ...organization } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message  });
      span.finish();
      return Promise.reject(new OrganizationStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return organization;
  }
}
