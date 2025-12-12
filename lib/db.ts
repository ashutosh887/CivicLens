import { prisma } from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export function extractUserName(user: { firstName?: string | null; lastName?: string | null; username?: string | null }): string | null {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  return user.firstName || user.lastName || user.username || null;
}

export async function getAuthenticatedUser() {
  const user = await currentUser();
  if (!user) return null;
  
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;
  
  const name = extractUserName(user);
  const avatar = user.imageUrl || null;
  
  return { user, email, name, avatar };
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await Promise.race([
      prisma.user.count(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 5000)
      )
    ]);
    return true;
  } catch {
    return false;
  }
}

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
