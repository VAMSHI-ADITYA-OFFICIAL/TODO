import { Router } from "express";
import {
  createTodoHandler,
  getTodoByUserIdHandler,
  // getTodoHandler,
} from "../controllers/todo.controller.js";

const router = Router();

router.route("/").post(createTodoHandler).get(getTodoByUserIdHandler);

export default router;
