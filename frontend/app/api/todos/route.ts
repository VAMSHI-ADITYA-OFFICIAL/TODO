import { NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? 10);

  try {
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    qs.set("limit", String(limit));

    // fetchWithAuth handles accessToken refresh if expired
    const data = await fetchWithAuth(`/todos?${qs.toString()}`, {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
