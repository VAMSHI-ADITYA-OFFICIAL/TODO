"use server";

import { cookies } from "next/headers";

export async function loginUser(data: {
  email: string;
  password: string;
  //   complted: boolean;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );

  console.log("response from login actions", response);

  if (!response.ok) {
    const error = await response.json();
    return { error: error?.message || "Signup failed" };
  }
  const result = await response.json();
  const nextRes = await cookies();

  const setCookieHeader = response.headers.get("set-cookie");

  // Extract refreshToken from it
  let backendRefreshToken: string | undefined;

  if (setCookieHeader) {
    const cookiesArray = setCookieHeader.split(","); // handle multiple cookies
    const refreshCookie = cookiesArray.find((cookie) =>
      cookie.trim().startsWith("refreshToken=")
    );

    if (refreshCookie) {
      // Get only the value before the first semicolon
      backendRefreshToken = refreshCookie.split(";")[0].split("=")[1];
    }
  }

  // console.log("backendRefreshToken:", backendRefreshToken);

  nextRes.set({
    name: "refreshToken",
    value: backendRefreshToken as string,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  nextRes.set({
    name: "accessToken",
    value: result.accessToken,
    httpOnly: true, // can be false if you need to read it in server actions
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax", // optional: 'strict' in production
    // no maxAge — allow server actions to manage refresh
  });

  return { result };
}
