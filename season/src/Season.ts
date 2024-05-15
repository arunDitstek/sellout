import mongoose, { Document, Model, model, Schema} from 'mongoose';
import ISeason from '@sellout/models/.dist/interfaces/ISeason';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import SeasonModel from '@sellout/models/.dist/schemas/Season';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface ISeasonModel extends ISeason, Document {
  _id: string;
}

export const SeasonSchema = new Schema(SeasonModel);
export const Season: Model<ISeasonModel> = model<ISeasonModel>('Season', SeasonSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
