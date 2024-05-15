import mongoose from 'mongoose';
import { Document, Schema, Model, model } from 'mongoose';
import ITask from '@sellout/models/.dist/interfaces/ITask';
import MongoConnectionManager from "@sellout/service/.dist/MongoConnectionManager";
import shortid from 'shortid';
import {
  MONGO_CONNECTION_STRING,
  MONGO_USERNAME,
  MONGO_PASSWORD,
} from './env';

export interface ITaskModel extends ITask, Document {
  _id: string;
}

export const TaskSchema  = new Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  taskType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
  executeAt: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Number,
    required: false,
    default: null,
  },
  endedAt: {
    type: Number,
    required: false,
    default: null,
  },
  success: {
    type: Boolean,
    required: false,
    default: null,
  },
  canceledAt: {
    type: Number,
    required: false,
    default: null,
  },
  userId: {
    type: String,
    required: false,
    default: null,
  },
  orgId: {
    type: String,
    required: false,
    default: null,
  },
  eventId: {
    type: String,
    required: false,
    default: null,
  },
  orderId: {
    type: String,
    required: false,
    default: null,
  },
  venueIds: [{
    type: String,
    required: false,
    default: [],
  }],
  artistIds: [{
    type: String,
    required: false,
    default: [],
  }],
  subscription:{
    _id:{
      type: String,
      required: false,
      default: null,
    },
    email: {
      type: String,
      required: false,
      default: null,
    },
    frequency: {
      type : String,
      required: false,
      default: null,
    }
  }, email: {
    type: String,
    required: false,
    default: null,
  },

});

export const Task: Model<ITaskModel> = model<ITaskModel>('Task', TaskSchema);

new MongoConnectionManager(mongoose, MONGO_CONNECTION_STRING, MONGO_USERNAME, MONGO_PASSWORD).connect();
