import { NextRequest, NextResponse } from "next/server";
import { advancedPLZDiscovery } from "@/lib/advanced-plz-service-discovery";

export const runtime = "edge";

// Advanced PLZ-based Service Discovery API
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const plz = url.searchParams.get("plz");
    const serviceType = url.searchParams.get("service_type");
    const userAge = url.searchParams.get("age");
    const familyStatus = url.searchParams.get("family_status") as
      | "single"
      | "family"
      | "senior"
      | undefined;
    const businessType = url.searchParams.get("business_type") as
      | "startup"
      | "sme"
      | "enterprise"
      | undefined;
    const urgency = url.searchParams.get("urgency") as
      | "low"
      | "medium"
      | "high"
      | "emergency"
      | undefined;
    const language = url.searchParams.get("language") as
      | "de"
      | "fr"
      | "en"
      | undefined;

    if (!plz) {
      return NextResponse.json(
        {
          success: false,
          error: "PLZ parameter is required",
          example:
            "/api/plz/advanced-discovery?plz=66111&service_type=buergeramt",
        },
        { status: 400 },
      );
    }

    const userContext = {
      age: userAge ? parseInt(userAge) : undefined,
      familyStatus,
      businessType,
      urgency,
      language: language || "de",
    };

    const discoveryResult = await advancedPLZDiscovery.discoverServices(
      plz,
      serviceType || undefined,
      userContext,
    );

    return NextResponse.json({
      success: true,
      data: discoveryResult,
      metadata: {
        plz_queried: plz,
        service_type: serviceType || "all",
        user_context: userContext,
        discovery_timestamp: new Date().toISOString(),
        api_version: "2.0",
        enhanced_features: [
          "AI-powered recommendations",
          "Real-time wait times",
          "Cross-border services",
          "Digital-first approach",
          "Personalized results",
          "Business intelligence",
          "Emergency services integration",
        ],
      },
      performance: {
        response_time_ms: Date.now(),
        cache_hit: false,
        data_freshness: "real-time",
      },
    });
  } catch (error) {
    console.error("Advanced PLZ Discovery error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Service discovery failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// POST endpoint for batch discovery or complex queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      plz_list,
      plz,
      service_requirements,
      user_profile,
      search_radius_km,
      priority_filters,
      include_cross_border,
    } = body;

    if (!plz && !plz_list) {
      return NextResponse.json(
        {
          success: false,
          error: "Either plz or plz_list is required",
        },
        { status: 400 },
      );
    }

    const results = [];

    // Handle single PLZ query
    if (plz) {
      const result = await advancedPLZDiscovery.discoverServices(
        plz,
        service_requirements?.service_type,
        user_profile,
      );
      results.push({ plz, result });
    }

    // Handle batch PLZ queries
    if (plz_list && Array.isArray(plz_list)) {
      for (const currentPLZ of plz_list.slice(0, 10)) {
        // Limit to 10 for performance
        try {
          const result = await advancedPLZDiscovery.discoverServices(
            currentPLZ,
            service_requirements?.service_type,
            user_profile,
          );
          results.push({ plz: currentPLZ, result });
        } catch (error) {
          results.push({
            plz: currentPLZ,
            error: error instanceof Error ? error.message : "Discovery failed",
          });
        }
      }
    }

    // Enhanced filtering and sorting
    const filteredResults = results.filter((r) => {
      if (r.error) return false;

      if (priority_filters?.min_services) {
        const serviceCount = r.result?.available_services?.length || 0;
        return serviceCount >= priority_filters.min_services;
      }

      return true;
    });

    // Sort results by relevance score
    filteredResults.sort((a, b) => {
      const scoreA = a.result?.business_intelligence?.success_probability || 0;
      const scoreB = b.result?.business_intelligence?.success_probability || 0;
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      data: {
        discovery_results: filteredResults,
        summary: {
          total_plz_searched: plz_list?.length || 1,
          successful_discoveries: filteredResults.length,
          failed_discoveries: results.length - filteredResults.length,
          best_match: filteredResults[0] || null,
          optimization_suggestions:
            generateOptimizationSuggestions(filteredResults),
        },
        filters_applied: priority_filters,
        user_profile: user_profile,
      },
      metadata: {
        search_type: "batch_discovery",
        processing_time_ms: Date.now(),
        api_version: "2.0",
        features_used: [
          "batch_processing",
          "relevance_scoring",
          "optimization_suggestions",
          "error_handling",
        ],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch PLZ Discovery error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Batch discovery failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

function generateOptimizationSuggestions(results: any[]) {
  if (results.length === 0) return [];

  const suggestions = [];

  // Analyze wait times
  const avgWaitTime =
    results.reduce((sum, r) => {
      const services = r.result?.available_services || [];
      const waitTimes = services.map((s: any) => s.estimated_wait_time || 0);
      return (
        sum +
        waitTimes.reduce((a: number, b: number) => a + b, 0) /
          Math.max(waitTimes.length, 1)
      );
    }, 0) / Math.max(results.length, 1);

  if (avgWaitTime > 30) {
    suggestions.push({
      type: "timing_optimization",
      message:
        "Consider using digital services or off-peak hours to reduce wait times",
      potential_savings: `${Math.round(avgWaitTime * 0.6)} minutes average`,
    });
  }

  // Digital services recommendation
  const digitalAvailable = results.some((r) =>
    r.result?.available_services?.some(
      (s: any) => s.digital_services_available,
    ),
  );

  if (digitalAvailable) {
    suggestions.push({
      type: "digital_first",
      message: "Many services are available online for faster processing",
      benefits: ["No waiting time", "Available 24/7", "Immediate confirmation"],
    });
  }

  // Cross-border opportunities
  const crossBorderAvailable = results.some(
    (r) => r.result?.cross_border_options?.available,
  );

  if (crossBorderAvailable) {
    suggestions.push({
      type: "cross_border_efficiency",
      message: "Consider cross-border services for specialized requirements",
      advantages: [
        "Specialized expertise",
        "Different processing times",
        "Alternative solutions",
      ],
    });
  }

  return suggestions;
}
