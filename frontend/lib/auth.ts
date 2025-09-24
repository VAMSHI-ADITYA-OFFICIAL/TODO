"use server"; // must be server-only
import { cookies } from "next/headers";

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Record<string, unknown>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;

  // First attempt with current accessToken
  let response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
  });

  // If 401 → try refresh once
  if (response.status === 401 && retry) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    // ⚠ Browser must call /api/refresh directly to update cookies
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json", // ✅ required
        },
        body: JSON.stringify({ refreshToken }), // always fresh
      }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await tokenResponse.json();

    const nextRes = await cookies();

    nextRes.set({
      name: "refreshToken",
      value: newRefreshToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    nextRes.set({
      name: "accessToken",
      value: newAccessToken,
      httpOnly: true, // can be false if you need to read it in server actions
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax", // optional: 'strict' in production
      maxAge: 60 * 15, // 15 min
    });

    if (!newAccessToken) {
      throw new Error("Failed to refresh token");
    }

    // Retry original request with new token
    response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  const data = await response.json();

  return data;
}
