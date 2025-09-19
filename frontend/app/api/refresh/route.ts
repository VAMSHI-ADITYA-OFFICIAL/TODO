import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  console.log({ request });
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect_to") || "/";
  const cookieStore = await cookies(); // no need for await
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    return redirect("/login"); // ✅ early return
  }

  const refreshResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );
  console.log({ refreshResponse });

  if (refreshResponse.ok) {
    const res = await refreshResponse.json();
    console.log({ res });

    cookieStore.set("accessToken", res.accessToken, {
      httpOnly: true,
      secure: true,
    });
    cookieStore.set("refreshToken", res.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return redirect(redirectTo); // ✅ don’t wrap in try/catch
  }

  // If refresh fails
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  return redirect("/login");
}
