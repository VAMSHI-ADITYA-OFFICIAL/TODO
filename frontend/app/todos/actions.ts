"use server";

import { api } from "../services/axiosInstance";
import { cookies } from "next/headers";

export async function getTodos() {
  try {
    const token = (await cookies()).get("accessToken")?.value;
    const res = await api.get(`/todos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    const todos = res.data;
    return todos;
  } catch (err) {
    console.error("Error fetching todos:", err);
    return [];
  }
}

export async function createTodos(formData: {
  title: string;
  description: string;
}) {
  try {
    const token = (await cookies()).get("accessToken")?.value;
    const res = await api.post(`/todos`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return res;
  } catch (err) {
    console.error("Error create todos", err);
  }
}
