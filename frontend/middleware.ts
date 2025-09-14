import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const path = req.nextUrl.pathname;

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/todos", req.url));
  }

  // If user is not logged in and visiting protected route → redirect to /login
  else if (!token) {
    if (path.startsWith("/todos") || path === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next(); // allow access
}

export const config = {
  matcher: ["/", "/login", "/signup", "/todos/:path*"], // only these paths run middleware
};
