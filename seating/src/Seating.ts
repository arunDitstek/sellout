import mongoose, { Document, Model, model, Schema } from 'mongoose';
import ISeating from '@sellout/models/.dist/interfaces/ISeating';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import SeatingModel from '@sellout/models/.dist/schemas/Seating';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface ISeatingModel extends ISeating, Document {
  _id: string;
}

export const SeatingSchema = new Schema(SeatingModel);
export const Seating: Model<ISeatingModel> = model<ISeatingModel>('Seating', SeatingSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
