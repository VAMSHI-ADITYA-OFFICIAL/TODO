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

export async function createTodos(data: {
  title: string;
  description: string;
}) {
  await fetchWithAuth("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return revalidatePath("/todos");
}

export async function fetchTodos() {
  return await fetchWithAuth("/todos", {
    method: "GET",
  });
}
