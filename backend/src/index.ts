import dotenv from "dotenv";
dotenv.config();
import signupHandler from "./routes/signup.route.ts";

import express from "express";
import { connectToMongo } from "./db/mongoose.ts";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/signup", signupHandler);

console.log("Mongo URI:", MONGO_URI);

const startServer = async () => {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
