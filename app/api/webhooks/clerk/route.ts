import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import config from "@/config";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to your .env file");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const data = evt.data as {
      id: string;
      email_addresses?: Array<{ email_address: string }>;
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
      username?: string | null;
    };

    const email = data.email_addresses?.[0]?.email_address;
    
    if (!email) {
      return new Response("Email not found", { status: 400 });
    }

    const isAdmin = config.adminEmails.includes(email);
    const role = isAdmin ? "admin" : "user";
    
    const name = data.first_name && data.last_name 
      ? `${data.first_name} ${data.last_name}`.trim()
      : data.first_name || data.last_name || data.username || null;

    try {
      await prisma.user.upsert({
        where: { clerkId: data.id },
        update: {
          email,
          name,
          avatar: data.image_url || null,
          role,
          updatedAt: new Date(),
        },
        create: {
          clerkId: data.id,
          email,
          name,
          avatar: data.image_url || null,
          role,
        },
      });

      return new Response("User synced", { status: 200 });
    } catch (error) {
      return new Response("Error syncing user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const data = evt.data as { id: string };
    
    try {
      await prisma.user.delete({
        where: { clerkId: data.id },
      });

      return new Response("User deleted", { status: 200 });
    } catch (error) {
      return new Response("Error deleting user", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}

