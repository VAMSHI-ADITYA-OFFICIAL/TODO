import mongoose from "mongoose";

export const connectToMongo = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}, DB: ${conn.connection.name}`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", (error as Error).message);
    process.exit(1);
  }
};
