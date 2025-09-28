import {
  createTodoHandler,
  getTodoByUserIdHandler,
  updateTodoHandler,
  deleteTodoHandler,
} from "../../controllers/todo.controller.js";
import { Todo } from "../../models/todo.model.js";
import { User } from "../../models/signup.model.js";
import {
  createMockRequest,
  createMockResponse,
  createTestUser,
  clearDatabase,
} from "../utils/testHelpers.js";
import { Types } from "mongoose";

describe("Todo Controller", () => {
  let mockReq: any;
  let mockRes: any;
  let testUser: any;

  beforeEach(async () => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    await clearDatabase();
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe("createTodoHandler", () => {
    it("should create a new todo successfully", async () => {
      mockReq.userId = testUser._id;
      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
      };

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
    });

    it("should return 400 for missing title", async () => {
      mockReq.userId = testUser._id;
      mockReq.body = {
        description: "Test Description",
      };

      await createTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.objectContaining({
          title: expect.stringContaining("required"),
        }),
      });
    });
  });

  describe("getTodoByUserIdHandler", () => {
    it("should get todos for user", async () => {
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

      mockReq.userId = testUser._id;
      mockReq.query = {};

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Todos fetched successfully",
          status: "success",
          count: 2,
          completedCount: 1,
        })
      );
    });

    it("should return empty result for user with no todos", async () => {
      mockReq.userId = testUser._id;
      mockReq.query = {};

      await getTodoByUserIdHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
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

  describe("updateTodoHandler", () => {
    it("should update todo successfully", async () => {
      const todo = await Todo.create({
        title: "Original Title",
        description: "Original Description",
        completed: false,
        userId: testUser._id,
      });

      mockReq.userId = testUser._id;
      mockReq.params = { id: todo._id.toString() };
      mockReq.body = {
        title: "Updated Title",
        description: "Updated Description",
        completed: true,
      };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Todo updated successfully",
          status: "success",
        })
      );
    });

    it("should return 404 for non-existent todo", async () => {
      mockReq.userId = testUser._id;
      mockReq.params = { id: new Types.ObjectId().toString() };
      mockReq.body = {
        title: "Updated Title",
      };

      await updateTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Todo not found",
          status: "failure",
        })
      );
    });
  });

  describe("deleteTodoHandler", () => {
    it("should delete todo successfully", async () => {
      const todo = await Todo.create({
        title: "Todo to Delete",
        description: "Description",
        completed: false,
        userId: testUser._id,
      });

      mockReq.userId = testUser._id;
      mockReq.params = { id: todo._id.toString() };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Todo deleted successfully",
        status: "success",
      });

      // Verify todo was deleted
      const deletedTodo = await Todo.findById(todo._id);
      expect(deletedTodo).toBeNull();
    });

    it("should return 404 for non-existent todo", async () => {
      mockReq.userId = testUser._id;
      mockReq.params = { id: new Types.ObjectId().toString() };

      await deleteTodoHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Todo not found",
          status: "failure",
        })
      );
    });
  });
});
