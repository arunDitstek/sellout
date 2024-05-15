import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IFee from '@sellout/models/.dist/interfaces/IFee';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import FeeModel from '@sellout/models/.dist/schemas/Fee';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IFeeModel extends IFee, Document {
  _id: string;
}

export const FeeSchema = new Schema(FeeModel);
export const Fee: Model<IFeeModel> = model<IFeeModel>('Fee', FeeSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
