import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || "";

  // If using PostgreSQL (Neon / Supabase / Vercel Postgres)
  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    return new PrismaClient();
  }

  // Otherwise fallback for local SQLite
  try {
    const dbPath = path.resolve(process.cwd(), "dev.db");
    const adapter = new PrismaLibSql({
      url: `file:${dbPath}`,
    });
    return new PrismaClient({ adapter });
  } catch {
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
