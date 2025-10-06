import {
  createTodos,
  fetchTodos,
  deleteTodo,
  updateTodo,
  toggleTodo,
  TodoProps,
} from "../../app/todos/actions";

// Mock the fetchWithAuth function
jest.mock("../../lib/auth", () => ({
  fetchWithAuth: jest.fn(),
}));

describe("Todo Actions", () => {
  const mockFetchWithAuth = require("../../lib/auth").fetchWithAuth;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTodos", () => {
    it("should create a new todo successfully", async () => {
      const mockResponse = {
        message: "Todo created successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle create todo error", async () => {
      const mockError = {
        message: "Failed to create todo",
        status: "error",
      };

      mockFetchWithAuth.mockResolvedValue(mockError);

      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockError);
    });

    it("should create todo with completed status", async () => {
      const mockResponse = {
        message: "Todo created successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoData = {
        title: "Completed Todo",
        description: "This todo is already completed",
        completed: true,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle empty todo data", async () => {
      const mockResponse = {
        message: "Todo created successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoData = {
        title: "",
        description: "",
        completed: false,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("fetchTodos", () => {
    it("should fetch todos successfully", async () => {
      const mockTodos = {
        result: [
          {
            _id: "1",
            title: "Todo 1",
            description: "Description 1",
            completed: false,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
          {
            _id: "2",
            title: "Todo 2",
            description: "Description 2",
            completed: true,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        count: 2,
        completedCount: 1,
        pageInfo: { nextCursor: "next123", hasNextPage: true },
      };

      mockFetchWithAuth.mockResolvedValue(mockTodos);

      const result = await fetchTodos<typeof mockTodos>();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "GET",
      });

      expect(result).toEqual(mockTodos);
    });

    it("should fetch empty todos list", async () => {
      const mockEmptyTodos = {
        result: [],
        count: 0,
        completedCount: 0,
        pageInfo: { nextCursor: null, hasNextPage: false },
      };

      mockFetchWithAuth.mockResolvedValue(mockEmptyTodos);

      const result = await fetchTodos<typeof mockEmptyTodos>();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "GET",
      });

      expect(result).toEqual(mockEmptyTodos);
    });

    it("should handle fetch todos error", async () => {
      const mockError = {
        message: "Failed to fetch todos",
        status: "error",
      };

      mockFetchWithAuth.mockResolvedValue(mockError);

      const result = await fetchTodos<typeof mockError>();

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "GET",
      });

      expect(result).toEqual(mockError);
    });
  });

  describe("deleteTodo", () => {
    it("should delete todo successfully", async () => {
      const mockResponse = {
        message: "Todo deleted successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoId = "123";

      const result = await deleteTodo(todoId);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "DELETE",
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle delete todo error", async () => {
      const mockError = {
        message: "Failed to delete todo",
        status: "error",
      };

      mockFetchWithAuth.mockResolvedValue(mockError);

      const todoId = "123";

      const result = await deleteTodo(todoId);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "DELETE",
      });

      expect(result).toEqual(mockError);
    });

    it("should delete todo with different ID types", async () => {
      const mockResponse = {
        message: "Todo deleted successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      // Test with number ID
      const numberId = 456;
      await deleteTodo(numberId);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/456", {
        method: "DELETE",
      });

      // Test with string ID
      const stringId = "abc123";
      await deleteTodo(stringId);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/abc123", {
        method: "DELETE",
      });
    });
  });

  describe("updateTodo", () => {
    it("should update todo successfully", async () => {
      const mockResponse = {
        message: "Todo updated successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoId = "123";
      const updateData = {
        title: "Updated Todo",
        description: "Updated Description",
        completed: true,
      };

      const result = await updateTodo(todoId, updateData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle update todo error", async () => {
      const mockError = {
        message: "Failed to update todo",
        status: "error",
      };

      mockFetchWithAuth.mockResolvedValue(mockError);

      const todoId = "123";
      const updateData = {
        title: "Updated Todo",
        description: "Updated Description",
        completed: true,
      };

      const result = await updateTodo(todoId, updateData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(result).toEqual(mockError);
    });

    it("should update todo with partial data", async () => {
      const mockResponse = {
        message: "Todo updated successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoId = "123";
      const updateData = {
        title: "Only Title Updated",
        description: "Original Description",
        completed: false,
      };

      const result = await updateTodo(todoId, updateData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should update todo with different ID types", async () => {
      const mockResponse = {
        message: "Todo updated successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      // Test with number ID
      const numberId = 456;
      const updateData = {
        title: "Updated Todo",
        description: "Updated Description",
        completed: true,
      };

      await updateTodo(numberId, updateData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/456", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
    });
  });

  describe("toggleTodo", () => {
    it("should toggle todo to completed", async () => {
      const mockResponse = {
        message: "Todo toggled successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoId = "123";
      const toggleData = { completed: true };

      const result = await toggleTodo(todoId, toggleData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toggleData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should toggle todo to incomplete", async () => {
      const mockResponse = {
        message: "Todo toggled successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoId = "123";
      const toggleData = { completed: false };

      const result = await toggleTodo(todoId, toggleData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toggleData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle toggle todo error", async () => {
      const mockError = {
        message: "Failed to toggle todo",
        status: "error",
      };

      mockFetchWithAuth.mockResolvedValue(mockError);

      const todoId = "123";
      const toggleData = { completed: true };

      const result = await toggleTodo(todoId, toggleData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/123", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toggleData),
      });

      expect(result).toEqual(mockError);
    });

    it("should toggle todo with different ID types", async () => {
      const mockResponse = {
        message: "Todo toggled successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      // Test with number ID
      const numberId = 456;
      const toggleData = { completed: true };

      await toggleTodo(numberId, toggleData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/456", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toggleData),
      });
    });
  });

  describe("Type definitions", () => {
    it("should have correct TodoProps type structure", () => {
      const todo: TodoProps = {
        _id: "123",
        title: "Test Todo",
        description: "Test Description",
        completed: false,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      expect(todo._id).toBe("123");
      expect(todo.title).toBe("Test Todo");
      expect(todo.description).toBe("Test Description");
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should create todo data without _id and createdAt", () => {
      const createTodoData = {
        title: "New Todo",
        description: "New Description",
        completed: false,
      };

      // This should compile without errors
      expect(createTodoData.title).toBe("New Todo");
      expect(createTodoData.description).toBe("New Description");
      expect(createTodoData.completed).toBe(false);
    });
  });

  describe("Error handling", () => {
    it("should handle fetchWithAuth throwing an error", async () => {
      const error = new Error("Network error");
      mockFetchWithAuth.mockRejectedValue(error);

      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };

      await expect(createTodos(todoData)).rejects.toThrow("Network error");
    });

    it("should handle fetchWithAuth returning undefined", async () => {
      mockFetchWithAuth.mockResolvedValue(undefined);

      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };

      const result = await createTodos(todoData);
      expect(result).toBeUndefined();
    });

    it("should handle fetchWithAuth returning null", async () => {
      mockFetchWithAuth.mockResolvedValue(null);

      const todoData = {
        title: "Test Todo",
        description: "Test Description",
        completed: false,
      };

      const result = await createTodos(todoData);
      expect(result).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle very long todo data", async () => {
      const mockResponse = {
        message: "Todo created successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const longTitle = "A".repeat(1000);
      const longDescription = "B".repeat(5000);

      const todoData = {
        title: longTitle,
        description: longDescription,
        completed: false,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle special characters in todo data", async () => {
      const mockResponse = {
        message: "Todo created successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const todoData = {
        title: "Todo with émojis 🎉 and spëcial chars",
        description: "Description with unicode: 你好世界 🌍",
        completed: false,
      };

      const result = await createTodos(todoData);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });

      expect(result).toEqual(mockResponse);
    });

    it("should handle empty string IDs", async () => {
      const mockResponse = {
        message: "Todo deleted successfully",
        status: "success",
      };

      mockFetchWithAuth.mockResolvedValue(mockResponse);

      const emptyId = "";
      const result = await deleteTodo(emptyId);

      expect(mockFetchWithAuth).toHaveBeenCalledWith("/todos/", {
        method: "DELETE",
      });

      expect(result).toEqual(mockResponse);
    });
  });
});

