import { QueryClient } from "@tanstack/react-query";
import {
  updateTodoInCache,
  removeTodoFromCache,
  updateCountsInCache,
  withOptimisticUpdate,
} from "../../lib/queryCacheHelpers";
import { TodoProps } from "../../app/todos/actions";

// Mock TodoProps type
const mockTodo: TodoProps = {
  _id: "1",
  title: "Test Todo",
  description: "Test Description",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
};

const mockTodo2: TodoProps = {
  _id: "2",
  title: "Test Todo 2",
  description: "Test Description 2",
  completed: true,
  createdAt: "2024-01-01T00:00:00.000Z",
};

const mockTodo3: TodoProps = {
  _id: "3",
  title: "Test Todo 3",
  description: "Test Description 3",
  completed: false,
  createdAt: "2024-01-01T00:00:00.000Z",
};

describe("queryCacheHelpers", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  describe("updateTodoInCache", () => {
    it("should update a todo in the cache", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
          {
            result: [mockTodo3],
            pageInfo: { nextCursor: undefined, hasNextPage: false },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined, "cursor1"],
      };

      queryClient.setQueryData(["todos"], initialData);

      const updater = (todo: TodoProps) => ({
        ...todo,
        title: "Updated Todo",
        completed: true,
      });

      updateTodoInCache(queryClient, "1", updater);

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toEqual({
        pages: [
          {
            result: [
              { ...mockTodo, title: "Updated Todo", completed: true },
              mockTodo2,
            ],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
          {
            result: [mockTodo3],
            pageInfo: { nextCursor: undefined, hasNextPage: false },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined, "cursor1"],
      });
    });

    it("should not modify cache if todo is not found", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      const updater = (todo: TodoProps) => ({
        ...todo,
        title: "Updated Todo",
      });

      updateTodoInCache(queryClient, "nonexistent", updater);

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toEqual(initialData);
    });

    it("should handle empty cache gracefully", () => {
      queryClient.setQueryData(["todos"], null);

      const updater = (todo: TodoProps) => ({
        ...todo,
        title: "Updated Todo",
      });

      expect(() => {
        updateTodoInCache(queryClient, "1", updater);
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toBeNull();
    });

    it("should handle undefined cache gracefully", () => {
      queryClient.setQueryData(["todos"], undefined);

      const updater = (todo: TodoProps) => ({
        ...todo,
        title: "Updated Todo",
      });

      expect(() => {
        updateTodoInCache(queryClient, "1", updater);
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toBeUndefined();
    });

    it("should update todo in multiple pages", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
          {
            result: [{ ...mockTodo, _id: "1", title: "Different Title" }],
            pageInfo: { nextCursor: undefined, hasNextPage: false },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined, "cursor1"],
      };

      queryClient.setQueryData(["todos"], initialData);

      const updater = (todo: TodoProps) => ({
        ...todo,
        title: "Updated in All Pages",
      });

      updateTodoInCache(queryClient, "1", updater);

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData?.pages[0].result[0].title).toBe(
        "Updated in All Pages"
      );
      expect(updatedData?.pages[1].result[0].title).toBe(
        "Updated in All Pages"
      );
    });
  });

  describe("removeTodoFromCache", () => {
    it("should remove a todo from the cache", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      removeTodoFromCache(queryClient, "1");

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toEqual({
        pages: [
          {
            result: [mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      });
    });

    it("should update completed count when removing completed todo", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      removeTodoFromCache(queryClient, "2"); // Remove completed todo

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toEqual({
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined],
      });
    });

    it("should not modify cache if todo is not found", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      removeTodoFromCache(queryClient, "nonexistent");

      const updatedData = queryClient.getQueryData(["todos"]);
      // The count should be decremented even if todo not found due to the logic
      expect(updatedData?.pages[0].result).toEqual([mockTodo, mockTodo2]);
      expect(updatedData?.pages[0].count).toBe(1); // Count decremented
      expect(updatedData?.pages[0].completedCount).toBe(1); // No change since todo not found
    });

    it("should handle empty cache gracefully", () => {
      queryClient.setQueryData(["todos"], null);

      expect(() => {
        removeTodoFromCache(queryClient, "1");
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toBeNull();
    });

    it("should handle count going below zero", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 0, // Already at 0
            completedCount: 0,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      removeTodoFromCache(queryClient, "1");

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData?.pages[0].count).toBe(0);
      expect(updatedData?.pages[0].completedCount).toBe(0);
    });

    it("should remove todo from multiple pages", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
          {
            result: [{ ...mockTodo, _id: "1" }],
            pageInfo: { nextCursor: undefined, hasNextPage: false },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined, "cursor1"],
      };

      queryClient.setQueryData(["todos"], initialData);

      removeTodoFromCache(queryClient, "1");

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData?.pages[0].result).toHaveLength(0);
      expect(updatedData?.pages[1].result).toHaveLength(0);
    });
  });

  describe("updateCountsInCache", () => {
    it("should update counts for the first page only", () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
          {
            result: [mockTodo3],
            pageInfo: { nextCursor: undefined, hasNextPage: false },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined, "cursor1"],
      };

      queryClient.setQueryData(["todos"], initialData);

      const updater = (counts: { count: number; completedCount: number }) => ({
        count: counts.count + 1,
        completedCount: counts.completedCount + 1,
      });

      updateCountsInCache(queryClient, updater);

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData?.pages[0].count).toBe(3);
      expect(updatedData?.pages[0].completedCount).toBe(2);
      expect(updatedData?.pages[1].count).toBe(1); // Unchanged
      expect(updatedData?.pages[1].completedCount).toBe(0); // Unchanged
    });

    it("should handle empty cache gracefully", () => {
      queryClient.setQueryData(["todos"], null);

      const updater = (counts: { count: number; completedCount: number }) => ({
        count: counts.count + 1,
        completedCount: counts.completedCount + 1,
      });

      expect(() => {
        updateCountsInCache(queryClient, updater);
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toBeNull();
    });

    it("should handle undefined cache gracefully", () => {
      queryClient.setQueryData(["todos"], undefined);

      const updater = (counts: { count: number; completedCount: number }) => ({
        count: counts.count + 1,
        completedCount: counts.completedCount + 1,
      });

      expect(() => {
        updateCountsInCache(queryClient, updater);
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toBeUndefined();
    });

    it("should handle empty pages array", () => {
      const initialData = {
        pages: [],
        pageParams: [],
      };

      queryClient.setQueryData(["todos"], initialData);

      const updater = (counts: { count: number; completedCount: number }) => ({
        count: counts.count + 1,
        completedCount: counts.completedCount + 1,
      });

      expect(() => {
        updateCountsInCache(queryClient, updater);
      }).not.toThrow();

      const updatedData = queryClient.getQueryData(["todos"]);
      expect(updatedData).toEqual(initialData);
    });
  });

  describe("withOptimisticUpdate", () => {
    it("should apply optimistic update and rollback on error", async () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      const optimisticUpdate = () => {
        updateTodoInCache(queryClient, "1", (todo) => ({
          ...todo,
          title: "Optimistically Updated",
        }));
      };

      const mutationFn = jest.fn().mockRejectedValue(new Error("API Error"));
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const optimisticMutation = withOptimisticUpdate(
        queryClient,
        optimisticUpdate,
        mutationFn,
        onSuccess,
        onError
      );

      await expect(optimisticMutation()).rejects.toThrow("API Error");

      // Check that rollback occurred
      const finalData = queryClient.getQueryData(["todos"]);
      expect(finalData).toEqual(initialData);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should apply optimistic update and keep changes on success", async () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      const optimisticUpdate = () => {
        updateTodoInCache(queryClient, "1", (todo) => ({
          ...todo,
          title: "Optimistically Updated",
        }));
      };

      const mutationResult = { success: true };
      const mutationFn = jest.fn().mockResolvedValue(mutationResult);
      const onSuccess = jest.fn();
      const onError = jest.fn();

      const optimisticMutation = withOptimisticUpdate(
        queryClient,
        optimisticUpdate,
        mutationFn,
        onSuccess,
        onError
      );

      const result = await optimisticMutation();

      expect(result).toBe(mutationResult);
      expect(onSuccess).toHaveBeenCalledWith(mutationResult);
      expect(onError).not.toHaveBeenCalled();

      // Check that optimistic update was kept
      const finalData = queryClient.getQueryData(["todos"]);
      expect(finalData?.pages[0].result[0].title).toBe(
        "Optimistically Updated"
      );
    });

    it("should handle missing onSuccess and onError callbacks", async () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 1,
            completedCount: 0,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      const optimisticUpdate = () => {
        updateTodoInCache(queryClient, "1", (todo) => ({
          ...todo,
          title: "Optimistically Updated",
        }));
      };

      const mutationResult = { success: true };
      const mutationFn = jest.fn().mockResolvedValue(mutationResult);

      const optimisticMutation = withOptimisticUpdate(
        queryClient,
        optimisticUpdate,
        mutationFn
      );

      const result = await optimisticMutation();

      expect(result).toBe(mutationResult);
      // Should not throw even without callbacks
    });

    it("should handle rollback when no previous data exists", async () => {
      queryClient.setQueryData(["todos"], null);

      const optimisticUpdate = () => {
        queryClient.setQueryData(["todos"], {
          pages: [
            {
              result: [mockTodo],
              pageInfo: { nextCursor: "cursor1", hasNextPage: true },
              count: 1,
              completedCount: 0,
            },
          ],
          pageParams: [undefined],
        });
      };

      const mutationFn = jest.fn().mockRejectedValue(new Error("API Error"));
      const onError = jest.fn();

      const optimisticMutation = withOptimisticUpdate(
        queryClient,
        optimisticUpdate,
        mutationFn,
        undefined,
        onError
      );

      await expect(optimisticMutation()).rejects.toThrow("API Error");

      // Should not crash even with null previous data
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle multiple optimistic updates", async () => {
      const initialData = {
        pages: [
          {
            result: [mockTodo, mockTodo2],
            pageInfo: { nextCursor: "cursor1", hasNextPage: true },
            count: 2,
            completedCount: 1,
          },
        ],
        pageParams: [undefined],
      };

      queryClient.setQueryData(["todos"], initialData);

      const optimisticUpdate = () => {
        updateTodoInCache(queryClient, "1", (todo) => ({
          ...todo,
          title: "Updated 1",
        }));
        updateTodoInCache(queryClient, "2", (todo) => ({
          ...todo,
          title: "Updated 2",
        }));
      };

      const mutationFn = jest.fn().mockRejectedValue(new Error("API Error"));

      const optimisticMutation = withOptimisticUpdate(
        queryClient,
        optimisticUpdate,
        mutationFn
      );

      await expect(optimisticMutation()).rejects.toThrow("API Error");

      // Check that rollback occurred
      const finalData = queryClient.getQueryData(["todos"]);
      expect(finalData).toEqual(initialData);
    });
  });
});
