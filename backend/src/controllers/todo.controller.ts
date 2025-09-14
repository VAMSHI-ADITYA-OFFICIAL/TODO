import type { Request, Response } from "express";
import { Todo } from "../models/todo.model.js";

export async function createTodoHandler(req: Request, res: Response) {
  try {
    const { title, description, userId, completed = false } = req.body;
    const todo = await Todo.create({ title, description, userId, completed });

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
