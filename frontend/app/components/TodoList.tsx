"use client";

import { useEffect, useState } from "react";
import TodoCard from "./TodoCard";
import { fetchTodos } from "../todos/actions";
import { TodoProps } from "../todos/actions";

export default function TodoList() {
  const [todos, setTodos] = useState<TodoProps[]>([]);
  useEffect(() => {
    fetchTodos().then((res) => setTodos(res.result || []));
  }, []);
  return (
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
  );
}
