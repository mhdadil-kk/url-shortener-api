import { Schema, model, Document, Types } from 'mongoose';

export interface IUrl {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUrlDocument extends IUrl, Document {
  _id: Types.ObjectId;
}

const urlSchema = new Schema<IUrlDocument>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'URL must belong to a user'],
      index: true, 
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const Url = model<IUrlDocument>('Url', urlSchema);