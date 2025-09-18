"use client";

import { useEffect, useState } from "react";
import TodoCard from "./TodoCard";
import { fetchTodos } from "../todos/actions";
import { TodoProps } from "../todos/actions";
import { CreateTodo } from "./CreateTodo";

export default function TodoList() {
  const [todos, setTodos] = useState<TodoProps[]>([]);

  async function getTodoList() {
    return fetchTodos().then((res) => setTodos(res.result || []));
  }
  useEffect(() => {
    getTodoList();
  }, []);
  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <CreateTodo
        onSuccess={() => {
          getTodoList();
        }}
      />
      <div className="flex w-full justify-center overflow-clip h-[62vh] md:h-[80vh] overflow-y-auto">
        <ul className="md:w-7/8">
          {(todos || []).map((todo) => {
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
