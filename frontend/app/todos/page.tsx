import { CreateTodo } from "../components/CreateTodo";
import TodoCard from "../components/TodoCard";
import { fetchTodos, TodoProps } from "./actions";

export default async function Todos() {
  const response = await fetchTodos<{
    result: TodoProps[];
    count: number;
    completedCount: number;
  }>();

  const totalCount = response.count;
  const completedCount = response.completedCount;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <CreateTodo />
      <div className="flex flex-col w-full items-center">
        <div className="flex md:w-7/8 px-2 gap-5">
          <span>Total: {totalCount}</span>
          <span>
            Completed: <span className="text-green-500">{completedCount}</span>
          </span>
          <span>
            Pending: <span className="text-red-500">{pendingCount}</span>
          </span>
        </div>
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
    </div>
  );
}
