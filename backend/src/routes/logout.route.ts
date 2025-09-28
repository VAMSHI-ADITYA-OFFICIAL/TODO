import { Router } from "express";
import { logoutHandler } from "../controllers/login.controller.js";

const router = Router();

router.delete("/", logoutHandler);

export default router;
