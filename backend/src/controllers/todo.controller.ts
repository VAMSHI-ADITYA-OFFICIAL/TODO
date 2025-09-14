import type { Request, Response } from "express";
import { Todo } from "../models/todo.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";

export async function createTodoHandler(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { title, description, completed = false } = req.body;
    const todo = await Todo.create({
      title,
      description,
      userId: req.userId,
      completed,
    });
    return res.status(201).json({
      message: "Todo created successfully",
      result: [todo.toObject()],
      status: "success",
    });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "ValidationError" &&
      "errors" in err
    ) {
      const errors: Record<string, string> = {};
      const validationErr = err as {
        errors: Record<string, { message: string }>;
      };
      for (const field in validationErr.errors) {
        errors[field] = validationErr.errors[field].message;
      }
      return res.status(400).json({ errors });
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return res.status(400).json({ error: "Todo already exists" });
    }

    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export async function getTodoHandler(req: Request, res: Response) {
  const todos = await Todo.find();
  if (!todos) {
    return res.status(404).json({
      message: "Todo not found",
      status: "failure",
    });
  }
  return res.status(200).json({
    message: "Todo fetched successfully",
    result: [todos],
    status: "success",
  });
}
export async function getTodoByUserIdHandler(
  req: AuthenticatedRequest,
  res: Response
) {
  const userId = req.userId;
  const todos = await Todo.find({ userId })
    .sort({ createdAt: -1 })
    .populate("userId", "name _id")
    .exec();

  if (!todos) {
    return res.status(404).json({
      message: "Todo not found",
      status: "failure",
    });
  }
  return res.status(200).json({
    message: "Todo fetched successfully",
    result: todos,
    status: "success",
  });
}
