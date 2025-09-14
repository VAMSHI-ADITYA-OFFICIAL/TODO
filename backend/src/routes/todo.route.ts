import { Router } from "express";
import { createTodoHandler } from "../controllers/todo.controller.js";

const router = Router();

router.post("/", createTodoHandler);

export default router;
