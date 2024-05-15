import mongoose from 'mongoose';
import { Document, Schema, Model, model } from 'mongoose';
import IVenue from '@sellout/models/.dist/interfaces/IVenue';
import MongoConnectionManager from "@sellout/service/.dist/MongoConnectionManager";
import VenueModel from '@sellout/models/.dist/schemas/Venue';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IVenueModel extends IVenue, Document {
  _id: string;
}

export const VenueSchema = new Schema(VenueModel);
export const Venue: Model<IVenueModel> = model<IVenueModel>('Venue', VenueSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
