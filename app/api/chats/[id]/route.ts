import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.lastName || user.username || null;
    const avatar = user.imageUrl || null;

    const dbUser = await getOrCreateUser(user.id, email, name, avatar);

    const { title } = await req.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    console.log("[SERVER DEBUG] DELETE request for chat ID:", id);
    
    const user = await currentUser();

    if (!user) {
      console.log("[SERVER DEBUG] Unauthorized - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.log("[SERVER DEBUG] No email found");
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.log("[SERVER DEBUG] Database connection failed");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.lastName || user.username || null;
    const avatar = user.imageUrl || null;

    const dbUser = await getOrCreateUser(user.id, email, name, avatar);
    console.log("[SERVER DEBUG] User ID:", dbUser.id);

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!chat) {
      console.log("[SERVER DEBUG] Chat not found for user");
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    console.log("[SERVER DEBUG] Deleting chat:", chat.id, chat.title);
    await prisma.chat.delete({
      where: { id },
    });

    console.log("[SERVER DEBUG] Chat deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SERVER DEBUG] Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
