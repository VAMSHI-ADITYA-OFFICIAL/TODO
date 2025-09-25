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

    let newAccessToken: string | undefined;
    let newRefreshToken: string | undefined;
    try {
      const tokens = await tokenResponse.json();
      newAccessToken = tokens?.accessToken;
      newRefreshToken = tokens?.refreshToken;
    } catch (_e) {
      throw new Error("Failed to parse token refresh response");
    }

    if (!newAccessToken || !newRefreshToken) {
      throw new Error("Failed to refresh token");
    }

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

    // Retry original request with new token
    response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  // Ensure OK and JSON response
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    let errorBody: unknown = null;
    if (contentType.includes("application/json")) {
      try {
        errorBody = await response.json();
      } catch (_e) {
        // ignore
      }
    } else {
      try {
        const text = await response.text();
        errorBody = text?.slice(0, 500);
      } catch (_e) {
        // ignore
      }
    }
    throw new Error(
      `Request failed ${response.status}: ${
        typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody)
      }`
    );
  }

  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }
  // Fallback: try text to avoid "<!DOCTYPE..." JSON parse crashes
  const text = await response.text();
  throw new Error(`Expected JSON but received: ${text.slice(0, 200)}`);
}
