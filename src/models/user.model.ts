import { Schema, model, Document, Types } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const User = model<IUserDocument>('User', userSchema);