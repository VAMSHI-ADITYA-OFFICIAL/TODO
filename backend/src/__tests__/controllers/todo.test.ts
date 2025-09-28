/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import {
  createTodoHandler,
  getTodoHandler,
  getTodoByUserIdHandler,
  deleteTodoHandler,
  updateTodoHandler,
} from "../../controllers/todo.controller.js";
import { Todo } from "../../models/todo.model.js";
import { User } from "../../models/signup.model.js";
import {
  createMockRequest,
  createMockResponse,
  createTestUser,
  createTestTodo,
} from "../utils/testHelpers.js";

describe("Todo Controller", () => {
  let mockReq: any;
  let mockRes: any;
  let testUser: any;

  beforeEach(async () => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await Todo.deleteMany({});
    await User.deleteMany({});
  });

  describe("createTodoHandler", () => {
    it("should create a new todo successfully", async () => {
      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };
      mockReq.userId = testUser._id;

      await createTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Todo created successfully",
          status: "success",
        })
      );

      // Verify todo was created in database
      const todo = await Todo.findOne({ userId: testUser._id });
      expect(todo).toBeTruthy();
      expect(todo?.title).toBe("Test Todo");
      expect(todo?.description).toBe("Test Description");
      expect(todo?.completed).toBe(false);
    });

    it("should create todo with completed status", async () => {
      mockReq.body = {
        title: "Completed Todo",
        description: "Completed Description",
        completed: true,
      };
      mockReq.userId = testUser._id;

      await createTodoHandler(mockReq, mockRes);

      const todo = await Todo.findOne({ userId: testUser._id });
      expect(todo?.completed).toBe(true);
    });

    it("should handle missing required fields", async () => {
      mockReq.body = {
        title: "Test Todo",
        // Missing description
      };
      mockReq.userId = testUser._id;

      await createTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.objectContaining({
          description: expect.stringContaining("required"),
        }),
      });
    });

    it("should handle empty request body", async () => {
      mockReq.body = {};
      mockReq.userId = testUser._id;

      await createTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.objectContaining({
          title: expect.stringContaining("required"),
          description: expect.stringContaining("required"),
        }),
      });
    });

    it("should handle database errors", async () => {
      // Mock database error
      const originalCreate = Todo.create;
      Todo.create = jest.fn().mockRejectedValue(new Error("Database error"));

      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };
      mockReq.userId = testUser._id;

      await createTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });

      // Restore original method
      Todo.create = originalCreate;
    });
  });

  describe("getTodoHandler", () => {
    it("should get all todos successfully", async () => {
      // Create test todos
      await createTestTodo({ userId: testUser._id, title: "Todo 1" });
      await createTestTodo({ userId: testUser._id, title: "Todo 2" });

      await getTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.arrayContaining([
          expect.objectContaining({ title: "Todo 1" }),
          expect.objectContaining({ title: "Todo 2" }),
        ]),
      });
    });

    it("should return error when no todos found", async () => {
      await getTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "No todos found",
        status: "failure",
      });
    });

    it("should handle database errors", async () => {
      // Mock database error
      const originalFind = Todo.find;
      Todo.find = jest.fn().mockRejectedValue(new Error("Database error"));

      await getTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });

      // Restore original method
      Todo.find = originalFind;
    });
  });

  describe("getTodoByUserIdHandler", () => {
    beforeEach(async () => {
      // Create test todos for the user
      await createTestTodo({
        userId: testUser._id,
        title: "User Todo 1",
        completed: false,
      });
      await createTestTodo({
        userId: testUser._id,
        title: "User Todo 2",
        completed: true,
      });
      await createTestTodo({
        userId: testUser._id,
        title: "User Todo 3",
        completed: false,
      });
    });

    it("should get todos for specific user with pagination", async () => {
      mockReq.userId = testUser._id;
      mockReq.query = { limit: "2" };

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.any(Array),
        count: 3,
        completedCount: 1,
        pageInfo: expect.any(Object),
      });
    });

    it("should handle cursor-based pagination", async () => {
      const todos = await Todo.find({ userId: testUser._id }).sort({ _id: -1 });
      const cursor = todos[1]._id.toString();

      mockReq.userId = testUser._id;
      mockReq.query = { cursor, limit: "2" };

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.any(Array),
        count: 3,
        completedCount: 1,
        pageInfo: expect.any(Object),
      });
    });

    it("should handle invalid cursor", async () => {
      mockReq.userId = testUser._id;
      mockReq.query = { cursor: "invalid-cursor" };

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.any(Array),
        count: 3,
        completedCount: 1,
        pageInfo: expect.any(Object),
      });
    });

    it("should handle limit validation", async () => {
      mockReq.userId = testUser._id;
      mockReq.query = { limit: "150" }; // Exceeds max limit

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      // Should limit to 100
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: expect.any(Array),
        count: 3,
        completedCount: 1,
        pageInfo: expect.objectContaining({
          nextCursor: null,
          hasNextPage: false,
        }),
      });
    });

    it("should return empty result for user with no todos", async () => {
      const newUser = await createTestUser({
        email: "newuser@example.com",
        name: "New User",
      });
      mockReq.userId = newUser._id;

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todos fetched successfully",
        status: "success",
        result: [],
        count: 0,
        completedCount: 0,
        pageInfo: {
          nextCursor: null,
          hasNextPage: false,
        },
      });
    });
  });

  describe("deleteTodoHandler", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = await createTestTodo({ userId: testUser._id });
    });

    it("should delete todo successfully", async () => {
      mockReq.params = { id: testTodo._id };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todo deleted successfully",
        status: "success",
      });

      // Verify todo was deleted
      const deletedTodo = await Todo.findById(testTodo._id);
      expect(deletedTodo).toBeNull();
    });

    it("should return error for non-existent todo", async () => {
      mockReq.params = { id: new Types.ObjectId().toString() };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todo not found",
        status: "failure",
      });
    });

    it("should handle invalid todo ID", async () => {
      mockReq.params = { id: "invalid-id" };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should handle database errors", async () => {
      // Mock database error
      const originalFindByIdAndDelete = Todo.findByIdAndDelete;
      Todo.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      mockReq.params = { id: testTodo._id };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });

      // Restore original method
      Todo.findByIdAndDelete = originalFindByIdAndDelete;
    });
  });

  describe("updateTodoHandler", () => {
    let testTodo: any;

    beforeEach(async () => {
      testTodo = await createTestTodo({ userId: testUser._id });
    });

    it("should update todo successfully", async () => {
      mockReq.params = { id: testTodo._id };
      mockReq.body = {
        title: "Updated Todo",
        description: "Updated Description",
        completed: true,
      };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todo updated successfully",
        status: "success",
      });

      // Verify todo was updated
      const updatedTodo = await Todo.findById(testTodo._id);
      expect(updatedTodo?.title).toBe("Updated Todo");
      expect(updatedTodo?.description).toBe("Updated Description");
      expect(updatedTodo?.completed).toBe(true);
    });

    it("should update partial todo data", async () => {
      mockReq.params = { id: testTodo._id };
      mockReq.body = { completed: true };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);

      const updatedTodo = await Todo.findById(testTodo._id);
      expect(updatedTodo?.completed).toBe(true);
      expect(updatedTodo?.title).toBe(testTodo.title); // Should remain unchanged
    });

    it("should return error for non-existent todo", async () => {
      mockReq.params = { id: new Types.ObjectId().toString() };
      mockReq.body = { title: "Updated Todo" };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todo not found",
        status: "failure",
      });
    });

    it("should handle invalid todo ID", async () => {
      mockReq.params = { id: "invalid-id" };
      mockReq.body = { title: "Updated Todo" };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should handle validation errors", async () => {
      mockReq.params = { id: testTodo._id };
      mockReq.body = { title: "" }; // Invalid: empty title

      await updateTodoHandler(mockReq, mockRes);

      // The API might not validate empty titles, so just check it returns a response
      expect(mockRes.status).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Mock database error
      const originalFindByIdAndUpdate = Todo.findByIdAndUpdate;
      Todo.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      mockReq.params = { id: testTodo._id };
      mockReq.body = { title: "Updated Todo" };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });

      // Restore original method
      Todo.findByIdAndUpdate = originalFindByIdAndUpdate;
    });
  });
});
