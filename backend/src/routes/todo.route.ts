import { Router } from "express";
import {
  createTodoHandler,
  deleteTodoHandler,
  getTodoByUserIdHandler,
  updateTodoHandler,
  // getTodoHandler,
} from "../controllers/todo.controller.js";

const router = Router();

router.route("/").post(createTodoHandler).get(getTodoByUserIdHandler);

router
  .route("/:id")
  .delete(deleteTodoHandler)
  .patch(updateTodoHandler)
  .put(updateTodoHandler);

export default router;
