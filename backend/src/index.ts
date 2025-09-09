import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

import express from "express";
import { connectToMongo } from "./db/mongoose.ts";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log("Mongo URI:", MONGO_URI); // just to check

const startServer = async () => {
  await connectToMongo(); // uses MONGO_URI inside mongoose.ts
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
