"use client";

import { TodoProps } from "../todos/actions";
import Button from "./Button";
import TodoCard from "./TodoCard";
import TodoSkeleton from "./TodoSkeleton";
import { useInfiniteQuery } from "@tanstack/react-query";

type TodosResponse = {
  result: TodoProps[];
  pageInfo: { nextCursor?: string; hasNextPage: boolean };
  completedCount: number;
  count: number;
};

async function fetchTodosClient({
  cursor,
  limit = 10,
}: {
  cursor?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  params.append("limit", limit.toString());

  const res = await fetch(`/api/todos?${params.toString()}`, {
    cache: "no-store",
  });
  return res.json() as Promise<TodosResponse>;
}

export default function TodoList({
  initilaTodoResponse,
}: {
  initilaTodoResponse: TodosResponse;
}) {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["todos"],
      queryFn: ({ pageParam }) => {
        // console.log({ pageParam });
        return fetchTodosClient({ cursor: pageParam, limit: 10 });
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage: TodosResponse) => {
        return lastPage.pageInfo.nextCursor;
      },
      initialData: {
        pages: [initilaTodoResponse],
        pageParams: [undefined],
      },
      refetchOnWindowFocus: false,
      retry: false,
      enabled: true,
    });

  const todoList = (data?.pages || []).reduce(
    (total: TodoProps[], cur: TodosResponse) => {
      return total.concat(cur.result || []);
    },
    [] as TodoProps[]
  );
  const header = (data?.pages && data.pages[0]) || initilaTodoResponse;
  const totalCount = header.count;
  const completedCount = header.completedCount;
  const pendingCount = totalCount - completedCount;
  return (
    <>
      <div className="flex flex-col w-full items-center">
        <div className="flex md:w-7/8 px-2 gap-5">
          <span>
            Showing: {todoList.length}/{totalCount}
          </span>
          <span>
            Completed: <span className="text-green-500">{completedCount}</span>
          </span>
          <span>
            Pending: <span className="text-red-500">{pendingCount}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex w-full justify-center overflow-clip h-[57vh] md:h-[70vh] overflow-y-auto">
          <ul className="md:w-7/8">
            {isFetching && !isFetchingNextPage
              ? // Show skeleton for initial load
                Array.from({ length: 5 }).map((_, index) => (
                  <TodoSkeleton key={`skeleton-${index}`} />
                ))
              : (todoList || []).map((todo: TodoProps) => {
                  return (
                    <li
                      key={todo._id}
                      className="flex flex-col m-2 rounded dark:bg-gray-800 dark:border-1 p-2 border-black shadow-xl dark:shadow-blue-950"
                    >
                      <TodoCard todo={todo} />
                    </li>
                  );
                })}
          </ul>
        </div>
        <div className="flex mx-auto mt-4">
          {hasNextPage && (
            <Button
              className="h-11"
              variant="primary"
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
