import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/db";
import { checkOumiModelStatus } from "@/lib/oumi/service";

/**
 * API route to check Oumi model status
 */
export async function GET(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await checkOumiModelStatus();

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error("Oumi status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check Oumi status",
      },
      { status: 500 }
    );
  }
}
