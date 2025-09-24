import { CreateTodo } from "../components/CreateTodo";
import TodoList from "../components/TodoList";
import { fetchTodos, TodoProps } from "./actions";

export default async function Todos() {
  const response = await fetchTodos<{
    result: TodoProps[];
    count: number;
    completedCount: number;
    pageInfo: { nextCursor: string; hasNextPage: boolean };
  }>();

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <CreateTodo />

      <TodoList initilaTodoResponse={response} />
    </div>
  );
}
