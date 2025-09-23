// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/todos");

  // If logged in user tries to access login/signup → redirect to todos
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/todos", req.url));
  }

  // If no accessToken and trying to access protected route → attempt refresh
  if (!accessToken && isProtectedRoute) {
    if (!refreshToken) {
      // No refresh token → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Call backend to refresh tokens
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await res.json();

      // Set updated cookies
      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 15, // 15 minutes
      });
      response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } catch (err) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Otherwise, let the request pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/todos/:path*"],
};
