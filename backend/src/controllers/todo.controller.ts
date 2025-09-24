import type { Request, Response } from "express";
import { Todo } from "../models/todo.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { Types } from "mongoose";

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
  const { cursor, limit = 10 } = req.query;

  const matchStage: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  };
  if (cursor) {
    matchStage._id = { $lt: cursor };
  }
  const result = await Todo.aggregate([
    {
      $match: { userId: new Types.ObjectId(userId) }, // cast string to ObjectId
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        todos: [
          { $limit: Number(limit) },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        ],
        totalCount: [{ $count: "count" }],
        completedCount: [{ $match: { completed: true } }, { $count: "count" }],
      },
    },
  ]);

  const todos = result[0].todos;
  const totalCount = result[0].totalCount[0]?.count || 0;
  const completedCount = result[0].completedCount[0]?.count || 0;

  const nextCursor = todos.length > 0 ? todos[todos.length - 1]._id : null;

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
    count: totalCount,
    completedCount: completedCount,
    pageInfo: {
      nextCursor, // send explicitly
      hasNextPage: !!nextCursor,
    },
  });
}

export async function deleteTodoHandler(req: Request, res: Response) {
  const todoId = req.params.id;
  const todo = await Todo.findByIdAndDelete(todoId);
  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
      status: "failure",
    });
  }
  return res.status(200).json({
    message: "Todo deleted successfully",
    status: "success",
  });
}

export async function updateTodoHandler(req: Request, res: Response) {
  const todoId = req.params.id;
  const todo = await Todo.findByIdAndUpdate(todoId, req.body, { new: true });
  if (!todo) {
    return res.status(404).json({
      message: "Todo not found",
      status: "failure",
    });
  }
  return res.status(200).json({
    message: "Todo updated successfully",
    status: "success",
  });
}
