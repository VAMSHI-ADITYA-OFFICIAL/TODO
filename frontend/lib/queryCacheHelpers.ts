import { QueryClient } from "@tanstack/react-query";
import { TodoProps } from "../app/todos/actions";

// Types for infinite query cache structure
type TodosPage = {
  result: TodoProps[];
  pageInfo: { nextCursor?: string; hasNextPage: boolean };
  count: number;
  completedCount: number;
};

type InfiniteTodosData = {
  pages: TodosPage[];
  pageParams: (string | undefined)[];
};

// Helper to find and update a specific todo across all pages
export function updateTodoInCache(
  queryClient: QueryClient,
  todoId: string,
  updater: (todo: TodoProps) => TodoProps
): void {
  queryClient.setQueryData<InfiniteTodosData>(["todos"], (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        result: page.result.map((todo) =>
          todo._id === todoId ? updater(todo) : todo
        ),
      })),
    };
  });
}

// Helper to remove a todo from all pages
export function removeTodoFromCache(
  queryClient: QueryClient,
  todoId: string
): void {
  queryClient.setQueryData<InfiniteTodosData>(["todos"], (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page) => ({
        ...page,
        result: page.result.filter((todo) => todo._id !== todoId),
        count: Math.max(0, page.count - 1),
        completedCount: page.result.find((todo) => todo._id === todoId)
          ?.completed
          ? Math.max(0, page.completedCount - 1)
          : page.completedCount,
      })),
    };
  });
}

// Helper to update counts across all pages
export function updateCountsInCache(
  queryClient: QueryClient,
  updater: (counts: { count: number; completedCount: number }) => {
    count: number;
    completedCount: number;
  }
): void {
  queryClient.setQueryData<InfiniteTodosData>(["todos"], (oldData) => {
    if (!oldData) return oldData;

    return {
      ...oldData,
      pages: oldData.pages.map((page, index) => {
        // Only update counts for the first page (most recent)
        if (index === 0) {
          const newCounts = updater({
            count: page.count,
            completedCount: page.completedCount,
          });
          return {
            ...page,
            count: newCounts.count,
            completedCount: newCounts.completedCount,
          };
        }
        return page;
      }),
    };
  });
}

// Generic optimistic update helper
export function withOptimisticUpdate<T>(
  queryClient: QueryClient,
  optimisticUpdate: () => void,
  mutationFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: unknown) => void
) {
  return async () => {
    // Store original data for rollback
    const previousData = queryClient.getQueryData<InfiniteTodosData>(["todos"]);

    // Apply optimistic update
    optimisticUpdate();

    try {
      const result = await mutationFn();
      onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData(["todos"], previousData);
      }
      onError?.(error);
      throw error;
    }
  };
}
