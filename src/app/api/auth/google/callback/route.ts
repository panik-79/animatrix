import { NextResponse, NextRequest } from "next/server";
import { exchangeCodeForTokens, fetchGoogleUserInfo, handleGoogleUserAuth } from "@/lib/google-oauth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  const loginUrl = new URL("/login", request.url);

  if (oauthError) {
    loginUrl.searchParams.set("error", "google_cancelled");
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    loginUrl.searchParams.set("error", "invalid_oauth_response");
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const savedFrom = cookieStore.get("oauth_from")?.value || "/";

  // Clean up OAuth temp cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_from");

  if (!savedState || savedState !== state) {
    loginUrl.searchParams.set("error", "csrf_state_mismatch");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "") : request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // 1. Exchange code for Google tokens
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // 2. Fetch Google user profile
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    // 3. Link or Create account & create DB session + cookie
    const { user, isNewUser } = await handleGoogleUserAuth(googleUser, tokens);

    // 4. Determine redirect path
    let destination = savedFrom;
    if (!user.isOnboarded || isNewUser) {
      destination = "/onboarding";
    }

    return NextResponse.redirect(new URL(destination, request.url));
  } catch (err: any) {
    console.error("Google OAuth error:", err);
    loginUrl.searchParams.set("error", "google_auth_failed");
    return NextResponse.redirect(loginUrl);
  }
}
