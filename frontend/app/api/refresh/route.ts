// app/api/refresh/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "No refresh token found" },
      { status: 401 }
    );
  }

  // Call backend refresh endpoint
  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: "Refresh token invalid" },
      { status: 401 }
    );
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await backendRes.json();

  // Set updated cookies for the browser
  const res = NextResponse.json({ ok: true });
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // dev mode
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
  });
  res.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false, // dev mode
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
