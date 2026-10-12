import mongoose from 'mongoose';
import { env } from '../config/env.js';

export const connectDB = async (): Promise<void> => {
  try {

    mongoose.set('strictQuery', true);

    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); 
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log(' MongoDB connection closed cleanly');
  } catch (error) {
    console.error(' Error during MongoDB disconnection:', error);
  }
};