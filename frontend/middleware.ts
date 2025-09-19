// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./lib/tokens";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  console.log({ accessToken, refreshToken, path });

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/todos");

  if (req.method !== "GET") {
    return NextResponse.next();
  }

  // Redirect authenticated users from auth pages
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/todos", req.url));
  }

  // Redirect unauthenticated users from protected pages
  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Handle expired access token on a protected route
  if (
    accessToken &&
    isProtectedRoute &&
    (await isTokenExpired(accessToken)) &&
    refreshToken
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/api/refresh";
    redirectUrl.searchParams.set("redirect_to", path);
    console.log("called in middleware refresh", redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/todos/:path*"],
};
