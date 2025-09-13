import { Router } from "express";
import { SignupHandler } from "../controllers/signup.controller.js";

const router = Router();

router.post("/", SignupHandler);

export default router;
