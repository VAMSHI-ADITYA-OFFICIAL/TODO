"use server";
import { fetchWithAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { toastService } from "../services/toastServices";

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

export async function deleteTodo<T>(id: T) {
  const response = (await fetchWithAuth(`/todos/${id}`, {
    method: "DELETE",
  })) as { message: string; status: string };
  if (response.status === "success") {
    toastService.show(
      response.message || "Todo deleted successfully",
      "success"
    );
    return revalidatePath("/todos");
  } else {
    toastService.show(response.message || "Something went wrong", "error");
  }
}

export async function updateTodo<T>(id: T, data: createTodoProps) {
  const response = (await fetchWithAuth(`/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })) as { message: string; status: string };
  if (response.status === "success") {
    toastService.show(
      response.message || "Todo updated successfully",
      "success"
    );
    return revalidatePath("/todos");
  } else {
    toastService.show(response.message || "Something went wrong", "error");
  }
}

export async function toggleTodo<T>(id: T, data: Pick<TodoProps, "completed">) {
  const response = (await fetchWithAuth(`/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })) as { message: string; status: string };
  if (response.status === "success") {
    toastService.show(
      response.message || "Todo updated successfully",
      "success"
    );
    return revalidatePath("/todos");
  } else {
    toastService.show(response.message || "Something went wrong", "error");
  }
}
