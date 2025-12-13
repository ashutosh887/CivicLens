import { NextResponse } from "next/server";
import { classifyQuery } from "@/lib/ai/service";
import { getAuthenticatedUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const category = await classifyQuery(query);

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Failed to classify query" },
      { status: 500 }
    );
  }
}

