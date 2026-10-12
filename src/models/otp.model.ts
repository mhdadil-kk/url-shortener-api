import { Schema, model, Document } from 'mongoose';

export interface IOtpDocument extends Document {
  email: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  lastResentAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastResentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

export const Otp = model<IOtpDocument>('Otp', otpSchema);