import IRole from '@sellout/models/.dist/interfaces/IRole';
import * as pb from '@sellout/models/.dist/sellout-proto';
import Tracer from '@sellout/service/.dist/Tracer';
import joiToErrors from '@sellout/service/.dist/joiToErrors';
import IPagination from '@sellout/models/.dist/interfaces/IPagination';
import Joi from '@hapi/joi';
// import { UpdateWriteOpResult } from 'mongodb';

const tracer = new Tracer('RoleStore');

export default class RoleStore {

  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  private Role;

  constructor(Role) {
    this.Role = Role;
  }
  public async createRole(spanContext: string, role: IRole): Promise<IRole> {
    const span = tracer.startSpan('createRole', spanContext);

    const schema = Joi.object().keys({
      orgId: Joi.string().required(),
      userId: Joi.any().allow(null).optional(),
      userEmail: Joi.string().required(),
      role: Joi.string().required(),
      createdAt: Joi.number().required(),
      createdBy: Joi.string().required(),
      acceptedAt: Joi.any().optional(),
    });

    const params = schema.validate(role);

    if (params.error) {
      params.error = joiToErrors(params.error, pb.Error);
      span.setTag('error', true);
      span.log({ errors: params.error });
      span.finish();
      return Promise.reject(params.error);
    }

    const newRole = new this.Role(role);

    let saveRole: IRole;
    try {
      saveRole = await newRole.save();
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return saveRole;
  }
  public async deleteRole(spanContext: string, roleId: string): Promise<Boolean> {
    const span = tracer.startSpan('createRole', spanContext);

    try {
      const response = await this.Role.remove({ _id: roleId });
      console.log(response);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async queryRoles(spanContext: string, query: object, pagination: IPagination): Promise<IRole[]> {
    const span = tracer.startSpan('queryRoles', spanContext);
    let roles: IRole[];
    try {
      if (pagination) {
        const { pageSize, pageNumber } = pagination;
        let skips = pageSize * (pageNumber - 1);
        skips = skips < 0 ? 0 : skips;
        roles = await this.Role.find(query)
          .skip(skips)
          .limit(pageSize);
      } else {
        roles = await this.Role.find(query);
      }
    } catch (e) {
      console.error(e);
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return roles;
  }
  public async assignUserIdToRoles(spanContext: string, userId: string, userEmail: string): Promise<Boolean> {
    const span = tracer.startSpan('assignUserIdToRoles', spanContext);
    try {

      const userDetail = await this.Role.find({ userId }).lean();
      
      if (userDetail.length != 0) {
        await this.Role.updateMany({ userId }, { $set: { userEmail } }, { new: true });
      } else {
        await this.Role.updateMany({ userEmail }, { $set: { userId } }, { new: true });
      }

    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async UpdateRoleEmail(spanContext: string, userId: string, userEmail: string): Promise<Boolean> {
    const span = tracer.startSpan('updateRoleEmail', spanContext);
    try {
      await this.Role.updateMany({ userId }, { $set: { userEmail } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return true;
  }
  public async findRoleById(spanContext: string, roleId: string): Promise<IRole> {
    const span = tracer.startSpan('findRoleById', spanContext);
    let role: IRole;
    try {
      role = await this.Role.findById(roleId);
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return role;
  }
  public async findUserRoles(spanContext: string, userEmail: string): Promise<IRole> {
    const span = tracer.startSpan('findRoleById', spanContext);
    let roles: IRole;
    try {
      roles = await this.Role.find({ userEmail });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return roles;
  }
  public async findUserRole(spanContext: string, userId: string, orgId: string): Promise<IRole> {
    const span = tracer.startSpan('findRoleById', spanContext);
    let role: IRole;
    try {
      role = await this.Role.findOne({ userId, orgId });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return role;
  }
  public async updateOneRole(spanContext: string, roleId: string, role: IRole): Promise<IRole> {
    const span = tracer.startSpan('updateOneRole', spanContext);
    try {
      role = this.Role.findOneAndUpdate({ _id: roleId }, { $set: { ...role } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return role;
  }
  public async updateUserRole(spanContext: string, userEmail: string, orgId: string, role: IRole): Promise<IRole> {
    const span = tracer.startSpan('updateUserRole', spanContext);
    try {
      role = this.Role.findOneAndUpdate({ userEmail, orgId }, { $set: { ...role } }, { new: true });
    } catch (e) {
      span.setTag('error', true);
      span.log({ errors: e.message });
      span.finish();
      return Promise.reject(new RoleStore.OPERATION_UNSUCCESSFUL());
    }
    span.finish();
    return role;
  }

}
