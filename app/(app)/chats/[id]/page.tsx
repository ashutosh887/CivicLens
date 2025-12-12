import { ChatsSidebar } from "@/components/app/ChatsSidebar";
import { ChatView } from "@/components/app/ChatView";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser } from "@/lib/db";
import { notFound, redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
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
            Unable to connect to the database. Please check your DATABASE_URL environment variable.
          </p>
        </div>
      </div>
    );
  }

  let dbUser;
  try {
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.lastName || user.username || null;
    const avatar = user.imageUrl || null;
    
    dbUser = await getOrCreateUser(user.id, email, name, avatar);
  } catch (error) {
    console.error("Error getting or creating user:", error);
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

  const chat = await prisma.chat.findFirst({
    where: {
      id,
      userId: dbUser.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  }).catch(() => {
    return null;
  });

  if (!chat) {
    notFound();
  }

  const chats = await prisma.chat.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  }).catch(() => {
    return [];
  });

  const formattedChats = chats.map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updatedAt,
  }));

  const formattedMessages = chat.messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  return (
    <div className="flex h-full">
      <ChatsSidebar chats={formattedChats} />
      <div className="flex-1 flex flex-col">
        <ChatView chatId={id} initialMessages={formattedMessages} chatTitle={chat.title} />
      </div>
    </div>
  );
}

