import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser, getAuthenticatedUser } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, email, name, avatar } = authData;

    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const dbUser = await getOrCreateUser(user.id, email, name, avatar);

    const chat = await prisma.chat.create({
      data: {
        userId: dbUser.id,
        title: "New Chat",
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

