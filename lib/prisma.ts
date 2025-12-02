import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
    errorFormat: "pretty",
  });

// Graceful shutdown
if (typeof global !== "undefined") {
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
