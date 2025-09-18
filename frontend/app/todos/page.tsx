import { CreateTodo } from "../components/CreateTodo";
import TodoList from "../components/TodoList";

export default async function Todos() {
  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <CreateTodo />
      <div className="flex w-full justify-center">
        <TodoList />
      </div>
    </div>
  );
}
