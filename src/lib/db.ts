import { PrismaClient } from "@prisma/client";

/**
 * Prisma-Client als Singleton. Im Entwicklungsmodus wird der Client am
 * globalen Objekt zwischengespeichert, damit Hot-Reloading nicht bei
 * jedem Neuladen eine neue Verbindung oeffnet.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
