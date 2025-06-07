import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "edge";

// Enhanced user analytics batch data endpoint
export async function POST(request: NextRequest) {
  try {
    const {
      session_id,
      user_id,
      heatmap_data,
      scroll_data,
      click_data,
      performance_data,
      timestamp,
    } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const supabase = supabaseServer;
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 },
      );
    }

    // Store batch analytics data
    const { error: batchError } = await supabase
      .from("user_analytics_batch")
      .insert({
        session_id,
        user_id: user_id || null,
        heatmap_data: heatmap_data || null,
        scroll_data: scroll_data || null,
        click_data: click_data || null,
        performance_data: performance_data || null,
        batch_timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (batchError) {
      console.error("Batch analytics insert error:", batchError);
      // Don't fail completely for analytics errors
    }

    // Update session statistics if we have meaningful data
    if (heatmap_data || scroll_data || click_data) {
      const { error: sessionError } = await supabase
        .from("user_sessions")
        .update({
          interaction_count: supabase.sql`interaction_count + ${(heatmap_data?.length || 0) + (click_data?.length || 0)}`,
          scroll_depth:
            scroll_data?.length > 0
              ? Math.max(...scroll_data.map((s: any) => s.depth))
              : null,
          last_activity_at: new Date().toISOString(),
        })
        .eq("session_id", session_id);

      if (sessionError) {
        console.error("Session update error:", sessionError);
      }
    }

    // Extract business insights from the data
    const insights = extractBusinessInsights({
      heatmap_data,
      scroll_data,
      click_data,
      performance_data,
    });

    return NextResponse.json({
      success: true,
      insights,
      data_points_received: {
        heatmap: heatmap_data?.length || 0,
        scroll: scroll_data?.length || 0,
        clicks: click_data?.length || 0,
        performance: performance_data
          ? Object.keys(performance_data).length
          : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process batch analytics data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

function extractBusinessInsights(data: any) {
  const insights: any = {};

  // Analyze scroll behavior
  if (data.scroll_data && data.scroll_data.length > 0) {
    const maxScroll = Math.max(...data.scroll_data.map((s: any) => s.depth));
    insights.engagement_level =
      maxScroll > 75 ? "high" : maxScroll > 25 ? "medium" : "low";
    insights.content_completion = `${maxScroll}%`;
  }

  // Analyze click patterns
  if (data.click_data && data.click_data.length > 0) {
    const clickedElements = data.click_data.map((c: any) => c.element);
    insights.interaction_hotspots = clickedElements.length;

    // Identify service interest
    const serviceClicks = clickedElements.filter(
      (el: string) =>
        el.includes("service") ||
        el.includes("behoerden") ||
        el.includes("ai-chat"),
    );
    insights.service_interest_score =
      serviceClicks.length / clickedElements.length;
  }

  // Analyze performance impact
  if (data.performance_data) {
    const { fcp, lcp, cls } = data.performance_data;
    insights.performance_score = {
      fcp: fcp
        ? fcp < 1800
          ? "good"
          : fcp < 3000
            ? "needs_improvement"
            : "poor"
        : null,
      lcp: lcp
        ? lcp < 2500
          ? "good"
          : lcp < 4000
            ? "needs_improvement"
            : "poor"
        : null,
      cls: cls
        ? cls < 0.1
          ? "good"
          : cls < 0.25
            ? "needs_improvement"
            : "poor"
        : null,
    };
  }

  // Heatmap analysis
  if (data.heatmap_data && data.heatmap_data.length > 0) {
    const viewportHeight = 800; // Assume standard viewport
    const topAreaClicks = data.heatmap_data.filter(
      (h: any) => h.y < viewportHeight * 0.3,
    ).length;
    insights.above_fold_engagement = topAreaClicks / data.heatmap_data.length;
  }

  return insights;
}
