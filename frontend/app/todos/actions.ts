"use server";
import { revalidatePath } from "next/cache";
import { requestWithCookie } from "../actions/requestWithCookies";

export type TodoProps = {
  title: string;
  description: string;
  completed: boolean;
  _id: string;
  createdAt: string;
};

export async function createTodos(data: {
  title: string;
  description: string;
}) {
  await requestWithCookie("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return revalidatePath("/todos");
}

export async function fetchTodos() {
  return await requestWithCookie<{ result: TodoProps[] }>("/todos", {
    method: "GET",
  });
}
