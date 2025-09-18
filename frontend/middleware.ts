import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // console.log({ req });
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("accessToken")?.value;

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedRoute = path.startsWith("/todos") || path === "/";

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/todos", req.url));
  }
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/todos/:path*"],
};
