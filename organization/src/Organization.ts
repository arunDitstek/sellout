import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IOrganization from '@sellout/models/.dist/interfaces/IOrganization';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import OrganizationModel from '@sellout/models/.dist/schemas/Organization';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IOrganizationModel extends IOrganization, Document {
  _id: string;
}

export const OrganizationSchema = new Schema(OrganizationModel);
export const Organization: Model<IOrganizationModel> = model<IOrganizationModel>('Organization', OrganizationSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
