/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { User } from "../../models/signup.model.js";
import { Todo } from "../../models/todo.model.js";
import { RefreshToken } from "../../models/refresh.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens.js";

export interface TestUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface TestTodo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
}

// Create a test user
export async function createTestUser(
  userData?: Partial<TestUser>
): Promise<TestUser> {
  const defaultUser = {
    name: "Test User",
    email: "test@example.com",
    password: "TestPassword123!",
    role: "user",
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.role,
  };
}

// Create a test todo
export async function createTestTodo(
  todoData?: Partial<TestTodo>
): Promise<TestTodo> {
  const userId = new Types.ObjectId();
  const defaultTodo = {
    title: "Test Todo",
    description: "Test Description",
    completed: false,
    userId: userId.toString(),
  };

  const todo = await Todo.create({ ...defaultTodo, ...todoData });
  return {
    _id: todo._id.toString(),
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    userId: todo.userId.toString(),
  };
}

// Generate test tokens
export function generateTestTokens(user: TestUser) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
}

// Create test refresh token in database
export async function createTestRefreshToken(userId: string, token?: string) {
  const refreshToken =
    token ||
    generateRefreshToken({
      _id: userId,
      name: "Test",
      email: "test@example.com",
      role: "user",
    });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return await RefreshToken.create({
    token: refreshToken,
    userId: new Types.ObjectId(userId),
    device: {
      userAgent: "test-agent",
      ip: "127.0.0.1",
      name: "Test Device",
    },
    expiresAt,
  });
}

// Clean up test data
export async function cleanupTestData() {
  await User.deleteMany({});
  await Todo.deleteMany({});
  await RefreshToken.deleteMany({});
}

// Clear database function for compatibility
export const clearDatabase = cleanupTestData;

// Mock request object
export function createMockRequest(
  body: any = {},
  params: any = {},
  query: any = {},
  headers: any = {}
) {
  return {
    body,
    params,
    query,
    headers,
    ip: "127.0.0.1",
  } as any;
}

// Mock response object
export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
  };
  return res;
}

// Wait for async operations
export function waitFor(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
