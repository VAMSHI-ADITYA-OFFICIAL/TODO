import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AxiosError } from "axios";
import { api } from "@/app/services/axiosInstance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = (await cookies()).get("accessToken")?.value;

    const response = await api.post("/todos", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const nextRes = NextResponse.json(response.data);

    const setCookie = response.headers["set-cookie"];
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((cookie) =>
          nextRes.headers.append("Set-Cookie", cookie)
        );
      } else {
        nextRes.headers.append("Set-Cookie", setCookie);
      }
    }

    return nextRes;
  } catch (err) {
    let errorMessage = "Request failed";
    let statusCode = 500;

    if (err instanceof AxiosError) {
      errorMessage = err.response?.data?.error || "Request failed";
      statusCode = err.response?.status || 500;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
