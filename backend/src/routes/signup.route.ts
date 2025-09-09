import { Router } from "express";
import { SignupHandler } from "../controllers/signup.controller.ts";

const router = Router();

router.post("/", SignupHandler);

export default router;
