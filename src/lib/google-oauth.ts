import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

export function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const isConfigured = Boolean(clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== "");
  
  return {
    clientId: clientId || "",
    clientSecret: clientSecret || "",
    isConfigured,
  };
}

export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = getGoogleConfig();
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getGoogleConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error_description || errorData.error || "Failed to exchange authorization code");
  }

  return response.json();
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return response.json();
}

export async function handleGoogleUserAuth(googleUser: GoogleUserInfo, tokens: GoogleTokens) {
  // Check if account already exists for provider Google
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: googleUser.id,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingAccount) {
    // Update access token & user image if available
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: {
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        refresh_token: tokens.refresh_token || existingAccount.refresh_token,
      },
    });

    if (googleUser.picture && !existingAccount.user.image) {
      await prisma.user.update({
        where: { id: existingAccount.user.id },
        data: { image: googleUser.picture },
      });
    }

    const sessionToken = await createSession(existingAccount.user.id);
    await setSessionCookie(sessionToken);

    return { user: existingAccount.user, isNewUser: false };
  }

  // Check if user exists by email
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: googleUser.email.toLowerCase() },
  });

  if (existingUserByEmail) {
    // Link Google account to existing user
    await prisma.account.create({
      data: {
        userId: existingUserByEmail.id,
        type: "oauth",
        provider: "google",
        providerAccountId: googleUser.id,
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        scope: tokens.scope,
        token_type: tokens.token_type,
      },
    });

    if (googleUser.picture && !existingUserByEmail.image) {
      await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: { image: googleUser.picture },
      });
    }

    const sessionToken = await createSession(existingUserByEmail.id);
    await setSessionCookie(sessionToken);

    return { user: existingUserByEmail, isNewUser: false };
  }

  const fallbackName = googleUser.email ? (googleUser.email.split("@")[0] || "User") : "User";
  const displayName = googleUser.name || fallbackName;

  // Create new user & account
  const newUser = await prisma.user.create({
    data: {
      email: googleUser.email.toLowerCase(),
      name: displayName,
      passwordHash: "OAUTH_EXTERNAL_USER",
      image: googleUser.picture || null,
      accounts: {
        create: {
          type: "oauth",
          provider: "google",
          providerAccountId: googleUser.id,
          access_token: tokens.access_token,
          id_token: tokens.id_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
          scope: tokens.scope,
          token_type: tokens.token_type,
        },
      },
    },
  });

  const sessionToken = await createSession(newUser.id);
  await setSessionCookie(sessionToken);

  return { user: newUser, isNewUser: true };
}
