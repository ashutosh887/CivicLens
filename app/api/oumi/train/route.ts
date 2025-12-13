import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/db";
import { OUMI_CONFIG } from "@/config/oumi";

/**
 * API route to trigger Oumi model training
 * 
 * Note: This endpoint provides instructions for training.
 * Actual training should be done via command line or a separate service
 * as it requires Python environment and can take 30-60 minutes.
 * 
 * For production, consider using a job queue (Bull, BullMQ) or
 * a separate training service.
 */
export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { configPath } = await req.json().catch(() => ({}));
    const configFile = configPath || OUMI_CONFIG.configPath;

    // Validate config file exists
    const fs = await import("fs/promises");
    try {
      await fs.access(configFile);
    } catch {
      return NextResponse.json(
        { error: `Config file not found: ${configFile}` },
        { status: 404 }
      );
    }

    // Return training instructions
    // In production, you would trigger a background job here
    return NextResponse.json({
      success: true,
      message: "Training instructions",
      configFile,
      command: `${OUMI_CONFIG.training.command} train -c ${configFile}`,
      instructions: [
        "1. Install Oumi: pip install oumi[gpu]",
        "2. Run training command (see 'command' field above)",
        "3. Training takes 30-60 minutes",
        "4. Model will be saved to: ./models/civiclens-finetuned",
        "5. Start model server: oumi serve --model ./models/civiclens-finetuned --port 8000",
        "6. Set OUMI_MODEL_URL=http://localhost:8000 in .env.local",
      ],
      note: "For production, use a job queue or separate training service. This endpoint provides instructions only.",
    });
  } catch (error: any) {
    console.error("Oumi training trigger error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get training instructions",
      },
      { status: 500 }
    );
  }
}
