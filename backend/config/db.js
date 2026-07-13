import mongoose from 'mongoose';

export const connectDB = async () => {
  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      console.log('Retrying to connect in 5 seconds...');
      await new Promise(res => setTimeout(res, 5000));
      return connectWithRetry();
    }
  };
  return await connectWithRetry();
};
export default connectDB;
