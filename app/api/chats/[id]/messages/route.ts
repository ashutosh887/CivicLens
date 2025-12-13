import { prisma } from "@/lib/prisma";
import { checkDatabaseConnection, getOrCreateUser, getAuthenticatedUser } from "@/lib/db";
import { NextResponse } from "next/server";
import { getChatStream } from "@/lib/ai/service";
import { generateChatTitle } from "@/lib/ai/title";
import { CHAT_CONFIG } from "@/config/chat";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const chat = await prisma.chat.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: CHAT_CONFIG.messageHistoryLimit,
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const { content, stream, fileIds } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const userMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content,
      },
    });

    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      await prisma.file.updateMany({
        where: {
          id: { in: fileIds },
          userId: dbUser.id,
        },
        data: {
          messageId: userMessage.id,
        },
      });
    }

    if (chat.title === CHAT_CONFIG.defaultChatTitle) {
      const title = generateChatTitle(content);
      await prisma.chat.update({
        where: { id: chat.id },
        data: { title },
      });
    }

    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    const conversationHistory = chat.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          let fullContent = "";

          try {
            const assistantMessage = await prisma.message.create({
              data: {
                chatId: chat.id,
                role: "assistant",
                content: "",
              },
            });

            for await (const chunk of getChatStream(content, conversationHistory)) {
              fullContent += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk, messageId: assistantMessage.id })}\n\n`)
              );
            }

            await prisma.message.update({
              where: { id: assistantMessage.id },
              data: { content: fullContent },
            });

            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    let fullContent = "";
    for await (const chunk of getChatStream(content, conversationHistory)) {
      fullContent += chunk;
    }

    const assistantMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: fullContent,
      },
    });

    return NextResponse.json({
      userMessage,
      assistantMessage: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
