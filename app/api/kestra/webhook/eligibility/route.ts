import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/db";
import axios from "axios";

/**
 * API route to trigger Kestra eligibility extraction workflow via webhook
 * This route acts as a secure proxy between your Next.js app and Kestra
 */
export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pdf_url, scheme_name, country } = await req.json();

    if (!pdf_url || !scheme_name) {
      return NextResponse.json(
        { error: "pdf_url and scheme_name are required" },
        { status: 400 }
      );
    }

    const kestraUrl = process.env.KESTRA_URL || "http://localhost:8080";

    const namespace = "civiclens";
    const workflowId = "eligibility-rule-extractor";
    const webhookKey = "eligibility-extractor-key";

    // Construct webhook URL
    const webhookUrl = `${kestraUrl}/api/v1/executions/webhook/${namespace}/${workflowId}/${webhookKey}`;

    // Send POST request to Kestra webhook
    const kestraResponse = await axios.post(
      webhookUrl,
      {
        pdf_url,
        scheme_name,
        country: country || "Unknown",
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // The webhook is configured to return the output URI
    const outputUri = kestraResponse.data.value;
    const executionId = kestraResponse.data.id;

    // If we have an output URI, we might need to fetch it
    // For now, return the execution details
    // In production, you might want to fetch the actual data from the URI
    return NextResponse.json({
      success: true,
      executionId,
      outputUri,
      message: "Eligibility extraction workflow triggered successfully",
    });
  } catch (error: any) {
    console.error("Kestra webhook error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to trigger eligibility extraction workflow",
      },
      { status: error.response?.status || 500 }
    );
  }
}
