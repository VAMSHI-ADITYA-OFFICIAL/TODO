// lib/utils/auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Use a simple in-memory flag for locking. This is valid in a single-instance environment.
// For multi-instance deployments (e.g., Vercel), you would need a more robust,
// shared locking mechanism like Redis.
let tokenRefreshPromise: Promise<void> | null = null;

export async function refreshTokens() {
  // If a refresh is already in progress, wait for it to complete.
  console.log({ outside: tokenRefreshPromise });
  if (tokenRefreshPromise) {
    console.log({ tokenRefreshPromise });
    return tokenRefreshPromise;
  }

  // Create a new promise for the refresh operation and store it.
  tokenRefreshPromise = (async () => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      // If no refresh token, clear cookies and force re-login.
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      // Use Next.js redirect from next/navigation for Server Actions.
      redirect("/login");
    }

    try {
      const refreshResponse = await fetch(`/api/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      console.log({ refreshResponse });

      if (!refreshResponse.ok) {
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        throw new Error("Token refresh failed");
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await refreshResponse.json();

      console.log({ newAccessToken, newRefreshToken });

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
      cookieStore.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        path: "/",
      });
    } catch (error) {
      // If any part of the refresh process fails, redirect to login.
      console.error("Error refreshing tokens:", error);
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      redirect("/login");
    } finally {
      // Clear the lock after the refresh attempt has finished.
      tokenRefreshPromise = null;
    }
  })();

  console.log({ tokenRefreshPromise });

  return tokenRefreshPromise;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const updatedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
  const response = await fetch(updatedUrl, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();

  if (response.status === 401 && retry) {
    console.log("Token expired, attempting to refresh");
    try {
      await refreshTokens();
      const newAccessToken = cookieStore.get("accessToken")?.value;
      if (!newAccessToken)
        throw new Error("Authentication failed after refresh");
      return fetchWithAuth(updatedUrl, options, false);
    } catch (error) {
      console.error("Failed to refresh and retry:", error);
      throw error;
    }
  }

  return data;
}
