import type { Request, Response } from "express";
import { Todo } from "../models/todo.model.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { Types } from "mongoose";

// Types
interface TodoDocument {
  _id: Types.ObjectId;
  title: string;
  description: string;
  completed: boolean;
  userId: Types.ObjectId;
  createdAt?: Date;
}

interface PaginationQuery {
  cursor?: string;
  limit?: string;
}

interface PaginationResult {
  todos: TodoDocument[];
  counts: Array<{ totalCount: number; completedCount: number }>;
}

interface ApiResponse {
  message: string;
  status: "success" | "failure";
  result?: TodoDocument[] | [];
  count?: number;
  completedCount?: number;
  pageInfo?: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

// Helper functions
function handleError(err: unknown, res: Response, operation: string): Response {
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

  console.error(`${operation} error:`, err);
  return res.status(500).json({ error: "Internal server error" });
}

function sendSuccessResponse(
  res: Response,
  message: string,
  data: Partial<ApiResponse> = {},
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    message,
    status: "success",
    ...data,
  });
}

function sendNotFoundResponse(res: Response, message: string): Response {
  return res.status(404).json({
    message,
    status: "failure",
  });
}

function validateAndParseLimit(limitParam?: string): number {
  const parsed = Number(limitParam ?? 10);
  return Math.max(1, Math.min(100, parsed));
}

function buildPaginationMatch(
  userId: string,
  cursor?: string
): Record<string, unknown> {
  const baseMatch = { userId: new Types.ObjectId(userId) };

  if (cursor && Types.ObjectId.isValid(cursor)) {
    return { ...baseMatch, _id: { $lt: new Types.ObjectId(cursor) } };
  }

  return baseMatch;
}

function extractNextCursor(
  todos: TodoDocument[],
  limit: number
): string | null {
  if (todos.length <= limit) return null;

  const lastTodo = todos[limit - 1];
  return lastTodo._id.toString();
}

// Main handlers
export async function createTodoHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  try {
    const { title, description, completed = false } = req.body;
    const todo = await Todo.create({
      title,
      description,
      userId: req.userId,
      completed,
    });

    return sendSuccessResponse(
      res,
      "Todo created successfully",
      { result: [todo.toObject()] },
      201
    );
  } catch (err: unknown) {
    return handleError(err, res, "Create todo");
  }
}

export async function getTodoHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const todos = await Todo.find();
    if (!todos || todos.length === 0) {
      return sendNotFoundResponse(res, "No todos found");
    }

    return sendSuccessResponse(res, "Todos fetched successfully", {
      result: todos,
    });
  } catch (err: unknown) {
    return handleError(err, res, "Get todos");
  }
}

export async function getTodoByUserIdHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  try {
    const { cursor, limit: limitParam } = req.query as PaginationQuery;
    const limit = validateAndParseLimit(limitParam);
    const paginationMatch = buildPaginationMatch(req.userId as string, cursor);

    const result = await Todo.aggregate([
      {
        $facet: {
          todos: [
            { $match: paginationMatch },
            { $sort: { _id: -1 } },
            { $limit: limit + 1 },
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
          counts: [
            { $match: { userId: new Types.ObjectId(req.userId) } },
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
                completedCount: {
                  $sum: { $cond: ["$completed", 1, 0] },
                },
              },
            },
            { $project: { _id: 0, totalCount: 1, completedCount: 1 } },
          ],
        },
      },
    ]);

    const first = (result as PaginationResult[])?.[0] ?? {
      todos: [],
      counts: [],
    };
    let todos = first.todos ?? [];
    const countsDoc = first.counts?.[0] ?? { totalCount: 0, completedCount: 0 };

    const nextCursor = extractNextCursor(todos, limit);
    if (nextCursor) {
      todos = todos.slice(0, limit);
    }

    return sendSuccessResponse(res, "Todos fetched successfully", {
      result: todos,
      count: countsDoc.totalCount,
      completedCount: countsDoc.completedCount,
      pageInfo: {
        nextCursor,
        hasNextPage: !!nextCursor,
      },
    });
  } catch (err: unknown) {
    return handleError(err, res, "Get todos by user");
  }
}

export async function deleteTodoHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const todoId = req.params.id;
    const todo = await Todo.findByIdAndDelete(todoId);

    if (!todo) {
      return sendNotFoundResponse(res, "Todo not found");
    }

    return sendSuccessResponse(res, "Todo deleted successfully");
  } catch (err: unknown) {
    return handleError(err, res, "Delete todo");
  }
}

export async function updateTodoHandler(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const todoId = req.params.id;
    const todo = await Todo.findByIdAndUpdate(todoId, req.body, { new: true });

    if (!todo) {
      return sendNotFoundResponse(res, "Todo not found");
    }

    return sendSuccessResponse(res, "Todo updated successfully");
  } catch (err: unknown) {
    return handleError(err, res, "Update todo");
  }
}
