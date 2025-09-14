import { CreateTodo } from "../components/CreateTodo";
import { getTodos } from "./actions";

type TodoProps = {
  title: string;
  description: string;
  completed: boolean;
  _id: string;
};

export default async function TodoList() {
  const res: { result: TodoProps[] } = await getTodos();

  return (
    <div className="flex flex-col gap-5 justify-center">
      <CreateTodo />
      <div className="flex w-full justify-center">
        <ul className="w-7/8">
          {res.result.map((todo) => {
            return (
              <li
                className="flex flex-col m-2 rounded dark:bg-gray-800 dark:border-1 p-2 border-black shadow-xl dark:shadow-blue-950"
                key={todo._id}
              >
                <span>{todo.title}</span>
                <span>{todo.description}</span>
                <span>{todo.completed}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
