import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Real-time Revenue Analytics & MRR Tracking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "30d";
    const includeProjections = searchParams.get("projections") === "true";

    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 },
      );
    }

    // Calculate current MRR
    const { data: activeSubscriptions } = await supabaseServer
      .from("premium_subscriptions")
      .select(
        `
        *,
        user_profiles(municipality, region)
      `,
      )
      .eq("status", "active");

    const currentMRR =
      activeSubscriptions?.reduce((total, sub) => {
        const monthlyAmount =
          sub.plan_type === "saar-id-premium"
            ? 10
            : sub.plan_type === "business-id-premium"
              ? 25
              : sub.plan_type === "grenzpendler-premium"
                ? 15
                : 0;
        return total + monthlyAmount;
      }, 0) || 0;

    // Get revenue trends
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: revenueHistory } = await supabaseServer.rpc(
      "get_daily_revenue",
      {
        start_date: thirtyDaysAgo.toISOString(),
        end_date: new Date().toISOString(),
      },
    );

    // User acquisition metrics
    const { data: userGrowth } = await supabaseServer.rpc(
      "get_user_growth_metrics",
      {
        days: 30,
      },
    );

    // Conversion funnel
    const { data: conversionMetrics } = await supabaseServer.rpc(
      "get_conversion_funnel",
    );

    // Regional breakdown
    const regionalData =
      activeSubscriptions?.reduce((acc, sub) => {
        const region = sub.user_profiles?.municipality || "Unknown";
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {}) || {};

    // Plan distribution
    const planDistribution =
      activeSubscriptions?.reduce((acc, sub) => {
        acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
        return acc;
      }, {}) || {};

    // Calculate projections
    let projections = {};
    if (includeProjections) {
      const growthRate = calculateGrowthRate(userGrowth);
      projections = {
        mrr3Months: currentMRR * Math.pow(1 + growthRate, 3),
        mrr6Months: currentMRR * Math.pow(1 + growthRate, 6),
        mrr12Months: currentMRR * Math.pow(1 + growthRate, 12),
        targetDate25k: calculateTargetDate(currentMRR, 25000, growthRate),
      };
    }

    // Key metrics
    const metrics = {
      currentMRR,
      totalUsers: activeSubscriptions?.length || 0,
      churnRate: await calculateChurnRate(),
      averageRevenuePerUser: currentMRR / (activeSubscriptions?.length || 1),
      lifetimeValue: await calculateLTV(),
      conversionRate: conversionMetrics?.overall_conversion || 0,

      // Goal tracking
      goalProgress: {
        target25k: (currentMRR / 25000) * 100,
        target50kUsers: ((activeSubscriptions?.length || 0) / 50000) * 100,
        currentQuarter: getCurrentQuarterProgress(currentMRR),
      },

      // Real-time indicators
      realTimeStats: {
        revenueToday: await getTodayRevenue(),
        newUsersToday: await getTodayNewUsers(),
        upgradesThisWeek: await getWeeklyUpgrades(),
        churnThisMonth: await getMonthlyChurn(),
      },
    };

    return NextResponse.json({
      success: true,
      metrics,
      revenueHistory: revenueHistory || [],
      userGrowth: userGrowth || [],
      regionalData,
      planDistribution,
      projections,
      lastUpdated: new Date().toISOString(),
      dataFreshness: "real-time",
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Revenue Analytics" },
      { status: 500 },
    );
  }
}

// POST endpoint for tracking revenue events
export async function POST(request: NextRequest) {
  try {
    const { eventType, amount, userId, planType, metadata } =
      await request.json();

    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 },
      );
    }

    const revenueEvent = await supabaseServer
      .from("revenue_events")
      .insert({
        event_type: eventType,
        amount,
        user_id: userId,
        plan_type: planType,
        metadata,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    // Update real-time metrics
    await updateRealtimeMetrics(eventType, amount);

    return NextResponse.json({
      success: true,
      eventId: revenueEvent.data?.id,
      message: "Revenue event tracked",
    });
  } catch (error) {
    console.error("Revenue event tracking error:", error);
    return NextResponse.json(
      { error: "Fehler beim Tracking des Revenue Events" },
      { status: 500 },
    );
  }
}

// Helper functions
async function calculateChurnRate() {
  if (!supabaseServer) return 0;
  const { data } = await supabaseServer.rpc("calculate_monthly_churn_rate");

  return data || 0;
}

async function calculateLTV() {
  if (!supabaseServer) return 0;
  const { data } = await supabaseServer.rpc("calculate_customer_ltv");

  return data || 0;
}

async function getTodayRevenue() {
  if (!supabaseServer) return 0;
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabaseServer
    .from("revenue_events")
    .select("amount")
    .gte("timestamp", today)
    .eq("event_type", "subscription_payment");

  return data?.reduce((sum, event) => sum + event.amount, 0) || 0;
}

async function getTodayNewUsers() {
  if (!supabaseServer) return 0;
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabaseServer
    .from("premium_subscriptions")
    .select("*", { count: "exact" })
    .gte("created_at", today);

  return count || 0;
}

async function getWeeklyUpgrades() {
  if (!supabaseServer) return 0;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const { count } = await supabaseServer
    .from("subscription_changes")
    .select("*", { count: "exact" })
    .eq("change_type", "upgrade")
    .gte("created_at", weekAgo.toISOString());

  return count || 0;
}

async function getMonthlyChurn() {
  if (!supabaseServer) return 0;
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const { count } = await supabaseServer
    .from("premium_subscriptions")
    .select("*", { count: "exact" })
    .eq("status", "cancelled")
    .gte("cancelled_at", monthAgo.toISOString());

  return count || 0;
}

function calculateGrowthRate(userGrowth: any[]) {
  if (!userGrowth || userGrowth.length < 2) return 0.05; // Default 5% monthly growth

  const recent = userGrowth.slice(-7); // Last 7 days
  const totalGrowth = recent.reduce(
    (sum, day) => sum + (day.new_users || 0),
    0,
  );
  const avgDailyGrowth = totalGrowth / 7;
  const monthlyGrowth = avgDailyGrowth * 30;

  return Math.min(monthlyGrowth / 1000, 0.3); // Cap at 30% monthly growth
}

function calculateTargetDate(
  currentMRR: number,
  targetMRR: number,
  growthRate: number,
) {
  if (currentMRR >= targetMRR) return new Date().toISOString();

  const monthsToTarget =
    Math.log(targetMRR / currentMRR) / Math.log(1 + growthRate);
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsToTarget);

  return targetDate.toISOString();
}

function getCurrentQuarterProgress(currentMRR: number) {
  const quarterTarget = 25000; // Q3 2025 target
  return Math.min((currentMRR / quarterTarget) * 100, 100);
}

async function updateRealtimeMetrics(eventType: string, amount: number) {
  // Update cached metrics for real-time dashboard
  if (supabaseServer) {
    await supabaseServer.from("realtime_metrics").upsert({
      metric_type: "revenue",
      value: amount,
      event_type: eventType,
      updated_at: new Date().toISOString(),
    });
  }
}
