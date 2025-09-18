// app/api/refresh/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/refresh`, {
    method: "POST",
    headers: { cookie: cookieHeader }, // forward refreshToken
  });

  const setCookies = res.headers.get("set-cookie");

  const headers = new Headers();
  if (setCookies) headers.set("Set-Cookie", setCookies);
  headers.set("Content-Type", "application/json");

  return new Response(await res.text(), { headers, status: res.status });
}
