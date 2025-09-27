import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectToMongo } from "./db/mongoose.js";
import loginRouter from "./routes/login.route.js";
import signupRouter from "./routes/signup.route.js";
import todoRouter from "./routes/todo.route.js";
import cors from "cors";
import { AuthHandler } from "./middlewares/auth.js";
import refreshRouter from "./routes/refresh.route.js";
import cookieParser from "cookie-parser";

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.0.122:3000",
  "https://todo-beta-one-74.vercel.app/",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Origin received:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/refresh", refreshRouter);
app.use("/todos", AuthHandler, todoRouter);

console.error("Mongo URI:", MONGO_URI);

const startServer = async () => {
  await connectToMongo();
  app.listen(PORT, () => {
    console.error(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
