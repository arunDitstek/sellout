import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IRole from '@sellout/models/.dist/interfaces/IRole';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import RoleModel from '@sellout/models/.dist/schemas/Role';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IRoleModel extends IRole, Document {
  _id: string;
}

export const RoleSchema = new Schema(RoleModel);
export const Role: Model<IRoleModel> = model<IRoleModel>('Role', RoleSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
