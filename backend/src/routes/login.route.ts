import { Router } from "express";
import {
  loginHandler,
  updateUserHandler,
} from "../controllers/login.controller.js";

const router = Router();

router.post("/", loginHandler).put("/:_id", updateUserHandler);

export default router;
