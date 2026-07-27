import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_CONFIG } from "@/config/auth.config";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.SESSION_DURATION * 1000);
  
  // Store session in DB for absolute session revocation capabilities
  const sessionToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.SESSION_DURATION}s`)
    .sign(AUTH_CONFIG.JWT_SECRET);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt,
    },
  });

  return sessionToken;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_CONFIG.COOKIE_NAME, token, {
    ...AUTH_CONFIG.COOKIE_OPTIONS,
    maxAge: AUTH_CONFIG.SESSION_DURATION,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value;
  
  if (token) {
    try {
      await prisma.session.deleteMany({
        where: { sessionToken: token },
      });
    } catch (e) {
      // Ignore if session record was already deleted
    }
  }

  cookieStore.delete(AUTH_CONFIG.COOKIE_NAME);
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, AUTH_CONFIG.JWT_SECRET);
    const userId = payload.userId as string;
    if (!userId) return null;

    // Check DB session
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            preference: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    return null;
  }
}
