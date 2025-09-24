import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? 10);

  // fetchWithAuth handles accessToken refresh if expired
  const data = await fetchWithAuth(`/todos?cursor=${cursor}&limit=${limit}`, {
    method: "GET",
  });

  return NextResponse.json(data);
}
