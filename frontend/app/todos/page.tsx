import { CreateTodo } from "../components/CreateTodo";
import TodoList from "../components/TodoList";
import { fetchTodos, TodoProps } from "./actions";

export default async function Todos() {
  let response: {
    result: TodoProps[];
    count: number;
    completedCount: number;
    pageInfo: { nextCursor: string | undefined; hasNextPage: boolean };
  };

  try {
    response = await fetchTodos<{
      result: TodoProps[];
      count: number;
      completedCount: number;
      pageInfo: { nextCursor: string; hasNextPage: boolean };
    }>();
  } catch (_error) {
    response = {
      result: [],
      count: 0,
      completedCount: 0,
      pageInfo: { nextCursor: undefined, hasNextPage: false },
    };
  }

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <CreateTodo />

      <TodoList initilaTodoResponse={response} />
    </div>
  );
}
