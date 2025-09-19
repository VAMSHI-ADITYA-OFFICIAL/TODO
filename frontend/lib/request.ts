"use server";
export async function request<T>(
  url: string,
  options: RequestInit = {},
  accessToken?: string,
  refreshToken?: string
): Promise<{ data: T; newAccessToken?: string; newRefreshToken?: string }> {
  let res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  let newAccessToken: string | undefined;
  let newRefreshToken: string | undefined;

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
      {
        method: "POST",
        headers: { Cookie: `refreshToken=${refreshToken}` },
      }
    );

    if (!refreshRes.ok) throw new Error("Refresh token expired");

    const setCookieHeader = refreshRes.headers.get("set-cookie") as string;
    const cookiesArray = setCookieHeader.split(",");
    newRefreshToken = cookiesArray
      .find((c) => c.trim().startsWith("refreshToken="))
      ?.split(";")[0]
      .split("refreshToken=")[1];

    const refreshData = await refreshRes.json();
    newAccessToken = refreshData.accessToken;

    // Retry original request with new access token
    res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = (await res.json()) as T;
  return { data, newAccessToken, newRefreshToken };
}
