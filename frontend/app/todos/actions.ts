"use server";
import { fetchWithAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type TodoProps = {
  title: string;
  description: string;
  completed: boolean;
  _id: string;
  createdAt: string;
};

type createTodoProps = Omit<TodoProps, "createdAt" | "_id">;

export async function createTodos(data: createTodoProps) {
  await fetchWithAuth("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return revalidatePath("/todos");
}

export async function fetchTodos<T>(): Promise<T> {
  const response = await fetchWithAuth("/todos", {
    method: "GET",
  });
  return response as T;
}
