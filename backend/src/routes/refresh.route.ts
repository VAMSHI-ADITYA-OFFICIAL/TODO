import { Router } from "express";
import { refreshTokenHandler } from "../controllers/login.controller.js";

const router = Router();

router.post("/", refreshTokenHandler);

export default router;
