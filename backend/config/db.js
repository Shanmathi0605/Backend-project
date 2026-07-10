import mongoose from 'mongoose';

export const connectDB = async () => {
  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      console.log('Retrying to connect in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };
  connectWithRetry();
};
export default connectDB;
