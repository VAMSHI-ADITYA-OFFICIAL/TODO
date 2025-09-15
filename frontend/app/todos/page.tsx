import { CreateTodo } from "../components/CreateTodo";
import TodoCard from "../components/TodoCard";
import { getTodos } from "./actions";

export type TodoProps = {
  title: string;
  description: string;
  completed: boolean;
  _id: string;
  createdAt: string;
};

export default async function TodoList() {
  const res: { result: TodoProps[] } = await getTodos();

  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <CreateTodo />
      <div className="flex w-full justify-center">
        <ul className="md:w-7/8">
          {res.result.map((todo) => {
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
