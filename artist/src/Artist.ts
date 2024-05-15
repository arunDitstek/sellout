import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IArtist from '@sellout/models/.dist/interfaces/IArtist';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import ArtistModel from '@sellout/models/.dist/schemas/Artist';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IArtistModel extends IArtist, Document {
  _id: string;
}

export const ArtistSchema = new Schema(ArtistModel);
export const Artist: Model<IArtistModel> = model<IArtistModel>('Artist', ArtistSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
