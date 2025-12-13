import { NextResponse } from "next/server";
import { extractEntities } from "@/lib/ai/service";
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

    const extraction = await extractEntities(query);

    return NextResponse.json(extraction);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract entities" },
      { status: 500 }
    );
  }
}

