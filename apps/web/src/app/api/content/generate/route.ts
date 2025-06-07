import { NextRequest, NextResponse } from "next/server";
import AIContentManager from "@/lib/cms/ai-content-manager";

export const runtime = "edge";

// AI-powered content generation API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      type,
      target_audience,
      language = "de",
      keywords = [],
      tone = "professional",
      length = "medium",
    } = body;

    if (!topic || !type || !target_audience) {
      return NextResponse.json(
        {
          success: false,
          error: "Topic, type, and target_audience are required",
        },
        { status: 400 },
      );
    }

    const contentManager = new AIContentManager();
    const generatedContent = await contentManager.generateContent({
      topic,
      type,
      target_audience,
      language,
      keywords,
      tone,
      length,
    });

    return NextResponse.json({
      success: true,
      data: generatedContent,
      message: "Content generated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content generation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Content generation failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Get content analytics and insights
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe =
      (url.searchParams.get("timeframe") as "7d" | "30d" | "90d") || "30d";
    const action = url.searchParams.get("action");

    const contentManager = new AIContentManager();

    if (action === "analytics") {
      const analytics = await contentManager.getContentAnalytics(timeframe);

      return NextResponse.json({
        success: true,
        data: analytics,
        timeframe,
        timestamp: new Date().toISOString(),
      });
    }

    // Default: return content summary
    return NextResponse.json({
      success: true,
      data: {
        available_actions: ["analytics"],
        supported_content_types: [
          "article",
          "service",
          "announcement",
          "faq",
          "guide",
        ],
        supported_languages: ["de", "fr", "en"],
        supported_tones: ["formal", "casual", "professional", "friendly"],
        supported_lengths: ["short", "medium", "long"],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content API failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Content API failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
