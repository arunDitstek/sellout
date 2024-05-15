import mongoose, { Document, Model, model, Schema } from 'mongoose';
import IUser from '@sellout/models/.dist/interfaces/IUser';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import UserModel from '@sellout/models/.dist/schemas/User';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';
export interface IUserModel extends IUser, Document {
  _id: string;
}

export const UserSchema = new Schema(UserModel);
export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
