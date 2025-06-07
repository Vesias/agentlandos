import { NextRequest, NextResponse } from "next/server";
import AIContentManager from "@/lib/cms/ai-content-manager";

export const runtime = "edge";

// Content management API - update, publish, analyze
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        {
          success: false,
          error: "Content ID and updates are required",
        },
        { status: 400 },
      );
    }

    const contentManager = new AIContentManager();
    await contentManager.updateContent(id, updates);

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Content update failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Content update failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Publish content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, scheduled_date } = body;

    if (!id || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Content ID and action are required",
        },
        { status: 400 },
      );
    }

    const contentManager = new AIContentManager();

    switch (action) {
      case "publish":
        await contentManager.publishContent(id, scheduled_date);
        return NextResponse.json({
          success: true,
          message: scheduled_date
            ? "Content scheduled for publishing"
            : "Content published successfully",
          id,
          scheduled_date,
          timestamp: new Date().toISOString(),
        });

      case "analyze":
        const content = await contentManager.analyzeSEO({
          id,
          type: "article",
          title: body.title || "",
          content: body.content || "",
          summary: body.summary || "",
          keywords: body.keywords || [],
          category: "",
          author: "",
          status: "draft",
          language: "de",
          seo_score: 0,
          engagement_metrics: {
            views: 0,
            shares: 0,
            time_on_page: 0,
            bounce_rate: 0,
          },
          ai_insights: {
            sentiment: "neutral",
            readability_score: 0,
            target_audience: [],
            suggested_improvements: [],
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          data: content,
          message: "SEO analysis completed",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action. Supported actions: publish, analyze",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Content management failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Content management failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
