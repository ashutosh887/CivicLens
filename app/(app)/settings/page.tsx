import { ChatsSidebar } from "@/components/app/ChatsSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/");
  }

  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Database Connection Error</h2>
          <p className="text-muted-foreground">
            Unable to connect to the database.
          </p>
        </div>
      </div>
    );
  }

  const name = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`.trim()
    : user.firstName || user.lastName || user.username || null;
  const avatar = user.imageUrl || null;

  const dbUser = await getOrCreateUser(user.id, email, name, avatar).catch(() => null);

  if (!dbUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Database Error</h2>
          <p className="text-muted-foreground">
            Unable to get or create user in the database.
          </p>
        </div>
      </div>
    );
  }

  const chats = await prisma.chat.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  }).catch(() => []);

  const formattedChats = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    updatedAt: chat.updatedAt,
  }));

  return (
    <div className="flex h-full">
      <ChatsSidebar chats={formattedChats} />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">Settings</h1>
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm mt-1">{user.fullName || user.firstName || user.username || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">{email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}