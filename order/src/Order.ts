import mongoose, { Document, Model, model, Schema} from 'mongoose';
import IOrder from '@sellout/models/.dist/interfaces/IOrder';
import MongoConnectionManager from '@sellout/service/.dist/MongoConnectionManager';
import OrderModel from '@sellout/models/.dist/schemas/Order';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface IOrderModel extends IOrder, Document {
  _id: string;
}

export const OrderSchema = new Schema(OrderModel);
export const Order: Model<IOrderModel> = model<IOrderModel>('Order', OrderSchema);
new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
