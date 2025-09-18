// app/api/login/route.ts
// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Call your backend login API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // ensure backend sends refreshToken cookie
    }
  );

  const data = await response.json();
  const cookieStore = await cookies();

  // 1️⃣ Set accessToken cookie (readable in server components)
  cookieStore.set("accessToken", data.accessToken, {
    httpOnly: false, // must be false if you want server actions to read it
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // 2️⃣ Forward refreshToken from backend to browser
  const setCookieHeader = response.headers.get("set-cookie");
  const nextRes = NextResponse.json(data, { status: response.status });
  if (setCookieHeader) {
    nextRes.headers.set("Set-Cookie", setCookieHeader); // now browser stores refreshToken
  }

  return nextRes;
}
