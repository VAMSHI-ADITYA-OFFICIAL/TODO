// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/todos");

  // If logged in user tries to access login/signup → redirect to todos
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/todos", req.url));
  }

  // If no accessToken and trying to access protected route → redirect to login
  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Otherwise, let the request pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/todos/:path*"],
};
