import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IUserProfile from '@sellout/models/.dist/interfaces/IUserProfile';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import UserProfileModel from '@sellout/models/.dist/schemas/UserProfile';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IUserProfileModel extends IUserProfile, Document {
  _id: string;
}

export const UserProfileSchema = new Schema(UserProfileModel);
export const UserProfile: Model<IUserProfileModel> = model<IUserProfileModel>('UserProfile', UserProfileSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
