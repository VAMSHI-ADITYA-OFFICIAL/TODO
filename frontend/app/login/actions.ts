"use server";

import { fetchWithAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginUser(data: { email: string; password: string }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    return error;
  }
  const result = await response.json();
  const nextRes = await cookies();

  nextRes.set({
    name: "refreshToken",
    value: result.refreshToken,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  nextRes.set({
    name: "accessToken",
    value: result.accessToken,
    httpOnly: true, // can be false if you need to read it in server actions
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax", // optional: 'strict' in production
    maxAge: 60 * 15, // 15 min
  });

  return { result };
}

export async function logoutUser() {
  const response = await fetchWithAuth(`/logout`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  console.log("delete response", response);
  if (response) {
    const nextRes = await cookies();
    nextRes.delete("accessToken");
    nextRes.delete("refreshToken");
    return { success: true };
  }
}
