import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectToMongo } from "./db/mongoose.js";
import loginRouter from "./routes/login.route.js";
import signupRouter from "./routes/signup.route.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/signup", signupRouter);
app.use("/login", loginRouter);

console.error("Mongo URI:", MONGO_URI);

const startServer = async () => {
  await connectToMongo();
  app.listen(PORT, () => {
    console.error(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
