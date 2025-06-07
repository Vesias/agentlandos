import { NextRequest, NextResponse } from "next/server";
import AdvancedSecurityScanner from "@/lib/security/security-scanner";

export const runtime = "edge";

// Security scanning middleware and reporting API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, url, method, headers, requestBody, ip } = body;

    if (action === "scan") {
      // Perform security scan
      const result = await AdvancedSecurityScanner.scanRequest(
        url,
        method,
        headers || {},
        requestBody,
        ip || request.headers.get("x-forwarded-for") || "unknown",
      );

      return NextResponse.json({
        success: true,
        data: {
          safe: result.safe,
          threatsDetected: result.threats.length,
          blocked: result.blocked,
          threats: result.threats.map((threat) => ({
            type: threat.type,
            severity: threat.severity,
            source: threat.source,
            blocked: threat.blocked,
            timestamp: threat.timestamp,
          })),
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "block-ip") {
      const { targetIP, reason, duration } = body;

      if (!targetIP || !reason) {
        return NextResponse.json(
          { error: "targetIP and reason are required" },
          { status: 400 },
        );
      }

      await AdvancedSecurityScanner.blockIP(targetIP, reason, duration);

      return NextResponse.json({
        success: true,
        message: `IP ${targetIP} has been blocked`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Security scan API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Security scan failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const timeRange =
      (url.searchParams.get("timeRange") as "24h" | "7d" | "30d") || "24h";
    const ip = url.searchParams.get("ip");

    switch (action) {
      case "report":
        const report =
          await AdvancedSecurityScanner.getSecurityReport(timeRange);
        return NextResponse.json({
          success: true,
          data: report,
          meta: {
            timeRange,
            generatedAt: new Date().toISOString(),
          },
        });

      case "check-ip":
        if (!ip) {
          return NextResponse.json(
            { error: "IP parameter required" },
            { status: 400 },
          );
        }

        const isBlocked = await AdvancedSecurityScanner.isIPBlocked(ip);
        return NextResponse.json({
          success: true,
          data: {
            ip,
            blocked: isBlocked,
            checkedAt: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json({
          success: true,
          service: "Advanced Security Scanner",
          version: "2.0.0",
          features: [
            "SQL Injection Detection",
            "XSS Protection",
            "Rate Limiting",
            "Suspicious Activity Monitoring",
            "Real-time Threat Blocking",
            "Security Reporting",
          ],
          actions: ["scan", "report", "check-ip", "block-ip"],
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("Security API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Security service temporarily unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
