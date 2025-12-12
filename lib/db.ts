import { prisma } from "./prisma";

/**
 * Check if database connection is healthy
 * @returns true if connection is healthy, false otherwise
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.user.count(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 5000)
      )
    ]);
    return true;
  } catch (error: any) {
    const isConnectionError = 
      error?.name === "PrismaClientInitializationError" ||
      error?.constructor?.name === "PrismaClientInitializationError" ||
      error?.message?.includes("connection") ||
      error?.message?.includes("DNS") ||
      error?.message?.includes("ECONNREFUSED") ||
      error?.message?.includes("no record found") ||
      error?.message?.includes("Error creating a database connection") ||
      error?.code === "ECONNREFUSED" ||
      error?.code === "ENOTFOUND";
    
    return false;
  }
}

/**
 * Get or create user with proper error handling and upsert logic
 * Uses upsert to avoid race conditions
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  name?: string | null,
  avatar?: string | null
) {
  const config = await import("@/config");
  const isAdmin = config.default.adminEmails.includes(email);
  const role = isAdmin ? "admin" : "user";

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name: name || undefined,
      avatar: avatar || undefined,
      role,
      updatedAt: new Date(),
    },
    create: {
      clerkId,
      email,
      name: name || undefined,
      avatar: avatar || undefined,
      role,
    },
  });

  return user;
}
