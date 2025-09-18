"use server";
import { cookies } from "next/headers";
import { request } from "@/lib/request";

export async function requestWithCookie<T>(
  url: string,
  options: RequestInit = {}
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const { data, newAccessToken, newRefreshToken } = await request<T>(
    url,
    options,
    accessToken,
    refreshToken
  );

  if (newAccessToken) {
    // ✅ Safe: inside a server action
    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: false, // read in server actions
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      sameSite: "lax",
      path: "/",
    });
  }

  if (newRefreshToken) {
    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 30 days
    });
  }

  return data;
}
