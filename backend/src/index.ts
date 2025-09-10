import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectToMongo } from "./db/mongoose.ts";
import loginRouter from "./routes/login.route.ts";
import signupRouter from "./routes/signup.route.ts";

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
