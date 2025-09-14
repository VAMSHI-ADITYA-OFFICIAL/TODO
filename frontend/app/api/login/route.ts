// app/api/login/route.ts
import { api } from "@/app/services/axiosInstance";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await api.post("/login", body); // uses interceptors automatically

    const nextRes = NextResponse.json(response.data);
    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      setCookie.forEach(cookie => {
        nextRes.headers.append("Set-Cookie", cookie);
      });
    }
    return nextRes;
  } catch (err) {
    const isAxiosError = err && typeof err === "object" && "response" in err;
    const axiosErr = err as {
      response?: { data?: { error?: string }; status?: number };
    };
    const errorMessage = isAxiosError
      ? axiosErr.response?.data?.error || "Login failed"
      : "Login failed";
    const statusCode = isAxiosError ? axiosErr.response?.status || 500 : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
