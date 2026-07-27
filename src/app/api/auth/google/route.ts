import { NextResponse, NextRequest } from "next/server";
import { getGoogleAuthUrl, getGoogleConfig } from "@/lib/google-oauth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from") || "/";

  const { isConfigured } = getGoogleConfig();
  if (!isConfigured) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const stateToken = crypto.randomUUID();

  const cookieStore = await cookies();
  
  // Store OAuth state & destination in secure HTTP-only cookies
  cookieStore.set("oauth_state", stateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  cookieStore.set("oauth_from", from, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  const authUrl = getGoogleAuthUrl(redirectUri, stateToken);

  return NextResponse.redirect(authUrl);
}
