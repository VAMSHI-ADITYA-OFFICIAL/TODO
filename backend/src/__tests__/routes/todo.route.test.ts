import request from "supertest";
import express from "express";
import todoRouter from "../../routes/todo.route.js";
import { AuthHandler } from "../../middlewares/auth.js";
import { User } from "../../models/signup.model.js";
import { Todo } from "../../models/todo.model.js";
import {
  clearDatabase,
  createTestUser,
  generateTestTokens,
} from "../utils/testHelpers.js";
import { Types } from "mongoose";

const app = express();
app.use(express.json());
app.use("/todos", AuthHandler, todoRouter);

describe("Todo Route", () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    await clearDatabase();
    testUser = await createTestUser();
    const { accessToken } = generateTestTokens(testUser);
    authToken = accessToken;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe("POST /todos", () => {
    it("should create a new todo", async () => {
      const res = await request(app)
        .post("/todos")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Todo",
          description: "Test Description",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        message: "Todo created successfully",
        status: "success",
        result: expect.arrayContaining([
          expect.objectContaining({
            title: "Test Todo",
            description: "Test Description",
            completed: false,
          }),
        ]),
      });
    });

    it("should return 401 without authorization", async () => {
      const res = await request(app).post("/todos").send({
        title: "Test Todo",
        description: "Test Description",
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: "Unauthorized",
      });
    });

    it("should return 400 for missing title", async () => {
      const res = await request(app)
        .post("/todos")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          description: "Test Description",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.title).toContain("required");
    });
  });

  describe("GET /todos", () => {
    it("should get todos for authenticated user", async () => {
      // Create some test todos
      await Todo.create([
        {
          title: "Todo 1",
          description: "Description 1",
          completed: false,
          userId: testUser._id,
        },
        {
          title: "Todo 2",
          description: "Description 2",
          completed: true,
          userId: testUser._id,
        },
      ]);

      const res = await request(app)
        .get("/todos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.any(Array),
        count: 2,
        completedCount: 1,
        pageInfo: expect.any(Object),
      });
    });

    it("should return empty array for user with no todos", async () => {
      const res = await request(app)
        .get("/todos")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Todos fetched successfully",
        status: "success",
        result: [],
        count: 0,
        completedCount: 0,
        pageInfo: expect.objectContaining({
          hasNextPage: false,
          nextCursor: null,
        }),
      });
    });
  });

  describe("PATCH /todos/:id", () => {
    it("should update todo", async () => {
      const todo = await Todo.create({
        title: "Original Title",
        description: "Original Description",
        completed: false,
        userId: testUser._id,
      });

      const res = await request(app)
        .patch(`/todos/${todo._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
          description: "Updated Description",
          completed: true,
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        message: "Todo updated successfully",
        status: "success",
      });
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await request(app)
        .patch(`/todos/${new Types.ObjectId()}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Updated Title",
        });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        message: "Todo not found",
        status: "failure",
      });
    });
  });

  describe("DELETE /todos/:id", () => {
    it("should delete todo", async () => {
      const todo = await Todo.create({
        title: "Todo to Delete",
        description: "Description",
        completed: false,
        userId: testUser._id,
      });

      const res = await request(app)
        .delete(`/todos/${todo._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Todo deleted successfully",
        status: "success",
      });

      // Verify todo was deleted
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await request(app)
        .delete(`/todos/${new Types.ObjectId()}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        message: "Todo not found",
        status: "failure",
      });
    });
  });
});
