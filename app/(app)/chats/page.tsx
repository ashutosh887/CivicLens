import { ChatsSidebar } from "@/components/app/ChatsSidebar";
import { ChatEmptyState } from "@/components/app/ChatEmptyState";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ChatsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/");
  }

  let dbConnected = false;
  try {
    dbConnected = await checkDatabaseConnection();
  } catch (error: any) {
    console.error("Database connection check threw error:", error?.name || error?.message);
    dbConnected = false;
  }

  if (!dbConnected) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 p-8 max-w-md">
          <h2 className="text-2xl font-semibold">Database Connection Error</h2>
          <p className="text-muted-foreground">
            Unable to connect to the database. Please check your DATABASE_URL environment variable.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-medium mb-2">Common issues:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Invalid MongoDB connection string format</li>
              <li>Incorrect cluster hostname or credentials</li>
              <li>Network/firewall blocking connection</li>
              <li>Database cluster is paused or deleted</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Expected format: mongodb+srv://username:password@cluster.mongodb.net/database
          </p>
        </div>
      </div>
    );
  }

  let dbUser;
  let dbError = false;
  let errorMessage = "";
  try {
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.lastName || user.username || null;
    const avatar = user.imageUrl || null;

    dbUser = await getOrCreateUser(user.id, email, name, avatar);
  } catch (error: any) {
    console.error("Error getting or creating user:", error);
    dbError = true;
    errorMessage = error?.message || "Unknown database error";
  }

  if (dbError || !dbUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Database Error</h2>
          <p className="text-muted-foreground">
            Unable to get or create user in the database.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {errorMessage || "Failed to access user data"}
          </p>
        </div>
      </div>
    );
  }

  const chats = await prisma.chat.findMany({
    where: { 
      userId: dbUser.id 
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  }).catch(() => {
    return [];
  });

  const formattedChats = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    updatedAt: chat.updatedAt,
  }));

  return (
    <div className="flex h-full">
      <ChatsSidebar chats={formattedChats} />
      <div className="flex-1">
        <ChatEmptyState />
      </div>
    </div>
  );
}