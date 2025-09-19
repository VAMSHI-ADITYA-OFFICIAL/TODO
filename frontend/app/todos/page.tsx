import { CreateTodo } from "../components/CreateTodo";
import TodoCard from "../components/TodoCard";
import { fetchTodos, TodoProps } from "./actions";

export default async function Todos() {
  const response = await fetchTodos();
  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <CreateTodo />
      <div className="flex w-full justify-center overflow-clip h-[62vh] md:h-[80vh] overflow-y-auto">
        <ul className="md:w-7/8">
          {(response.result || []).map((todo) => {
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
    </div>
  );
}
