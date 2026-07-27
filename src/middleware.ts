import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_CONFIG } from "@/config/auth.config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, AUTH_CONFIG.JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Redirect unauthenticated users trying to access protected routes to /login
  if (!isAuthenticated && AUTH_CONFIG.PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from /login and /register
  if (isAuthenticated && AUTH_CONFIG.AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/library/:path*",
    "/dashboard/:path*",
    "/collections/:path*",
    "/settings/:path*",
    "/account/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
