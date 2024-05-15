import mongoose, { Document, Schema, Model, model} from 'mongoose';
import IEvent from '@sellout/models/.dist/interfaces/IEvent';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import EventModel from '@sellout/models/.dist/schemas/Event';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IEventModel extends IEvent, Document {
  _id: string;
}

export const EventSchema = new Schema(EventModel);
export const Event: Model<IEventModel> = model<IEventModel>('Event', EventSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
