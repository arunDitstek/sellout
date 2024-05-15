import mongoose, {Document, Model, model, Schema } from 'mongoose';
import IWebFlow from '@sellout/models/.dist/interfaces/IWebFlow';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import WebFlowModel from '@sellout/models/.dist/schemas/WebFlow';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IWebFlowModel extends IWebFlow, Document {
  _id: string;
}

export const WebFlowSchema = new Schema(WebFlowModel);
export const WebFlow: Model<IWebFlowModel> = model<IWebFlowModel>('WebFlow', WebFlowSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
